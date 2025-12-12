/**
 * Database Service with Caching
 * 
 * Uses Firebase as the primary database.
 * Includes in-memory caching for improved performance.
 */

// Cache configuration
const CACHE_DURATION_MS = 30000; // 30 seconds cache
const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * Get cached data if available and not expired
 */
function getCachedData(key: string): any | null {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
        return cached.data;
    }
    cache.delete(key);
    return null;
}

/**
 * Set data in cache
 */
function setCachedData(key: string, data: any): void {
    cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Clear cache for a specific key
 */
export function clearCache(key: string): void {
    cache.delete(key);
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
    cache.clear();
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 500
): Promise<T> {
    let lastError: Error = new Error('Unknown error');

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (i < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

/**
 * Read data with optional caching
 * Formerly hybridRead - kept for compatibility but now Firebase-only
 */
export async function hybridRead<T>(
    firebaseFn: () => Promise<T>,
    _unusedAppwriteFn: any, // Kept signature for compatibility
    operationName: string,
    options: { useCache?: boolean } = {}
): Promise<T> {
    const cacheKey = `read_${operationName}`;

    // Check cache first
    if (options.useCache !== false) {
        const cached = getCachedData(cacheKey);
        if (cached !== null) {
            console.log(`💾 [${operationName}] Returned from cache`);
            return cached;
        }
    }

    // Execute Firebase function directly (with internal retries if needed)
    try {
        const data = await retryWithBackoff(firebaseFn, 2, 500);

        // Cache the result
        if (options.useCache !== false) {
            setCachedData(cacheKey, data);
        }

        return data;
    } catch (error) {
        console.error(`🔥 [${operationName}] Firebase read failed:`, error);
        throw error;
    }
}

/**
 * Write data
 * Formerly hybridWrite - kept for compatibility but now Firebase-only
 */
export async function hybridWrite<T>(
    firebaseFn: () => Promise<T>,
    _unusedAppwriteFn: any, // Kept signature for compatibility
    operationName: string,
    _options: any = {}
): Promise<{ data: T; source: string; responseTimeMs: number }> {
    const startTime = Date.now();
    try {
        const data = await retryWithBackoff(firebaseFn, 2, 500);
        const elapsed = Date.now() - startTime;
        console.log(`🔥 [${operationName}] Firebase write success in ${elapsed}ms`);
        return { data, source: 'firebase', responseTimeMs: elapsed };
    } catch (error) {
        console.error(`🔥 [${operationName}] Firebase write failed:`, error);
        throw error;
    }
}

// Deprecated exports kept to prevent import errors
export const withFailover = async (fn: any) => fn();
export const getLastUsedBackend = () => 'firebase';

