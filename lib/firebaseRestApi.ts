/**
 * Firebase REST API Client
 * 
 * Uses Firebase Realtime Database REST API instead of SDK
 * Works through any network (including Orange)
 * No SDK blocking issues
 * 100% reliable fallback
 */

const FIREBASE_DB_URL = 'https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app';

/**
 * Fetch data from Firebase using REST API
 */
export async function fetchFirebaseRest<T>(path: string): Promise<T | null> {
    try {
        const url = `${FIREBASE_DB_URL}${path}.json`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Firebase REST API error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`❌ Firebase REST API fetch failed for ${path}:`, error);
        throw error;
    }
}

/**
 * Write data to Firebase using REST API
 */
export async function writeFirebaseRest<T>(path: string, data: T): Promise<T> {
    try {
        const url = `${FIREBASE_DB_URL}${path}.json`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Firebase REST API error: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(`❌ Firebase REST API write failed for ${path}:`, error);
        throw error;
    }
}

/**
 * Update data in Firebase using REST API
 */
export async function updateFirebaseRest<T>(path: string, data: Partial<T>): Promise<T> {
    try {
        const url = `${FIREBASE_DB_URL}${path}.json`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Firebase REST API error: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(`❌ Firebase REST API update failed for ${path}:`, error);
        throw error;
    }
}

/**
 * Delete data from Firebase using REST API
 */
export async function deleteFirebaseRest(path: string): Promise<void> {
    try {
        const url = `${FIREBASE_DB_URL}${path}.json`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Firebase REST API error: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ Firebase REST API delete failed for ${path}:`, error);
        throw error;
    }
}

/**
 * Get all candidates using REST API
 */
export async function getCandidatesRest(): Promise<Record<string, any>> {
    const data = await fetchFirebaseRest<Record<string, any>>('/candidates');
    return data || {};
}

/**
 * Get all categories using REST API
 */
export async function getCategoriesRest(): Promise<Record<string, any>> {
    const data = await fetchFirebaseRest<Record<string, any>>('/categories');
    return data || {};
}

/**
 * Get all votes using REST API
 */
export async function getVotesRest(): Promise<Record<string, any>> {
    const data = await fetchFirebaseRest<Record<string, any>>('/votes');
    return data || {};
}

/**
 * Get user votes using REST API
 */
export async function getUserVotesRest(userId: string): Promise<Record<string, any>> {
    const allVotes = await getVotesRest();
    const userVotes: Record<string, any> = {};

    for (const [voteId, vote] of Object.entries(allVotes)) {
        if ((vote as any).userId === userId) {
            userVotes[voteId] = vote;
        }
    }

    return userVotes;
}

/**
 * Submit vote using REST API
 */
export async function submitVoteRest(voteData: {
    userId: string;
    candidateId: string;
    voteCount: number;
    paymentMethod: string;
    provider: string;
    transactionId: string;
}): Promise<{ success: boolean; voteId: string }> {
    try {
        const voteId = `${voteData.userId}_${Date.now()}`;

        // Write vote
        await writeFirebaseRest(`/votes/${voteId}`, {
            ...voteData,
            status: 'completed',
            createdAt: new Date().toISOString(),
        });

        // Update candidate vote count
        const candidates = await getCandidatesRest();
        const candidate = candidates[voteData.candidateId];
        const currentVotes = candidate?.votes || 0;

        await updateFirebaseRest(`/candidates/${voteData.candidateId}`, {
            votes: currentVotes + voteData.voteCount,
        });

        // Update user vote count
        const users = await fetchFirebaseRest<Record<string, any>>('/users');
        const user = users?.[voteData.userId];
        const currentUserVotes = user?.totalVotes || 0;

        await updateFirebaseRest(`/users/${voteData.userId}`, {
            totalVotes: currentUserVotes + voteData.voteCount,
        });

        console.log(`✅ Vote submitted via REST API: ${voteId}`);
        return { success: true, voteId };
    } catch (error) {
        console.error('❌ Error submitting vote via REST API:', error);
        return { success: false, voteId: '', error };
    }
}

/**
 * Get user using REST API
 */
export async function getUserRest(userId: string): Promise<any | null> {
    const users = await fetchFirebaseRest<Record<string, any>>('/users');
    return users?.[userId] || null;
}

/**
 * Create user using REST API
 */
export async function createUserRest(userId: string, userData: any): Promise<any> {
    return writeFirebaseRest(`/users/${userId}`, {
        ...userData,
        createdAt: new Date().toISOString(),
        totalVotes: 0,
    });
}

/**
 * Update user using REST API
 */
export async function updateUserRest(userId: string, userData: any): Promise<any> {
    return updateFirebaseRest(`/users/${userId}`, {
        ...userData,
        updatedAt: new Date().toISOString(),
    });
}

/**
 * Get leaderboard using REST API
 */
export async function getLeaderboardRest(limit: number = 10): Promise<any[]> {
    const candidates = await getCandidatesRest();

    const leaderboard = Object.entries(candidates)
        .map(([id, candidate]) => ({
            ...candidate,
            id,
        }))
        .sort((a, b) => (b.votes || 0) - (a.votes || 0))
        .slice(0, limit);

    return leaderboard;
}
