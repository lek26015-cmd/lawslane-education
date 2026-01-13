import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExamAttempt } from './mock-store';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export interface WeaknessAnalysis {
    overallAssessment: string;
    strongTopics: { topic: string; score: number; reason: string }[];
    weakTopics: { topic: string; score: number; reason: string }[];
    studyRecommendations: string[];
    improvementPlan: string[];
    motivationalMessage: string;
}

/**
 * Analyze exam attempts to identify strengths and weaknesses
 */
export async function analyzeWeaknesses(attempts: ExamAttempt[]): Promise<WeaknessAnalysis> {
    if (attempts.length === 0) {
        return {
            overallAssessment: 'ยังไม่มีข้อมูลการทำข้อสอบ',
            strongTopics: [],
            weakTopics: [],
            studyRecommendations: ['ลองทำข้อสอบสัก 2-3 ชุดก่อน เพื่อให้ AI วิเคราะห์ได้'],
            improvementPlan: [],
            motivationalMessage: 'เริ่มต้นดี มีชัยไปกว่าครึ่ง!'
        };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare data summary for AI
    const summary = attempts.map(a => ({
        exam: a.examTitle,
        score: a.totalScore,
        passed: a.passed,
        answers: a.answers.map(ans => ({
            question: ans.questionText.substring(0, 100),
            type: ans.questionType,
            score: ans.aiScore || (ans.isCorrect ? 100 : 0),
            subject: (ans as any).subject || 'ทั่วไป',
            feedback: ans.aiFeedback?.substring(0, 200) || '',
            weaknesses: ans.aiWeaknesses || []
        }))
    }));

    const prompt = `คุณเป็นที่ปรึกษาการศึกษากฎหมาย กรุณาวิเคราะห์ผลการทำข้อสอบต่อไปนี้

**ข้อมูลการทำข้อสอบ**:
${JSON.stringify(summary, null, 2)}

กรุณาวิเคราะห์และให้:
1. การประเมินภาพรวม
2. หัวข้อที่ทำได้ดี (พร้อมคะแนนเฉลี่ยและเหตุผล)
3. หัวข้อที่ควรปรับปรุง (พร้อมคะแนนเฉลี่ยและเหตุผล) 
4. คำแนะนำในการศึกษา (เรียงลำดับความสำคัญ)
5. แผนพัฒนาตนเอง (ขั้นตอนที่ชัดเจน)
6. ข้อความให้กำลังใจ

ตอบเป็น JSON format:
{
  "overallAssessment": "การประเมินภาพรวม",
  "strongTopics": [{"topic": "หัวข้อ", "score": 85, "reason": "เหตุผล"}],
  "weakTopics": [{"topic": "หัวข้อ", "score": 45, "reason": "เหตุผล"}],
  "studyRecommendations": ["คำแนะนำ 1", "คำแนะนำ 2"],
  "improvementPlan": ["ขั้นตอน 1", "ขั้นตอน 2"],
  "motivationalMessage": "ข้อความให้กำลังใจ"
}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]) as WeaknessAnalysis;
            return {
                overallAssessment: parsed.overallAssessment || 'ไม่สามารถวิเคราะห์ได้',
                strongTopics: parsed.strongTopics || [],
                weakTopics: parsed.weakTopics || [],
                studyRecommendations: parsed.studyRecommendations || [],
                improvementPlan: parsed.improvementPlan || [],
                motivationalMessage: parsed.motivationalMessage || 'สู้ๆ นะครับ!'
            };
        }

        throw new Error('Invalid AI response');
    } catch (error) {
        console.error('AI Analysis Error:', error);
        return {
            overallAssessment: 'ไม่สามารถวิเคราะห์ได้ในขณะนี้',
            strongTopics: [],
            weakTopics: [],
            studyRecommendations: ['กรุณาลองใหม่อีกครั้ง'],
            improvementPlan: [],
            motivationalMessage: 'อย่าท้อแท้ ลองอีกครั้ง!'
        };
    }
}
