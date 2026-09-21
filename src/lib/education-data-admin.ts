'use server';

import { initAdmin } from './firebase-admin';
import { Book } from './education-types';

export async function getBookById(id: string): Promise<Book | null> {
    // First try to get from Firestore
    const admin = await initAdmin();
    if (admin) {
        const doc = await admin.firestore().collection('books').doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                publishedAt: data?.publishedAt?.toDate ? data.publishedAt.toDate() : (data?.publishedAt instanceof Date ? data.publishedAt : undefined),
                createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
            } as Book;
        }
    }

    // No mock fallback
    return null;
}

export async function getAllBooks(limitCount?: number): Promise<Book[]> {
    const admin = await initAdmin();
    if (admin) {
        let query: FirebaseFirestore.Query = admin.firestore().collection('books');
        if (limitCount) {
            query = query.limit(limitCount);
        }
        const snapshot = await query.get();
        if (snapshot.docs.length > 0) {
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    publishedAt: data?.publishedAt?.toDate ? data.publishedAt.toDate() : (data?.publishedAt instanceof Date ? data.publishedAt : undefined),
                    createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                    updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
                } as Book;
            });
        }
    }

    // No mock fallback
    return [];
}
