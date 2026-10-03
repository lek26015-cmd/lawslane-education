'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Send, Loader2, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AuthGuard } from '@/components/education/auth-guard';
import { GoogleAd } from '@/components/google-ad';
import { CopyProtection } from '@/components/education/copy-protection';
import { useExamLimit } from '@/hooks/use-exam-limit';
import { useUser } from '@/firebase/provider';
import { UpgradePaywall, ExamLimitBanner } from '@/components/education/upgrade-paywall';
import { ExamPageImages } from '@/components/education/exam-page-images';

interface Question {
    id: string;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'ESSAY';
    options?: string[];
    order: number;
    subject?: string;
}

interface PageImage {
    page: number;
    url: string;
}

interface Exam {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    passingScore: number;
    totalQuestions: number;
    pageImages?: PageImage[];
    hasImages?: boolean;
    scenarioText?: string;
}

// Strip leading question number prefixes like "ข้อ๑.", "ข้อ ๒.", "ข้อ1.", "ข้อที่ 3."
function stripQuestionPrefix(text: string): string {
    return text.replace(/^ข้อ(?:ที่)?\s*[๐-๙0-9]+\.?\s*/u, '').trim();
}

function TakeExamPageContent({ params }: { params: Promise<{ id: string }> }) {
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
    // กันส่งซ้ำ — ตัวจับเวลายังเดินระหว่างรอ AI ตรวจ ถ้าหมดเวลาตอนนั้นจะยิงส่งรอบสอง
    const submittingRef = useRef(false);
    // ให้ตัวจับเวลาเรียก handleSubmit ตัวล่าสุด (ที่เห็น answers ล่าสุด)
    const submitRef = useRef<() => void>(() => {});

    const { user } = useUser();
    const { used, dailyLimit, isPremium, isLimitReached, recordExamAttempt } = useExamLimit();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/education/exams/${id}?questions=true`);
                if (response.ok) {
                    const data = await response.json();
                    setExam(data);
                    setQuestions(data.questions || []);
                    const minutes = Number(data.durationMinutes) > 0 ? Number(data.durationMinutes) : 180;
                    setTimeLeft(minutes * 60);
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

    // ใช้สิทธิ์ทำข้อสอบ (หลังโหลดข้อสอบ) — server เป็นคนตัดสินตามแพ็กเกจ
    // ชุดเดิมในวันเดียวกันไม่นับซ้ำ จึงเรียกซ้ำได้ปลอดภัย
    useEffect(() => {
        if (exam) recordExamAttempt(id);
    }, [exam, id, recordExamAttempt]);


    // Timer — นับถอยหลังอย่างเดียว ส่งอัตโนมัติแยกไว้อีก effect
    // (เดิมเรียก handleSubmit ใน setState updater ซึ่ง React อาจเรียกซ้ำได้)
    const timerRunning = !!exam && timeLeft > 0;
    useEffect(() => {
        if (!timerRunning) return;
        const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
        return () => clearInterval(timer);
    }, [timerRunning]);

    useEffect(() => {
        if (exam && timeLeft === 0 && questions.length > 0) submitRef.current();
    }, [exam, timeLeft, questions.length]);

    // Show paywall if limit reached (after all hooks)
    if (!isLoading && isLimitReached) {
        return <UpgradePaywall used={used} dailyLimit={dailyLimit} context="exam" />;
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId: string, value: string | number) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setIsSubmitting(true);

        try {
            const formattedAnswers = questions.map(q => ({
                questionId: q.id,
                answer: answers[q.id] ?? ''
            }));

            // route นี้ต้องล็อกอิน (requireUser) — เดิมไม่ได้ส่ง token จึงโดน 401 ทุกครั้ง
            const token = await user?.getIdToken();
            const response = await fetch('/api/education/submit-exam', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    examId: id,
                    answers: formattedAnswers,
                    startedAt
                })
            });

            if (response.ok) {
                const result = await response.json();
                router.push(`/exams/${id}/result?attemptId=${result.attemptId}`);
                return;
            }

            // บอกสาเหตุจริง — เดิมทุกกรณีขึ้นแค่ "เกิดข้อผิดพลาด" ผู้ใช้/แอดมินไม่รู้ว่าพังตรงไหน
            const body = await response.json().catch(() => ({}));
            const description =
                response.status === 403 ? (body.error || 'ใช้สิทธิ์ทำข้อสอบครบแล้ววันนี้')
                : response.status === 401 ? 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่ คำตอบของคุณยังอยู่ในหน้านี้'
                : response.status === 504 ? 'ระบบตรวจข้อสอบใช้เวลานานเกินไป กรุณากดส่งอีกครั้ง คำตอบของคุณยังอยู่ในหน้านี้'
                : (body.error ? `${body.error} (${response.status})` : `เซิร์ฟเวอร์ตอบกลับ ${response.status} กรุณากดส่งอีกครั้ง`);
            toast({ title: 'ส่งข้อสอบไม่สำเร็จ', description, variant: "destructive" });
        } catch (error) {
            console.error('Submit exam error:', error);
            toast({
                title: 'ส่งข้อสอบไม่สำเร็จ',
                description: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วกดส่งอีกครั้ง คำตอบของคุณยังอยู่ในหน้านี้',
                variant: "destructive",
            });
        }
        submittingRef.current = false;
        setIsSubmitting(false);
    };
    submitRef.current = handleSubmit;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#0B3979]" />
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
        <CopyProtection watermarkText="© Lawslane Wittaya — ห้ามคัดลอก">
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border p-4 shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-normal text-lg text-slate-900">{exam.title}</h1>
                        <p className="text-sm text-slate-500">ตอบแล้ว {answeredCount}/{questions.length} ข้อ</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                            <Clock className="w-4 h-4" />
                            <span className="font-mono font-normal">{formatTime(timeLeft)}</span>
                        </div>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-[#0B3979] hover:bg-[#082a5a]"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            ส่งข้อสอบ
                        </Button>
                    </div>
                </div>
            </div>

            {/* โควตาข้อสอบต่อวันตามแพ็กเกจ — เดิม component นี้มีอยู่แต่ไม่ได้แสดงที่ไหนเลย */}
            <ExamLimitBanner used={used} dailyLimit={dailyLimit} isPremium={isPremium} />

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
                                        ? 'bg-[#0B3979] text-white'
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

            {/* Ad Banner */}
            <GoogleAd variant="banner" className="my-2" />

            {/* ข้อเท็จจริงที่ใช้ร่วมกันทุกข้อ + ภาพหน้าข้อสอบต้นฉบับ */}
            {(exam.scenarioText || exam.pageImages?.length) ? (
                <div className="space-y-3">
                    {exam.scenarioText && (
                        <div className="bg-white rounded-xl border p-6 shadow-sm">
                            <p className="text-sm font-medium text-slate-500 mb-3">ข้อเท็จจริง (ใช้ตอบทุกข้อ)</p>
                            <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">{exam.scenarioText}</p>
                        </div>
                    )}
                    <ExamPageImages images={exam.pageImages || []} title="ดูหน้าข้อสอบต้นฉบับ" />
                </div>
            ) : null}

            {/* Current Question */}
            <div className="bg-white rounded-xl border p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-[#082a5a] flex items-center justify-center font-normal flex-shrink-0">
                        {currentQuestionIndex + 1}
                    </div>
                    <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                            <Badge variant="outline">{currentQuestion.type === 'MULTIPLE_CHOICE' ? 'ปรนัย' : 'อัตนัย'}</Badge>
                            {currentQuestion.subject && <Badge variant="secondary">{currentQuestion.subject}</Badge>}
                        </div>
                        <p className="text-lg text-slate-900 whitespace-pre-wrap">{stripQuestionPrefix(currentQuestion.text)}</p>
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
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                {answers[currentQuestion.id] === idx
                                    ? <CheckCircle className="w-5 h-5 text-[#0B3979]" />
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
        </CopyProtection>
    );
}

export default function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <AuthGuard
            message="กรุณาเข้าสู่ระบบเพื่อทำข้อสอบ"
            returnTo={`/exams`}
        >
            <TakeExamPageContent params={params} />
        </AuthGuard>
    );
}
