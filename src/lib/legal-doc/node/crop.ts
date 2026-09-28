import sharp from 'sharp';

/** กรอบครอปเป็นสัดส่วน 0–1 ของหน้า เพื่อไม่ต้องรู้ DPI ตอนสั่ง */
export interface CropFraction {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

/** แปลง "0.1,0.28,0.9,0.62" เป็น CropFraction */
export function parseCrop(spec: string): CropFraction {
    const parts = spec.split(',').map((s) => Number(s.trim()));
    if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n) || n < 0 || n > 1)) {
        throw new Error(`--crop ต้องเป็นสัดส่วน 0–1 สี่ค่า เช่น 0.1,0.28,0.9,0.62 (ได้: ${spec})`);
    }
    const [left, top, right, bottom] = parts;
    if (right <= left || bottom <= top) throw new Error(`--crop: right/bottom ต้องมากกว่า left/top (ได้: ${spec})`);
    return { left, top, right, bottom };
}

export async function cropImage(png: Uint8Array, frac: CropFraction): Promise<Uint8Array> {
    const img = sharp(Buffer.from(png));
    const { width, height } = await img.metadata();
    if (!width || !height) throw new Error('อ่านขนาดภาพไม่ได้');

    const left = Math.round(frac.left * width);
    const top = Math.round(frac.top * height);
    return new Uint8Array(
        await img
            .extract({
                left,
                top,
                width: Math.max(1, Math.round(frac.right * width) - left),
                height: Math.max(1, Math.round(frac.bottom * height) - top),
            })
            .png()
            .toBuffer(),
    );
}

/**
 * วางภาพสองภาพเรียงกันในแนวนอนเพื่อเทียบด้วยตา (ซ้าย = ต้นฉบับ, ขวา = ที่เรนเดอร์)
 *
 * นี่คือเกณฑ์ตรวจหลักของเฟสนี้ — ฟอนต์คนละตัวกับต้นฉบับอยู่แล้ว ตัวเลข pixel diff
 * จึงไม่มีความหมายเชิงสัมบูรณ์ ต้องใช้ตาคนดู
 */
export async function sideBySide(left: Uint8Array, right: Uint8Array, gapPx = 24): Promise<Uint8Array> {
    const [a, b] = [sharp(Buffer.from(left)), sharp(Buffer.from(right))];
    const [ma, mb] = await Promise.all([a.metadata(), b.metadata()]);
    if (!ma.width || !ma.height || !mb.width || !mb.height) throw new Error('อ่านขนาดภาพไม่ได้');

    // ปรับให้สูงเท่ากันก่อน ไม่งั้นเทียบสัดส่วนด้วยตาไม่ได้
    const h = Math.max(ma.height, mb.height);
    const [ra, rb] = await Promise.all([
        a.resize({ height: h, fit: 'contain', background: '#fff' }).png().toBuffer(),
        b.resize({ height: h, fit: 'contain', background: '#fff' }).png().toBuffer(),
    ]);
    const [wa, wb] = [Math.round((ma.width / ma.height) * h), Math.round((mb.width / mb.height) * h)];

    return new Uint8Array(
        await sharp({
            create: { width: wa + gapPx + wb, height: h, channels: 3, background: '#d8d8d8' },
        })
            .composite([
                { input: ra, left: 0, top: 0 },
                { input: rb, left: wa + gapPx, top: 0 },
            ])
            .png()
            .toBuffer(),
    );
}
