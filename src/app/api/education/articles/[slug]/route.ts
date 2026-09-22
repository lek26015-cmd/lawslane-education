import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { requireAdminClaim } from '@/lib/admin-guard';

// Helper: find article by slug or ID
async function findArticle(db: admin.firestore.Firestore, slugOrId: string) {
    // Try by ID first
    const docRef = db.collection('articles').doc(slugOrId);
    const docSnap = await docRef.get();
    if (docSnap.exists) return { ref: docRef, data: { id: docSnap.id, ...docSnap.data() } };

    // Try by slug
    const slugSnap = await db.collection('articles').where('slug', '==', slugOrId).limit(1).get();
    if (!slugSnap.empty) {
        const doc = slugSnap.docs[0];
        return { ref: doc.ref, data: { id: doc.id, ...doc.data() } };
    }

    return null;
}

// GET /api/education/articles/[slug] - Get single article
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const result = await findArticle(db, slug);

        if (!result) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        const data = result.data as any;
        return NextResponse.json({
            id: data.id,
            slug: data.slug || data.id,
            title: data.title || '',
            description: data.description || '',
            content: data.content || '',
            category: data.category || 'ทั่วไป',
            coverImage: data.coverImage || '',
            author: data.author || 'Admin',
            publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt || '',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || '',
            views: data.views || 0,
            status: data.status || 'draft',
        });
    } catch (error) {
        console.error('Error fetching article:', error);
        return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
    }
}

// PUT /api/education/articles/[slug] - Update article
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        if (!await requireAdminClaim(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { slug } = await params;
        const body = await request.json();
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const result = await findArticle(db, slug);

        if (!result) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        const updates: Record<string, any> = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const allowedFields = ['title', 'slug', 'description', 'content', 'category', 'coverImage', 'author', 'status'];
        for (const key of allowedFields) {
            if (body[key] !== undefined) updates[key] = body[key];
        }

        // Set publishedAt when first published
        if (body.status === 'published') {
            const existing = result.data as any;
            if (!existing.publishedAt) {
                updates.publishedAt = admin.firestore.FieldValue.serverTimestamp();
            }
        }

        await result.ref.update(updates);

        return NextResponse.json({ id: (result.data as any).id, ...updates });
    } catch (error) {
        console.error('Error updating article:', error);
        return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
    }
}

// DELETE /api/education/articles/[slug] - Delete article
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        if (!await requireAdminClaim(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { slug } = await params;
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const result = await findArticle(db, slug);

        if (!result) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        await result.ref.delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting article:', error);
        return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }
}
