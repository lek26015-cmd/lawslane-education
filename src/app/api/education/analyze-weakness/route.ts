import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { analyzeWeaknesses } from '@/lib/ai-weakness-analyzer';
import { requireUser } from '@/lib/user-auth';
import { getEntitlement } from '@/lib/plan-entitlement';

// GET /api/education/analyze-weakness - Analyze the logged-in user's weaknesses from exam attempts
export async function GET(request: NextRequest) {
    try {
        const userId = await requireUser(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();

        // AI วิเคราะห์จุดอ่อนเรียก AI ทุกครั้ง — เปิดตามแพ็กเกจที่แอดมินตั้งไว้
        const entitlement = await getEntitlement(db, userId);
        if (!entitlement.entitlements.weaknessAnalysis) {
            return NextResponse.json(
                { error: `แพ็กเกจ ${entitlement.planName} ยังไม่รวม AI วิเคราะห์จุดอ่อน`, code: 'plan_feature' },
                { status: 403 },
            );
        }
        // ไม่ใช้ orderBy('completedAt') — ต้องมี composite index (userId + completedAt) ที่ยังไม่ได้
        // deploy ถ้าใส่ Firestore จะปฏิเสธ query ทั้งก้อน → เรียงในหน่วยความจำแทน (แบบเดียวกับ student-history)
        const query: admin.firestore.Query = db.collection('examAttempts')
            .where('userId', '==', userId)
            .limit(200);

        const snap = await query.get();
        const recentDocs = [...snap.docs]
            .sort((a, b) => (b.data().completedAt?.toMillis?.() ?? 0) - (a.data().completedAt?.toMillis?.() ?? 0))
            .slice(0, 50);

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

        const attempts = recentDocs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                examId: data.examId || '',
                userId: data.userId || '',
                // ai-weakness-analyzer อ่าน examTitle / totalScore / passed — เดิมไม่ได้ส่งไป
                examTitle: data.examTitle || '',
                totalScore: data.totalScore ?? data.score ?? 0,
                passed: data.passed ?? false,
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
