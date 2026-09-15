import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const doc = await db.collection('books').doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        const data = doc.data()!;
        return NextResponse.json({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            price: data.price || 0,
            coverUrl: data.imageUrl || data.coverUrl || '',
            author: data.author || 'Lawslane',
            isDigital: data.isDigital || false,
            stock: data.stock || 0,
            category: data.category || '',
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
        });
    } catch (error) {
        console.error('Error fetching book:', error);
        return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
    }
}
