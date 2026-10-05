import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { requireUser } from '@/lib/user-auth';
import { consumeEbookDownload, EntitlementError, getEntitlement } from '@/lib/plan-entitlement';

/**
 * ลิงก์ดาวน์โหลด E-Book รวมข้อสอบ — ให้เฉพาะแพ็กเกจที่มีสิทธิ์ freeEbooks (ค่าเริ่มต้น: Pro)
 *
 * ไฟล์เก็บใน Firebase Storage แบบไม่เปิดสาธารณะ (books/{id}.ebookPath ไม่ส่งออกทาง API หนังสือ)
 * จำกัดจำนวนเล่มต่อสัปดาห์ตามสิทธิ์ ebooksPerWeek (ค่าเริ่มต้น Pro = 3 เล่ม · เล่มเดิมในสัปดาห์เดียวกันไม่นับซ้ำ)
 * ตรวจสิทธิ์ฝั่ง server ทุกครั้งแล้วออก signed URL อายุ 10 นาที — แชร์ลิงก์ต่อก็หมดอายุเร็ว
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const uid = await requireUser(request);
    if (!uid) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });

    try {
        const { id } = await params;
        const db = admin.firestore();
        const [bookSnap, entitlement] = await Promise.all([db.collection('books').doc(id).get(), getEntitlement(db, uid)]);
        const book = bookSnap.data();
        if (!bookSnap.exists || !book?.ebookPath) {
            return NextResponse.json({ error: 'E-Book เล่มนี้ยังไม่พร้อมให้ดาวน์โหลด' }, { status: 404 });
        }
        if (!entitlement.entitlements.freeEbooks) {
            return NextResponse.json(
                { error: 'ดาวน์โหลด E-Book ได้เฉพาะสมาชิก Pro', code: 'plan_required' },
                { status: 403 },
            );
        }

        const filename = `${String(book.title || id).replace(/[\\/:*?"<>|]/g, '').trim()}.pdf`;
        const [url] = await admin.storage().bucket().file(book.ebookPath).getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 10 * 60 * 1000,
            responseDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
            responseType: 'application/pdf',
        });

        // ใช้โควตาหลังสร้างลิงก์สำเร็จ — ถ้าเกินลิมิตจะไม่ส่งลิงก์ออกไป
        const usage = await consumeEbookDownload(db, uid, id, entitlement.entitlements.ebooksPerWeek);

        await db.collection('ebookDownloads').add({
            uid,
            bookId: id,
            planId: entitlement.planId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }).catch(() => undefined);

        return NextResponse.json({ url, usage }, { headers: { 'Cache-Control': 'private, no-store' } });
    } catch (error) {
        if (error instanceof EntitlementError) {
            return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
        }
        console.error('Error creating ebook download link:', error);
        return NextResponse.json({ error: 'สร้างลิงก์ดาวน์โหลดไม่สำเร็จ กรุณาลองใหม่' }, { status: 500 });
    }
}
