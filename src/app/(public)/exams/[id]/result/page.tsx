'use client';

import React, { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Trophy, Target, Sparkles, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface AnswerResult {
    questionId: string;
    questionText: string;
    questionType: 'MULTIPLE_CHOICE' | 'ESSAY';
    studentAnswer: string | number;
    correctAnswer?: string | number;
    isCorrect?: boolean;
    aiScore?: number;
    aiFeedback?: string;
    aiStrengths?: string[];
    aiWeaknesses?: string[];
    aiSuggestions?: string[];
}

interface ExamAttempt {
    id: string;
    examId: string;
    examTitle: string;
    totalScore: number;
    maxScore: number;
    passingScore: number;
    passed: boolean;
    answers: AnswerResult[];
    completedAt: string;
}

export default function ExamResultPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const attemptId = searchParams.get('attemptId');

    const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchResult = async () => {
            if (!attemptId) return;

            try {
                const response = await fetch(`/api/education/attempts/${attemptId}`);
                if (response.ok) {
                    const data = await response.json();
                    setAttempt(data);
                    // Expand first question by default
                    if (data.answers?.length > 0) {
                        setExpandedQuestions(new Set([data.answers[0].questionId]));
                    }
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchResult();
    }, [attemptId]);

    const toggleQuestion = (questionId: string) => {
        setExpandedQuestions(prev => {
            const next = new Set(prev);
            if (next.has(questionId)) {
                next.delete(questionId);
            } else {
                next.add(questionId);
            }
            return next;
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-center">
                    <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4 animate-bounce" />
                    <p className="text-slate-500">กำลังโหลดผลการสอบ...</p>
                </div>
            </div>
        );
    }

    if (!attempt) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">ไม่พบผลการสอบ</p>
                <Link href="/exams">
                    <Button className="mt-4">กลับหน้ารายการข้อสอบ</Button>
                </Link>
            </div>
        );
    }

    const scoreColor = attempt.passed ? 'text-green-600' : 'text-red-600';
    const scoreBg = attempt.passed ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Score Hero */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`bg-gradient-to-br ${scoreBg} rounded-2xl p-8 text-white text-center shadow-xl`}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center"
                >
                    {attempt.passed ? (
                        <Trophy className="w-12 h-12 text-yellow-300" />
                    ) : (
                        <Target className="w-12 h-12 text-white/80" />
                    )}
                </motion.div>

                <h1 className="text-4xl font-bold mb-2">{attempt.totalScore} / {attempt.maxScore}</h1>
                <p className="text-white/80 mb-4">{attempt.examTitle}</p>

                <Badge className={`text-lg px-4 py-1 ${attempt.passed ? 'bg-green-400' : 'bg-red-400'}`}>
                    {attempt.passed ? '🎉 ผ่าน!' : '❌ ไม่ผ่าน'}
                </Badge>

                <p className="text-white/70 mt-4 text-sm">
                    เกณฑ์ผ่าน: {attempt.passingScore}%
                </p>
            </motion.div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl border p-4 text-center"
                >
                    <BookOpen className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{attempt.answers.length}</p>
                    <p className="text-xs text-slate-500">คำถามทั้งหมด</p>
                </motion.div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl border p-4 text-center"
                >
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">
                        {attempt.answers.filter(a => a.isCorrect || (a.aiScore && a.aiScore >= 60)).length}
                    </p>
                    <p className="text-xs text-slate-500">ตอบถูก/ผ่านเกณฑ์</p>
                </motion.div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl border p-4 text-center"
                >
                    <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">
                        {Math.round(attempt.answers.reduce((sum, a) => sum + (a.aiScore || 0), 0) / attempt.answers.length)}
                    </p>
                    <p className="text-xs text-slate-500">คะแนนเฉลี่ย</p>
                </motion.div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">📝 ผลตรวจแต่ละข้อ</h2>

                {attempt.answers.map((answer, idx) => {
                    const isExpanded = expandedQuestions.has(answer.questionId);
                    const isPass = answer.isCorrect || (answer.aiScore && answer.aiScore >= 60);

                    return (
                        <motion.div
                            key={answer.questionId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-xl border shadow-sm overflow-hidden"
                        >
                            {/* Question Header */}
                            <button
                                onClick={() => toggleQuestion(answer.questionId)}
                                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPass ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {isPass ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-slate-900">ข้อ {idx + 1}</p>
                                        <p className="text-xs text-slate-500 line-clamp-1">{answer.questionText.substring(0, 60)}...</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={isPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                        {answer.aiScore !== undefined ? `${answer.aiScore} คะแนน` : (answer.isCorrect ? 'ถูก' : 'ผิด')}
                                    </Badge>
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                            </button>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t"
                                    >
                                        <div className="p-4 space-y-4">
                                            {/* Question */}
                                            <div>
                                                <p className="text-sm font-medium text-slate-500 mb-1">คำถาม</p>
                                                <p className="text-slate-900 whitespace-pre-wrap">{answer.questionText}</p>
                                            </div>

                                            {/* Student Answer */}
                                            <div className="bg-slate-50 rounded-lg p-4">
                                                <p className="text-sm font-medium text-slate-500 mb-1">คำตอบของคุณ</p>
                                                <p className="text-slate-800 whitespace-pre-wrap">
                                                    {typeof answer.studentAnswer === 'string'
                                                        ? answer.studentAnswer || '(ไม่ได้ตอบ)'
                                                        : `ตัวเลือกที่ ${(answer.studentAnswer as number) + 1}`
                                                    }
                                                </p>
                                            </div>

                                            {/* Correct Answer for MC */}
                                            {answer.questionType === 'MULTIPLE_CHOICE' && answer.correctAnswer !== undefined && (
                                                <div className="bg-green-50 rounded-lg p-4">
                                                    <p className="text-sm font-medium text-green-700 mb-1">คำตอบที่ถูกต้อง</p>
                                                    <p className="text-green-800">ตัวเลือกที่ {(answer.correctAnswer as number) + 1}</p>
                                                </div>
                                            )}

                                            {/* AI Feedback for Essay */}
                                            {answer.questionType === 'ESSAY' && (
                                                <>
                                                    {/* Model Answer */}
                                                    {answer.correctAnswer && (
                                                        <div className="bg-indigo-50 rounded-lg p-4">
                                                            <p className="text-sm font-medium text-indigo-700 mb-1">📚 ธงคำตอบ</p>
                                                            <p className="text-indigo-900 whitespace-pre-wrap text-sm">{answer.correctAnswer}</p>
                                                        </div>
                                                    )}

                                                    {/* AI Feedback */}
                                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Sparkles className="w-4 h-4 text-purple-600" />
                                                            <p className="text-sm font-medium text-purple-700">AI Feedback</p>
                                                        </div>
                                                        <p className="text-slate-700 mb-3">{answer.aiFeedback}</p>

                                                        {answer.aiStrengths && answer.aiStrengths.length > 0 && (
                                                            <div className="mb-2">
                                                                <p className="text-xs font-medium text-green-600 mb-1">✅ จุดแข็ง:</p>
                                                                <ul className="text-sm text-slate-600 list-disc list-inside">
                                                                    {answer.aiStrengths.map((s, i) => <li key={i}>{s}</li>)}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {answer.aiWeaknesses && answer.aiWeaknesses.length > 0 && (
                                                            <div className="mb-2">
                                                                <p className="text-xs font-medium text-red-600 mb-1">⚠️ จุดที่ควรปรับปรุง:</p>
                                                                <ul className="text-sm text-slate-600 list-disc list-inside">
                                                                    {answer.aiWeaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {answer.aiSuggestions && answer.aiSuggestions.length > 0 && (
                                                            <div>
                                                                <p className="text-xs font-medium text-blue-600 mb-1">💡 คำแนะนำ:</p>
                                                                <ul className="text-sm text-slate-600 list-disc list-inside">
                                                                    {answer.aiSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center py-6">
                <Link href={`/exams/${id}/take`}>
                    <Button variant="outline">ทำข้อสอบอีกครั้ง</Button>
                </Link>
                <Link href="/exams">
                    <Button>กลับหน้ารายการข้อสอบ</Button>
                </Link>
            </div>
        </div>
    );
}
