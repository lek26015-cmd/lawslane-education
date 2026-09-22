import fontkit from '@pdf-lib/fontkit';
import type { PDFDocument } from 'pdf-lib';
import type { FontkitFont, ShapingFont } from './shaper';
import { SARA_AA } from './shaper';

/**
 * ทรัพยากรที่ renderer ต้องใช้ ส่งเข้ามาเป็น byte เสมอ
 *
 * ตั้งใจให้ไม่มีการอ่านไฟล์ในนี้ โมดูล render/ ทั้งหมดจึงรันได้ทั้งใน CLI,
 * ใน server action ของ Next และใน Worker โดยไม่ต้องแก้อะไร
 * ฝั่ง Node ที่โหลดไฟล์จริงอยู่ที่ ../node/assets.ts
 */
export interface AssetBundle {
    regular: Uint8Array;
    bold: Uint8Array;
    /** PDF หน้าเดียวของตราครุฑแบบ vector — ไม่มีก็ได้ถ้าเอกสารไม่ใช้ */
    garudaPdf?: Uint8Array;
    /** ชื่อฟอนต์ที่ใช้จริง บันทึกลง metadata เพื่อให้ตรวจย้อนได้ */
    fontLabel: string;
}

export interface EmbeddedFonts {
    regular: ShapingFont;
    bold: ShapingFont;
    label: string;
}

export async function embedFonts(doc: PDFDocument, assets: AssetBundle): Promise<EmbeddedFonts> {
    doc.registerFontkit(fontkit);

    // subset: true ทำให้ไฟล์เล็กลงมากและสร้าง ToUnicode ให้ ซึ่งเป็นสิ่งที่ทำให้
    // copy ข้อความไทยออกจาก PDF ได้
    //
    // ฝังไฟล์เดิมชุดละสองครั้ง: ชุด `tail` ใช้วาดเฉพาะ glyph ที่ codePoints ว่าง
    // (หางของสระอำ) เหตุผลเต็มอยู่ในหัวไฟล์ shaper.ts
    const [regularPdf, regularTail, boldPdf, boldTail] = await Promise.all([
        doc.embedFont(assets.regular, { subset: true }),
        doc.embedFont(assets.regular, { subset: true }),
        doc.embedFont(assets.bold, { subset: true }),
        doc.embedFont(assets.bold, { subset: true }),
    ]);

    const regularKit = fontkit.create(assets.regular) as unknown as FontkitFont;
    const boldKit = fontkit.create(assets.bold) as unknown as FontkitFont;

    // warm แคช glyph ของ `า` ในชุดหลักก่อนอย่างอื่น
    //
    // fontkit แคช Glyph ตาม id ต่อ instance และ codePoints ของ glyph `า` ขึ้นกับว่า
    // มันถูกสร้างครั้งแรกจาก `า` เดี่ยว หรือจากการแตก `ำ` ถ้าเอกสารบังเอิญมี `ำ`
    // มาก่อน `า` ToUnicode ของชุดหลักจะกลายเป็นค่าว่าง แล้ว `า` ทุกตัวในเอกสาร
    // จะ copy ออกมาไม่ได้ — การเรียกตรงนี้ล็อกให้เป็น `า` เสมอ
    regularPdf.encodeText(SARA_AA);
    boldPdf.encodeText(SARA_AA);
    regularKit.layout(SARA_AA);
    boldKit.layout(SARA_AA);

    return {
        regular: {
            pdf: regularPdf,
            tail: regularTail,
            kit: regularKit,
            saraAaGlyphId: regularKit.glyphForCodePoint(SARA_AA.codePointAt(0)!).id,
        },
        bold: {
            pdf: boldPdf,
            tail: boldTail,
            kit: boldKit,
            saraAaGlyphId: boldKit.glyphForCodePoint(SARA_AA.codePointAt(0)!).id,
        },
        label: assets.fontLabel,
    };
}
