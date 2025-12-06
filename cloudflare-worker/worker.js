/**
 * Cloudflare Worker - Secure Firebase Proxy
 * 
 * Deployment:
 * 1. Go to dash.cloudflare.com → Workers & Pages
 * 2. Create Worker → Paste this code
 * 3. Deploy → Copy your worker URL
 * 4. Add to Vercel: CLOUDFLARE_WORKER_URL=https://your-worker.workers.dev
 * 
 * Security:
 * - Firebase URL is hardcoded (not secret - public database)
 * - No API keys exposed
 * - CORS restricted to your domains
 */

// Firebase Realtime Database URL (public, read-only for unauthenticated)
const FIREBASE_DB_URL = 'https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app';

// Allowed origins for CORS (add your domains)
const ALLOWED_ORIGINS = [
    'https://nbdanceaward.vercel.app',
    'https://nbdanceaward.com',
    'http://localhost:3000',
    'http://localhost:3001',
];

function getCorsHeaders(origin) {
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
    };
}

export default {
    async fetch(request, env, ctx) {
        const origin = request.headers.get('Origin') || '';
        const corsHeaders = getCorsHeaders(origin);

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);

        // Health check endpoint
        if (url.pathname === '/health') {
            return new Response(JSON.stringify({
                status: 'ok',
                service: 'Firebase Proxy',
                timestamp: new Date().toISOString()
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Strip /api/firebase prefix if present
        let path = url.pathname;
        if (path.startsWith('/api/firebase')) {
            path = path.replace('/api/firebase', '');
        }

        // Ensure path starts with /
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // Build Firebase URL
        const firebaseUrl = `${FIREBASE_DB_URL}${path}.json${url.search}`;

        try {
            // Forward the request to Firebase
            const fetchOptions = {
                method: request.method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            // Include body for non-GET requests
            if (request.method !== 'GET' && request.method !== 'HEAD') {
                fetchOptions.body = await request.text();
            }

            const response = await fetch(firebaseUrl, fetchOptions);
            const data = await response.text();

            return new Response(data, {
                status: response.status,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'X-Proxy-Source': 'cloudflare-worker',
                },
            });

        } catch (error) {
            console.error('Proxy error:', error);
            return new Response(JSON.stringify({
                error: 'Proxy error',
                message: error.message
            }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
    },
};
