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

const FIREBASE_DB_URL = "https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app";

export async function GET(request: NextRequest) {
    try {
        // Get auth token from header
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

        console.log(`[API] Fetching transactions. Token present: ${!!token}`);

        // Construct URL with auth token if present
        // Note: We fetch all and sort in JS to avoid requiring .indexOn in Firebase rules
        let url = `${FIREBASE_DB_URL}/transactions.json`;
        if (token) {
            url += `?auth=${token}`;
        } else {
            console.warn('[API] No auth token provided for transactions fetch');
        }

        // Use REST API for reliability in serverless environment
        let data: any = null;
        let isFallback = false;

        try {
            console.log('[API] Attempting to fetch ALL transactions...');
            const response = await fetch(url, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            });

            if (!response.ok) {
                console.warn(`[API] Full fetch failed (${response.status}), switching to fallback.`);
                throw new Error(`Fetch failed: ${response.status}`);
            }
            data = await response.json();

        } catch (fetchError) {
            console.error('[API] Full fetch error:', fetchError);
            console.log('[API] Switching to FALLBACK: Fetching last 100 transactions...');

            // Fallback: Fetch only the last 100 items using the new index
            let fallbackUrl = `${FIREBASE_DB_URL}/transactions.json?orderBy="createdAt"&limitToLast=100`;
            if (token) {
                fallbackUrl += `&auth=${token}`;
            }

            const fallbackResponse = await fetch(fallbackUrl, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            });

            if (!fallbackResponse.ok) {
                const errorText = await fallbackResponse.text();
                throw new Error(`Fallback failed: ${fallbackResponse.status} ${errorText}`);
            }

            data = await fallbackResponse.json();
            isFallback = true;
        }

        if (!data) {
            return NextResponse.json({
                success: true,
                transactions: []
            });
        }

        const allTransactions = Object.entries(data).map(([id, tx]: [string, any]) => ({
            id,
            ...tx,
        }));

        // Calculate stats on the dataset we have (Full or Partial)
        const totalTransactions = allTransactions.length;
        const completed = allTransactions.filter(tx => tx.status === 'completed');
        const pending = allTransactions.filter(tx => tx.status === 'pending' || tx.status === 'creating');
        const failed = allTransactions.filter(tx => tx.status === 'failed' || tx.status === 'init_failed');

        let totalVotes = completed.reduce((sum, tx) => sum + (Number(tx.voteCount) || 0), 0);

        // FEATURE: If we are in fallback mode (partial data), the 'totalVotes' from transactions 
        // will be incomplete. We should fetch the REAL total from the candidates node.
        if (isFallback) {
            try {
                const candidatesSnapshot = await get(ref(database, 'candidates'));
                if (candidatesSnapshot.exists()) {
                    const candidatesData = candidatesSnapshot.val();
                    const realTotalVotes = Object.values(candidatesData).reduce((sum: number, c: any) => sum + (c.votes || 0), 0);
                    console.log(`[API] Fallback mode: Replaced partial votes (${totalVotes}) with real total (${realTotalVotes})`);
                    totalVotes = realTotalVotes;
                }
            } catch (fallbackStatError) {
                console.error('[API] Failed to fetch candidates for stats correction:', fallbackStatError);
            }
        }

        // Revenue Calculation
        const PRICE_PER_VOTE = 105;
        const grossRevenue = totalVotes * PRICE_PER_VOTE;
        const netRevenue = grossRevenue * 0.95;

        const stats = {
            totalTransactions,
            completedTransactions: completed.length,
            pendingTransactions: pending.length,
            failedTransactions: failed.length,
            totalRevenue: Math.round(grossRevenue),
            netRevenue: Math.round(netRevenue),
            totalVotes,
            averageTransactionValue: completed.length > 0
                ? Math.round(grossRevenue / completed.length)
                : 0,
            isPartial: isFallback, // Flag to indicate stats are estimated
        };

        // Sort by createdAt descending (newest first) - return ALL transactions
        const transactions = allTransactions
            .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));

        return NextResponse.json({
            success: true,
            transactions,
            stats
        });

    } catch (error: any) {
        console.error('Error fetching transactions:', error);
        // Log detailed cause if available (e.g., fetch network error)
        if (error.cause) console.error('Error cause:', error.cause);

        return NextResponse.json(
            { success: false, error: error.message, cause: error.cause ? String(error.cause) : undefined },
            { status: 500 }
        );
    }
}
