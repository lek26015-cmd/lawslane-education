import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { requireAdminClaim } from '@/lib/admin-guard';

const ALLOWED_STATUSES = ['PENDING', 'PAID', 'REJECTED', 'SHIPPING', 'COMPLETED', 'DELIVERED'];

// PATCH /api/education/orders/[id] - Admin: update order status (e.g. approve payment)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await requireAdminClaim(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await request.json();

        if (!ALLOWED_STATUSES.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });

        const db = admin.firestore();
        const docRef = db.collection('orders').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        await docRef.update({
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, id, status });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
