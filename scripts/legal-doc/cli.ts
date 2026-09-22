#!/usr/bin/env -S npx tsx
/**
 * legal-doc CLI — สร้าง PDF เอกสารรูปแบบจริงสำหรับข้อสอบ
 *
 *   npm run legal-doc -- build docs/legal-doc/xxx.json -o out/xxx.pdf
 *   npm run legal-doc -- verify out/xxx.pdf --ir docs/legal-doc/xxx.json
 */
import { parseArgs } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseLegalDoc, allText } from '../../src/lib/legal-doc/ir';
import { renderLegalDoc } from '../../src/lib/legal-doc/render/render-pdf';
import { loadAssets } from '../../src/lib/legal-doc/node/assets';
import { extractPdfText } from '../../src/lib/legal-doc/node/pdf-text';
import { rasterizePdf } from '../../src/lib/legal-doc/node/rasterize';
import { normalize, extractNumerals } from '../../src/lib/legal-doc/thai';

function fail(msg: string): never {
    console.error(`✗ ${msg}`);
    process.exit(1);
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
    const [, , cmd, ...rest] = process.argv;
    switch (cmd) {
        case 'build': await cmdBuild(rest); break;
        case 'verify': await cmdVerify(rest); break;
        case 'preview': await cmdPreview(rest); break;
        default:
            console.log('ใช้: legal-doc <build|verify|preview> ...');
            process.exit(cmd ? 1 : 0);
    }
}

main().catch((e) => fail(e instanceof Error ? (e.stack ?? e.message) : String(e)));
