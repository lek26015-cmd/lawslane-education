import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { gradeEssayAnswer, gradeMultipleChoice } from '@/lib/ai-grading';
import { stripAnswerFromQuestion, formatExamText } from '@/lib/exam-utils';
import { requireUser } from '@/lib/user-auth';
import { consumeExamAttempt, EntitlementError, getEntitlement } from '@/lib/plan-entitlement';

// ตรวจข้อเขียนด้วย AI ทุกข้อพร้อมกันใช้เวลาได้หลายสิบวินาที — ค่าเริ่มต้นของ Vercel
// ตัดฟังก์ชันทิ้งก่อน ผู้ใช้เห็นแค่ "เกิดข้อผิดพลาด" ทั้งที่ยังตรวจไม่เสร็จ
// บางชุดมีข้อเขียนถึง 80 ข้อ (ตรวจ production 2026-10-03) จึงเผื่อถึง 300 วินาที
export const maxDuration = 300;

interface SubmitAnswerInput {
    questionId: string;
    answer: string | number;
}

interface SubmitExamRequest {
    examId: string;
    userName?: string;
    answers: SubmitAnswerInput[];
    startedAt: string;
}

export async function POST(request: NextRequest) {
    // ต้องล็อกอินอยู่จริง — route นี้เรียก AI ตรวจข้อเขียน 1 ครั้งต่อ 1 ข้อ ต่อ 1 request
    // เดิมเปิดให้คนนิรนามยิงได้ = ค่า Gemini บานปลายแบบไม่มีเพดาน
    const uid = await requireUser(request);
    if (!uid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body: SubmitExamRequest = await request.json();
        const { examId, userName, answers, startedAt } = body;

        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();

        // Get exam from Firestore
        const examDoc = await db.collection('examSets').doc(examId).get();
        if (!examDoc.exists) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }
        const examData = examDoc.data()!;
        if (examData.status === 'draft') {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        // สิทธิ์ตามแพ็กเกจ (แอดมินตั้งที่หลังบ้าน) — ชุดที่เริ่มทำไปแล้ววันนี้ไม่นับซ้ำ
        // ด่านนี้กันการยิง API ตรงข้ามหน้าเริ่มทำข้อสอบ
        const entitlement = await getEntitlement(db, uid);
        try {
            await consumeExamAttempt(db, uid, examId, entitlement.entitlements.examsPerDay);
        } catch (e) {
            if (e instanceof EntitlementError) {
                return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
            }
            throw e;
        }
        const aiGrading = entitlement.entitlements.aiGrading;

        // Get questions from subcollection
        const qSnap = await examDoc.ref.collection('questions')
            .orderBy('orderIndex', 'asc')
            .get();

        if (qSnap.empty) {
            return NextResponse.json({ error: 'No questions found' }, { status: 404 });
        }

        // Map questions with proper type handling
        const questions = qSnap.docs.map((qDoc, idx) => {
            const q = qDoc.data();
            const rawType = q.type === 'multiple_choice' || q.type === 'MULTIPLE_CHOICE';
            let options: string[] | undefined;
            let correctOptionIndex: number | undefined;
            let hasRealChoices = false;

            if (rawType && Array.isArray(q.choices) && q.choices.length > 0) {
                options = q.choices.map((c: any) => typeof c === 'string' ? c : c.text || c);
                hasRealChoices = true;
                if (q.correctAnswer) {
                    const match = String(q.correctAnswer).match(/\((\d+)\)/);
                    if (match) correctOptionIndex = parseInt(match[1]) - 1;
                }
            }

            const finalType = (rawType && hasRealChoices) ? 'MULTIPLE_CHOICE' : 'ESSAY';
            // ธงคำตอบบางข้อติดมากับตัวคำถามจาก OCR — หน้าเฉลยใช้ extractedAnswer อยู่แล้ว
            // ตอนตรวจต้องใช้ด้วย ไม่งั้น AI ได้ธงว่างทั้งที่ข้อนั้นมีเฉลย
            const { question: cleanText, extractedAnswer } = stripAnswerFromQuestion(q.questionText || '');

            return {
                id: qDoc.id,
                text: formatExamText(cleanText),
                type: finalType,
                options,
                correctOptionIndex,
                correctAnswerText: formatExamText(q.modelAnswer || extractedAnswer || ''),
                explanation: q.explanation || '',
                subject: q.tags?.[0] || '',
            };
        });

        // Grade each answer. Multiple-choice grading is synchronous (no AI call), so
        // only essay questions are graded concurrently — sequentially, 5 essays at
        // ~4s each was ~20s; grading them in groups instead of one-at-a-time cuts
        // that roughly by the group size. See LAWSLANE-PLAN-01 2.6.
        const ESSAY_CONCURRENCY = 10;
        const gradedAnswers: any[] = new Array(questions.length);
        const essayJobs: { index: number; question: typeof questions[number]; submittedAnswer: SubmitAnswerInput }[] = [];

        questions.forEach((question, index) => {
            const submittedAnswer = answers.find(a => a.questionId === question.id);
            // หน้าทำข้อสอบส่งทุกข้อมา ข้อที่ไม่ได้ตอบเป็น '' — ไม่ต้องเสียค่า AI ตรวจคำตอบว่าง
            const isBlank = !submittedAnswer
                || submittedAnswer.answer === ''
                || submittedAnswer.answer === null
                || (typeof submittedAnswer.answer === 'string' && submittedAnswer.answer.trim() === '');

            if (isBlank) {
                gradedAnswers[index] = {
                    questionId: question.id,
                    questionText: question.text,
                    questionType: question.type,
                    studentAnswer: '',
                    isCorrect: false,
                    aiScore: 0,
                    aiFeedback: 'ไม่ได้ตอบคำถามนี้',
                    subject: question.subject,
                };
                return;
            }

            if (question.type === 'MULTIPLE_CHOICE') {
                const result = gradeMultipleChoice(
                    Number(submittedAnswer.answer),
                    question.correctOptionIndex || 0,
                    question.explanation
                );
                const questionScore = result.isCorrect ? 100 : 0;

                gradedAnswers[index] = {
                    questionId: question.id,
                    questionText: question.text,
                    questionType: 'MULTIPLE_CHOICE',
                    studentAnswer: submittedAnswer.answer,
                    correctAnswer: question.correctOptionIndex,
                    isCorrect: result.isCorrect,
                    aiScore: questionScore,
                    aiFeedback: result.isCorrect
                        ? 'ถูกต้อง! ' + (question.explanation || '')
                        : 'ไม่ถูกต้อง คำตอบที่ถูกคือ: ' + (question.options?.[question.correctOptionIndex || 0] || '') + '. ' + (question.explanation || ''),
                    subject: question.subject,
                };
            } else {
                essayJobs.push({ index, question, submittedAnswer });
            }
        });

        // แพ็กเกจไม่รวม AI ตรวจข้อเขียน: ไม่เรียก AI และไม่เอาข้อเขียนไปคิดคะแนน
        // (ให้ 0 จะไม่ยุติธรรม ให้ 50 แบบ fallback ก็เท่ากับเดา)
        if (!aiGrading) {
            for (const { index, question, submittedAnswer } of essayJobs) {
                gradedAnswers[index] = {
                    questionId: question.id,
                    questionText: question.text,
                    questionType: 'ESSAY',
                    studentAnswer: submittedAnswer.answer,
                    correctAnswer: question.correctAnswerText,
                    aiScore: null,
                    ungraded: true,
                    subject: question.subject,
                    aiFeedback: 'แพ็กเกจของคุณยังไม่รวม AI ตรวจข้อเขียน — เทียบคำตอบกับแนวคำตอบได้จากหน้าเฉลย',
                };
            }
            essayJobs.length = 0;
        }

        let aiFailed = false;
        for (let i = 0; i < essayJobs.length; i += ESSAY_CONCURRENCY) {
            const group = essayJobs.slice(i, i + ESSAY_CONCURRENCY);
            await Promise.all(group.map(async ({ index, question, submittedAnswer }) => {
                try {
                    const aiResult = await gradeEssayAnswer({
                        questionText: question.text,
                        modelAnswer: question.correctAnswerText || '',
                        studentAnswer: submittedAnswer.answer as string,
                        subject: question.subject
                    });
                    gradedAnswers[index] = {
                        questionId: question.id,
                        questionText: question.text,
                        questionType: 'ESSAY',
                        studentAnswer: submittedAnswer.answer,
                        correctAnswer: question.correctAnswerText,
                        aiScore: aiResult.score,
                        aiFeedback: aiResult.feedback,
                        aiStrengths: aiResult.strengths,
                        aiWeaknesses: aiResult.weaknesses,
                        aiSuggestions: aiResult.suggestions,
                        subject: question.subject,
                    };
                } catch (aiError) {
                    console.error('AI grading error:', aiError);
                    // AI ล่ม (คีย์ผิด/โควตาหมด/timeout) — ไม่เดาคะแนนให้ ทั้ง 0 และ 50 ไม่ยุติธรรม
                    // ทำเป็น "ยังไม่ได้ตรวจ" และไม่นับในคะแนนรวม เหมือนแพ็กเกจที่ไม่รวม AI
                    aiFailed = true;
                    gradedAnswers[index] = {
                        questionId: question.id,
                        questionText: question.text,
                        questionType: 'ESSAY',
                        studentAnswer: submittedAnswer.answer,
                        correctAnswer: question.correctAnswerText,
                        aiScore: null,
                        ungraded: true,
                        aiFeedback: 'ระบบ AI ตรวจข้อเขียนขัดข้องชั่วคราว ข้อนี้จึงยังไม่ได้ตรวจและไม่นับในคะแนนรวม — เทียบคำตอบกับแนวคำตอบได้จากหน้าเฉลย',
                        subject: question.subject,
                    };
                }
            }));
        }

        const scored = gradedAnswers.filter(a => !a?.ungraded);
        const totalScore = scored.reduce((sum, a) => sum + (a?.aiScore || 0), 0);
        const finalScore = scored.length > 0 ? Math.round(totalScore / scored.length) : 0;
        const passingScore = 50;
        const passed = finalScore >= passingScore;

        // บันทึกผลลง examAttempts — เดิมคืน attemptId ที่สร้างขึ้นลอยๆ (`attempt_${Date.now()}`)
        // โดยไม่บันทึกอะไรเลย หน้าผลสอบจึงหาไม่เจอทุกครั้ง และ AI วิเคราะห์จุดอ่อนไม่มีข้อมูลให้ใช้
        const startedDate = startedAt ? new Date(startedAt) : null;
        const validStart = startedDate && !Number.isNaN(startedDate.getTime()) && startedDate.getTime() <= Date.now()
            ? startedDate : null;
        const correctAnswers = gradedAnswers.filter(a => a?.isCorrect || (typeof a?.aiScore === 'number' && a.aiScore >= 60)).length;
        const attemptRef = await db.collection('examAttempts').add({
            userId: uid,
            examId,
            examTitle: examData.title || '',
            status: 'COMPLETED',
            score: finalScore,
            totalScore: finalScore,
            maxScore: 100,
            passingScore,
            passed,
            totalQuestions: questions.length,
            correctAnswers,
            timeSpentMinutes: validStart ? Math.round((Date.now() - validStart.getTime()) / 60000) : 0,
            // Firestore ไม่รับ undefined — ตัดฟิลด์ที่ไม่มีค่าทิ้ง
            answers: JSON.parse(JSON.stringify(gradedAnswers)),
            ...(aiFailed ? { aiGradingFailed: true } : {}),
            startedAt: validStart,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            attemptId: attemptRef.id,
            totalScore: finalScore,
            maxScore: 100,
            passingScore,
            passed,
            aiGradingFailed: aiFailed,
            answers: gradedAnswers
        });

    } catch (error) {
        console.error('Error submitting exam:', error);
        return NextResponse.json(
            { error: 'Failed to submit exam' },
            { status: 500 }
        );
    }
}
