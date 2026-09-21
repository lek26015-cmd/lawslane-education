import { NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/user-auth';

export async function GET(request: Request) {
    const userId = await requireUser(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const admin = await initAdmin();
        if (!admin) {
            // fail closed — เดิมคืนคอร์ส mock 3 ตัวเสมือนซื้อแล้ว ถ้า credential
            // ตั้งค่าผิดบน production จะกลายเป็นปลดล็อกคอนเทนต์ให้ฟรีทันที
            console.error('Firebase Admin not initialized — cannot resolve entitlements');
            return NextResponse.json(
                { error: 'Service temporarily unavailable' },
                { status: 503 }
            );
        }

        // Fetch successful orders
        // Note: statuses might vary, including 'PAID', 'COMPLETED', 'SHIPPING', 'DELIVERED', 'SLIP_UPLOADED' (maybe?)
        // Let's stick to confirmed statuses
        const ordersSnap = await admin.firestore()
            .collection('orders')
            .where('userId', '==', userId)
            // .where('status', 'in', ['PAID', 'COMPLETED', 'SHIPPING', 'DELIVERED']) // 'in' query supports up to 10
            .limit(200)
            .get();

        const items: any[] = [];
        const seenIds = new Set();

        ordersSnap.docs.forEach(doc => {
            const order = doc.data();
            // Filter status in JS to be flexible
            const validStatuses = ['PAID', 'COMPLETED', 'SHIPPING', 'DELIVERED'];
            if (!validStatuses.includes(order.status)) return;

            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    if (!seenIds.has(item.id)) {
                        seenIds.add(item.id);
                        items.push({
                            ...item,
                            purchasedAt: order.createdAt?.toDate ? order.createdAt.toDate().toISOString() : (order.createdAt || new Date().toISOString())
                        });
                    }
                });
            }
        });

        // Sort by purchase date desc
        items.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

        return NextResponse.json(items);

    } catch (error) {
        console.error('Error fetching ebooks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
