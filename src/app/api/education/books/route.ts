import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export async function GET(request: NextRequest) {
    try {
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const snap = await db.collection('books')
            .orderBy('publishedAt', 'desc')
            .limit(200)
            .get();

        const books = snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || '',
                description: data.description || '',
                price: data.price || 0,
                originalPrice: data.originalPrice,
                coverUrl: data.imageUrl || data.coverUrl || '',
                author: data.author || 'Lawslane',
                publisher: data.publisher || '',
                isbn: data.isbn || '',
                pageCount: data.pageCount,
                isDigital: data.isDigital || false,
                stock: data.stock || 0,
                category: data.category || '',
                status: 'published',
                createdAt: data.createdAt?.toDate?.() || data.publishedAt?.toDate?.() || new Date(),
                updatedAt: data.updatedAt?.toDate?.() || new Date(),
            };
        });

        return NextResponse.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
    }
}
