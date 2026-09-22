import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { AssetBundle } from '../render/fonts';

/**
 * โหลดฟอนต์และตราครุฑจากดิสก์
 *
 * นี่คือไฟล์เดียวในสายการเรนเดอร์ที่แตะ filesystem — ตั้งใจให้เป็นแบบนั้น
 * เวลายกขึ้นเว็บ ให้เขียนตัวโหลดจาก R2 มาแทน แล้วส่ง AssetBundle หน้าตาเดิม
 * โดยไม่ต้องแก้ render/ เลย
 */

const DEFAULT_FONT_DIR = path.join(process.cwd(), 'src/assets/fonts');
const DEFAULT_EMBLEM_DIR = path.join(process.cwd(), 'src/assets/emblems');

export interface LoadAssetsOptions {
    /** ทับด้วย --font-dir; ไม่ระบุก็ดู env LEGALDOC_FONT_DIR ต่อ แล้วค่อยใช้ Sarabun ในโปรเจกต์ */
    fontDir?: string;
    withGaruda?: boolean;
}

async function tryRead(file: string): Promise<Uint8Array | undefined> {
    try {
        return new Uint8Array(await readFile(file));
    } catch {
        return undefined;
    }
}

export async function loadAssets(opts: LoadAssetsOptions = {}): Promise<AssetBundle> {
    const dirs = [opts.fontDir, process.env.LEGALDOC_FONT_DIR, DEFAULT_FONT_DIR].filter(Boolean) as string[];

    for (const dir of dirs) {
        // รองรับทั้ง TH Sarabun New (ถ้าผู้ใช้วางไว้เอง ไม่ commit ลง repo สาธารณะ)
        // และ Sarabun ของ Google ที่มากับโปรเจกต์
        for (const [regularName, boldName, label] of [
            ['THSarabunNew.ttf', 'THSarabunNew Bold.ttf', 'TH Sarabun New'],
            ['Sarabun-Regular.ttf', 'Sarabun-Bold.ttf', 'Sarabun'],
        ] as const) {
            const regular = await tryRead(path.join(dir, regularName));
            const bold = await tryRead(path.join(dir, boldName));
            if (regular && bold) {
                const garudaPdf = opts.withGaruda
                    ? await tryRead(path.join(DEFAULT_EMBLEM_DIR, 'garuda.pdf'))
                    : undefined;
                return { regular, bold, garudaPdf, fontLabel: label };
            }
        }
    }

    throw new Error(
        `หาไฟล์ฟอนต์ไม่เจอในไดเรกทอรี: ${dirs.join(', ')} ` +
        `(ต้องมี Sarabun-Regular.ttf + Sarabun-Bold.ttf หรือ THSarabunNew*.ttf)`,
    );
}
