import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

// GET /api/education/courses/[id] - Get single course
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const doc = await db.collection('courses').doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const data = doc.data()!;
        return NextResponse.json({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            price: data.price || 0,
            originalPrice: data.originalPrice,
            coverUrl: data.coverUrl || data.imageUrl || '',
            instructor: data.instructor || { name: 'Lawslane' },
            totalDurationMinutes: data.totalDurationMinutes || 0,
            totalLessons: data.totalLessons || 0,
            level: data.level || 'beginner',
            category: data.category || 'ทั่วไป',
            status: data.status || 'draft',
            modules: data.modules || [],
            linkedExamIds: data.linkedExamIds || [],
            enrolledCount: data.enrolledCount || 0,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || '',
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || '',
        });
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
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const docRef = db.collection('courses').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const updates: Record<string, any> = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const allowedFields = [
            'title', 'description', 'price', 'originalPrice', 'coverUrl',
            'instructor', 'totalDurationMinutes', 'totalLessons', 'level',
            'category', 'status', 'modules', 'linkedExamIds'
        ];
        for (const key of allowedFields) {
            if (body[key] !== undefined) updates[key] = body[key];
        }

        await docRef.update(updates);

        return NextResponse.json({ id, ...updates });
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
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const docRef = db.collection('courses').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        await docRef.delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
    }
}
