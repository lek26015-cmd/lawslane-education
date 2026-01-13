import { NextRequest, NextResponse } from 'next/server';
import { getAttemptById } from '@/lib/mock-store';

// GET /api/education/attempts/[id] - Get single attempt with full results
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const attempt = getAttemptById(id);

        if (!attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }

        return NextResponse.json(attempt);
    } catch (error) {
        console.error('Error fetching attempt:', error);
        return NextResponse.json({ error: 'Failed to fetch attempt' }, { status: 500 });
    }
}
