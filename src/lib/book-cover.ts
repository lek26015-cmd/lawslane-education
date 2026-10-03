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
    // ชื่อยาวบนปกตัดเหลือ ป.พ.พ. — "กฎหมายแพ่งและพาณิชย์ว่าด้วยครอบครัว" ล้นสองบรรทัด
    const subject = (m?.[3] ?? title.replace(/^รวมข้อสอบ\s*/, ''))
        .trim()
        .replace(/^กฎหมายแพ่งและพาณิชย์ว่าด้วย/, 'ป.พ.พ. ว่าด้วย');
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

/** ชื่อวิชาภาษาอังกฤษบนริบบิ้นทองมุมปก */
export const SUBJECT_EN: Record<string, string> = {
    LAW1001: 'PUBLIC LAW', LAW1002: 'PRIVATE LAW', LAW1003: 'CONTRACT LAW', LAW1004: 'INTRO TO LAW',
    LAW2001: 'PROPERTY LAW', LAW2002: 'OBLIGATIONS', LAW2003: 'TORT LAW', LAW2004: 'CONSTITUTIONAL LAW',
    LAW2005: 'SALES LAW', LAW2006: 'CRIMINAL LAW 1', LAW2007: 'CRIMINAL LAW 2', LAW2008: 'HIRE & LEASE LAW',
    LAW2009: 'LOAN & DEPOSIT', LAW2010: 'SECURED TRANSACTIONS', LAW2011: 'AGENCY & BROKERAGE',
    LAW2012: 'INSURANCE LAW', LAW2013: 'NEGOTIABLE INSTRUMENTS', LAW2015: 'BUSINESS LAW',
    LAW2032: 'THAI LEGAL HISTORY', LAW3001: 'CRIMINAL LAW 3', LAW3002: 'PARTNERSHIPS & COMPANIES',
    LAW3003: 'FAMILY LAW', LAW3004: 'COURTS OF JUSTICE', LAW3005: 'CIVIL PROCEDURE 1',
    LAW3006: 'CRIMINAL PROCEDURE 1', LAW3007: 'CIVIL PROCEDURE 2', LAW3008: 'CRIMINAL PROCEDURE 2',
    LAW3009: 'SUCCESSION LAW', LAW3010: 'BANKRUPTCY LAW', LAW3011: 'LAW OF EVIDENCE',
    LAW3012: 'ADMINISTRATIVE LAW', LAW3016: 'ADMINISTRATIVE LAW', LAW3035: 'INVESTIGATION',
    LAW4001: 'TAX LAW', LAW4002: 'LITIGATION PRACTICE', LAW4003: 'PUBLIC INTERNATIONAL LAW',
    LAW4004: 'LABOUR LAW', LAW4006: 'PRIVATE INTERNATIONAL LAW', LAW4007: 'JURISPRUDENCE',
    LAW4008: 'LAND LAW', LAW4105: 'LEGAL ETHICS',
};

/**
 * ภาพประกอบปก (ตัวละคร 3D + ฉากประจำวิชา) — สร้างด้วย Workers AI (FLUX) 2026-10-03
 * เล่มละภาพไม่ซ้ำกัน เก็บที่ public/images/book-covers/lawXXXX.webp
 * ไม่มีตัวอักษรในภาพ ข้อความบนปกวางด้วยโค้ดทั้งหมด
 */
export function bookIllustrationUrl(code: string): string | null {
    return SUBJECT_EN[code.toUpperCase()] ? `/images/book-covers/${code.toLowerCase()}.webp` : null;
}

/**
 * จับคู่ข้อสอบกับวิชา (รหัสหนังสือ) จากชื่อวิชา/หมวด — คำเฉพาะก่อนคำกว้าง
 */
const EXAM_ILLUSTRATION_RULES: [RegExp, string][] = [
    [/ที่ดิน/, 'law4008'],
    [/ครอบครัว/, 'law3003'],
    [/มรดก/, 'law3009'],
    [/หุ้นส่วน|บริษัท/, 'law3002'],
    [/ประกันภัย/, 'law2012'],
    [/ตัวแทน|นายหน้า/, 'law2011'],
    [/ตั๋วเงิน|ตัวเงิน|บัญชีเดินสะพัด/, 'law2013'],
    [/ค้ำ|คํา|จำนอง|จํานอง|จำนำ|หลักประกัน/, 'law2010'],
    [/ยืม|ฝากทรัพย์/, 'law2009'],
    [/เอกเทศสัญญา\s*2|เอกเทศสัญญา\s*๒|เช่า|จ้าง|รับขน/, 'law2008'],
    [/เอกเทศสัญญา/, 'law2005'],
    [/ซื้อขาย|แลกเปลี่ยน/, 'law2005'],
    [/ละเมิด/, 'law2003'],
    [/หนี้/, 'law2002'],
    [/นิติกรรม|สัญญา/, 'law1003'],
    [/ล้มละลาย/, 'law3010'],
    [/ภาษี/, 'law4001'],
    [/แรงงาน/, 'law4004'],
    [/คดีบุคคล/, 'law4006'],
    [/ระหว่างประเทศ|อนุญาโต/, 'law4003'],
    [/สืบสวน|สอบสวน/, 'law3035'],
    [/พยาน/, 'law3011'],
    [/วิ\.?\s*อาญา|พิจารณาความอาญา/, 'law3006'],
    [/วิ\.?\s*แพ่ง|พิจารณาความแพ่ง/, 'law3005'],
    [/ว่าความ|ตั๋วทนาย/, 'law4002'],
    [/อาญา\s*1|อาญา1|ภาคทั่วไป/, 'law2006'],
    [/อาญา/, 'law2007'],
    [/ธรรมนูญศาล|ศาล/, 'law3004'],
    [/รัฐธรรมนูญ/, 'law2004'],
    [/ปกครอง/, 'law3012'],
    [/มหาชน/, 'law1001'],
    [/เอกชน/, 'law1002'],
    [/ปรัชญา/, 'law4007'],
    [/ประวัติศาสตร์/, 'law2032'],
    [/วิชาชีพ|จรรยาบรรณ/, 'law4105'],
    [/ธุรกิจ|การค้า/, 'law2015'],
    [/ทรัพย์/, 'law2001'],
];

/** รหัสวิชาหนังสือที่ตรงกับข้อสอบชุดนี้ (ใช้เลือกไอคอน/สีปกข้อสอบ) */
export function examSubjectCode(...texts: (string | undefined)[]): string {
    const hay = texts.filter(Boolean).join(' ');
    return EXAM_ILLUSTRATION_RULES.find(([re]) => re.test(hay))?.[1] ?? 'law1004';
}

/** ชื่อหนังสือที่แสดงบนเว็บ — ตัดรหัสวิชา "LAW4105 (LAW4005)" ออก (ข้อมูลจริงยังเก็บไว้ครบ) */
export function displayBookTitle(title: string): string {
    // คงบรรทัดใหม่ไว้ (คำอธิบายหนังสือแสดงแบบ pre-line)
    return title.replace(/[ \t]*LAW\d{4}([ \t]*\(LAW\d{4}\))?[ \t]*/gi, ' ').replace(/[ \t]+/g, ' ').trim();
}

/**
 * จุดขึ้นบรรทัดใหม่ของชื่อวิชาบนปก (| = ขึ้นบรรทัด) — กำหนดเองทุกเล่ม เพราะเบราว์เซอร์ตัดคำไทย
 * ตามพจนานุกรม ทำให้ขาดกลางวลี เช่น "ยืม ฝาก / ทรัพย์" แต่ละบรรทัดห้ามตัดต่อ (nowrap)
 */
export const COVER_LINES: Record<string, string> = {
    law1001: 'หลักกฎหมาย|มหาชน',
    law1002: 'หลักกฎหมาย|เอกชน',
    law1003: 'ป.พ.พ. ว่าด้วย|นิติกรรมและสัญญา',
    law1004: 'ความรู้เบื้องต้น|เกี่ยวกับกฎหมายทั่วไป',
    law2001: 'ป.พ.พ.|ว่าด้วยทรัพย์',
    law2002: 'ป.พ.พ.|ว่าด้วยหนี้',
    law2003: 'ป.พ.พ. ว่าด้วยละเมิด|จัดการงานนอกสั่ง|ลาภมิควรได้',
    law2004: 'กฎหมายรัฐธรรมนูญ|และสถาบันการเมือง',
    law2005: 'ป.พ.พ. ว่าด้วยซื้อขาย|แลกเปลี่ยน ให้',
    law2006: 'กฎหมายอาญา 1',
    law2007: 'กฎหมายอาญา 2',
    law2008: 'ป.พ.พ. ว่าด้วยเช่าทรัพย์|เช่าซื้อ จ้างแรงงาน|จ้างทำของ รับขน',
    law2009: 'ป.พ.พ. ว่าด้วยยืม ฝากทรัพย์|เก็บของในคลังสินค้า|ประนีประนอมยอมความ',
    law2010: 'ป.พ.พ. ว่าด้วยค้ำประกัน|จำนอง จำนำ',
    law2011: 'ป.พ.พ. ว่าด้วย|ตัวแทน นายหน้า',
    law2012: 'ป.พ.พ. ว่าด้วย|ประกันภัย',
    law2013: 'ป.พ.พ. ว่าด้วยตั๋วเงิน|บัญชีเดินสะพัด',
    law2015: 'กฎหมายธุรกิจ 1',
    law2032: 'ประวัติศาสตร์|กฎหมายไทย',
    law3001: 'กฎหมายอาญา 3',
    law3002: 'ป.พ.พ. ว่าด้วย|หุ้นส่วน',
    law3003: 'ป.พ.พ. ว่าด้วย|ครอบครัว',
    law3004: 'พระธรรมนูญ|ศาลยุติธรรม',
    law3005: 'กฎหมายวิธีพิจารณา|ความแพ่ง 1',
    law3006: 'กฎหมายวิธีพิจารณา|ความอาญา 1',
    law3007: 'กฎหมายวิธีพิจารณา|ความแพ่ง 2',
    law3008: 'กฎหมายวิธีพิจารณา|ความอาญา 2',
    law3009: 'ป.พ.พ.|ว่าด้วยมรดก',
    law3010: 'กฎหมาย|ล้มละลาย',
    law3011: 'กฎหมาย|ลักษณะพยาน',
    law3012: 'กฎหมาย|ปกครอง',
    law3016: 'กฎหมายปกครอง|สำหรับนักศึกษา|คณะรัฐศาสตร์',
    law3035: 'การสืบสวน|และสอบสวน',
    law4001: 'กฎหมายเกี่ยวกับ|ภาษีอากร',
    law4002: 'การว่าความ',
    law4003: 'กฎหมายระหว่างประเทศ|แผนกคดีเมือง',
    law4004: 'กฎหมายแรงงาน|และการประกันสังคม',
    law4006: 'กฎหมายระหว่างประเทศ|แผนกคดีบุคคล',
    law4007: 'นิติปรัชญา',
    law4008: 'กฎหมายที่ดิน',
    law4105: 'หลักวิชาชีพ|และจรรยาบรรณ|ของนักกฎหมาย',
};

export function coverLines(code: string, subject: string): string[] {
    return (COVER_LINES[code.toLowerCase()] ?? subject).split('|');
}
