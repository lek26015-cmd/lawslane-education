'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Book } from "@/lib/education-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowUpDown, Book as BookIcon } from "lucide-react";
import Link from "next/link";

interface AnimatedBookGridProps {
    books: Book[];
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
                            <Card className="flex flex-col h-full hover:shadow-lg transition-shadow bg-white border-slate-200">
                                <CardHeader className="p-0 overflow-hidden rounded-t-xl bg-slate-100 relative aspect-[2/3]">
                                    <img
                                        src={book.coverUrl}
                                        alt={book.title}
                                        className="object-cover w-full h-full"
                                    />
                                    {book.isDigital && (
                                        <Badge className="absolute top-2 right-2 bg-indigo-600 hover:bg-indigo-700">E-Book</Badge>
                                    )}
                                </CardHeader>
                                <CardContent className="flex-1 p-4">
                                    <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 min-h-[3rem] text-slate-900">
                                        {book.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                                        {book.description}
                                    </p>
                                    {book.level && (
                                        <Badge variant="outline" className="mb-3 text-xs font-normal text-slate-500 border-slate-300">
                                            {book.level}
                                        </Badge>
                                    )}
                                    <div className="text-sm text-slate-500 flex items-center gap-1">
                                        <span className="font-medium">ผู้แต่ง:</span> {book.author}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0 flex items-center justify-between mt-auto">
                                    <span className="text-lg font-bold text-indigo-700">
                                        ฿{book.price.toLocaleString()}
                                    </span>
                                    <Link href={`/education/books/${book.id}`}>
                                        <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                            ดูรายละเอียด
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
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
                        className="mt-2 text-indigo-600"
                    >
                        ล้างตัวกรอง
                    </Button>
                </div>
            )}
        </div>
    );
}
