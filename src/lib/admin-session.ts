import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

interface AdminSessionPayload {
    email: string;
    exp: number;
}

function getSecret(): string {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) {
        throw new Error('ADMIN_SESSION_SECRET is not set');
    }
    return secret;
}

function sign(data: string): string {
    return createHmac('sha256', getSecret()).update(data).digest('base64url');
}

export function createAdminSessionToken(email: string): string {
    const payload: AdminSessionPayload = { email, exp: Date.now() + SESSION_TTL_MS };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = sign(encodedPayload);
    return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(token: string): AdminSessionPayload | null {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return null;

    const expectedSignature = sign(encodedPayload);
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
        return null;
    }

    try {
        const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8')) as AdminSessionPayload;
        if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
        return payload;
    } catch {
        return null;
    }
}

export function requireAdmin(request: NextRequest | Request): AdminSessionPayload | null {
    const token = 'cookies' in request && typeof (request as NextRequest).cookies?.get === 'function'
        ? (request as NextRequest).cookies.get(ADMIN_SESSION_COOKIE)?.value
        : parseCookieHeader(request.headers.get('cookie'));

    if (!token) return null;
    return verifyAdminSessionToken(token);
}

function parseCookieHeader(cookieHeader: string | null): string | undefined {
    if (!cookieHeader) return undefined;
    const match = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith(`${ADMIN_SESSION_COOKIE}=`));
    return match?.slice(ADMIN_SESSION_COOKIE.length + 1);
}
