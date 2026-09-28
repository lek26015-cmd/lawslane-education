import { NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const admin = await initAdmin();

        if (!admin) {
            console.error('Firebase Admin not initialized');
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }

        // Verify the token
        let userId;
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            userId = decodedToken.uid;
        } catch (error) {
            console.error('Error verifying token:', error);
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        // Query exam results
        const snapshot = await admin.firestore()
            .collection('examResults')
            .where('userId', '==', userId)
            // The composite index for this (examResults: userId + createdAt) is defined in
            // Lawslane/firestore.indexes.json but not deployed yet — enabling orderBy() before
            // the index is live would make Firestore reject this query outright. Once the index
            // is deployed (`firebase deploy --only firestore:indexes` from Lawslane/) and built,
            // uncomment this and drop the in-memory sort below.
            // .orderBy('createdAt', 'desc')
            .get();

        const history = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Ensure dates are strings for JSON serialization
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                submittedAt: data.submittedAt?.toDate ? data.submittedAt.toDate().toISOString() : data.submittedAt,
                // Fallback for sorting if needed
                timestamp: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : 0
            };
        });

        // ผลสอบที่ submit-exam บันทึก (examAttempts) — examResults เป็นของระบบเก่า ไม่มีใครเขียนแล้ว
        // map ให้เป็นรูปเดียวกับที่หน้า my-learning อ่าน (examTitle, result.totalScore, createdAt)
        const attemptsSnap = await admin.firestore()
            .collection('examAttempts')
            .where('userId', '==', userId)
            .limit(200)
            .get();
        for (const doc of attemptsSnap.docs) {
            const data = doc.data();
            const created = data.completedAt?.toDate?.() ?? data.createdAt?.toDate?.() ?? null;
            history.push({
                id: doc.id,
                examId: data.examId || '',
                examTitle: data.examTitle || '',
                score: data.totalScore ?? data.score ?? 0,
                passed: data.passed ?? false,
                result: { totalScore: data.totalScore ?? data.score ?? 0 },
                source: 'examAttempts',
                createdAt: created ? created.toISOString() : null,
                submittedAt: created ? created.toISOString() : null,
                timestamp: created ? created.getTime() : 0,
            } as any);
        }

        // Sort in memory to avoid needing composite index immediately
        history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        return NextResponse.json(history);

    } catch (error) {
        console.error('Error fetching student history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
