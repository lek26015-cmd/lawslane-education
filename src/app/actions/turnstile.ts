'use server';

export async function verifyTurnstileToken(token: string): Promise<{ success: boolean }> {
    // Stub function - Turnstile verification will be configured later
    console.log('Turnstile token verification stub:', token);
    return { success: true };
}
