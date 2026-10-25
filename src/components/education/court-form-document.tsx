'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import emblem from '@/pic/National Emblem of Thailand.jpg';
import type { CourtForm, CourtFormBlock, CourtFormDoc } from '@/lib/court-form';

/**
 * แบบพิมพ์ศาลขนาด A4 สำหรับธงคำตอบ — หลักเดียวกับใบแต่งทนายความของ Lawslane (Lawlanes#79)
 *
 * หน้ากระดาษกว้าง A4 คงที่เสมอ จอแคบกว่าใช้ย่อทั้งหน้า (scale) แทนการจัดบรรทัดใหม่
 * มือถือกับคอมจึงตัดบรรทัดตรงกันทุกบรรทัด · ฟอนต์ TH Sarabun New 16pt (@font-face ใน globals.css)
 * หัวเรื่องใช้ฟอนต์เดียวกับเนื้อความ ไม่ใช้ฟอนต์หัวเรื่องของเว็บ
 * ไม่มีหัว/ท้ายกระดาษใด ๆ — มีแต่ตัวแบบพิมพ์
 */

/** 210mm × 297mm ที่ 96dpi */
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
/** ระยะบรรทัดเส้นประของแบบพิมพ์ */
const RULE_PX = 38;

/** เส้นจุดไข่ปลาท้ายทุกบรรทัด — ใช้เป็นพื้นหลังจึงไหลตามจำนวนบรรทัดที่ข้อความตัดจริง */
const DOTTED_ROW = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='${RULE_PX}'%3E%3Crect x='0' y='${RULE_PX - 7}' width='1.3' height='1.3' fill='%23000'/%3E%3C/svg%3E")`;

const ruledStyle: React.CSSProperties = {
    lineHeight: `${RULE_PX}px`,
    backgroundImage: DOTTED_ROW,
    backgroundSize: `4px ${RULE_PX}px`,
};

/** ค่าในช่องหัวแบบ — เขียนอยู่บนเส้นจุด */
function Field({ value, className = '' }: { value?: string; className?: string }) {
    return (
        <span className={`inline-block border-b border-dotted border-black text-center align-baseline leading-[1.4] ${className}`}>
            {value?.trim() || ' '}
        </span>
    );
}

/**
 * ขีดฆ่าคำในข้อความ — ใช้กับตัวเลือกที่พิมพ์มากับแบบ เช่น "คำร้อง/คำแถลง/คำขอ", "ผู้ร้อง/ผู้แถลง/ผู้ขอ"
 * ขีดเฉพาะคำในกลุ่มตัวเลือกที่คั่นด้วย "/" กลุ่มแรก (ไม่ไปขีดคำเดียวกันในเนื้อความ)
 * ถ้าไม่มีกลุ่มแบบนั้นจึงขีดคำแรกที่พบ
 */
function Strike({ text, struck }: { text: string; struck?: string[] }) {
    if (!struck?.length) return <>{text}</>;
    const found = /[^\s/]+(?:\s*\/\s*[^\s/]+)+/.exec(text);
    const group = found && struck.some(w => found[0].includes(w)) ? found : null;
    const [start, end] = group ? [group.index, group.index + group[0].length] : [0, text.length];
    const segment = text.slice(start, end);
    const words = [...struck].sort((a, b) => b.length - a.length).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const re = new RegExp(`(${words.join('|')})`, 'g');
    const used = new Set<string>();
    const parts = segment.split(re).map((p, i) => {
        if (struck.includes(p) && (group || !used.has(p))) {
            used.add(p);
            return <s key={i} className="decoration-1">{p}</s>;
        }
        return <React.Fragment key={i}>{p}</React.Fragment>;
    });
    return <>{text.slice(0, start)}{parts}{text.slice(end)}</>;
}

function Title({ doc }: { doc: CourtFormDoc }) {
    return (
        <h2 className="text-[16pt] font-normal leading-[1.35]">
            <Strike text={doc.title} struck={doc.struck} />
        </h2>
    );
}

function Brace() {
    return (
        <svg viewBox="0 0 12 100" preserveAspectRatio="none" className="h-full w-3 shrink-0" aria-hidden>
            <path d="M11 1 C5 1 6 8 6 20 L6 42 C6 48 4 50 1 50 C4 50 6 52 6 58 L6 80 C6 92 5 99 11 99"
                fill="none" stroke="black" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
    );
}

function DocHeader({ doc }: { doc: CourtFormDoc }) {
    const h = doc.header;
    return (
        <>
            <div className="relative" style={{ minHeight: doc.emblem ? 150 : undefined }}>
                <div className="absolute left-0 top-6 max-w-[230px]">
                    {doc.formNo && <p className="leading-[1.35]">({doc.formNo})</p>}
                    <Title doc={doc} />
                    {doc.subtitle && <p className="leading-[1.35]">{doc.subtitle}</p>}
                </div>
                {doc.emblem && (
                    <Image src={emblem} alt="ตราครุฑ" className="mx-auto h-[113px] w-auto" priority />
                )}
                {h && (
                    <div className="absolute right-0 top-[104px] w-[290px] space-y-0.5 leading-[1.4]">
                        <p className="flex items-end gap-1">คดีหมายเลขดำที่ <Field value={h.blackCase} className="flex-1" /></p>
                        <p className="flex items-end gap-1">คดีหมายเลขแดงที่ <Field value={h.redCase} className="flex-1" /></p>
                    </div>
                )}
            </div>
            {h && (
                <div className="ml-auto mt-8 w-[420px] space-y-1 leading-[1.4]">
                    <p className="flex items-end gap-1 pl-[60px]">ศาล <Field value={h.court} className="flex-1" /></p>
                    <p className="flex items-end gap-1">
                        วันที่ <Field value={h.day} className="w-[48px]" />
                        เดือน <Field value={h.month} className="flex-1" />
                        พุทธศักราช <Field value={h.year} className="w-[70px]" />
                    </p>
                    <p className="flex items-end gap-1 pl-[60px]">ความ <Field value={h.matter} className="flex-1" /></p>
                </div>
            )}
            {doc.parties && doc.parties.length > 0 && (
                <div className="mt-5 flex items-stretch gap-2">
                    <span className="self-center pr-1">ระหว่าง</span>
                    <Brace />
                    <div className="flex flex-1 flex-col justify-between gap-6 py-1">
                        {doc.parties.map((p, i) => (
                            <div key={i} className="flex items-end gap-2">
                                <span className="flex-1" style={ruledStyle}>{p.name}</span>
                                <span className="shrink-0 leading-[38px]">{p.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

function Block({ b }: { b: CourtFormBlock }) {
    switch (b.t) {
        case 'ruled':
            return <p className={`text-justify ${b.indent ? 'indent-[96px]' : ''}`} style={ruledStyle}><Strike text={b.text} struck={b.struck} /></p>;
        case 'text':
            return (
                <p className={[
                    'leading-[38px]',
                    b.align === 'center' ? 'text-center' : b.align === 'right' ? 'text-right' : '',
                    b.indent ? 'indent-[96px]' : '',
                    b.bold ? 'font-bold' : '',
                ].join(' ')}><Strike text={b.text} struck={b.struck} /></p>
            );
        case 'heading':
            return (
                <h3 className={`mt-4 mb-1 text-center text-[16pt] font-bold leading-[38px] ${b.underline ? 'underline underline-offset-4' : ''}`}>
                    {b.text}
                </h3>
            );
        case 'sign':
            return (
                <p className="flex items-end justify-end gap-1 leading-[38px]">
                    {b.prefix && <span>{b.prefix}</span>}
                    <span className="inline-block min-w-[220px] border-b border-dotted border-black text-center leading-[1.4]">
                        {b.name?.trim() || ' '}
                    </span>
                    <span><Strike text={b.role} struck={b.struck} /></span>
                </p>
            );
        case 'note':
            return (
                <div className="mt-3 border-t border-black pt-1 leading-[1.5]">
                    <p><span className="underline underline-offset-4">{b.label ?? 'หมายเหตุ'}</span> {b.text}</p>
                </div>
            );
        case 'table':
            return (
                <table className="my-3 w-full border-collapse border border-black leading-[1.4]">
                    <thead>
                        <tr>{b.columns.map((c, i) => <th key={i} className="border border-black px-2 py-1 font-normal">{c}</th>)}</tr>
                    </thead>
                    <tbody>
                        {b.rows.map((r, i) => (
                            <tr key={i}>
                                {r.map((c, j) => (
                                    <td key={j} className={`border border-black px-2 py-2 align-top ${j === 0 || j === r.length - 1 ? 'text-center' : ''}`}>{c}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        case 'blank':
            return <div style={{ ...ruledStyle, height: b.lines * RULE_PX }} />;
        case 'rule':
            return <hr className="my-2 border-black" />;
        case 'pageBreak':
            return null;
    }
}

/** แยกบล็อกของเอกสารเป็นหน้า ตาม pageBreak ที่จัดไว้ตามภาพต้นฉบับ */
function splitPages(blocks: CourtFormBlock[]): CourtFormBlock[][] {
    const pages: CourtFormBlock[][] = [[]];
    for (const b of blocks) {
        if (b.t === 'pageBreak') pages.push([]);
        else pages[pages.length - 1].push(b);
    }
    return pages;
}

function Sheet({ children }: { children: React.ReactNode }) {
    return (
        <section
            className="court-form-page relative mx-auto bg-white text-black shadow-lg ring-1 ring-slate-200"
            style={{ width: A4_WIDTH_PX, minHeight: A4_HEIGHT_PX, padding: '48px 72px 64px 92px' }}
        >
            {children}
        </section>
    );
}

export function CourtFormDocument({ form }: { form: CourtForm }) {
    const outer = useRef<HTMLDivElement>(null);
    const inner = useRef<HTMLDivElement>(null);
    const [fit, setFit] = useState({ scale: 1, height: 0 });

    useLayoutEffect(() => {
        const o = outer.current, i = inner.current;
        if (!o || !i) return;
        const measure = () => {
            const scale = Math.min(1, o.clientWidth / A4_WIDTH_PX);
            setFit({ scale, height: i.offsetHeight * scale });
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(o);
        ro.observe(i);
        // ฟอนต์โหลดเสร็จทีหลัง ความสูงเปลี่ยน — ResizeObserver จับได้อยู่แล้ว แต่วัดซ้ำให้แน่
        document.fonts?.ready.then(measure);
        return () => ro.disconnect();
    }, []);

    return (
        // min-w-0: อยู่ใน grid/flex แล้วกล่องไม่ขยายตามหน้ากระดาษ 794px ไม่งั้นวัดความกว้างได้ผิดและไม่ย่อ
        <div ref={outer} className="w-full min-w-0 max-w-full overflow-hidden" style={{ height: fit.height || undefined }}>
            <div
                ref={inner}
                className="font-th-sarabun space-y-6 text-[16pt]"
                style={{
                    width: A4_WIDTH_PX,
                    transform: `scale(${fit.scale})`,
                    transformOrigin: 'top left',
                    marginLeft: fit.scale < 1 ? 0 : 'auto',
                    marginRight: fit.scale < 1 ? 0 : 'auto',
                }}
            >
                {form.docs.map((doc, di) =>
                    splitPages(doc.blocks).map((blocks, pi) => (
                        <Sheet key={`${di}-${pi}`}>
                            {pi === 0 && <DocHeader doc={doc} />}
                            <div className={pi === 0 ? 'mt-3' : ''}>
                                {blocks.map((b, bi) => <Block key={bi} b={b} />)}
                            </div>
                        </Sheet>
                    )),
                )}
            </div>
        </div>
    );
}
