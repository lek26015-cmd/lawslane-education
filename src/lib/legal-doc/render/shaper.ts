import type { PDFFont } from 'pdf-lib';
import { graphemes } from '../thai';

/**
 * Thai text shaper ที่ใส่ GPOS จริง และ copy ข้อความออกมาได้ถูก
 *
 * ## ทำไมต้องเขียนเอง แทนที่จะใช้ page.drawText()
 *
 * `drawText()` เรียก `CustomFontEmbedder.encodeText()` ซึ่งเก็บแค่
 * `layout().glyphs` แล้ว **ทิ้ง `layout().positions`** ทั้งก้อน วัดกับ Sarabun จริง:
 * `ปั้` ต้องเลื่อนวรรณยุกต์ −163/1000 em แนวนอน และ −32/1000 em แนวตั้ง
 * ที่ 16pt คือ 2.6pt ซึ่งเห็นด้วยตาเปล่า พยัญชนะสูงทุกตัว (ปั้ ผู้ ที่ ฟั่)
 * จึงวางวรรณยุกต์ผิดถ้าใช้ drawText
 *
 * ## ปัญหาสระอำ กับฟอนต์สองชุด
 *
 * Sarabun แตก `ำ` เป็นสอง glyph: ตัวนิคหิต (760, หรือ 762 เมื่อมีวรรณยุกต์ควบ
 * อย่าง `น้ำ`) ซึ่งมี codePoints = "ำ" อยู่แล้ว แล้วตามด้วย glyph `า` (488)
 * ที่ codePoints ว่าง — และเป็น **glyph ตัวเดียวกับ `า` เดี่ยว**
 *
 * ToUnicode CMap เป็น map หนึ่ง glyph ต่อหนึ่งความหมาย จึงให้ glyph 488
 * เป็นทั้ง "ว่าง" (ตอนเป็นหาง ำ) และ "า" (ตอนเป็นสระเดี่ยว) พร้อมกันไม่ได้
 * ผลคือ copy คำว่า `จำกัด` ออกมาได้ `จำากัด`
 *
 * ทางแก้: ฝังฟอนต์ไฟล์เดิม **สองชุด** ชุดที่สอง (tail) ใช้วาดเฉพาะหางของสระอำ
 * ในซับเซ็ตของชุดนั้น glyph 488 จึงไม่เคยถูกใช้เป็น `า` เดี่ยว ToUnicode ของมัน
 * จึงว่างได้ถูกต้อง โดยที่ `า` ในชุดหลักยังแปลงกลับเป็น `า` ตามปกติ
 * การวาดไม่เปลี่ยนเลย — glyph เดิม ตำแหน่งเดิม แค่ชี้ไปคนละ font resource
 *
 * ## ห้ามใช้ glyph.codePoints เป็นตัวตัดสิน
 *
 * fontkit **แคช Glyph object ตาม glyph id** ต่อหนึ่ง font instance ดังนั้น
 * `codePoints` ของ glyph 488 จะเป็น `[U+0E32]` ถ้ามันถูกสร้างครั้งแรกจากการ
 * lookup `า` เดี่ยว แต่จะเป็น `[]` ถ้าถูกสร้างครั้งแรกจากการแตก `ำ`
 * มันจึงขึ้นอยู่กับ **ลำดับข้อความในเอกสาร** ซึ่งเชื่อถือไม่ได้เลย
 * ตัวตัดสินที่ถูกคือ: คลัสเตอร์มี `ำ` และไม่มี `า` เดี่ยว → glyph ที่ id ตรงกับ
 * glyph ของ `า` คือหางของ `ำ`
 *
 * ด้วยเหตุผลเดียวกัน ตอนฝังฟอนต์ต้อง warm แคชด้วย `า` เดี่ยวก่อน (ดู fonts.ts)
 * เพื่อให้ ToUnicode ของชุดหลักเป็น `า` แน่นอน ไม่ว่าเอกสารจะเริ่มด้วยอะไร
 */

/** fontkit Font — pdf-lib ไม่ export type นี้ออกมา */
export interface FontkitFont {
    unitsPerEm: number;
    ascent: number;
    descent: number;
    xHeight: number;
    capHeight: number;
    layout(text: string): {
        glyphs: { id: number; codePoints: number[] }[];
        positions: { xAdvance: number; yAdvance: number; xOffset: number; yOffset: number }[];
    };
    glyphForCodePoint(codePoint: number): { id: number };
}

/** สระอำ — ตัวเดียวในภาษาไทยที่ฟอนต์แตกเป็นสอง glyph โดยตัวหลังไปใช้ glyph ร่วมกับ `า` */
export const SARA_AM = '\u0E33';
/** สระอา */
export const SARA_AA = '\u0E32';

/**
 * ฟอนต์หนึ่งหน้าตัด
 * - `pdf` ชุดหลัก
 * - `tail` ชุดที่สองของไฟล์เดียวกัน ใช้เฉพาะ glyph ที่ไม่มี codePoints (ดูหัวไฟล์)
 * - `kit` ตัว fontkit ไว้ layout
 */
export interface ShapingFont {
    pdf: PDFFont;
    tail: PDFFont;
    kit: FontkitFont;
    /** glyph id ของ `า` (U+0E32) — หางของสระอำใช้ glyph ตัวเดียวกันนี้ */
    saraAaGlyphId: number;
}

export interface ShapedGlyph {
    /** รหัส glyph ในซับเซ็ต 4 ตัวอักษรฐานสิบหก */
    hex: string;
    /** true = ต้องสลับไปใช้ font resource ชุด tail ก่อนวาด glyph นี้ */
    useTailFont: boolean;
    /** offset จาก pen position ตาม GPOS (pt) */
    dxPt: number;
    dyPt: number;
    /** ระยะที่ pen เดินต่อหลังวาด glyph นี้ (pt) */
    advancePt: number;
    /** true = glyph นี้เริ่ม grapheme cluster ใหม่ ใช้เป็นจุดแทรกระยะตอนยืด/บีบ */
    startsCluster: boolean;
}

export interface ShapedText {
    glyphs: ShapedGlyph[];
    widthPt: number;
    sizePt: number;
    /** จำนวน glyph ที่ต้องวาดด้วยฟอนต์ชุด tail (หางสระอำ) — ใช้ยืนยันว่ากลไกทำงาน */
    tailGlyphCount: number;
}

/** ตัดสตริงฐานสิบหกเป็นชิ้นละ 4 ตัว = 1 glyph */
function splitHex(hex: string): string[] {
    const out: string[] = [];
    for (let i = 0; i < hex.length; i += 4) out.push(hex.slice(i, i + 4));
    return out;
}

/** encodeText คืน PDFHexString ที่ toString() ได้ `<....>` — เอาวงเล็บมุมออก */
function encodeHexes(font: PDFFont, text: string): string[] {
    return splitHex(String(font.encodeText(text)).slice(1, -1));
}

/**
 * layout ข้อความเป็น glyph ที่มีพิกัดพร้อมวาด
 *
 * ทำทีละ grapheme cluster เพราะ GPOS ของไทยคำนวณจบภายในคลัสเตอร์
 * (พยัญชนะ + สระ + วรรณยุกต์) ผลจึงเท่ากับ layout ทั้งบรรทัดรวดเดียว
 * แต่ได้ขอบเขตคลัสเตอร์มาใช้จัดระยะ
 */
export function shapeText(text: string, font: ShapingFont, sizePt: number): ShapedText {
    const scale = sizePt / font.kit.unitsPerEm;
    const glyphs: ShapedGlyph[] = [];
    let widthPt = 0;

    for (const cluster of graphemes(text)) {
        const laid = font.kit.layout(cluster);

        // ต้องเรียก encodeText เสมอแม้เราจะวาดเอง เพราะมันคือตัวที่ลงทะเบียน glyph
        // เข้าซับเซ็ตและสร้าง ToUnicode ให้ — ถ้าไม่เรียก PDF จะ copy ข้อความไม่ได้
        const mainHexes = encodeHexes(font.pdf, cluster);

        // คลัสเตอร์ที่มี `ำ` แต่ไม่มี `า` เดี่ยว → glyph ที่ id ตรงกับ `า` คือหางของ `ำ`
        // ถ้ามีทั้งสองอย่างในคลัสเตอร์เดียว (ไม่ใช่รูปคำที่มีจริงในภาษาไทย) แยกไม่ออก
        // จึงปล่อยให้ใช้ชุดหลักทั้งหมด แล้วรายงานเป็น artifact
        const hasAm = cluster.includes(SARA_AM);
        const needsTail = hasAm && !cluster.includes(SARA_AA);
        const tailHexes = needsTail ? encodeHexes(font.tail, cluster) : mainHexes;

        if (mainHexes.length !== laid.glyphs.length || tailHexes.length !== laid.glyphs.length) {
            // pdf-lib layout ด้วย fontFeatures ที่ต่างจากเรา ไม่ควรเกิดถ้าไม่ได้ตั้ง
            // customFontFeatures ตอน embedFont — แต่ถ้าเกิดแล้ววาดต่อจะได้ glyph ผิดตัว
            throw new Error(
                `shapeText: glyph count ไม่ตรงกันที่คลัสเตอร์ ${JSON.stringify(cluster)} ` +
                `(pdf-lib ${mainHexes.length}/${tailHexes.length} vs fontkit ${laid.glyphs.length})`,
            );
        }

        for (let i = 0; i < laid.glyphs.length; i++) {
            const p = laid.positions[i];
            const useTailFont = needsTail && laid.glyphs[i].id === font.saraAaGlyphId;
            glyphs.push({
                hex: useTailFont ? tailHexes[i] : mainHexes[i],
                useTailFont,
                dxPt: p.xOffset * scale,
                dyPt: p.yOffset * scale,
                advancePt: p.xAdvance * scale,
                startsCluster: i === 0,
            });
            widthPt += p.xAdvance * scale;
        }
    }

    return {
        glyphs,
        widthPt,
        sizePt,
        tailGlyphCount: glyphs.reduce((n, g) => n + (g.useTailFont ? 1 : 0), 0),
    };
}

/**
 * ความกว้างของข้อความ (pt)
 *
 * **ห้ามใช้ `PDFFont.widthOfTextAtSize()` แทน** — ตัวนั้นบวก `glyph.advanceWidth`
 * จากตาราง hmtx ตรงๆ โดยไม่สน GPOS ถ้าวัดด้วยตัวหนึ่งแต่วาดด้วยอีกตัว
 * การจัดกึ่งกลาง ชิดขวา และเส้นนำสายตาจะเพี้ยนทีละนิดจนสะสม
 */
export function measureText(text: string, font: ShapingFont, sizePt: number): number {
    const scale = sizePt / font.kit.unitsPerEm;
    let w = 0;
    for (const cluster of graphemes(text)) {
        for (const p of font.kit.layout(cluster).positions) w += p.xAdvance * scale;
    }
    return w;
}
