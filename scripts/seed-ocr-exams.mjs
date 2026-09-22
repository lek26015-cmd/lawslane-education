#!/usr/bin/env node
/**
 * นำผล OCR ข้อสอบเก่าเข้า Firestore
 *
 * เดิมงานนี้เป็น API route (`/api/education/seed-ocr-exams`) ซึ่ง "ใช้ไม่ได้บน
 * production" เพราะมันอ่าน `ข้อสอบเก่า/ocr_cleaned.json` จาก process.cwd() แต่
 * โฟลเดอร์นั้นอยู่ใน .gitignore ไฟล์จึงไม่เคยถูก deploy ขึ้น Vercel เลย —
 * route คืน 404 เสมอ ส่วนคนที่รันได้จริงมีแค่เครื่อง dev ที่มีไฟล์อยู่
 *
 * งานที่อ่านไฟล์จากเครื่องแบบนี้ควรเป็น script ไม่ใช่ API ที่เปิดรับ request
 * จากอินเทอร์เน็ต (ดูแผนรวมหลังบ้าน Module 5)
 *
 * ใช้งาน:
 *   node scripts/seed-ocr-exams.mjs                 # dry-run ทั้งไฟล์ (ค่าเริ่มต้น)
 *   node scripts/seed-ocr-exams.mjs --apply         # เขียนจริง
 *   node scripts/seed-ocr-exams.mjs --update           # dry-run แบบเขียนทับของเดิม
 *   node scripts/seed-ocr-exams.mjs --update --apply    # เขียนทับจริง
 *   node scripts/seed-ocr-exams.mjs --start 0 --batch 20 --apply
 *
 * --update ใช้เมื่อรัน OCR ใหม่แล้วต้องการให้ข้อสอบใน Firestore ใช้ผลชุดใหม่
 * (ค่าเริ่มต้นจะข้ามชุดที่มีอยู่แล้ว ซึ่งตอนนี้มีครบทุกชุด จึงจะไม่เขียนอะไรเลย)
 * คง document id เดิมไว้เสมอ เพราะคอร์สอ้างถึงชุดข้อสอบผ่าน linkedExamIds
 *
 * ต้องมี env: NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL,
 * FIREBASE_PRIVATE_KEY (โหลดจาก .env.local ให้อัตโนมัติ)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OCR_JSON_PATH = path.join(ROOT, 'ข้อสอบเก่า', 'ocr_cleaned.json');

function loadEnvLocal() {
    const envPath = path.join(ROOT, '.env.local');
    if (!fs.existsSync(envPath)) return;
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
        if (!m) continue;
        let [, key, value] = m;
        value = value.trim().replace(/^["']|["']$/g, '');
        if (!(key in process.env)) process.env[key] = value;
    }
}

function parseArgs(argv) {
    const args = { apply: false, update: false, start: 0, batch: Infinity };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--apply') args.apply = true;
        else if (argv[i] === '--update') args.update = true;
        else if (argv[i] === '--start') args.start = parseInt(argv[++i], 10);
        else if (argv[i] === '--batch') args.batch = parseInt(argv[++i], 10);
    }
    return args;
}

async function main() {
    loadEnvLocal();
    const args = parseArgs(process.argv.slice(2));

    if (!fs.existsSync(OCR_JSON_PATH)) {
        console.error(`❌ ไม่พบ ${OCR_JSON_PATH}`);
        console.error('   รัน ocr_pipeline.py แล้วตามด้วย clean_and_prepare.py ก่อน');
        process.exit(1);
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        console.error('❌ ไม่มี credential ของ Firebase Admin ใน environment');
        console.error('   ต้องมี NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
        process.exit(1);
    }

    const examData = JSON.parse(fs.readFileSync(OCR_JSON_PATH, 'utf-8'));
    const start = Math.max(0, args.start);
    const end = Math.min(start + args.batch, examData.length);

    console.log(`📖 ${OCR_JSON_PATH}`);
    console.log(`   ชุดข้อสอบในไฟล์: ${examData.length} · จะทำ index ${start}–${end - 1}`);
    console.log(`   โหมด: ${args.apply ? '⚠️  APPLY (เขียน Firestore จริง)' : 'DRY-RUN (ไม่เขียนอะไร)'}`);
    console.log(`   ชุดที่มีอยู่แล้ว: ${args.update ? '♻️  เขียนทับคำถามด้วยผล OCR ใหม่' : 'ข้าม'}`);
    console.log(`   โปรเจ็ค: ${projectId}\n`);

    admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        projectId,
    });
    const db = admin.firestore();

    let created = 0, skipped = 0, updated = 0, totalQuestions = 0;

    for (let i = start; i < end; i++) {
        const exam = examData[i];
        const title = exam.examSet?.title ?? '(ไม่มีชื่อ)';
        const questions = exam.questions || [];

        const existing = await db.collection('examSets').where('title', '==', title).limit(1).get();

        if (!existing.empty && !args.update) {
            console.log(`   [${i}] ข้าม — มีอยู่แล้ว: ${title}`);
            skipped++;
            continue;
        }

        // เขียนทับชุดที่มีอยู่: คง document id เดิมไว้ เพราะคอร์สอ้างถึงผ่าน
        // linkedExamIds ถ้าสร้างใหม่ลิงก์จะขาด — แทนที่เฉพาะ subcollection questions
        if (!existing.empty && args.update) {
            const ref = existing.docs[0].ref;
            if (!args.apply) {
                const old = await ref.collection('questions').count().get();
                console.log(`   [${i}] จะเขียนทับ: ${title} (${old.data().count} → ${questions.length} ข้อ)`);
                updated++;
                totalQuestions += questions.length;
                continue;
            }

            const now = admin.firestore.FieldValue.serverTimestamp();
            const oldQs = await ref.collection('questions').get();
            let delBatch = db.batch();
            let delN = 0;
            for (const d of oldQs.docs) {
                delBatch.delete(d.ref);
                if (++delN >= 450) { await delBatch.commit(); delBatch = db.batch(); delN = 0; }
            }
            if (delN > 0) await delBatch.commit();

            await ref.set({ ...exam.examSet, updatedAt: now }, { merge: true });

            let batch = db.batch();
            let n = 0;
            for (const q of questions) {
                batch.set(ref.collection('questions').doc(), { ...q, createdAt: now, updatedAt: now });
                if (++n >= 450) { await batch.commit(); batch = db.batch(); n = 0; }
            }
            if (n > 0) await batch.commit();

            console.log(`   [${i}] ♻️  เขียนทับแล้ว: ${title} (${oldQs.size} → ${questions.length} ข้อ)`);
            updated++;
            totalQuestions += questions.length;
            continue;
        }

        if (!args.apply) {
            console.log(`   [${i}] จะสร้าง: ${title} (${questions.length} ข้อ)`);
            created++;
            totalQuestions += questions.length;
            continue;
        }

        const now = admin.firestore.FieldValue.serverTimestamp();
        const examRef = await db.collection('examSets').add({ ...exam.examSet, createdAt: now, updatedAt: now });

        let batch = db.batch();
        let n = 0;
        for (const question of questions) {
            batch.set(examRef.collection('questions').doc(), { ...question, createdAt: now, updatedAt: now });
            if (++n >= 450) {
                await batch.commit();
                batch = db.batch();
                n = 0;
            }
        }
        if (n > 0) await batch.commit();

        console.log(`   [${i}] ✓ สร้างแล้ว: ${title} (${questions.length} ข้อ) → ${examRef.id}`);
        created++;
        totalQuestions += questions.length;
    }

    console.log(`\n${args.apply ? '✅ เขียนเสร็จ' : '📝 สรุป dry-run'}`);
    console.log(`   สร้าง ${created} ชุด · เขียนทับ ${updated} ชุด · ข้าม ${skipped} ชุด · รวม ${totalQuestions} ข้อ`);
    if (!args.apply) console.log('\n   ใส่ --apply เพื่อเขียนจริง');
    if (!args.update) console.log('   ใส่ --update ถ้าต้องการเขียนทับชุดที่มีอยู่แล้วด้วยผล OCR ใหม่');
    if (end < examData.length) console.log(`   ทำต่อด้วย: --start ${end}`);

    await admin.app().delete();
}

main().catch(err => {
    console.error('❌ ล้มเหลว:', err);
    process.exit(1);
});
