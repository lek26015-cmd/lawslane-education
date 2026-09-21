'use server';

import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-session';
import { uploadFileToCloudflareImages } from '@/lib/cloudflare-images';

// Book covers were previously only ever pasted as raw URLs, and any admin who
// pasted a Firebase Storage URL got a 403 once Storage billing was disabled
// (sanitizeCoverUrl in api/education/books/route.ts silently swaps those for a
// placeholder). This gives admins an actual working upload path instead —
// mirrors lawslane-admin's action of the same name, which already uses this
// for ads/landing pages. See LAWSLANE-PLAN-01 3.3.
export async function uploadToCloudflareImages(formData: FormData) {
    const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
    if (!token || !verifyAdminSessionToken(token)) {
        throw new Error('Unauthorized');
    }

    const file = formData.get('file') as File;
    if (!file) {
        throw new Error('No file provided');
    }

    return uploadFileToCloudflareImages(file);
}
