'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft, BookOpen, CheckCircle, FileText, ChevronDown, ChevronUp,
    Eye, EyeOff, Lightbulb, Copy, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthGuard } from '@/components/education/auth-guard';
import { GoogleAd } from '@/components/google-ad';
import { CopyProtection } from '@/components/education/copy-protection';

interface Question {
    id: string;
    order: number;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'ESSAY';
    options?: string[];
    correctOptionIndex?: number;
    correctAnswer: string;
    modelAnswer: string;
    explanation: string;
    tags: string[];
    isAiGenerated?: boolean;
}

interface ExamAnswers {
    id: string;
    title: string;
    description: string;
    subjectCode: string;
    session: string;
    totalQuestions: number;
    questions: Question[];
}

// Strip leading question number prefixes like "ข้อ๑.", "ข้อ ๒.", "ข้อ1."
function stripQuestionPrefix(text: string): string {
    return text.replace(/^ข้อ(?:ที่)?\s*[๐-๙0-9]+\.?\s*/u, '').trim();
}

function AnswerKeyPageContent({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [exam, setExam] = useState<ExamAnswers | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
    const [showAllAnswers, setShowAllAnswers] = useState(false);

    useEffect(() => {
        const fetchAnswers = async () => {
            try {
                const res = await fetch(`/api/education/exams/${id}/answers`);
                if (res.ok) {
                    const data = await res.json();
                    setExam(data);
                }
            } catch (err) {
                console.error('Error fetching answers:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnswers();
    }, [id]);

    const toggleQuestion = (qId: string) => {
        setExpandedQuestions(prev => {
            const next = new Set(prev);
            if (next.has(qId)) next.delete(qId); else next.add(qId);
            return next;
        });
    };

    const toggleAll = () => {
        if (showAllAnswers) {
            setExpandedQuestions(new Set());
        } else {
            setExpandedQuestions(new Set(exam?.questions.map(q => q.id) || []));
        }
        setShowAllAnswers(!showAllAnswers);
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="h-8 bg-slate-200 rounded-lg animate-pulse w-48" />
                <div className="h-24 bg-slate-200 rounded-xl animate-pulse" />
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-lg text-slate-500">ไม่พบข้อสอบ</p>
                <Link href="/exams">
                    <Button variant="outline" className="mt-4">กลับไปคลังข้อสอบ</Button>
                </Link>
            </div>
        );
    }

    return (
        <CopyProtection watermarkText="© Lawslane Wittaya — ห้ามคัดลอก">
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back + Header */}
            <div className="flex items-center gap-3">
                <Link href="/exams">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            <BookOpen className="w-3 h-3 mr-1" />
                            ธงคำตอบ
                        </Badge>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">{exam.title}</h1>
                    <p className="text-sm text-slate-500 mt-1">{exam.totalQuestions} ข้อ {exam.session && `• ${exam.session}`}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between bg-white rounded-xl border p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">โหมดดูเฉลย</p>
                        <p className="text-xs text-slate-500">กดที่ข้อเพื่อดูธงคำตอบ</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleAll}
                        className="gap-1.5"
                    >
                        {showAllAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showAllAnswers ? 'ซ่อนทั้งหมด' : 'แสดงทั้งหมด'}
                    </Button>
                    <Link href={`/exams/${id}/take`}>
                        <Button size="sm" className="gap-1.5 bg-[#0B3979] hover:bg-[#082a5a]">
                            <FileText className="w-4 h-4" />
                            ทำข้อสอบ
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Ad Banner */}
            <GoogleAd variant="banner" className="my-2" />

            {/* Questions */}
            <div className="space-y-4">
                {exam.questions.map((q, idx) => {
                    const isExpanded = expandedQuestions.has(q.id);
                    return (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                        >
                            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                {/* Question Header — clickable */}
                                <button
                                    onClick={() => toggleQuestion(q.id)}
                                    className="w-full text-left p-5 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-9 h-9 rounded-full bg-blue-100 text-[#082a5a] flex items-center justify-center font-bold text-sm flex-shrink-0">
                                            {q.order}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Badge variant={q.type === 'MULTIPLE_CHOICE' ? 'default' : 'secondary'} className="text-[10px]">
                                                    {q.type === 'MULTIPLE_CHOICE' ? 'ปรนัย' : 'อัตนัย'}
                                                </Badge>
                                            </div>
                                            <p className="text-slate-900 whitespace-pre-wrap leading-relaxed text-sm line-clamp-3">
                                                {stripQuestionPrefix(q.text)}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0 mt-1">
                                            {isExpanded ? (
                                                <ChevronUp className="w-5 h-5 text-slate-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-slate-400" />
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded: Full Question + Answer */}
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className="border-t"
                                    >
                                        {/* Full question text */}
                                        <div className="px-5 pt-4 pb-2">
                                            <p className="text-slate-800 whitespace-pre-wrap leading-relaxed text-sm">
                                                {stripQuestionPrefix(q.text)}
                                            </p>
                                        </div>

                                        {/* MC Options */}
                                        {q.type === 'MULTIPLE_CHOICE' && q.options && (
                                            <div className="px-5 pb-3 space-y-2">
                                                {q.options.map((opt, i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                                                            i === q.correctOptionIndex
                                                                ? 'bg-emerald-50 border border-emerald-200'
                                                                : 'bg-slate-50 border border-slate-100'
                                                        }`}
                                                    >
                                                        {i === q.correctOptionIndex ? (
                                                            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                                                        )}
                                                        <span className={i === q.correctOptionIndex ? 'text-emerald-800 font-medium' : 'text-slate-600'}>
                                                            ({i + 1}) {opt}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Model Answer */}
                                        {q.modelAnswer && (
                                            <div className={`mx-5 mb-4 p-4 rounded-xl border ${
                                                q.isAiGenerated
                                                    ? 'bg-purple-50 border-purple-200'
                                                    : 'bg-amber-50 border-amber-200'
                                            }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Lightbulb className={`w-4 h-4 ${q.isAiGenerated ? 'text-purple-600' : 'text-amber-600'}`} />
                                                        <span className={`text-sm font-semibold ${q.isAiGenerated ? 'text-purple-800' : 'text-amber-800'}`}>
                                                            {q.isAiGenerated ? '⚡ แนวทางคำตอบจากการวิเคราะห์ของ AI' : 'ธงคำตอบ'}
                                                        </span>
                                                    </div>
                                                    <CopyButton text={q.modelAnswer} />
                                                </div>
                                                <p className={`text-sm whitespace-pre-wrap leading-relaxed ${q.isAiGenerated ? 'text-purple-900' : 'text-amber-900'}`}>
                                                    {q.modelAnswer}
                                                </p>
                                            </div>
                                        )}

                                        {/* No answer available */}
                                        {!q.modelAnswer && q.type === 'ESSAY' && (
                                            <div className="mx-5 mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                                <p className="text-sm text-slate-500 italic">ยังไม่มีธงคำตอบสำหรับข้อนี้</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Bottom nav */}
            <div className="flex justify-center gap-3 py-6">
                <Link href="/exams">
                    <Button variant="outline">กลับไปคลังข้อสอบ</Button>
                </Link>
                <Link href={`/exams/${id}/take`}>
                    <Button className="bg-[#0B3979] hover:bg-[#082a5a]">ทำข้อสอบชุดนี้</Button>
                </Link>
            </div>
        </div>
        </CopyProtection>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="text-amber-600 hover:text-amber-800 transition-colors p-1 rounded">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
    );
}

export default function AnswerKeyPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <AuthGuard
            message="กรุณาเข้าสู่ระบบเพื่อดูเฉลยข้อสอบ"
            returnTo={`/exams`}
        >
            <AnswerKeyPageContent params={params} />
        </AuthGuard>
    );
}
