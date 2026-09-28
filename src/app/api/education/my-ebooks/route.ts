import { NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/user-auth';
import { isPlaceholderCover } from '@/lib/cover';

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

        // ปกล่าสุดจากตัวสินค้า — item ในออเดอร์เป็นสำเนา ณ ตอนสั่งซื้อ ออเดอร์เก่ามีปก placehold.co
        // (ข้อความ "Lawyer License" บนพื้นเทา) หรือว่างอยู่ แม้แอดมินจะอัปโหลดปกจริงไปแล้ว
        const db = admin.firestore();
        const refs = items
            .filter((item) => typeof item.id === 'string' && item.id)
            .map((item) => db.collection(item.type === 'COURSE' ? 'courses' : 'books').doc(item.id));
        const docs = refs.length > 0 ? await db.getAll(...refs).catch(() => null) : [];
        const currentCover = new Map<string, string>();
        const existing = new Set<string>();
        docs?.forEach((doc) => {
            if (!doc.exists) return;
            const key = `${doc.ref.parent.id}/${doc.id}`;
            existing.add(key);
            const data = doc.data();
            const cover = data?.imageUrl || data?.coverUrl || '';
            if (cover) currentCover.set(key, cover);
        });
        const keyOf = (item: any) => `${item.type === 'COURSE' ? 'courses' : 'books'}/${item.id}`;
        items.forEach((item) => {
            const snapshotCover = typeof item.coverUrl === 'string' && !isPlaceholderCover(item.coverUrl) ? item.coverUrl : '';
            item.coverUrl = currentCover.get(keyOf(item)) || snapshotCover;
        });

        // คลังของฉันแสดงเฉพาะสินค้าที่ยังมีอยู่ — ออเดอร์ตัวอย่างสมัยเริ่มระบบอ้างคอร์ส/หนังสือที่ไม่มีแล้ว
        // (คอลเลกชัน courses ว่าง) ขึ้นเป็นการ์ดภาพสต็อกที่กด "เข้าเรียน" แล้ว 404
        // ประวัติการซื้อทั้งหมดยังดูได้ที่ /profile/orders · อ่านสินค้าไม่สำเร็จ (docs = null) ไม่กรองทิ้ง
        const library = docs ? items.filter((item) => existing.has(keyOf(item))) : items;

        // Sort by purchase date desc
        library.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

        return NextResponse.json(library);

    } catch (error) {
        console.error('Error fetching ebooks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
