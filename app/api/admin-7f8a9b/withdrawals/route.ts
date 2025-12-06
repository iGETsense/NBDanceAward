/**
 * Admin Withdrawals History API
 * GET /api/admin-7f8a9b/withdrawals
 * Fetches withdrawal history securely server-side
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';

const FIREBASE_DB_URL = "https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app";

export async function GET(request: NextRequest) {
    try {
        // Get auth token from header
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

        console.log(`[API] Fetching withdrawals. Token present: ${!!token}`);

        // Construct URL with auth token if present
        let url = `${FIREBASE_DB_URL}/withdrawals.json?orderBy="createdAt"&limitToLast=100`;
        if (token) {
            url += `&auth=${token}`;
        } else {
            console.warn('[API] No auth token provided for withdrawals fetch');
        }

        // Use REST API for reliability
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API] Firebase REST error: ${response.status} ${response.statusText}`, errorText);
            return NextResponse.json(
                { success: false, error: `Firebase error: ${response.status}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (!data) {
            return NextResponse.json({
                success: true,
                withdrawals: []
            });
        }

        const withdrawals = Object.values(data).sort((a: any, b: any) =>
            (b.createdAt || 0) - (a.createdAt || 0)
        );

        return NextResponse.json({
            success: true,
            withdrawals
        });

    } catch (error: any) {
        console.error('Error fetching withdrawals:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
