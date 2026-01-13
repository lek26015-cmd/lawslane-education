import React from 'react';
import Link from 'next/link';
import {
    Users,
    FileText,
    BookOpen,
    GraduationCap,
    Eye,
    ArrowUpRight,
    ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStats, getArticles, getCourses, getBooks } from '@/lib/mock-store';

export default function AdminDashboardPage() {
    const stats = getStats();
    const recentArticles = getArticles().slice(0, 3);
    const recentCourses = getCourses().slice(0, 3);

    const STATS = [
        {
            title: 'บทความ',
            value: stats.totalArticles.toString(),
            icon: FileText,
            change: `${stats.publishedArticles} เผยแพร่`,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            href: '/education-admin/articles'
        },
        {
            title: 'คอร์สเรียน',
            value: stats.totalCourses.toString(),
            icon: GraduationCap,
            change: `${stats.publishedCourses} เผยแพร่`,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            href: '/education-admin/courses'
        },
        {
            title: 'หนังสือ',
            value: stats.totalBooks.toString(),
            icon: BookOpen,
            change: `${stats.publishedBooks} เผยแพร่`,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            href: '/education-admin/books'
        },
        {
            title: 'การดูทั้งหมด',
            value: stats.totalViews.toLocaleString(),
            icon: Eye,
            change: 'บทความ',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/education-admin/articles'
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">ภาพรวมระบบ (Dashboard)</h1>
                <p className="text-slate-500">ยินดีต้อนรับสู่ระบบจัดการ Lawslane Education</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((stat, index) => (
                    <Link key={index} href={stat.href}>
                        <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    <span className="flex items-center text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                                        {stat.change}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">บทความล่าสุด</CardTitle>
                        <Link href="/education-admin/articles" className="text-sm text-indigo-600 hover:underline flex items-center">
                            ดูทั้งหมด <ChevronRight className="w-4 h-4" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentArticles.length === 0 ? (
                                <p className="text-slate-400 text-center py-4">ยังไม่มีบทความ</p>
                            ) : (
                                recentArticles.map((article) => (
                                    <div key={article.id} className="flex items-center gap-4 py-2 border-b last:border-0 border-slate-50">
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                                            {article.coverImage && (
                                                <img src={article.coverImage} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 truncate">{article.title}</p>
                                            <p className="text-xs text-slate-500">โดย {article.author} • {article.views} views</p>
                                        </div>
                                        <Badge className={article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                                            {article.status === 'published' ? 'เผยแพร่' : 'แบบร่าง'}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">คอร์สเรียน</CardTitle>
                        <Link href="/education-admin/courses" className="text-sm text-indigo-600 hover:underline flex items-center">
                            ดูทั้งหมด <ChevronRight className="w-4 h-4" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentCourses.length === 0 ? (
                                <p className="text-slate-400 text-center py-4">ยังไม่มีคอร์ส</p>
                            ) : (
                                recentCourses.map((course) => (
                                    <div key={course.id} className="flex items-center gap-4 py-2 border-b last:border-0 border-slate-50">
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                                            {course.coverImage && (
                                                <img src={course.coverImage} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 truncate">{course.title}</p>
                                            <p className="text-xs text-slate-500">{course.instructor} • {course.lessons} บท</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">฿{course.price.toLocaleString()}</p>
                                            <Badge className={course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                                                {course.status === 'published' ? 'เผยแพร่' : 'แบบร่าง'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
