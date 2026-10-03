'use client';

import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';
import { useMyExamStatus } from '@/hooks/use-my-exam-status';
import type { MyExamStatus } from '@/app/api/education/my-exam-status/route';

/**
 * ป้าย "ทำแล้ว / ยังไม่เคยทำ" ของชุดข้อสอบ — แสดงเฉพาะผู้ใช้ที่ล็อกอินแล้ว
 * หน้ารายการส่ง status มาเอง (โหลดครั้งเดียวทั้งหน้า) หน้ารายละเอียดให้ component โหลดเอง
 */
export function ExamDoneBadge({ examId, status: map, showResultLink = false }: {
    examId: string;
    status: MyExamStatus | null;
    showResultLink?: boolean;
}) {
    if (!map) return null;

    const done = map[examId];
    if (!done) {
        return (
            <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs border bg-white text-slate-500 border-slate-200">
                <Circle className="w-3.5 h-3.5" />
                ยังไม่เคยทำ
            </span>
        );
    }

    return (
        <span className="inline-flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium border bg-green-50 text-green-700 border-green-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ทำแล้ว{done.attempts > 1 ? ` ${done.attempts} ครั้ง` : ''} · คะแนนสูงสุด {done.bestScore}
            </span>
            {showResultLink && (
                <Link href={`/exams/${examId}/result?attemptId=${done.lastAttemptId}`} className="text-xs text-[#0B3979] underline">
                    ดูผลครั้งล่าสุด
                </Link>
            )}
        </span>
    );
}

/** สำหรับหน้าที่มีข้อสอบชุดเดียว — โหลดสถานะเอง */
export function MyExamDoneBadge({ examId }: { examId: string }) {
    const status = useMyExamStatus();
    return <ExamDoneBadge examId={examId} status={status} showResultLink />;
}
