import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { stripAnswerFromQuestion, formatExamText } from '@/lib/exam-utils';
import { anonymizeExamTexts } from '@/lib/name-anonymizer';

// Public "ดูเฉลย" feature — students can view model answers without logging in
// (linked directly from /exams listing), so this intentionally has no auth guard.
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const doc = await db.collection('examSets').doc(id).get();
        if (!doc.exists) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

        const data = doc.data()!;

        // แบบร่างยังไม่เผยแพร่ — ทำเหมือนไม่มีชุดนี้

        if (data.status === 'draft') return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        const qSnap = await doc.ref.collection('questions')
            .orderBy('orderIndex', 'asc')
            .get();

        const questions = qSnap.docs.map((qDoc, idx) => {
            const q = qDoc.data();
            const rawType = q.type === 'multiple_choice' || q.type === 'MULTIPLE_CHOICE';
            const hasChoices = rawType && Array.isArray(q.choices) && q.choices.length > 0;
            const finalType = (rawType && hasChoices) ? 'MULTIPLE_CHOICE' : 'ESSAY';

            const { question: cleanText, extractedAnswer } = stripAnswerFromQuestion(q.questionText || '');

            let options: string[] | undefined;
            let correctOptionIndex: number | undefined;
            if (hasChoices) {
                options = q.choices.map((c: any) => typeof c === 'string' ? c : c.text || c);
                if (q.correctAnswer) {
                    const match = q.correctAnswer.match(/\((\d+)\)/);
                    if (match) correctOptionIndex = parseInt(match[1]) - 1;
                }
            }

            return {
                id: qDoc.id,
                order: q.orderIndex ?? idx + 1,
                text: formatExamText(cleanText),
                type: finalType,
                options,
                correctOptionIndex,
                correctAnswer: q.correctAnswer || '',
                modelAnswer: formatExamText(q.modelAnswer || extractedAnswer || ''),
                explanation: q.explanation || '',
                tags: q.tags || [],
                isAiGenerated: !!q.isAiGenerated,
                answerPageImages: Array.isArray(q.answerPageImages) ? q.answerPageImages : [],
            };
        });

        // Batch anonymize all texts for consistent name mapping
        // ชุดที่มีภาพต้นฉบับไม่แปลงชื่อ — ไม่งั้นชื่อในข้อความกับในภาพธงคำตอบจะไม่ตรงกัน
        const pageImages = Array.isArray(data.pageImages) ? data.pageImages : [];
        const hasOriginalImages = pageImages.length > 0 || questions.some(q => q.answerPageImages.length > 0);
        const allTexts = questions.flatMap(q => [q.text, q.modelAnswer]);
        const anonymized = hasOriginalImages ? allTexts : anonymizeExamTexts(allTexts, id);
        
        const anonymizedQuestions = questions.map((q, i) => ({
            ...q,
            text: anonymized[i * 2],
            modelAnswer: anonymized[i * 2 + 1],
        }));

        return NextResponse.json({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            subjectCode: data.subjectCode || '',
            session: data.session || '',
            scenarioText: formatExamText(data.scenarioText || ''),
            pageImages,
            totalQuestions: anonymizedQuestions.length,
            questions: anonymizedQuestions,
        });
    } catch (error) {
        console.error('Error fetching answers:', error);
        return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 });
    }
}
