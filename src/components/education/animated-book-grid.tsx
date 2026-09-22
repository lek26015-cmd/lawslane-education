'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Book } from "@/lib/education-types";
import { BookCard } from "@/components/education/book-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Download, Crown, Lock } from 'lucide-react';
import { Search, Filter, ArrowUpDown, Book as BookIcon } from "lucide-react";
import { useEbookDownload } from '@/hooks/use-ebook-download';
import { useToast } from '@/hooks/use-toast';
import Link from "next/link";

interface AnimatedBookGridProps {
    books: Book[];
}

function BookCoverImage({ src, alt }: { src: string; alt: string }) {
    const [hasError, setHasError] = useState(false);

    // Extract LAW code like "LAW4008" from alt text
    const lawCode = alt.match(/LAW\d+/)?.[0] || '';

    if (hasError || !src) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-sky-800 to-sky-600 flex flex-col items-center justify-center p-4 text-white">
                <BookOpen className="w-12 h-12 mb-3 opacity-80" />
                {lawCode && (
                    <span className="text-lg font-bold opacity-90">{lawCode}</span>
                )}
                <span className="text-xs opacity-60 mt-1 text-center line-clamp-2">
                    {alt.slice(0, 40)}
                </span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className="object-cover w-full h-full"
            onError={() => setHasError(true)}
        />
    );
}

/**
 * ปุ่มดาวน์โหลด E-Book สำหรับ Premium+ 
 * - Free: แสดง lock + ลิงก์ไป pricing
 * - Premium: ดาวน์โหลดได้ 5 ชุด/วัน
 */
function EbookDownloadButton({ book }: { book: Book }) {
    const { isPremium, canDownload, remaining, isLimitReached, recordDownload } = useEbookDownload();
    const { toast } = useToast();

    const handleDownload = () => {
        if (!canDownload) return;

        const allowed = recordDownload(book.id);
        if (!allowed) {
            toast({
                title: 'ครบโควต้าดาวน์โหลดวันนี้แล้ว',
                description: `Premium สามารถดาวน์โหลดได้ 5 เล่ม/วัน กลับมาใหม่พรุ่งนี้นะครับ`,
                variant: 'destructive',
            });
            return;
        }

        // ถ้ามี fileUrl ให้เปิดลิงก์ดาวน์โหลด
        if (book.fileUrl) {
            window.open(book.fileUrl, '_blank');
        } else {
            toast({
                title: 'ไฟล์ยังไม่พร้อม',
                description: 'E-Book เล่มนี้กำลังเตรียมไฟล์อยู่ โปรดลองอีกครั้งในภายหลัง',
            });
        }
    };

    // Free user — แสดง lock
    if (!isPremium) {
        return (
            <Link href="/pricing" className="w-full">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-sky-200 text-sky-500 hover:bg-sky-50 hover:text-sky-700 text-xs h-8"
                >
                    <Lock className="w-3 h-3 mr-1.5" />
                    Premium เท่านั้น
                    <Crown className="w-3 h-3 ml-1.5 text-sky-400" />
                </Button>
            </Link>
        );
    }

    // Premium แต่ครบโควต้า
    if (isLimitReached) {
        return (
            <Button
                variant="outline"
                size="sm"
                disabled
                className="w-full text-xs h-8 border-slate-200 text-slate-400"
            >
                ครบโควต้าวันนี้ (5/5)
            </Button>
        );
    }

    // Premium — ดาวน์โหลดได้
    return (
        <Button
            onClick={handleDownload}
            size="sm"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white text-xs h-8"
        >
            <Download className="w-3 h-3 mr-1.5" />
            ดาวน์โหลดฟรี
            <span className="ml-1.5 opacity-70">({remaining}/5)</span>
        </Button>
    );
}

export function AnimatedBookGrid({ books }: AnimatedBookGridProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [bookType, setBookType] = useState('all');
    const [level, setLevel] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const filteredBooks = useMemo(() => {
        let result = [...books];

        // Filter by Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query) ||
                book.description.toLowerCase().includes(query)
            );
        }

        // Filter by Type
        if (bookType !== 'all') {
            const isDigital = bookType === 'ebook';
            result = result.filter(book => book.isDigital === isDigital);
        }

        // Filter by Level
        if (level !== 'all') {
            result = result.filter(book => book.level === level);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                case 'newest':
                default:
                    // Assuming createdAt exists or fallback to 0
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            }
        });

        return result;
    }, [books, searchQuery, bookType, level, sortBy]);

    if (books.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-xl">
                <p className="text-slate-500 text-lg">ยังไม่มีหนังสือวางจำหน่ายในขณะนี้</p>
                <p className="text-slate-400 text-sm mt-2">โปรดติดตามอัปเดตเร็วๆ นี้</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="ค้นหาชื่อหนังสือ หรือผู้แต่ง..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                </div>
                <div className="flex gap-4 flex-wrap md:flex-nowrap">
                    <Select value={bookType} onValueChange={setBookType}>
                        <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Filter className="w-4 h-4" />
                                <SelectValue placeholder="ประเภท" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทุกประเภท</SelectItem>
                            <SelectItem value="physical">หนังสือเล่ม</SelectItem>
                            <SelectItem value="ebook">E-Book</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200">
                            <div className="flex items-center gap-2 text-slate-600">
                                <BookIcon className="w-4 h-4" />
                                <SelectValue placeholder="ระดับชั้น" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทุกระดับชั้น</SelectItem>
                            <SelectItem value="ชั้นปริญญาตรี">ชั้นปริญญาตรี</SelectItem>
                            <SelectItem value="เนติบัณฑิต">เนติบัณฑิต</SelectItem>
                            <SelectItem value="ใบอนุญาตว่าความ">ใบอนุญาตว่าความ</SelectItem>
                            <SelectItem value="ผู้ช่วยผู้พิพากษา">ผู้ช่วยผู้พิพากษา</SelectItem>
                            <SelectItem value="ทักษะปฏิบัติ">ทักษะปฏิบัติ</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200">
                            <div className="flex items-center gap-2 text-slate-600">
                                <ArrowUpDown className="w-4 h-4" />
                                <SelectValue placeholder="เรียงลำดับ" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">มาใหม่ล่าสุด</SelectItem>
                            <SelectItem value="price_asc">ราคา: ต่ำ - สูง</SelectItem>
                            <SelectItem value="price_desc">ราคา: สูง - ต่ำ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grid */}
            {filteredBooks.length > 0 ? (
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.1 }
                        }
                    }}
                >
                    {filteredBooks.map((book) => (
                        <motion.div
                            key={book.id}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                            <BookCard
                                id={book.id}
                                title={book.title}
                                coverUrl={book.coverUrl}
                                price={book.price}
                                originalPrice={book.originalPrice}
                                description={book.description}
                                author={book.author}
                                level={book.level}
                                pageCount={book.pageCount}
                                isEbook={book.isDigital}
                                href={`/books/${book.id}`}
                                footerExtra={book.isDigital ? <EbookDownloadButton book={book} /> : undefined}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-lg">ไม่พบหนังสือที่ค้นหา</p>
                    <p className="text-slate-400 text-sm mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองดูนะครับ</p>
                    <Button
                        variant="link"
                        onClick={() => { setSearchQuery(''); setBookType('all'); }}
                        className="mt-2 text-sky-600"
                    >
                        ล้างตัวกรอง
                    </Button>
                </div>
            )}
        </div>
    );
}
