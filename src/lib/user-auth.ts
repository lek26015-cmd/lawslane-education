import 'server-only';
import type { NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/admin-session';

export async function requireUser(request: NextRequest | Request): Promise<string | null> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice('Bearer '.length);
    const admin = await initAdmin();
    if (!admin) return null;

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken.uid;
    } catch {
        return null;
    }
}

// For endpoints shared by both the public site (logged-in student) and the admin panel
export async function requireUserOrAdmin(request: NextRequest | Request): Promise<boolean> {
    if (requireAdmin(request)) return true;
    return (await requireUser(request)) !== null;
}
