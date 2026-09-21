import { Order } from "@/lib/education-types";

// ดึงออเดอร์ของผู้ใช้ที่ล็อกอินอยู่จาก Firestore ผ่าน API
// (เดิมเรียก getUserOrders() ที่ return ข้อมูล mock)
export async function fetchMyOrders(getIdToken: () => Promise<string>): Promise<Order[]> {
    const token = await getIdToken();
    const res = await fetch('/api/education/orders/mine', {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`โหลดออเดอร์ไม่สำเร็จ (${res.status})`);

    const data = await res.json();
    return (data as any[]).map(o => ({
        ...o,
        createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
        updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
    })) as Order[];
}
