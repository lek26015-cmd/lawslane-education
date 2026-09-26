'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Brain, TrendingUp, TrendingDown, Sparkles, Target,
    BookOpen, Loader2, ArrowRight, CheckCircle, AlertTriangle,
    Lightbulb, Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/firebase';

interface WeaknessAnalysis {
    overallAssessment: string;
    strongTopics: { topic: string; score: number; reason: string }[];
    weakTopics: { topic: string; score: number; reason: string }[];
    studyRecommendations: string[];
    improvementPlan: string[];
    motivationalMessage: string;
}

export default function MyProgressPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const [analysis, setAnalysis] = useState<WeaknessAnalysis | null>(null);
    const [totalAttempts, setTotalAttempts] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const fetchAnalysis = async (showRefresh = false) => {
        if (!user) return;
        if (showRefresh) setIsRefreshing(true);
        else setIsLoading(true);

        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/education/analyze-weakness', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAnalysis(data.analysis);
                setTotalAttempts(data.totalAttempts || 0);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (user) fetchAnalysis();
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Brain className="w-16 h-16 text-blue-400 mb-4 animate-pulse" />
                <p className="text-slate-500">กำลังวิเคราะห์ผลการเรียน...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
            >
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Brain className="w-8 h-8 text-[#0B3979]" />
                    <h1 className="text-3xl font-bold text-slate-900">AI วิเคราะห์พัฒนาการ</h1>
                </div>
                <p className="text-slate-600 mb-4">
                    วิเคราะห์จากผลสอบ {totalAttempts} ครั้ง เพื่อหาจุดแข็งและจุดที่ต้องปรับปรุง
                </p>
                <Button
                    variant="outline"
                    onClick={() => fetchAnalysis(true)}
                    disabled={isRefreshing}
                >
                    {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    วิเคราะห์ใหม่
                </Button>
            </motion.div>

            {!analysis || totalAttempts === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl border p-8 text-center"
                >
                    <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">ยังไม่มีข้อมูลเพียงพอ</h2>
                    <p className="text-slate-500 mb-6">ลองทำข้อสอบสัก 2-3 ชุด แล้ว AI จะวิเคราะห์จุดแข็ง/จุดอ่อนให้</p>
                    <Link href="/exams">
                        <Button className="bg-[#0B3979] hover:bg-[#082a5a]">
                            <BookOpen className="w-4 h-4 mr-2" />
                            เริ่มทำข้อสอบ
                        </Button>
                    </Link>
                </motion.div>
            ) : (
                <>
                    {/* Overall Assessment */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-r from-blue-500 to-[#0B3979] rounded-2xl p-6 text-white"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg mb-2">ภาพรวมการประเมิน</h2>
                                <p className="text-white/90 leading-relaxed">{analysis.overallAssessment}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Strong & Weak Topics */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Strong Topics */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl border p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                <h3 className="font-bold text-slate-900">จุดแข็ง</h3>
                            </div>
                            {analysis.strongTopics.length === 0 ? (
                                <p className="text-slate-400 text-sm">ยังไม่มีข้อมูล</p>
                            ) : (
                                <div className="space-y-3">
                                    {analysis.strongTopics.map((topic, idx) => (
                                        <div key={idx} className="bg-green-50 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-green-900">{topic.topic}</span>
                                                <Badge className="bg-green-100 text-green-700">{topic.score}%</Badge>
                                            </div>
                                            <p className="text-xs text-green-700">{topic.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Weak Topics */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl border p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingDown className="w-5 h-5 text-red-500" />
                                <h3 className="font-bold text-slate-900">จุดที่ต้องปรับปรุง</h3>
                            </div>
                            {analysis.weakTopics.length === 0 ? (
                                <p className="text-slate-400 text-sm">ไม่พบจุดอ่อนที่ชัดเจน</p>
                            ) : (
                                <div className="space-y-3">
                                    {analysis.weakTopics.map((topic, idx) => (
                                        <div key={idx} className="bg-red-50 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-red-900">{topic.topic}</span>
                                                <Badge className="bg-red-100 text-red-700">{topic.score}%</Badge>
                                            </div>
                                            <p className="text-xs text-red-700">{topic.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Study Recommendations */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl border p-5"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            <h3 className="font-bold text-slate-900">คำแนะนำในการศึกษา</h3>
                        </div>
                        <div className="space-y-2">
                            {analysis.studyRecommendations.map((rec, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                        {idx + 1}
                                    </div>
                                    <p className="text-slate-700 text-sm">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Improvement Plan */}
                    {analysis.improvementPlan.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-2xl border p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Rocket className="w-5 h-5 text-[#0B3979]" />
                                <h3 className="font-bold text-slate-900">แผนพัฒนาตนเอง</h3>
                            </div>
                            <div className="space-y-2">
                                {analysis.improvementPlan.map((step, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-slate-700 text-sm">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Motivational Message */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-2xl p-6 text-center border border-blue-100"
                    >
                        <p className="text-lg font-medium text-[#082a5a]">💪 {analysis.motivationalMessage}</p>
                    </motion.div>

                    {/* CTA */}
                    <div className="text-center py-4">
                        <Link href="/exams">
                            <Button size="lg" className="bg-[#0B3979] hover:bg-[#082a5a]">
                                ฝึกทำข้อสอบต่อ
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
