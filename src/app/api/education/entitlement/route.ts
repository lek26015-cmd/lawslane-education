import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { initAdmin } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/user-auth';
import { consumeExamAttempt, EntitlementError, getEbookUsage, getEntitlement, getExamUsage } from '@/lib/plan-entitlement';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

// GET — แพ็กเกจ สิทธิ์ และโควตาข้อสอบวันนี้ของผู้ใช้ (ค่าเดียวกับที่ server ใช้ตัดสิน)
export async function GET(request: NextRequest) {
    const uid = await requireUser(request);
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await initAdmin())) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

    const db = admin.firestore();
    const entitlement = await getEntitlement(db, uid);
    const [usage, ebookUsage] = await Promise.all([
        getExamUsage(db, uid, entitlement.entitlements.examsPerDay),
        getEbookUsage(db, uid, entitlement.entitlements.ebooksPerWeek),
    ]);
    return NextResponse.json({ ...entitlement, usage, ebookUsage }, { headers: NO_STORE });
}

// POST { examId } — เริ่มทำข้อสอบ: ใช้สิทธิ์ 1 ชุด (ชุดเดิมในวันเดียวกันไม่นับซ้ำ)
export async function POST(request: NextRequest) {
    const uid = await requireUser(request);
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await initAdmin())) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

    const { examId } = await request.json().catch(() => ({}));
    if (typeof examId !== 'string' || !examId || examId.length > 200) {
        return NextResponse.json({ error: 'examId required' }, { status: 400 });
    }

    const db = admin.firestore();
    const entitlement = await getEntitlement(db, uid);
    const limit = entitlement.entitlements.examsPerDay;
    try {
        const usage = await consumeExamAttempt(db, uid, examId, limit);
        return NextResponse.json({ ...entitlement, usage, allowed: true }, { headers: NO_STORE });
    } catch (e) {
        if (e instanceof EntitlementError) {
            const usage = await getExamUsage(db, uid, limit);
            return NextResponse.json(
                { ...entitlement, usage, allowed: false, code: e.code, error: e.message },
                { status: e.status, headers: NO_STORE },
            );
        }
        console.error('ENTITLEMENT_CONSUME_ERROR', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
