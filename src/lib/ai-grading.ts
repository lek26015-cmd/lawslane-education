import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

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
 */
export async function gradeEssayAnswer(input: QuestionGradingInput): Promise<GradingResult> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `คุณเป็นผู้ตรวจข้อสอบกฎหมายผู้เชี่ยวชาญ กรุณาตรวจคำตอบนักศึกษาอย่างละเอียด

**คำถาม**: ${input.questionText}

**ธงคำตอบ (คำตอบที่ถูกต้อง)**: 
${input.modelAnswer}

**คำตอบของนักศึกษา**: 
${input.studentAnswer}

กรุณาวิเคราะห์และให้คะแนนคำตอบนักศึกษา โดย:
1. ให้คะแนน 0-100 (พิจารณาจากความถูกต้อง ครบถ้วน และการอ้างหลักกฎหมาย)
2. ระบุจุดแข็งของคำตอบ
3. ระบุจุดอ่อนที่ควรปรับปรุง
4. ให้คำแนะนำเพิ่มเติม
5. สรุป feedback โดยรวม

ตอบเป็น JSON format เท่านั้น:
{
  "score": number,
  "feedback": "ข้อเสนอแนะโดยรวม",
  "strengths": ["จุดแข็งข้อ 1", "จุดแข็งข้อ 2"],
  "weaknesses": ["จุดอ่อนข้อ 1", "จุดอ่อนข้อ 2"],
  "suggestions": ["คำแนะนำข้อ 1", "คำแนะนำข้อ 2"]
}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]) as GradingResult;
            return {
                score: Math.min(100, Math.max(0, parsed.score || 0)),
                feedback: parsed.feedback || 'ไม่สามารถวิเคราะห์ได้',
                strengths: parsed.strengths || [],
                weaknesses: parsed.weaknesses || [],
                suggestions: parsed.suggestions || []
            };
        }

        throw new Error('Invalid AI response format');
    } catch (error) {
        console.error('AI Grading Error:', error);
        // Return a default response on error
        return {
            score: 0,
            feedback: 'ไม่สามารถตรวจคำตอบด้วย AI ได้ในขณะนี้',
            strengths: [],
            weaknesses: [],
            suggestions: ['กรุณาลองใหม่อีกครั้ง']
        };
    }
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
