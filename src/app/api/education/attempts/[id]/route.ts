import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

// GET /api/education/attempts/[id] - Get single attempt
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const doc = await db.collection('examAttempts').doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }

        const data = doc.data()!;
        return NextResponse.json({
            id: doc.id,
            examId: data.examId || '',
            userId: data.userId || '',
            userName: data.userName || '',
            score: data.score || 0,
            totalQuestions: data.totalQuestions || 0,
            correctAnswers: data.correctAnswers || 0,
            timeSpentMinutes: data.timeSpentMinutes || 0,
            answers: data.answers || [],
            completedAt: data.completedAt?.toDate?.()?.toISOString() || '',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
        });
    } catch (error) {
        console.error('Error fetching attempt:', error);
        return NextResponse.json({ error: 'Failed to fetch attempt' }, { status: 500 });
    }
}
