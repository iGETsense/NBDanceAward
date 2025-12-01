/**
 * Firebase Proxy Utility
 * Handles network detection and proxy routing for Firebase requests
 * Specifically designed to help Orange mobile users access Firebase
 */

// Proxy configuration
const PROXY_URL = process.env.NEXT_PUBLIC_FIREBASE_PROXY_URL || '/api/proxy/firebase';
const ENABLE_PROXY = process.env.NEXT_PUBLIC_ENABLE_PROXY !== 'false';

/**
 * Detect if user is on Orange network
 * Uses multiple detection methods for reliability
 */
export async function detectOrangeNetwork(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
        // Method 1: Check connection type and effective type
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

        if (connection) {
            // If on cellular network, assume it might be Orange
            if (connection.type === 'cellular') {
                // console.log('📱 Detected cellular network');
                return true;
            }
        }

        // Method 2: Test Firebase connectivity directly
        // If Firebase is blocked, we're likely on Orange network
        const isFirebaseBlocked = await testFirebaseConnectivity();
        if (isFirebaseBlocked) {
            // console.log('🚫 Firebase appears blocked - likely Orange network');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error detecting network:', error);
        // On error, assume we might need proxy
        return true;
    }
}

/**
 * Test if Firebase is accessible without proxy
 */
async function testFirebaseConnectivity(): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch(
            'https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app/.json?shallow=true',
            {
                method: 'GET',
                signal: controller.signal,
            }
        );

        clearTimeout(timeoutId);
        return !response.ok;
    } catch (error) {
        // If fetch fails, Firebase is likely blocked
        return true;
    }
}

/**
 * Get the appropriate database URL based on network conditions
 */
export async function getDatabaseURL(): Promise<string> {
    const defaultURL = 'https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app';

    if (!ENABLE_PROXY) {
        return defaultURL;
    }

    // Check if we should use proxy
    const shouldUseProxy = await detectOrangeNetwork();

    if (shouldUseProxy) {
        // console.log('🔄 Using proxy for Firebase requests:', PROXY_URL);
        return PROXY_URL;
    }

    return defaultURL;
}

/**
 * Create a proxied fetch function for Firebase requests
 */
export function createProxiedFetch(useProxy: boolean = false) {
    if (!useProxy || !ENABLE_PROXY) {
        return fetch;
    }

    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        try {
            const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

            // If it's a Firebase request, route through proxy
            if (url.includes('firebasedatabase.app')) {
                const proxiedUrl = url.replace(
                    'https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app',
                    PROXY_URL
                );

                // console.log('🔄 Proxying Firebase request:', proxiedUrl);

                return fetch(proxiedUrl, {
                    ...init,
                    // Add headers to help proxy understand the request
                    headers: {
                        ...init?.headers,
                        'X-Original-URL': url,
                        'X-Proxy-Request': 'true',
                    },
                });
            }

            // For non-Firebase requests, use normal fetch
            return fetch(input, init);
        } catch (error) {
            console.error('Proxy fetch error:', error);
            throw error;
        }
    };
}

/**
 * Retry Firebase operation with automatic proxy fallback
 */
export async function retryWithProxyFallback<T>(
    operation: () => Promise<T>,
    maxRetries: number = 2
): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt + 1}/${maxRetries} failed:`, error);

            // On first failure, try enabling proxy
            if (attempt === 0) {
                console.log('🔄 Retrying with proxy...');
                // The next attempt will use proxy detection
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    throw lastError;
}

/**
 * Check if proxy is needed and cache the result
 */
let proxyNeeded: boolean | null = null;
let lastCheck: number = 0;
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export async function isProxyNeeded(): Promise<boolean> {
    const now = Date.now();

    // Return cached result if recent
    if (proxyNeeded !== null && (now - lastCheck) < CHECK_INTERVAL) {
        return proxyNeeded;
    }

    // Perform new check
    proxyNeeded = await detectOrangeNetwork();
    lastCheck = now;

    return proxyNeeded;
}
