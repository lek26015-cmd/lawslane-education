import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { requireAdmin } from '@/lib/admin-session';

const IMAGE_RESULTS_PATH = path.join(process.cwd(), 'ข้อสอบเก่า', 'image_extraction_results.json');

interface ImageResult {
    folder: string;
    file: string;
    page: number;
    image_path: string;
    web_path: string;
}

/**
 * Map extracted images to exam questions in Firestore.
 * Each exam's questions get pageImages field with the relevant page screenshots.
 * POST /api/education/map-exam-images
 */
export async function POST(request: NextRequest) {
    try {
        if (!requireAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const app = await initAdmin();
        if (!app) return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });

        const db = admin.firestore();

        if (!fs.existsSync(IMAGE_RESULTS_PATH)) {
            return NextResponse.json({ error: 'Image results file not found' }, { status: 404 });
        }

        const imageResults: ImageResult[] = JSON.parse(fs.readFileSync(IMAGE_RESULTS_PATH, 'utf-8'));

        // Group images by folder+file
        const imagesByExam = new Map<string, ImageResult[]>();
        for (const img of imageResults) {
            const key = `${img.folder}/${img.file}`;
            if (!imagesByExam.has(key)) {
                imagesByExam.set(key, []);
            }
            imagesByExam.get(key)!.push(img);
        }

        // Find matching exams in Firestore by sourceFile
        const snapshot = await db.collection('examSets').get();
        let updated = 0;
        let noMatch = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const sourceFile = data.sourceFile || '';
            const title = data.title || '';

            // Try to find matching images
            let matchKey = '';
            for (const [key, images] of imagesByExam.entries()) {
                const [folder, file] = key.split('/');
                if (sourceFile === file) {
                    matchKey = key;
                    break;
                }
                // Also try matching by folder name in title
                if (title.includes(folder) && title.includes(file.replace('.pdf', ''))) {
                    matchKey = key;
                    break;
                }
            }

            if (!matchKey) {
                noMatch++;
                continue;
            }

            const images = imagesByExam.get(matchKey)!;
            
            // Sort by page number
            images.sort((a, b) => a.page - b.page);

            // Filter out page 0 (cover pages) - keep only question pages
            const questionImages = images.filter(img => img.page > 0);
            
            if (questionImages.length === 0) {
                noMatch++;
                continue;
            }

            // Update examSet with pageImages
            const pageImages = questionImages.map(img => ({
                page: img.page,
                url: img.web_path,
            }));

            await doc.ref.update({
                pageImages: pageImages,
                hasImages: true,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            updated++;
        }

        return NextResponse.json({
            success: true,
            message: `Mapped images to ${updated} exams`,
            examsWithImages: updated,
            examsWithoutMatch: noMatch,
            totalImages: imageResults.length,
            totalExams: snapshot.size,
        });
    } catch (error) {
        console.error('Error mapping images:', error);
        return NextResponse.json({ error: 'Failed to map images', details: String(error) }, { status: 500 });
    }
}
