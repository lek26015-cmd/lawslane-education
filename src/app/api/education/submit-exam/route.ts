import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { gradeEssayAnswer, gradeMultipleChoice } from '@/lib/ai-grading';
import { stripAnswerFromQuestion, formatExamText } from '@/lib/exam-utils';

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

        // Grade each answer
        const gradedAnswers: any[] = [];
        let totalScore = 0;

        for (const question of questions) {
            const submittedAnswer = answers.find(a => a.questionId === question.id);

            if (!submittedAnswer) {
                gradedAnswers.push({
                    questionId: question.id,
                    questionText: question.text,
                    questionType: question.type,
                    studentAnswer: '',
                    isCorrect: false,
                    aiScore: 0,
                    aiFeedback: 'ไม่ได้ตอบคำถามนี้'
                });
                continue;
            }

            if (question.type === 'MULTIPLE_CHOICE') {
                const result = gradeMultipleChoice(
                    submittedAnswer.answer as number,
                    question.correctOptionIndex || 0,
                    question.explanation
                );

                const questionScore = result.isCorrect ? 100 : 0;
                totalScore += questionScore;

                gradedAnswers.push({
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
                });
            } else {
                // Grade essay with AI
                try {
                    const aiResult = await gradeEssayAnswer({
                        questionText: question.text,
                        modelAnswer: question.correctAnswerText || '',
                        studentAnswer: submittedAnswer.answer as string,
                        subject: question.subject
                    });
                    totalScore += aiResult.score;
                    gradedAnswers.push({
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
                    });
                } catch (aiError) {
                    console.error('AI grading error:', aiError);
                    // Fallback: give partial score if answer is not empty
                    const hasAnswer = (submittedAnswer.answer as string)?.trim().length > 0;
                    totalScore += hasAnswer ? 50 : 0;
                    gradedAnswers.push({
                        questionId: question.id,
                        questionText: question.text,
                        questionType: 'ESSAY',
                        studentAnswer: submittedAnswer.answer,
                        correctAnswer: question.correctAnswerText,
                        aiScore: hasAnswer ? 50 : 0,
                        aiFeedback: 'ไม่สามารถตรวจด้วย AI ได้ในขณะนี้ ให้คะแนนเบื้องต้น',
                    });
                }
            }
        }

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
