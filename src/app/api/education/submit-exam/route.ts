import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { gradeEssayAnswer, gradeMultipleChoice } from '@/lib/ai-grading';
import { stripAnswerFromQuestion, formatExamText } from '@/lib/exam-utils';
import { requireUser } from '@/lib/user-auth';

interface SubmitAnswerInput {
    questionId: string;
    answer: string | number;
}

interface SubmitExamRequest {
    examId: string;
    userName?: string;
    answers: SubmitAnswerInput[];
    startedAt: string;
}

export async function POST(request: NextRequest) {
    // ต้องล็อกอินอยู่จริง — route นี้เรียก AI ตรวจข้อเขียน 1 ครั้งต่อ 1 ข้อ ต่อ 1 request
    // เดิมเปิดให้คนนิรนามยิงได้ = ค่า Gemini บานปลายแบบไม่มีเพดาน
    const uid = await requireUser(request);
    if (!uid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body: SubmitExamRequest = await request.json();
        const { examId, userName, answers, startedAt } = body;

        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();

        // Get exam from Firestore
        const examDoc = await db.collection('examSets').doc(examId).get();
        if (!examDoc.exists) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }
        const examData = examDoc.data()!;

        // Get questions from subcollection
        const qSnap = await examDoc.ref.collection('questions')
            .orderBy('orderIndex', 'asc')
            .get();

        if (qSnap.empty) {
            return NextResponse.json({ error: 'No questions found' }, { status: 404 });
        }

        // Map questions with proper type handling
        const questions = qSnap.docs.map((qDoc, idx) => {
            const q = qDoc.data();
            const rawType = q.type === 'multiple_choice' || q.type === 'MULTIPLE_CHOICE';
            let options: string[] | undefined;
            let correctOptionIndex: number | undefined;
            let hasRealChoices = false;

            if (rawType && Array.isArray(q.choices) && q.choices.length > 0) {
                options = q.choices.map((c: any) => typeof c === 'string' ? c : c.text || c);
                hasRealChoices = true;
                if (q.correctAnswer) {
                    const match = q.correctAnswer.match(/\((\d+)\)/);
                    if (match) correctOptionIndex = parseInt(match[1]) - 1;
                }
            }

            const finalType = (rawType && hasRealChoices) ? 'MULTIPLE_CHOICE' : 'ESSAY';
            const { question: cleanText } = stripAnswerFromQuestion(q.questionText || '');

            return {
                id: qDoc.id,
                text: formatExamText(cleanText),
                type: finalType,
                options,
                correctOptionIndex,
                correctAnswerText: q.modelAnswer || '',
                explanation: q.explanation || '',
                subject: q.tags?.[0] || '',
            };
        });

        // Grade each answer. Multiple-choice grading is synchronous (no AI call), so
        // only essay questions are graded concurrently — sequentially, 5 essays at
        // ~4s each was ~20s; grading them in groups instead of one-at-a-time cuts
        // that roughly by the group size. See LAWSLANE-PLAN-01 2.6.
        const ESSAY_CONCURRENCY = 4;
        const gradedAnswers: any[] = new Array(questions.length);
        const essayJobs: { index: number; question: typeof questions[number]; submittedAnswer: SubmitAnswerInput }[] = [];

        questions.forEach((question, index) => {
            const submittedAnswer = answers.find(a => a.questionId === question.id);

            if (!submittedAnswer) {
                gradedAnswers[index] = {
                    questionId: question.id,
                    questionText: question.text,
                    questionType: question.type,
                    studentAnswer: '',
                    isCorrect: false,
                    aiScore: 0,
                    aiFeedback: 'ไม่ได้ตอบคำถามนี้'
                };
                return;
            }

            if (question.type === 'MULTIPLE_CHOICE') {
                const result = gradeMultipleChoice(
                    submittedAnswer.answer as number,
                    question.correctOptionIndex || 0,
                    question.explanation
                );
                const questionScore = result.isCorrect ? 100 : 0;

                gradedAnswers[index] = {
                    questionId: question.id,
                    questionText: question.text,
                    questionType: 'MULTIPLE_CHOICE',
                    studentAnswer: submittedAnswer.answer,
                    correctAnswer: question.correctOptionIndex,
                    isCorrect: result.isCorrect,
                    aiScore: questionScore,
                    aiFeedback: result.isCorrect
                        ? 'ถูกต้อง! ' + (question.explanation || '')
                        : 'ไม่ถูกต้อง คำตอบที่ถูกคือ: ' + (question.options?.[question.correctOptionIndex || 0] || '') + '. ' + (question.explanation || '')
                };
            } else {
                essayJobs.push({ index, question, submittedAnswer });
            }
        });

        for (let i = 0; i < essayJobs.length; i += ESSAY_CONCURRENCY) {
            const group = essayJobs.slice(i, i + ESSAY_CONCURRENCY);
            await Promise.all(group.map(async ({ index, question, submittedAnswer }) => {
                try {
                    const aiResult = await gradeEssayAnswer({
                        questionText: question.text,
                        modelAnswer: question.correctAnswerText || '',
                        studentAnswer: submittedAnswer.answer as string,
                        subject: question.subject
                    });
                    gradedAnswers[index] = {
                        questionId: question.id,
                        questionText: question.text,
                        questionType: 'ESSAY',
                        studentAnswer: submittedAnswer.answer,
                        correctAnswer: question.correctAnswerText,
                        aiScore: aiResult.score,
                        aiFeedback: aiResult.feedback,
                        aiStrengths: aiResult.strengths,
                        aiWeaknesses: aiResult.weaknesses,
                        aiSuggestions: aiResult.suggestions
                    };
                } catch (aiError) {
                    console.error('AI grading error:', aiError);
                    // Fallback: give partial score if answer is not empty
                    const hasAnswer = (submittedAnswer.answer as string)?.trim().length > 0;
                    gradedAnswers[index] = {
                        questionId: question.id,
                        questionText: question.text,
                        questionType: 'ESSAY',
                        studentAnswer: submittedAnswer.answer,
                        correctAnswer: question.correctAnswerText,
                        aiScore: hasAnswer ? 50 : 0,
                        aiFeedback: 'ไม่สามารถตรวจด้วย AI ได้ในขณะนี้ ให้คะแนนเบื้องต้น',
                    };
                }
            }));
        }

        const totalScore = gradedAnswers.reduce((sum, a) => sum + (a?.aiScore || 0), 0);
        const finalScore = questions.length > 0 ? Math.round(totalScore / questions.length) : 0;
        const passingScore = 50;
        const passed = finalScore >= passingScore;

        return NextResponse.json({
            success: true,
            attemptId: `attempt_${Date.now()}`,
            totalScore: finalScore,
            maxScore: 100,
            passingScore,
            passed,
            answers: gradedAnswers
        });

    } catch (error) {
        console.error('Error submitting exam:', error);
        return NextResponse.json(
            { error: 'Failed to submit exam' },
            { status: 500 }
        );
    }
}
