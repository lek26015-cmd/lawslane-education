import { NextRequest, NextResponse } from 'next/server';
import { getQuestionsByExamId, createQuestion } from '@/lib/mock-store';

// GET /api/education/exams/[id]/questions - Get all questions for exam
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const questions = getQuestionsByExamId(id);
        return NextResponse.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}

// POST /api/education/exams/[id]/questions - Add question to exam
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (!body.text) {
            return NextResponse.json(
                { error: 'Missing required field: text' },
                { status: 400 }
            );
        }

        // Calculate order based on existing questions
        const existingQuestions = getQuestionsByExamId(id);
        const order = body.order || existingQuestions.length + 1;

        const newQuestion = createQuestion({
            examId: id,
            text: body.text,
            type: body.type || 'MULTIPLE_CHOICE',
            options: body.options || [],
            correctOptionIndex: body.correctOptionIndex,
            correctAnswerText: body.correctAnswerText,
            explanation: body.explanation || '',
            order,
            subject: body.subject || ''
        });

        return NextResponse.json(newQuestion, { status: 201 });
    } catch (error) {
        console.error('Error creating question:', error);
        return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
    }
}
