import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles, createArticle } from '@/lib/mock-store';

// GET /api/education/articles - Get all articles
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeAll = searchParams.get('all') === 'true';

        // For admin, include all articles (drafts too)
        // For public, only published articles
        const articles = getAllArticles();

        if (includeAll) {
            return NextResponse.json(articles);
        }

        // Filter to only published for public access
        const published = articles.filter(a => a.status === 'published');
        return NextResponse.json(published);
    } catch (error) {
        console.error('Error fetching articles:', error);
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}

// POST /api/education/articles - Create new article
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.title || !body.slug || !body.content) {
            return NextResponse.json(
                { error: 'Missing required fields: title, slug, content' },
                { status: 400 }
            );
        }

        const newArticle = createArticle({
            slug: body.slug,
            title: body.title,
            description: body.description || '',
            content: body.content,
            category: body.category || 'ทั่วไป',
            coverImage: body.coverImage || '',
            author: body.author || 'Admin',
            publishedAt: body.status === 'published' ? new Date().toISOString() : '',
            status: body.status || 'draft'
        });

        return NextResponse.json(newArticle, { status: 201 });
    } catch (error) {
        console.error('Error creating article:', error);
        return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }
}
