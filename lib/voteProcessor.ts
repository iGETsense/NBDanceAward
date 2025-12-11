/**
 * Vote Processor Service
 * Shared logic for processing votes after successful payment
 * Used by both webhook and verify routes
 */

import { database } from '@/lib/firebase';
import { ref, get, set, update, runTransaction, serverTimestamp, increment } from 'firebase/database';

/**
 * Recalculate percentages for all candidates in a category
 * This is a NON-CRITICAL operation - failures should be logged but not block payment
 */
export async function recalculateCategoryPercentages(candidateId: string): Promise<void> {
    try {
        // Get candidate's category
        const candidateRef = ref(database, `candidates/${candidateId}`);
        const candidateSnapshot = await get(candidateRef);
        const candidate = candidateSnapshot.val();

        if (!candidate) {
            console.warn(`[VoteProcessor] Candidate ${candidateId} not found for percentage calculation`);
            return;
        }

        // Get candidate's category ID from candidateCategories
        const linksRef = ref(database, 'candidateCategories');
        const linksSnapshot = await get(linksRef);
        const links = linksSnapshot.val();

        if (!links) {
            console.warn('[VoteProcessor] No candidateCategories found');
            return;
        }

        // Find category for this candidate
        let categoryId: string | null = null;
        const linksArray = Array.isArray(links) ? links : Object.values(links);

        for (const link of linksArray as any[]) {
            if (link && link.candidateId === candidateId) {
                categoryId = link.categoryId;
                break;
            }
        }

        if (!categoryId) {
            console.warn(`[VoteProcessor] No category found for candidate ${candidateId}`);
            return;
        }

        // Get all candidates in this category
        const categoryCandidateIds: string[] = [];
        for (const link of linksArray as any[]) {
            if (link && link.categoryId === categoryId) {
                categoryCandidateIds.push(link.candidateId);
            }
        }

        // Get all candidates data
        const candidatesRef = ref(database, 'candidates');
        const candidatesSnapshot = await get(candidatesRef);
        const allCandidates = candidatesSnapshot.val();

        if (!allCandidates) {
            console.warn('[VoteProcessor] No candidates found');
            return;
        }

        // Calculate total votes in category
        let totalVotes = 0;
        for (const cId of categoryCandidateIds) {
            if (allCandidates[cId]) {
                totalVotes += allCandidates[cId].votes || 0;
            }
        }

        // Update percentages
        if (totalVotes > 0) {
            const updates: Record<string, number> = {};

            for (const cId of categoryCandidateIds) {
                if (allCandidates[cId]) {
                    const votes = allCandidates[cId].votes || 0;
                    const percentage = Math.round((votes / totalVotes) * 100);
                    updates[`candidates/${cId}/percentage`] = percentage;
                }
            }

            // Batch update all percentages
            await update(ref(database), updates);
            console.log(`[VoteProcessor] Updated percentages for ${categoryCandidateIds.length} candidates in category`);
        }
    } catch (error) {
        // Log but don't throw - this is non-critical
        console.error('[VoteProcessor] Error recalculating percentages (non-critical):', error);
    }
}

/**
 * Mark a transaction as failed
 */
export async function markTransactionFailed(
    transactionId: string,
    reason: string,
    mesombStatus?: string
): Promise<void> {
    const transactionRef = ref(database, `transactions/${transactionId}`);

    await update(transactionRef, {
        status: 'failed',
        failedAt: Date.now(),
        failureReason: reason,
        mesombStatus: mesombStatus || 'FAILED',
        webhookReceived: true,
        webhookReceivedAt: Date.now(),
    });

    console.log(`[VoteProcessor] Transaction ${transactionId} marked as failed: ${reason}`);
}

/**
 * Process a successful payment - main entry point
 * Uses ATOMIC multi-path updates to ensure consistency
 */
export async function processSuccessfulPayment(transaction: {
    id: string;
    candidateId: string;
    voteCount: number;
}, mesombStatus?: string): Promise<{ success: boolean; error?: string; alreadyProcessed?: boolean }> {
    try {
        // IDEMPOTENCY CHECK: Prevent duplicate processing
        const txRef = ref(database, `transactions/${transaction.id}`);
        const snapshot = await get(txRef);
        const currentTx = snapshot.val();

        if (currentTx?.status === 'completed') {
            console.log(`[VoteProcessor] Transaction ${transaction.id} already completed, skipping duplicate processing`);
            return { success: true, alreadyProcessed: true };
        }

        // Prepare atomic updates
        const updates: Record<string, any> = {};
        const timestamp = Date.now();
        const voteId = `vote_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

        // 1. Update Transaction Status
        updates[`transactions/${transaction.id}/status`] = 'completed';
        updates[`transactions/${transaction.id}/completedAt`] = timestamp;
        updates[`transactions/${transaction.id}/mesombStatus`] = mesombStatus || 'SUCCESS';
        updates[`transactions/${transaction.id}/webhookReceived`] = true;
        updates[`transactions/${transaction.id}/webhookReceivedAt`] = timestamp;

        // 2. Increment Candidate Votes (using atomic increment)
        updates[`candidates/${transaction.candidateId}/votes`] = increment(transaction.voteCount);

        // 3. Create Vote Record
        updates[`votes/${voteId}`] = {
            id: voteId,
            candidateId: transaction.candidateId,
            voteCount: transaction.voteCount,
            transactionId: transaction.id,
            createdAt: serverTimestamp(), // Use server timestamp for vote record
        };

        // Execute all updates atomically
        await update(ref(database), updates);
        console.log(`[VoteProcessor] Atomically processed transaction ${transaction.id}, added ${transaction.voteCount} votes`);

        // 4. Recalculate percentages (non-blocking, separate operation)
        // Wrap in try-catch so it doesn't fail the whole operation
        try {
            await recalculateCategoryPercentages(transaction.candidateId);
        } catch (error) {
            console.error('[VoteProcessor] Percentage recalculation failed (non-critical):', error);
            // Don't throw - payment was still successful
        }

        return { success: true };

    } catch (error: any) {
        console.error('[VoteProcessor] Critical error processing payment:', error);
        return {
            success: false,
            error: error.message || 'Failed to process payment'
        };
    }
}
