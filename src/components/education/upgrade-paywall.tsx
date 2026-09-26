'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, Zap, BookOpen, Brain, BarChart3, Shield, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradePaywallProps {
    used: number;
    dailyLimit: number;
    /** Context: where is the paywall shown */
    context?: 'exam' | 'answer' | 'general';
}

/**
 * Paywall แสดงเมื่อผู้ใช้ Free ทำข้อสอบครบ limit
 */
export function UpgradePaywall({ used, dailyLimit, context = 'exam' }: UpgradePaywallProps) {
    const contextMessages = {
        exam: 'คุณใช้สิทธิ์ทำข้อสอบครบ',
        answer: 'การดูเฉลยเพิ่มเติม',
        general: 'ฟีเจอร์นี้',
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                <div className="relative overflow-hidden rounded-2xl border border-blue-200/60 bg-white shadow-2xl">
                    {/* Premium gradient top */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-blue-500 to-[#0B3979]" />

                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />

                    <div className="relative p-8 sm:p-10">
                        {/* Crown icon */}
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-100 shadow-lg shadow-blue-100/50">
                            <Crown className="h-10 w-10 text-[#0B3979]" />
                        </div>

                        {/* Limit info */}
                        <div className="text-center mb-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm text-[#082a5a] font-medium mb-4">
                                <Clock className="w-4 h-4" />
                                {contextMessages[context]} {used}/{dailyLimit} ครั้งวันนี้
                            </div>
                        </div>

                        <h2 className="text-center text-2xl font-bold text-slate-900 mb-2">
                            อัพเกรดเป็น Premium
                        </h2>
                        <p className="text-center text-slate-500 mb-8 leading-relaxed">
                            ปลดล็อกข้อสอบไม่จำกัด พร้อม AI ตรวจอัตนัย<br />
                            เริ่มต้นเพียง <span className="text-[#0B3979] font-bold">฿199/เดือน</span>
                        </p>

                        {/* Benefits */}
                        <div className="space-y-3 mb-8">
                            {[
                                { icon: Zap, text: 'ทำข้อสอบได้ไม่จำกัด ทุกวัน', color: 'text-blue-500', bg: 'bg-blue-50' },
                                { icon: BookOpen, text: 'ดูเฉลยทุกข้อ ทุกชุด พร้อมคำอธิบาย', color: 'text-[#0B3979]', bg: 'bg-blue-50' },
                                { icon: Brain, text: 'AI ตรวจอัตนัย ให้คะแนนและคำแนะนำ', color: 'text-blue-500', bg: 'bg-blue-50' },
                                { icon: BarChart3, text: 'Dashboard สถิติการเรียนรู้', color: 'text-[#082a5a]', bg: 'bg-blue-50/70' },
                                { icon: Shield, text: 'ไม่มีโฆษณารบกวน', color: 'text-blue-800', bg: 'bg-slate-50' },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.08 }}
                                    className={`flex items-center gap-3 p-3 rounded-xl ${item.bg}`}
                                >
                                    <item.icon className={`h-5 w-5 ${item.color} shrink-0`} />
                                    <span className="text-sm text-slate-700 font-medium">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA buttons */}
                        <div className="space-y-3">
                            <Link href="/pricing" className="block">
                                <Button
                                    className="w-full h-13 bg-gradient-to-r from-blue-500 to-[#0B3979] hover:from-[#0B3979] hover:to-[#082a5a] text-white font-bold text-base shadow-lg shadow-blue-200/50 transition-all hover:shadow-xl hover:shadow-blue-300/50 rounded-xl"
                                >
                                    <Crown className="mr-2 h-5 w-5" />
                                    ดูแพ็กเกจ Premium
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/exams" className="block">
                                <Button
                                    variant="outline"
                                    className="w-full h-12 border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-sm rounded-xl"
                                >
                                    กลับไปคลังข้อสอบ
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Bottom note */}
                    <div className="border-t border-blue-100 bg-blue-50/30 px-8 py-4">
                        <p className="text-center text-xs text-slate-400">
                            สิทธิ์ทำข้อสอบฟรีจะรีเซ็ตทุกวัน เที่ยงคืน • ยกเลิกได้ทุกเมื่อ
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

/**
 * Banner เล็กๆ แสดงด้านบนหน้าข้อสอบ ว่าเหลือกี่ครั้ง
 */
export function ExamLimitBanner({ used, dailyLimit, isPremium }: {
    used: number;
    dailyLimit: number;
    isPremium: boolean;
}) {
    if (isPremium) return null;

    const remaining = dailyLimit - used;
    const isLow = remaining <= 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm ${isLow
                    ? 'bg-blue-50 border border-blue-300 text-blue-800'
                    : 'bg-blue-50 border border-blue-200 text-[#082a5a]'
                }`}
        >
            <div className="flex items-center gap-2">
                {isLow ? <Clock className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                <span>
                    {remaining > 0
                        ? `เหลือสิทธิ์ทำข้อสอบอีก ${remaining} ชุดวันนี้`
                        : 'ใช้สิทธิ์ทำข้อสอบครบแล้ววันนี้'
                    }
                </span>
            </div>
            {isLow && (
                <Link href="/pricing">
                    <Button size="sm" variant="ghost" className="text-[#0B3979] hover:text-[#082a5a] hover:bg-blue-100 text-xs h-7 px-3">
                        <Crown className="w-3 h-3 mr-1" />
                        อัพเกรด
                    </Button>
                </Link>
            )}
        </motion.div>
    );
}
