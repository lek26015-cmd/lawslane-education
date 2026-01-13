import { NextRequest, NextResponse } from 'next/server';
import { getQuestionById, updateQuestion, deleteQuestion } from '@/lib/mock-store';

// GET /api/education/questions/[id] - Get single question
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const question = getQuestionById(id);

        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        return NextResponse.json(question);
    } catch (error) {
        console.error('Error fetching question:', error);
        return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
    }
}

// PUT /api/education/questions/[id] - Update question
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updated = updateQuestion(id, {
            text: body.text,
            type: body.type,
            options: body.options,
            correctOptionIndex: body.correctOptionIndex,
            correctAnswerText: body.correctAnswerText,
            explanation: body.explanation,
            order: body.order,
            subject: body.subject
        });

        if (!updated) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating question:', error);
        return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
    }
}

// DELETE /api/education/questions/[id] - Delete question
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const deleted = deleteQuestion(id);

        if (!deleted) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting question:', error);
        return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
    }
}
