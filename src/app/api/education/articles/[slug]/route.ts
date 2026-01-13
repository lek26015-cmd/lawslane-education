import { NextRequest, NextResponse } from 'next/server';
import { getArticleBySlug, getArticleById, updateArticle, deleteArticle } from '@/lib/mock-store';

// GET /api/education/articles/[slug] - Get single article
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Try to find by slug first, then by id
        let article = getArticleBySlug(slug);
        if (!article) {
            article = getArticleById(slug);
        }

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        return NextResponse.json(article);
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
        const { slug } = await params;
        const body = await request.json();

        // Find article by slug or id
        let article = getArticleBySlug(slug);
        if (!article) {
            article = getArticleById(slug);
        }

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        const updated = updateArticle(article.id, {
            title: body.title,
            slug: body.slug,
            description: body.description,
            content: body.content,
            category: body.category,
            coverImage: body.coverImage,
            author: body.author,
            status: body.status,
            publishedAt: body.status === 'published' && !article.publishedAt
                ? new Date().toISOString()
                : article.publishedAt
        });

        return NextResponse.json(updated);
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
        const { slug } = await params;

        // Find article by slug or id
        let article = getArticleBySlug(slug);
        if (!article) {
            article = getArticleById(slug);
        }

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        const deleted = deleteArticle(article.id);

        if (!deleted) {
            return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting article:', error);
        return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }
}
