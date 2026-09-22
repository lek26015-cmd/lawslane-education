/**
 * Thai text primitives สำหรับ legal-doc renderer
 *
 * portable ล้วน — ห้าม import Node API ในไฟล์นี้ (ดูกติกาใน ./README.md)
 */

/** ตัวเลขไทย ๐-๙ */
const THAI_DIGITS = '๐๑๒๓๔๕๖๗๘๙';

/** แปลงเลขอารบิกเป็นเลขไทย: 123 → ๑๒๓ */
export function toThaiDigits(s: string): string {
    return s.replace(/[0-9]/g, (d) => THAI_DIGITS[Number(d)]);
}

/** แปลงเลขไทยเป็นอารบิก: ๑๒๓ → 123 */
export function toArabicDigits(s: string): string {
    return s.replace(/[๐-๙]/g, (d) => String(THAI_DIGITS.indexOf(d)));
}

/**
 * ดึงลำดับตัวเลขทุกชุดออกมาเป็นอารบิก ใช้ตรวจว่าจำนวนเงิน/วันที่ไม่เพี้ยน
 * ระหว่างข้อความต้นทางกับ IR — ในข้อสอบตั๋วเงิน เลขผิดตัวเดียวคำตอบเปลี่ยน
 */
export function extractNumerals(s: string): string[] {
    return toArabicDigits(s).match(/\d+/g) ?? [];
}

let graphemeSeg: Intl.Segmenter | undefined;
let wordSeg: Intl.Segmenter | undefined;

/**
 * ตัดเป็น grapheme cluster (พยัญชนะ + สระ + วรรณยุกต์ = 1 ชิ้น)
 *
 * shaper วางทีละ cluster เพราะ GPOS ของไทยถูกคำนวณจบภายใน cluster อยู่แล้ว
 * ผลจึงเท่ากับ layout ทั้งบรรทัดรวดเดียว แต่ได้พิกัดต่อชิ้นมาใช้จัดหน้า
 */
export function graphemes(text: string): string[] {
    graphemeSeg ??= new Intl.Segmenter('th', { granularity: 'grapheme' });
    return Array.from(graphemeSeg.segment(text), (s) => s.segment);
}

export interface ThaiWord {
    text: string;
    /** true = เป็นคำจริง, false = เครื่องหมาย/ช่องว่าง ที่ห้ามขึ้นต้นบรรทัด */
    isWord: boolean;
}

/**
 * ตัดคำไทยด้วย ICU ผ่าน Intl.Segmenter (Node 24 มี full ICU)
 *
 * ชิ้นที่ไม่ใช่คำ (`ๆ` `ฯ` `)` `.` ช่องว่าง) ถูกผนวกเข้ากับคำหน้า เพื่อไม่ให้
 * การตัดบรรทัดดันมันไปขึ้นต้นบรรทัดใหม่ ซึ่งผิดแบบแผนการพิมพ์ไทย
 */
export function words(text: string): ThaiWord[] {
    wordSeg ??= new Intl.Segmenter('th', { granularity: 'word' });
    const out: ThaiWord[] = [];
    for (const seg of wordSeg.segment(text)) {
        if (!seg.isWordLike && out.length > 0) {
            out[out.length - 1] = {
                text: out[out.length - 1].text + seg.segment,
                isWord: out[out.length - 1].isWord,
            };
        } else {
            out.push({ text: seg.segment, isWord: Boolean(seg.isWordLike) });
        }
    }
    return out;
}

/** normalize ก่อนเทียบข้อความ — NFC + ยุบช่องว่าง */
export function normalize(text: string): string {
    return text.normalize('NFC').replace(/\s+/g, ' ').trim();
}
