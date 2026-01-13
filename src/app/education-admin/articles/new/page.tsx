'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye } from 'lucide-react';
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

export default function CreateArticlePage() {
    const router = useRouter();
    const { toast } = useToast();
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

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^\w\sก-๙]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: generateSlug(title)
        }));
    };

    const handleSubmit = async (status: 'draft' | 'published') => {
        if (!formData.title.trim()) {
            toast({
                title: "กรุณากรอกชื่อบทความ",
                variant: "destructive"
            });
            return;
        }

        if (!formData.content.trim()) {
            toast({
                title: "กรุณากรอกเนื้อหาบทความ",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/education/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    status
                })
            });

            if (response.ok) {
                toast({
                    title: status === 'published' ? "เผยแพร่บทความสำเร็จ" : "บันทึกแบบร่างสำเร็จ",
                    description: `บทความ "${formData.title}" ถูกสร้างแล้ว`,
                });
                router.push('/education-admin/articles');
            } else {
                throw new Error('Failed to create article');
            }
        } catch (error) {
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถสร้างบทความได้",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        <h1 className="text-2xl font-bold text-slate-900">สร้างบทความใหม่</h1>
                        <p className="text-slate-500">เขียนและเผยแพร่บทความความรู้</p>
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
                        placeholder="เช่น เทคนิคการสอบทนายความภาคปฏิบัติ"
                        value={formData.title}
                        onChange={handleTitleChange}
                    />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Slug (URL)</label>
                    <Input
                        placeholder="article-slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    />
                    <p className="text-xs text-slate-500">
                        URL: /articles/{formData.slug || 'article-slug'}
                    </p>
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
                            placeholder="ชื่อผู้เขียน"
                            value={formData.author}
                            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">คำอธิบายสั้น</label>
                    <Textarea
                        placeholder="สรุปเนื้อหาบทความโดยย่อ (จะแสดงในหน้า Feed)"
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">รูปภาพปก (URL)</label>
                    <Input
                        placeholder="https://example.com/image.jpg"
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
                        placeholder="<h2>หัวข้อ</h2><p>เนื้อหา...</p>"
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
