'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    FatExam,
    FatBook,
    FatCheckCircle,
    FatFile,
    FatSparkle,
} from '@/components/fat-icons';
import { Loader2, ChevronLeft, ChevronRight, ChevronDown, Search } from 'lucide-react';
import { GoogleAd } from '@/components/google-ad';

interface Exam {
    id: string;
    title: string;
    totalQuestions: number;
    category: string;
    subjectGroup: string;
    subjectCode: string;
    session: string;
}

interface PageResponse {
    items: Exam[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
}

interface SummaryResponse {
    yearCounts: Record<string, number>;
    subjectCounts: Record<string, Record<string, number>>;
}

const STAT_TABS = [
    { key: 'all', title: 'ทั้งหมด', subtitle: 'ทุกหมวดวิชา' },
    { key: 'year1', title: 'ชั้นปี 1', subtitle: 'วิชาพื้นฐาน' },
    { key: 'year2', title: 'ชั้นปี 2', subtitle: 'วิชาแกนหลัก' },
    { key: 'year3', title: 'ชั้นปี 3', subtitle: 'วิธีพิจารณาความ' },
    { key: 'year4', title: 'ชั้นปี 4 & ตั๋วทนาย', subtitle: 'วิชาชีพ & ว่าความ' },
];

const PAGE_SIZE = 16;

export default function ExamListingPage() {
    const [summary, setSummary] = useState<SummaryResponse | null>(null);
    const [exams, setExams] = useState<Exam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalExams, setTotalExams] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const gridTopRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

    // Phase 1: Fetch summary
    useEffect(() => {
        fetch('/api/education/exams?mode=summary')
            .then((r) => r.json())
            .then((data) => setSummary(data))
            .catch(console.error);
    }, []);

    // Phase 2: Fetch paginated exams
    const fetchExams = useCallback(
        async (page: number, reset = false) => {
            if (reset) setIsLoading(true);
            else setIsLoadingMore(true);

            try {
                const params = new URLSearchParams({
                    mode: 'page',
                    page: String(page),
                    limit: String(PAGE_SIZE),
                    year: selectedYear,
                    subject: selectedSubject,
                });
                if (searchQuery) params.set('q', searchQuery);

                const response = await fetch(`/api/education/exams?${params}`);
                if (!response.ok) throw new Error('Failed to fetch');
                const data: PageResponse = await response.json();

                if (reset) setExams(data.items);
                else setExams((prev) => [...prev, ...data.items]);

                setTotalExams(data.total);
                setHasMore(data.hasMore);
                setCurrentPage(data.page);
            } catch (error) {
                console.error('Error fetching exams:', error);
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [selectedYear, selectedSubject, searchQuery]
    );

    useEffect(() => {
        fetchExams(1, true);
    }, [selectedYear, selectedSubject]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            fetchExams(1, true);
        }, 300);
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

    const yearCounts = summary?.yearCounts || {};
    const subjects = useMemo(() => {
        if (!summary?.subjectCounts) return [];
        const counts = summary.subjectCounts[selectedYear] || {};
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [summary, selectedYear]);

    const totalPages = Math.ceil(totalExams / PAGE_SIZE) || 1;

    const pageNumbers = useMemo(() => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('...');
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }
        return pages;
    }, [currentPage, totalPages]);

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        fetchExams(page, true);
        gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 font-light">
            {/* ── Hero Section (Rich Gradient) ── */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 via-sky-700 to-sky-900 p-6 sm:p-10 text-white">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
                <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-sky-300/10 rounded-full blur-2xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <FatExam size={22} className="text-sky-200" />
                        <span className="text-[10px] font-normal text-sky-200 uppercase tracking-wider">
                            Law Examination Portal
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-medium tracking-tight">
                        คลังข้อสอบกฎหมาย
                    </h1>
                    <p className="text-sky-100/80 font-extralight mt-3 text-sm max-w-2xl leading-relaxed">
                        แหล่งรวมข้อสอบกฎหมายจริงย้อนหลังทุกชั้นปีและตั๋วทนายความ พร้อมระบบฝึกทำข้อสอบและ AI ช่วยตรวจแนวคำตอบอัตนัย
                    </p>

                    {/* Quick Action */}
                    <div className="flex items-center gap-3 mt-6">
                        <Link
                            href="/books"
                            className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-4 py-2.5 text-xs font-normal transition-all flex items-center gap-2"
                        >
                            <FatBook size={14} className="text-sky-200" />
                            ดูหนังสือเตรียมสอบ
                        </Link>
                        <button
                            onClick={() => {
                                setSelectedYear('all');
                                setSelectedSubject('all');
                                gridTopRef.current?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="rounded-lg bg-white hover:bg-sky-50 text-sky-700 px-4 py-2.5 text-xs font-normal transition-all flex items-center gap-2 shadow-lg shadow-sky-900/20"
                        >
                            <FatExam size={14} className="text-sky-600" />
                            สำรวจข้อสอบทั้งหมด ({totalExams.toLocaleString()})
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { icon: <FatExam size={20} className="text-sky-600" />, label: 'ข้อสอบทั้งหมด', value: `${totalExams.toLocaleString()} ชุด`, bg: 'bg-sky-50 border-sky-100' },
                    { icon: <FatSparkle size={20} className="text-amber-500" />, label: 'AI ตรวจอัตนัย', value: 'พร้อมใช้งาน', bg: 'bg-amber-50 border-amber-100' },
                    { icon: <FatCheckCircle size={20} className="text-emerald-600" />, label: 'เนื้อหาตรวจสอบแล้ว', value: 'มาตรฐานวิชาการ', bg: 'bg-emerald-50 border-emerald-100' },
                ].map((stat) => (
                    <div key={stat.label} className={`flex items-center gap-3 p-4 rounded-xl border ${stat.bg}`}>
                        <div className="flex-shrink-0">{stat.icon}</div>
                        <div>
                            <div className="text-sm font-normal text-slate-900">{stat.value}</div>
                            <div className="text-[10px] text-slate-500 font-extralight">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Year Tabs (Card Style) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {STAT_TABS.map((tab) => {
                    const isSelected = selectedYear === tab.key;
                    let count = 0;
                    if (tab.key === 'all') {
                        count = totalExams || yearCounts.all || 0;
                    } else if (tab.key === 'year4') {
                        count = (yearCounts.year4 || 0) + (yearCounts.other || 0);
                    } else {
                        count = yearCounts[tab.key] || 0;
                    }

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => {
                                setSelectedYear(tab.key);
                                setSelectedSubject('all');
                            }}
                            className={`p-3 rounded-xl text-left transition-all border ${
                                isSelected
                                    ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/20'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:shadow-sm'
                            }`}
                        >
                            <div className="text-sm font-normal">{tab.title}</div>
                            <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-sky-200' : 'text-slate-400'}`}>
                                {tab.subtitle} • {count} ชุด
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* ── Search & Subject Filter ── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาข้อสอบ เช่น กฎหมายแพ่ง, เอกเทศสัญญา, ตั๋วทนาย..."
                        className="w-full pl-10 pr-4 h-11 text-sm font-extralight rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full font-normal"
                        >
                            ล้าง
                        </button>
                    )}
                </div>

                {/* Subject Chips */}
                {subjects.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-normal text-slate-600">
                                หมวดหมู่วิชา ({subjects.length} วิชา)
                            </span>
                            {selectedSubject !== 'all' && (
                                <button
                                    onClick={() => setSelectedSubject('all')}
                                    className="text-sky-600 hover:underline font-normal"
                                >
                                    ดูทุกวิชา
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button
                                type="button"
                                onClick={() => setSelectedSubject('all')}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-normal whitespace-nowrap transition-all border ${
                                    selectedSubject === 'all'
                                        ? 'bg-sky-600 text-white border-sky-600'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
                                }`}
                            >
                                ทั้งหมด
                                <span className={`ml-1 text-[9px] ${selectedSubject === 'all' ? 'text-sky-200' : 'text-slate-400'}`}>
                                    ({totalExams})
                                </span>
                            </button>

                            {subjects.map(([name, count]) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => setSelectedSubject(name)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-normal whitespace-nowrap transition-all border ${
                                        selectedSubject === name
                                            ? 'bg-sky-600 text-white border-sky-600'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
                                    }`}
                                >
                                    {name}
                                    <span className={`ml-1 text-[9px] ${selectedSubject === name ? 'text-sky-200' : 'text-slate-400'}`}>
                                        ({count})
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Top Ad Banner ── */}
            <GoogleAd variant="banner" className="my-4" />

            {/* ── Results Bar ── */}
            <div ref={gridTopRef} className="scroll-mt-6">
                {!isLoading && (
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 bg-white px-4 py-3 rounded-xl border border-slate-200">
                        <span className="font-normal text-slate-700 flex items-center gap-2">
                            <FatFile size={14} className="text-sky-600" />
                            แสดง {exams.length} จากทั้งหมด {totalExams.toLocaleString()} ข้อสอบ
                        </span>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-2 text-[11px]">
                                <button
                                    disabled={currentPage === 1 || isLoadingMore}
                                    onClick={() => goToPage(currentPage - 1)}
                                    className="h-7 px-2.5 rounded-lg text-[11px] font-normal border border-slate-200 hover:border-sky-300 hover:text-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 bg-white"
                                >
                                    <ChevronLeft className="w-3 h-3" />
                                    ก่อนหน้า
                                </button>
                                <span className="font-normal text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg text-[10px]">
                                    หน้า {currentPage} / {totalPages}
                                </span>
                                <button
                                    disabled={currentPage === totalPages || isLoadingMore}
                                    onClick={() => goToPage(currentPage + 1)}
                                    className="h-7 px-2.5 rounded-lg text-[11px] font-normal border border-slate-200 hover:border-sky-300 hover:text-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 bg-white"
                                >
                                    ถัดไป
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Exam Cards Grid (Wittaya Style) ── */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 h-44 animate-pulse" />
                    ))}
                </div>
            ) : exams.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                    <FatExam size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-800 text-base font-normal">ไม่พบข้อสอบที่ค้นหา</p>
                    <p className="text-slate-400 text-xs font-extralight mt-1">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดวิชาอื่น</p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedYear('all');
                            setSelectedSubject('all');
                        }}
                        className="mt-4 rounded-lg border border-slate-200 hover:border-sky-300 text-slate-700 hover:text-sky-700 px-4 py-2 text-xs font-normal transition-colors"
                    >
                        รีเซ็ตตัวกรองทั้งหมด
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {exams.map((exam, examIndex) => (
                            <React.Fragment key={exam.id}>
                                {/* In-feed Ad after every 6 cards */}
                                {examIndex > 0 && examIndex % 6 === 0 && (
                                    <div className="col-span-full">
                                        <GoogleAd variant="infeed" className="my-2" />
                                    </div>
                                )}
                            <div
                                className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/5 transition-all group"
                            >
                                {/* Top: Icon & Category */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                                        <FatExam size={20} className="text-sky-600" />
                                    </div>
                                    <span className="rounded-md px-2 py-0.5 text-[10px] font-normal border bg-slate-50 text-slate-600 border-slate-200">
                                        {exam.subjectGroup || (exam.category === 'other' ? 'ตั๋วทนาย' : exam.category)}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-sm font-normal text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-relaxed">
                                    {exam.title}
                                </h3>

                                {/* Meta info */}
                                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4">
                                    <div>
                                        <div className="text-xs font-normal text-slate-900">{exam.totalQuestions}</div>
                                        <div className="text-[9px] text-slate-400 font-extralight">ข้อ</div>
                                    </div>
                                    {exam.session && (
                                        <div>
                                            <div className="text-xs font-normal text-slate-900 truncate max-w-[120px]">{exam.session}</div>
                                            <div className="text-[9px] text-slate-400 font-extralight">ปีการศึกษา</div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-xs font-normal text-sky-700">ฟรี</div>
                                        <div className="text-[9px] text-slate-400 font-extralight">ราคา</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-3 flex items-center gap-2">
                                    <Link
                                        href={`/exams/${exam.id}/take`}
                                        className="flex-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 text-[11px] font-normal transition-colors text-center"
                                    >
                                        ทำข้อสอบ →
                                    </Link>
                                    <Link
                                        href={`/exams/${exam.id}/answers`}
                                        className="flex-1 rounded-lg bg-white border border-slate-200 hover:border-sky-300 text-slate-600 hover:text-sky-700 px-3 py-2 text-[11px] font-normal transition-colors text-center"
                                    >
                                        ดูเฉลย
                                    </Link>
                                </div>
                            </div>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* ── Bottom Ad Banner ── */}
                    <GoogleAd variant="banner" className="my-4" />

                    {/* ── Pagination ── */}
                    <div className="pt-4 pb-12 space-y-6">
                        {/* Load More */}
                        {hasMore && (
                            <div className="flex flex-col items-center justify-center gap-2">
                                <button
                                    onClick={() => fetchExams(currentPage + 1)}
                                    disabled={isLoadingMore}
                                    className="bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-normal px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            กำลังโหลดเพิ่มเติม...
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-3.5 h-3.5" />
                                            กดดูเพิ่ม ({exams.length} / {totalExams.toLocaleString()})
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-slate-400 font-extralight">
                                    กดดูเพิ่มเพื่อโหลดข้อสอบหน้าถัดไป หรือเลือกเลขหน้าจากแถบด้านล่าง
                                </p>
                            </div>
                        )}

                        {/* Page Numbers */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200">
                                <div className="text-[11px] text-slate-500 font-extralight text-center sm:text-left">
                                    หน้า <span className="font-normal text-slate-800">{currentPage}</span> จากทั้งหมด <span className="font-normal text-slate-800">{totalPages}</span> หน้า ({totalExams.toLocaleString()} ข้อสอบ)
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                    <button
                                        disabled={currentPage === 1 || isLoadingMore}
                                        onClick={() => goToPage(1)}
                                        className="h-7 w-7 rounded-lg text-[11px] font-normal border border-slate-200 hover:border-sky-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white flex items-center justify-center"
                                        title="หน้าแรก"
                                    >
                                        &laquo;
                                    </button>

                                    <button
                                        disabled={currentPage === 1 || isLoadingMore}
                                        onClick={() => goToPage(currentPage - 1)}
                                        className="h-7 px-2.5 rounded-lg text-[11px] font-normal border border-slate-200 hover:border-sky-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white flex items-center gap-1"
                                    >
                                        <ChevronLeft className="w-3 h-3" />
                                        ก่อนหน้า
                                    </button>

                                    {pageNumbers.map((p, idx) =>
                                        p === '...' ? (
                                            <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-[11px] select-none">
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={`page-${p}`}
                                                disabled={isLoadingMore}
                                                onClick={() => goToPage(Number(p))}
                                                className={`h-7 min-w-[28px] px-2 rounded-lg text-[11px] font-normal transition-all border ${
                                                    currentPage === p
                                                        ? 'bg-sky-600 text-white border-sky-600'
                                                        : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:text-sky-700'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}

                                    <button
                                        disabled={currentPage === totalPages || isLoadingMore}
                                        onClick={() => goToPage(currentPage + 1)}
                                        className="h-7 px-2.5 rounded-lg text-[11px] font-normal border border-slate-200 hover:border-sky-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white flex items-center gap-1"
                                    >
                                        ถัดไป
                                        <ChevronRight className="w-3 h-3" />
                                    </button>

                                    <button
                                        disabled={currentPage === totalPages || isLoadingMore}
                                        onClick={() => goToPage(totalPages)}
                                        className="h-7 w-7 rounded-lg text-[11px] font-normal border border-slate-200 hover:border-sky-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white flex items-center justify-center"
                                        title="หน้าสุดท้าย"
                                    >
                                        &raquo;
                                    </button>
                                </div>
                            </div>
                        )}

                        {!hasMore && exams.length > 0 && (
                            <div className="text-center py-4 text-[11px] text-slate-400 font-extralight">
                                แสดงข้อสอบครบ {totalExams.toLocaleString()} รายการแล้ว
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
