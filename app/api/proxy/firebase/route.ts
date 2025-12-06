/**
 * Firebase Proxy API Route
 * Provides server-side access to Firebase via secure service
 * Uses Cloudflare Worker fallback when Firebase is blocked
 * 
 * Security: No Firebase URLs exposed to frontend
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { secureDbFetch } from '@/lib/secureDatabase';

/**
 * GET /api/proxy/firebase?path=candidates
 * Fetch data from Firebase via secure server-side service
 * Falls back to Cloudflare Worker if direct Firebase fails
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const path = searchParams.get('path');

        if (!path) {
            return NextResponse.json(
                { success: false, error: 'Missing path parameter' },
                { status: 400 }
            );
        }

        // Validate path to prevent unauthorized access
        const allowedPaths = [
            'candidates',
            'categories',
            'candidateCategories',
            'votes',
            'withdrawals',
            'users',
            'transactions'
        ];

        // Check if path starts with an allowed path
        const isAllowed = allowedPaths.some(allowed =>
            path === allowed || path.startsWith(`${allowed}/`)
        );

        if (!isAllowed) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized path' },
                { status: 403 }
            );
        }

        console.log(`[Proxy] Fetching data for path: /${path}`);

        // Use secure database service with Cloudflare fallback
        const { data, source } = await secureDbFetch(`/${path}`);

        return NextResponse.json({
            success: true,
            data: data || {},
            source: source === 'edge-proxy' ? 'edge-proxy' : 'firebase-direct'
        });

    } catch (error: any) {
        console.error('[Proxy] Error fetching data:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch data'
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/proxy/firebase
 * Write data to Firebase via secure server-side service
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { path, data, method = 'PUT' } = body;

        if (!path) {
            return NextResponse.json(
                { success: false, error: 'Missing path parameter' },
                { status: 400 }
            );
        }

        // Validate path - only allow writes to specific paths
        const allowedWritePaths = ['votes', 'users', 'transactions'];
        const isAllowed = allowedWritePaths.some(allowed =>
            path.startsWith(allowed) || path.startsWith(`/${allowed}`)
        );

        if (!isAllowed) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized write path' },
                { status: 403 }
            );
        }

        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        console.log(`[Proxy] Writing data to: ${normalizedPath}`);

        // Use secure database service
        const { data: result, source } = await secureDbFetch(normalizedPath, method, data);

        return NextResponse.json({
            success: true,
            data: result,
            source: source === 'edge-proxy' ? 'edge-proxy' : 'firebase-direct'
        });

    } catch (error: any) {
        console.error('[Proxy] Error writing data:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to write data'
            },
            { status: 500 }
        );
    }
}
