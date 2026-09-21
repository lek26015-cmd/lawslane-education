import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';

// ใช้เมื่อหนังสือยังไม่มีปกเท่านั้น
//
// เดิมที่นี่มี sanitizeCoverUrl() ที่แทน URL ของ Firebase Storage "ทุกอัน" ด้วย
// placeholder เพราะตอนนั้น Storage ปิด billing อยู่แล้วคืน 403 — ตอนนี้เปิดแล้ว
// (ตรวจเมื่อ 2026-09-22: storage.googleapis.com/.../books/covers/law1003.jpg
// คืน HTTP 200) ฟังก์ชันนั้นจึงกลายเป็นตัวที่ทำให้ปกหายเสียเอง: 16 จาก 20 เล่ม
// แรกใน production ใช้ URL ของ Firebase Storage ทั้งหมด
const FALLBACK_COVER = '/images/lawslane-cover-book.png';


export async function GET(request: NextRequest) {
    try {
        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();
        const snap = await db.collection('books')
            .orderBy('publishedAt', 'desc')
            .limit(200)
            .get();

        const books = snap.docs.map((doc) => {
            const data = doc.data();
            const rawCoverUrl = data.imageUrl || data.coverUrl || '';
            return {
                id: doc.id,
                title: data.title || '',
                description: data.description || '',
                price: data.price || 0,
                originalPrice: data.originalPrice,
                coverUrl: rawCoverUrl || FALLBACK_COVER,

                author: data.author || 'Lawslane',
                publisher: data.publisher || '',
                isbn: data.isbn || '',
                pageCount: data.pageCount,
                isDigital: data.isDigital || false,
                stock: data.stock || 0,
                category: data.category || '',
                status: 'published',
                createdAt: data.createdAt?.toDate?.() || data.publishedAt?.toDate?.() || new Date(),
                updatedAt: data.updatedAt?.toDate?.() || new Date(),
            };
        });

        return NextResponse.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
    }
}
