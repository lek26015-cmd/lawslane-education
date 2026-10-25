import { z } from 'zod';

/**
 * ธงคำตอบที่ตัวมันเองเป็นแบบพิมพ์ศาล (คำฟ้อง คำร้อง ใบแต่งทนายความ บัญชีพยาน ฯลฯ)
 * เก็บใน `examSets/{id}/questions/{qid}.legalForm` แล้วเรนเดอร์เป็นหน้า A4 ด้วย
 * `components/education/court-form-document.tsx`
 *
 * ข้อความที่เติมลงแบบฟอร์มทุกชิ้นต้องมาจาก `modelAnswer` ของข้อนั้นตรงตัว (ตรวจด้วย
 * `findUnverifiedStrings`) — ข้อสอบห้ามแต่งเนื้อหาเพิ่ม ส่วนข้อความที่พิมพ์มากับแบบ
 * (คดีหมายเลขดำที่ ศาล วันที่ ความ ระหว่าง) อยู่ในตัวเรนเดอร์ ไม่ใช่ข้อมูล
 *
 * จัดโครงทีละข้อโดยเทียบกับภาพธงคำตอบ (answerPageImages) — ลำดับบล็อก, ตัวแบ่งหน้า,
 * ส่วนที่ขีดฆ่าในหัวแบบ ต้องตรงภาพ
 */
export const COURT_FORM_SCHEMA = 'wittaya.court-form/1';

const Party = z.object({
    /** ชื่อคู่ความตามที่กรอกในช่อง "ระหว่าง" */
    name: z.string(),
    /** คำท้ายบรรทัด เช่น โจทก์ จำเลย ผู้ร้อง */
    role: z.string(),
});

const Header = z.object({
    blackCase: z.string().optional(),
    redCase: z.string().optional(),
    court: z.string().optional(),
    day: z.string().optional(),
    month: z.string().optional(),
    year: z.string().optional(),
    matter: z.string().optional(),
});

const Align = z.enum(['left', 'center', 'right']);

/** คำในข้อความที่ขีดฆ่าในภาพ เช่น ['คำแถลง', 'คำขอ'] ใน "ขอยื่นคำร้อง/คำแถลง/คำขอ" */
const Struck = z.array(z.string()).optional();

/**
 * ข้อความที่พิมพ์มากับแบบพิมพ์ศาลเอง (ไม่ใช่สิ่งที่ผู้สอบเขียน) — ธงคำตอบมักไม่ได้ถอดไว้ตรงตัว
 * เพราะผู้ถอดเขียนหมายเหตุการขีดฆ่าแทรก เช่น "คำร้อง (ขีดฆ่า คำแถลง/คำขอ)"
 * จึงยกเว้นจากการตรวจเทียบ modelAnswer เหมือนคำว่า "คดีหมายเลขดำที่" ในหัวแบบ
 */
export const PRINTED_FORM_TEXT = [
    'คำร้อง/คำแถลง/คำขอ',
    'ผู้ร้อง/ผู้แถลง/ผู้ขอ',
    'มีข้อความตามที่จะกล่าวต่อไปนี้',
];

export const CourtFormBlock = z.discriminatedUnion('t', [
    /** ข้อความที่เขียนบนบรรทัดเส้นประของแบบฟอร์ม ตัดบรรทัดเองตามความกว้างหน้า */
    z.object({ t: z.literal('ruled'), text: z.string(), indent: z.boolean().optional(), struck: Struck }),
    /** ข้อความที่ไม่มีเส้นรอง เช่น "มีข้อความตามที่จะกล่าวต่อไปนี้" "ควรมิควรแล้วแต่จะโปรด" "(พลิก)" */
    z.object({
        t: z.literal('text'), text: z.string(), align: Align.optional(),
        indent: z.boolean().optional(), bold: z.boolean().optional(), struck: Struck,
    }),
    /** หัวข้อกลางหน้า เช่น คำรับเป็นทนายความ, คำขอท้ายคำฟ้องแพ่ง, คำสั่ง */
    z.object({ t: z.literal('heading'), text: z.string(), underline: z.boolean().optional() }),
    /** บรรทัดลงชื่อชิดขวา: [prefix] ....name.... role */
    z.object({ t: z.literal('sign'), prefix: z.string().optional(), name: z.string().optional(), role: z.string(), struck: Struck }),
    /** หมายเหตุท้ายแบบ (มีเส้นทึบคั่นด้านบนตามแบบพิมพ์) */
    z.object({ t: z.literal('note'), label: z.string().optional(), text: z.string() }),
    z.object({ t: z.literal('table'), columns: z.array(z.string()), rows: z.array(z.array(z.string())) }),
    /** บรรทัดเส้นประเปล่า */
    z.object({ t: z.literal('blank'), lines: z.number().int().min(1).max(20) }),
    z.object({ t: z.literal('rule') }),
    /** ขึ้นหน้าใหม่ตามภาพต้นฉบับ */
    z.object({ t: z.literal('pageBreak') }),
]);
export type CourtFormBlock = z.infer<typeof CourtFormBlock>;

export const CourtFormDoc = z.object({
    /** เลขแบบพิมพ์ในวงเล็บมุมซ้ายบน เช่น '๔' '๗' '๑๕ ก.' — ไม่มีในภาพก็เว้นไว้ */
    formNo: z.string().optional(),
    /** ชื่อแบบพิมพ์ เช่น 'คำฟ้อง' หรือ 'คำร้อง/คำแถลง/คำขอ' */
    title: z.string(),
    /** ส่วนของ title ที่ขีดฆ่าในภาพ เช่น ['คำแถลง', 'คำขอ'] */
    struck: z.array(z.string()).optional(),
    /** ข้อความที่เขียนใต้ชื่อแบบ เช่น 'สละสิทธิไม่บังคับคดี' หรือ 'โจทก์' ต่อจาก บัญชีพยาน */
    subtitle: z.string().optional(),
    /** ตราครุฑ — แบบพิมพ์ศาลมีทุกแบบ ตั้ง false เฉพาะเอกสารที่ภาพไม่มี (เช่น หน้าต่อของคำฟ้อง) */
    emblem: z.boolean().default(true),
    header: Header.optional(),
    parties: z.array(Party).optional(),
    blocks: z.array(CourtFormBlock),
});
export type CourtFormDoc = z.infer<typeof CourtFormDoc>;

export const CourtForm = z.object({
    schema: z.literal(COURT_FORM_SCHEMA),
    docs: z.array(CourtFormDoc).min(1),
});
export type CourtForm = z.infer<typeof CourtForm>;

/** คืน undefined เมื่อข้อมูลเสีย เพื่อให้หน้าเว็บถอยกลับไปแสดงข้อความ+ภาพแบบเดิม */
export function parseCourtForm(input: unknown): CourtForm | undefined {
    const r = CourtForm.safeParse(input);
    return r.success ? r.data : undefined;
}

/** ทุกข้อความที่ "เติม" ลงแบบฟอร์ม — ใช้ตรวจว่ามาจากธงคำตอบจริง */
export function courtFormStrings(form: CourtForm): string[] {
    const out: string[] = [];
    const push = (s?: string) => { if (s && s.trim()) out.push(s); };
    for (const d of form.docs) {
        push(d.formNo); push(d.title); push(d.subtitle);
        d.struck?.forEach(push);
        if (d.header) Object.values(d.header).forEach(push);
        d.parties?.forEach(p => { push(p.name); push(p.role); });
        for (const b of d.blocks) {
            switch (b.t) {
                case 'ruled': case 'text': case 'heading': push(b.text); break;
                case 'sign': push(b.prefix); push(b.name); push(b.role); break;
                case 'note': push(b.label); push(b.text); break;
                case 'table': b.columns.forEach(push); b.rows.flat().forEach(push); break;
            }
            if ('struck' in b) b.struck?.forEach(push);
        }
    }
    return out;
}

/** ไม่สนช่องว่างและเส้นใต้/จุดไข่ปลาที่ OCR ใส่แทนช่องว่างในแบบฟอร์ม */
function squash(s: string): string {
    return s.normalize('NFC').replace(/[\s_…]+|\.{2,}/g, '');
}

/**
 * ข้อความในแบบฟอร์มที่หาไม่เจอใน modelAnswer — ต้องว่างก่อนเขียนลง Firestore
 * ตัวเลขต้องตรงทั้งรูป (ไทย/อารบิก) เพราะในข้อสอบเลขผิดตัวเดียวคำตอบเปลี่ยน
 */
export function findUnverifiedStrings(form: CourtForm, modelAnswer: string): string[] {
    const hay = squash(modelAnswer);
    const printed = PRINTED_FORM_TEXT.map(squash);
    return courtFormStrings(form).filter(s => {
        // ตัดข้อความพิมพ์ของแบบออกก่อน ส่วนที่เหลือ (ข้อความที่เขียนเติม) ต้องอยู่ในธงคำตอบ
        let rest = squash(s);
        for (const p of printed) rest = rest.split(p).join('');
        return rest !== '' && !hay.includes(rest) && !printed.some(p => p.includes(rest));
    });
}
