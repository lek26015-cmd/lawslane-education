import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/user-auth';

// GET /api/education/orders/mine — ออเดอร์ของผู้ใช้ที่ล็อกอินอยู่
//
// เดิมหน้า /profile/orders เรียก getUserOrders() ใน lib/education-data-admin.ts
// ซึ่ง return ออเดอร์ mock ฝังไว้ (ORD-202601001 "สมชาย รักเรียน") ให้ผู้ใช้
// ทุกคนเห็นเหมือนกันหมด — endpoint นี้อ่านจาก Firestore collection `orders`
// โดยกรองด้วย uid ที่ verify มาจาก id token
export async function GET(request: NextRequest) {
    try {
        const uid = await requireUser(request);
        if (!uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = await initAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }

        const snap = await admin.firestore()
            .collection('orders')
            .where('userId', '==', uid)
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

        const orders = snap.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
            };
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
