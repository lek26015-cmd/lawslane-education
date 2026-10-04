'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
    FACULTY_GROUP_LABELS,
    LAW_FACULTIES,
    TCAS70_STATUS_LABELS,
    tcasUniversityUrl,
    type Tcas70Status,
    type FacultyGroup,
} from '@/lib/law-faculties';

type Filter = 'all' | FacultyGroup;

const MONOGRAM_STYLES: Record<FacultyGroup, string> = {
    state: 'bg-blue-50 text-[#0B3979]',
    rajabhat: 'bg-amber-50 text-amber-700',
    private: 'bg-slate-100 text-slate-600',
};

// อักษรตัวแรกของชื่อที่แยกสถาบันได้ — ตัดคำนำหน้าทั่วไป (และ "ราชภัฏ") แล้วข้ามสระนำ เ แ โ ใ ไ
// ใช้แทนโลโก้ จึงไม่ต้องใช้เครื่องหมายของมหาวิทยาลัย · ชื่อเต็มแสดงข้าง ๆ เสมอ จึงซ้ำกันได้
function monogram(name: string): string {
    const core = name
        .replace(/^(มหาวิทยาลัย|วิทยาลัย|สถาบัน)/, '')
        .replace(/^ราชภัฏ/, '')
        .replace(/^[เแโใไ]+/, '');
    return Array.from(core)[0] ?? Array.from(name)[0];
}

const STATUS_STYLES: Record<Tcas70Status, string> = {
    round3: 'bg-emerald-50 text-emerald-700',
    listed: 'bg-slate-100 text-slate-600',
    pending: 'bg-amber-50 text-amber-700',
};

export function LawFacultyDirectory() {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<Filter>('all');

    const filtered = useMemo(() => {
        const q = query.trim();
        return LAW_FACULTIES.filter(
            (f) => (filter === 'all' || f.group === filter) && (!q || f.university.includes(q))
        );
    }, [query, filter]);

    const tabs: { key: Filter; label: string }[] = [
        { key: 'all', label: `ทั้งหมด (${LAW_FACULTIES.length})` },
        ...(Object.keys(FACULTY_GROUP_LABELS) as FacultyGroup[]).map((g) => ({
            key: g as Filter,
            label: `${FACULTY_GROUP_LABELS[g]} (${LAW_FACULTIES.filter((f) => f.group === g).length})`,
        })),
    ];

    return (
        <div className="space-y-5">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ค้นหาชื่อมหาวิทยาลัย"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0B3979]"
                />
            </div>
            <div className="flex flex-wrap gap-2">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setFilter(t.key)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                            filter === t.key
                                ? 'bg-[#0B3979] text-white border-[#0B3979]'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-[#0B3979]'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((f) => (
                    <div key={f.id} className="bg-white border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div
                                aria-hidden="true"
                                className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-lg font-bold ${MONOGRAM_STYLES[f.group]}`}
                            >
                                {monogram(f.university)}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm">
                                    <span className="font-bold text-slate-900">คณะนิติศาสตร์</span>{' '}
                                    <span className="block text-slate-700">{f.university}</span>
                                </h3>
                                <p className="text-xs text-[#0B3979] mt-1">{FACULTY_GROUP_LABELS[f.group]}</p>
                            </div>
                        </div>
                        <p className={`inline-block mt-3 px-2 py-0.5 rounded-md text-xs ${STATUS_STYLES[f.tcas70]}`}>
                            TCAS70: {TCAS70_STATUS_LABELS[f.tcas70]}
                        </p>
                        {f.tcas68Subjects ? (
                            <div className="mt-3">
                                <p className="text-xs font-medium text-slate-500 mb-1.5">วิชารอบ 3 ปีก่อนหน้า (TCAS68 · ไม่ใช่ข้อมูลทางการ)</p>
                                <div className="flex flex-wrap gap-1">
                                    {f.tcas68Subjects.map((s) => (
                                        <span key={s} className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0B3979] text-xs">{s}</span>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                        <a
                            href={tcasUniversityUrl(f)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-3 text-xs text-[#0B3979] underline"
                        >
                            ดูหลักสูตรและเกณฑ์ที่ mytcas ↗
                        </a>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <p className="text-sm text-slate-500 col-span-full">ไม่พบมหาวิทยาลัยที่ค้นหา</p>
                )}
            </div>
        </div>
    );
}
