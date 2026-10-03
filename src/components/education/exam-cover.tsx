import {
    BookOpen, Briefcase, Building2, FileSignature, Gavel, Globe2, HandCoins, HardHat, Home, Landmark,
    Library, Map, Plane, Receipt, Scale, ScrollText, Search, Shield, ShoppingBag, Truck, Umbrella,
    Users, Warehouse, type LucideIcon,
} from 'lucide-react';
import { examSubjectCode } from '@/lib/book-cover';

/** ไอคอนประจำวิชา — key เป็นรหัสหนังสือที่ examSubjectCode() คืนมา */
const SUBJECT_ICON: Record<string, LucideIcon> = {
    law1001: Landmark, law1002: BookOpen, law1003: FileSignature, law1004: Library,
    law2001: Home, law2002: ScrollText, law2003: Shield, law2004: Landmark, law2005: ShoppingBag,
    law2006: Gavel, law2007: Gavel, law2008: Truck, law2009: Warehouse, law2010: HandCoins,
    law2011: Briefcase, law2012: Umbrella, law2013: Receipt, law2015: Building2, law2032: Library,
    law3002: Building2, law3003: Users, law3004: Landmark, law3005: Scale, law3006: Gavel,
    law3009: ScrollText, law3010: HandCoins, law3011: Search, law3012: Landmark, law3035: Search,
    law4001: Receipt, law4002: Briefcase, law4003: Globe2, law4004: HardHat, law4006: Plane,
    law4007: BookOpen, law4008: Map, law4105: Scale,
};

/** สีพื้นตามชั้นปีของวิชา (หลักที่ 4 ของรหัส) — โทนเดียวกับปกหนังสือ */
const YEAR_BG: Record<string, string> = {
    '1': 'from-[#0d5c46] to-[#06281f]',
    '2': 'from-[#0d3f8f] to-[#061a3d]',
    '3': 'from-[#8c1d2c] to-[#3a0a12]',
    '4': 'from-[#4b1f8f] to-[#1d0a3d]',
};

/**
 * ปกข้อสอบแบบเรียบ — ชื่อวิชา + พื้นหลังสีตามชั้นปี + ไอคอนประจำวิชา
 * (ปกหนังสือเท่านั้นที่มีภาพตัวละคร ตามที่ลูกค้าขอ 2026-10-03)
 */
export function ExamSubjectCover({ subject, title, year, size = 'md', className = '' }: {
    /** ชื่อวิชา/หมวดที่แสดงบนปก */
    subject: string;
    /** ข้อความเพิ่มไว้ช่วยจับคู่วิชา เช่นชื่อชุดข้อสอบ */
    title?: string;
    /** ชั้นปีของชุดข้อสอบ ('year3' หรือ 3) — ไม่ส่งมาใช้ชั้นปีของวิชาที่จับคู่ได้ */
    year?: string | number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) {
    const code = examSubjectCode(subject, title);
    const Icon = SUBJECT_ICON[code] ?? Scale;
    const y = String(year ?? '').replace(/\D/g, '') || code[3];
    const bg = YEAR_BG[y] ?? YEAR_BG['2'];
    const iconSize = size === 'sm' ? 'h-14 w-14 -right-2 -bottom-2' : size === 'lg' ? 'h-40 w-40 right-6 -bottom-6' : 'h-24 w-24 -right-3 -bottom-3';
    const text = size === 'sm' ? 'text-[11px] p-2' : size === 'lg' ? 'text-2xl md:text-3xl p-8' : 'text-base p-4';

    return (
        <div className={`relative flex h-full w-full items-end overflow-hidden bg-gradient-to-br ${bg} ${className}`}>
            <Icon aria-hidden strokeWidth={1.25} className={`absolute text-white/20 ${iconSize}`} />
            <div aria-hidden className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/5" />
            <span className={`relative line-clamp-3 font-semibold leading-snug text-white ${text}`}>{subject}</span>
        </div>
    );
}
