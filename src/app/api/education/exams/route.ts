import { NextRequest, NextResponse } from 'next/server';
import { getExams, getAllExams, createExam } from '@/lib/mock-store';

// GET /api/education/exams - Get all exams
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeAll = searchParams.get('all') === 'true';

        if (includeAll) {
            return NextResponse.json(getAllExams());
        }

        return NextResponse.json(getExams());
    } catch (error) {
        console.error('Error fetching exams:', error);
        return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
    }
}

// POST /api/education/exams - Create new exam
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.title) {
            return NextResponse.json(
                { error: 'Missing required field: title' },
                { status: 400 }
            );
        }

        const newExam = createExam({
            title: body.title,
            description: body.description || '',
            durationMinutes: body.durationMinutes || 60,
            passingScore: body.passingScore || 60,
            totalQuestions: body.totalQuestions || 0,
            category: body.category || 'other',
            difficulty: body.difficulty || 'medium',
            coverImage: body.coverImage || '',
            status: body.status || 'draft'
        });

        return NextResponse.json(newExam, { status: 201 });
    } catch (error) {
        console.error('Error creating exam:', error);
        return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
    }
}
