import 'server-only';
import type { NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

/**
 * ด่านตรวจสิทธิ์แอดมินของ education — อิง Firebase custom claim
 *
 * แทนที่ lib/admin-session.ts ซึ่งเป็นระบบ email/password แยกต่างหากของแอปนี้
 * (ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_SESSION_SECRET ใน env) ตอนรวมหลังบ้าน
 * Module 6 — ทุกแอปในระบบใช้ custom claim เป็นแหล่งความจริงเดียวแล้ว
 *
 * ⚠️ จงใจ "ไม่" อ่าน users/{uid}.role จาก Firestore เหมือนกับ auth-guard ของ
 *    lawslane-admin: ผู้ใช้เขียน document ตัวเองได้ในหลายฟิลด์ จึงเชื่อไม่ได้
 *
 * หน้าจัดการทั้งหมดย้ายไป admin.lawslane.com แล้ว ตัวนี้เหลือไว้กัน endpoint
 * ที่ยังอยู่ในรีโปนี้ (เช่น settings, orders) ไม่ให้ใครก็เรียกได้
 */
export async function requireAdminClaim(request: NextRequest | Request): Promise<boolean> {
    const app = await initAdmin();
    if (!app) return false;

    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        try {
            const token = await app.auth().verifyIdToken(authHeader.slice('Bearer '.length), true);
            return tokenIsAdmin(token);
        } catch {
            return false;
        }
    }

    // session cookie ที่แชร์ทั้งระบบ (ตั้งโดย lawslane-admin / Lawslane)
    const cookieHeader = request.headers.get('cookie');
    const sessionCookie = cookieHeader
        ?.split(';')
        .map(c => c.trim())
        .find(c => c.startsWith('session='))
        ?.slice('session='.length);

    if (!sessionCookie) return false;

    try {
        const token = await app.auth().verifySessionCookie(sessionCookie, true);
        return tokenIsAdmin(token);
    } catch {
        return false;
    }
}

function tokenIsAdmin(token: DecodedIdToken): boolean {
    return token.admin === true || token.role === 'admin' || token.su === true || token.superAdmin === true;
}
