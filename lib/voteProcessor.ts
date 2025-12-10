/**
 * Vote Processor Service
 * Shared logic for processing votes after successful payment
 * Used by both webhook and verify routes
 */

import { database } from '@/lib/firebase';
import { ref, get, set, update, runTransaction, serverTimestamp } from 'firebase/database';

/**
 * Atomically increment candidate votes
 * Uses Firebase transactions to prevent race conditions
 */
export async function incrementCandidateVotes(candidateId: string, voteCount: number): Promise<void> {
    const candidateVotesRef = ref(database, `candidates/${candidateId}/votes`);
    await runTransaction(candidateVotesRef, (currentVotes) => {
        return (currentVotes || 0) + voteCount;
    });

    console.log(`[VoteProcessor] Incremented ${candidateId} votes by ${voteCount}`);
}

/**
 * Create a vote record in the database
 */
export async function createVoteRecord(transaction: {
    id: string;
    candidateId: string;
    voteCount: number;
}): Promise<string> {
    const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const voteRef = ref(database, `votes/${voteId}`);

    await set(voteRef, {
        id: voteId,
        candidateId: transaction.candidateId,
        voteCount: transaction.voteCount,
        transactionId: transaction.id,
        createdAt: serverTimestamp(),
    });

    console.log(`[VoteProcessor] Created vote record: ${voteId}`);
    return voteId;
}

/**
 * Mark a transaction as completed
 * This should be called FIRST before any other processing
 */
export async function markTransactionCompleted(transactionId: string, mesombStatus?: string): Promise<void> {
    const transactionRef = ref(database, `transactions/${transactionId}`);

    await update(transactionRef, {
        status: 'completed',
        completedAt: Date.now(), // Use Date.now() for reliable comparison
        mesombStatus: mesombStatus || 'SUCCESS',
        webhookReceived: true,
        webhookReceivedAt: Date.now(),
    });

    console.log(`[VoteProcessor] Transaction ${transactionId} marked as completed`);
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
 * Process a successful payment - main entry point
 * Order of operations:
 * 1. Mark transaction completed (CRITICAL - must succeed)
 * 2. Increment votes (CRITICAL - must succeed)
 * 3. Create vote record (IMPORTANT)
 * 4. Recalculate percentages (NON-CRITICAL - can fail)
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

        // Step 1: Mark completed FIRST (most critical)
        await markTransactionCompleted(transaction.id, mesombStatus);

        // Step 2: Increment votes atomically
        await incrementCandidateVotes(transaction.candidateId, transaction.voteCount);

        // Step 3: Create vote record
        await createVoteRecord(transaction);

        // Step 4: Recalculate percentages (non-blocking)
        // Wrap in try-catch so it doesn't fail the whole operation
        try {
            await recalculateCategoryPercentages(transaction.candidateId);
        } catch (error) {
            console.error('[VoteProcessor] Percentage recalculation failed (non-critical):', error);
            // Don't throw - payment was still successful
        }

        console.log(`[VoteProcessor] Successfully processed payment for transaction ${transaction.id}`);
        return { success: true };

    } catch (error: any) {
        console.error('[VoteProcessor] Critical error processing payment:', error);
        return {
            success: false,
            error: error.message || 'Failed to process payment'
        };
    }
}
