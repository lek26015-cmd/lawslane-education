/**
 * Typhoon OCR สำหรับ "ภาพครอปหนึ่งชิ้น"
 *
 * ต่างจาก `Lawslane/src/lib/typhoon.ts` สองเรื่องที่สำคัญ:
 *
 * 1. ตัวนั้นส่ง **ทั้ง PDF** ไปครั้งเดียว ซึ่งชน token cap 8192 แล้วตัดกลางคันเงียบๆ
 *    ที่นี่ส่งทีละภาพครอป ซึ่งเป็นหน่วยที่เล็กพอเสมอ
 * 2. ตัวนั้นคืน `""` ทุกกรณีที่ล้มเหลว (ไม่มี key / timeout / non-2xx) จึงแยกไม่ออก
 *    ระหว่าง "อ่านแล้วไม่มีข้อความ" กับ "เรียกไม่ติด" ที่นี่คืนผลแบบมีชนิด
 *
 * ผลลัพธ์เป็นแค่ **ตัวช่วยร่าง** เท่านั้น คนต้องตรวจก่อนเอาเข้า IR เสมอ เพราะ
 * Typhoon ชอบ "ช่วยแก้" ให้ — ปรับเลขไทยเป็นอารบิก แก้คำผิดที่ต้นฉบับมีจริง
 * และจัดรูปใหม่เป็น markdown ซึ่งในข้อสอบคือการทำลายตัวโจทย์
 */
const TYPHOON_URL = 'https://api.opentyphoon.ai/v1/chat/completions';
const TYPHOON_MODEL = 'typhoon-ocr';

export type TyphoonResult =
    | { ok: true; text: string; truncated: boolean }
    | { ok: false; reason: 'no-api-key' | 'timeout' | 'http-error' | 'empty' | 'exception'; detail: string };

export interface TyphoonOptions {
    /** CLI ไม่มีเพดาน serverless แบบ Vercel จึงรอได้นานกว่า */
    timeoutMs?: number;
    maxTokens?: number;
    prompt?: string;
}

export async function ocrImage(png: Uint8Array, opts: TyphoonOptions = {}): Promise<TyphoonResult> {
    const apiKey = process.env.TYPHOON_API_KEY;
    if (!apiKey) return { ok: false, reason: 'no-api-key', detail: 'ไม่ได้ตั้ง TYPHOON_API_KEY' };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 120_000);

    try {
        const base64 = Buffer.from(png).toString('base64');
        const res = await fetch(TYPHOON_URL, {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: TYPHOON_MODEL,
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: opts.prompt
                                ?? 'อ่านข้อความในเอกสารนี้ตามที่ปรากฏจริง รักษาการขึ้นบรรทัดและการเว้นวรรคไว้ '
                                + 'ห้ามแปลงเลขไทยเป็นเลขอารบิก ห้ามแก้คำผิด ห้ามสรุปหรือเรียบเรียงใหม่',
                        },
                        { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
                    ],
                }],
                max_tokens: opts.maxTokens ?? 8192,
                temperature: 0.1,
            }),
        });

        if (!res.ok) {
            return { ok: false, reason: 'http-error', detail: `${res.status} ${await res.text()}` };
        }

        const data = await res.json() as {
            choices?: { message?: { content?: string }; finish_reason?: string }[];
        };
        const text = data.choices?.[0]?.message?.content ?? '';
        if (!text) return { ok: false, reason: 'empty', detail: 'Typhoon ไม่คืนข้อความ' };

        return { ok: true, text, truncated: data.choices?.[0]?.finish_reason === 'length' };
    } catch (e) {
        if ((e as Error).name === 'AbortError') {
            return { ok: false, reason: 'timeout', detail: `เกิน ${opts.timeoutMs ?? 120_000} ms` };
        }
        return { ok: false, reason: 'exception', detail: String(e) };
    } finally {
        clearTimeout(timer);
    }
}
