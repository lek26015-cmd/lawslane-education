'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, FileText, Target, Play, BookOpen, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Exam {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    passingScore: number;
    totalQuestions: number;
    category: string;
    difficulty: string;
    coverImage: string;
}

const CATEGORY_LABELS: Record<string, string> = {
    license: 'ใบอนุญาตว่าความ',
    prosecutor: 'อัยการ',
    judge: 'ผู้พิพากษา',
    university: 'มหาวิทยาลัย',
    other: 'อื่นๆ'
};

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
    easy: { label: 'ง่าย', color: 'bg-green-100 text-green-700' },
    medium: { label: 'ปานกลาง', color: 'bg-amber-100 text-amber-700' },
    hard: { label: 'ยาก', color: 'bg-red-100 text-red-700' }
};

export default function ExamListingPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await fetch('/api/education/exams');
                if (response.ok) {
                    const data = await response.json();
                    setExams(data);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExams();
    }, []);

    const filteredExams = exams.filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exam.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || exam.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...new Set(exams.map(e => e.category))];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
            >
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-indigo-500" />
                    <Badge className="bg-indigo-100 text-indigo-700">AI ตรวจอัตนัย</Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                    ฝึกทำข้อสอบกฎหมาย
                </h1>
                <p className="text-slate-600 max-w-2xl mx-auto">
                    ข้อสอบจำลองพร้อมระบบ AI ตรวจคำตอบอัตนัย เปรียบเทียบกับธงคำตอบ
                    พร้อม feedback ละเอียดช่วยให้คุณพัฒนาการเขียนตอบได้ดีขึ้น
                </p>
            </motion.div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder="ค้นหาข้อสอบ..."
                        className="pl-10 h-12"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map(cat => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(cat)}
                            className="whitespace-nowrap"
                        >
                            {cat === 'all' ? 'ทั้งหมด' : CATEGORY_LABELS[cat] || cat}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Exam Grid */}
            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl border h-80 animate-pulse" />
                    ))}
                </div>
            ) : filteredExams.length === 0 ? (
                <div className="text-center py-16">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">ยังไม่มีข้อสอบในขณะนี้</p>
                </div>
            ) : (
                <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.1 } }
                    }}
                >
                    {filteredExams.map((exam, idx) => (
                        <motion.div
                            key={exam.id}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                        >
                            <Link href={`/exams/${exam.id}/take`} className="group block">
                                <div className="bg-white rounded-2xl border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full">
                                    {/* Cover */}
                                    <div className="relative aspect-video bg-gradient-to-br from-indigo-500 to-purple-600">
                                        {exam.coverImage ? (
                                            <Image src={exam.coverImage} alt={exam.title} fill className="object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <BookOpen className="w-16 h-16 text-white/30" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <Badge className={DIFFICULTY_LABELS[exam.difficulty]?.color || 'bg-slate-100'}>
                                                {DIFFICULTY_LABELS[exam.difficulty]?.label || exam.difficulty}
                                            </Badge>
                                        </div>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                <Play className="w-7 h-7 text-indigo-600 ml-1" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <Badge variant="outline" className="mb-2">{CATEGORY_LABELS[exam.category] || exam.category}</Badge>
                                        <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                            {exam.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{exam.description}</p>

                                        <div className="flex items-center justify-between text-sm text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                <span>{exam.totalQuestions} ข้อ</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{exam.durationMinutes} นาที</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Target className="w-4 h-4" />
                                                <span>{exam.passingScore}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
