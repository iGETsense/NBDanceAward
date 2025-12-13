/**
 * Admin Withdrawals History API
 * GET /api/admin-7f8a9b/withdrawals
 * Fetches withdrawal history securely server-side
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, query, orderByChild, limitToLast, orderByKey } from 'firebase/database';

const FIREBASE_DB_URL = "https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app";

export async function GET(request: NextRequest) {
    try {
        // Get auth token from header
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

        console.log(`[API] Fetching withdrawals.`);

        // FETCH WITHDRAWALS using Firebase SDK
        let withdrawals: any[] = [];
        try {
            const withdrawalsRef = ref(database, 'withdrawals');
            // Fetch last 100 withdrawals using Key (Push IDs are chronological) to avoid missing index on createdAt
            const recentWithdrawalsQuery = query(withdrawalsRef, orderByKey(), limitToLast(100));

            const snapshot = await get(recentWithdrawalsQuery);

            if (snapshot.exists()) {
                const data = snapshot.val();
                withdrawals = Object.entries(data).map(([id, w]: [string, any]) => ({
                    id,
                    ...w,
                })).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
            }
        } catch (dbError: any) {
            console.error('[API] Firebase SDK fetch failed for withdrawals:', dbError);
            throw new Error(`Firebase SDK fetch failed: ${dbError.message}`);
        }

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
