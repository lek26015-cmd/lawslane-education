'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Crown, Download, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase/provider';
import { usePlan } from '@/context/plan-context';
import { useToast } from '@/hooks/use-toast';

/**
 * ปุ่มดาวน์โหลด E-Book รวมข้อสอบ — ฟรีเฉพาะสมาชิก Pro (สิทธิ์ freeEbooks)
 * สิทธิ์ตัดสินที่ server (/api/education/books/[id]/download) ฝั่งนี้แค่เลือกปุ่มที่แสดง
 */
export function EbookProDownload({ bookId, size = 'sm', className = '' }: {
    bookId: string;
    size?: 'sm' | 'lg';
    className?: string;
}) {
    const { user } = useUser();
    const { data } = usePlan();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const canDownload = !!data?.entitlements.freeEbooks;
    const h = size === 'lg' ? 'h-12 text-base px-6' : 'h-8 text-xs';

    if (!user) {
        return (
            <Link href="/login?redirect=/books" className={`w-full ${className}`}>
                <Button variant="outline" size="sm" className={`w-full border-blue-200 text-[#082a5a] ${h}`}>
                    <Lock className="mr-1.5 h-3.5 w-3.5" /> เข้าสู่ระบบเพื่อดาวน์โหลด
                </Button>
            </Link>
        );
    }

    if (!canDownload) {
        return (
            <Link href="/pricing" className={`w-full ${className}`}>
                <Button variant="outline" size="sm" className={`w-full border-amber-300 text-amber-700 hover:bg-amber-50 ${h}`}>
                    <Crown className="mr-1.5 h-3.5 w-3.5" /> ดาวน์โหลดฟรีเฉพาะสมาชิก Pro
                </Button>
            </Link>
        );
    }

    const download = async () => {
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/education/books/${bookId}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok || !body.url) throw new Error(body.error || 'ดาวน์โหลดไม่สำเร็จ');
            window.location.href = body.url;
        } catch (e) {
            toast({ title: 'ดาวน์โหลดไม่สำเร็จ', description: (e as Error).message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={download} disabled={loading} size="sm" className={`w-full bg-[#0B3979] hover:bg-[#082a5a] ${h} ${className}`}>
            {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
            ดาวน์โหลด E-Book (Pro)
        </Button>
    );
}
