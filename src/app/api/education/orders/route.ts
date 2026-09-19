import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as adminSDK from 'firebase-admin';
import { requireUser } from '@/lib/user-auth';
import { requireAdmin } from '@/lib/admin-session';

interface OrderItemInput {
    id: string;
    type: 'BOOK' | 'COURSE' | 'EXAM';
    quantity?: number;
}

const COLLECTION_BY_TYPE: Record<string, string> = {
    BOOK: 'books',
    COURSE: 'courses',
};

// GET /api/education/orders?all=true - Admin: list all orders
export async function GET(request: NextRequest) {
    if (!requireAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const admin = await initAdmin();
        if (!admin) return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });

        const snap = await admin.firestore()
            .collection('orders')
            .orderBy('createdAt', 'desc')
            .limit(500)
            .get();

        const orders = snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
            };
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/education/orders - Create an order for the logged-in user
export async function POST(request: NextRequest) {
    try {
        const uid = await requireUser(request);
        if (!uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { items, shippingInfo, paymentMethod, slipUrl } = body as {
            items: OrderItemInput[];
            shippingInfo?: unknown;
            paymentMethod?: string;
            slipUrl?: string;
        };

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'items is required' }, { status: 400 });
        }

        const admin = await initAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }

        const db = admin.firestore();

        // Look up the real price/title for every item server-side —
        // never trust price or totalAmount from the client.
        const resolvedItems = [];
        for (const item of items) {
            const collection = COLLECTION_BY_TYPE[item.type];
            if (!collection) {
                return NextResponse.json({ error: `Unsupported item type: ${item.type}` }, { status: 400 });
            }

            const doc = await db.collection(collection).doc(item.id).get();
            if (!doc.exists) {
                return NextResponse.json({ error: `Item not found: ${item.id}` }, { status: 400 });
            }

            const data = doc.data()!;
            const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
            resolvedItems.push({
                id: doc.id,
                type: item.type,
                title: data.title || '',
                price: Number(data.price) || 0,
                coverUrl: data.coverUrl || data.imageUrl || '',
                quantity,
            });
        }

        const totalAmount = resolvedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const orderRef = db.collection('orders').doc();
        await orderRef.set({
            id: orderRef.id,
            userId: uid,
            items: resolvedItems,
            totalAmount,
            shippingInfo: shippingInfo || null,
            paymentMethod: paymentMethod || 'bank-transfer',
            slipUrl: slipUrl || '',
            // Always starts PENDING — an admin must verify the payment slip
            // and approve the order (PATCH /api/education/orders/[id]) before
            // it counts as paid and unlocks content.
            status: 'PENDING',
            createdAt: adminSDK.firestore.FieldValue.serverTimestamp(),
            updatedAt: adminSDK.firestore.FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, orderId: orderRef.id });

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
