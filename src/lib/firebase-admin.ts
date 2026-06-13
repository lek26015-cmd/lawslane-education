import 'server-only';
import * as admin from 'firebase-admin';

interface FirebaseAdminAppParams {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

function formatPrivateKey(key: string) {
    return key.replace(/\\n/g, '\n');
}

export function createFirebaseAdminApp(params: FirebaseAdminAppParams) {
    const privateKey = formatPrivateKey(params.privateKey);

    if (admin.apps.length > 0) {
        return admin.app();
    }

    const cert = admin.credential.cert({
        projectId: params.projectId,
        clientEmail: params.clientEmail,
        privateKey: privateKey,
    });

    return admin.initializeApp({
        credential: cert,
        projectId: params.projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
}

export async function initAdmin() {
    const params = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
        privateKey: process.env.FIREBASE_PRIVATE_KEY as string,
    };

    if (!params.projectId || !params.clientEmail || !params.privateKey) {
        // During build-time or when env vars are missing, return existing app or null
        if (admin.apps.length > 0) return admin.app();
        console.warn("Firebase Admin: Required environment variables are missing. Skipping initialization.");
        return null;
    }

    return createFirebaseAdminApp(params);
}
