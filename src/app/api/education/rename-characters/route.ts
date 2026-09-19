import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { requireAdmin } from '@/lib/admin-session';

/**
 * Replace character names and place names in OCR exam questions.
 * Only targets exams with source: 'ocr'.
 * 
 * POST /api/education/rename-characters
 * Query params:
 *   - start: starting index (default 0)
 *   - batch: batch size (default 30)
 *   - dryrun: if 'true', just count replacements without saving
 */

// Character name replacements: old → new
// IMPORTANT: Order matters! Replace longer names first to avoid partial matches
const NAME_REPLACEMENTS: [string, string][] = [
    // === ชื่อตัวละครที่ชัดเจน (ไม่ใช่ศัพท์กฎหมาย) ===
    // สีเป็นชื่อ
    ['นายแดง', 'นายวิชัย'],
    ['นายดํา', 'นายสมบัติ'],
    ['นายดำ', 'นายสมบัติ'],
    ['นายขาว', 'นายพิชิต'],
    ['นายเขียว', 'นายธนา'],
    
    // ตัวเลขเป็นชื่อ
    ['นายหนึ่ง', 'นายอานนท์'],
    ['นายสอง', 'นายภาณุ'],
    ['นายสาม', 'นายกิตติ'],
    ['นายสี่', 'นายเจษฎา'],
    ['นางหนึ่ง', 'นางอรุณี'],
    ['นางสอง', 'นางพิมพา'],
    ['นางสาม', 'นางจิราภา'],
    
    // ลำดับ (เอก โท ตรี)
    ['นายเอก', 'นายปรีชา'],
    ['นายโท', 'นายวรพล'],
    ['นายตรี', 'นายสุรศักดิ์'],
    
    // อักษร ก-น (ระวังไม่ให้ชนกับ "นายก" ที่หมายถึงนายกรัฐมนตรี)
    // "นายก" จะถูก replace เฉพาะเมื่อตามด้วยตัวอักษรที่บอกว่าเป็นตัวละคร
    ['นายง', 'นายณัฐ'],
    ['นายจ', 'นายชาติ'],
    ['นายท', 'นายธวัช'],
    ['นายน', 'นายนิพนธ์'],
    ['นางก', 'นางกัลยา'],
    ['นางข', 'นางขวัญ'],
    ['นางค', 'นางจันทร์'],
    ['นางง', 'นางนงลักษณ์'],
    ['นางท', 'นางทิพย์'],
    ['นางน', 'นางนภา'],
    ['นางล', 'นางลัดดา'],
    
    // สัตว์เป็นชื่อ
    ['นายไก่', 'นายวัฒนา'],
    ['นางไข่', 'นางสุนีย์'],
    ['นายกุ้ง', 'นายเฉลิม'],
    ['นางหอย', 'นางรัตนา'],
    ['นายปู', 'นายจำลอง'],
    ['นางปู', 'นางเพ็ญ'],
    
    // รูปร่าง/ลักษณะเป็นชื่อ
    ['นายอ้วน', 'นายมานะ'],
    ['นายผอม', 'นายชูชาติ'],
    ['นายใหญ่', 'นายบุญมี'],
    ['นายมั่ง', 'นายวิเชียร'],
    
    // ชื่อเฉพาะ
    ['นายมุ่ย', 'นายเล็ก'],
    ['นายถึก', 'นายเข้ม'],
    ['นายเสมอ', 'นายพินิจ'],
    ['นายแก่น', 'นายสุวรรณ'],
    ['นายประเสริฐ', 'นายอนุสรณ์'],
    ['นายสมชาย', 'นายเสนาะ'],
    ['นายสมศักดิ์', 'นายอดุลย์'],
    ['นายโชค', 'นายสุนทร'],
    ['นายทองดี', 'นายวิจิตร'],
    ['นายทอง', 'นายพิทักษ์'],
    ['นายทองคำ', 'นายวิบูลย์'],
    ['นายพร', 'นายกำพล'],
    ['นายพุฒ', 'นายสราวุธ'],
    ['นายพงศ์', 'นายเอนก'],
    ['นายมี', 'นายบรรจง'],
    ['นายปิแอร์', 'นายฟิลิปป์'],
    ['นายสุข', 'นายสำราญ'],
    ['นายทุกข์', 'นายลำเจียก'],
    ['นายโชคยืน', 'นายสุนทรา'],
];

// Place name replacements
const PLACE_REPLACEMENTS: [string, string][] = [
    ['มหาวิทยาลัยขอนแก่น', 'มหาวิทยาลัยแห่งหนึ่ง'],
    ['ม.ขอนแก่น', 'มหาวิทยาลัยแห่งหนึ่ง'],
    ['จังหวัดขอนแก่น', 'จังหวัดเอ'],
    ['จ.ขอนแก่น', 'จังหวัดเอ'],
];

function replaceNames(text: string): { result: string; count: number } {
    let result = text;
    let totalCount = 0;

    // Sort replacements by length (longest first) to avoid partial matches
    const allReplacements = [...NAME_REPLACEMENTS, ...PLACE_REPLACEMENTS]
        .sort((a, b) => b[0].length - a[0].length);

    for (const [oldName, newName] of allReplacements) {
        // Special handling for single-character names like นายก, นายข, นายค
        // Only replace when followed by a word boundary (space, Thai char, punctuation)
        if (['นายก', 'นายข', 'นายค'].includes(oldName)) {
            // Skip "นายก" - too ambiguous (could be นายกรัฐมนตรี)
            continue;
        }
        
        const count = (result.split(oldName).length - 1);
        if (count > 0) {
            result = result.split(oldName).join(newName);
            totalCount += count;
        }
    }
    
    // Special case: Replace "นายก" only when it's clearly a character name
    // i.e., followed by specific patterns like "ได้", "ไป", "มา", "จึง", "และ", "กับ", space, etc.
    // but NOT when followed by "รัฐมนตรี", "เทศมนตรี", "สมาคม", etc.
    const nayokPattern = /นายก(?!รัฐมนตรี|เทศมนตรี|สมาคม|องค์การ|สภา|ฯ|\.)/g;
    const nayokMatches = result.match(nayokPattern);
    if (nayokMatches) {
        result = result.replace(nayokPattern, 'นายพิศาล');
        totalCount += nayokMatches.length;
    }
    
    // Replace นายข when it's a character (not part of longer word)
    const naykhoPattern = /นายข(?!อง|้อ|้า|ัด|อ|ัง)/g;
    const naykhoMatches = result.match(naykhoPattern);
    if (naykhoMatches) {
        result = result.replace(naykhoPattern, 'นายวินัย');
        totalCount += naykhoMatches.length;
    }

    // Replace นายค when it's a character
    const naykhoPattern2 = /นายค(?!น|วาม|ดี|ู่|ำ|รั้ง|รอง|รบ|รู)/g;
    const naykhoMatches2 = result.match(naykhoPattern2);
    if (naykhoMatches2) {
        result = result.replace(naykhoPattern2, 'นายจรัส');
        totalCount += naykhoMatches2.length;
    }

    return { result, count: totalCount };
}

export async function POST(request: NextRequest) {
    try {
        if (!requireAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const { searchParams } = new URL(request.url);
        const startIdx = parseInt(searchParams.get('start') || '0');
        const batchSize = parseInt(searchParams.get('batch') || '30');
        const dryRun = searchParams.get('dryrun') === 'true';

        // Only target OCR exams
        const snapshot = await db.collection('examSets')
            .where('source', '==', 'ocr')
            .offset(startIdx)
            .limit(batchSize)
            .get();

        let totalReplacements = 0;
        let questionsUpdated = 0;
        let examsProcessed = 0;
        const details: any[] = [];

        for (const examDoc of snapshot.docs) {
            const examData = examDoc.data();
            examsProcessed++;

            // Clean exam title and description
            const titleResult = replaceNames(examData.title || '');
            const descResult = replaceNames(examData.description || '');

            if (!dryRun && (titleResult.count > 0 || descResult.count > 0)) {
                await examDoc.ref.update({
                    title: titleResult.result,
                    description: descResult.result,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
            totalReplacements += titleResult.count + descResult.count;

            // Clean questions
            const qSnap = await examDoc.ref.collection('questions').get();
            let batch = db.batch();
            let batchCount = 0;

            for (const qDoc of qSnap.docs) {
                const qText = qDoc.data().questionText || '';
                const { result, count } = replaceNames(qText);

                if (count > 0) {
                    if (!dryRun) {
                        batch.update(qDoc.ref, { questionText: result });
                        batchCount++;

                        if (batchCount >= 450) {
                            await batch.commit();
                            batch = db.batch();
                            batchCount = 0;
                        }
                    }
                    totalReplacements += count;
                    questionsUpdated++;
                }
            }

            if (!dryRun && batchCount > 0) {
                await batch.commit();
            }

            details.push({
                examId: examDoc.id,
                title: dryRun ? titleResult.result : examData.title,
                replacements: titleResult.count + descResult.count + 
                    (await examDoc.ref.collection('questions').get()).docs.reduce((sum, q) => {
                        return sum + replaceNames(q.data().questionText || '').count;
                    }, 0),
            });
        }

        // Count total OCR exams for pagination
        const totalOcrSnap = await db.collection('examSets')
            .where('source', '==', 'ocr')
            .count()
            .get();
        const totalOcrExams = totalOcrSnap.data().count;

        return NextResponse.json({
            success: true,
            dryRun,
            examsProcessed,
            questionsUpdated,
            totalReplacements,
            totalOcrExams,
            hasMore: startIdx + batchSize < totalOcrExams,
            nextStart: startIdx + batchSize,
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
