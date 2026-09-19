import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from '@/lib/admin-session';

// Simple admin login - credentials stored in environment variables
// In production, use proper authentication (e.g., Firebase Auth, NextAuth)
export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // Get credentials from environment variables
        // Default credentials for development if not set
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@lawlanes.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        if (email === adminEmail && password === adminPassword) {
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
