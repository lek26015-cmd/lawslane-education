#!/usr/bin/env -S npx tsx
/**
 * legal-doc CLI — สร้าง PDF เอกสารรูปแบบจริงสำหรับข้อสอบ
 *
 *   npm run legal-doc -- build docs/legal-doc/xxx.json -o out/xxx.pdf
 *   npm run legal-doc -- verify out/xxx.pdf --ir docs/legal-doc/xxx.json
 */
import { parseArgs } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parseLegalDoc, allText } from '../../src/lib/legal-doc/ir';
import { renderLegalDoc } from '../../src/lib/legal-doc/render/render-pdf';
import { loadAssets } from '../../src/lib/legal-doc/node/assets';
import { extractPdfText } from '../../src/lib/legal-doc/node/pdf-text';
import { rasterizePdf } from '../../src/lib/legal-doc/node/rasterize';
import { cropImage, parseCrop, sideBySide } from '../../src/lib/legal-doc/node/crop';
import { ocrImage } from '../../src/lib/legal-doc/node/typhoon';
import { SCHEMA_VERSION } from '../../src/lib/legal-doc/ir';
import { normalize, extractNumerals } from '../../src/lib/legal-doc/thai';

function fail(msg: string): never {
    console.error(`✗ ${msg}`);
    process.exit(1);
}

/** โปรเจกต์นี้เก็บคีย์ไว้ใน .env.local — Node 24 อ่านให้ได้เองไม่ต้องพึ่ง dotenv */
function loadEnv() {
    for (const f of ['.env.local', '.env']) {
        if (existsSync(f)) {
            try { process.loadEnvFile(f); } catch { /* ไฟล์เสียก็ข้ามไป */ }
        }
    }
}

async function cmdBuild(args: string[]) {
    const { values, positionals } = parseArgs({
        args,
        allowPositionals: true,
        options: {
            out: { type: 'string', short: 'o' },
            'font-dir': { type: 'string' },
            'no-verify': { type: 'boolean', default: false },
        },
    });

    const irPath = positionals[0];
    if (!irPath) fail('ต้องระบุไฟล์ IR: build <ir.json> -o <out.pdf>');

    const doc = parseLegalDoc(JSON.parse(await readFile(irPath, 'utf8')));
    const needsGaruda = doc.pages.some((p) => p.blocks.some((b) => b.role === 'emblem'));
    const assets = await loadAssets({ fontDir: values['font-dir'], withGaruda: needsGaruda });

    const { bytes, warnings, tailGlyphs } = await renderLegalDoc(doc, assets);

    const outPath = values.out ?? irPath.replace(/\.json$/, '.pdf');
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, bytes);

    console.log(`✓ ${outPath}  (${(bytes.length / 1024).toFixed(1)} KB, ฟอนต์ ${assets.fontLabel}, tail glyph ${tailGlyphs})`);
    for (const w of warnings) console.warn(`  ⚠ ${w}`);

    if (!values['no-verify']) await verify(outPath, doc);
}

async function cmdVerify(args: string[]) {
    const { values, positionals } = parseArgs({
        args, allowPositionals: true, options: { ir: { type: 'string' } },
    });
    const pdfPath = positionals[0];
    if (!pdfPath || !values.ir) fail('ใช้: verify <out.pdf> --ir <ir.json>');
    await verify(pdfPath, parseLegalDoc(JSON.parse(await readFile(values.ir, 'utf8'))));
}

/**
 * artifact ที่หลีกเลี่ยงไม่ได้ของรูปแบบ PDF: หางสระอำ
 *
 * ฟอนต์แตก `ำ` เป็นนิคหิต (ซึ่ง ToUnicode ชี้ไป "ำ" ครบแล้ว) ตามด้วย glyph `า`
 * ที่เป็นแค่รูปร่าง ไม่มีความหมายทางข้อความ เราจึงจงใจไม่ใส่ ToUnicode ให้มัน
 * (ผ่านฟอนต์ชุด tail ดู render/shaper.ts) ตัวอ่าน PDF ที่ทำตามสเปกจะข้ามมันไป
 * แต่ pdfjs เลือกคืนรหัส glyph ดิบออกมาเป็นอักขระควบคุมแทน
 *
 * ข้อความจึงถูกต้องทุกตัวอักษร มีแต่อักขระควบคุมที่มองไม่เห็นแทรกอยู่
 * ซึ่งดีกว่าทางเลือกเดิมที่ได้ `า` เกินมาจริงๆ (คำว่า จำกัด กลายเป็น จำากัด)
 *
 * ทางแก้ที่ถูกตามสเปกคือ ActualText marked content แต่ pdfjs ไม่รองรับเลย
 * (grep หา ActualText ใน pdf.mjs ไม่เจอ) จึงยังแก้ให้หายขาดไม่ได้
 */
const EXTRACTION_ARTIFACT = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

/**
 * เส้นนำสายตาถูกวาดเป็นตัว `.` จริงตามความกว้างที่เหลือ ซึ่งเป็นสิ่งที่ต้องการ
 * (ต้นฉบับก็พิมพ์จุดจริง และ copy ออกมาได้เหมือนกัน) แต่ IR ไม่ได้เก็บจำนวนจุดไว้
 * เพราะมันขึ้นกับความกว้างตอนเรนเดอร์ จึงยุบจุดติดกันตั้งแต่ ๓ ตัวขึ้นไปทั้งสองฝั่ง
 */
const DOT_LEADER = /\.{3,}/g;

/**
 * ตรวจสองอย่างที่ถ้าพลาดแล้วเอกสารใช้ไม่ได้:
 *  1. ข้อความที่สกัดจาก PDF ต้องตรงกับที่อยู่ใน IR — ถ้าไม่ตรง ToUnicode CMap พัง
 *     ได้ PDF ที่ดูดีแต่ค้นหา/คัดลอกไม่ได้ ซึ่งทำลายเหตุผลของการพิมพ์ใหม่ทั้งหมด
 *  2. ลำดับตัวเลขต้องตรงเป๊ะ — ในข้อสอบตั๋วเงิน จำนวนเงินหรือวันที่ผิดตัวเดียว คำตอบเปลี่ยน
 */
async function verify(pdfPath: string, doc: ReturnType<typeof parseLegalDoc>) {
    const raw = await extractPdfText(pdfPath);
    const artifacts = raw.match(EXTRACTION_ARTIFACT)?.length ?? 0;
    const extracted = raw.replace(EXTRACTION_ARTIFACT, '');
    const expected = allText(doc).join('');

    const a = normalize(extracted).replace(DOT_LEADER, '').replace(/\s/g, '');
    const b = normalize(expected).replace(DOT_LEADER, '').replace(/\s/g, '');

    // notice ท้ายหน้าถูกวาดด้วย จึงอนุญาตให้ข้อความที่สกัดได้ยาวกว่า IR
    const textOk = a.includes(b) || b.includes(a);
    console.log(`  ${textOk ? '✓' : '✗'} round-trip ข้อความ: IR ${b.length} ตัวอักษร, สกัดได้ ${a.length}`);
    if (artifacts > 0) {
        console.log(`    ℹ artifact หางสระอำ ${artifacts} ตัว (อักขระควบคุมที่มองไม่เห็น — ดูคอมเมนต์ใน cli.ts)`);
    }
    if (!textOk) {
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] !== b[i]) {
                console.error(`    ต่างกันที่ตัวที่ ${i}: สกัดได้ ${JSON.stringify(a.slice(i, i + 24))}`);
                console.error(`                       IR มี      ${JSON.stringify(b.slice(i, i + 24))}`);
                break;
            }
        }
    }

    const numIr = extractNumerals(expected);
    const numPdf = extractNumerals(extracted);
    const numOk = numIr.every((n, i) => numPdf[i] === n);
    console.log(`  ${numOk ? '✓' : '✗'} ตัวเลข ${numIr.length} ชุด: ${numIr.join(', ') || '(ไม่มี)'}`);
    if (!numOk) console.error(`    PDF มี: ${numPdf.join(', ')}`);

    if (!textOk || !numOk) process.exitCode = 1;
}

/**
 * ครอปเอกสารออกจากหน้าต้นฉบับ แล้วให้ Typhoon อ่านเป็นร่างข้อความ
 *
 * เขียนออกสามไฟล์: PNG ครอป (ไว้ดูว่าครอปถูกกรอบไหม), ข้อความดิบจาก Typhoon,
 * และโครง IR เปล่าที่ใส่ที่มาไว้ให้แล้ว — คนเอาข้อความไปจัดลงโครงนั้นเอง
 * ไม่มีการเอาผล OCR เข้า IR อัตโนมัติ เพราะ Typhoon แก้ตัวโจทย์ได้
 */
async function cmdExtract(args: string[]) {
    const { values, positionals } = parseArgs({
        args,
        allowPositionals: true,
        options: {
            page: { type: 'string', default: '1' },
            crop: { type: 'string' },
            dpi: { type: 'string', default: '300' },
            out: { type: 'string', short: 'o' },
            'no-ocr': { type: 'boolean', default: false },
        },
    });

    const src = positionals[0];
    if (!src) fail('ใช้: extract <source.pdf> --page N [--crop 0.1,0.28,0.9,0.62] -o draft.json');

    const pageNo = Number(values.page);
    if (!Number.isInteger(pageNo) || pageNo < 1) fail(`--page ต้องเป็นจำนวนเต็มบวก (ได้: ${values.page})`);

    const pages = await rasterizePdf(src, { dpi: Number(values.dpi), maxPages: pageNo });
    if (pages.length < pageNo) fail(`ไฟล์มี ${pages.length} หน้า แต่ขอหน้า ${pageNo}`);

    const cropFrac = values.crop ? parseCrop(values.crop) : undefined;
    const image = cropFrac ? await cropImage(pages[pageNo - 1], cropFrac) : pages[pageNo - 1];

    const outJson = values.out ?? `docs/legal-doc/draft-p${pageNo}.json`;
    const base = outJson.replace(/\.json$/, '');
    await mkdir(path.dirname(outJson), { recursive: true });
    await writeFile(`${base}.crop.png`, image);
    console.log(`✓ ${base}.crop.png  (${(image.length / 1024).toFixed(0)} KB) — เปิดดูว่าครอปได้กรอบที่ต้องการไหม`);

    let ocrText = '';
    if (!values['no-ocr']) {
        const r = await ocrImage(image);
        if (r.ok) {
            ocrText = r.text;
            await writeFile(`${base}.ocr.txt`, ocrText);
            console.log(`✓ ${base}.ocr.txt  (${ocrText.length} ตัวอักษร)`);
            if (r.truncated) console.warn('  ⚠ Typhoon ตัดข้อความกลางคัน (ชน token cap) — ลองครอปให้เล็กลง');
        } else {
            console.warn(`  ⚠ OCR ไม่สำเร็จ (${r.reason}): ${r.detail}`);
        }
    }

    const skeleton = {
        schema: SCHEMA_VERSION,
        kind: 'stimulus',
        title: path.basename(base),
        docType: '(ระบุชนิดเอกสาร)',
        source: {
            sourceFile: src,
            sourcePage: pageNo,
            ...(cropFrac ? { cropPx: { x: cropFrac.left, y: cropFrac.top, w: cropFrac.right - cropFrac.left, h: cropFrac.bottom - cropFrac.top } } : {}),
        },
        defaults: { sizePt: 16, lineHeightPt: 26 },
        notice: { enabled: true, text: 'เอกสารประกอบการเรียน Lawslane Wittaya — จัดพิมพ์ใหม่เพื่อการศึกษา' },
        pages: [{
            margins: { top: 85, right: 70, bottom: 80, left: 85 },
            blocks: [{ id: 'b01', role: 'body', align: 'left', lines: [] }],
        }],
    };
    await writeFile(outJson, JSON.stringify(skeleton, null, 2) + '\n');
    console.log(`✓ ${outJson} — โครงเปล่า เอาข้อความจาก .ocr.txt มาจัดลง blocks/lines เอง`);
}

/** วางภาพต้นฉบับกับที่เรนเดอร์เรียงกัน — เกณฑ์ตรวจหลักของเฟสนี้คือตาคน */
async function cmdCompare(args: string[]) {
    const { values, positionals } = parseArgs({
        args,
        allowPositionals: true,
        options: {
            scan: { type: 'string' },
            out: { type: 'string', short: 'o' },
            dpi: { type: 'string', default: '150' },
        },
    });
    const pdfPath = positionals[0];
    if (!pdfPath || !values.scan) fail('ใช้: compare <out.pdf> --scan <ต้นฉบับ.png> [-o diff.png]');

    const [rendered] = await rasterizePdf(pdfPath, { dpi: Number(values.dpi), maxPages: 1 });
    const scan = new Uint8Array(await readFile(values.scan));
    const out = values.out ?? pdfPath.replace(/\.pdf$/, '.compare.png');
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, await sideBySide(scan, rendered));
    console.log(`✓ ${out}  (ซ้าย = ต้นฉบับ, ขวา = ที่เรนเดอร์)`);
}

/** เรนเดอร์ PDF เป็น PNG เพื่อดูด้วยตา — เกณฑ์หลักของการตรวจในเฟสนี้ */
async function cmdPreview(args: string[]) {
    const { values, positionals } = parseArgs({
        args,
        allowPositionals: true,
        options: { out: { type: 'string', short: 'o' }, dpi: { type: 'string', default: '150' } },
    });
    const pdfPath = positionals[0];
    if (!pdfPath) fail('ใช้: preview <out.pdf> [-o out.png] [--dpi 150]');

    const pages = await rasterizePdf(pdfPath, { dpi: Number(values.dpi) });
    const base = (values.out ?? pdfPath.replace(/\.pdf$/, '')).replace(/\.png$/, '');
    for (const [i, png] of pages.entries()) {
        const name = pages.length === 1 ? `${base}.png` : `${base}-p${String(i + 1).padStart(2, '0')}.png`;
        await mkdir(path.dirname(name), { recursive: true });
        await writeFile(name, png);
        console.log(`✓ ${name}  (${(png.length / 1024).toFixed(0)} KB)`);
    }
}

async function main() {
    loadEnv();
    const [, , cmd, ...rest] = process.argv;
    switch (cmd) {
        case 'build': await cmdBuild(rest); break;
        case 'verify': await cmdVerify(rest); break;
        case 'preview': await cmdPreview(rest); break;
        case 'extract': await cmdExtract(rest); break;
        case 'compare': await cmdCompare(rest); break;
        default:
            console.log('ใช้: legal-doc <extract|build|preview|compare|verify> ...');
            process.exit(cmd ? 1 : 0);
    }
}

main().catch((e) => fail(e instanceof Error ? (e.stack ?? e.message) : String(e)));
