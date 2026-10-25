#!/usr/bin/env -S npx tsx
/**
 * court-form — ใส่ `legalForm` ให้ข้อสอบที่ธงคำตอบเป็นแบบพิมพ์ศาล (ดู src/lib/court-form.ts)
 *
 *   npm run court-form -- pull              # อ่านอย่างเดียว: ดึงข้อที่เข้าเกณฑ์ → out/court-forms/source.json
 *   npm run court-form -- check             # ตรวจไฟล์ out/court-forms/forms/<qid>.json ทุกไฟล์
 *   npm run court-form -- apply             # dry-run: บอกว่าจะเขียนข้อไหนบ้าง
 *   npm run court-form -- apply --apply     # เขียน legalForm ลง Firestore จริง (production)
 *   npm run court-form -- apply --apply --only <qid>[,<qid>]
 *
 * เกณฑ์: ชุดที่นำเข้าจากสภาฯ (importSource council-ocr-2026-10), requiresForm และธงคำตอบ
 * มี "คดีหมายเลขดำ" (คือเขียนบนแบบพิมพ์ศาลจริง ส่วนหนังสือบอกกล่าว/สัญญาไม่ทำ)
 *
 * out/ อยู่ใน .gitignore — ตัวข้อสอบเป็นฉบับร่าง ห้ามขึ้น repo สาธารณะ
 * apply จะไม่เขียนข้อที่ modelAnswer ใน Firestore เปลี่ยนไปจากตอน pull หรือมีข้อความที่หาไม่เจอในธงคำตอบ
 */
import { parseArgs } from 'node:util';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import admin from 'firebase-admin';
import { CourtForm, findUnverifiedStrings } from '../../src/lib/court-form';

const OUT = 'out/court-forms';
const SOURCE = path.join(OUT, 'source.json');
const FORMS = path.join(OUT, 'forms');
const IMPORT_SOURCE = 'council-ocr-2026-10';

export interface SourceQuestion {
    setId: string;
    setTitle: string;
    setStatus: string;
    qid: string;
    order: number;
    formType: string;
    modelAnswer: string;
    modelAnswerSha: string;
    images: { page: number; url: string }[];
}

function fail(msg: string): never {
    console.error(`✗ ${msg}`);
    process.exit(1);
}

function sha(s: string) {
    return createHash('sha256').update(s).digest('hex').slice(0, 16);
}

function db() {
    for (const f of ['.env.local', '.env']) {
        if (existsSync(f)) { try { process.loadEnvFile(f); } catch { /* ข้าม */ } }
    }
    const { NEXT_PUBLIC_FIREBASE_PROJECT_ID: projectId, FIREBASE_CLIENT_EMAIL: clientEmail, FIREBASE_PRIVATE_KEY: key } = process.env;
    if (!projectId || !clientEmail || !key) fail('ต้องมี NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY ใน .env.local');
    if (!admin.apps.length) {
        admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey: key.replace(/\\n/g, '\n') }) });
    }
    return admin.firestore();
}

async function cmdPull() {
    const sets = await db().collection('examSets').where('importSource', '==', IMPORT_SOURCE).get();
    const out: SourceQuestion[] = [];
    for (const s of sets.docs) {
        const qs = await s.ref.collection('questions').get();
        for (const q of qs.docs) {
            const x = q.data();
            const ma: string = x.modelAnswer || '';
            if (!x.requiresForm || !/คดีหมายเลขดำ/.test(ma)) continue;
            out.push({
                setId: s.id, setTitle: s.data().title, setStatus: s.data().status,
                qid: q.id, order: x.orderIndex, formType: x.formType || '',
                modelAnswer: ma, modelAnswerSha: sha(ma),
                images: (x.answerPageImages || []).map((i: { page: number; url: string }) => ({ page: i.page, url: i.url })),
            });
        }
    }
    out.sort((a, b) => a.setTitle.localeCompare(b.setTitle, 'th') || a.order - b.order);
    await mkdir(FORMS, { recursive: true });
    await writeFile(SOURCE, JSON.stringify(out, null, 1));
    console.log(`✓ ${SOURCE}  ${out.length} ข้อ จาก ${sets.size} ชุด`);
}

async function loadSource(): Promise<SourceQuestion[]> {
    if (!existsSync(SOURCE)) fail(`ยังไม่มี ${SOURCE} — รัน pull ก่อน`);
    return JSON.parse(await readFile(SOURCE, 'utf8'));
}

interface Checked { q: SourceQuestion; form?: CourtForm; problems: string[] }

async function checkAll(): Promise<Checked[]> {
    const source = await loadSource();
    const files = existsSync(FORMS) ? new Set(await readdir(FORMS)) : new Set<string>();
    const res: Checked[] = [];
    for (const q of source) {
        const file = `${q.qid}.json`;
        if (!files.has(file)) { res.push({ q, problems: ['ยังไม่มีไฟล์'] }); continue; }
        const raw = JSON.parse(await readFile(path.join(FORMS, file), 'utf8'));
        // _hold: เหตุผลที่ยังไม่ควรเขียน (เช่น ธงคำตอบในระบบขาดหน้า) — ตรวจ schema ได้แต่ apply จะข้าม
        if (typeof raw._hold === 'string') { res.push({ q, problems: [`hold: ${raw._hold}`] }); continue; }
        const parsed = CourtForm.safeParse(raw);
        if (!parsed.success) {
            res.push({ q, problems: parsed.error.issues.map(i => `schema: ${i.path.join('.')} ${i.message}`) });
            continue;
        }
        const missing = findUnverifiedStrings(parsed.data, q.modelAnswer);
        res.push({ q, form: parsed.data, problems: missing.map(m => `ไม่พบในธงคำตอบ: "${m.slice(0, 80)}"`) });
    }
    return res;
}

function label(q: SourceQuestion) {
    return `${q.setTitle.replace('ข้อสอบอัตนัย การฝึกอบรมวิชาว่าความ ', '')} ข้อ ${q.order} (${q.qid})`;
}

async function cmdCheck() {
    const res = await checkAll();
    let ok = 0;
    for (const r of res) {
        if (!r.problems.length) { ok++; continue; }
        console.log(`✗ ${label(r.q)}`);
        for (const p of r.problems) console.log(`    ${p}`);
    }
    console.log(`\n${ok}/${res.length} ข้อผ่าน`);
}

async function cmdApply(args: string[]) {
    const { values } = parseArgs({ args, options: { apply: { type: 'boolean', default: false }, only: { type: 'string' } } });
    const only = values.only ? new Set(values.only.split(',')) : undefined;
    const res = (await checkAll()).filter(r => !only || only.has(r.q.qid));
    const ready = res.filter(r => r.form && !r.problems.length);
    const firestore = db();
    let written = 0;
    for (const r of ready) {
        const ref = firestore.collection('examSets').doc(r.q.setId).collection('questions').doc(r.q.qid);
        const now = await ref.get();
        if (sha(now.data()?.modelAnswer || '') !== r.q.modelAnswerSha) {
            console.log(`⚠ ข้าม ${label(r.q)} — modelAnswer เปลี่ยนหลัง pull ให้ pull แล้วตรวจใหม่`);
            continue;
        }
        if (values.apply) {
            await ref.update({ legalForm: r.form, legalFormUpdatedAt: admin.firestore.FieldValue.serverTimestamp() });
            written++;
            console.log(`✓ เขียน ${label(r.q)}`);
        } else {
            console.log(`· จะเขียน ${label(r.q)}  (${r.form!.docs.length} เอกสาร)`);
        }
    }
    const skipped = res.length - ready.length;
    console.log(values.apply
        ? `\nเขียนแล้ว ${written} ข้อ · ไม่ผ่านการตรวจ ${skipped} ข้อ`
        : `\ndry-run: พร้อมเขียน ${ready.length} ข้อ · ไม่ผ่านการตรวจ ${skipped} ข้อ — เพิ่ม --apply เพื่อเขียนจริง`);
}

async function main() {
    const [cmd, ...rest] = process.argv.slice(2);
    switch (cmd) {
        case 'pull': await cmdPull(); break;
        case 'check': await cmdCheck(); break;
        case 'apply': await cmdApply(rest); break;
        default: fail('ใช้: pull | check | apply [--apply] [--only qid,...]');
    }
    process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
