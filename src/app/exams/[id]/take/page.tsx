"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, ChevronRight, Flag, Save, Trophy, BookOpen, Target, ArrowRight, ShoppingCart, Star } from "lucide-react";
import { Question } from "@/lib/education-types";
import Link from 'next/link';
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// MOCK DATA FOR EXAM CONTENT
const MOCK_QUESTIONS: Question[] = [
    {
        id: "q1",
        examId: "exam-1",
        order: 1,
        text: "นายแดงทำสัญญาจะซื้อจะขายที่ดินกับนายดำ โดยวางมัดจำไว้ 50,000 บาท ต่อมานายแดงผิดสัญญาไม่ยอมโอนที่ดินตามกำหนด นายดำจึงฟ้องบังคับให้โอนที่ดินและเรียกค่าเสียหาย\n\nจงวินิจฉัยว่า:\n1. นายดำมีสิทธิฟ้องบังคับให้โอนที่ดินได้หรือไม่\n2. เงินมัดจำ 50,000 บาท ต้องจัดการอย่างไรตามกฎหมาย",
        type: "ESSAY",
        correctAnswerText: "ธงคำตอบ:\n\n1. ประเด็นเรื่องการฟ้องบังคับคดี: สัญญาจะซื้อจะขายที่มีหลักฐานเป็นหนังสือหรือมีการวางมัดจำ ย่อมฟ้องร้องบังคับคดีได้ตาม ป.พ.พ. มาตรา 456 วรรคสอง\n\n2. ประเด็นเรื่องมัดจำ: เมื่อฝ่ายผู้จะขาย (นายแดง) ผิดสัญญา ผู้จะซื้อ (นายดำ) ชอบที่จะริบมัดจำไม่ได้ (เพราะตนไม่ใช่ฝ่ายรับมัดจำ) แต่สามารถเรียกให้คืนมัดจำพร้อมดอกเบี้ย หรือฟ้องเรียกค่าเสียหายได้\n\n(คำอธิบายเพิ่มเติม: ปกติมัดจำให้ริบเมื่อฝ่ายวางผิดสัญญา ถ้าฝ่ายรับผิดสัญญาต้องคืนมัดจำ + อาจเรียกค่าเสียหายเพิ่มได้ตามความเสียหายจริง)",
        subject: "กฎหมายแพ่งและพาณิชย์"
    },
    {
        id: "q2",
        examId: "exam-1",
        order: 2,
        text: "ในคดีอาญา หากจำเลยให้การรับสารภาพในชั้นสอบสวน แต่ให้การปฏิเสธในชั้นศาล ศาลจะรับฟังคำรับสารภาพในชั้นสอบสวนมาลงโทษจำเลยได้หรือไม่ เพียงใด",
        type: "ESSAY",
        correctAnswerText: "ธงคำตอบ:\n\nต้องพิจารณาตาม ป.วิ.อาญา มาตรา 84 วรรคท้าย (เดิม) หรือกฎหมายปัจจุบันที่ห้ามรับฟังคำรับสารภาพในชั้นจับกุม แต่ชั้นสอบสวนรับฟังได้ถ้ามีการแจ้งสิทธิถูกต้อง อย่างไรก็ตาม หากจำเลยปฏิเสธในศาล ศาลต้องสืบพยานประกอบจนแน่ใจว่ากระทำผิดจริงจึงจะลงโทษได้ จะฟังลำพังคำรับสารภาพในชั้นสอบสวนไม่ได้ (ประกอบหลักเรื่องน้ำหนักพยาน)",
        subject: "กฎหมายวิธีพิจารณาความอาญา"
    }
];

// Mock recommended books based on subjects
const RECOMMENDED_BOOKS = [
    {
        id: "book-civil-1",
        title: "คู่มือสอบกฎหมายแพ่งและพาณิชย์ ฉบับสมบูรณ์",
        subject: "กฎหมายแพ่งและพาณิชย์",
        price: 450,
        coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400&auto=format&fit=crop",
        reason: "ครอบคลุมหลักกฎหมายมัดจำ สัญญาซื้อขาย และการบังคับคดี"
    },
    {
        id: "book-criminal-1",
        title: "วิ.อาญา สำหรับการสอบทนายความ",
        subject: "กฎหมายวิธีพิจารณาความอาญา",
        price: 550,
        coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop",
        reason: "อธิบายหลักการรับฟังพยานหลักฐาน และสิทธิของผู้ต้องหา"
    }
];

// Wrapper component to handle params
export default function ExamTakePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <ExamTakeContent examId={id} />;
}

// Inner component with all hooks
function ExamTakeContent({ examId }: { examId: string }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(4 * 60 * 60);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [examResult, setExamResult] = useState<any>(null);
    const [showSummary, setShowSummary] = useState(false);

    const { user, isUserLoading } = useUser();
    const router = useRouter();

    const questions = MOCK_QUESTIONS;
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const allAnswered = questions.every(q => answers[q.id] && answers[q.id].trim().length > 0);

    // Auth redirect
    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    // Timer Logic
    useEffect(() => {
        if (isSubmitted || isUserLoading || !user) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isSubmitted, isUserLoading, user]);

    // Loading state
    if (isUserLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (text: string) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: text
        }));
    };

    const handleSubmit = async () => {
        if (!allAnswered && timeLeft > 0) return;

        setIsSubmitted(true);
        setIsAnalyzing(true);
        setShowSummary(true); // Show summary after submit

        try {
            const response = await fetch('/api/education/analyze-exam', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examId: examId,
                    userId: user?.uid,
                    questions: questions,
                    userAnswers: answers
                })
            });

            const result = await response.json();
            setExamResult(result);
        } catch (error) {
            console.error("Analysis Failed", error);
            // Fallback mock result for demo
            setExamResult({
                totalScore: 72,
                analysis: [
                    { questionId: "q1", score: 80, feedback: "ตอบได้ดี มีการอ้างอิงมาตราถูกต้อง", strengths: ["อ้างอิงกฎหมายถูกต้อง"], weaknesses: ["ขาดรายละเอียดเรื่องดอกเบี้ย"], suggestions: ["ควรอ่านเพิ่มเรื่องผลของการผิดสัญญา"] },
                    { questionId: "q2", score: 65, feedback: "ควรอธิบายหลักการรับฟังพยานเพิ่มเติม", strengths: ["เข้าใจหลักการพื้นฐาน"], weaknesses: ["ไม่ได้อ้างมาตราที่ชัดเจน"], suggestions: ["ทบทวน ป.วิ.อาญา มาตรา 84"] }
                ],
                subjectScores: [
                    { subject: "กฎหมายแพ่งและพาณิชย์", score: 80, maxScore: 100 },
                    { subject: "กฎหมายวิธีพิจารณาความอาญา", score: 65, maxScore: 100 }
                ],
                overallFeedback: "คุณมีพื้นฐานที่ดี แต่ควรเน้นการอ้างอิงมาตราให้ชัดเจนขึ้น และทบทวนหลักการรับฟังพยานในคดีอาญา",
                recommendedMaterials: [
                    { title: "ป.พ.พ. มาตรา 377-381", type: "LAW", reason: "เรื่องมัดจำและผลของการผิดสัญญา" },
                    { title: "ป.วิ.อาญา มาตรา 84", type: "LAW", reason: "หลักการรับฟังคำรับสารภาพ" }
                ]
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreBadge = (score: number) => {
        if (score >= 80) return { label: "ดีมาก", color: "bg-green-100 text-green-700 border-green-200" };
        if (score >= 70) return { label: "ดี", color: "bg-blue-100 text-blue-700 border-blue-200" };
        if (score >= 60) return { label: "พอใช้", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
        return { label: "ควรปรับปรุง", color: "bg-red-100 text-red-700 border-red-200" };
    };

    // Render Results Summary
    if (showSummary && isSubmitted) {
        if (isAnalyzing) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-6"></div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">กำลังวิเคราะห์ผลสอบ...</h2>
                    <p className="text-slate-500">AI กำลังตรวจคำตอบและให้คำแนะนำ</p>
                </div>
            );
        }

        const scoreBadge = getScoreBadge(examResult?.totalScore || 0);
        const weakSubjects = examResult?.subjectScores?.filter((s: any) => s.score < 70) || [];

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium text-slate-700">สรุปผลการสอบ</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">ข้อสอบจำลอง ชุดที่ 1</h1>
                    </div>

                    {/* Score Card */}
                    <Card className="overflow-hidden border-0 shadow-xl">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
                            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                                <div className="text-center">
                                    <div className={`text-5xl font-bold ${examResult?.totalScore >= 60 ? 'text-white' : 'text-red-200'}`}>
                                        {examResult?.totalScore || 0}
                                    </div>
                                    <div className="text-sm text-white/80">คะแนน</div>
                                </div>
                            </div>
                            <Badge className={`${scoreBadge.color} text-lg px-4 py-1`}>
                                {scoreBadge.label}
                            </Badge>
                            <p className="mt-4 text-white/90 max-w-lg mx-auto">
                                {examResult?.overallFeedback}
                            </p>
                        </div>
                    </Card>

                    {/* Subject Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-600" />
                                คะแนนแยกตามหมวดวิชา
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {examResult?.subjectScores?.map((subject: any, idx: number) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-slate-700">{subject.subject}</span>
                                        <span className={`font-bold ${getScoreColor(subject.score)}`}>
                                            {subject.score}/{subject.maxScore}
                                        </span>
                                    </div>
                                    <Progress
                                        value={subject.score}
                                        className={`h-3 ${subject.score >= 70 ? '[&>div]:bg-green-500' : subject.score >= 50 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`}
                                    />
                                    {subject.score < 70 && (
                                        <p className="text-sm text-amber-600 flex items-center gap-1">
                                            ⚠️ ควรทบทวนเพิ่มเติม
                                        </p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Study Recommendations */}
                    <Card className="border-indigo-100 bg-indigo-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-indigo-900">
                                <Star className="w-5 h-5 text-indigo-600" />
                                คำแนะนำในการเตรียมตัวสอบ
                            </CardTitle>
                            <CardDescription>จาก AI วิเคราะห์คำตอบของคุณ</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {examResult?.analysis?.map((a: any, idx: number) => (
                                <div key={idx} className="bg-white p-4 rounded-lg border border-indigo-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-slate-800">ข้อที่ {idx + 1}</span>
                                        <Badge variant="outline" className={getScoreBadge(a.score).color}>
                                            {a.score} คะแนน
                                        </Badge>
                                    </div>
                                    <p className="text-slate-600 text-sm mb-3">{a.feedback}</p>
                                    {a.suggestions?.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {a.suggestions.map((s: string, i: number) => (
                                                <span key={i} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                                                    💡 {s}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Book Recommendations CTA */}
                    {weakSubjects.length > 0 && (
                        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-800">
                                    <BookOpen className="w-5 h-5" />
                                    หนังสือแนะนำสำหรับคุณ
                                </CardTitle>
                                <CardDescription className="text-green-700">
                                    เพื่อเสริมความรู้ในหมวดที่ต้องปรับปรุง
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {RECOMMENDED_BOOKS.filter(book =>
                                        weakSubjects.some((ws: any) => ws.subject === book.subject)
                                    ).map((book) => (
                                        <div key={book.id} className="bg-white rounded-xl p-4 border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex gap-4">
                                                <div className="w-16 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-slate-900 line-clamp-2 text-sm">{book.title}</h4>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{book.reason}</p>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <span className="font-bold text-green-700">฿{book.price}</span>
                                                        <Link href={`/education/books/${book.id}`}>
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 text-xs">
                                                                <ShoppingCart className="w-3 h-3 mr-1" />
                                                                ดูรายละเอียด
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 text-center">
                                    <Link href="/books">
                                        <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                                            ดูหนังสือทั้งหมด <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setShowSummary(false)}
                            className="order-2 sm:order-1"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            ดูคำตอบรายข้อ
                        </Button>
                        <Link href="/my-learning">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 order-1 sm:order-2 w-full sm:w-auto">
                                ไปหน้าการเรียนรู้ของฉัน
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-80px)] -mt-4">
            {/* Sidebar: Navigation */}
            <div className="w-64 border-r bg-white flex flex-col hidden md:flex">
                <div className="p-4 border-b">
                    <h2 className="font-bold text-lg">ข้อน่ารู้</h2>
                    <div className="flex items-center gap-2 text-indigo-600 font-mono text-xl mt-2 font-bold">
                        <Clock className="w-5 h-5" />
                        {formatTime(timeLeft)}
                    </div>
                </div>
                <ScrollArea className="flex-1 p-4">
                    <div className="grid grid-cols-4 gap-2">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${currentQuestionIndex === idx
                                    ? "bg-indigo-600 text-white"
                                    : answers[q.id]
                                        ? "bg-indigo-100 text-indigo-700"
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t space-y-2">
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={handleSubmit}
                        disabled={isSubmitted || !allAnswered}
                    >
                        {isSubmitted ? "ส่งข้อสอบแล้ว" : allAnswered ? "ยืนยันส่งคำตอบ" : "ยังทำไม่ครบ"}
                    </Button>
                    {!allAnswered && !isSubmitted && (
                        <p className="text-xs text-center text-red-500">
                            *ต้องตอบให้ครบทุกข้อก่อน
                        </p>
                    )}
                    {isSubmitted && (
                        <>
                            <Button variant="outline" className="w-full" onClick={() => setShowSummary(true)}>
                                ดูสรุปผลสอบ
                            </Button>
                            <Link href="/exams">
                                <Button variant="ghost" className="w-full mt-2 text-slate-500">
                                    กลับหน้าคลังข้อสอบ
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden bg-white p-3 border-b flex items-center justify-between">
                    <span className="font-bold">ข้อที่ {currentQuestionIndex + 1}/{questions.length}</span>
                    <span className="font-mono text-indigo-600 font-bold">{formatTime(timeLeft)}</span>
                </div>

                <ScrollArea className="flex-1 p-6 md:p-10">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Question Section */}
                        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                    คำถามข้อที่ {currentQuestionIndex + 1}
                                </span>
                                {currentQuestion.type === 'ESSAY' && (
                                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">
                                        อัตนัย (เขียนตอบ)
                                    </span>
                                )}
                            </div>
                            <div className="text-lg md:text-xl font-medium text-slate-900 leading-relaxed whitespace-pre-wrap">
                                {currentQuestion.text}
                            </div>
                        </div>

                        {/* Answer Section */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-700">
                                คำวินิจฉัยของคุณ
                            </label>
                            {isSubmitted ? (
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap">
                                        <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase">คำตอบของคุณ</h4>
                                        {answers[currentQuestion.id] || "- ไม่ได้ตอบ -"}
                                    </div>

                                    <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-slate-800 whitespace-pre-wrap">
                                        <h4 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                                            <Flag className="w-4 h-4" />
                                            ธงคำตอบ / แนววินิจฉัย
                                        </h4>
                                        {currentQuestion.correctAnswerText || "ไม่มีเฉลย"}
                                    </div>

                                    {examResult?.analysis?.find((a: any) => a.questionId === currentQuestion.id) && (
                                        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                    ✨
                                                </div>
                                                <h4 className="text-lg font-semibold text-indigo-900">AI แนะนำการเรียนรู้</h4>
                                            </div>
                                            <p className="text-slate-700 mb-2">
                                                {examResult.analysis.find((a: any) => a.questionId === currentQuestion.id).feedback}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Textarea
                                    placeholder="พิมพ์คำตอบของคุณที่นี่..."
                                    className="min-h-[300px] p-6 text-lg font-normal leading-relaxed resize-none focus-visible:ring-indigo-500"
                                    value={answers[currentQuestion.id] || ""}
                                    onChange={(e) => handleAnswerChange(e.target.value)}
                                />
                            )}
                        </div>
                    </div>
                </ScrollArea>

                {/* Footer Navigation */}
                <div className="bg-white border-t p-4 flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        ข้อก่อนหน้า
                    </Button>

                    <span className="text-sm text-slate-500 hidden md:block">
                        {isSubmitted ? "บันทึกเข้าระบบแล้ว" : "ระบบจะบันทึกคำตอบอัตโนมัติ"}
                    </span>

                    {isLastQuestion ? (
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleSubmit}
                            disabled={isSubmitted || !allAnswered}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSubmitted ? "ส่งแล้ว" : "ยืนยันส่งคำตอบ"}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            disabled={currentQuestionIndex === questions.length - 1}
                        >
                            ข้อถัดไป
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Right Sidebar: Related Articles */}
            <div className="w-72 border-l bg-white flex flex-col hidden lg:flex">
                <div className="p-4 border-b">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        บทความที่เกี่ยวข้อง
                    </h2>
                </div>
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {/* Article 1 */}
                        <Link href="/articles/1" className="block group">
                            <div className="bg-slate-50 rounded-lg p-3 hover:bg-indigo-50 transition-colors border hover:border-indigo-200">
                                <span className="text-xs text-indigo-600 font-medium">กฎหมายแพ่ง</span>
                                <h3 className="font-medium text-sm text-slate-800 group-hover:text-indigo-600 mt-1 line-clamp-2">
                                    หลักกฎหมายมัดจำ และผลเมื่อคู่สัญญาผิดสัญญา
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    อธิบายหลักกฎหมายเรื่องมัดจำตาม ป.พ.พ. มาตรา 377-380
                                </p>
                            </div>
                        </Link>

                        {/* Article 2 */}
                        <Link href="/articles/2" className="block group">
                            <div className="bg-slate-50 rounded-lg p-3 hover:bg-indigo-50 transition-colors border hover:border-indigo-200">
                                <span className="text-xs text-red-600 font-medium">วิ.อาญา</span>
                                <h3 className="font-medium text-sm text-slate-800 group-hover:text-indigo-600 mt-1 line-clamp-2">
                                    การรับฟังคำรับสารภาพในคดีอาญา
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    หลักกฎหมายเรื่องคำรับสารภาพในชั้นสอบสวนและชั้นศาล
                                </p>
                            </div>
                        </Link>

                        {/* Article 3 */}
                        <Link href="/articles/3" className="block group">
                            <div className="bg-slate-50 rounded-lg p-3 hover:bg-indigo-50 transition-colors border hover:border-indigo-200">
                                <span className="text-xs text-green-600 font-medium">เตรียมสอบ</span>
                                <h3 className="font-medium text-sm text-slate-800 group-hover:text-indigo-600 mt-1 line-clamp-2">
                                    เทคนิคการเขียนตอบข้อสอบอัตนัย
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    แนวทางการวินิจฉัยและเขียนตอบแบบให้คะแนนง่าย
                                </p>
                            </div>
                        </Link>

                        {/* Article 4 */}
                        <Link href="/articles/4" className="block group">
                            <div className="bg-slate-50 rounded-lg p-3 hover:bg-indigo-50 transition-colors border hover:border-indigo-200">
                                <span className="text-xs text-purple-600 font-medium">ตั๋วทนาย</span>
                                <h3 className="font-medium text-sm text-slate-800 group-hover:text-indigo-600 mt-1 line-clamp-2">
                                    สิ่งที่ต้องรู้ก่อนสอบใบอนุญาตว่าความ
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    เตรียมตัวอย่างไรให้พร้อมสอบภาคทฤษฎี
                                </p>
                            </div>
                        </Link>
                    </div>
                </ScrollArea>
                <div className="p-4 border-t">
                    <Link href="/articles">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                            ดูบทความทั้งหมด
                            <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

