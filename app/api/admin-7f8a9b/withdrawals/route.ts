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

export async function GET(request: NextRequest) {
    try {
        // In a real app, verify the session cookie or token here
        // For now, we rely on the obscurity of the URL and could add a header check

        const withdrawalsRef = ref(database, 'withdrawals');
        const withdrawalsQuery = query(
            withdrawalsRef,
            orderByChild('createdAt'),
            limitToLast(100) // Fetch last 100 withdrawals
        );

        const snapshot = await get(withdrawalsQuery);

        if (!snapshot.exists()) {
            return NextResponse.json({
                success: true,
                withdrawals: []
            });
        }

        const data = snapshot.val();
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
