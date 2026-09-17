import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';

// Helper to get a download URL for Firebase Storage paths
// Generates a download token if none exists
async function getDownloadCoverUrl(coverUrl: string): Promise<string> {
    if (!coverUrl) return '';
    if (coverUrl.includes('firebasestorage.app') || coverUrl.includes('storage.googleapis.com')) {
        try {
            let filePath = '';
            const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '';
            
            if (coverUrl.includes('storage.googleapis.com/')) {
                const parts = coverUrl.split('storage.googleapis.com/');
                if (parts[1]) {
                    const afterBucket = parts[1];
                    const bucketEnd = afterBucket.indexOf('/');
                    filePath = bucketEnd >= 0 ? afterBucket.substring(bucketEnd + 1) : afterBucket;
                }
            } else if (coverUrl.includes('firebasestorage.app/')) {
                const parts = coverUrl.split('firebasestorage.app/');
                if (parts[1]) {
                    filePath = parts[1];
                }
            }
            
            if (filePath) {
                const bucket = admin.storage().bucket();
                const file = bucket.file(filePath);
                const [metadata] = await file.getMetadata();
                let downloadToken = metadata?.metadata?.firebaseStorageDownloadTokens;
                
                // If no download token exists, create one
                if (!downloadToken) {
                    downloadToken = randomUUID();
                    await file.setMetadata({
                        metadata: {
                            firebaseStorageDownloadTokens: downloadToken,
                        },
                    });
                }
                
                const encodedPath = encodeURIComponent(filePath);
                return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${downloadToken}`;
            }
        } catch (e) {
            console.warn('Failed to get download URL for:', coverUrl, e);
        }
    }
    return coverUrl;
}

export async function GET(request: NextRequest) {
    try {
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const snap = await db.collection('books')
            .orderBy('publishedAt', 'desc')
            .limit(200)
            .get();

        const books = await Promise.all(snap.docs.map(async (doc) => {
            const data = doc.data();
            const rawCoverUrl = data.imageUrl || data.coverUrl || '';
            const signedCoverUrl = await getDownloadCoverUrl(rawCoverUrl);
            return {
                id: doc.id,
                title: data.title || '',
                description: data.description || '',
                price: data.price || 0,
                originalPrice: data.originalPrice,
                coverUrl: signedCoverUrl,
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
        }));

        return NextResponse.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
    }
}
