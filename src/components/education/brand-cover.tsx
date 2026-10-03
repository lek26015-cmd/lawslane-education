'use client';

import { useState } from 'react';
import { isPlaceholderCover } from '@/lib/cover';
import { coverIllustrationOf, examCoverTheme, parseExamBook, type CoverIllustration } from '@/lib/book-cover';
import {
    BookOpen, Briefcase, Building2, FileSignature, Gavel, Globe2, HandCoins, HardHat, Home,
    Landmark, Library, Map, Receipt, Scale, ScrollText, Search, Shield, Users, type LucideIcon,
} from 'lucide-react';

const ILLUSTRATION_ICON: Record<CoverIllustration, LucideIcon> = {
    land: Map,
    family: Users,
    inheritance: ScrollText,
    company: Building2,
    insurance: Shield,
    money: HandCoins,
    tax: Receipt,
    labor: HardHat,
    globe: Globe2,
    investigation: Search,
    procedure: Briefcase,
    criminal: Gavel,
    court: Landmark,
    constitution: Landmark,
    philosophy: BookOpen,
    history: Library,
    ethics: Scale,
    contract: FileSignature,
    property: Home,
    scale: Scale,
};

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

const PATTERNS = [
    // วงกลมซ้อน
    'radial-gradient(circle at 85% 15%, rgba(255,255,255,.14) 0 22%, transparent 22.5%), radial-gradient(circle at 85% 15%, rgba(255,255,255,.08) 0 38%, transparent 38.5%)',
    // เส้นทแยง
    'repeating-linear-gradient(135deg, rgba(255,255,255,.07) 0 10px, transparent 10px 22px)',
    // ตาราง
    'linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)',
    // แถบตั้งฝั่งซ้าย (สันหนังสือ)
    'linear-gradient(90deg, rgba(0,0,0,.25) 0 10%, rgba(255,255,255,.12) 10% 11%, transparent 11%)',
];

/**
 * ปกหนังสือรวมข้อสอบ — วาดจากรหัสวิชา/ชื่อวิชา แทนภาพ template ที่เหมือนกันทุกเล่ม
 * สีตามชั้นปี (ปี 1 เขียว · ปี 2 น้ำเงิน · ปี 3 แดง · ปี 4 ม่วง) ลายต่างกันตามรหัสวิชา
 */
export function ExamBookCover({ title, description, isEbook = true, compact = false }: {
    title: string;
    description?: string;
    isEbook?: boolean;
    /** การ์ดเล็ก (หนังสือที่เกี่ยวข้อง) — ย่อตัวอักษร */
    compact?: boolean;
}) {
    const info = parseExamBook(title, description);
    const theme = examCoverTheme(info);
    const Illustration = ILLUSTRATION_ICON[coverIllustrationOf(info.subject)];

    return (
        <div
            className="relative flex h-full w-full flex-col overflow-hidden text-white"
            style={{
                backgroundColor: theme.from,
                backgroundImage: `${PATTERNS[theme.pattern]}, linear-gradient(160deg, ${theme.from}, ${theme.to})`,
                backgroundSize: theme.pattern === 2 ? '24px 24px, 24px 24px, auto' : undefined,
            }}
        >
            {/* ภาพประกอบตามหมวดวิชา — ตัวใหญ่จางๆ มุมขวาล่าง + วงกลมสีเน้น */}
            <div aria-hidden className={`absolute rounded-full ${compact ? '-bottom-6 -right-6 h-24 w-24' : '-bottom-10 -right-10 h-48 w-48'}`} style={{ backgroundColor: theme.accent, opacity: 0.18 }} />
            <Illustration aria-hidden strokeWidth={1.25} className={`absolute text-white/25 ${compact ? 'bottom-7 right-2 h-14 w-14' : 'bottom-14 right-4 h-28 w-28'}`} />
            {isEbook && (
                <div className={`absolute right-0 top-0 z-10 rounded-bl-xl bg-white font-black tracking-wider text-slate-900 ${compact ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-xs'}`}>
                    E-BOOK
                </div>
            )}
            <div className={`relative flex flex-1 flex-col ${compact ? 'gap-1 p-3' : 'gap-2 p-5'}`}>
                <span className={`font-semibold uppercase tracking-[0.2em] text-white/70 ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
                    รวมข้อสอบเก่า{info.year ? ` · ชั้นปี ${info.year}` : ''}
                </span>
                {info.code && (
                    <span className={`font-black leading-none tracking-tight ${compact ? 'text-xl' : 'text-4xl'}`} style={{ color: theme.accent }}>
                        {info.code}
                    </span>
                )}
                <span className={`line-clamp-4 font-bold leading-snug ${compact ? 'text-xs' : 'text-lg'}`}>
                    {info.subject}
                </span>
            </div>
            <div className={`relative flex items-end justify-between bg-black/20 ${compact ? 'px-3 py-2' : 'px-5 py-3'}`}>
                {info.sets ? (
                    <span className={compact ? 'text-[10px]' : 'text-sm'}>
                        <b className={compact ? 'text-sm' : 'text-2xl'}>{info.sets}</b> ชุด พร้อมธงคำตอบ
                    </span>
                ) : <span />}
                <img src="/images/logo-lawslane-transparent-white.png" alt="" className={`w-auto object-contain opacity-80 ${compact ? 'h-3' : 'h-5'}`} />
            </div>
        </div>
    );
}
