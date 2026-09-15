import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { analyzeWeaknesses } from '@/lib/ai-weakness-analyzer';

// GET /api/education/analyze-weakness - Analyze user's weaknesses from exam attempts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        let query: admin.firestore.Query = db.collection('examAttempts')
            .orderBy('completedAt', 'desc')
            .limit(50);

        if (userId) {
            query = query.where('userId', '==', userId);
        }

        const snap = await query.get();

        if (snap.empty) {
            return NextResponse.json({
                success: true,
                message: 'No exam attempts found',
                analysis: {
                    overallAssessment: 'ยังไม่มีข้อมูลการทำข้อสอบ',
                    strongTopics: [],
                    weakTopics: [],
                    studyRecommendations: ['เริ่มทำข้อสอบเพื่อให้ AI วิเคราะห์จุดแข็ง/จุดอ่อนได้'],
                    improvementPlan: [],
                    motivationalMessage: 'เริ่มต้นดี มีชัยไปกว่าครึ่ง! 💪'
                }
            });
        }

        const attempts = snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                examId: data.examId || '',
                userId: data.userId || '',
                score: data.score || 0,
                totalQuestions: data.totalQuestions || 0,
                answers: data.answers || [],
                completedAt: data.completedAt?.toDate?.()?.toISOString() || '',
            };
        });

        const analysis = await analyzeWeaknesses(attempts as any);

        return NextResponse.json({
            success: true,
            totalAttempts: attempts.length,
            analysis
        });

    } catch (error) {
        console.error('Error analyzing weakness:', error);
        return NextResponse.json(
            { error: 'Failed to analyze' },
            { status: 500 }
        );
    }
}
