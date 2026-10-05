'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Loader2, Lock, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase/provider';
import { usePlan } from '@/context/plan-context';
import { useToast } from '@/hooks/use-toast';

export const EBOOK_PRICE = 199;

/**
 * ปุ่มดาวน์โหลด E-Book รวมข้อสอบ
 *  - ซื้อเล่มนั้นแล้ว → โหลดได้ไม่จำกัด (ไม่กินโควตา Pro)
 *  - สมาชิก Pro (สิทธิ์ freeEbooks) → โหลดฟรีตามโควตา ebooksPerWeek (ค่าเริ่มต้น 3 เล่ม/สัปดาห์)
 *  - คนอื่น → ปุ่มซื้อ (เล่มละ 199 บาท ผ่านตะกร้าในหน้ารายละเอียดหนังสือ)
 * สิทธิ์ตัดสินที่ server (/api/education/books/[id]/download) ฝั่งนี้แค่เลือกปุ่มที่แสดง
 *
 * hideBuy: หน้ารายละเอียดหนังสือมีปุ่มซื้อ/ตะกร้าอยู่แล้ว — ไม่ต้องแสดงปุ่มซื้อซ้ำ (คืน null เมื่อไม่มีสิทธิ์โหลด)
 */
export function EbookProDownload({ bookId, size = 'sm', className = '', hideBuy = false }: {
    bookId: string;
    size?: 'sm' | 'lg';
    className?: string;
    hideBuy?: boolean;
}) {
    const { user } = useUser();
    const { data, refresh } = usePlan();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const owned = !!data?.ownedBookIds?.includes(bookId);
    const hasFreePlan = !!data?.entitlements.freeEbooks;
    // ข้อความยาวบนการ์ดแคบ (มือถือ 2 คอลัมน์) ขึ้นบรรทัดใหม่ได้ ไม่ล้นกรอบ
    const h = size === 'lg'
        ? 'h-auto min-h-12 whitespace-normal py-2 text-base px-6'
        : 'h-auto min-h-8 whitespace-normal py-1.5 px-2 text-xs leading-tight';
    const icon = 'mr-1.5 h-3.5 w-3.5 shrink-0';

    const buyButton = (label: string) => hideBuy ? null : (
        <Link href={`/books/${bookId}`} className={`w-full ${className}`}>
            <Button variant="outline" size="sm" className={`w-full border-amber-300 text-amber-700 hover:bg-amber-50 ${h}`}>
                <ShoppingCart className={icon} /> {label}
            </Button>
        </Link>
    );

    if (!user) {
        return (
            <Link href={`/login?redirect=/books/${bookId}`} className={`w-full ${className}`}>
                <Button variant="outline" size="sm" className={`w-full border-blue-200 text-[#082a5a] ${h}`}>
                    <Lock className={icon} /> เข้าสู่ระบบเพื่อโหลด/ซื้อ
                </Button>
            </Link>
        );
    }

    const eu = data?.ebookUsage;
    const alreadyHave = !!eu?.bookIds.includes(bookId);
    const quotaLeft = eu && eu.limit !== null ? Math.max(0, eu.limit - eu.used) : null;
    const quotaFull = !owned && hasFreePlan && quotaLeft === 0 && !alreadyHave;

    if (!owned && !hasFreePlan) return buyButton(`ซื้อ E-Book ฿${EBOOK_PRICE}`);

    if (quotaFull) {
        return hideBuy ? (
            <Button disabled variant="outline" size="sm" className={`w-full border-amber-300 text-amber-700 ${h} ${className}`}>
                <Lock className={icon} /> สิทธิ์ฟรีครบ {eu?.limit} เล่มของสัปดาห์นี้แล้ว (รีเซ็ตเที่ยงคืนเข้าวันจันทร์)
            </Button>
        ) : buyButton(`สิทธิ์ฟรีครบแล้ว · ซื้อ ฿${EBOOK_PRICE}`);
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
            refresh();
        } catch (e) {
            toast({ title: 'ดาวน์โหลดไม่สำเร็จ', description: (e as Error).message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const label = owned
        ? 'ดาวน์โหลด E-Book (ซื้อแล้ว)'
        : `ดาวน์โหลดฟรี (Pro)${quotaLeft !== null && !alreadyHave ? ` · เหลือ ${quotaLeft}/${eu?.limit} เล่มสัปดาห์นี้` : ''}`;

    return (
        <Button onClick={download} disabled={loading} size="sm" className={`w-full bg-[#0B3979] hover:bg-[#082a5a] ${h} ${className}`}>
            {loading ? <Loader2 className={`${icon} animate-spin`} /> : <Download className={icon} />}
            {label}
        </Button>
    );
}
