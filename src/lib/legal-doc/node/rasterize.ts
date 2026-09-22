import { pdf } from 'pdf-to-img';

/**
 * แปลงหน้า PDF เป็น PNG
 *
 * ใช้ pdf-to-img ซึ่งเป็น pdfjs + @napi-rs/canvas แบบ prebuilt — ไม่ต้องลง
 * poppler หรือคอมไพล์ native อะไรเลย ทดสอบแล้วว่าทำงานบน Node 24
 *
 * หมายเหตุ: `@napi-rs/canvas` เป็น optionalDependency ของ pdfjs-dist
 * ถ้า CI ติดตั้งด้วย `--omit=optional` จะพังตอน runtime แบบเงียบๆ
 * จึงประกาศเป็น dependency ตรงใน package.json ของโปรเจกต์นี้ด้วย
 */
export async function rasterizePdf(
    pdfPath: string,
    opts: { dpi?: number; maxPages?: number } = {},
): Promise<Uint8Array[]> {
    const dpi = opts.dpi ?? 150;
    const doc = await pdf(pdfPath, { scale: dpi / 72 });

    const out: Uint8Array[] = [];
    for await (const page of doc) {
        out.push(new Uint8Array(page));
        if (opts.maxPages && out.length >= opts.maxPages) break;
    }
    return out;
}
