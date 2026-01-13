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
            // .orderBy('createdAt', 'desc') // Requires index, removing for now to be safe, or client can sort
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

        // Sort in memory to avoid needing composite index immediately
        history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        return NextResponse.json(history);

    } catch (error) {
        console.error('Error fetching student history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
