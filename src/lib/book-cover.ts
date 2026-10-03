/**
 * ปกหนังสือ "รวมข้อสอบ LAWxxxx" — ปกเดิมทั้ง 41 เล่มเป็นภาพ template เดียวกัน (พื้นกรมท่า + โลโก้)
 * ต่างกันแค่ชื่อวิชาตัวเล็กๆ บนร้านหนังสือจึงดูเหมือนเล่มเดียวกันหมด
 * วาดปกใหม่ในโค้ดแทน: สีตามชั้นปี + ลายตามรหัสวิชา ให้แต่ละเล่มแยกออกจากกันได้ทันที
 */

/** ภาพปก template ที่สร้างไว้ใน storage `books/covers/law1002.jpg` ฯลฯ */
export function isTemplateExamCover(url: unknown): boolean {
    return typeof url === 'string' && /\/books\/covers\/law\d{4}/i.test(url);
}

/** หนังสือรวมข้อสอบขายเป็นไฟล์ (E-Book) — ข้อมูลบางเล่มยังไม่ได้ตั้ง isDigital */
export function isEbookBook(book: { isDigital?: boolean; category?: string }): boolean {
    return !!book.isDigital || book.category === 'exam';
}

export type ExamCoverInfo = {
    code: string;
    subject: string;
    year: number | null;
    sets: number | null;
};

/** แยก "รวมข้อสอบ LAW4008 กฎหมายที่ดิน" + "จำนวน 45 ชุด" ออกเป็นส่วนๆ */
export function parseExamBook(title: string, description?: string): ExamCoverInfo {
    const m = title.match(/(LAW\d{4})(?:\s*\((LAW\d{4})\))?\s*(.*)$/i);
    const code = m?.[1]?.toUpperCase() ?? '';
    const subject = (m?.[3] ?? title.replace(/^รวมข้อสอบ\s*/, '')).trim();
    const yearDigit = code ? Number(code[3]) : NaN;
    const sets = description?.match(/จำนวน\s*([\d,]+)\s*ชุด/)?.[1];
    return {
        code,
        subject,
        year: yearDigit >= 1 && yearDigit <= 4 ? yearDigit : null,
        sets: sets ? Number(sets.replace(/,/g, '')) : null,
    };
}

/** สีหลักตามชั้นปี — แต่ละปีโทนต่างกันชัด เล่มในปีเดียวกันขยับเฉดตามรหัสวิชา */
const YEAR_HUE: Record<number, number> = { 1: 160, 2: 215, 3: 345, 4: 268 };

export function examCoverTheme(info: ExamCoverInfo) {
    const n = Number(info.code.slice(4)) || [...info.subject].reduce((s, c) => s + c.charCodeAt(0), 0);
    const base = info.year ? YEAR_HUE[info.year] : 30;
    const hue = (base + ((n * 37) % 50) - 25 + 360) % 360;
    return {
        from: `hsl(${hue} 65% 30%)`,
        to: `hsl(${(hue + 25) % 360} 70% 18%)`,
        accent: `hsl(${(hue + 180) % 360} 85% 70%)`,
        pattern: n % 4,
    };
}

/**
 * ภาพประกอบปกตามหมวดวิชา — เลือกจากคำในชื่อวิชา (ลำดับสำคัญ: คำเฉพาะก่อนคำกว้าง)
 * ชื่อตรงกับไอคอนใน lucide-react ที่ ExamBookCover map ไว้
 */
export type CoverIllustration =
    | 'land' | 'family' | 'inheritance' | 'company' | 'insurance' | 'money' | 'tax' | 'labor'
    | 'globe' | 'investigation' | 'procedure' | 'criminal' | 'court' | 'constitution' | 'philosophy'
    | 'history' | 'ethics' | 'contract' | 'property' | 'scale';

const ILLUSTRATION_RULES: [RegExp, CoverIllustration][] = [
    [/ที่ดิน/, 'land'],
    [/ครอบครัว/, 'family'],
    [/มรดก/, 'inheritance'],
    [/หุ้นส่วน|บริษัท|ธุรกิจ/, 'company'],
    [/ประกันภัย|ตัวแทน|นายหน้า/, 'insurance'],
    [/ตั๋วเงิน|ยืม|ฝากทรัพย์|ค้ำประกัน|จำนอง|จํานอง|ล้มละลาย/, 'money'],
    [/ภาษี/, 'tax'],
    [/แรงงาน/, 'labor'],
    [/ระหว่างประเทศ/, 'globe'],
    [/สืบสวน|สอบสวน|พยาน/, 'investigation'],
    [/วิธีพิจารณา|ว่าความ/, 'procedure'],
    [/อาญา/, 'criminal'],
    [/ศาล/, 'court'],
    [/รัฐธรรมนูญ|มหาชน|ปกครอง/, 'constitution'],
    [/ปรัชญา/, 'philosophy'],
    [/ประวัติศาสตร์/, 'history'],
    [/วิชาชีพ|จรรยาบรรณ/, 'ethics'],
    [/นิติกรรม|สัญญา|ซื้อขาย|เช่า|หนี้|ละเมิด/, 'contract'],
    [/ทรัพย์/, 'property'],
];

export function coverIllustrationOf(subject: string): CoverIllustration {
    return ILLUSTRATION_RULES.find(([re]) => re.test(subject))?.[1] ?? 'scale';
}
