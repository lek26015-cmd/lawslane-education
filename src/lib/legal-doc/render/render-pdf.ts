import { PDFDocument, type PDFEmbeddedPage } from 'pdf-lib';
import type { Block, LegalDoc, Line, Run } from '../ir';
import { assertNoticePolicy, hasEmblem } from '../ir';
import { words } from '../thai';
import { embedFonts, type AssetBundle, type EmbeddedFonts } from './fonts';
import { measureText, type ShapingFont } from './shaper';
import {
    drawBox, drawDotLeader, drawRule, drawText, drawUnderline, type DrawCtx,
} from './draw';

export interface RenderResult {
    bytes: Uint8Array;
    warnings: string[];
    /** จำนวน glyph ที่วาดด้วยฟอนต์ชุด tail — ควร > 0 ถ้าเอกสารมีสระอำ */
    tailGlyphs: number;
}

/**
 * เพดานช่องไฟระหว่างคำตอนจัดชิดสองข้าง หน่วยเป็นสัดส่วนของขนาดตัวอักษร
 * เกินกว่านี้จะกลายเป็นช่องว่างโหว่ที่อ่านยากกว่าขอบขวาไม่เสมอ
 */
const MAX_JUSTIFY_GAP_EM = 0.35;

/** คำหนึ่งคำพร้อมสไตล์ที่มันสังกัด — หน่วยเล็กสุดที่การตัดบรรทัดมองเห็น */
interface Atom {
    text: string;
    run: Run;
    /** ถ้ามีค่า = อะตอมนี้เป็นช่องเติม ไม่ใช่ข้อความ กว้างคงที่เท่านี้ */
    fillPt?: number;
}

function runSize(run: Run, blockSize: number): number {
    return run.sizePt ?? blockSize;
}

function runFont(run: Run, fonts: EmbeddedFonts): ShapingFont {
    return run.bold ? fonts.bold : fonts.regular;
}

function atomWidth(a: Atom, fonts: EmbeddedFonts, blockSize: number): number {
    if (a.fillPt !== undefined) return a.fillPt;
    return measureText(a.text, runFont(a.run, fonts), runSize(a.run, blockSize));
}

/** แตกบรรทัดเป็นคำ โดยคงข้อมูลสไตล์ของแต่ละ run ไว้ */
function toAtoms(runs: Run[]): Atom[] {
    const out: Atom[] = [];
    for (const run of runs) {
        for (const w of words(run.text)) {
            if (w.text) out.push({ text: w.text, run });
        }
        // ช่องเติมเป็นอะตอมเดี่ยวที่ตัดบรรทัดตรงกลางไม่ได้ และกว้างคงที่
        if (run.fill) out.push({ text: '', run, fillPt: run.fill.widthPt });
    }
    return out;
}

/** ตัดบรรทัดแบบ greedy first-fit บนขอบเขตคำที่ ICU ตัดให้ */
function wrapAtoms(atoms: Atom[], availPt: number, fonts: EmbeddedFonts, blockSize: number): Atom[][] {
    const lines: Atom[][] = [];
    let current: Atom[] = [];
    let width = 0;

    for (const a of atoms) {
        const w = atomWidth(a, fonts, blockSize);
        if (current.length > 0 && width + w > availPt) {
            lines.push(current);
            current = [a];
            width = w;
        } else {
            current.push(a);
            width += w;
        }
    }
    if (current.length > 0) lines.push(current);
    return lines.length > 0 ? lines : [[]];
}

/**
 * อัตราส่วนที่ต้องย่อ เพื่อให้บรรทัดที่กว้างที่สุดในบล็อกลงคอลัมน์พอดี
 *
 * คืน 1 ถ้าทุกบรรทัดลงอยู่แล้ว ไม่ขยายให้ใหญ่ขึ้น เพราะขนาดที่ผู้เขียนระบุ
 * คือเพดาน ไม่ใช่เป้า
 */
function fitScale(block: Block, fonts: EmbeddedFonts, blockSize: number, availPt: number): number {
    let widest = 0;
    for (const [idx, line] of block.lines.entries()) {
        if (!line.runs) continue;
        const indent = (idx === 0 ? block.indentFirstPt : 0) + (line.indentPt ?? 0);
        const w = line.runs.reduce(
            (sum, run) => sum
                + measureText(run.text, runFont(run, fonts), runSize(run, blockSize))
                + (run.fill?.widthPt ?? 0),
            indent,
        );
        widest = Math.max(widest, w);
    }
    return widest > availPt && widest > 0 ? availPt / widest : 1;
}

/** ความกว้างของบรรทัด โดยไม่นับช่องว่างท้ายบรรทัด */
function visualWidth(line: Atom[], fonts: EmbeddedFonts, blockSize: number): number {
    let w = 0;
    for (let i = 0; i < line.length; i++) {
        if (line[i].fillPt !== undefined) { w += line[i].fillPt!; continue; }
        const text = i === line.length - 1 ? line[i].text.replace(/\s+$/, '') : line[i].text;
        w += measureText(text, runFont(line[i].run, fonts), runSize(line[i].run, blockSize));
    }
    return w;
}

export async function renderLegalDoc(doc: LegalDoc, assets: AssetBundle): Promise<RenderResult> {
    assertNoticePolicy(doc);

    const warnings: string[] = [];
    const stats = { tailGlyphs: 0 };
    const pdf = await PDFDocument.create();
    const fonts = await embedFonts(pdf, assets);

    let garuda: PDFEmbeddedPage | undefined;
    if (hasEmblem(doc)) {
        if (assets.garudaPdf) {
            [garuda] = await pdf.embedPdf(assets.garudaPdf);
        } else {
            warnings.push('เอกสารระบุตราครุฑแต่ไม่ได้ส่ง garudaPdf มา — ข้ามการวาดครุฑ');
        }
    }

    for (const [pageIdx, irPage] of doc.pages.entries()) {
        const page = pdf.addPage([irPage.widthPt, irPage.heightPt]);
        const ctx: DrawCtx = {
            page,
            fontKey: {
                regular: page.node.newFontDictionary(fonts.regular.pdf.name, fonts.regular.pdf.ref),
                regularTail: page.node.newFontDictionary(fonts.regular.tail.name, fonts.regular.tail.ref),
                bold: page.node.newFontDictionary(fonts.bold.pdf.name, fonts.bold.pdf.ref),
                boldTail: page.node.newFontDictionary(fonts.bold.tail.name, fonts.bold.tail.ref),
            },
            pageHeightPt: irPage.heightPt,
            stats,
        };

        const contentLeft = irPage.margins.left;
        const contentRight = irPage.widthPt - irPage.margins.right;
        let cursorY = irPage.margins.top;

        // อัตราย่อคิดครั้งเดียวทั้งหน้า ไม่ใช่ทีละบล็อก — ต้นฉบับใช้ขนาดตัวอักษร
        // เดียวทั้งหน้า ถ้าย่อแยกบล็อกจะได้เอกสารที่ตัวหนังสือโตไม่เท่ากันเป็นหย่อมๆ
        const pageFit = Math.min(1, ...irPage.blocks
            .filter((b) => b.fitToWidth && b.lines.length > 0)
            .map((b) => fitScale(
                b,
                fonts,
                b.sizePt ?? doc.defaults.sizePt,
                contentRight - b.indentRightPt - (b.bbox?.x ?? contentLeft) - b.indentLeftPt
                    - 2 * (b.box?.paddingPt ?? 0),
            )));
        if (pageFit < 1) {
            warnings.push(
                `หน้า ${pageIdx + 1}: ย่อขนาดตัวอักษร ×${pageFit.toFixed(3)} ทั้งหน้า ` +
                `เพื่อให้บรรทัดกว้างสุดลงคอลัมน์โดยคงการขึ้นบรรทัดของต้นฉบับ`,
            );
        }

        for (const block of irPage.blocks) {
            cursorY += block.spaceBeforePt;
            if (block.bbox?.y !== undefined) cursorY = block.bbox.y;

            const blockLeft = (block.bbox?.x ?? contentLeft) + block.indentLeftPt;
            const blockRight = contentRight - block.indentRightPt;
            const blockSize = block.sizePt ?? doc.defaults.sizePt;
            const lineHeight = block.lineHeightPt ?? doc.defaults.lineHeightPt;
            const pad = block.box?.paddingPt ?? 0;
            const innerLeft = blockLeft + pad;
            const innerRight = blockRight - pad;

            const blockTop = cursorY;
            if (block.box) cursorY += pad;

            switch (block.role) {
                case 'emblem': {
                    const h = block.emblem?.heightPt ?? 42;
                    if (garuda) {
                        const w = h * (garuda.width / garuda.height);
                        const x = block.align === 'left' ? blockLeft
                            : block.align === 'right' ? blockRight - w
                                : blockLeft + (blockRight - blockLeft - w) / 2;
                        page.drawPage(garuda, { x, y: ctx.pageHeightPt - cursorY - h, width: w, height: h });
                    }
                    cursorY += h;
                    break;
                }
                case 'rule': {
                    const r = block.rule;
                    if (r) {
                        drawRule(ctx, r.fromXPt, r.toXPt, cursorY, r.thicknessPt, r.style);
                        cursorY += Math.max(r.thicknessPt, 1);
                    }
                    break;
                }
                case 'spacer': {
                    cursorY += block.bbox?.h ?? lineHeight;
                    break;
                }
                default: {
                    // ปัดลงเสมอ ปัดขึ้นแม้ 0.05pt ก็ทำให้บรรทัดกว้างสุดล้นแล้วถูกตัดใหม่
                    const size = block.fitToWidth
                        ? Math.floor(blockSize * pageFit * 10) / 10
                        : blockSize;
                    const leading = block.fitToWidth
                        ? Math.floor(lineHeight * pageFit * 10) / 10
                        : lineHeight;
                    cursorY = drawLines(ctx, block, {
                        fonts, doc, innerLeft, innerRight,
                        blockSize: size, lineHeight: leading,
                        startY: cursorY, warnings, pageIdx,
                    });
                }
            }

            if (block.box) {
                cursorY += pad;
                drawBox(ctx, blockLeft, blockTop, blockRight - blockLeft, cursorY - blockTop, block.box.borderPt);
            }
        }

        const contentBottom = irPage.heightPt - irPage.margins.bottom;
        if (cursorY > contentBottom) {
            warnings.push(
                `หน้า ${pageIdx + 1}: เนื้อหาล้นขอบล่าง ${Math.round(cursorY - contentBottom)}pt ` +
                `— ส่วนที่ล้นถูกวาดนอกกระดาษ มองไม่เห็นและคัดลอกไม่ได้`,
            );
        }

        if (doc.notice.enabled) {
            const size = 7.5;
            const w = measureText(doc.notice.text, fonts.regular, size);
            drawText(
                ctx, doc.notice.text, fonts.regular, size,
                contentLeft + (contentRight - contentLeft - w) / 2,
                irPage.heightPt - irPage.margins.bottom / 2,
                { color: { r: 0.45, g: 0.45, b: 0.45 } },
            );
        }
    }

    pdf.setTitle(doc.title);
    pdf.setSubject(doc.docType);
    pdf.setProducer(`Lawslane Wittaya legal-doc (${fonts.label})`);
    pdf.setCreator('Lawslane Wittaya');
    // ระบุไว้ใน metadata ด้วยว่าเป็นเอกสารที่จัดพิมพ์ใหม่ ไม่ใช่ต้นฉบับ
    pdf.setKeywords([doc.kind, doc.docType, 'จัดพิมพ์ใหม่เพื่อการศึกษา']);

    return { bytes: await pdf.save(), warnings, tailGlyphs: stats.tailGlyphs };
}

interface LineCtx {
    fonts: EmbeddedFonts;
    doc: LegalDoc;
    innerLeft: number;
    innerRight: number;
    blockSize: number;
    lineHeight: number;
    startY: number;
    warnings: string[];
    pageIdx: number;
}

function drawLines(ctx: DrawCtx, block: Block, lc: LineCtx): number {
    const { fonts, innerLeft, innerRight, blockSize, lineHeight } = lc;
    let y = lc.startY;

    for (const [lineIdx, line] of block.lines.entries()) {
        y += line.spaceBeforePt ?? 0;

        const indent = (lineIdx === 0 ? block.indentFirstPt : 0) + (line.indentPt ?? 0);
        const x0 = innerLeft + indent;
        const avail = innerRight - x0;
        const align = line.align ?? block.align;

        // บรรทัดว่าง: เว้นระยะเท่าหนึ่งบรรทัด เหมือนที่ต้นฉบับเคาะ enter ทิ้งไว้
        if (!line.runs || line.runs.length === 0) {
            if (line.blank) {
                y += lineHeight;
                if (line.blank.rule) drawRule(ctx, x0, x0 + line.blank.widthPt, y - lineHeight * 0.25, 0.6);
            } else if (line.leader) {
                y += lineHeight;
                drawDotLeader(ctx, fonts.regular, blockSize, x0, line.leader.toXPt, y - lineHeight * 0.25);
            } else {
                y += lineHeight;
            }
            continue;
        }

        const visual = wrapAtoms(toAtoms(line.runs), avail, fonts, blockSize);

        // เตือนเฉพาะเอกสารที่ *ถอดการขึ้นบรรทัดมาจากต้นฉบับ* ซึ่งดูออกจากการที่
        // ผู้เขียนสั่ง justify มากับตัวบรรทัด หรือเปิด fitToWidth ไว้
        // ถ้าเป็นเนื้อหาที่แต่งเอง การตัดบรรทัดคือการเรียงพิมพ์ปกติ ไม่ใช่ความผิดพลาด
        const isTranscription = line.align === 'justify' || block.fitToWidth;
        if (visual.length > 1 && isTranscription) {
            lc.warnings.push(
                `หน้า ${lc.pageIdx + 1} บรรทัด ${line.id}: กว้างเกินคอลัมน์ ต้องตัดเป็น ${visual.length} บรรทัด ` +
                `— การขึ้นบรรทัดจะไม่ตรงต้นฉบับ`,
            );
        }

        // `align: 'justify'` ที่ระบุมากับตัวบรรทัดเอง = ผู้เขียนสั่งให้จัดชิดสองข้าง
        // บรรทัดนั้นเสมอ ซึ่งจำเป็นเมื่อถอดการขึ้นบรรทัดจากต้นฉบับมาทีละบรรทัด
        // (ทุกบรรทัดจะเป็น "บรรทัดสุดท้าย" ของตัวเอง กฎปกติจึงไม่เคยทำงาน)
        // ส่วน justify ที่รับช่วงมาจาก block ใช้กฎปกติ: ไม่จัดบรรทัดสุดท้ายของย่อหน้า
        const forceJustify = line.align === 'justify';

        for (const [vIdx, atoms] of visual.entries()) {
            y += lineHeight;
            const isLastVisual = vIdx === visual.length - 1;
            const w = visualWidth(atoms, fonts, blockSize);

            let x = x0;
            let gap = 0;
            if (align === 'center') x = x0 + (avail - w) / 2;
            else if (align === 'right') x = innerRight - w;
            // บรรทัดที่ถูกตัดใหม่ไม่ใช้ forceJustify — บรรทัดท้ายของมันคือท้ายย่อหน้าจริง
            else if (align === 'justify'
                && ((forceJustify && visual.length === 1) || !isLastVisual)
                && atoms.length > 1) {
                const needed = (avail - w) / (atoms.length - 1);
                // เพดานช่องไฟ: บรรทัดที่สั้นกว่าคอลัมน์มากจะได้ช่องว่างระหว่างคำ
                // กว้างจนอ่านยาก ปล่อยให้ขอบขวาไม่เสมอดีกว่ายืดจนเป็นคนละเอกสาร
                gap = needed <= MAX_JUSTIFY_GAP_EM * blockSize ? needed : 0;
                if (gap === 0) {
                    lc.warnings.push(
                        `หน้า ${lc.pageIdx + 1} บรรทัด ${line.id}: ไม่จัดชิดสองข้าง ` +
                        `เพราะต้องยืดช่องไฟถึง ${(needed / blockSize).toFixed(2)} em`,
                    );
                }
            }

            for (const [aIdx, a] of atoms.entries()) {
                const font = runFont(a.run, fonts);
                const size = runSize(a.run, blockSize);

                if (a.fillPt !== undefined) {
                    const style = a.run.fill?.style ?? 'dot';
                    if (style === 'dot') drawDotLeader(ctx, fonts.regular, size, x, x + a.fillPt, y);
                    else if (style === 'rule') drawRule(ctx, x, x + a.fillPt, y + 2, 0.6);
                    x += a.fillPt + gap;
                    continue;
                }

                const text = aIdx === atoms.length - 1 ? a.text.replace(/\s+$/, '') : a.text;
                if (!text) continue;
                const drawn = drawText(ctx, text, font, size, x, y, { bold: a.run.bold });
                if (a.run.underline) drawUnderline(ctx, font, size, x, x + drawn, y);
                x += drawn + gap;
            }

            if (isLastVisual && line.leader) {
                drawDotLeader(ctx, fonts.regular, blockSize, x, line.leader.toXPt, y);
            }
            if (isLastVisual && line.blank) {
                drawRule(ctx, x, x + line.blank.widthPt, y + 2, 0.6);
            }
        }
    }

    return y;
}
