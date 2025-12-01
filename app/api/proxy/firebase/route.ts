/**
 * Firebase Proxy API Route
 * Provides server-side access to Firebase Realtime Database
 * This helps bypass network restrictions (e.g., Orange Cameroon)
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

/**
 * GET /api/proxy/firebase?path=candidates
 * Fetch data from Firebase Realtime Database via server-side proxy
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
            'withdrawals'
        ];

        if (!allowedPaths.includes(path)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized path' },
                { status: 403 }
            );
        }

        console.log(`[Proxy] Fetching Firebase data for path: ${path}`);

        // Fetch data from Firebase
        const snapshot = await get(ref(database, path));

        if (snapshot.exists()) {
            const data = snapshot.val();
            return NextResponse.json({
                success: true,
                data,
                source: 'firebase-proxy'
            });
        } else {
            return NextResponse.json({
                success: true,
                data: {},
                source: 'firebase-proxy'
            });
        }
    } catch (error: any) {
        console.error('[Proxy] Error fetching from Firebase:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch data from Firebase'
            },
            { status: 500 }
        );
    }
}
