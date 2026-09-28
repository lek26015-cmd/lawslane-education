'use client';

import Link from 'next/link';
import { BookOpen, Crown, Sparkles, Check, X, CalendarClock, ArrowRight } from 'lucide-react';
import { usePlan, type EntitlementResponse, type PlanId } from '@/context/plan-context';

// หน้าตาแยกตามแพ็กเกจ — ให้ดูออกทันทีว่าตอนนี้อยู่แพ็กเกจไหน
const PLAN_STYLES: Record<PlanId, {
    icon: typeof BookOpen;
    tagline: string;
    frame: string;
    iconBox: string;
    title: string;
    muted: string;
    chip: string;
    bar: string;
    track: string;
    divider: string;
    cta: string;
}> = {
    free: {
        icon: BookOpen,
        tagline: 'เริ่มต้นฟรี',
        frame: 'bg-white border-2 border-slate-200',
        iconBox: 'bg-slate-100 text-slate-600',
        title: 'text-slate-900',
        muted: 'text-slate-500',
        chip: 'bg-slate-100 text-slate-600 border border-slate-200',
        bar: 'bg-[#0B3979]',
        track: 'bg-slate-100',
        divider: 'border-slate-100',
        cta: 'bg-[#0B3979] hover:bg-[#082a5a] text-white',
    },
    premium: {
        icon: Crown,
        tagline: 'สำหรับคนจริงจัง',
        frame: 'bg-gradient-to-br from-blue-50 via-white to-white border-2 border-blue-300 shadow-blue-100',
        iconBox: 'bg-blue-500 text-white',
        title: 'text-[#0B3979]',
        muted: 'text-slate-500',
        chip: 'bg-blue-100 text-[#0B3979] border border-blue-200',
        bar: 'bg-blue-500',
        track: 'bg-blue-100',
        divider: 'border-blue-100',
        cta: 'bg-white hover:bg-blue-50 text-[#0B3979] border border-blue-200',
    },
    pro: {
        icon: Sparkles,
        tagline: 'เตรียมสอบเต็มที่',
        frame: 'bg-gradient-to-br from-[#0B3979] via-[#082a5a] to-slate-900 border-2 border-amber-300/70 shadow-blue-900/30',
        iconBox: 'bg-amber-400 text-[#082a5a]',
        title: 'text-white',
        muted: 'text-blue-100/80',
        chip: 'bg-amber-400/15 text-amber-200 border border-amber-300/40',
        bar: 'bg-amber-400',
        track: 'bg-white/15',
        divider: 'border-white/10',
        cta: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    },
};

function formatThaiDate(iso: string) {
    return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * กรอบสถานะแพ็กเกจของผู้ใช้ — แพ็กเกจ, วันหมดอายุ, โควตาข้อสอบวันนี้ และสิทธิ์ที่ได้
 * ค่าทั้งหมดมาจาก server (/api/education/entitlement) ตัวเดียวกับที่ใช้ตัดสินสิทธิ์จริง
 */
export function PlanStatusCard({ className = '' }: { className?: string }) {
    const { data, loading } = usePlan();
    return <PlanStatusView data={data} loading={loading} className={className} />;
}

export function PlanStatusView({ data, loading = false, className = '' }: {
    data: EntitlementResponse | null;
    loading?: boolean;
    className?: string;
}) {
    const planId: PlanId = data?.planId ?? 'free';
    const planName = data?.planName ?? 'Free';
    const expiresAt = data?.expiresAt ?? null;

    if (loading && !data) {
        return <div className={`h-40 rounded-2xl border-2 border-slate-100 bg-white animate-pulse ${className}`} />;
    }

    const style = PLAN_STYLES[planId];
    const Icon = style.icon;
    const ent = data?.entitlements;
    // limit null = ไม่จำกัด (ห้ามใช้ ?? ต่อท้าย ไม่งั้นแพ็กเกจไม่จำกัดจะกลายเป็น 3 ชุด)
    const limit: number | null = data ? data.usage.limit : 3;
    const used = data?.usage.used ?? 0;
    const unlimited = limit === null;
    const percent = limit ? Math.min(100, (used / limit) * 100) : 0;

    const perks: { label: string; on: boolean }[] = [
        { label: unlimited ? 'ทำข้อสอบไม่จำกัด' : `ทำข้อสอบ ${limit} ชุด/วัน`, on: true },
        { label: 'AI ตรวจข้อเขียน', on: ent?.aiGrading ?? false },
        { label: 'AI วิเคราะห์จุดอ่อน', on: ent?.weaknessAnalysis ?? false },
        { label: 'ไม่มีโฆษณา', on: ent?.adFree ?? false },
    ];

    return (
        <div className={`relative overflow-hidden rounded-2xl shadow-sm ${style.frame} ${className}`}>
            <div className="grid gap-6 p-6 md:grid-cols-[1.1fr_1fr_1.3fr] md:items-center">
                {/* แพ็กเกจ */}
                <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center shadow-sm ${style.iconBox}`}>
                        <Icon className="h-7 w-7" />
                    </div>
                    <div className="min-w-0">
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.chip}`}>
                            แพ็กเกจปัจจุบัน
                        </span>
                        <h3 className={`mt-1 text-2xl font-extrabold leading-tight ${style.title}`}>{planName}</h3>
                        <p className={`text-xs ${style.muted}`}>
                            {planId === 'free' ? (
                                style.tagline
                            ) : (
                                <span className="inline-flex items-center gap-1">
                                    <CalendarClock className="h-3.5 w-3.5" />
                                    {expiresAt ? `ใช้ได้ถึง ${formatThaiDate(expiresAt)}` : 'ไม่มีวันหมดอายุ'}
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* โควตาวันนี้ */}
                <div className={`md:border-l md:pl-6 ${style.divider}`}>
                    <p className={`text-xs font-medium ${style.muted}`}>ทำข้อสอบวันนี้</p>
                    <p className={`mt-1 text-2xl font-bold ${style.title}`}>
                        {used}
                        <span className={`text-base font-medium ${style.muted}`}>
                            {unlimited ? ' ชุด · ไม่จำกัด' : ` / ${limit} ชุด`}
                        </span>
                    </p>
                    {!unlimited && (
                        <div className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${style.track}`}>
                            <div className={`h-full rounded-full transition-all ${style.bar}`} style={{ width: `${percent}%` }} />
                        </div>
                    )}
                    <p className={`mt-1 text-[11px] ${style.muted}`}>รีเซ็ตทุกเที่ยงคืน (เวลาไทย)</p>
                </div>

                {/* สิทธิ์ที่ได้ */}
                <div className={`md:border-l md:pl-6 ${style.divider}`}>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                        {perks.map((perk) => (
                            <li key={perk.label} className="flex items-center gap-2 text-sm">
                                {perk.on ? (
                                    <Check className={`h-4 w-4 shrink-0 ${planId === 'pro' ? 'text-amber-300' : 'text-emerald-500'}`} />
                                ) : (
                                    <X className={`h-4 w-4 shrink-0 ${planId === 'pro' ? 'text-white/30' : 'text-slate-300'}`} />
                                )}
                                <span className={perk.on ? style.title : `${style.muted} line-through decoration-1`}>{perk.label}</span>
                            </li>
                        ))}
                    </ul>
                    <Link
                        href="/pricing"
                        className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${style.cta}`}
                    >
                        {planId === 'free' ? 'อัปเกรดแพ็กเกจ' : 'เปรียบเทียบแพ็กเกจ'}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
