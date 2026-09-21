import 'server-only';

/**
 * Uploads a File to Cloudflare Images and returns its public delivery URL.
 * Shared by /api/education/upload (image case) and the book-cover upload
 * action — both previously (or still, for non-image types) wrote to Firebase
 * Storage, which 403s with Storage billing disabled. See LAWSLANE-PLAN-01 3.3.
 */
export async function uploadFileToCloudflareImages(file: File): Promise<string> {
    const accountId = process.env.R2_ACCOUNT_ID; // Cloudflare Account ID is the same as R2
    const apiToken = process.env.CLOUDFLARE_IMAGES_TOKEN;

    if (!accountId || !apiToken) {
        console.error('Missing Cloudflare Images configuration');
        throw new Error('Cloudflare Images not configured. Please add CLOUDFLARE_IMAGES_TOKEN to .env.local');
    }

    const cfFormData = new FormData();
    cfFormData.append('file', file);

    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
        {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiToken}` },
            body: cfFormData,
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Cloudflare Images Upload Error:', errorData);
        throw new Error(errorData?.errors?.[0]?.message || 'Failed to upload to Cloudflare Images');
    }

    const data = await response.json();
    const variants = data.result?.variants || [];
    const publicUrl = variants.length > 0 ? variants[0] : null;

    if (!publicUrl) {
        throw new Error('No delivery variants found for uploaded image');
    }

    return publicUrl as string;
}
