import { access } from 'node:fs/promises';
import path from 'node:path';

/**
 * สกัดข้อความจาก PDF เพื่อตรวจ round-trip
 *
 * ใช้ pdfjs ที่มากับ pdf-to-img จะได้ไม่ต้องเพิ่ม dependency และได้ผลเหมือนกับที่
 * โปรแกรมอ่าน PDF ทั่วไปเห็น — ซึ่งคือสิ่งที่เราอยากพิสูจน์ว่า ToUnicode ไม่พัง
 *
 * resolve ด้วย path ตรงๆ เพราะ pdf-to-img ไม่ได้ export "./package.json"
 * จึงใช้ require.resolve ไล่หา pdfjs ผ่านมันไม่ได้
 */
const PDFJS_CANDIDATES = [
    'node_modules/pdfjs-dist/legacy/build/pdf.mjs',
    'node_modules/pdf-to-img/node_modules/pdfjs-dist/legacy/build/pdf.mjs',
];

async function resolvePdfjs(): Promise<string> {
    for (const rel of PDFJS_CANDIDATES) {
        const abs = path.join(process.cwd(), rel);
        try {
            await access(abs);
            return abs;
        } catch { /* ลองตัวถัดไป */ }
    }
    throw new Error(`หา pdfjs ไม่เจอ ลองแล้วที่: ${PDFJS_CANDIDATES.join(', ')}`);
}

export async function extractPdfText(pdfPath: string): Promise<string> {
    const pdfjs = await import(await resolvePdfjs());
    const { readFile } = await import('node:fs/promises');

    const data = new Uint8Array(await readFile(pdfPath));
    const doc = await pdfjs.getDocument({ data, useSystemFonts: false }).promise;

    const chunks: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        for (const item of content.items) {
            if ('str' in item) chunks.push(item.str);
        }
    }
    await doc.destroy();
    return chunks.join('');
}
