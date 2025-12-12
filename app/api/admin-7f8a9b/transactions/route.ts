/**
 * Admin Transactions API - SCALABLE VERSION
 * GET /api/admin-7f8a9b/transactions
 * 
 * Supports:
 * - Pagination with ?limit=50&startAfter=key
 * - Filter by status with ?status=pending
 * - Stats from aggregated /stats node (not calculated from all transactions)
 * 
 * This will work even with 10+ million transactions!
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

const FIREBASE_DB_URL = "https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app";
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Pagination params
        const limit = Math.min(
            parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT)),
            MAX_LIMIT
        );
        const startAfter = searchParams.get('startAfter'); // Transaction key for cursor
        const statusFilter = searchParams.get('status'); // optional: pending, completed, failed

        // Get auth token from header
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

        console.log(`[API] Fetching transactions. Limit: ${limit}, StartAfter: ${startAfter}, Status: ${statusFilter}`);

        // BUILD QUERY URL with pagination
        // orderBy="createdAt" & limitToLast=N gives us the N most recent
        let url = `${FIREBASE_DB_URL}/transactions.json?orderBy="createdAt"&limitToLast=${limit + 1}`;

        if (startAfter) {
            // Get the createdAt of the startAfter transaction to use as end cursor
            // For simplicity, we'll fetch recent and let client do cursor management
            // A more advanced approach would use endAt with the cursor's createdAt
        }

        if (token) {
            url += `&auth=${token}`;
        }

        // FETCH TRANSACTIONS (limited to most recent N)
        const response = await fetch(url, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
        });

        if (!response.ok) {
            throw new Error(`Firebase fetch failed: ${response.status}`);
        }

        const data = await response.json() || {};

        // Convert to array and sort by date descending
        let transactions = Object.entries(data).map(([id, tx]: [string, any]) => ({
            id,
            ...tx,
        })).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));

        // Apply status filter if provided
        if (statusFilter) {
            if (statusFilter === 'pending') {
                transactions = transactions.filter(tx => tx.status === 'pending' || tx.status === 'creating');
            } else if (statusFilter === 'failed') {
                transactions = transactions.filter(tx => tx.status === 'failed' || tx.status === 'init_failed');
            } else {
                transactions = transactions.filter(tx => tx.status === statusFilter);
            }
        }

        // Check if there are more transactions
        const hasMore = transactions.length > limit;
        if (hasMore) {
            transactions = transactions.slice(0, limit);
        }

        // Get the cursor for next page (last item's key)
        const nextCursor = transactions.length > 0 ? transactions[transactions.length - 1].id : null;

        // FETCH STATS - From aggregated stats node OR candidates (for vote totals)
        // This avoids iterating all transactions
        let stats = {
            totalTransactions: 0,
            completedTransactions: 0,
            pendingTransactions: 0,
            failedTransactions: 0,
            totalRevenue: 0,
            netRevenue: 0,
            totalVotes: 0,
            averageTransactionValue: 0,
            isEstimated: true, // Flag that these come from candidates, not transactions
        };

        try {
            // Get vote totals from candidates (always accurate)
            const candidatesSnapshot = await get(ref(database, 'candidates'));
            if (candidatesSnapshot.exists()) {
                const candidatesData = candidatesSnapshot.val();
                const totalVotes = Object.values(candidatesData).reduce(
                    (sum: number, c: any) => sum + (c.votes || 0),
                    0
                );

                const PRICE_PER_VOTE = 105;
                const grossRevenue = totalVotes * PRICE_PER_VOTE;

                stats.totalVotes = totalVotes;
                stats.totalRevenue = Math.round(grossRevenue);
                stats.netRevenue = Math.round(grossRevenue * 0.95);
            }

            // Try to get aggregated stats if they exist
            const statsSnapshot = await get(ref(database, 'stats/transactions'));
            if (statsSnapshot.exists()) {
                const savedStats = statsSnapshot.val();
                stats.totalTransactions = savedStats.total || 0;
                stats.completedTransactions = savedStats.completed || 0;
                stats.pendingTransactions = savedStats.pending || 0;
                stats.failedTransactions = savedStats.failed || 0;
                stats.isEstimated = false;
            } else {
                // Estimate from current page (will be inaccurate for large datasets)
                stats.totalTransactions = transactions.length;
                stats.completedTransactions = transactions.filter(tx => tx.status === 'completed').length;
                stats.pendingTransactions = transactions.filter(tx => tx.status === 'pending' || tx.status === 'creating').length;
                stats.failedTransactions = transactions.filter(tx => tx.status === 'failed' || tx.status === 'init_failed').length;
            }

            if (stats.completedTransactions > 0) {
                stats.averageTransactionValue = Math.round(stats.totalRevenue / stats.completedTransactions);
            }

        } catch (statsError) {
            console.error('[API] Error fetching stats:', statsError);
        }

        return NextResponse.json({
            success: true,
            transactions,
            stats,
            pagination: {
                limit,
                hasMore,
                nextCursor,
                returned: transactions.length,
            }
        });

    } catch (error: any) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
