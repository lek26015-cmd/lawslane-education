'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, MoreHorizontal, BookOpen } from 'lucide-react';
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

interface Book {
    id: string;
    title: string;
    author: string;
    price: number;
    pages: number;
    type: string;
    status: 'draft' | 'published';
}

export default function AdminBooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
    const { toast } = useToast();

    const fetchBooks = async () => {
        try {
            const response = await fetch('/api/education/books?all=true');
            if (response.ok) {
                const data = await response.json();
                setBooks(data);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleDelete = async () => {
        if (!bookToDelete) return;

        try {
            const response = await fetch(`/api/education/books/${bookToDelete.id}`, { method: 'DELETE' });

            if (response.ok) {
                toast({ title: "ลบหนังสือสำเร็จ" });
                fetchBooks();
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
        } finally {
            setDeleteDialogOpen(false);
            setBookToDelete(null);
        }
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(price);
    };

    const typeLabel = (type: string) => {
        switch (type) {
            case 'ebook': return 'E-Book';
            case 'physical': return 'เล่ม';
            case 'both': return 'ทั้งสอง';
            default: return type;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">จัดการหนังสือ</h1>
                    <p className="text-slate-500">สร้าง แก้ไข และจัดการหนังสือ E-Book</p>
                </div>
                <Link href="/education-admin/books/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-2" />เพิ่มหนังสือใหม่
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="ค้นหาหนังสือ..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Badge variant="secondary">{filteredBooks.length} เล่ม</Badge>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredBooks.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">ยังไม่มีหนังสือ</p>
                        <Link href="/education-admin/books/new">
                            <Button className="mt-4" variant="outline">เพิ่มหนังสือแรก</Button>
                        </Link>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[350px]">ชื่อหนังสือ</TableHead>
                                <TableHead>ผู้เขียน</TableHead>
                                <TableHead>ราคา</TableHead>
                                <TableHead>ประเภท</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBooks.map((book) => (
                                <TableRow key={book.id}>
                                    <TableCell>
                                        <p className="font-medium text-slate-900 line-clamp-1">{book.title}</p>
                                    </TableCell>
                                    <TableCell className="text-slate-600">{book.author}</TableCell>
                                    <TableCell className="font-medium">{formatPrice(book.price)}</TableCell>
                                    <TableCell><Badge variant="outline">{typeLabel(book.type)}</Badge></TableCell>
                                    <TableCell>
                                        <Badge className={book.status === 'published' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}>
                                            {book.status === 'published' ? 'เผยแพร่' : 'แบบร่าง'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/books/${book.id}`} target="_blank"><Eye className="w-4 h-4 mr-2" />ดูหนังสือ</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/education-admin/books/${book.id}/edit`}><Edit className="w-4 h-4 mr-2" />แก้ไข</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => { setBookToDelete(book); setDeleteDialogOpen(true); }}>
                                                    <Trash2 className="w-4 h-4 mr-2" />ลบ
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

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                        <AlertDialogDescription>คุณต้องการลบหนังสือ "{bookToDelete?.title}" ใช่หรือไม่?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">ลบหนังสือ</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
