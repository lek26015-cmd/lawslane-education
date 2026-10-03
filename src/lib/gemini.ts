import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini ตัวเดียวที่ทุกฟีเจอร์ AI ของ Wittaya ใช้ร่วมกัน
 *
 * ชื่อโมเดลตั้งผ่าน env `GEMINI_MODEL` ได้ — เดิม hardcode `gemini-2.0-flash` ไว้ 4 ที่
 * ซึ่ง Google ทยอยปลดระวางแล้ว ถ้าต้องเปลี่ยนอีกจะได้แก้ที่ Vercel ไม่ต้อง deploy ใหม่
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

export function getGeminiModel(options?: { json?: boolean }) {
    return genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        ...(options?.json ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
    });
}
