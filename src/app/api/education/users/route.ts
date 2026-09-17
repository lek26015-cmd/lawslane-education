import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

// GET /api/education/users - Get all users
export async function GET() {
    try {
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const snap = await db.collection('users').limit(500).get();

        const users = snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || data.displayName || '',
                email: data.email || '',
                role: data.role || 'education_student',
                type: data.type || '',
                status: data.status || 'active',
                photoURL: data.photoURL || '',
                createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
            };
        });

        // Sort by createdAt desc
        users.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
