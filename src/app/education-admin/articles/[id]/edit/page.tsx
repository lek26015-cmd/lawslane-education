'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = [
    'เทคนิคการสอบ',
    'กฎหมายแพ่ง',
    'กฎหมายอาญา',
    'กฎหมายมหาชน',
    'กฎหมายธุรกิจ',
    'ทั่วไป'
];

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        content: '',
        category: 'ทั่วไป',
        coverImage: '',
        author: 'Admin',
        status: 'draft' as 'draft' | 'published'
    });

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await fetch(`/api/education/articles/${id}`);
                if (response.ok) {
                    const article = await response.json();
                    setFormData({
                        title: article.title,
                        slug: article.slug,
                        description: article.description || '',
                        content: article.content,
                        category: article.category,
                        coverImage: article.coverImage || '',
                        author: article.author,
                        status: article.status
                    });
                } else {
                    toast({
                        title: "ไม่พบบทความ",
                        variant: "destructive"
                    });
                    router.push('/education-admin/articles');
                }
            } catch (error) {
                console.error('Error fetching article:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticle();
    }, [id, router, toast]);

    const handleSubmit = async (status: 'draft' | 'published') => {
        if (!formData.title.trim() || !formData.content.trim()) {
            toast({
                title: "กรุณากรอกข้อมูลให้ครบ",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/education/articles/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    status
                })
            });

            if (response.ok) {
                toast({
                    title: "บันทึกการแก้ไขสำเร็จ",
                    description: `บทความ "${formData.title}" ถูกอัปเดตแล้ว`,
                });
                router.push('/education-admin/articles');
            } else {
                throw new Error('Failed to update article');
            }
        } catch (error) {
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถบันทึกการแก้ไขได้",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
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
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/education-admin/articles">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">แก้ไขบทความ</h1>
                        <p className="text-slate-500">อัปเดตเนื้อหาบทความ</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleSubmit('draft')}
                        disabled={isSubmitting}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        บันทึกแบบร่าง
                    </Button>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => handleSubmit('published')}
                        disabled={isSubmitting}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        เผยแพร่
                    </Button>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ชื่อบทความ *</label>
                    <Input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Slug (URL)</label>
                    <Input
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">หมวดหมู่</label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Author */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">ผู้เขียน</label>
                        <Input
                            value={formData.author}
                            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">คำอธิบายสั้น</label>
                    <Textarea
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">รูปภาพปก (URL)</label>
                    <Input
                        value={formData.coverImage}
                        onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                    />
                    {formData.coverImage && (
                        <div className="mt-2 rounded-lg overflow-hidden border w-48">
                            <img src={formData.coverImage} alt="Preview" className="w-full h-32 object-cover" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">เนื้อหาบทความ * (รองรับ HTML)</label>
                    <Textarea
                        rows={12}
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        className="font-mono text-sm"
                    />
                </div>
            </div>
        </div>
    );
}
