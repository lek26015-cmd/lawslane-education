import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

const SETTINGS_DOC = 'education_config';

// GET /api/education/settings
export async function GET() {
    try {
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const doc = await db.collection('settings').doc(SETTINGS_DOC).get();

        if (!doc.exists) {
            return NextResponse.json({});
        }

        return NextResponse.json(doc.data());
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PUT /api/education/settings
export async function PUT(request: NextRequest) {
    try {
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const body = await request.json();
        const db = admin.firestore();

        await db.collection('settings').doc(SETTINGS_DOC).set({
            ...body,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
