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

    const { bytes, warnings } = await renderLegalDoc(doc, assets);

    const outPath = values.out ?? irPath.replace(/\.json$/, '.pdf');
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, bytes);

    console.log(`✓ ${outPath}  (${(bytes.length / 1024).toFixed(1)} KB, ฟอนต์ ${assets.fontLabel})`);
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
 * ตรวจสองอย่างที่ถ้าพลาดแล้วเอกสารใช้ไม่ได้:
 *  1. ข้อความที่สกัดจาก PDF ต้องตรงกับที่อยู่ใน IR — ถ้าไม่ตรง ToUnicode CMap พัง
 *     ได้ PDF ที่ดูดีแต่ค้นหา/คัดลอกไม่ได้ ซึ่งทำลายเหตุผลของการพิมพ์ใหม่ทั้งหมด
 *  2. ลำดับตัวเลขต้องตรงเป๊ะ — ในข้อสอบตั๋วเงิน จำนวนเงินหรือวันที่ผิดตัวเดียว คำตอบเปลี่ยน
 */
async function verify(pdfPath: string, doc: ReturnType<typeof parseLegalDoc>) {
    const extracted = await extractPdfText(pdfPath);
    const expected = allText(doc).join('');

    const a = normalize(extracted).replace(/\s/g, '');
    const b = normalize(expected).replace(/\s/g, '');

    // notice ท้ายหน้าถูกวาดด้วย จึงอนุญาตให้ข้อความที่สกัดได้ยาวกว่า IR
    const textOk = a.includes(b) || b.includes(a);
    console.log(`  ${textOk ? '✓' : '✗'} round-trip ข้อความ: IR ${b.length} ตัวอักษร, สกัดได้ ${a.length}`);
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

async function main() {
    const [, , cmd, ...rest] = process.argv;
    switch (cmd) {
        case 'build': await cmdBuild(rest); break;
        case 'verify': await cmdVerify(rest); break;
        default:
            console.log('ใช้: legal-doc <build|verify> ...');
            process.exit(cmd ? 1 : 0);
    }
}

main().catch((e) => fail(e instanceof Error ? (e.stack ?? e.message) : String(e)));
