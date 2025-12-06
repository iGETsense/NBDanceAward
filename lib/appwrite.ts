import { Client, Databases, Query, ID } from 'appwrite';

const client = new Client();

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

// Collection IDs from environment
export const APPWRITE_CONFIG = {
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DB_ID || 'candidates_db',
    candidatesCollection: process.env.NEXT_PUBLIC_APPWRITE_CANDIDATES_COLLECTION || 'candidates',
    categoriesCollection: process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION || 'categories',
    candidateCategoriesCollection: process.env.NEXT_PUBLIC_APPWRITE_CANDIDATE_CATEGORIES_COLLECTION || 'candidateCategories',
    votesCollection: process.env.NEXT_PUBLIC_APPWRITE_VOTES_COLLECTION || 'votes',
    usersCollection: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION || 'users',
};
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

// Transform Appwrite document to clean format (remove Appwrite-specific fields)
function cleanAppwriteDoc(doc: any): any {
    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...rest } = doc;
    return {
        ...rest,
        id: doc.id || $id,
    };
}

// ============ CANDIDATES ============

export const getAppwriteCandidates = async (databaseId?: string, collectionId?: string) => {
    if (!isAppwriteConfigured()) {
        throw new Error('Appwrite is not configured');
    }

    const dbId = databaseId || APPWRITE_CONFIG.databaseId;
    const collId = collectionId || APPWRITE_CONFIG.candidatesCollection;

    try {
        const response = await databases.listDocuments(
            dbId,
            collId,
            [Query.limit(100)]
        );

        const candidates: Record<string, any> = {};
        response.documents.forEach((doc) => {
            const id = doc.id || doc.$id;
            candidates[id] = cleanAppwriteDoc(doc);
        });

        return candidates;
    } catch (error) {
        console.error('Error fetching candidates from Appwrite:', error);
        throw error;
    }
};

// ============ CATEGORIES ============

export const getAppwriteCategories = async () => {
    if (!isAppwriteConfigured()) {
        throw new Error('Appwrite is not configured');
    }

    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.categoriesCollection,
            [Query.limit(100), Query.orderAsc('order')]
        );

        return response.documents.map(cleanAppwriteDoc);
    } catch (error) {
        console.error('Error fetching categories from Appwrite:', error);
        throw error;
    }
};

// ============ CANDIDATE-CATEGORY LINKS ============

export const getAppwriteCandidateCategories = async () => {
    if (!isAppwriteConfigured()) {
        throw new Error('Appwrite is not configured');
    }

    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.candidateCategoriesCollection,
            [Query.limit(500)]
        );

        return response.documents.map(cleanAppwriteDoc);
    } catch (error) {
        console.error('Error fetching candidate categories from Appwrite:', error);
        throw error;
    }
};

export const getAppwriteCandidatesByCategory = async (categoryId: string) => {
    if (!isAppwriteConfigured()) {
        throw new Error('Appwrite is not configured');
    }

    try {
        // Get links for this category
        const linksResponse = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.candidateCategoriesCollection,
            [Query.equal('categoryId', categoryId), Query.limit(100)]
        );

        const candidateIds = linksResponse.documents.map((doc) => doc.candidateId);

        if (candidateIds.length === 0) {
            return [];
        }

        // Get candidates by IDs
        const candidatesResponse = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.candidatesCollection,
            [Query.equal('id', candidateIds), Query.limit(100)]
        );

        return candidatesResponse.documents.map(cleanAppwriteDoc);
    } catch (error) {
        console.error('Error fetching candidates by category from Appwrite:', error);
        throw error;
    }
};

// ============ VOTES ============

export interface VoteData {
    userId: string;
    candidateId: string;
    voteCount: number;
    paymentMethod: string;
    provider: string;
    transactionId: string;
    status?: string;
    createdAt?: string;
}

export const submitAppwriteVote = async (voteData: VoteData) => {
    if (!isAppwriteConfigured()) {
        throw new Error('Appwrite is not configured');
    }

    try {
        const voteId = `${voteData.userId}_${Date.now()}`;

        // Create vote document
        await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.votesCollection,
            voteId,
            {
                ...voteData,
                status: voteData.status || 'completed',
                createdAt: voteData.createdAt || new Date().toISOString(),
            }
        );

        // Update candidate vote count
        const candidateDoc = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.candidatesCollection,
            voteData.candidateId
        );

        await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.candidatesCollection,
            voteData.candidateId,
            { votes: (candidateDoc.votes || 0) + voteData.voteCount }
        );

        return { success: true, voteId };
    } catch (error) {
        console.error('Error submitting vote to Appwrite:', error);
        return { success: false, error };
    }
};

export const getAppwriteUserVotes = async (userId: string) => {
    if (!isAppwriteConfigured()) {
        throw new Error('Appwrite is not configured');
    }

    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.votesCollection,
            [Query.equal('userId', userId), Query.limit(100)]
        );

        return response.documents.map(cleanAppwriteDoc);
    } catch (error) {
        console.error('Error fetching user votes from Appwrite:', error);
        throw error;
    }
};

// ============ USERS ============

export interface UserData {
    email?: string;
    name?: string;
    phone?: string;
    totalVotes?: number;
    createdAt?: string;
}

export const getAppwriteUser = async (userId: string) => {
    if (!isAppwriteConfigured()) {
        throw new Error('Appwrite is not configured');
    }

    try {
        const doc = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.usersCollection,
            userId
        );
        return cleanAppwriteDoc(doc);
    } catch (error: any) {
        // Return null if user not found
        if (error?.code === 404) {
            return null;
        }
        console.error('Error fetching user from Appwrite:', error);
        throw error;
    }
};

export const createAppwriteUser = async (userId: string, userData: UserData) => {
    if (!isAppwriteConfigured()) {
        throw new Error('Appwrite is not configured');
    }

    try {
        await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.usersCollection,
            userId,
            {
                ...userData,
                totalVotes: userData.totalVotes || 0,
                createdAt: userData.createdAt || new Date().toISOString(),
            }
        );
        return { success: true };
    } catch (error) {
        console.error('Error creating user in Appwrite:', error);
        return { success: false, error };
    }
};

export const updateAppwriteUser = async (userId: string, userData: Partial<UserData>) => {
    if (!isAppwriteConfigured()) {
        throw new Error('Appwrite is not configured');
    }

    try {
        await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.usersCollection,
            userId,
            userData
        );
        return { success: true };
    } catch (error) {
        console.error('Error updating user in Appwrite:', error);
        return { success: false, error };
    }
};

// ============ LEADERBOARD ============

export const getAppwriteLeaderboard = async (limit: number = 10) => {
    if (!isAppwriteConfigured()) {
        throw new Error('Appwrite is not configured');
    }

    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.candidatesCollection,
            [Query.orderDesc('votes'), Query.limit(limit)]
        );

        return response.documents.map(cleanAppwriteDoc);
    } catch (error) {
        console.error('Error fetching leaderboard from Appwrite:', error);
        throw error;
    }
};
