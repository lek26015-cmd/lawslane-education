'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Crown, Zap, BookOpen, Brain, BarChart3, Shield, Check, X,
    ArrowLeft, Star, Users, MessageCircle, Award, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const tiers = [
    {
        name: 'Free',
        subtitle: 'เริ่มต้นฟรี',
        price: 0,
        yearlyPrice: 0,
        icon: BookOpen,
        color: 'sky',
        gradient: 'from-slate-100 to-slate-50',
        borderColor: 'border-slate-200',
        buttonStyle: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
        badge: null,
        features: [
            { text: 'ทำข้อสอบ 3 ชุด/วัน', included: true },
            { text: 'ดูเฉลยข้อสอบที่ทำแล้ว', included: true },
            { text: 'อ่านบทความทั้งหมด', included: true },
            { text: 'ค้นหากฎหมายเปิด', included: true },
            { text: 'ทำข้อสอบไม่จำกัด', included: false },
            { text: 'AI ตรวจอัตนัย', included: false },
            { text: 'Dashboard สถิติ', included: false },
            { text: 'ปิดโฆษณา', included: false },
            { text: 'คอร์สเรียนฟรี', included: false },
            { text: 'กลุ่ม LINE VIP', included: false },
        ],
    },
    {
        name: 'Premium',
        subtitle: 'สำหรับคนจริงจัง',
        price: 199,
        yearlyPrice: 1490,
        icon: Crown,
        color: 'sky',
        gradient: 'from-sky-50 to-blue-50',
        borderColor: 'border-sky-300',
        buttonStyle: 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg shadow-sky-200/50',
        badge: 'แนะนำ',
        features: [
            { text: 'ทำข้อสอบไม่จำกัด ทุกวัน', included: true },
            { text: 'ดูเฉลยทุกข้อ ทุกชุด', included: true },
            { text: 'อ่านบทความทั้งหมด', included: true },
            { text: 'ค้นหากฎหมายเปิด + Bookmark', included: true },
            { text: 'AI ตรวจอัตนัย', included: true },
            { text: 'Dashboard สถิติการเรียน', included: true },
            { text: 'ปิดโฆษณาทั้งหมด', included: true },
            { text: 'ส่วนลดหนังสือ 10%', included: true },
            { text: 'คอร์สเรียนฟรี', included: false },
            { text: 'กลุ่ม LINE VIP', included: false },
        ],
    },
    {
        name: 'Pro',
        subtitle: 'เตรียมสอบเต็มที่',
        price: 399,
        yearlyPrice: 2990,
        icon: Sparkles,
        color: 'navy',
        gradient: 'from-slate-50 to-sky-50',
        borderColor: 'border-sky-800',
        buttonStyle: 'bg-gradient-to-r from-sky-800 to-sky-900 hover:from-sky-900 hover:to-slate-900 text-white shadow-lg shadow-sky-900/30',
        badge: null,
        features: [
            { text: 'ทุกอย่างใน Premium', included: true },
            { text: 'คอร์สเรียนทุกคอร์สฟรี', included: true },
            { text: 'E-Book ดาวน์โหลดฟรีทุกเล่ม', included: true },
            { text: 'กลุ่ม LINE VIP ถาม-ตอบทนาย', included: true },
            { text: 'Mock Exam จับเวลาเหมือนสอบจริง', included: true },
            { text: 'ใบรับรองผ่านข้อสอบ (Certificate)', included: true },
            { text: 'สิทธิ์เข้าถึงฟีเจอร์ใหม่ก่อนใคร', included: true },
            { text: 'Priority Support', included: true },
            { text: '', included: true, spacer: true },
            { text: '', included: true, spacer: true },
        ],
    },
];

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Hero */}
            <div className="text-center space-y-4">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="text-slate-500 mb-2">
                        <ArrowLeft className="w-4 h-4 mr-1" /> กลับหน้าหลัก
                    </Button>
                </Link>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold text-slate-900"
                >
                    เลือกแพ็กเกจที่เหมาะกับคุณ
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-500 text-lg max-w-xl mx-auto"
                >
                    เตรียมสอบทนายความอย่างมั่นใจ ด้วยข้อสอบกว่า 2,000 ชุด และ AI ช่วยตรวจ
                </motion.p>

                {/* Billing toggle */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center gap-3 mt-6"
                >
                    <span className={`text-sm font-medium ${!isYearly ? 'text-slate-900' : 'text-slate-400'}`}>
                        รายเดือน
                    </span>
                    <button
                        onClick={() => setIsYearly(!isYearly)}
                        className={`relative w-14 h-7 rounded-full transition-colors ${isYearly ? 'bg-sky-500' : 'bg-slate-300'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${isYearly ? 'translate-x-7' : ''}`} />
                    </button>
                    <span className={`text-sm font-medium ${isYearly ? 'text-slate-900' : 'text-slate-400'}`}>
                        รายปี
                    </span>
                    {isYearly && (
                        <Badge className="bg-sky-100 text-sky-700 border-sky-200 text-xs">
                            ประหยัด 38%
                        </Badge>
                    )}
                </motion.div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {tiers.map((tier, index) => (
                    <motion.div
                        key={tier.name}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`relative rounded-2xl border-2 bg-gradient-to-b ${tier.gradient} ${tier.borderColor} overflow-hidden ${tier.badge ? 'md:-mt-4 md:mb-4 shadow-xl' : 'shadow-lg'}`}
                    >
                        {/* Recommended badge */}
                        {tier.badge && (
                            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-sky-500 to-sky-600 text-white text-center py-1.5 text-xs font-bold tracking-wider">
                                <Star className="w-3 h-3 inline mr-1" />
                                {tier.badge}
                            </div>
                        )}

                        <div className={`p-6 ${tier.badge ? 'pt-10' : ''}`}>
                            {/* Tier header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center`}>
                                    <tier.icon className={`w-5 h-5 ${tier.color === 'navy' ? 'text-sky-900' : 'text-sky-500'}`} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{tier.name}</h3>
                                    <p className="text-xs text-slate-500">{tier.subtitle}</p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                {tier.price === 0 ? (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold text-slate-900">ฟรี</span>
                                        <span className="text-slate-400 text-sm">ตลอดไป</span>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm text-slate-400">฿</span>
                                        <span className="text-4xl font-extrabold text-slate-900">
                                            {isYearly ? Math.round(tier.yearlyPrice / 12) : tier.price}
                                        </span>
                                        <span className="text-slate-400 text-sm">/เดือน</span>
                                    </div>
                                )}
                                {tier.price > 0 && isYearly && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        เรียกเก็บ ฿{tier.yearlyPrice.toLocaleString()}/ปี
                                        <span className="text-green-600 font-medium ml-1">
                                            (ประหยัด ฿{((tier.price * 12) - tier.yearlyPrice).toLocaleString()})
                                        </span>
                                    </p>
                                )}
                            </div>

                            {/* CTA */}
                            <Button className={`w-full h-11 font-semibold rounded-xl mb-6 ${tier.buttonStyle}`}>
                                {tier.price === 0 ? 'เริ่มใช้งานฟรี' : 'เลือกแพ็กเกจนี้'}
                            </Button>

                            {/* Features */}
                            <div className="space-y-2.5">
                                {tier.features.map((feature, i) => {
                                    if ((feature as { spacer?: boolean }).spacer) return <div key={i} className="h-6" />;
                                    return (
                                        <div key={i} className="flex items-start gap-2.5">
                                            {feature.included ? (
                                                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                            ) : (
                                                <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                                            )}
                                            <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                                                {feature.text}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* FAQ / Trust */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center space-y-4 pb-8"
            >
                <div className="flex items-center justify-center gap-8 text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        ยกเลิกได้ทุกเมื่อ
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        นักศึกษา 500+ คนใช้แล้ว
                    </div>
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        ช่วยเหลือ 24/7
                    </div>
                </div>
                <p className="text-xs text-slate-300">
                    ชำระผ่าน Stripe — รองรับบัตร Visa, Mastercard, JCB | ข้อมูลปลอดภัยระดับธนาคาร
                </p>
            </motion.div>
        </div>
    );
}
