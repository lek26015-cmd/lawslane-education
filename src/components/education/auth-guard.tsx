'use client';

import React from 'react';
import Link from 'next/link';
import { useUser } from '@/firebase/provider';
import { motion } from 'framer-motion';
import { Lock, LogIn, UserPlus, Loader2, Scale, BookOpen, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthGuardProps {
    children: React.ReactNode;
    /** Custom message to show when not authenticated */
    message?: string;
    /** The path to redirect to after login (defaults to current page) */
    returnTo?: string;
}

/**
 * AuthGuard wraps protected content.
 * Shows a premium login prompt when user is not authenticated.
 */
export function AuthGuard({ children, message, returnTo }: AuthGuardProps) {
    const { user, isUserLoading } = useUser();

    // Loading state
    if (isUserLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    <p className="text-sm text-slate-500">กำลังตรวจสอบสิทธิ์...</p>
                </div>
            </div>
        );
    }

    // Not authenticated — show login prompt
    if (!user) {
        const loginHref = returnTo ? `/login?redirect=${encodeURIComponent(returnTo)}` : '/login';

        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl">
                        {/* Top decorative gradient */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-sky-500 to-sky-400" />

                        <div className="p-8 sm:p-10">
                            {/* Icon */}
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-sky-100">
                                <Lock className="h-8 w-8 text-sky-600" />
                            </div>

                            {/* Title */}
                            <h2 className="text-center text-2xl font-bold text-slate-900 mb-2">
                                เฉพาะสมาชิกเท่านั้น
                            </h2>
                            <p className="text-center text-slate-500 mb-8 leading-relaxed">
                                {message || 'กรุณาเข้าสู่ระบบหรือสมัครสมาชิกเพื่อเข้าถึงเนื้อหานี้'}
                            </p>

                            {/* Benefits */}
                            <div className="space-y-3 mb-8">
                                {[
                                    { icon: BookOpen, text: 'เข้าถึงคลังข้อสอบทนายความ', color: 'text-blue-500' },
                                    { icon: ShieldCheck, text: 'ดูเฉลยพร้อมธงคำตอบ', color: 'text-emerald-500' },
                                    { icon: Scale, text: 'ฝึกสอบจำลองเสมือนจริง', color: 'text-sky-500' },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80"
                                    >
                                        <item.icon className={`h-5 w-5 ${item.color} shrink-0`} />
                                        <span className="text-sm text-slate-700">{item.text}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Action buttons */}
                            <div className="space-y-3">
                                <Link href={loginHref} className="block">
                                    <Button
                                        className="w-full h-12 bg-gradient-to-r from-sky-600 to-sky-600 hover:from-sky-700 hover:to-sky-700 text-white font-semibold text-base shadow-lg shadow-sky-200/50 transition-all hover:shadow-xl hover:shadow-sky-300/50"
                                    >
                                        <LogIn className="mr-2 h-5 w-5" />
                                        เข้าสู่ระบบ
                                    </Button>
                                </Link>
                                <Link href="/signup" className="block">
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-base"
                                    >
                                        <UserPlus className="mr-2 h-5 w-5" />
                                        สมัครสมาชิกฟรี
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Bottom note */}
                        <div className="border-t border-slate-100 bg-slate-50/50 px-8 py-4">
                            <p className="text-center text-xs text-slate-400">
                                สมัครสมาชิกฟรี ไม่มีค่าใช้จ่าย
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Authenticated — render children
    return <>{children}</>;
}
