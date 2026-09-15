import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

// GET /api/education/articles - Get all articles
export async function GET(request: NextRequest) {
    try {
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const { searchParams } = new URL(request.url);
        const includeAll = searchParams.get('all') === 'true';

        const db = admin.firestore();
        let query: admin.firestore.Query = db.collection('articles')
            .orderBy('createdAt', 'desc')
            .limit(200);

        if (!includeAll) {
            query = query.where('status', '==', 'published');
        }

        const snap = await query.get();
        const articles = snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                slug: data.slug || doc.id,
                title: data.title || '',
                description: data.description || '',
                content: data.content || '',
                category: data.category || 'ทั่วไป',
                coverImage: data.coverImage || '',
                author: data.author || 'Admin',
                publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt || '',
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                views: data.views || 0,
                status: data.status || 'draft',
            };
        });

        return NextResponse.json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}

// POST /api/education/articles - Create new article
export async function POST(request: NextRequest) {
    try {
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
