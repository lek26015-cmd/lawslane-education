import { NextRequest, NextResponse } from 'next/server';
import { getBooks, getAllBooks, createBook } from '@/lib/mock-store';

// GET /api/education/books - Get all books
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeAll = searchParams.get('all') === 'true';

        if (includeAll) {
            return NextResponse.json(getAllBooks());
        }

        return NextResponse.json(getBooks());
    } catch (error) {
        console.error('Error fetching books:', error);
        return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
    }
}

// POST /api/education/books - Create new book
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.title) {
            return NextResponse.json(
                { error: 'Missing required field: title' },
                { status: 400 }
            );
        }

        const newBook = createBook({
            title: body.title,
            description: body.description || '',
            price: body.price || 0,
            originalPrice: body.originalPrice,
            coverImage: body.coverImage || '',
            author: body.author || '',
            pages: body.pages || 0,
            category: body.category || 'ทั่วไป',
            type: body.type || 'ebook',
            status: body.status || 'draft'
        });

        return NextResponse.json(newBook, { status: 201 });
    } catch (error) {
        console.error('Error creating book:', error);
        return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
    }
}
