import { getGeminiModel } from './gemini';

export interface GradingResult {
    score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}

export interface QuestionGradingInput {
    questionText: string;
    modelAnswer: string;
    studentAnswer: string;
    subject?: string;
}

/**
 * Grade an essay answer using Gemini AI
 *
 * เรียก AI ไม่สำเร็จจะ throw — เดิมกลืน error แล้วคืน score 0 ทำให้ผู้ใช้ได้ 0 ทุกข้อ
 * ตอนคีย์ใช้ไม่ได้ โดยไม่มีใครรู้ว่า AI ล่ม ให้ผู้เรียกตัดสินเองว่าจะแสดงผลอย่างไร
 *
 * ข้อสอบส่วนใหญ่ที่ได้มาจาก OCR ไม่มีธงคำตอบ — กรณีนั้นให้ AI ตรวจตามหลักกฎหมายไทย
 * เอง (วินิจฉัยประเด็น อ้างตัวบท ให้เหตุผล) แทนที่จะเทียบกับธงว่างๆ แล้วให้ 0
 */
export async function gradeEssayAnswer(input: QuestionGradingInput): Promise<GradingResult> {
    const model = getGeminiModel({ json: true });
    const hasModelAnswer = input.modelAnswer.trim().length > 0;

    const reference = hasModelAnswer
        ? `**ธงคำตอบ (คำตอบที่ถูกต้อง)**:
${input.modelAnswer}`
        : `**ธงคำตอบ**: ข้อนี้ไม่มีธงคำตอบ — ให้คุณวินิจฉัยเองตามกฎหมายไทยที่ใช้บังคับ
ระบุประเด็นที่ข้อสอบต้องการ หลักกฎหมาย/มาตราที่เกี่ยวข้อง และข้อสรุปที่ถูกต้อง แล้วใช้เป็นเกณฑ์ตรวจ
ถ้าข้อเท็จจริงตีความได้หลายทาง ให้คะแนนคำตอบที่ให้เหตุผลทางกฎหมายสมเหตุสมผล`;

    const prompt = `คุณเป็นผู้ตรวจข้อสอบกฎหมายผู้เชี่ยวชาญ กรุณาตรวจคำตอบนักศึกษาอย่างละเอียด
${input.subject ? `\n**วิชา**: ${input.subject}\n` : ''}
**คำถาม**: ${input.questionText}

${reference}

**คำตอบของนักศึกษา**:
${input.studentAnswer}

กรุณาวิเคราะห์และให้คะแนนคำตอบนักศึกษา โดย:
1. ให้คะแนน 0-100 (พิจารณาจากความถูกต้อง ครบถ้วน และการอ้างหลักกฎหมาย)
2. ระบุจุดแข็งของคำตอบ
3. ระบุจุดอ่อนที่ควรปรับปรุง
4. ให้คำแนะนำเพิ่มเติม
5. สรุป feedback โดยรวม${hasModelAnswer ? '' : ' และสรุปแนวคำตอบที่ถูกต้องสั้นๆ ไว้ใน feedback ด้วย'}

ตอบเป็น JSON format เท่านั้น:
{
  "score": number,
  "feedback": "ข้อเสนอแนะโดยรวม",
  "strengths": ["จุดแข็งข้อ 1", "จุดแข็งข้อ 2"],
  "weaknesses": ["จุดอ่อนข้อ 1", "จุดอ่อนข้อ 2"],
  "suggestions": ["คำแนะนำข้อ 1", "คำแนะนำข้อ 2"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const parsed = JSON.parse(jsonMatch[0]) as Partial<GradingResult>;
    const score = Number(parsed.score);
    if (!Number.isFinite(score)) throw new Error('AI response has no score');

    return {
        score: Math.round(Math.min(100, Math.max(0, score))),
        feedback: parsed.feedback || 'ไม่สามารถวิเคราะห์ได้',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
}

/**
 * Grade multiple choice answer (simple comparison)
 */
export function gradeMultipleChoice(
    selectedIndex: number,
    correctIndex: number,
    explanation?: string
): { isCorrect: boolean; explanation?: string } {
    return {
        isCorrect: selectedIndex === correctIndex,
        explanation
    };
}
