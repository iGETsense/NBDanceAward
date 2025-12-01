import { Client, Databases, Query } from 'appwrite';

const client = new Client();

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

// Only initialize if project ID is available
if (PROJECT_ID) {
    client
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID);
}

export const databases = new Databases(client);

// Helper to check if Appwrite is configured
export const isAppwriteConfigured = () => {
    return !!PROJECT_ID;
};

// Helper to fetch candidates from Appwrite
export const getAppwriteCandidates = async (databaseId: string, collectionId: string) => {
    if (!isAppwriteConfigured()) {
        throw new Error('Appwrite is not configured');
    }

    try {
        const response = await databases.listDocuments(
            databaseId,
            collectionId,
            [Query.limit(100)] // Adjust limit as needed
        );

        // Transform Appwrite documents to match your application's data structure
        // This assumes your Appwrite collection has similar fields to Firebase
        const candidates: Record<string, any> = {};
        response.documents.forEach((doc) => {
            // Use the document ID or a specific field as the key
            const id = doc.id || doc.$id;
            candidates[id] = {
                ...doc,
                id: id,
                // Remove Appwrite specific fields if needed
                $id: undefined,
                $createdAt: undefined,
                $updatedAt: undefined,
                $permissions: undefined,
                $databaseId: undefined,
                $collectionId: undefined,
            };
        });

        return candidates;
    } catch (error) {
        console.error('Error fetching from Appwrite:', error);
        throw error;
    }
};
