import { NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
        const admin = await initAdmin();
        if (!admin) {
            // If admin cannot be initialized (e.g. build time), return empty
            // If admin cannot be initialized (e.g. build time), return mock data for development
            const mockItems = [
                {
                    id: 'course-1',
                    title: 'ติวสรุปกฎหมายแพ่งและพาณิชย์ (ฉบับรวบรัด)',
                    type: 'COURSE',
                    price: 1500,
                    coverUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop",
                    purchasedAt: new Date().toISOString()
                },
                {
                    id: 'course-2',
                    title: 'คอร์สตะลุยโจทย์เนติบัณฑิต ภาค 1',
                    type: 'COURSE',
                    price: 2500,
                    coverUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop',
                    purchasedAt: new Date().toISOString()
                },
                {
                    id: '3',
                    title: 'คู่มือสอบอัยการผู้ช่วย สนามเล็ก',
                    type: 'BOOK',
                    price: 650,
                    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
                    purchasedAt: new Date().toISOString()
                }
            ];
            return NextResponse.json(mockItems, { status: 200 });
        }

        // Fetch successful orders
        // Note: statuses might vary, including 'PAID', 'COMPLETED', 'SHIPPING', 'DELIVERED', 'SLIP_UPLOADED' (maybe?)
        // Let's stick to confirmed statuses
        const ordersSnap = await admin.firestore()
            .collection('orders')
            .where('userId', '==', userId)
            // .where('status', 'in', ['PAID', 'COMPLETED', 'SHIPPING', 'DELIVERED']) // 'in' query supports up to 10
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
