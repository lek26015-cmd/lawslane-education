import { NextRequest, NextResponse } from 'next/server';
import { getAllAttempts, getAttemptsByExamId } from '@/lib/mock-store';

// GET /api/education/attempts - Get all attempts or filter by examId
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const examId = searchParams.get('examId');

        if (examId) {
            const attempts = getAttemptsByExamId(examId);
            return NextResponse.json(attempts);
        }

        return NextResponse.json(getAllAttempts());
    } catch (error) {
        console.error('Error fetching attempts:', error);
        return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 });
    }
}
