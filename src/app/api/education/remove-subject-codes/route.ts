import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

/**
 * Clean course/subject codes from all exam titles and descriptions.
 * Keeps only the clean subject name in title, moves term/session to session field if needed.
 */

export function cleanExamTitleAndSession(title: string, currentSession: string, subjectGroup: string): { title: string; session: string } {
    let t = (title || '').trim();
    let s = (currentSession || '').trim();

    // 1. Remove non-breaking spaces and zero-width chars
    t = t.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ');

    // 2. Iteratively strip leading course codes:
    // Handles: 'LAW4106 (LAW4006)', 'LAW 4007', 'LW3005', '(LW 402)', 'LAW304', 'LAW4008 (LA 408),(LW 402)'
    while (true) {
        const prev = t;
        t = t.replace(/^[,\s\(\.\-]+/, '');
        t = t.replace(/^\(?(?:LAW|LW|LA)\s*\d{3,4}\)?(?:\s*\([A-Z0-9\s,]+\))?\s*/i, '');
        t = t.replace(/^\([A-Z0-9\s,]+\)\s*/, '');
        if (t === prev) break;
    }

    // 3. Strip trailing course codes after dash:
    // e.g., 'เอกเทศสัญญา2 — 77721555', 'นิติปรัชญา — 4686', 'กม.มรดก — 777410256'
    t = t.replace(/\s*—\s*\d+\s*$/, '');

    // 4. Strip duplicate title after dash:
    // e.g., 'นิติปรัชญา — นิติปรัชญา', 'นิติกรรมและสัญญา — นิติกรรมและสัญญา', 'บริหารงานยุติธรรม — บริหารงานยุติฯ'
    t = t.replace(/\s*—\s*(?:นิติปรัชญา|นิติกรรมและสัญญา|บริหารงานยุติ.*)$/, '');

    // 5. Strip trailing academic year after dash:
    // e.g., 'เอกเทศสัญญา2 — ปีการศึกษา 2557' -> title: 'เอกเทศสัญญา 2', session: 'ปีการศึกษา 2557'
    const dashYearMatch = t.match(/\s*—\s*(ปีการศึกษา\s*\d+)\s*$/);
    if (dashYearMatch) {
        if (!s || s === 'ไม่ระบุ' || s === 'ข้อสอบเก่า') {
            s = dashYearMatch[1];
        }
        t = t.substring(0, dashYearMatch.index).trim();
    }

    // 6. Strip trailing semester/term from old exam titles:
    // e.g., 's/2567', '1/2567', 'S-2557', '2/2560', 'S/2559'
    const sessMatch = t.match(/\s+([sS1234][/-]\d{2,4}(?:-[sS1234][/-]\d{2,4})?)$/);
    if (sessMatch) {
        if (!s || s === 'ไม่ระบุ') {
            s = sessMatch[1].replace('-', '/');
        }
        t = t.substring(0, sessMatch.index).trim();
    }

    // 7. Strip trailing exam session text (only for university exams, not lawyer theory/practice):
    // e.g., 'การสอบไล่ภาค 1 ปีการศึกษา 2561'
    if (!/ว่าความ/.test(t)) {
        const examTermMatch = t.match(/\s+((?:การสอบ(?:ไล่|ใส่|ภาค)?|ภาค(?:\s*[12]|ฤดูร้อน|ต้น|ปลาย|เรียน|ซ่อม)|สอบซ่อม|ซ่อม)\s*.*)$/);
        if (examTermMatch) {
            if (!s || s === 'ไม่ระบุ') {
                s = examTermMatch[1].trim();
            }
            t = t.substring(0, examTermMatch.index).trim();
        }
    }

    // 8. Fix common OCR typos in Thai legal subject names
    t = t.replace(/^[,\s\(\.\-]+/, '');
    t = t.replace(/ฯ$/, '');
    t = t.replace(/\s{2,}/g, ' ').trim();

    t = t.replace(/กฎหมายแพ่งแสะพาณิชย์/g, 'กฎหมายแพ่งและพาณิชย์');
    t = t.replace(/กฎหมายแฟงและพาณิชย์/g, 'กฎหมายแพ่งและพาณิชย์');
    t = t.replace(/กฎหมายแพ่งและพาณิชย์ว่าด้าย/g, 'กฎหมายแพ่งและพาณิชย์ว่าด้วย');
    t = t.replace(/กฏหมาย/g, 'กฎหมาย');
    t = t.replace(/^ฎหมาย/g, 'กฎหมาย');
    t = t.replace(/หลัก กฎหมาย/g, 'หลักกฎหมาย');
    t = t.replace(/ re$/g, '');

    // Normalize spacing in numbered subjects (e.g. "เอกเทศสัญญา2" -> "เอกเทศสัญญา 2")
    t = t.replace(/(เอกเทศสัญญา|กฎหมายอาญา|กฎหมายวิธีพิจารณาความแพ่ง|กฎหมายวิธีพิจารณาความอาญา|ภาษาอังกฤษสำหรับนักกฎหมาย|กฎหมายธุรกิจ)(\d)/g, '$1 $2');

    // 9. Fallback if title became empty (for the 15 exams that only had 'LAW 2010 การสอบไล่...')
    if (!t && subjectGroup) {
        t = subjectGroup;
    }

    return { title: t, session: s };
}

export function cleanDescription(desc: string): string {
    if (!desc) return '';
    let d = desc;
    // Remove LAW code references
    d = d.replace(/ข้อสอบกระบวนวิชา\s*LAW\s*\d{3,4}(?:\s*\([A-Z0-9\s,]+\))?\s*/gi, 'ข้อสอบวิชา ');
    d = d.replace(/LAW\s*\d{3,4}(?:\s*\([A-Z0-9\s,]+\))?/gi, '');
    d = d.replace(/\b777\d{3,6}\b/g, '');
    d = d.replace(/\s{2,}/g, ' ').trim();
    return d;
}

export async function GET(request: NextRequest) {
    try {
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const snap = await db.collection('examSets').select('title', 'session', 'subjectGroup', 'subjectCode', 'description').get();

        const samples: any[] = [];
        let changedCount = 0;

        for (const doc of snap.docs) {
            const data = doc.data();
            const { title: newTitle, session: newSession } = cleanExamTitleAndSession(
                data.title || '',
                data.session || '',
                data.subjectGroup || ''
            );
            const isChanged = newTitle !== data.title || newSession !== data.session || !!data.subjectCode;
            if (isChanged) changedCount++;

            if (samples.length < 30 && isChanged) {
                samples.push({
                    id: doc.id,
                    oldTitle: data.title,
                    newTitle,
                    oldSession: data.session,
                    newSession,
                    oldSubjectCode: data.subjectCode,
                });
            }
        }

        return NextResponse.json({
            totalExams: snap.size,
            changedCount,
            samples,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const { searchParams } = new URL(request.url);
        const target = searchParams.get('target') || 'exams'; // 'exams' or 'questions'

        if (target === 'exams') {
            const snap = await db.collection('examSets').get();
            let updatedCount = 0;
            let batch = db.batch();
            let batchOps = 0;

            for (const doc of snap.docs) {
                const data = doc.data();
                const { title: newTitle, session: newSession } = cleanExamTitleAndSession(
                    data.title || '',
                    data.session || '',
                    data.subjectGroup || ''
                );
                const newDesc = cleanDescription(data.description || '');

                const updateData: Record<string, any> = {};
                if (newTitle !== data.title) updateData.title = newTitle;
                if (newSession !== data.session) updateData.session = newSession;
                if (newDesc !== data.description) updateData.description = newDesc;
                if (data.subjectCode) updateData.subjectCode = '';

                if (Object.keys(updateData).length > 0) {
                    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
                    batch.update(doc.ref, updateData);
                    batchOps++;
                    updatedCount++;

                    if (batchOps >= 400) {
                        await batch.commit();
                        batch = db.batch();
                        batchOps = 0;
                    }
                }
            }

            if (batchOps > 0) {
                await batch.commit();
            }

            return NextResponse.json({
                success: true,
                target: 'exams',
                totalExams: snap.size,
                updatedCount,
            });
        } else if (target === 'questions') {
            // Clean question headers with 777xxx or LAWxxx and tags
            const snap = await db.collection('examSets').get();
            let cleanedQuestions = 0;

            for (const examDoc of snap.docs) {
                const qSnap = await examDoc.ref.collection('questions').get();
                let qBatch = db.batch();
                let qOps = 0;

                for (const qDoc of qSnap.docs) {
                    const qData = qDoc.data();
                    let text = qData.questionText || '';
                    let tags: string[] = qData.tags || [];

                    let textChanged = false;
                    let tagsChanged = false;

                    // Clean questionText header
                    if (/777\d{3}|LAW\s*\d{3,4}/i.test(text)) {
                        text = text.replace(/ข้อสอบรายวิชา\s*777\d{3}\s*/g, 'ข้อสอบวิชา ');
                        text = text.replace(/ขอสอบจชา\s*777\d{3}\s*/g, 'ข้อสอบวิชา ');
                        text = text.replace(/ข้อสอบกระบวนวิชา\s*LAW\s*\d{3,4}\s*/gi, 'ข้อสอบวิชา ');
                        text = text.replace(/\b777\d{3,6}\b/g, '');
                        text = text.replace(/LAW\s*\d{3,4}/gi, '');
                        textChanged = true;
                    }

                    // Clean tags: remove course codes like LAW2001, 777xxx
                    const cleanTags = tags.filter(t => !/^(?:LAW|LW)\s*\d{3,4}$/i.test(t) && !/^777\d{3,6}$/.test(t));
                    if (cleanTags.length !== tags.length) {
                        tags = cleanTags;
                        tagsChanged = true;
                    }

                    if (textChanged || tagsChanged) {
                        qBatch.update(qDoc.ref, {
                            ...(textChanged ? { questionText: text } : {}),
                            ...(tagsChanged ? { tags } : {}),
                        });
                        qOps++;
                        cleanedQuestions++;

                        if (qOps >= 400) {
                            await qBatch.commit();
                            qBatch = db.batch();
                            qOps = 0;
                        }
                    }
                }

                if (qOps > 0) {
                    await qBatch.commit();
                }
            }

            return NextResponse.json({
                success: true,
                target: 'questions',
                cleanedQuestions,
            });
        }

        return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
