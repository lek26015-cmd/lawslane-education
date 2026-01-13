import { NextRequest, NextResponse } from 'next/server';

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
            return NextResponse.json({ success: true });
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
