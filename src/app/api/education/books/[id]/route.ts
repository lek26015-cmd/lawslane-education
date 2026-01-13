import { NextRequest, NextResponse } from 'next/server';
import { getBookById, updateBook, deleteBook } from '@/lib/mock-store';

// GET /api/education/books/[id] - Get single book
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const book = getBookById(id);

        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        return NextResponse.json(book);
    } catch (error) {
        console.error('Error fetching book:', error);
        return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
    }
}

// PUT /api/education/books/[id] - Update book
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updated = updateBook(id, {
            title: body.title,
            description: body.description,
            price: body.price,
            originalPrice: body.originalPrice,
            coverImage: body.coverImage,
            author: body.author,
            pages: body.pages,
            category: body.category,
            type: body.type,
            status: body.status
        });

        if (!updated) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating book:', error);
        return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
    }
}

// DELETE /api/education/books/[id] - Delete book
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const deleted = deleteBook(id);

        if (!deleted) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting book:', error);
        return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
    }
}
