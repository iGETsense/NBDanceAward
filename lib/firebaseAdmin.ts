import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const serviceAccount = {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

        if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
            });
            console.log('✅ Firebase Admin initialized successfully');
        } else {
            console.warn('⚠️ Firebase Admin not initialized: Missing environment variables');
        }
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error);
    }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.database() : null;
