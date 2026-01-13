'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Plus, Edit, Trash2, Loader2, GripVertical, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface Question {
    id: string;
    examId: string;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'ESSAY';
    options?: string[];
    correctOptionIndex?: number;
    correctAnswerText?: string;
    explanation?: string;
    order: number;
    subject?: string;
}

const CATEGORIES = [
    { value: 'license', label: 'ใบอนุญาตว่าความ' },
    { value: 'prosecutor', label: 'อัยการ' },
    { value: 'judge', label: 'ผู้พิพากษา' },
    { value: 'university', label: 'มหาวิทยาลัย' },
    { value: 'other', label: 'อื่นๆ' }
];

const DIFFICULTIES = [
    { value: 'easy', label: 'ง่าย' },
    { value: 'medium', label: 'ปานกลาง' },
    { value: 'hard', label: 'ยาก' }
];

export default function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        durationMinutes: 60,
        passingScore: 60,
        category: 'license',
        difficulty: 'medium',
        coverImage: '',
        status: 'draft' as 'draft' | 'published'
    });

    const [questions, setQuestions] = useState<Question[]>([]);
    const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    // AI Generation
    const [aiDialogOpen, setAiDialogOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiQuestionType, setAiQuestionType] = useState<'MIXED' | 'MULTIPLE_CHOICE' | 'ESSAY'>('MIXED');
    const [aiCount, setAiCount] = useState(5);

    const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
        text: '',
        type: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        correctAnswerText: '',
        explanation: '',
        subject: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/education/exams/${id}?questions=true`);
                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        title: data.title,
                        description: data.description || '',
                        durationMinutes: data.durationMinutes,
                        passingScore: data.passingScore,
                        category: data.category,
                        difficulty: data.difficulty,
                        coverImage: data.coverImage || '',
                        status: data.status
                    });
                    setQuestions(data.questions || []);
                } else {
                    toast({ title: "ไม่พบข้อสอบ", variant: "destructive" });
                    router.push('/education-admin/exams');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, router, toast]);

    const handleSubmit = async (status: 'draft' | 'published') => {
        if (!formData.title.trim()) {
            toast({ title: "กรุณากรอกชื่อข้อสอบ", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/education/exams/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, status })
            });

            if (response.ok) {
                toast({ title: "บันทึกการแก้ไขสำเร็จ" });
                router.push('/education-admin/exams');
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openAddQuestion = () => {
        setEditingQuestion(null);
        setNewQuestion({
            text: '',
            type: 'MULTIPLE_CHOICE',
            options: ['', '', '', ''],
            correctOptionIndex: 0,
            correctAnswerText: '',
            explanation: '',
            subject: ''
        });
        setQuestionDialogOpen(true);
    };

    const openEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        setNewQuestion({
            text: question.text,
            type: question.type,
            options: question.options || ['', '', '', ''],
            correctOptionIndex: question.correctOptionIndex || 0,
            correctAnswerText: question.correctAnswerText || '',
            explanation: question.explanation || '',
            subject: question.subject || ''
        });
        setQuestionDialogOpen(true);
    };

    const handleSaveQuestion = async () => {
        if (!newQuestion.text?.trim()) {
            toast({ title: "กรุณากรอกคำถาม", variant: "destructive" });
            return;
        }

        try {
            if (editingQuestion) {
                const response = await fetch(`/api/education/questions/${editingQuestion.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newQuestion)
                });

                if (response.ok) {
                    const updated = await response.json();
                    setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? updated : q));
                    toast({ title: "แก้ไขคำถามสำเร็จ" });
                }
            } else {
                const response = await fetch(`/api/education/exams/${id}/questions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newQuestion)
                });

                if (response.ok) {
                    const created = await response.json();
                    setQuestions(prev => [...prev, created]);
                    toast({ title: "เพิ่มคำถามสำเร็จ" });
                }
            }
        } catch (error) {
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
        } finally {
            setQuestionDialogOpen(false);
        }
    };

    const handleDeleteQuestion = async () => {
        if (!questionToDelete) return;

        try {
            const response = await fetch(`/api/education/questions/${questionToDelete.id}`, { method: 'DELETE' });

            if (response.ok) {
                setQuestions(prev => prev.filter(q => q.id !== questionToDelete.id));
                toast({ title: "ลบคำถามสำเร็จ" });
            }
        } catch (error) {
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
        } finally {
            setDeleteDialogOpen(false);
            setQuestionToDelete(null);
        }
    };

    const handleGenerateWithAI = async () => {
        if (!aiTopic.trim()) {
            toast({ title: "กรุณาระบุหัวข้อ", variant: "destructive" });
            return;
        }

        setIsGenerating(true);

        try {
            const response = await fetch('/api/education/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: aiTopic,
                    category: formData.category,
                    difficulty: formData.difficulty,
                    questionType: aiQuestionType,
                    count: aiCount
                })
            });

            if (response.ok) {
                const data = await response.json();

                // Add each generated question to the exam
                for (const q of data.questions) {
                    const res = await fetch(`/api/education/exams/${id}/questions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(q)
                    });

                    if (res.ok) {
                        const created = await res.json();
                        setQuestions(prev => [...prev, created]);
                    }
                }

                toast({
                    title: "สร้างคำถามสำเร็จ",
                    description: `เพิ่ม ${data.questions.length} คำถามจาก AI`
                });
                setAiDialogOpen(false);
                setAiTopic('');
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            toast({ title: "ไม่สามารถสร้างคำถามได้", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/education-admin/exams">
                        <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">แก้ไขข้อสอบ</h1>
                        <p className="text-slate-500">อัปเดตข้อมูลและจัดการคำถาม</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={isSubmitting}>
                        <Save className="w-4 h-4 mr-2" />บันทึกแบบร่าง
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSubmit('published')} disabled={isSubmitting}>
                        <Eye className="w-4 h-4 mr-2" />เผยแพร่
                    </Button>
                </div>
            </div>

            {/* Exam Details */}
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
                <h2 className="font-semibold text-lg text-slate-900">ข้อมูลข้อสอบ</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">ชื่อข้อสอบ *</label>
                        <Input value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">หมวดหมู่</label>
                        <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">รายละเอียด</label>
                    <Textarea rows={2} value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">ระดับความยาก</label>
                        <Select value={formData.difficulty} onValueChange={(v) => setFormData(prev => ({ ...prev, difficulty: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {DIFFICULTIES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">เวลา (นาที)</label>
                        <Input type="number" value={formData.durationMinutes} onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">คะแนนผ่าน (%)</label>
                        <Input type="number" value={formData.passingScore} onChange={(e) => setFormData(prev => ({ ...prev, passingScore: Number(e.target.value) }))} />
                    </div>
                </div>
            </div>

            {/* Questions Section */}
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-lg text-slate-900">คำถาม</h2>
                        <p className="text-sm text-slate-500">{questions.length} ข้อ</p>
                    </div>
                    <Button onClick={openAddQuestion}>
                        <Plus className="w-4 h-4 mr-2" />เพิ่มคำถาม
                    </Button>
                    <Button onClick={() => setAiDialogOpen(true)} variant="outline" className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100">
                        <Sparkles className="w-4 h-4 mr-2" />สร้างด้วย AI
                    </Button>
                </div>

                {questions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        ยังไม่มีคำถาม - กดปุ่ม "เพิ่มคำถาม" เพื่อเริ่มต้น
                    </div>
                ) : (
                    <div className="space-y-3">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="flex items-start gap-3 p-4 rounded-lg border bg-slate-50 hover:bg-slate-100 transition-colors">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-900 line-clamp-2">{q.text}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs">
                                            {q.type === 'MULTIPLE_CHOICE' ? 'ปรนัย' : 'อัตนัย'}
                                        </Badge>
                                        {q.subject && <Badge variant="secondary" className="text-xs">{q.subject}</Badge>}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditQuestion(q)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => { setQuestionToDelete(q); setDeleteDialogOpen(true); }}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Question Dialog */}
            <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingQuestion ? 'แก้ไขคำถาม' : 'เพิ่มคำถามใหม่'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">คำถาม *</label>
                            <Textarea rows={3} value={newQuestion.text} onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ประเภท</label>
                                <Select value={newQuestion.type} onValueChange={(v: any) => setNewQuestion(prev => ({ ...prev, type: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MULTIPLE_CHOICE">ปรนัย (Multiple Choice)</SelectItem>
                                        <SelectItem value="ESSAY">อัตนัย (Essay)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">หมวดวิชา</label>
                                <Input value={newQuestion.subject} onChange={(e) => setNewQuestion(prev => ({ ...prev, subject: e.target.value }))} />
                            </div>
                        </div>

                        {newQuestion.type === 'MULTIPLE_CHOICE' ? (
                            <div className="space-y-3">
                                <label className="text-sm font-medium">ตัวเลือก</label>
                                {newQuestion.options?.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="correct"
                                            checked={newQuestion.correctOptionIndex === idx}
                                            onChange={() => setNewQuestion(prev => ({ ...prev, correctOptionIndex: idx }))}
                                            className="w-4 h-4 text-indigo-600"
                                        />
                                        <span className="text-sm text-slate-500 w-6">{idx + 1}.</span>
                                        <Input
                                            value={opt}
                                            placeholder={`ตัวเลือกที่ ${idx + 1}`}
                                            onChange={(e) => {
                                                const newOpts = [...(newQuestion.options || [])];
                                                newOpts[idx] = e.target.value;
                                                setNewQuestion(prev => ({ ...prev, options: newOpts }));
                                            }}
                                        />
                                    </div>
                                ))}
                                <p className="text-xs text-slate-500">เลือกตัวเลือกที่ถูกต้องด้วยปุ่มวงกลม</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ธงคำตอบ</label>
                                <Textarea
                                    rows={6}
                                    placeholder="เขียนคำตอบที่ถูกต้อง/ธงคำตอบ"
                                    value={newQuestion.correctAnswerText}
                                    onChange={(e) => setNewQuestion(prev => ({ ...prev, correctAnswerText: e.target.value }))}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">คำอธิบาย</label>
                            <Textarea
                                rows={2}
                                placeholder="อธิบายเพิ่มเติม (optional)"
                                value={newQuestion.explanation}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setQuestionDialogOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleSaveQuestion}>บันทึก</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Question Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ลบคำถาม</AlertDialogTitle>
                        <AlertDialogDescription>คุณต้องการลบคำถามนี้ใช่หรือไม่?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteQuestion} className="bg-red-600 hover:bg-red-700">ลบ</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* AI Generation Dialog */}
            <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            สร้างคำถามด้วย AI
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">หัวข้อ/เนื้อหาที่ต้องการ *</label>
                            <Textarea
                                rows={3}
                                placeholder="เช่น กฎหมายแพ่งเรื่องสัญญา, ความรับผิดทางละเมิด, หลักกฎหมายอาญา มาตรา 59..."
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ประเภทคำถาม</label>
                                <Select value={aiQuestionType} onValueChange={(v: any) => setAiQuestionType(v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MIXED">ผสม (ปรนัย+อัตนัย)</SelectItem>
                                        <SelectItem value="MULTIPLE_CHOICE">ปรนัยเท่านั้น</SelectItem>
                                        <SelectItem value="ESSAY">อัตนัยเท่านั้น</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">จำนวนข้อ</label>
                                <Select value={aiCount.toString()} onValueChange={(v) => setAiCount(Number(v))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="3">3 ข้อ</SelectItem>
                                        <SelectItem value="5">5 ข้อ</SelectItem>
                                        <SelectItem value="10">10 ข้อ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-700">
                            <p className="font-medium mb-1">💡 Tips:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>ระบุหัวข้อให้ชัดเจน จะได้คำถามตรงประเด็น</li>
                                <li>AI จะสร้างธงคำตอบให้อัตโนมัติ</li>
                                <li>สามารถแก้ไขคำถามที่สร้างได้ภายหลัง</li>
                            </ul>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAiDialogOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleGenerateWithAI} disabled={isGenerating} className="bg-purple-600 hover:bg-purple-700">
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    กำลังสร้าง...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    สร้างคำถาม
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

