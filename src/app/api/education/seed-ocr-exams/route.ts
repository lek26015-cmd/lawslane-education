import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const OCR_JSON_PATH = path.join(process.cwd(), 'ข้อสอบเก่า', 'ocr_cleaned.json');

export async function POST(request: NextRequest) {
    try {
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();

        // Read cleaned OCR data
        if (!fs.existsSync(OCR_JSON_PATH)) {
            return NextResponse.json({ error: 'OCR data file not found. Run clean_and_prepare.py first.' }, { status: 404 });
        }

        const rawData = fs.readFileSync(OCR_JSON_PATH, 'utf-8');
        const examData: any[] = JSON.parse(rawData);

        // Optional: limit batch size via query param
        const { searchParams } = new URL(request.url);
        const startIdx = parseInt(searchParams.get('start') || '0');
        const batchSize = parseInt(searchParams.get('batch') || '20');
        const endIdx = Math.min(startIdx + batchSize, examData.length);

        const results: any[] = [];
        let totalQuestions = 0;

        for (let i = startIdx; i < endIdx; i++) {
            const exam = examData[i];
            const now = admin.firestore.FieldValue.serverTimestamp();

            // Check if this exam already exists (by title to avoid duplicates)
            const existing = await db.collection('examSets')
                .where('title', '==', exam.examSet.title)
                .limit(1)
                .get();

            if (!existing.empty) {
                results.push({
                    index: i,
                    title: exam.examSet.title,
                    status: 'skipped (already exists)',
                    examId: existing.docs[0].id,
                });
                continue;
            }

            // Create examSet document
            const examRef = await db.collection('examSets').add({
                ...exam.examSet,
                createdAt: now,
                updatedAt: now,
            });

            // Add questions as subcollection (batch writes, max 500 per batch)
            const questions = exam.questions || [];
            const batches: admin.firestore.WriteBatch[] = [];
            let currentBatch = db.batch();
            let batchCount = 0;

            for (const question of questions) {
                const qRef = examRef.collection('questions').doc();
                currentBatch.set(qRef, {
                    ...question,
                    createdAt: now,
                    updatedAt: now,
                });
                batchCount++;

                if (batchCount >= 450) {
                    batches.push(currentBatch);
                    currentBatch = db.batch();
                    batchCount = 0;
                }
            }

            if (batchCount > 0) {
                batches.push(currentBatch);
            }

            for (const batch of batches) {
                await batch.commit();
            }

            totalQuestions += questions.length;
            results.push({
                index: i,
                examId: examRef.id,
                title: exam.examSet.title,
                questionsCount: questions.length,
                status: 'created',
            });
        }

        return NextResponse.json({
            success: true,
            message: `Processed exams ${startIdx} to ${endIdx - 1} of ${examData.length}`,
            totalExamsInFile: examData.length,
            processedRange: { start: startIdx, end: endIdx - 1 },
            nextStart: endIdx < examData.length ? endIdx : null,
            results,
            totalQuestionsAdded: totalQuestions,
        });
    } catch (error) {
        console.error('Error seeding OCR exams:', error);
        return NextResponse.json({ error: 'Failed to seed exams', details: String(error) }, { status: 500 });
    }
}
