'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
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

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        originalPrice: 0,
        coverImage: '',
        author: '',
        pages: 0,
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
                        coverImage: book.coverImage || '',
                        author: book.author || '',
                        pages: book.pages || 0,
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
                        <Input type="number" value={formData.pages} onChange={(e) => setFormData(prev => ({ ...prev, pages: Number(e.target.value) }))} />
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

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">รูปภาพปก (URL)</label>
                    <Input value={formData.coverImage} onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))} />
                    {formData.coverImage && (
                        <div className="mt-2 rounded-lg overflow-hidden border w-48">
                            <img src={formData.coverImage} alt="Preview" className="w-full h-64 object-cover" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
