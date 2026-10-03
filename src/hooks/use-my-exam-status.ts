'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase/provider';
import type { MyExamStatus } from '@/app/api/education/my-exam-status/route';

/** ชุดข้อสอบที่ผู้ใช้เคยทำแล้ว — null = ยังไม่ล็อกอินหรือยังโหลดไม่เสร็จ (ไม่ต้องแสดงป้าย) */
export function useMyExamStatus(): MyExamStatus | null {
    const { user } = useUser();
    const [status, setStatus] = useState<MyExamStatus | null>(null);

    useEffect(() => {
        if (!user) {
            setStatus(null);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const token = await user.getIdToken();
                const res = await fetch('/api/education/my-exam-status', {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                });
                if (res.ok && !cancelled) setStatus(await res.json());
            } catch (error) {
                console.error('Error loading exam status:', error);
            }
        })();
        return () => { cancelled = true; };
    }, [user]);

    return status;
}
