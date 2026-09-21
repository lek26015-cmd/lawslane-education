import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from '@/lib/admin-session';

// ระบบล็อกอินแอดมินของ education ยังแยกจากแอปอื่น (ดูแผนความปลอดภัย §6 ข้อ 1)
// เป้าหมายระยะถัดไปคือย้ายไปใช้ Firebase Auth + custom claim เหมือนแอปอื่น

// กันเดารหัสแบบ brute force — นับต่อ IP แบบ in-memory
// (พอสำหรับ endpoint เดียว ถ้าต้องการข้ามอินสแตนซ์ค่อยย้ายไป Firestore)
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; first: number }>();

function rateLimited(ip: string): boolean {
    const now = Date.now();
    const rec = attempts.get(ip);
    if (!rec || now - rec.first > WINDOW_MS) {
        attempts.set(ip, { count: 1, first: now });
        return false;
    }
    rec.count += 1;
    return rec.count > MAX_ATTEMPTS;
}

function safeEqual(a: string, b: string): boolean {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
        if (rateLimited(ip)) {
            return NextResponse.json(
                { success: false, error: 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่' },
                { status: 429 }
            );
        }

        // ต้องตั้งค่าใน env เท่านั้น — เดิม fallback เป็น admin@lawlanes.com / admin123
        // ซึ่งถูกพิมพ์โชว์อยู่บนหน้า login ด้วย ถ้า env ไม่ถูกตั้งใน environment ไหน
        // ก็เท่ากับเปิดหลังบ้านทิ้งไว้ด้วยรหัสที่ใครก็รู้
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.error('ADMIN_EMAIL / ADMIN_PASSWORD is not configured — admin login disabled');
            return NextResponse.json(
                { success: false, error: 'ระบบยังไม่ได้ตั้งค่า' },
                { status: 503 }
            );
        }

        if (typeof email === 'string' && typeof password === 'string'
            && safeEqual(email, adminEmail) && safeEqual(password, adminPassword)) {
            const token = createAdminSessionToken(email);
            const response = NextResponse.json({ success: true });
            response.cookies.set(ADMIN_SESSION_COOKIE, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 24 * 60 * 60,
            });
            return response;
        }

        return NextResponse.json(
            { success: false, error: 'Invalid credentials' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
