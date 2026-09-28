'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@/firebase/provider';
import { usePlan, type EntitlementResponse, type PlanId } from '@/context/plan-context';

export type UserTier = PlanId;

/**
 * แพ็กเกจ + โควตาข้อสอบวันนี้ — ตัวเลขมาจาก /api/education/entitlement ผ่าน PlanProvider
 * (แอดมินตั้งค่าได้ที่หลังบ้าน) เดิมนับใน localStorage ซึ่งลบทิ้งแล้วทำต่อได้ไม่จำกัด
 * ค่าในนี้ใช้แสดงผลเท่านั้น ด่านจริงอยู่ที่ server (entitlement POST + submit-exam)
 */
export function useExamLimit() {
    const { user } = useUser();
    const { data, setData } = usePlan();
    const [blocked, setBlocked] = useState(false);

    /** เรียกตอนเริ่มทำข้อสอบ — คืน false ถ้าใช้สิทธิ์ของวันนี้ครบแล้ว */
    const recordExamAttempt = useCallback(async (examId: string): Promise<boolean> => {
        if (!user) return false;
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/education/entitlement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ examId }),
            });
            const body: EntitlementResponse | null = await res.json().catch(() => null);
            if (body?.usage) setData(body);
            const allowed = res.ok && body?.allowed !== false;
            setBlocked(!allowed && res.status === 403);
            return allowed;
        } catch (error) {
            // เน็ตหลุด — ให้ทำต่อได้ ตอนส่งคำตอบ server จะเช็คซ้ำอีกรอบ
            console.error('Error recording exam attempt:', error);
            return true;
        }
    }, [user, setData]);

    const tier: UserTier = data?.planId ?? 'free';
    const limit = data ? data.entitlements.examsPerDay : 3;
    const used = data?.usage.used ?? 0;
    const isPremium = limit === null;

    return {
        tier,
        planName: data?.planName ?? 'Free',
        isPremium,
        dailyLimit: limit ?? Infinity,
        used,
        remaining: limit === null ? Infinity : Math.max(0, limit - used),
        // ครบลิมิตเฉพาะเมื่อ server ปฏิเสธข้อสอบชุดนี้ — เดิมเช็ค used >= limit ทำให้ชุดที่ 3
        // (ชุดสุดท้ายที่ยังมีสิทธิ์) โดน paywall ทับทันทีที่เปิด
        isLimitReached: blocked,
        recordExamAttempt,
    };
}
