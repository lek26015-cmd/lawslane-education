'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface Article {
    id: string;
    slug: string;
    title: string;
    category: string;
    status: 'draft' | 'published';
    views: number;
    author: string;
    createdAt: string;
}

export default function AdminArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
    const { toast } = useToast();

    const fetchArticles = async () => {
        try {
            const response = await fetch('/api/education/articles?all=true');
            if (response.ok) {
                const data = await response.json();
                setArticles(data);
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleDelete = async () => {
        if (!articleToDelete) return;

        try {
            const response = await fetch(`/api/education/articles/${articleToDelete.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast({
                    title: "ลบบทความสำเร็จ",
                    description: `บทความ "${articleToDelete.title}" ถูกลบแล้ว`,
                });
                fetchArticles();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถลบบทความได้",
                variant: "destructive"
            });
        } finally {
            setDeleteDialogOpen(false);
            setArticleToDelete(null);
        }
    };

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">จัดการบทความ</h1>
                    <p className="text-slate-500">สร้าง แก้ไข และจัดการบทความทั้งหมด</p>
                </div>
                <Link href="/education-admin/articles/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-2" />
                        สร้างบทความใหม่
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="ค้นหาบทความ..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Badge variant="secondary">{filteredArticles.length} บทความ</Badge>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        ไม่พบบทความ
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[400px]">ชื่อบทความ</TableHead>
                                <TableHead>หมวดหมู่</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead className="text-right">การดู</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredArticles.map((article) => (
                                <TableRow key={article.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-900 line-clamp-1">{article.title}</p>
                                            <p className="text-xs text-slate-500">โดย {article.author}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{article.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={article.status === 'published'
                                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                            }
                                        >
                                            {article.status === 'published' ? 'เผยแพร่' : 'แบบร่าง'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-slate-600">
                                        {article.views.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/articles/${article.slug}`} target="_blank">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        ดูบทความ
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/education-admin/articles/${article.id}/edit`}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        แก้ไข
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => {
                                                        setArticleToDelete(article);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    ลบ
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณต้องการลบบทความ "{articleToDelete?.title}" ใช่หรือไม่?
                            การกระทำนี้ไม่สามารถย้อนกลับได้
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            ลบบทความ
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
