/**
 * Hybrid Database Service with Caching & Performance Optimization
 * 
 * Orchestrates failover between Firebase (primary) and Appwrite (secondary).
 * If Firebase doesn't respond within the timeout, automatically switches to Appwrite.
 * Includes in-memory caching and parallel request optimization.
 */

// Configuration from environment or defaults
export const FAILOVER_TIMEOUT_MS = parseInt(
    process.env.NEXT_PUBLIC_FAILOVER_TIMEOUT_MS || '1500',  // Reduced from 2500ms
    10
);

export const ENABLE_FAILOVER = process.env.NEXT_PUBLIC_ENABLE_FAILOVER !== 'false';

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

export type BackendSource = 'firebase' | 'appwrite' | 'proxy';

export interface HybridResult<T> {
    data: T;
    source: BackendSource;
    responseTimeMs: number;
}

/**
 * Log function for tracking backend usage
 */
function logBackendUsage(operation: string, source: BackendSource, timeMs: number, error?: Error) {
    const emoji = source === 'firebase' ? '🔥' : source === 'appwrite' ? '📦' : '🔄';
    if (error) {
        console.warn(`${emoji} [${operation}] ${source} failed after ${timeMs}ms:`, error.message);
    } else {
        console.log(`${emoji} [${operation}] Fetched from ${source} in ${timeMs}ms`);
    }
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
 * Create a promise that rejects after a timeout
 */
function createTimeoutPromise<T>(ms: number): Promise<T> {
    return new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    );
}

/**
 * Core failover function - tries Firebase first, falls back to Appwrite on timeout/error
 */
export async function withFailover<T>(
    firebaseFn: () => Promise<T>,
    appwriteFn: () => Promise<T>,
    operationName: string,
    options: {
        timeout?: number;
        enableRetry?: boolean;
        proxyFn?: () => Promise<T>;
    } = {}
): Promise<HybridResult<T>> {
    const timeout = options.timeout ?? FAILOVER_TIMEOUT_MS;
    const startTime = Date.now();

    // If failover is disabled, just use Firebase
    if (!ENABLE_FAILOVER) {
        try {
            const firebaseWithRetry = options.enableRetry !== false
                ? () => retryWithBackoff(firebaseFn, 2, 500)
                : firebaseFn;

            const data = await firebaseWithRetry();
            const elapsed = Date.now() - startTime;
            logBackendUsage(operationName, 'firebase', elapsed);
            return { data, source: 'firebase', responseTimeMs: elapsed };
        } catch (error) {
            throw error;
        }
    }

    // Try Firebase with timeout
    try {
        const firebaseWithRetry = options.enableRetry !== false
            ? () => retryWithBackoff(firebaseFn, 2, 300)
            : firebaseFn;

        const data = await Promise.race([
            firebaseWithRetry(),
            createTimeoutPromise<T>(timeout)
        ]);

        const elapsed = Date.now() - startTime;
        logBackendUsage(operationName, 'firebase', elapsed);
        return { data, source: 'firebase', responseTimeMs: elapsed };

    } catch (firebaseError) {
        const firebaseElapsed = Date.now() - startTime;
        logBackendUsage(operationName, 'firebase', firebaseElapsed, firebaseError as Error);

        // Try proxy if provided (server-side Firebase access)
        if (options.proxyFn) {
            try {
                const proxyStart = Date.now();
                const data = await options.proxyFn();
                const elapsed = Date.now() - proxyStart;
                logBackendUsage(operationName, 'proxy', elapsed);
                return { data, source: 'proxy', responseTimeMs: elapsed };
            } catch (proxyError) {
                const proxyElapsed = Date.now() - startTime;
                logBackendUsage(operationName, 'proxy', proxyElapsed, proxyError as Error);
            }
        }

        // Fall back to Appwrite
        try {
            const appwriteStart = Date.now();
            const data = await appwriteFn();
            const elapsed = Date.now() - appwriteStart;
            logBackendUsage(operationName, 'appwrite', elapsed);
            return { data, source: 'appwrite', responseTimeMs: elapsed };
        } catch (appwriteError) {
            const totalElapsed = Date.now() - startTime;
            logBackendUsage(operationName, 'appwrite', totalElapsed, appwriteError as Error);

            // Both failed - throw with context
            throw new Error(
                `[${operationName}] All backends failed. Firebase: ${(firebaseError as Error).message}, Appwrite: ${(appwriteError as Error).message}`
            );
        }
    }
}

/**
 * Simplified version for read operations - just returns the data
 * Includes caching for improved performance
 */
export async function hybridRead<T>(
    firebaseFn: () => Promise<T>,
    appwriteFn: () => Promise<T>,
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
    
    const result = await withFailover(firebaseFn, appwriteFn, operationName);
    
    // Cache the result
    if (options.useCache !== false) {
        setCachedData(cacheKey, result.data);
    }
    
    return result.data;
}

/**
 * For write operations - writes to primary backend only by default
 * Set `writeToAll: true` to write to both backends simultaneously
 */
export async function hybridWrite<T>(
    firebaseFn: () => Promise<T>,
    appwriteFn: () => Promise<T>,
    operationName: string,
    options: {
        writeToAll?: boolean;
        timeout?: number;
    } = {}
): Promise<HybridResult<T>> {
    const timeout = options.timeout ?? FAILOVER_TIMEOUT_MS;
    const startTime = Date.now();

    if (options.writeToAll) {
        // Write to both backends simultaneously
        try {
            const [firebaseResult, appwriteResult] = await Promise.allSettled([
                firebaseFn(),
                appwriteFn()
            ]);

            const elapsed = Date.now() - startTime;

            // Return Firebase result if successful, otherwise Appwrite
            if (firebaseResult.status === 'fulfilled') {
                logBackendUsage(operationName, 'firebase', elapsed);
                if (appwriteResult.status === 'rejected') {
                    console.warn(`⚠️ [${operationName}] Appwrite write failed:`, appwriteResult.reason);
                }
                return { data: firebaseResult.value, source: 'firebase', responseTimeMs: elapsed };
            } else if (appwriteResult.status === 'fulfilled') {
                logBackendUsage(operationName, 'appwrite', elapsed);
                console.warn(`⚠️ [${operationName}] Firebase write failed:`, firebaseResult.reason);
                return { data: appwriteResult.value, source: 'appwrite', responseTimeMs: elapsed };
            } else {
                throw new Error(`Both backends failed: Firebase: ${firebaseResult.reason}, Appwrite: ${appwriteResult.reason}`);
            }
        } catch (error) {
            throw error;
        }
    } else {
        // Write to primary (Firebase) only, failover to Appwrite if needed
        return withFailover(firebaseFn, appwriteFn, operationName, { timeout });
    }
}

/**
 * Track which backend is currently active (for debugging/monitoring)
 */
let lastUsedBackend: BackendSource = 'firebase';

export function getLastUsedBackend(): BackendSource {
    return lastUsedBackend;
}

export function setLastUsedBackend(source: BackendSource) {
    lastUsedBackend = source;
}
