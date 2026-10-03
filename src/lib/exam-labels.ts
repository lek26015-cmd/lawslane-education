/**
 * ป้าย "อัตนัย/ปรนัย" และ "ระดับ" ของชุดข้อสอบ — ใช้ทั้งหน้ารายการ หน้ารายละเอียด และหน้าแรก
 * ให้ผู้ใช้เห็นทันทีว่าชุดนี้เป็นข้อสอบแบบไหน ของระดับไหน
 *
 * ข้อมูลใน examSets (ตรวจ production 2026-10-03):
 *  - essayCount / multipleChoiceCount มีครบทุกชุด
 *  - suitableFor: 'ปี 1'…'ปี 4', 'นักศึกษาชั้นปี 2', 'เนติ' / category: 'สอบตั๋วทนาย', 'year1'…
 */

export type ExamType = 'essay' | 'multiple_choice' | 'mixed';

export const EXAM_TYPE_LABEL: Record<ExamType, string> = {
    essay: 'อัตนัย',
    multiple_choice: 'ปรนัย',
    mixed: 'ปรนัย + อัตนัย',
};

/** สีป้าย — แยกกันชัดเจนแม้มองผ่านๆ */
export const EXAM_TYPE_CLASS: Record<ExamType, string> = {
    essay: 'bg-[#0B3979] text-white border-[#0B3979]',
    multiple_choice: 'bg-emerald-600 text-white border-emerald-600',
    mixed: 'bg-amber-500 text-white border-amber-500',
};

export function examTypeOf(data: { essayCount?: unknown; multipleChoiceCount?: unknown }): ExamType {
    const essay = Number(data.essayCount) || 0;
    const mc = Number(data.multipleChoiceCount) || 0;
    if (mc > 0 && essay > 0) return 'mixed';
    if (mc > 0) return 'multiple_choice';
    return 'essay';
}

const TH_DIGITS = '๐๑๒๓๔๕๖๗๘๙';

/** ระดับของชุดข้อสอบ เช่น "ปริญญาตรี ชั้นปี 2", "เนติบัณฑิต", "ตั๋วทนาย" — ไม่รู้ = '' */
export function examLevelOf(data: { suitableFor?: unknown; category?: unknown; title?: unknown }): string {
    const suitable = String(data.suitableFor ?? '').replace(/[๐-๙]/g, (c) => String(TH_DIGITS.indexOf(c)));
    const category = String(data.category ?? '');
    const title = String(data.title ?? '');

    if (category === 'สอบตั๋วทนาย' || /ว่าความ|ตั๋วทนาย/.test(title)) return 'ตั๋วทนาย';
    if (/เนติ/.test(suitable) || /เนติ/.test(title)) return 'เนติบัณฑิต';

    const year = suitable.match(/ปี\s*(\d)(?:\s*-\s*(\d))?/) ?? category.match(/^year(\d)$/);
    if (year) return `ปริญญาตรี ชั้นปี ${year[2] ? `${year[1]}-${year[2]}` : year[1]}`;
    return '';
}
