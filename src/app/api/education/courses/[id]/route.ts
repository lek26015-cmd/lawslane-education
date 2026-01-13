import { NextRequest, NextResponse } from 'next/server';
import { getCourseById, updateCourse, deleteCourse } from '@/lib/mock-store';

// GET /api/education/courses/[id] - Get single course
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const course = getCourseById(id);

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
    }
}

// PUT /api/education/courses/[id] - Update course
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updated = updateCourse(id, {
            title: body.title,
            description: body.description,
            price: body.price,
            originalPrice: body.originalPrice,
            coverImage: body.coverImage,
            instructor: body.instructor,
            duration: body.duration,
            lessons: body.lessons,
            level: body.level,
            category: body.category,
            status: body.status
        });

        if (!updated) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating course:', error);
        return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
    }
}

// DELETE /api/education/courses/[id] - Delete course
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const deleted = deleteCourse(id);

        if (!deleted) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
    }
}
