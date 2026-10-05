import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { requireUser } from '@/lib/user-auth';
import { consumeEbookDownload, EntitlementError, getEbookUsage, getEntitlement, getOwnedBookIds } from '@/lib/plan-entitlement';
import { watermarkEbook } from '@/lib/ebook-watermark';

// ประทับลายน้ำไฟล์ 3–8MB ใช้เวลาหลายวินาที
export const maxDuration = 60;

/**
 * ลิงก์ดาวน์โหลด E-Book รวมข้อสอบ — ผู้ที่ซื้อเล่มนั้นแล้ว (ออเดอร์ที่ยืนยันสลิปแล้ว) หรือแพ็กเกจที่มีสิทธิ์ freeEbooks (ค่าเริ่มต้น: Pro)
 *
 * ไฟล์เก็บใน Firebase Storage แบบไม่เปิดสาธารณะ (books/{id}.ebookPath ไม่ส่งออกทาง API หนังสือ)
 * จำกัดจำนวนเล่มต่อสัปดาห์ตามสิทธิ์ ebooksPerWeek (ค่าเริ่มต้น Pro = 3 เล่ม · เล่มเดิมในสัปดาห์เดียวกันไม่นับซ้ำ)
 * ทุกครั้งที่โหลดจะสร้างสำเนาเฉพาะคน: แทรกหน้ารองปก (ออกให้ใคร/เงื่อนไข) + ประทับชื่อ/อีเมลและรหัสสำเนาท้ายทุกหน้า
 * (src/lib/ebook-watermark.ts) เก็บที่ ebook-copies/{uid}/{bookId}.pdf (เขียนทับ ไม่งอก) แล้วออก signed URL อายุ 10 นาที
 * ตรวจสิทธิ์ฝั่ง server ทุกครั้ง — แชร์ลิงก์ต่อก็หมดอายุเร็ว
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const uid = await requireUser(request);
    if (!uid) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });

    try {
        const { id } = await params;
        const db = admin.firestore();
        const [bookSnap, entitlement, ownedIds] = await Promise.all([
            db.collection('books').doc(id).get(),
            getEntitlement(db, uid),
            getOwnedBookIds(db, uid),
        ]);
        const owned = ownedIds.includes(id);
        const book = bookSnap.data();
        if (!bookSnap.exists || !book?.ebookPath) {
            return NextResponse.json({ error: 'E-Book เล่มนี้ยังไม่พร้อมให้ดาวน์โหลด' }, { status: 404 });
        }
        if (!owned && !entitlement.entitlements.freeEbooks) {
            return NextResponse.json(
                { error: 'E-Book เล่มนี้ซื้อได้เล่มละ 199 บาท หรือดาวน์โหลดฟรีสำหรับสมาชิก Pro', code: 'plan_required' },
                { status: 403 },
            );
        }

        // เล่มฟรีของ Pro เช็กโควตาก่อนเริ่มงานหนัก (ยังไม่หัก) — หักจริงหลังสร้างสำเนาสำเร็จ
        if (!owned) {
            const limit = entitlement.entitlements.ebooksPerWeek;
            const current = await getEbookUsage(db, uid, limit);
            if (limit !== null && current.used >= limit && !current.bookIds.includes(id)) {
                await consumeEbookDownload(db, uid, id, limit); // throw ebook_quota พร้อมข้อความมาตรฐาน
            }
        }

        const bucket = admin.storage().bucket();
        const [original] = await bucket.file(book.ebookPath).download();
        const authUser = await admin.auth().getUser(uid).catch(() => null);
        const email = authUser?.email || `uid:${uid.slice(0, 8)}`;
        const copyId = crypto.createHash('sha256').update(`${uid}:${id}:${Date.now()}`).digest('hex').slice(0, 8).toUpperCase();
        const stamped = await watermarkEbook(original, {
            holder: authUser?.displayName || email,
            email,
            copyId,
            issuedAt: new Date(),
        });

        const copyPath = `ebook-copies/${uid}/${id}.pdf`;
        const copyFile = bucket.file(copyPath);
        await copyFile.save(Buffer.from(stamped), { contentType: 'application/pdf', resumable: false, metadata: { cacheControl: 'private, max-age=0' } });

        const filename = `${String(book.title || id).replace(/[\\/:*?"<>|]/g, '').trim()}.pdf`;
        const [url] = await copyFile.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 10 * 60 * 1000,
            responseDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
            responseType: 'application/pdf',
        });

        // เล่มที่ซื้อแล้วโหลดได้ไม่จำกัดและไม่กินโควตา Pro · เล่มฟรีของ Pro นับโควตาต่อสัปดาห์ (เล่มเดิมในสัปดาห์เดียวกันไม่นับซ้ำ)
        const usage = owned ? null : await consumeEbookDownload(db, uid, id, entitlement.entitlements.ebooksPerWeek);

        await db.collection('ebookDownloads').add({
            uid,
            bookId: id,
            planId: entitlement.planId,
            via: owned ? 'purchase' : 'plan',
            copyId,
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
