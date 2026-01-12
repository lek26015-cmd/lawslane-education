'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Course } from "@/lib/education-types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, ArrowUpDown, Book as BookIcon, Layers } from "lucide-react";
import { CourseCard } from "@/components/education/course-card";

interface AnimatedCourseGridProps {
    courses: Course[];
}

export function AnimatedCourseGrid({ courses }: AnimatedCourseGridProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [level, setLevel] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    // Extract unique categories from courses for the filter
    const categories = useMemo(() => {
        const cats = new Set(courses.map(c => c.category));
        return Array.from(cats);
    }, [courses]);

    const [category, setCategory] = useState('all');

    const filteredCourses = useMemo(() => {
        let result = [...courses];

        // Filter by Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(course =>
                course.title.toLowerCase().includes(query) ||
                course.description.toLowerCase().includes(query) ||
                course.instructor.name.toLowerCase().includes(query)
            );
        }

        // Filter by Level
        if (level !== 'all') {
            result = result.filter(course => course.level === level);
        }

        // Filter by Category
        if (category !== 'all') {
            result = result.filter(course => course.category === category);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'newest':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        return result;
    }, [courses, searchQuery, level, category, sortBy]);

    if (courses.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-xl">
                <p className="text-slate-500 text-lg">ยังไม่มีคอร์สเรียนเปิดสอนในขณะนี้</p>
                <p className="text-slate-400 text-sm mt-2">โปรดติดตามอัปเดตเร็วๆ นี้</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="ค้นหาคอร์ส, เนื้อหา หรือผู้สอน..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                </div>
                <div className="flex gap-4 flex-wrap md:flex-nowrap">
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-[150px] bg-slate-50 border-slate-200">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Filter className="w-4 h-4" />
                                <SelectValue placeholder="หมวดหมู่" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger className="w-[150px] bg-slate-50 border-slate-200">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Layers className="w-4 h-4" />
                                <SelectValue placeholder="ระดับความยาก" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทุกระดับ</SelectItem>
                            <SelectItem value="Beginner">เบื้องต้น (Beginner)</SelectItem>
                            <SelectItem value="Intermediate">ปานกลาง (Intermediate)</SelectItem>
                            <SelectItem value="Advanced">สูง (Advanced)</SelectItem>
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
                            <SelectItem value="rating">คะแนนรีวิวสูงสุด</SelectItem>
                            <SelectItem value="price_asc">ราคา: ต่ำ - สูง</SelectItem>
                            <SelectItem value="price_desc">ราคา: สูง - ต่ำ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grid */}
            {filteredCourses.length > 0 ? (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
                    {filteredCourses.map((course) => (
                        <motion.div
                            key={course.id}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            className="h-full"
                        >
                            <CourseCard course={course} />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-lg">ไม่พบคอร์สที่ค้นหา</p>
                    <p className="text-slate-400 text-sm mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองดูนะครับ</p>
                    <Button
                        variant="link"
                        onClick={() => { setSearchQuery(''); setLevel('all'); setCategory('all'); }}
                        className="mt-2 text-indigo-600"
                    >
                        ล้างตัวกรอง
                    </Button>
                </div>
            )}
        </div>
    );
}
