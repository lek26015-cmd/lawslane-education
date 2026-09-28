'use client';

import { useState } from 'react';
import { isPlaceholderCover } from '@/lib/cover';

/**
 * ปกแบรนด์ Lawslane (พื้นกรมท่า + โลโก้ + ชื่อเรื่อง) — ใช้แทนเมื่อไม่มีปก, ปกเป็นภาพตัวอย่าง
 * (placehold.co / unsplash) หรือโหลดภาพไม่ขึ้น จะได้ไม่เหลือกล่องเทาว่างหรือภาพสต็อกที่ดูเป็นม็อคอัพ
 */
export function BrandCover({ title, label, className = '' }: { title?: string; label?: string; className?: string }) {
    return (
        <div
            className={`relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-br from-[#0B3979] via-[#0d4a94] to-[#082a5a] p-5 text-center ${className}`}
        >
            <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
            <div aria-hidden className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-white/5" />
            <img src="/images/logo-lawslane-transparent-white.png" alt="" className="relative h-10 w-auto object-contain opacity-90" />
            {title && (
                <p className="relative line-clamp-3 max-w-[90%] text-sm font-bold leading-snug text-white md:text-base">{title}</p>
            )}
            {label && (
                <span className="relative text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-100/70">{label}</span>
            )}
        </div>
    );
}

/** <img> ที่ตกไปใช้ BrandCover เองเมื่อไม่มีปก/เป็นภาพตัวอย่าง/โหลดไม่ขึ้น */
export function CoverImage({
    src,
    alt,
    label,
    className = '',
}: {
    src?: string | null;
    alt: string;
    label?: string;
    className?: string;
}) {
    const [failed, setFailed] = useState(false);
    if (failed || isPlaceholderCover(src)) return <BrandCover title={alt} label={label} />;
    return <img src={src!} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`h-full w-full object-cover ${className}`} />;
}
