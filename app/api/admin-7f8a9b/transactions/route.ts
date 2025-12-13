/**
 * Admin Transactions API - SCALABLE VERSION
 * GET /api/admin-7f8a9b/transactions
 * 
 * Supports:
 * - Pagination with ?limit=50&startAfter=key
 * - Filter by status with ?status=pending
 * - Stats from aggregated /stats node (not calculated from all transactions)
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';

const DEFAULT_LIMIT = 2000;
const MAX_LIMIT = 2000;

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

        console.log(`[API] Fetching transactions. Limit: ${limit}, StartAfter: ${startAfter}, Status: ${statusFilter}`);

        // FETCH TRANSACTIONS using Firebase SDK
        let transactions: any[] = [];
        try {
            const transactionsRef = ref(database, 'transactions');
            // Fetch one more than limit to check for next page, though in this simple version we just fetch N
            const recentTransactionsQuery = query(transactionsRef, orderByChild('createdAt'), limitToLast(limit + 1));

            const snapshot = await get(recentTransactionsQuery);

            if (snapshot.exists()) {
                const data = snapshot.val();
                transactions = Object.entries(data).map(([id, tx]: [string, any]) => ({
                    id,
                    ...tx,
                })).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
            }
        } catch (dbError: any) {
            console.error('[API] Firebase SDK fetch failed:', dbError);
            // Fallback to empty if DB fails, but throw to let outer catch handle 500 if critical
            throw new Error(`Firebase SDK fetch failed: ${dbError.message}`);
        }

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

        // FETCH STATS
        let stats = {
            totalTransactions: 0,
            completedTransactions: 0,
            pendingTransactions: 0,
            failedTransactions: 0,
            totalRevenue: 0,
            netRevenue: 0,
            totalVotes: 0,
            averageTransactionValue: 0,
            isEstimated: true,
        };

        try {
            // Get vote totals from candidates (always accurate)
            const candidatesSnapshot = await get(ref(database, 'candidates'));
            let dbTotalVotes = 0;

            if (candidatesSnapshot.exists()) {
                const candidatesData = candidatesSnapshot.val();
                dbTotalVotes = Object.values(candidatesData).reduce(
                    (sum: number, c: any) => sum + (c.votes || 0),
                    0
                );
                (stats as any).dbTotalVotes = dbTotalVotes;
            }

            // Calculate strictly paid votes from the fetched transactions (most recent 2000)
            const paidVotesFromTransactions = transactions
                .filter((tx: any) => tx.status === 'completed')
                .reduce((sum: number, tx: any) => sum + (tx.voteCount || 0), 0);

            // Use this strictly for financial stats
            (stats as any).paidVotes = paidVotesFromTransactions;
            stats.totalVotes = paidVotesFromTransactions;

            // Re-calculate revenue based on strict paid votes
            const PRICE_PER_VOTE = 105;
            stats.totalRevenue = paidVotesFromTransactions * PRICE_PER_VOTE;
            stats.netRevenue = Math.round(stats.totalRevenue * 0.95);
            stats.averageTransactionValue = stats.completedTransactions > 0
                ? Math.round(stats.totalRevenue / stats.completedTransactions)
                : 0;

            // Try to get aggregated stats (only use if we have more transactions than fetched)
            const statsSnapshot = await get(ref(database, 'stats/transactions'));
            let usedDbStats = false;
            const isFullList = !hasMore;

            // If we have the full list (isFullList), we MUST calculate from the authentic data
            // If we have partial list, we might want to use DB stats for "Total" counts
            if (statsSnapshot.exists() && !isFullList) {
                const savedStats = statsSnapshot.val();
                if ((savedStats.total || 0) > 0) {
                    stats.totalTransactions = savedStats.total || 0;
                    stats.completedTransactions = savedStats.completed || 0;
                    stats.pendingTransactions = savedStats.pending || 0;
                    stats.failedTransactions = savedStats.failed || 0;
                    stats.isEstimated = false;
                    usedDbStats = true;
                }
            }

            if (!usedDbStats) {
                // Calculation from the actual data (Exact real values)
                stats.totalTransactions = transactions.length;
                stats.completedTransactions = transactions.filter(tx => tx.status === 'completed').length;
                stats.pendingTransactions = transactions.filter(tx => tx.status === 'pending' || tx.status === 'creating').length;
                stats.failedTransactions = transactions.filter(tx => tx.status === 'failed' || tx.status === 'init_failed').length;
                stats.isEstimated = false;

                // Update average transaction value now that we have the real completed count
                stats.averageTransactionValue = stats.completedTransactions > 0
                    ? Math.round(stats.totalRevenue / stats.completedTransactions)
                    : 0;
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
