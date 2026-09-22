import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { requireAdminClaim } from '@/lib/admin-guard';

// GET /api/education/articles - Get all articles
export async function GET(request: NextRequest) {
    try {
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const { searchParams } = new URL(request.url);
        const includeAll = searchParams.get('all') === 'true';

        const db = admin.firestore();
        
        // Fetch all articles — main lawslane.com articles may not have 'status' field
        const snap = await db.collection('articles').limit(200).get();
        const articles = snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                slug: data.slug || doc.id,
                title: data.title || '',
                description: data.description || data.excerpt || '',
                content: data.content || data.body || '',
                category: data.category || data.tags?.[0] || 'ทั่วไป',
                coverImage: data.coverImage || data.image || data.thumbnail || '',
                author: data.author || data.authorName || 'Lawslane',
                publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt || data.createdAt?.toDate?.()?.toISOString() || '',
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                views: data.views || data.viewCount || 0,
                status: data.status || 'published',
            };
        });

        // Sort by publishedAt desc in JS (avoids composite index requirement)
        articles.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());

        return NextResponse.json(articles);
    } catch (error: any) {
        console.error('Error fetching articles:', error?.message || error);
        return NextResponse.json({ 
            error: 'Failed to fetch articles', 
            detail: error?.message || String(error)
        }, { status: 500 });
    }
}

// POST /api/education/articles - Create new article
export async function POST(request: NextRequest) {
    try {
        if (!await requireAdminClaim(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const body = await request.json();

        if (!body.title || !body.slug || !body.content) {
            return NextResponse.json(
                { error: 'Missing required fields: title, slug, content' },
                { status: 400 }
            );
        }

        const db = admin.firestore();
        const now = admin.firestore.FieldValue.serverTimestamp();

        const docRef = await db.collection('articles').add({
            slug: body.slug,
            title: body.title,
            description: body.description || '',
            content: body.content,
            category: body.category || 'ทั่วไป',
            coverImage: body.coverImage || '',
            author: body.author || 'Admin',
            publishedAt: body.status === 'published' ? now : null,
            status: body.status || 'draft',
            views: 0,
            createdAt: now,
            updatedAt: now,
        });

        return NextResponse.json({ id: docRef.id, ...body }, { status: 201 });
    } catch (error) {
        console.error('Error creating article:', error);
        return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }
}
