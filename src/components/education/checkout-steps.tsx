import { Check } from 'lucide-react';

/**
 * แถบขั้นตอนการสั่งซื้อ — ทำตาม mockup Ui-Lawslane2/lawslane_checkout
 *
 * ชื่อขั้นตอนเขียนตามที่ระบบทำจริง: ชำระเงินด้วยการโอนแล้วแนบสลิป ซึ่งต้องรอ
 * แอดมินตรวจก่อนถึงจะได้สิทธิ์ ไม่ใช่ "เริ่มเรียนทันที" อย่างใน mockup
 * ที่ออกแบบไว้บนสมมติฐานว่าตัดบัตรผ่าน Stripe
 */

const STEPS = [
    { label: 'เลือกสินค้า' },
    { label: 'ตรวจสอบข้อมูล & แนบสลิป' },
    { label: 'รอยืนยันการชำระเงิน' },
] as const;

export function CheckoutSteps({ current = 1 }: { current?: 0 | 1 | 2 }) {
    return (
        <ol className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
            {STEPS.map((step, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <li key={step.label} className="flex flex-1 items-center gap-2">
                        <span
                            className={[
                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                                done
                                    ? 'bg-[#0B3979] text-white'
                                    : active
                                        ? 'bg-[#0B3979] text-white ring-4 ring-blue-100'
                                        : 'bg-slate-100 text-slate-400',
                            ].join(' ')}
                        >
                            {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                        </span>
                        <span
                            className={[
                                'text-sm',
                                active ? 'font-semibold text-slate-900' : done ? 'text-slate-600' : 'text-slate-400',
                            ].join(' ')}
                        >
                            {step.label}
                        </span>
                        {i < STEPS.length - 1 && (
                            <span
                                aria-hidden
                                className={`ml-2 hidden h-px flex-1 sm:block ${done ? 'bg-blue-300' : 'bg-slate-200'}`}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
