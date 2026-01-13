import { NextRequest, NextResponse } from 'next/server';
import { getCourses, getAllCourses, createCourse } from '@/lib/mock-store';

// GET /api/education/courses - Get all courses
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeAll = searchParams.get('all') === 'true';

        if (includeAll) {
            return NextResponse.json(getAllCourses());
        }

        return NextResponse.json(getCourses());
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}

// POST /api/education/courses - Create new course
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.title) {
            return NextResponse.json(
                { error: 'Missing required field: title' },
                { status: 400 }
            );
        }

        const newCourse = createCourse({
            title: body.title,
            description: body.description || '',
            price: body.price || 0,
            originalPrice: body.originalPrice,
            coverImage: body.coverImage || '',
            instructor: body.instructor || '',
            duration: body.duration || '',
            lessons: body.lessons || 0,
            level: body.level || 'beginner',
            category: body.category || 'ทั่วไป',
            status: body.status || 'draft'
        });

        return NextResponse.json(newCourse, { status: 201 });
    } catch (error) {
        console.error('Error creating course:', error);
        return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
    }
}
