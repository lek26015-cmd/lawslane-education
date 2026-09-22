import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { requireAdminClaim } from '@/lib/admin-guard';

// GET /api/education/courses - Get all courses
export async function GET(request: NextRequest) {
    try {
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const { searchParams } = new URL(request.url);
        const includeAll = searchParams.get('all') === 'true';

        if (includeAll && !await requireAdminClaim(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = admin.firestore();
        let query: admin.firestore.Query = db.collection('courses')
            .orderBy('createdAt', 'desc')
            .limit(200);

        if (!includeAll) {
            query = query.where('status', '==', 'published');
        }

        const snap = await query.get();
        const courses = snap.docs.map(doc => {
            const data = doc.data();
            return {
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
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            };
        });

        return NextResponse.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}

// POST /api/education/courses - Create new course
export async function POST(request: NextRequest) {
    try {
        if (!await requireAdminClaim(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const body = await request.json();

        if (!body.title) {
            return NextResponse.json(
                { error: 'Missing required field: title' },
                { status: 400 }
            );
        }

        const db = admin.firestore();
        const now = admin.firestore.FieldValue.serverTimestamp();

        const docRef = await db.collection('courses').add({
            title: body.title,
            description: body.description || '',
            price: body.price || 0,
            originalPrice: body.originalPrice,
            coverUrl: body.coverUrl || '',
            instructor: body.instructor || { name: 'Unknown' },
            totalDurationMinutes: body.totalDurationMinutes || 0,
            totalLessons: body.totalLessons || 0,
            level: body.level || 'beginner',
            category: body.category || 'ทั่วไป',
            status: body.status || 'draft',
            modules: body.modules || [],
            linkedExamIds: body.linkedExamIds || [],
            enrolledCount: 0,
            createdAt: now,
            updatedAt: now,
        });

        return NextResponse.json({ id: docRef.id, ...body }, { status: 201 });
    } catch (error) {
        console.error('Error creating course:', error);
        return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
    }
}
