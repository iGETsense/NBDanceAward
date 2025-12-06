/**
 * Vercel Edge Function - Firebase Proxy
 * 
 * This runs on Vercel's global edge network (not blocked by Orange)
 * No need for Cloudflare or any external service!
 */

import { NextRequest, NextResponse } from 'next/server';

// Force Edge Runtime (runs on Vercel's edge network, not serverless)
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Firebase URL (server-side only, never exposed to client)
const FIREBASE_DB_URL = 'https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app';

export async function GET(request: NextRequest) {
    const path = request.nextUrl.searchParams.get('path');

    if (!path) {
        return NextResponse.json(
            { success: false, error: 'Missing path parameter' },
            { status: 400 }
        );
    }

    // Validate allowed paths
    const allowedPaths = ['candidates', 'categories', 'candidateCategories', 'votes', 'users', 'transactions', 'withdrawals'];
    const isAllowed = allowedPaths.some(allowed =>
        path === allowed || path.startsWith(`${allowed}/`)
    );

    if (!isAllowed) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized path' },
            { status: 403 }
        );
    }

    try {
        const firebaseUrl = `${FIREBASE_DB_URL}/${path}.json`;

        const response = await fetch(firebaseUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Firebase error: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            data: data || {},
            source: 'vercel-edge'
        });

    } catch (error: any) {
        console.error('[Edge Proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { path, data, method = 'PUT' } = body;

        if (!path) {
            return NextResponse.json(
                { success: false, error: 'Missing path' },
                { status: 400 }
            );
        }

        // Only allow writes to specific paths
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

        const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
        const firebaseUrl = `${FIREBASE_DB_URL}/${normalizedPath}.json`;

        const response = await fetch(firebaseUrl, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        return NextResponse.json({
            success: true,
            data: result,
            source: 'vercel-edge'
        });

    } catch (error: any) {
        console.error('[Edge Proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
