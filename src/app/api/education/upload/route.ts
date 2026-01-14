import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';

export const config = {
    api: {
        bodyParser: false, // Disable body parsing, we'll handle it manually
    },
};

export async function POST(request: NextRequest) {
    try {
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

        const allowedTypes = type === 'video' ? allowedVideoTypes : allowedDocTypes;

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // Size limits (100MB for video, 10MB for docs)
        const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: `File too large. Max size: ${maxSize / (1024 * 1024)}MB` },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop();
        const filename = `${type}s/${timestamp}-${randomId}.${extension}`;

        // Upload to Firebase Storage
        const bucket = admin.storage().bucket();
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const fileRef = bucket.file(filename);
        await fileRef.save(fileBuffer, {
            metadata: {
                contentType: file.type,
                metadata: {
                    originalName: file.name,
                    uploadedAt: new Date().toISOString()
                }
            }
        });

        // Make the file publicly accessible
        await fileRef.makePublic();

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
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
