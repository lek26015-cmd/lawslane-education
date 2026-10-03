'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ImageIcon } from 'lucide-react';

export interface ExamPageImage {
    page: number;
    url: string;
}

/**
 * ภาพสแกนหน้าข้อสอบ/ธงคำตอบต้นฉบับ — ใช้กับข้อที่ต้องร่างเอกสารตามแบบพิมพ์ (คำฟ้อง บัญชีพยาน ฯลฯ)
 * ซึ่งข้อความล้วนรักษารูปแบบการจัดหน้าไว้ไม่ได้ ภาพถูกล้างหัว/ท้ายกระดาษออกตั้งแต่ตอนนำเข้า
 */
export function ExamPageImages({
    images,
    title,
    defaultOpen = false,
    tone = 'slate',
}: {
    images: ExamPageImage[];
    title: string;
    defaultOpen?: boolean;
    tone?: 'slate' | 'amber';
}) {
    const [open, setOpen] = useState(defaultOpen);
    if (!images?.length) return null;
    const border = tone === 'amber' ? 'border-amber-200' : 'border-slate-200';
    const text = tone === 'amber' ? 'text-amber-800' : 'text-slate-700';

    return (
        <div className={`rounded-xl border ${border} bg-white overflow-hidden`}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-medium ${text} hover:bg-slate-50`}
            >
                <span className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {title}
                    <span className="text-xs font-normal text-slate-400">({images.length} หน้า)</span>
                </span>
                {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {open && (
                <div className="space-y-3 px-3 pb-3 bg-slate-100/60">
                    {images.map(img => (
                        <a key={img.url} href={img.url} target="_blank" rel="noopener noreferrer" className="block pt-3">
                            {/* eslint-disable-next-line @next/next/no-img-element -- ภาพจาก R2 ขนาด A4 ไม่ต้องผ่าน next/image */}
                            <img
                                src={img.url}
                                alt={`หน้า ${img.page}`}
                                loading="lazy"
                                className="w-full h-auto bg-white shadow-sm rounded"
                            />
                        </a>
                    ))}
                    <p className="text-[11px] text-slate-400 text-center">แตะที่ภาพเพื่อเปิดขนาดเต็ม</p>
                </div>
            )}
        </div>
    );
}
