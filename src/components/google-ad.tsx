'use client';

import React, { useEffect, useRef } from 'react';
import { usePlan } from '@/context/plan-context';

// ─────────────────────────────────────────────────
// Google AdSense Configuration
// ตั้ง NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXX เมื่อได้ Publisher ID จาก Google AdSense
// ยังไม่ตั้ง = ไม่โหลดสคริปต์และไม่เว้นที่ว่างให้โฆษณาบน production
// (เดิมใส่ 'ca-pub-XXXX…' ตายตัว สคริปต์โหลดด้วย ID ปลอมและเหลือกล่องว่างบนหน้า)
// ─────────────────────────────────────────────────
const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ADS_ENABLED = IS_PRODUCTION && ADSENSE_PUBLISHER_ID.startsWith('ca-pub-');

interface GoogleAdProps {
    /** Ad slot ID from AdSense */
    slot?: string;
    /** Ad format */
    format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
    /** Layout for in-feed / in-article */
    layout?: 'in-article' | 'in-feed' | '';
    /** Layout key for fluid responsive */
    layoutKey?: string;
    /** Full width responsive */
    fullWidthResponsive?: boolean;
    /** Custom class */
    className?: string;
    /** Visual style variant */
    variant?: 'banner' | 'infeed' | 'sidebar';
}

/**
 * Google AdSense Ad Unit Component
 * 
 * แสดง placeholder ตอน dev, แสดง ad จริงตอน production
 * ไม่แสดงเลยถ้าแพ็กเกจของผู้ใช้มีสิทธิ์ adFree (แอดมินตั้งที่หลังบ้าน — ค่าเริ่มต้น Premium/Pro)
 * 
 * Usage:
 *   <GoogleAd variant="banner" />           // Top/Bottom banner
 *   <GoogleAd variant="infeed" />           // In-feed between cards
 *   <GoogleAd variant="sidebar" />          // Sidebar ad
 */
export function GoogleAd({
    slot = '0000000000', // TODO: ใส่ Ad Slot ID จริงจาก AdSense
    format = 'auto',
    layout = '',
    layoutKey,
    fullWidthResponsive = true,
    className = '',
    variant = 'banner',
}: GoogleAdProps) {
    const adRef = useRef<HTMLDivElement>(null);
    const { adFree } = usePlan();
    const showAd = !adFree && ADS_ENABLED;

    useEffect(() => {
        if (showAd && typeof window !== 'undefined') {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error('AdSense push error:', e);
            }
        }
    }, [showAd]);

    if (adFree) return null;

    // ── Placeholder for development ──
    if (!IS_PRODUCTION) {
        const placeholderStyles: Record<string, { height: string; label: string }> = {
            banner: { height: 'h-[90px]', label: 'Google Ad — Banner (728×90)' },
            infeed: { height: 'h-[250px]', label: 'Google Ad — In-feed (300×250)' },
            sidebar: { height: 'h-[600px]', label: 'Google Ad — Sidebar (160×600)' },
        };

        const style = placeholderStyles[variant] || placeholderStyles.banner;

        return (
            <div
                className={`${style.height} w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/50 flex flex-col items-center justify-center gap-1 select-none ${className}`}
            >
                <span className="text-[11px] font-normal text-slate-400">📢 {style.label}</span>
                <span className="text-[9px] text-slate-300 font-normal">
                    {ADSENSE_PUBLISHER_ID || 'NEXT_PUBLIC_ADSENSE_CLIENT ยังไม่ตั้ง'} / slot: {slot}
                </span>
            </div>
        );
    }

    if (!ADS_ENABLED) return null;

    // ── Production: real AdSense unit ──
    return (
        <div ref={adRef} className={`ad-container ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={ADSENSE_PUBLISHER_ID}
                data-ad-slot={slot}
                data-ad-format={format}
                data-ad-layout={layout || undefined}
                data-ad-layout-key={layoutKey || undefined}
                data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
            />
        </div>
    );
}

/**
 * AdSense Script Loader — ใส่ใน root layout เพียงครั้งเดียว
 */
export function GoogleAdSenseScript() {
    if (!ADS_ENABLED) return null;

    return (
        <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
        />
    );
}
