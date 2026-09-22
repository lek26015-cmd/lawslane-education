import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { requireAdminClaim } from '@/lib/admin-guard';

// GET /api/education/attempts - Get all exam attempts (bulk PII listing — admin only)
export async function GET(request: NextRequest) {
    try {
        if (!await requireAdminClaim(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const { searchParams } = new URL(request.url);
        const examId = searchParams.get('examId');
        const userId = searchParams.get('userId');

        const db = admin.firestore();
        let query: admin.firestore.Query = db.collection('examAttempts')
            .orderBy('completedAt', 'desc')
            .limit(100);

        if (examId) {
            query = query.where('examId', '==', examId);
        }
        if (userId) {
            query = query.where('userId', '==', userId);
        }

        const snap = await query.get();
        const attempts = snap.docs.map(doc => {
            const data = doc.data();
            return {
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
            };
        });

        return NextResponse.json(attempts);
    } catch (error) {
        console.error('Error fetching attempts:', error);
        return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 });
    }
}
