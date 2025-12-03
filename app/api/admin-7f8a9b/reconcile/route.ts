/**
 * Admin Reconciliation API Route
 * Recalculates votes based on completed transactions only
 * POST /api/admin-7f8a9b/reconcile
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, set, update } from 'firebase/database';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firebaseToken } = body;

        // Verify admin authorization
        const ADMIN_UID = 'He7g6275fIV459UbdKySfa5v5zJ3';

        if (!firebaseToken) {
            return NextResponse.json(
                { success: false, error: 'Non autorisé - Token Firebase requis' },
                { status: 401 }
            );
        }

        try {
            const tokenParts = firebaseToken.split('.');
            if (tokenParts.length !== 3) {
                throw new Error('Invalid token format');
            }

            const payload = JSON.parse(atob(tokenParts[1]));
            const uid = payload.user_id || payload.sub;

            if (uid !== ADMIN_UID) {
                return NextResponse.json(
                    { success: false, error: 'Non autorisé - Vous n\'êtes pas administrateur' },
                    { status: 403 }
                );
            }
        } catch (error) {
            return NextResponse.json(
                { success: false, error: 'Non autorisé - Token invalide' },
                { status: 401 }
            );
        }

        console.log('[Reconcile] Starting reconciliation process...');

        // Step 1: Get all transactions
        const transactionsRef = ref(database, 'transactions');
        const transactionsSnapshot = await get(transactionsRef);

        if (!transactionsSnapshot.exists()) {
            return NextResponse.json({
                success: false,
                error: 'Aucune transaction trouvée',
            });
        }

        const transactions = transactionsSnapshot.val();

        // Step 2: Calculate votes per candidate from completed transactions only
        const votesPerCandidate: Record<string, number> = {};
        let totalCompletedVotes = 0;
        let totalCompletedRevenue = 0;
        let completedCount = 0;
        let pendingCount = 0;
        let failedCount = 0;

        Object.values(transactions).forEach((tx: any) => {
            if (tx.status === 'completed') {
                const candidateId = tx.candidateId;
                const voteCount = tx.voteCount || 0;

                votesPerCandidate[candidateId] = (votesPerCandidate[candidateId] || 0) + voteCount;
                totalCompletedVotes += voteCount;
                totalCompletedRevenue += tx.amount || 0;
                completedCount++;
            } else if (tx.status === 'pending') {
                pendingCount++;
            } else if (tx.status === 'failed') {
                failedCount++;
            }
        });

        console.log('[Reconcile] Votes calculated:', {
            totalCandidates: Object.keys(votesPerCandidate).length,
            totalVotes: totalCompletedVotes,
            totalRevenue: totalCompletedRevenue,
            completedTransactions: completedCount,
            pendingTransactions: pendingCount,
            failedTransactions: failedCount,
        });

        // Step 3: Get all candidates
        const candidatesRef = ref(database, 'candidates');
        const candidatesSnapshot = await get(candidatesRef);

        if (!candidatesSnapshot.exists()) {
            return NextResponse.json({
                success: false,
                error: 'Aucun candidat trouvé',
            });
        }

        const candidates = candidatesSnapshot.val();

        // Step 4: Update each candidate's vote count
        const updates: Record<string, any> = {};
        let updatedCount = 0;
        let unchangedCount = 0;

        Object.keys(candidates).forEach((candidateId) => {
            const correctVotes = votesPerCandidate[candidateId] || 0;
            const currentVotes = candidates[candidateId].votes || 0;

            if (currentVotes !== correctVotes) {
                updates[`candidates/${candidateId}/votes`] = correctVotes;
                updatedCount++;
                console.log(`[Reconcile] ${candidateId}: ${currentVotes} → ${correctVotes}`);
            } else {
                unchangedCount++;
            }
        });

        // Step 5: Apply updates to Firebase
        if (Object.keys(updates).length > 0) {
            await update(ref(database), updates);
            console.log('[Reconcile] Updates applied to Firebase');
        }

        // Calculate platform fee (5%)
        const platformFee = Math.round(totalCompletedRevenue * 0.05);
        const netRevenue = totalCompletedRevenue - platformFee;

        return NextResponse.json({
            success: true,
            message: 'Réconciliation terminée avec succès',
            summary: {
                totalCandidates: Object.keys(candidates).length,
                candidatesUpdated: updatedCount,
                candidatesUnchanged: unchangedCount,
                totalVotes: totalCompletedVotes,
                totalRevenue: totalCompletedRevenue,
                platformFee: platformFee,
                netRevenue: netRevenue,
                transactions: {
                    completed: completedCount,
                    pending: pendingCount,
                    failed: failedCount,
                    total: completedCount + pendingCount + failedCount,
                },
            },
        });

    } catch (error: any) {
        console.error('[Reconcile] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Une erreur est survenue lors de la réconciliation',
            },
            { status: 500 }
        );
    }
}
