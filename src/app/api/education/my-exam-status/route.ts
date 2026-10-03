import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { requireUser } from '@/lib/user-auth';

export type MyExamStatus = Record<string, {
    attempts: number;
    bestScore: number;
    lastScore: number;
    lastAttemptId: string;
    lastAt: string;
}>;

/**
 * ชุดข้อสอบที่ผู้ใช้เคยทำแล้ว — ใช้แสดงป้าย "ทำแล้ว / ยังไม่เคยทำ" บนการ์ดข้อสอบ
 * อ่านจาก examAttempts ที่ submit-exam บันทึก (เฉพาะของตัวเอง)
 */
export async function GET(request: NextRequest) {
    const uid = await requireUser(request);
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const snap = await admin.firestore()
            .collection('examAttempts')
            .where('userId', '==', uid)
            .select('examId', 'score', 'createdAt')
            .limit(500)
            .get();

        const status: MyExamStatus = {};
        for (const doc of snap.docs) {
            const d = doc.data();
            if (!d.examId) continue;
            const score = Number(d.score) || 0;
            const at = d.createdAt?.toDate?.()?.toISOString?.() ?? '';
            const prev = status[d.examId];
            if (!prev) {
                status[d.examId] = { attempts: 1, bestScore: score, lastScore: score, lastAttemptId: doc.id, lastAt: at };
                continue;
            }
            prev.attempts += 1;
            prev.bestScore = Math.max(prev.bestScore, score);
            if (at > prev.lastAt) Object.assign(prev, { lastScore: score, lastAttemptId: doc.id, lastAt: at });
        }

        return NextResponse.json(status, { headers: { 'Cache-Control': 'private, no-store' } });
    } catch (error) {
        console.error('Error fetching my exam status:', error);
        return NextResponse.json({ error: 'Failed to fetch exam status' }, { status: 500 });
    }
}
