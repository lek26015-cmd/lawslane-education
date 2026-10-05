import 'server-only';
import * as admin from 'firebase-admin';

/**
 * สิทธิ์ตามแพ็กเกจของ Wittaya — ตัดสินฝั่ง server เท่านั้น
 *
 * แอดมินตั้งค่าที่หลังบ้าน (lawslane-admin → Education → แพ็กเกจและสิทธิ์) เก็บ 2 ที่:
 *  - `planEntitlements/wittaya` → แต่ละแพ็กเกจได้สิทธิ์อะไร (ไม่มีเอกสาร = ใช้ DEFAULT_PLANS)
 *  - `users/{uid}.planGrants.wittaya` → แพ็กเกจที่แอดมินมอบให้ลูกค้ารายคน (+ วันหมดอายุ)
 *    ยังไม่มีระบบจ่ายเงินของ Wittaya จึงเป็นทางเดียวที่ลูกค้าจะได้แพ็กเกจที่สูงกว่า free
 *
 * ทั้งสองที่ client เขียนเองไม่ได้ (firestore.rules ของ users เป็น allowlist ที่ไม่มี
 * planGrants และ planEntitlements ไม่มีกฎ = deny) — โครงข้อมูลต้องตรงกับ
 * lawslane-admin/src/lib/plan-entitlements.ts
 *
 * โควตาทำข้อสอบนับใน `examUsage/{uid}_{YYYY-MM-DD}` (วันตามเวลาไทย) แทน localStorage เดิม
 * ที่ลบทิ้งได้ และ "นับ" แค่ในเบราว์เซอร์
 */

export const WITTAYA_PLAN_IDS = ['free', 'premium', 'pro'] as const;
export type WittayaPlanId = (typeof WITTAYA_PLAN_IDS)[number];

export type WittayaEntitlements = {
    /** จำนวนชุดข้อสอบต่อวัน — null = ไม่จำกัด */
    examsPerDay: number | null;
    /** ให้ AI ตรวจข้อเขียน (อัตนัย) ตอนส่งข้อสอบ */
    aiGrading: boolean;
    /** AI วิเคราะห์จุดแข็ง/จุดอ่อน (หน้า my-progress) */
    weaknessAnalysis: boolean;
    /** ไม่แสดงโฆษณา Google AdSense */
    adFree: boolean;
    /** ดาวน์โหลด E-Book รวมข้อสอบได้ฟรี (ลูกค้ากำหนด 2026-10-03: เฉพาะ Pro) */
    freeEbooks: boolean;
    /** จำนวนเล่ม E-Book ที่ดาวน์โหลดฟรีได้ต่อสัปดาห์ (ไทย จันทร์–อาทิตย์) — null = ไม่จำกัด · ใช้เมื่อ freeEbooks เปิด */
    ebooksPerWeek: number | null;
};

// ค่าเริ่มต้น = พฤติกรรมเดิมก่อนมีระบบนี้ (free ทำข้อสอบได้ 3 ชุด/วัน ที่เหลือเปิดหมด)
// จะได้ไม่มีฟีเจอร์ไหนหายไปจากผู้ใช้ทันทีที่ deploy — แอดมินค่อยปรับเองที่หลังบ้าน
// adFree: premium/pro ไม่เห็นโฆษณาตามที่หน้า pricing สัญญาไว้ ("ปิดโฆษณาทั้งหมด")
export const DEFAULT_PLANS: Record<WittayaPlanId, WittayaEntitlements> = {
    free: { examsPerDay: 3, aiGrading: true, weaknessAnalysis: true, adFree: false, freeEbooks: false, ebooksPerWeek: null },
    premium: { examsPerDay: null, aiGrading: true, weaknessAnalysis: true, adFree: true, freeEbooks: false, ebooksPerWeek: null },
    pro: { examsPerDay: null, aiGrading: true, weaknessAnalysis: true, adFree: true, freeEbooks: true, ebooksPerWeek: 3 },
};

const PLAN_NAMES: Record<WittayaPlanId, string> = { free: 'Free', premium: 'Premium', pro: 'Pro' };

export class EntitlementError extends Error {
    status: number;
    code: string;
    constructor(code: string, message: string, status = 403) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

function isPlanId(v: unknown): v is WittayaPlanId {
    return typeof v === 'string' && (WITTAYA_PLAN_IDS as readonly string[]).includes(v);
}

/** อ่านค่าจากเอกสาร — ฟิลด์ที่หายหรือชนิดผิดตกไปใช้ค่าเริ่มต้นของแพ็กเกจนั้น */
function normalize(raw: any, fallback: WittayaEntitlements): WittayaEntitlements {
    const perDay = raw?.examsPerDay;
    const perWeek = raw?.ebooksPerWeek;
    return {
        examsPerDay: perDay === null ? null
            : typeof perDay === 'number' && Number.isFinite(perDay) && perDay >= 0 ? Math.floor(perDay)
            : fallback.examsPerDay,
        ebooksPerWeek: perWeek === null ? null
            : typeof perWeek === 'number' && Number.isFinite(perWeek) && perWeek >= 0 ? Math.floor(perWeek)
            : fallback.ebooksPerWeek,
        aiGrading: typeof raw?.aiGrading === 'boolean' ? raw.aiGrading : fallback.aiGrading,
        weaknessAnalysis: typeof raw?.weaknessAnalysis === 'boolean' ? raw.weaknessAnalysis : fallback.weaknessAnalysis,
        adFree: typeof raw?.adFree === 'boolean' ? raw.adFree : fallback.adFree,
        freeEbooks: typeof raw?.freeEbooks === 'boolean' ? raw.freeEbooks : fallback.freeEbooks,
    };
}

async function loadPlans(db: admin.firestore.Firestore): Promise<Record<WittayaPlanId, WittayaEntitlements>> {
    const snap = await db.collection('planEntitlements').doc('wittaya').get().catch(() => null);
    const plans = snap?.data()?.plans ?? {};
    return {
        free: normalize(plans.free, DEFAULT_PLANS.free),
        premium: normalize(plans.premium, DEFAULT_PLANS.premium),
        pro: normalize(plans.pro, DEFAULT_PLANS.pro),
    };
}

/** แพ็กเกจที่แอดมินมอบให้ — หมดอายุแล้วหรือค่าไม่ถูกต้องถือว่า free */
export function planFromGrant(grant: any, now = Date.now()): { planId: WittayaPlanId; expiresAt: Date | null } {
    if (!grant || !isPlanId(grant.planId)) return { planId: 'free', expiresAt: null };
    const expiresAt: Date | null = grant.expiresAt?.toDate?.() ?? null;
    if (expiresAt && expiresAt.getTime() <= now) return { planId: 'free', expiresAt: null };
    return { planId: grant.planId, expiresAt };
}

export type WittayaEntitlement = {
    planId: WittayaPlanId;
    planName: string;
    expiresAt: string | null;
    entitlements: WittayaEntitlements;
};

export async function getEntitlement(db: admin.firestore.Firestore, uid: string): Promise<WittayaEntitlement> {
    const [userSnap, plans] = await Promise.all([db.collection('users').doc(uid).get(), loadPlans(db)]);
    const { planId, expiresAt } = planFromGrant(userSnap.data()?.planGrants?.wittaya);
    return {
        planId,
        planName: PLAN_NAMES[planId],
        expiresAt: expiresAt?.toISOString() ?? null,
        entitlements: plans[planId],
    };
}

/** วันปัจจุบันตามเวลาไทย เช่น "2026-09-28" — รีเซ็ตโควตาเที่ยงคืนไทย ตรงกับข้อความบนหน้า paywall */
export function currentUsageDay(now = new Date()): string {
    return new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export type ExamUsage = {
    day: string;
    used: number;
    limit: number | null;
    examIds: string[];
};

export async function getExamUsage(db: admin.firestore.Firestore, uid: string, limit: number | null): Promise<ExamUsage> {
    const day = currentUsageDay();
    const snap = await db.collection('examUsage').doc(`${uid}_${day}`).get();
    const examIds: string[] = snap.data()?.examIds ?? [];
    return { day, used: examIds.length, limit, examIds };
}

/**
 * ใช้สิทธิ์ทำข้อสอบ 1 ชุด — ข้อสอบเดิมในวันเดียวกันไม่นับซ้ำ (เข้าใหม่/ส่งคำตอบไม่เสียสิทธิ์เพิ่ม)
 * เกินลิมิต throw EntitlementError('exam_quota')
 */
export async function consumeExamAttempt(
    db: admin.firestore.Firestore,
    uid: string,
    examId: string,
    limit: number | null,
): Promise<ExamUsage> {
    const day = currentUsageDay();
    const ref = db.collection('examUsage').doc(`${uid}_${day}`);
    return db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const examIds: string[] = snap.data()?.examIds ?? [];
        if (examIds.includes(examId)) return { day, used: examIds.length, limit, examIds };
        if (limit !== null && examIds.length >= limit) {
            throw new EntitlementError('exam_quota', `ใช้สิทธิ์ทำข้อสอบครบ ${limit} ชุดของวันนี้แล้ว`);
        }
        const next = [...examIds, examId];
        tx.set(ref, {
            uid,
            day,
            examIds: next,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return { day, used: next.length, limit, examIds: next };
    });
}

/** วันจันทร์ของสัปดาห์ปัจจุบันตามเวลาไทย เช่น "2026-10-05" — โควตา E-Book รีเซ็ตเที่ยงคืนเข้าวันจันทร์ */
export function currentUsageWeek(now = new Date()): string {
    const th = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const sinceMonday = (th.getUTCDay() + 6) % 7;
    return new Date(th.getTime() - sinceMonday * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export type EbookUsage = {
    week: string;
    used: number;
    limit: number | null;
    bookIds: string[];
};

export async function getEbookUsage(db: admin.firestore.Firestore, uid: string, limit: number | null): Promise<EbookUsage> {
    const week = currentUsageWeek();
    const snap = await db.collection('ebookUsage').doc(`${uid}_${week}`).get();
    const bookIds: string[] = snap.data()?.bookIds ?? [];
    return { week, used: bookIds.length, limit, bookIds };
}

/**
 * ใช้สิทธิ์ดาวน์โหลด E-Book ฟรี 1 เล่ม — เล่มเดิมในสัปดาห์เดียวกันโหลดซ้ำได้ ไม่นับเพิ่ม
 * เกินลิมิต throw EntitlementError('ebook_quota', …, 429)
 */
export async function consumeEbookDownload(
    db: admin.firestore.Firestore,
    uid: string,
    bookId: string,
    limit: number | null,
): Promise<EbookUsage> {
    const week = currentUsageWeek();
    const ref = db.collection('ebookUsage').doc(`${uid}_${week}`);
    return db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const bookIds: string[] = snap.data()?.bookIds ?? [];
        if (bookIds.includes(bookId)) return { week, used: bookIds.length, limit, bookIds };
        if (limit !== null && bookIds.length >= limit) {
            throw new EntitlementError(
                'ebook_quota',
                `ดาวน์โหลด E-Book ฟรีครบ ${limit} เล่มของสัปดาห์นี้แล้ว — สิทธิ์รีเซ็ตเที่ยงคืนเข้าวันจันทร์ (เวลาไทย)`,
                429,
            );
        }
        const next = [...bookIds, bookId];
        tx.set(ref, { uid, week, bookIds: next, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        return { week, used: next.length, limit, bookIds: next };
    });
}

const PAID_ORDER_STATUSES = ['PAID', 'COMPLETED', 'SHIPPING', 'DELIVERED'];

/** หนังสือที่ผู้ใช้ซื้อแล้ว (ออเดอร์ที่แอดมินยืนยันสลิปแล้ว) — ดาวน์โหลดได้ไม่นับโควตา Pro */
export async function getOwnedBookIds(db: admin.firestore.Firestore, uid: string): Promise<string[]> {
    const snap = await db.collection('orders').where('userId', '==', uid).limit(200).get();
    const ids = new Set<string>();
    for (const doc of snap.docs) {
        const order = doc.data();
        if (!PAID_ORDER_STATUSES.includes(order.status) || !Array.isArray(order.items)) continue;
        for (const item of order.items) {
            if (item?.type === 'BOOK' && typeof item.id === 'string') ids.add(item.id);
        }
    }
    return [...ids];
}
