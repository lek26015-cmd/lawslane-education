'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/firebase/provider';

const PREMIUM_DAILY_LIMIT = 5;
const STORAGE_KEY = 'lw_ebook_downloads';

interface DownloadUsage {
    date: string; // YYYY-MM-DD
    count: number;
    bookIds: string[];
}

function getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
}

function getUsage(): DownloadUsage {
    if (typeof window === 'undefined') return { date: getTodayKey(), count: 0, bookIds: [] };

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { date: getTodayKey(), count: 0, bookIds: [] };
        const data: DownloadUsage = JSON.parse(raw);

        // Reset if it's a new day
        if (data.date !== getTodayKey()) {
            return { date: getTodayKey(), count: 0, bookIds: [] };
        }
        return data;
    } catch {
        return { date: getTodayKey(), count: 0, bookIds: [] };
    }
}

function saveUsage(usage: DownloadUsage) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
    }
}

export type UserTier = 'free' | 'premium' | 'pro';

/**
 * Hook สำหรับจัดการดาวน์โหลด E-Book
 * - Free: ไม่สามารถดาวน์โหลดได้
 * - Premium/Pro: ดาวน์โหลดได้ 5 ชุด/วัน
 */
export function useEbookDownload() {
    const { user } = useUser();
    const [usage, setUsage] = useState<DownloadUsage>({ date: getTodayKey(), count: 0, bookIds: [] });
    const [tier, setTier] = useState<UserTier>('free');

    // Load usage on mount
    useEffect(() => {
        setUsage(getUsage());
    }, []);

    // TODO: Load tier from Firestore user profile
    useEffect(() => {
        if (user) {
            // ในอนาคตจะดึง tier จาก Firestore
            setTier('free');
        } else {
            setTier('free');
        }
    }, [user]);

    const isPremium = tier === 'premium' || tier === 'pro';
    const canDownload = isPremium;
    const remaining = isPremium ? Math.max(0, PREMIUM_DAILY_LIMIT - usage.count) : 0;
    const isLimitReached = isPremium && usage.count >= PREMIUM_DAILY_LIMIT;

    /**
     * บันทึกการดาวน์โหลดและ return true ถ้ายังเหลือสิทธิ์
     */
    const recordDownload = useCallback((bookId: string) => {
        if (!isPremium) return false;

        const current = getUsage();

        // ถ้าเคยดาวน์โหลดเล่มนี้วันนี้แล้ว ไม่นับซ้ำ (ให้โหลดซ้ำได้)
        if (current.bookIds.includes(bookId)) return true;

        if (current.count >= PREMIUM_DAILY_LIMIT) return false;

        const updated: DownloadUsage = {
            date: getTodayKey(),
            count: current.count + 1,
            bookIds: [...current.bookIds, bookId],
        };
        saveUsage(updated);
        setUsage(updated);
        return true;
    }, [isPremium]);

    return {
        tier,
        isPremium,
        canDownload,
        dailyLimit: PREMIUM_DAILY_LIMIT,
        used: usage.count,
        remaining,
        isLimitReached,
        recordDownload,
    };
}
