
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlayCircle, Lock, AlertTriangle, Clock, Monitor, BookX, CheckCircle2, Shield, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { useUser } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface StartExamButtonProps {
    examId: string;
    totalQuestions?: number;
    timeLimit?: number;
    passingScore?: number;
}

export function StartExamButton({ examId, totalQuestions, timeLimit, passingScore }: StartExamButtonProps) {
    const { user, isUserLoading } = useUser();
    const pathname = usePathname();
    const router = useRouter();
    const [showRules, setShowRules] = useState(false);
    const [agreed, setAgreed] = useState(false);

    if (isUserLoading) {
        return (
            <Button size="lg" className="h-14 px-8 text-lg bg-slate-200 text-slate-400" disabled>
                กำลังตรวจสอบสิทธิ์...
            </Button>
        );
    }

    if (!user) {
        return (
            <Link href={`/login?redirect=${pathname}`}>
                <Button size="lg" className="h-14 px-8 text-lg bg-slate-800 hover:bg-slate-900 shadow-md">
                    <Lock className="mr-2 w-5 h-5" />
                    เข้าสู่ระบบเพื่อเริ่มทำข้อสอบ
                </Button>
            </Link>
        );
    }

    const handleStartExam = () => {
        router.push(`/exams/${examId}/take`);
    };

    return (
        <>
            <Button
                size="lg"
                className="h-14 px-8 text-lg bg-gradient-to-r from-[#0B3979] to-[#0B3979] hover:from-[#082a5a] hover:to-[#082a5a] shadow-lg shadow-blue-200"
                onClick={() => {
                    setAgreed(false);
                    setShowRules(true);
                }}
            >
                <PlayCircle className="mr-2 w-6 h-6" />
                เริ่มทำข้อสอบทันที
            </Button>

            {/* Rules & Guidelines Modal */}
            <Dialog open={showRules} onOpenChange={setShowRules}>
                <DialogContent className="max-w-md sm:max-w-lg p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-slate-900">
                            กฎระเบียบการทำข้อสอบ
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 text-sm">
                            กรุณาอ่านข้อกำหนดให้ครบถ้วนก่อนเริ่มทำข้อสอบ
                        </DialogDescription>
                    </DialogHeader>

                    {/* Quick Stats */}
                    {(totalQuestions || timeLimit || passingScore) && (
                        <div className="flex gap-3 mt-2">
                            {totalQuestions && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center flex-1">
                                    <div className="text-lg font-bold text-slate-800">{totalQuestions}</div>
                                    <div className="text-[11px] text-slate-400">ข้อ</div>
                                </div>
                            )}
                            {timeLimit && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center flex-1">
                                    <div className="text-lg font-bold text-slate-800">{timeLimit}</div>
                                    <div className="text-[11px] text-slate-400">นาที</div>
                                </div>
                            )}
                            {passingScore && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center flex-1">
                                    <div className="text-lg font-bold text-slate-800">{passingScore}%</div>
                                    <div className="text-[11px] text-slate-400">ผ่าน</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rules — simple list */}
                    <ul className="space-y-3 mt-4 text-sm text-slate-600">
                        <li className="flex items-start gap-2.5">
                            <span className="text-slate-400 font-medium mt-px">1.</span>
                            <span>ระบบจะเริ่มจับเวลาทันทีเมื่อกดเริ่มทำข้อสอบ เมื่อหมดเวลาระบบจะส่งคำตอบโดยอัตโนมัติ</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="text-slate-400 font-medium mt-px">2.</span>
                            <span>แนะนำให้ใช้คอมพิวเตอร์หรือแท็บเล็ต และตรวจสอบอินเทอร์เน็ตให้เสถียรก่อนเริ่ม</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="text-slate-400 font-medium mt-px">3.</span>
                            <span>ห้ามเปิดตำราหรือค้นหาข้อมูลระหว่างสอบ เพื่อประโยชน์ในการวัดผลความรู้ของตนเอง</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="text-slate-400 font-medium mt-px">4.</span>
                            <span>หากปิดหน้าต่างหรือเปลี่ยนหน้า ระบบจะบันทึกเวลาต่อเนื่อง ไม่สามารถหยุดเวลาได้</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="text-slate-400 font-medium mt-px">5.</span>
                            <span>เมื่อส่งคำตอบแล้ว ระบบจะแสดงผลคะแนนและเฉลยละเอียดทุกข้อทันที</span>
                        </li>
                    </ul>

                    {/* Agreement checkbox */}
                    <label className="flex items-center gap-3 mt-4 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-[#0B3979] focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600">
                            ข้าพเจ้ายอมรับกฎระเบียบการทำข้อสอบทั้งหมดแล้ว
                        </span>
                    </label>

                    {/* Action buttons */}
                    <div className="flex gap-3 mt-5">
                        <Button
                            variant="outline"
                            className="flex-1 h-11"
                            onClick={() => setShowRules(false)}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            className="flex-1 h-11 bg-[#082a5a] hover:bg-[#0a3d5c] text-white disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={!agreed}
                            onClick={handleStartExam}
                        >
                            เริ่มทำข้อสอบ
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
