import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { requireAdminClaim } from '@/lib/admin-guard';

// Helper to get a download URL for Firebase Storage paths
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
                if (!downloadToken) {
                    downloadToken = randomUUID();
                    await file.setMetadata({
                        metadata: { firebaseStorageDownloadTokens: downloadToken },
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
        const rawCoverUrl = data.imageUrl || data.coverUrl || '';
        const signedCoverUrl = await getDownloadCoverUrl(rawCoverUrl);
        
        return NextResponse.json({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            price: data.price || 0,
            coverUrl: signedCoverUrl,
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

// PUT /api/education/books/[id] - Update a book
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await requireAdminClaim(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const body = await request.json();
        const db = admin.firestore();
        const docRef = db.collection('books').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        const updateData: Record<string, any> = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Only update fields that are provided
        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.price !== undefined) updateData.price = body.price;
        if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice;
        if (body.coverUrl !== undefined) updateData.imageUrl = body.coverUrl;
        if (body.author !== undefined) updateData.author = body.author;
        if (body.pageCount !== undefined) updateData.pageCount = body.pageCount;
        if (body.category !== undefined) updateData.category = body.category;
        if (body.type !== undefined) updateData.type = body.type;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.isDigital !== undefined) updateData.isDigital = body.isDigital;

        await docRef.update(updateData);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error updating book:', error);
        return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
    }
}

// DELETE /api/education/books/[id] - Delete a book
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await requireAdminClaim(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const docRef = db.collection('books').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        // Try to delete cover image from Storage (non-blocking)
        const data = doc.data();
        const coverUrl = data?.imageUrl || data?.coverUrl || '';
        if (coverUrl && (coverUrl.includes('firebasestorage.app') || coverUrl.includes('storage.googleapis.com'))) {
            try {
                let filePath = '';
                if (coverUrl.includes('storage.googleapis.com/')) {
                    const parts = coverUrl.split('storage.googleapis.com/');
                    if (parts[1]) {
                        const afterBucket = parts[1];
                        const bucketEnd = afterBucket.indexOf('/');
                        filePath = bucketEnd >= 0 ? afterBucket.substring(bucketEnd + 1) : afterBucket;
                    }
                }
                if (filePath) {
                    const bucket = admin.storage().bucket();
                    await bucket.file(filePath).delete();
                }
            } catch (storageErr) {
                // Non-blocking: Storage deletion may fail (e.g., billing disabled)
                console.warn('Failed to delete cover image (non-blocking):', storageErr);
            }
        }

        // Delete the Firestore document
        await docRef.delete();

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error deleting book:', error);
        return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
    }
}
