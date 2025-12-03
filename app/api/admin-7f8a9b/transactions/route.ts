/**
 * Admin Transactions API
 * GET /api/admin-7f8a9b/transactions
 * Fetches transactions securely server-side to bypass client-side rules
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';

export async function GET(request: NextRequest) {
    try {
        const transactionsRef = ref(database, 'transactions');
        const transactionsQuery = query(
            transactionsRef,
            orderByChild('createdAt'),
            limitToLast(100)
        );

        const snapshot = await get(transactionsQuery);

        if (!snapshot.exists()) {
            return NextResponse.json({
                success: true,
                transactions: []
            });
        }

        const data = snapshot.val();
        const transactions = Object.entries(data).map(([id, tx]: [string, any]) => ({
            id,
            ...tx,
        })).sort((a: any, b: any) => b.createdAt - a.createdAt);

        return NextResponse.json({
            success: true,
            transactions
        });

    } catch (error: any) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
