import { NextRequest, NextResponse } from 'next/server';
import { getExamById, updateExam, deleteExam, getQuestionsByExamId } from '@/lib/mock-store';

// GET /api/education/exams/[id] - Get single exam with questions
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const includeQuestions = searchParams.get('questions') === 'true';

        const exam = getExamById(id);

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        if (includeQuestions) {
            const questions = getQuestionsByExamId(id);
            return NextResponse.json({ ...exam, questions });
        }

        return NextResponse.json(exam);
    } catch (error) {
        console.error('Error fetching exam:', error);
        return NextResponse.json({ error: 'Failed to fetch exam' }, { status: 500 });
    }
}

// PUT /api/education/exams/[id] - Update exam
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updated = updateExam(id, {
            title: body.title,
            description: body.description,
            durationMinutes: body.durationMinutes,
            passingScore: body.passingScore,
            category: body.category,
            difficulty: body.difficulty,
            coverImage: body.coverImage,
            status: body.status
        });

        if (!updated) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating exam:', error);
        return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 });
    }
}

// DELETE /api/education/exams/[id] - Delete exam
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const deleted = deleteExam(id);

        if (!deleted) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting exam:', error);
        return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 });
    }
}
