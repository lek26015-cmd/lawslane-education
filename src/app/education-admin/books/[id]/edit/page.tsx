'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Loader2, Upload, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ['เตรียมสอบ', 'ข้อสอบเก่า', 'กฎหมายแพ่ง', 'กฎหมายอาญา', 'ทั่วไป'];
const TYPES = [
    { value: 'ebook', label: 'E-Book' },
    { value: 'physical', label: 'หนังสือเล่ม' },
    { value: 'both', label: 'ทั้ง E-Book และเล่ม' }
];

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        originalPrice: 0,
        coverUrl: '',
        author: '',
        pageCount: 0,
        category: 'ทั่วไป',
        type: 'ebook' as 'ebook' | 'physical' | 'both',
        status: 'draft' as 'draft' | 'published'
    });

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await fetch(`/api/education/books/${id}`);
                if (response.ok) {
                    const book = await response.json();
                    setFormData({
                        title: book.title,
                        description: book.description || '',
                        price: book.price,
                        originalPrice: book.originalPrice || 0,
                        coverUrl: book.coverUrl || '',
                        author: book.author || '',
                        pageCount: book.pageCount || 0,
                        category: book.category || 'ทั่วไป',
                        type: book.type || 'ebook',
                        status: book.status
                    });
                } else {
                    toast({ title: "ไม่พบหนังสือ", variant: "destructive" });
                    router.push('/education-admin/books');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBook();
    }, [id, router, toast]);

    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast({ title: "กรุณาเลือกไฟล์ภาพ", variant: "destructive" });
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast({ title: "ไฟล์ใหญ่เกิน 10MB", variant: "destructive" });
            return;
        }

        setIsUploading(true);
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('type', 'image');

            const response = await fetch('/api/education/upload', {
                method: 'POST',
                body: uploadData,
            });

            if (response.ok) {
                const result = await response.json();
                setFormData(prev => ({ ...prev, coverUrl: result.url }));
                toast({ title: "อัปโหลดภาพสำเร็จ" });
            } else {
                const err = await response.json();
                throw new Error(err.error || 'Upload failed');
            }
        } catch (error: any) {
            toast({ title: error.message || "อัปโหลดไม่สำเร็จ", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleImageUpload(file);
    };

    const handleSubmit = async (status: 'draft' | 'published') => {
        if (!formData.title.trim()) {
            toast({ title: "กรุณากรอกชื่อหนังสือ", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/education/books/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, status })
            });

            if (response.ok) {
                toast({ title: "บันทึกการแก้ไขสำเร็จ" });
                router.push('/education-admin/books');
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/education-admin/books">
                        <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">แก้ไขหนังสือ</h1>
                        <p className="text-slate-500">อัปเดตข้อมูลหนังสือ</p>
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

            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ชื่อหนังสือ *</label>
                    <Input value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">รายละเอียด</label>
                    <Textarea rows={4} value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">ราคา (บาท)</label>
                        <Input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">ราคาเดิม (บาท)</label>
                        <Input type="number" value={formData.originalPrice} onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: Number(e.target.value) }))} />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">ผู้เขียน</label>
                        <Input value={formData.author} onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">จำนวนหน้า</label>
                        <Input type="number" value={formData.pageCount} onChange={(e) => setFormData(prev => ({ ...prev, pageCount: Number(e.target.value) }))} />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">ประเภท</label>
                        <Select value={formData.type} onValueChange={(v: any) => setFormData(prev => ({ ...prev, type: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">หมวดหมู่</label>
                        <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">รูปภาพปก</label>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Upload Zone */}
                        <div
                            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                                isDragging 
                                    ? 'border-indigo-500 bg-indigo-50' 
                                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                            }`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file);
                                }}
                            />
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2 py-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                    <p className="text-sm text-slate-500">กำลังอัปโหลด...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 py-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <Upload className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">คลิกเพื่อเลือกภาพ หรือลากไฟล์มาวาง</p>
                                    <p className="text-xs text-slate-400">JPG, PNG, WebP (สูงสุด 10MB)</p>
                                </div>
                            )}
                        </div>

                        {/* Preview */}
                        <div className="flex flex-col gap-2">
                            {formData.coverUrl ? (
                                <div className="relative rounded-xl overflow-hidden border bg-slate-50 aspect-[3/4] max-h-64">
                                    <img 
                                        src={formData.coverUrl} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/images/lawslane-cover-book.png';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, coverUrl: '' }))}
                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="rounded-xl border bg-slate-50 aspect-[3/4] max-h-64 flex flex-col items-center justify-center text-slate-400">
                                    <ImageIcon className="w-10 h-10 mb-2" />
                                    <p className="text-sm">ไม่มีภาพปก</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* URL Input (fallback) */}
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400">หรือใส่ URL ภาพ</label>
                        <Input 
                            value={formData.coverUrl} 
                            onChange={(e) => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))} 
                            placeholder="https://..."
                            className="text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
