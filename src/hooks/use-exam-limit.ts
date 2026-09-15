'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/firebase/provider';

const FREE_DAILY_LIMIT = 3;
const STORAGE_KEY = 'lw_exam_usage';

interface ExamUsage {
    date: string; // YYYY-MM-DD
    count: number;
    examIds: string[];
}

function getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
}

function getUsage(): ExamUsage {
    if (typeof window === 'undefined') return { date: getTodayKey(), count: 0, examIds: [] };

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { date: getTodayKey(), count: 0, examIds: [] };
        const data: ExamUsage = JSON.parse(raw);

        // Reset if it's a new day
        if (data.date !== getTodayKey()) {
            return { date: getTodayKey(), count: 0, examIds: [] };
        }
        return data;
    } catch {
        return { date: getTodayKey(), count: 0, examIds: [] };
    }
}

function saveUsage(usage: ExamUsage) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
    }
}

export type UserTier = 'free' | 'premium' | 'pro';

/**
 * Hook สำหรับตรวจสอบ usage limit ของข้อสอบ
 * - Free: 3 ชุด/วัน
 * - Premium/Pro: ไม่จำกัด
 */
export function useExamLimit() {
    const { user } = useUser();
    const [usage, setUsage] = useState<ExamUsage>({ date: getTodayKey(), count: 0, examIds: [] });
    const [tier, setTier] = useState<UserTier>('free');

    // Load usage on mount
    useEffect(() => {
        setUsage(getUsage());
    }, []);

    // TODO: Load tier from Firestore user profile
    // For now, all logged-in users are 'free'
    useEffect(() => {
        if (user) {
            // ในอนาคตจะดึง tier จาก Firestore
            // const userDoc = await getDoc(doc(db, 'users', user.uid));
            // setTier(userDoc.data()?.tier || 'free');
            setTier('free');
        } else {
            setTier('free');
        }
    }, [user]);

    const isPremium = tier === 'premium' || tier === 'pro';
    const remaining = isPremium ? Infinity : Math.max(0, FREE_DAILY_LIMIT - usage.count);
    const isLimitReached = !isPremium && usage.count >= FREE_DAILY_LIMIT;

    const recordExamAttempt = useCallback((examId: string) => {
        if (isPremium) return true; // Premium ไม่ต้อง track

        const current = getUsage();

        // ถ้าเคยทำข้อสอบนี้วันนี้แล้ว ไม่นับซ้ำ
        if (current.examIds.includes(examId)) return true;

        if (current.count >= FREE_DAILY_LIMIT) return false;

        const updated: ExamUsage = {
            date: getTodayKey(),
            count: current.count + 1,
            examIds: [...current.examIds, examId],
        };
        saveUsage(updated);
        setUsage(updated);
        return true;
    }, [isPremium]);

    return {
        tier,
        isPremium,
        dailyLimit: FREE_DAILY_LIMIT,
        used: usage.count,
        remaining,
        isLimitReached,
        recordExamAttempt,
    };
}
