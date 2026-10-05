'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useUser } from '@/firebase/provider';
import type { PlanTone } from '@/components/plan-avatar';

export type PlanId = 'free' | 'premium' | 'pro';

export type PlanEntitlements = {
    examsPerDay: number | null;
    aiGrading: boolean;
    weaknessAnalysis: boolean;
    adFree: boolean;
    freeEbooks?: boolean;
    ebooksPerWeek?: number | null;
};

export type EntitlementResponse = {
    planId: PlanId;
    planName: string;
    expiresAt: string | null;
    entitlements: PlanEntitlements;
    usage: { day: string; used: number; limit: number | null; examIds: string[] };
    /** โควตาดาวน์โหลด E-Book ฟรีของสัปดาห์นี้ (มีเมื่อโหลดจาก GET) */
    /** หนังสือที่ซื้อแล้ว (ออเดอร์ยืนยันแล้ว) */
    ownedBookIds?: string[];
    ebookUsage?: { week: string; used: number; limit: number | null; bookIds: string[] };
    allowed?: boolean;
    code?: string;
};

type PlanContextType = {
    /** null = ยังไม่ล็อกอิน หรือยังโหลดไม่เสร็จ */
    data: EntitlementResponse | null;
    /** กำลังรอ auth หรือรอ /api/education/entitlement */
    loading: boolean;
    setData: (data: EntitlementResponse) => void;
    refresh: () => Promise<void>;
};

/** สีวง/ป้ายรอบรูปโปรไฟล์ตามแพ็กเกจ (ดู src/components/plan-avatar.tsx) */
export const PLAN_TONE: Record<PlanId, PlanTone> = { free: 'none', premium: 'plus', pro: 'gold' };

const PlanContext = createContext<PlanContextType | undefined>(undefined);

/**
 * แพ็กเกจของผู้ใช้ที่ล็อกอิน — โหลดครั้งเดียวต่อการเข้าเว็บ แล้วแชร์ให้ทุก component
 * (โฆษณา, โควตาข้อสอบ, กรอบสถานะแพ็กเกจ) เดิมแต่ละ hook ตั้ง tier 'free' เองหรือโหลดแยกกัน
 * ใช้แสดงผลเท่านั้น — ด่านจริงอยู่ที่ server (src/lib/plan-entitlement.ts)
 */
export function PlanProvider({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const [data, setData] = useState<EntitlementResponse | null>(null);
    const [fetching, setFetching] = useState(false);

    const load = useCallback(async (signal?: { cancelled: boolean }) => {
        if (!user) return;
        setFetching(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/education/entitlement', {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });
            if (res.ok && !signal?.cancelled) setData(await res.json());
        } catch (error) {
            console.error('Error loading entitlement:', error);
        } finally {
            if (!signal?.cancelled) setFetching(false);
        }
    }, [user]);

    useEffect(() => {
        const signal = { cancelled: false };
        if (!user) {
            setData(null);
            setFetching(false);
            return;
        }
        load(signal);
        return () => { signal.cancelled = true; };
    }, [user, load]);

    const refresh = useCallback(() => load(), [load]);

    return (
        <PlanContext.Provider value={{ data, loading: isUserLoading || fetching, setData, refresh }}>
            {children}
        </PlanContext.Provider>
    );
}

export function usePlan() {
    const ctx = useContext(PlanContext);
    if (!ctx) throw new Error('usePlan must be used within PlanProvider');
    const { data, loading } = ctx;
    return {
        ...ctx,
        planId: (data?.planId ?? 'free') as PlanId,
        planName: data?.planName ?? 'Free',
        planTone: PLAN_TONE[(data?.planId ?? 'free') as PlanId] ?? 'none',
        expiresAt: data?.expiresAt ?? null,
        entitlements: data?.entitlements ?? null,
        // ระหว่างโหลดยังไม่รู้แพ็กเกจ — ถือว่าไม่มีโฆษณาไว้ก่อน สมาชิกที่จ่ายแล้วจะได้ไม่เห็นโฆษณาแวบขึ้นมา
        adFree: loading ? true : (data?.entitlements.adFree ?? false),
    };
}
