import { NextRequest, NextResponse } from 'next/server';
import {
    getExamById,
    getQuestionsByExamId,
    createAttempt,
    ExamAttempt,
    AnswerResult
} from '@/lib/mock-store';
import { gradeEssayAnswer, gradeMultipleChoice } from '@/lib/ai-grading';

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

// POST /api/education/submit-exam - Submit exam for grading
export async function POST(request: NextRequest) {
    try {
        const body: SubmitExamRequest = await request.json();
        const { examId, userName, answers, startedAt } = body;

        // Get exam info
        const exam = getExamById(examId);
        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        // Get questions
        const questions = getQuestionsByExamId(examId);
        if (questions.length === 0) {
            return NextResponse.json({ error: 'No questions found' }, { status: 404 });
        }

        // Grade each answer
        const gradedAnswers: AnswerResult[] = [];
        let totalScore = 0;
        const maxScore = questions.length * 100; // Each question worth 100 points

        for (const question of questions) {
            const submittedAnswer = answers.find(a => a.questionId === question.id);

            if (!submittedAnswer) {
                // Question not answered
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
                // Grade multiple choice
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
            }
        }

        // Calculate final score (average)
        const finalScore = questions.length > 0 ? Math.round(totalScore / questions.length) : 0;
        const passed = finalScore >= exam.passingScore;

        // Create attempt record
        const attempt = createAttempt({
            examId,
            examTitle: exam.title,
            userName,
            startedAt,
            completedAt: new Date().toISOString(),
            status: 'COMPLETED',
            totalScore: finalScore,
            maxScore: 100,
            passingScore: exam.passingScore,
            passed,
            answers: gradedAnswers
        });

        return NextResponse.json({
            success: true,
            attemptId: attempt.id,
            totalScore: finalScore,
            maxScore: 100,
            passingScore: exam.passingScore,
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
