import 'server-only';
import fs from 'fs';
import path from 'path';
import { PDFDocument, PDFFont, PDFPage, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

/**
 * ประทับชื่อ/อีเมลผู้ซื้อลงสำเนา E-Book ตอนดาวน์โหลด — แชร์ต่อแล้วสืบกลับได้
 *  - หน้ารองปก (แทรกเป็นหน้า 2): ออกให้ใคร · วันที่ · รหัสสำเนา · เงื่อนไขการใช้งาน
 *  - ท้ายทุกหน้าถัดไป: "ออกให้ <อีเมล> · <รหัสสำเนา>" ตัวเล็กสีเทา
 * ฟอนต์อยู่ที่ src/assets/fonts (ถูกรวมใน bundle ผ่าน outputFileTracingIncludes ใน next.config.ts)
 */

const FONT_DIR = path.join(process.cwd(), 'src/assets/fonts');
const readFont = (name: string) => fs.readFileSync(path.join(FONT_DIR, name));

export type WatermarkInfo = {
    /** ชื่อที่แสดง (ไม่มีให้ใช้อีเมลแทน) */
    holder: string;
    email: string;
    /** รหัสสำเนาสั้น ๆ ไว้เทียบกับ log ฝั่ง server */
    copyId: string;
    issuedAt: Date;
};

/** ตัดตัวอักษรที่ฟอนต์วาดไม่ได้/ควบคุม และจำกัดความยาว กันข้อความแปลกจากชื่อโปรไฟล์ */
function clean(text: string, max = 80): string {
    return text.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** แบ่งคำด้วย Intl.Segmenter (ไทยไม่มีเว้นวรรค) แล้วตัดบรรทัดตามความกว้างโดยไม่ผ่ากลางคำ */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
    const lines: string[] = [];
    let cur = '';
    for (const { segment } of segmenter.segment(text)) {
        if (font.widthOfTextAtSize((cur + segment).trimEnd(), size) > maxWidth && cur) {
            lines.push(cur.trimEnd());
            cur = segment.trimStart();
        } else {
            cur += segment;
        }
    }
    if (cur.trim()) lines.push(cur.trimEnd());
    return lines;
}

export async function watermarkEbook(source: Uint8Array, info: WatermarkInfo): Promise<Uint8Array> {
    const pdf = await PDFDocument.load(source, { updateMetadata: false });
    pdf.registerFontkit(fontkit);
    const regular = await pdf.embedFont(readFont('Sarabun-Regular.ttf'), { subset: true });
    const bold = await pdf.embedFont(readFont('Sarabun-Bold.ttf'), { subset: true });

    const holder = clean(info.holder);
    const email = clean(info.email, 120);
    const date = info.issuedAt.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Bangkok' });

    // ท้ายทุกหน้า (ยกเว้นปก) — ทำก่อนแทรกหน้ารองปก
    const footer = `ออกให้ ${email} · สำเนา ${info.copyId}`;
    pdf.getPages().forEach((page, i) => {
        if (i === 0) return;
        page.drawText(footer, { x: 28, y: 14, size: 7.5, font: regular, color: rgb(0.6, 0.64, 0.7) });
    });

    // หน้ารองปก — ขนาดเดียวกับหน้าปก
    const { width, height } = pdf.getPage(0).getSize();
    const page = pdf.insertPage(1, [width, height]);
    drawLicensePage(page, regular, bold, { holder, email, date, copyId: info.copyId });

    return pdf.save({ useObjectStreams: true });
}

function drawLicensePage(
    page: PDFPage,
    regular: PDFFont,
    bold: PDFFont,
    d: { holder: string; email: string; date: string; copyId: string },
) {
    const { width, height } = page.getSize();
    const margin = 56;
    const textW = width - margin * 2;
    const navy = rgb(0.043, 0.224, 0.475);
    const slate = rgb(0.2, 0.25, 0.33);
    let y = height - 110;

    page.drawRectangle({ x: 0, y: height - 14, width, height: 14, color: navy });
    page.drawText('ลิขสิทธิ์และเงื่อนไขการใช้งาน', { x: margin, y, size: 22, font: bold, color: navy });
    y -= 14;
    page.drawRectangle({ x: margin, y, width: textW, height: 1.2, color: rgb(0.79, 0.6, 0.23) });
    y -= 34;

    page.drawText('E-Book เล่มนี้ออกให้เฉพาะ', { x: margin, y, size: 12, font: regular, color: slate });
    y -= 30;
    for (const line of wrap(d.holder, bold, 20, textW)) {
        page.drawText(line, { x: margin, y, size: 20, font: bold, color: navy });
        y -= 26;
    }
    page.drawText(d.email, { x: margin, y, size: 13, font: regular, color: slate });
    y -= 22;
    page.drawText(`วันที่ดาวน์โหลด ${d.date}   ·   รหัสสำเนา ${d.copyId}`, { x: margin, y, size: 11, font: regular, color: slate });
    y -= 40;

    const terms = [
        'ไฟล์นี้จัดทำสำหรับการศึกษาด้วยตนเองของผู้ซื้อ/ผู้ได้รับสิทธิ์ตามชื่อข้างต้นเท่านั้น',
        'ห้ามทำซ้ำ ดัดแปลง เผยแพร่ ส่งต่อ แจกจ่าย หรือจำหน่ายไฟล์นี้ไม่ว่าทั้งหมดหรือบางส่วน โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจาก Lawslane',
        'ทุกหน้าของไฟล์ประทับชื่อและรหัสสำเนาของผู้ได้รับสิทธิ์ไว้ หากพบการเผยแพร่โดยไม่ได้รับอนุญาต สามารถตรวจสอบย้อนกลับถึงผู้ดาวน์โหลดได้',
        'เนื้อหาเป็นข้อสอบเก่าพร้อมธงคำตอบที่รวบรวมเพื่อการเรียนรู้ ไม่ใช่คำปรึกษาทางกฎหมาย',
    ];
    page.drawText('เงื่อนไข', { x: margin, y, size: 13, font: bold, color: navy });
    y -= 22;
    terms.forEach((t, i) => {
        const lines = wrap(t, regular, 11.5, textW - 18);
        page.drawText(`${i + 1}.`, { x: margin, y, size: 11.5, font: regular, color: slate });
        for (const line of lines) {
            page.drawText(line, { x: margin + 18, y, size: 11.5, font: regular, color: slate });
            y -= 17;
        }
        y -= 6;
    });

    page.drawText('Lawslane Wittaya · wittaya.lawslane.com', { x: margin, y: 40, size: 9, font: regular, color: rgb(0.6, 0.64, 0.7) });
}
