'use client';

import { useState } from 'react';
import { isPlaceholderCover } from '@/lib/cover';
import { bookIllustrationUrl, parseExamBook, SUBJECT_EN } from '@/lib/book-cover';
import { BookOpen, FileCheck2, Landmark, Scale } from 'lucide-react';

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

const YEAR_BG: Record<number, { from: string; to: string }> = {
    1: { from: '#0d5c46', to: '#06281f' },
    2: { from: '#0d3f8f', to: '#061a3d' },
    3: { from: '#8c1d2c', to: '#3a0a12' },
    4: { from: '#4b1f8f', to: '#1d0a3d' },
};

/**
 * ปกหนังสือรวมข้อสอบตามแบบที่ลูกค้าเลือก (2026-10-03): โลโก้ + รหัสวิชาตัวใหญ่ + ชื่อวิชา,
 * ริบบิ้นทองชื่อวิชาภาษาอังกฤษ + E-BOOK, ภาพตัวละคร 3D ประจำวิชา, แถบล่างจุดเด่น + จำนวนชุดสีทอง
 * ข้อความทั้งหมดวางด้วยโค้ด (AI เขียนภาษาไทยเพี้ยน) ใช้ container query ให้สัดส่วนเท่ากันทุกขนาดการ์ด
 */
export function ExamBookCover({ title, description, isEbook = true, compact = false }: {
    title: string;
    description?: string;
    isEbook?: boolean;
    /** การ์ดเล็ก (หนังสือที่เกี่ยวข้อง) — ซ่อนรายการจุดเด่น */
    compact?: boolean;
}) {
    const info = parseExamBook(title, description);
    const bg = YEAR_BG[info.year ?? 2] ?? YEAR_BG[2];
    const illustration = bookIllustrationUrl(info.code);
    const en = SUBJECT_EN[info.code] ?? 'LAW';
    const gold = 'linear-gradient(180deg, #f3d98b, #c99a3a)';

    return (
        <div
            className="@container relative h-full w-full overflow-hidden text-white"
            style={{ background: `linear-gradient(165deg, ${bg.from}, ${bg.to})` }}
        >
            {/* ภาพตัวละคร — ชิดล่าง จางเข้าพื้นด้านบน */}
            {illustration && (
                <img
                    src={illustration}
                    alt=""
                    loading="lazy"
                    className="absolute inset-x-0 bottom-[12%] w-full object-cover"
                    style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 22%, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 22%, black 85%, transparent 100%)' }}
                />
            )}

            {/* ริบบิ้นทอง */}
            <div
                className="absolute right-[5%] top-0 z-10 flex w-[19%] flex-col items-center gap-[0.6cqw] pb-[5cqw] pt-[3cqw] text-center text-[#2a1d05]"
                style={{ background: gold, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%)' }}
            >
                <Scale className="h-[6cqw] w-[6cqw]" strokeWidth={1.75} />
                <span className="text-[2.6cqw] font-bold leading-tight tracking-wide">{en}</span>
                {isEbook && <span className="mt-[0.5cqw] rounded-sm bg-[#2a1d05] px-[1.2cqw] py-[0.3cqw] text-[2.6cqw] font-black tracking-wider text-[#f3d98b]">E-BOOK</span>}
            </div>

            {/* หัวปก */}
            <div className="relative z-10 flex items-start gap-[3cqw] px-[7%] pt-[9%] pr-[27%]">
                <img src="/images/logo-lawslane-transparent-white.png" alt="" className="h-[15cqw] w-auto shrink-0 object-contain" />
                <div className="min-w-0">
                    {info.code && <div className="text-[10cqw] font-black leading-none tracking-tight">{info.code}</div>}
                    <div className="mt-[1.5cqw] line-clamp-2 text-[5cqw] font-bold leading-tight">{info.subject}</div>
                    <div className="mt-[2cqw] h-px w-full" style={{ background: gold }} />
                    <div className="mt-[1.5cqw] text-[3.4cqw] tracking-[0.15em] text-white/80">
                        รวมข้อสอบเก่า{info.year ? ` · ชั้นปี ${info.year}` : ''}
                    </div>
                </div>
            </div>

            {/* แถบล่าง */}
            <div
                className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-[3cqw] px-[6%] pb-[4%] pt-[10%]"
                style={{ background: `linear-gradient(to bottom, transparent, ${bg.to} 45%)` }}
            >
                {!compact ? (
                    <ul className="space-y-[1.6cqw] text-[3cqw] leading-tight text-white/90">
                        {[
                            { Icon: BookOpen, text: 'ข้อสอบเก่าย้อนหลังหลายปี' },
                            { Icon: FileCheck2, text: 'แนวข้อสอบพร้อมธงคำตอบ' },
                            { Icon: Landmark, text: info.year ? `เหมาะสำหรับนักศึกษานิติศาสตร์ ชั้นปี ${info.year}` : 'เหมาะสำหรับนักศึกษานิติศาสตร์' },
                        ].map(({ Icon, text }) => (
                            <li key={text} className="flex items-center gap-[2cqw]">
                                <span className="flex h-[6cqw] w-[6cqw] shrink-0 items-center justify-center rounded-full border border-[#f3d98b]/60">
                                    <Icon className="h-[3.4cqw] w-[3.4cqw] text-[#f3d98b]" />
                                </span>
                                {text}
                            </li>
                        ))}
                    </ul>
                ) : <span />}
                {info.sets ? (
                    <div className="shrink-0 text-center">
                        <div className="bg-clip-text text-[13cqw] font-black leading-none text-transparent" style={{ backgroundImage: gold }}>{info.sets}</div>
                        <div className="mx-auto my-[1cqw] h-px w-full" style={{ background: gold }} />
                        <div className="text-[3.6cqw] font-semibold">ชุดข้อสอบ</div>
                        <div className="text-[2.6cqw] text-blue-100/70">LawsLane</div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
