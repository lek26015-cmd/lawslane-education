import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';

export async function GET(request: NextRequest) {
    const admin = requireAdmin(request);
    return NextResponse.json({ authenticated: !!admin });
}
