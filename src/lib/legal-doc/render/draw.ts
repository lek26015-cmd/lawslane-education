import {
    PDFHexString, PDFName, PDFPage, beginText, endText, setFontAndSize, setTextMatrix,
    showText, setFillingRgbColor, rgb,
} from 'pdf-lib';
import type { ShapedText, ShapingFont } from './shaper';
import { shapeText } from './shaper';

/**
 * พื้นฐานการวาดลงหน้า PDF
 *
 * **ระบบพิกัด:** ทุก API ในไฟล์นี้รับ y แบบ "จากขอบบนลงล่าง" ตาม IR
 * แล้วกลับด้านให้เป็นระบบของ pdf-lib (ซ้ายล่าง y ขึ้นบน) ที่นี่ที่เดียว
 * อย่ากลับด้านซ้ำที่อื่น
 */

/** key ของฟอนต์ในพจนานุกรมของหน้า ได้จาก page.node.newFontDictionary() */
export interface PageFontKeys {
    regular: PDFName;
    regularTail: PDFName;
    bold: PDFName;
    boldTail: PDFName;
}

export interface DrawCtx {
    page: PDFPage;
    fontKey: PageFontKeys;
    pageHeightPt: number;
    /** ตัวนับสะสมทั้งเอกสาร — renderer อ่านไปรายงานใน RenderResult */
    stats: { tailGlyphs: number };
}

/** แปลง y จากระบบ IR (บนลงล่าง) เป็นระบบ pdf-lib (ล่างขึ้นบน) */
export function flipY(ctx: DrawCtx, yFromTopPt: number): number {
    return ctx.pageHeightPt - yFromTopPt;
}

export interface DrawTextOptions {
    /** ระยะที่แทรกเพิ่มระหว่าง grapheme cluster ใช้ยืด/บีบบรรทัดและจัดชิดสองข้าง */
    extraClusterSpacingPt?: number;
    color?: { r: number; g: number; b: number };
    bold?: boolean;
}

/**
 * วาดข้อความที่ shape แล้ว โดย x คือขอบซ้าย และ baselineY วัดจากขอบบนกระดาษ
 *
 * glyph ที่ไม่มี GPOS offset จะถูกรวมเป็น showText ก้อนเดียวกัน ไม่ใช่วาดทีละตัว
 * เพราะถ้าแยก Tm + Tj ทุก glyph โปรแกรมอ่าน PDF จะแทรกช่องว่างระหว่างอักษรทุกตัว
 * ตอน copy ข้อความ — ซึ่งทำลายเหตุผลทั้งหมดของการพิมพ์ใหม่แทนที่จะใช้ภาพสแกน
 * glyph ที่มี offset (สระ/วรรณยุกต์ที่ advance = 0) เท่านั้นที่วาดแยก แล้วตั้ง
 * ตำแหน่งใหม่ให้ก้อนถัดไป
 */
export function drawShapedText(
    ctx: DrawCtx,
    shaped: ShapedText,
    xPt: number,
    baselineYFromTopPt: number,
    opts: DrawTextOptions = {},
): void {
    if (shaped.glyphs.length === 0) return;

    const { extraClusterSpacingPt = 0, color = { r: 0, g: 0, b: 0 }, bold = false } = opts;
    const baseY = flipY(ctx, baselineYFromTopPt);
    const mainKey = bold ? ctx.fontKey.bold : ctx.fontKey.regular;
    const tailKey = bold ? ctx.fontKey.boldTail : ctx.fontKey.regularTail;

    const ops: unknown[] = [
        beginText(),
        setFillingRgbColor(color.r, color.g, color.b),
        setFontAndSize(mainKey, shaped.sizePt),
    ];
    let activeKey = mainKey;

    let penX = xPt;
    let buffer = '';
    let bufferStartX = penX;

    const flush = () => {
        if (!buffer) return;
        ops.push(setTextMatrix(1, 0, 0, 1, bufferStartX, baseY), showText(PDFHexString.of(buffer)));
        buffer = '';
    };

    /** สลับ font resource — ต้องปิดก้อนที่ค้างอยู่ก่อน ไม่งั้น glyph ก่อนหน้าจะใช้ฟอนต์ผิด */
    const useFont = (key: PDFName) => {
        if (key === activeKey) return;
        flush();
        ops.push(setFontAndSize(key, shaped.sizePt));
        activeKey = key;
    };

    for (const g of shaped.glyphs) {
        // ขึ้นคลัสเตอร์ใหม่และมีการแทรกระยะ → ต้องตั้งตำแหน่งใหม่ จึงปิดก้อนก่อน
        if (g.startsCluster && extraClusterSpacingPt !== 0 && penX !== xPt) {
            flush();
            penX += extraClusterSpacingPt;
        }

        useFont(g.useTailFont ? tailKey : mainKey);

        if (g.dxPt === 0 && g.dyPt === 0) {
            if (!buffer) bufferStartX = penX;
            buffer += g.hex;
        } else {
            flush();
            ops.push(
                setTextMatrix(1, 0, 0, 1, penX + g.dxPt, baseY + g.dyPt),
                showText(PDFHexString.of(g.hex)),
            );
            bufferStartX = penX + g.advancePt;
        }
        penX += g.advancePt;
    }
    flush();

    ops.push(endText());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ops เป็น PDFOperator ทั้งหมด
    ctx.page.pushOperators(...(ops as any[]));
}

/** วาดข้อความจากสตริงดิบ คืนความกว้างที่วาดจริง */
export function drawText(
    ctx: DrawCtx,
    text: string,
    font: ShapingFont,
    sizePt: number,
    xPt: number,
    baselineYFromTopPt: number,
    opts: DrawTextOptions = {},
): number {
    const shaped = shapeText(text, font, sizePt);
    ctx.stats.tailGlyphs += shaped.tailGlyphCount;
    drawShapedText(ctx, shaped, xPt, baselineYFromTopPt, opts);
    const clusters = shaped.glyphs.filter((g) => g.startsCluster).length;
    const extra = (opts.extraClusterSpacingPt ?? 0) * Math.max(0, clusters - 1);
    return shaped.widthPt + extra;
}

export function drawRule(
    ctx: DrawCtx,
    fromXPt: number,
    toXPt: number,
    yFromTopPt: number,
    thicknessPt = 0.75,
    style: 'solid' | 'dashed' | 'dotted' = 'solid',
): void {
    const y = flipY(ctx, yFromTopPt);
    ctx.page.drawLine({
        start: { x: fromXPt, y },
        end: { x: toXPt, y },
        thickness: thicknessPt,
        color: rgb(0, 0, 0),
        dashArray: style === 'dashed' ? [4, 3] : style === 'dotted' ? [0.8, 2.2] : undefined,
        dashPhase: 0,
        lineCap: style === 'dotted' ? 1 : undefined,
    });
}

export function drawBox(
    ctx: DrawCtx,
    xPt: number,
    yFromTopPt: number,
    widthPt: number,
    heightPt: number,
    borderPt = 0.75,
): void {
    ctx.page.drawRectangle({
        x: xPt,
        y: flipY(ctx, yFromTopPt + heightPt),
        width: widthPt,
        height: heightPt,
        borderWidth: borderPt,
        borderColor: rgb(0, 0, 0),
    });
}

/**
 * เส้นนำสายตา — จุดไข่ปลา `..........` ที่พบในแบบพิมพ์ทุกชนิด
 *
 * วาดเป็นตัวอักษร `.` ซ้ำจริงๆ ไม่ใช่เส้นประ เพราะต้นฉบับก็พิมพ์จุดจริง
 * และทำให้ copy ข้อความออกมาได้เหมือนต้นฉบับด้วย
 */
export function drawDotLeader(
    ctx: DrawCtx,
    font: ShapingFont,
    sizePt: number,
    fromXPt: number,
    toXPt: number,
    baselineYFromTopPt: number,
): void {
    const span = toXPt - fromXPt;
    if (span <= 0) return;
    const dot = shapeText('.', font, sizePt);
    const unit = dot.widthPt;
    if (unit <= 0) return;
    const count = Math.floor(span / unit);
    if (count <= 0) return;
    drawShapedText(ctx, shapeText('.'.repeat(count), font, sizePt), fromXPt, baselineYFromTopPt);
}

/** ขีดเส้นใต้ข้อความ — pdf-lib ไม่มีให้ ต้องวาดเอง */
export function drawUnderline(
    ctx: DrawCtx,
    font: ShapingFont,
    sizePt: number,
    fromXPt: number,
    toXPt: number,
    baselineYFromTopPt: number,
): void {
    const drop = (Math.abs(font.kit.descent) / font.kit.unitsPerEm) * sizePt * 0.45;
    drawRule(ctx, fromXPt, toXPt, baselineYFromTopPt + drop, sizePt * 0.045, 'solid');
}
