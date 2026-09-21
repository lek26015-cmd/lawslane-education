import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { randomUUID } from 'crypto';
import { requireUserOrAdmin } from '@/lib/user-auth';
import { uploadFileToCloudflareImages } from '@/lib/cloudflare-images';

export async function POST(request: NextRequest) {
    try {
        if (!(await requireUserOrAdmin(request))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = await initAdmin();

        if (!admin) {
            return NextResponse.json(
                { error: 'Firebase Admin not initialized' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string || 'video';

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
        const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        // ไม่รับ image/svg+xml — SVG รันสคริปต์ได้ ถ้าถูกเสิร์ฟกลับมาแบบ inline
        // จะกลายเป็น stored XSS บน origin ที่เก็บไฟล์
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        let allowedTypes: string[];
        if (type === 'image') {
            allowedTypes = allowedImageTypes;
        } else if (type === 'document') {
            allowedTypes = allowedDocTypes;
        } else {
            allowedTypes = allowedVideoTypes;
        }

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // Size limits
        const maxSizes: Record<string, number> = {
            video: 100 * 1024 * 1024,
            document: 10 * 1024 * 1024,
            image: 10 * 1024 * 1024,
        };
        const maxSize = maxSizes[type] || 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: `File too large. Max size: ${maxSize / (1024 * 1024)}MB` },
                { status: 400 }
            );
        }

        // Images go through Cloudflare Images instead of Firebase Storage —
        // Storage billing is disabled, so any firebasestorage.googleapis.com URL
        // 403s (this was the actual cause of book covers and profile photos
        // silently disappearing). Non-image types (video/document) are unaffected
        // by this bug in the same way and still go to Firebase Storage below.
        // See LAWSLANE-PLAN-01 3.3.
        if (type === 'image') {
            const url = await uploadFileToCloudflareImages(file);
            return NextResponse.json({
                success: true,
                url,
                filename: file.name,
                size: file.size,
                type: file.type
            });
        }

        // Generate unique filename
        // นามสกุลต้องมาจาก MIME ที่ผ่าน allowlist แล้วเท่านั้น
        // เดิมใช้ file.name.split('.').pop() ซึ่งคืนทุกอย่างหลังจุดสุดท้าย รวมทั้ง '/'
        // → ชื่อไฟล์ที่จงใจตั้งมาเขียน object ออกนอกโฟลเดอร์ที่ตั้งใจได้
        const EXTENSION_BY_TYPE: Record<string, string> = {
            'video/mp4': 'mp4',
            'video/webm': 'webm',
            'video/quicktime': 'mov',
            'video/x-msvideo': 'avi',
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        };
        const extension = EXTENSION_BY_TYPE[file.type];
        if (!extension) {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
        }

        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const folder = `${type}s`;
        const filename = `${folder}/${timestamp}-${randomId}.${extension}`;

        // Upload to Firebase Storage
        const bucket = admin.storage().bucket();
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const downloadToken = randomUUID();

        const fileRef = bucket.file(filename);
        await fileRef.save(fileBuffer, {
            metadata: {
                contentType: file.type,
                metadata: {
                    originalName: file.name,
                    uploadedAt: new Date().toISOString(),
                    firebaseStorageDownloadTokens: downloadToken,
                }
            }
        });

        // Construct Firebase download URL with token
        const bucketName = bucket.name;
        const encodedPath = encodeURIComponent(filename);
        const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${downloadToken}`;

        return NextResponse.json({
            success: true,
            url: downloadUrl,
            filename: file.name,
            size: file.size,
            type: file.type
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
