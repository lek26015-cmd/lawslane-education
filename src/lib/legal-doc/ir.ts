import { z } from 'zod';

/**
 * Document IR — สัญญากลางระหว่าง CLI, renderer และเว็บ
 *
 * เขียนด้วยมือได้เป็นหลัก ไม่ใช่ผลพลอยได้ของ OCR เพราะ "แบบฟอร์มเปล่าไว้ฝึกร่าง"
 * ไม่ได้มาจากการสแกนอะไรเลย
 *
 * ระบบพิกัด: จุด (pt) origin ซ้ายบน y เพิ่มลงล่าง — กลับด้านตอนวาดครั้งเดียวใน draw.ts
 * (pdf-lib ใช้ origin ซ้ายล่าง) อย่าไปกลับที่อื่น ไม่งั้นจะหาบั๊กไม่เจอ
 */
export const SCHEMA_VERSION = 'wittaya.legal-doc/1';

export const Align = z.enum(['left', 'center', 'right', 'justify']);
export type Align = z.infer<typeof Align>;

const Box = z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() });
export type Box = z.infer<typeof Box>;

/**
 * ช่องเว้นให้เติมกลางบรรทัด — หัวใจของแบบฟอร์มเปล่า
 *
 * แบบพิมพ์ราชการมีช่องเติมคั่นกลางข้อความตลอด ("ข้าพเจ้า ..... อายุ ..... ปี")
 * ถ้ารองรับแค่ท้ายบรรทัดจะถอดแบบฟอร์มจริงไม่ได้เลย
 */
const Fill = z.object({
    widthPt: z.number().positive(),
    style: z.enum(['dot', 'rule', 'space']).default('dot'),
});
export type Fill = z.infer<typeof Fill>;

const Run = z.object({
    /** ไม่มี text = เป็นช่องเติม ต้องมี fill */
    text: z.string().default(''),
    fill: Fill.optional(),
    bold: z.boolean().optional(),
    underline: z.boolean().optional(),
    sizePt: z.number().positive().optional(),
}).refine((r) => r.text.length > 0 || r.fill, {
    message: 'run ต้องมี text หรือ fill อย่างน้อยหนึ่งอย่าง',
});
export type Run = z.infer<typeof Run>;

const Leader = z.object({
    style: z.enum(['dot', 'underscore', 'dash']).default('dot'),
    /** ลากจากปลายข้อความไปถึงพิกัด x นี้ (pt จากขอบซ้ายกระดาษ) */
    toXPt: z.number(),
});

const Line = z.object({
    /** คงที่ ใช้อ้างตอนรีวิว/แก้ เช่น 'p1.b03.l02' */
    id: z.string(),
    /** ไม่มี runs = บรรทัดว่าง (ใช้เว้นระยะแบบเดียวกับต้นฉบับ) */
    runs: z.array(Run).optional(),
    align: Align.optional(),
    /** เยื้องเพิ่มจากที่ block กำหนด */
    indentPt: z.number().optional(),
    spaceBeforePt: z.number().optional(),
    leader: Leader.optional(),
    /** ช่องเว้นให้เขียนเอง — ใช้กับแบบฟอร์มเปล่า */
    blank: z.object({ widthPt: z.number(), rule: z.boolean().default(true) }).optional(),
});
export type Line = z.infer<typeof Line>;

export const BlockRole = z.enum([
    'emblem', 'heading', 'subheading', 'meta', 'party', 'body', 'clause',
    'signature', 'attestation', 'stamp-area', 'rule', 'spacer', 'note',
]);
export type BlockRole = z.infer<typeof BlockRole>;

const Block = z.object({
    id: z.string(),
    role: BlockRole,
    /** ระบุเมื่ออยากตรึงตำแหน่ง; ไม่ระบุ = ไหลต่อจากบล็อกก่อนหน้า */
    bbox: Box.partial().optional(),
    align: Align.default('left'),
    indentFirstPt: z.number().default(0),
    indentLeftPt: z.number().default(0),
    indentRightPt: z.number().default(0),
    spaceBeforePt: z.number().default(0),
    sizePt: z.number().positive().optional(),
    lineHeightPt: z.number().positive().optional(),
    /**
     * ย่อขนาดตัวอักษรของบล็อกลงจนบรรทัดที่กว้างที่สุดพอดีคอลัมน์
     *
     * จำเป็นเมื่อถอดเอกสารที่พิมพ์ด้วยฟอนต์ตระกูล Angsana/Cordia ซึ่งแคบกว่า
     * Sarabun มาก ข้อความชุดเดิมจึงไม่ลงคอลัมน์เดิมถ้าใช้ขนาดเท่ากัน
     * การย่อรักษา **การขึ้นบรรทัดของต้นฉบับ** ไว้ได้ ซึ่งสำคัญกว่าขนาดตัวอักษร
     */
    fitToWidth: z.boolean().default(false),
    lines: z.array(Line).default([]),

    emblem: z.object({ heightPt: z.number().positive() }).optional(),
    rule: z.object({
        fromXPt: z.number(),
        toXPt: z.number(),
        thicknessPt: z.number().default(0.75),
        style: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
    }).optional(),
    /** กรอบล้อมบล็อก เช่นกรอบของตั๋วเงิน */
    box: z.object({
        paddingPt: z.number().default(8),
        borderPt: z.number().default(0.75),
    }).optional(),
});
export type Block = z.infer<typeof Block>;

const Page = z.object({
    widthPt: z.number().positive().default(595.28),   // A4
    heightPt: z.number().positive().default(841.89),
    margins: z.object({
        top: z.number().default(72),
        right: z.number().default(56),
        bottom: z.number().default(72),
        left: z.number().default(85),                 // เอกสารไทยเยื้องซ้ายมากกว่าขวา
    }).default({}),
    blocks: z.array(Block).default([]),
});
export type Page = z.infer<typeof Page>;

/** ① เอกสารในโจทย์ ② ธงคำตอบที่ตัวมันเองเป็นเอกสาร ③ แบบฟอร์มเปล่าไว้ฝึกร่าง */
export const DocKind = z.enum(['stimulus', 'model-answer', 'blank-form']);
export type DocKind = z.infer<typeof DocKind>;

export const LegalDoc = z.object({
    schema: z.literal(SCHEMA_VERSION),
    kind: DocKind,
    title: z.string(),
    /** ชนิดเอกสารตามกฎหมาย เช่น 'ตั๋วสัญญาใช้เงิน' | 'พินัยกรรม' | 'คำฟ้อง' */
    docType: z.string(),

    /** ที่มา ไว้ตรวจย้อนกลับไปหน้าต้นฉบับ */
    source: z.object({
        examSetId: z.string().optional(),
        questionId: z.string().optional(),
        sourceFile: z.string().optional(),
        sourcePage: z.number().int().positive().optional(),
        cropPx: Box.optional(),
    }).default({}),

    defaults: z.object({
        sizePt: z.number().positive().default(16),
        lineHeightPt: z.number().positive().default(26),
    }).default({}),

    /**
     * ข้อความกำกับท้ายหน้า + PDF metadata
     * บังคับเปิดเมื่อ kind === 'blank-form' และมี emblem — ดู assertNoticePolicy()
     */
    notice: z.object({
        enabled: z.boolean().default(true),
        text: z.string().default('เอกสารประกอบการเรียน Lawslane Wittaya — จัดพิมพ์ใหม่เพื่อการศึกษา'),
    }).default({}),

    pages: z.array(Page).min(1),
});
export type LegalDoc = z.infer<typeof LegalDoc>;

export function parseLegalDoc(input: unknown): LegalDoc {
    return LegalDoc.parse(input);
}

/** true ถ้าเอกสารนี้มีตราครุฑอยู่หน้าใดหน้าหนึ่ง */
export function hasEmblem(doc: LegalDoc): boolean {
    return doc.pages.some((p) => p.blocks.some((b) => b.role === 'emblem'));
}

/**
 * แบบฟอร์มเปล่าที่มีตราครุฑจะหน้าตาเหมือนแบบพิมพ์ของทางราชการจริง
 * จึงบังคับให้ต้องมีข้อความกำกับเสมอ ปิดไม่ได้
 */
export function assertNoticePolicy(doc: LegalDoc): void {
    if (doc.kind === 'blank-form' && hasEmblem(doc) && !doc.notice.enabled) {
        throw new Error(
            'ปิด notice ไม่ได้: แบบฟอร์มเปล่าที่มีตราครุฑต้องมีข้อความกำกับว่าไม่ใช่แบบพิมพ์ของทางราชการ',
        );
    }
}

/** ข้อความทั้งหมดในเอกสาร เรียงตามลำดับการอ่าน — ใช้ตรวจ round-trip และตรวจตัวเลข */
export function allText(doc: LegalDoc): string[] {
    const out: string[] = [];
    for (const page of doc.pages) {
        for (const block of page.blocks) {
            for (const line of block.lines) {
                const t = (line.runs ?? []).map((r) => r.text).join('');
                if (t) out.push(t);
            }
        }
    }
    return out;
}
