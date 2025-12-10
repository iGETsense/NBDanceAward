/**
 * Secure Database Service (Server-Side Only)
 * 
 * Architecture:
 * Frontend → Next.js API Routes → This Service → Firebase/Edge Proxy
 * 
 * The frontend NEVER connects directly to Firebase.
 * All sensitive URLs are server-side only.
 * 
 * Fallback Chain:
 * 1. Direct Firebase (fastest if server can reach it)
 * 2. Vercel Edge Proxy (uses Vercel's edge network - not blocked)
 */

// Server-side only - these are never exposed to the client
const FIREBASE_DB_URL = 'https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app';

// Vercel Edge Proxy URL (internal API route - no external service needed!)
// This is called from server-side, so we use the internal URL
const getEdgeProxyUrl = () => {
    const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_VERCEL_URL
            ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
            : 'http://localhost:3000';
    return `${baseUrl}/api/edge-proxy`;
};

// Request timeout
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Create an AbortController with timeout
 */
function createTimeoutController(ms: number): { controller: AbortController; timeoutId: NodeJS.Timeout } {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);
    return { controller, timeoutId };
}

/**
 * Fetch from Firebase directly
 */
async function fetchFromFirebase(
    path: string,
    method: string = 'GET',
    data?: any
): Promise<any> {
    const url = `${FIREBASE_DB_URL}${path}.json`;
    const { controller, timeoutId } = createTimeoutController(REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: data ? JSON.stringify(data) : undefined,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Firebase error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Fetch from Vercel Edge Proxy (internal API route)
 */
async function fetchFromEdgeProxy(
    path: string,
    method: string = 'GET',
    data?: any
): Promise<any> {
    const edgeProxyUrl = getEdgeProxyUrl();
    const { controller, timeoutId } = createTimeoutController(REQUEST_TIMEOUT_MS);

    try {
        // For GET requests, use query params
        if (method === 'GET') {
            const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
            const url = `${edgeProxyUrl}?path=${encodeURIComponent(normalizedPath)}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Edge proxy error: ${response.status}`);
            }

            const result = await response.json();
            return result.data;
        }

        // For write requests, use POST body
        const response = await fetch(edgeProxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, data, method }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Edge proxy error: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Secure database fetch with automatic fallback
 * Tries: Firebase Direct → Vercel Edge Proxy
 */
export async function secureDbFetch(
    path: string,
    method: string = 'GET',
    data?: any
): Promise<{ data: any; source: 'firebase' | 'edge-proxy' }> {

    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Try Firebase directly first
    try {
        const result = await fetchFromFirebase(normalizedPath, method, data);
        console.log(`🔥 [${method}] ${normalizedPath} - Firebase direct`);
        return { data: result, source: 'firebase' };
    } catch (firebaseError) {
        console.warn(`⚠️ Firebase direct failed: ${(firebaseError as Error).message}`);
    }

    // Fallback to Vercel Edge Proxy
    try {
        const result = await fetchFromEdgeProxy(normalizedPath, method, data);
        console.log(`🌐 [${method}] ${normalizedPath} - Edge proxy`);
        return { data: result, source: 'edge-proxy' };
    } catch (edgeError) {
        console.error(`❌ Edge proxy failed: ${(edgeError as Error).message}`);
    }

    throw new Error(`All backends failed for ${method} ${normalizedPath}`);
}

/**
 * Convenience methods for common operations
 */
export const secureDb = {
    get: (path: string) => secureDbFetch(path, 'GET'),
    set: (path: string, data: any) => secureDbFetch(path, 'PUT', data),
    update: (path: string, data: any) => secureDbFetch(path, 'PATCH', data),
    delete: (path: string) => secureDbFetch(path, 'DELETE'),
};

/**
 * Get candidates with fallback - returns empty object on failure so API can use static data
 */
export async function getSecureCandidates() {
    try {
        const { data } = await secureDbFetch('/candidates');
        return data || {};
    } catch (error) {
        console.error('[getSecureCandidates] All backends failed, returning empty:', (error as Error).message);
        return {}; // Return empty so API route can fall back to static data
    }
}

/**
 * Get categories with fallback
 */
export async function getSecureCategories() {
    try {
        const { data } = await secureDbFetch('/categories');
        return data || {};
    } catch (error) {
        console.error('[getSecureCategories] All backends failed, returning empty:', (error as Error).message);
        return {};
    }
}

/**
 * Get candidate categories links
 */
export async function getSecureCandidateCategories() {
    try {
        const { data } = await secureDbFetch('/candidateCategories');
        return data || [];
    } catch (error) {
        console.error('[getSecureCandidateCategories] All backends failed, returning empty:', (error as Error).message);
        return [];
    }
}

/**
 * Get all votes
 */
export async function getSecureVotes() {
    const { data } = await secureDbFetch('/votes');
    return data || {};
}

/**
 * Get user by ID
 */
export async function getSecureUser(userId: string) {
    const { data } = await secureDbFetch(`/users/${userId}`);
    return data;
}

/**
 * Create or update user
 */
export async function setSecureUser(userId: string, userData: any) {
    const { data } = await secureDbFetch(`/users/${userId}`, 'PUT', {
        ...userData,
        updatedAt: new Date().toISOString(),
    });
    return data;
}

/**
 * Submit vote (with all related updates)
 */
export async function submitSecureVote(voteData: {
    userId: string;
    candidateId: string;
    voteCount: number;
    paymentMethod: string;
    provider: string;
    transactionId: string;
}) {
    const voteId = `${voteData.userId}_${Date.now()}`;

    // 1. Write vote record
    await secureDbFetch(`/votes/${voteId}`, 'PUT', {
        ...voteData,
        status: 'completed',
        createdAt: new Date().toISOString(),
    });

    // 2. Get current candidate votes
    const { data: candidate } = await secureDbFetch(`/candidates/${voteData.candidateId}`);
    const currentVotes = candidate?.votes || 0;

    // 3. Update candidate vote count
    await secureDbFetch(`/candidates/${voteData.candidateId}`, 'PATCH', {
        votes: currentVotes + voteData.voteCount,
    });

    // 4. Get current user votes
    const { data: user } = await secureDbFetch(`/users/${voteData.userId}`);
    const currentUserVotes = user?.totalVotes || 0;

    // 5. Update user vote count
    await secureDbFetch(`/users/${voteData.userId}`, 'PATCH', {
        totalVotes: currentUserVotes + voteData.voteCount,
    });

    console.log(`✅ Vote recorded: ${voteId}`);
    return { success: true, voteId };
}

/**
 * Get leaderboard
 */
export async function getSecureLeaderboard(limit: number = 10) {
    const { data: candidates } = await secureDbFetch('/candidates');

    if (!candidates) return [];

    return Object.entries(candidates)
        .map(([id, candidate]: [string, any]) => ({ ...candidate, id }))
        .sort((a, b) => (b.votes || 0) - (a.votes || 0))
        .slice(0, limit);
}
