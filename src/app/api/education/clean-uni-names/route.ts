import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

const uniPatterns = [
    /\s*(?:คณะนิติศาสตร์\s*)?มหาวิทยาลัยขอนแก่น\s*/g,
    /\s*ม\.?\s*ขอนแก่น\s*/g,
    /\s*มข\.?\s*/g,
    /\s*คณะนิติศาสตร์\s*/g,
    /\s*ม\.ขอนแก่น\s*/g,
];

function cleanText(text: string): string {
    let cleaned = text;
    for (const pattern of uniPatterns) {
        cleaned = cleaned.replace(new RegExp(pattern.source, pattern.flags), ' ');
    }
    return cleaned.replace(/\s{2,}/g, ' ').trim();
}

export async function POST(request: NextRequest) {
    try {
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const { searchParams } = new URL(request.url);
        const phase = searchParams.get('phase') || 'titles';

        if (phase === 'titles') {
            // Phase 1: Clean exam titles and descriptions only (fast)
            const snapshot = await db.collection('examSets').get();
            let updated = 0;
            let batch = db.batch();
            let batchCount = 0;

            for (const doc of snapshot.docs) {
                const data = doc.data();
                const title = data.title || '';
                const description = data.description || '';

                const cleanedTitle = cleanText(title);
                const cleanedDesc = cleanText(description);

                if (cleanedTitle !== title || cleanedDesc !== description) {
                    batch.update(doc.ref, {
                        title: cleanedTitle,
                        description: cleanedDesc,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    updated++;
                    batchCount++;

                    if (batchCount >= 450) {
                        await batch.commit();
                        batch = db.batch();
                        batchCount = 0;
                    }
                }
            }
            if (batchCount > 0) await batch.commit();

            return NextResponse.json({
                success: true,
                phase: 'titles',
                examsUpdated: updated,
                totalExams: snapshot.size,
            });
        } else if (phase === 'questions') {
            // Phase 2: Clean question texts (paginated, slower)
            const start = parseInt(searchParams.get('start') || '0');
            const limit = parseInt(searchParams.get('limit') || '50');

            const snapshot = await db.collection('examSets')
                .offset(start)
                .limit(limit)
                .get();

            let questionsUpdated = 0;

            for (const examDoc of snapshot.docs) {
                const qSnap = await examDoc.ref.collection('questions').get();
                let batch = db.batch();
                let batchCount = 0;

                for (const qDoc of qSnap.docs) {
                    const qText = qDoc.data().questionText || '';
                    const cleaned = cleanText(qText);

                    if (cleaned !== qText) {
                        batch.update(qDoc.ref, { questionText: cleaned });
                        questionsUpdated++;
                        batchCount++;

                        if (batchCount >= 450) {
                            await batch.commit();
                            batch = db.batch();
                            batchCount = 0;
                        }
                    }
                }
                if (batchCount > 0) await batch.commit();
            }

            return NextResponse.json({
                success: true,
                phase: 'questions',
                range: { start, limit },
                questionsUpdated,
                hasMore: snapshot.size === limit,
                nextStart: start + limit,
            });
        }

        return NextResponse.json({ error: 'Invalid phase' }, { status: 400 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

