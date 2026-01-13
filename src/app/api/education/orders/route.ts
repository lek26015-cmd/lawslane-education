import { NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as adminSDK from 'firebase-admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, items, totalAmount, shippingInfo, paymentMethod, slipUrl, status, isTestMode } = body;

        const admin = await initAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }

        const db = admin.firestore();
        const batch = db.batch();

        // 1. Create Order
        const orderRef = db.collection('orders').doc();
        batch.set(orderRef, {
            id: orderRef.id,
            userId,
            items,
            totalAmount,
            shippingInfo,
            paymentMethod,
            slipUrl,
            status: status || 'PENDING',
            createdAt: adminSDK.firestore.FieldValue.serverTimestamp(),
            updatedAt: adminSDK.firestore.FieldValue.serverTimestamp()
        });

        await batch.commit();

        return NextResponse.json({ success: true, orderId: orderRef.id });

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
