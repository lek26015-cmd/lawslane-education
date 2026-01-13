'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Send, Loader2, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Question {
    id: string;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'ESSAY';
    options?: string[];
    order: number;
    subject?: string;
}

interface Exam {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    passingScore: number;
    totalQuestions: number;
}

export default function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();

    const [exam, setExam] = useState<Exam | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, string | number>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [startedAt] = useState(new Date().toISOString());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/education/exams/${id}?questions=true`);
                if (response.ok) {
                    const data = await response.json();
                    setExam(data);
                    setQuestions(data.questions || []);
                    setTimeLeft(data.durationMinutes * 60);
                } else {
                    toast({ title: "ไม่พบข้อสอบ", variant: "destructive" });
                    router.push('/exams');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, router, toast]);

    // Timer
    useEffect(() => {
        if (timeLeft <= 0 || !exam) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, exam]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId: string, value: string | number) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const formattedAnswers = questions.map(q => ({
                questionId: q.id,
                answer: answers[q.id] ?? ''
            }));

            const response = await fetch('/api/education/submit-exam', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examId: id,
                    answers: formattedAnswers,
                    startedAt
                })
            });

            if (response.ok) {
                const result = await response.json();
                router.push(`/exams/${id}/result?attemptId=${result.attemptId}`);
            } else {
                throw new Error('Submit failed');
            }
        } catch (error) {
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!exam || questions.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">ไม่พบข้อสอบหรือยังไม่มีคำถาม</p>
                <Link href="/exams">
                    <Button className="mt-4">กลับหน้ารายการข้อสอบ</Button>
                </Link>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).filter(k => answers[k] !== '' && answers[k] !== undefined).length;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border p-4 shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-lg text-slate-900">{exam.title}</h1>
                        <p className="text-sm text-slate-500">ตอบแล้ว {answeredCount}/{questions.length} ข้อ</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                            <Clock className="w-4 h-4" />
                            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                        </div>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            ส่งข้อสอบ
                        </Button>
                    </div>
                </div>
            </div>

            {/* Question Navigation */}
            <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-slate-500 mb-3">เลือกข้อคำถาม:</p>
                <div className="flex flex-wrap gap-2">
                    {questions.map((q, idx) => {
                        const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                        const isCurrent = idx === currentQuestionIndex;
                        return (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium text-sm transition-all ${isCurrent
                                        ? 'bg-indigo-600 text-white'
                                        : isAnswered
                                            ? 'bg-green-100 text-green-700 border border-green-300'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Current Question */}
            <div className="bg-white rounded-xl border p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold flex-shrink-0">
                        {currentQuestionIndex + 1}
                    </div>
                    <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                            <Badge variant="outline">{currentQuestion.type === 'MULTIPLE_CHOICE' ? 'ปรนัย' : 'อัตนัย'}</Badge>
                            {currentQuestion.subject && <Badge variant="secondary">{currentQuestion.subject}</Badge>}
                        </div>
                        <p className="text-lg text-slate-900 whitespace-pre-wrap">{currentQuestion.text}</p>
                    </div>
                </div>

                {/* Answer Input */}
                {currentQuestion.type === 'MULTIPLE_CHOICE' ? (
                    <div className="space-y-3 mt-6">
                        {currentQuestion.options?.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswerChange(currentQuestion.id, idx)}
                                className={`w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3 ${answers[currentQuestion.id] === idx
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                {answers[currentQuestion.id] === idx
                                    ? <CheckCircle className="w-5 h-5 text-indigo-600" />
                                    : <Circle className="w-5 h-5 text-slate-300" />
                                }
                                <span className="text-slate-700">{option}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="mt-6">
                        <Textarea
                            rows={10}
                            placeholder="เขียนคำตอบของคุณที่นี่... (AI จะตรวจและให้ feedback)"
                            value={(answers[currentQuestion.id] as string) || ''}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            className="text-base"
                        />
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            คำตอบจะถูกตรวจด้วย AI และเปรียบเทียบกับธงคำตอบ
                        </p>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                    >
                        ← ข้อก่อนหน้า
                    </Button>
                    <Button
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        disabled={currentQuestionIndex === questions.length - 1}
                    >
                        ข้อถัดไป →
                    </Button>
                </div>
            </div>
        </div>
    );
}
