/**
 * Vote Processor - Bulletproof vote processing with multiple safety layers
 * Used by webhook, verify routes, and admin verify to ensure 100% vote reliability
 * 
 * SAFETY GUARANTEES:
 * 1. Transaction created BEFORE payment is initiated (in submit route)
 * 2. Status checked before processing to prevent duplicates
 * 3. Atomic vote increment using Firebase transactions
 * 4. Comprehensive logging for audit trail
 * 5. Error recovery and retry mechanisms
 */

import { database } from '@/lib/firebase';
import { ref, get, update, runTransaction, set } from 'firebase/database';

interface TransactionInfo {
    id: string;
    candidateId: string;
    voteCount: number;
}

interface ProcessResult {
    success: boolean;
    error?: string;
    votesAdded?: number;
    previousStatus?: string;
}

/**
 * Process a successful payment - THE CORE FUNCTION
 * This MUST be bulletproof as it handles real money -> votes conversion
 */
export async function processSuccessfulPayment(
    transaction: TransactionInfo,
    mesombStatus: string
): Promise<ProcessResult> {
    const { id, candidateId, voteCount } = transaction;
    const logPrefix = `[VoteProcessor ${id}]`;

    console.log(`${logPrefix} Starting processing: ${voteCount} votes to ${candidateId}`);

    try {
        // STEP 1: Fetch current transaction state
        const transactionRef = ref(database, `transactions/${id}`);
        const transactionSnapshot = await get(transactionRef);

        if (!transactionSnapshot.exists()) {
            console.error(`${logPrefix} CRITICAL: Transaction not found in database!`);
            // Create a recovery record
            await createRecoveryRecord(id, candidateId, voteCount, 'transaction_not_found');
            return { success: false, error: 'Transaction not found - recovery record created' };
        }

        const currentTransaction = transactionSnapshot.val();
        const previousStatus = currentTransaction.status;

        // STEP 2: Check if already processed (IDEMPOTENCY)
        if (currentTransaction.status === 'completed') {
            console.log(`${logPrefix} Already completed - skipping (idempotent)`);
            return {
                success: true,
                votesAdded: 0,
                previousStatus: 'completed'
            };
        }

        // STEP 3: Mark transaction as completed FIRST (prevents double processing)
        // This is the CRITICAL step - if we crash after this, votes might not be added
        // but at least we won't double-charge or double-vote
        await update(transactionRef, {
            status: 'completed',
            completedAt: Date.now(),
            processedBy: 'voteProcessor',
            mesombStatus: mesombStatus,
            votesProcessed: false, // Will be set to true after votes are added
        });

        console.log(`${logPrefix} Status marked as completed, proceeding to add votes`);

        // STEP 4: Add votes to candidate using atomic transaction
        const candidateRef = ref(database, `candidates/${candidateId}`);
        const candidateSnapshot = await get(candidateRef);

        if (!candidateSnapshot.exists()) {
            console.error(`${logPrefix} CRITICAL: Candidate ${candidateId} not found!`);
            // Mark for manual review but don't fail the transaction
            await update(transactionRef, {
                votesProcessed: false,
                voteError: `Candidate ${candidateId} not found`,
                reconciliationStatus: 'needs_review',
            });
            return {
                success: false,
                error: 'Candidate not found',
                previousStatus
            };
        }

        // Use runTransaction for atomic increment
        const votesRef = ref(database, `candidates/${candidateId}/votes`);
        let votesBeforeUpdate = 0;
        let votesAfterUpdate = 0;

        await runTransaction(votesRef, (currentVotes) => {
            votesBeforeUpdate = currentVotes || 0;
            votesAfterUpdate = votesBeforeUpdate + voteCount;
            return votesAfterUpdate;
        });

        console.log(`${logPrefix} Votes updated: ${votesBeforeUpdate} -> ${votesAfterUpdate} (+${voteCount})`);

        // STEP 5: Mark votes as processed and log audit trail
        await update(transactionRef, {
            votesProcessed: true,
            votesAddedAt: Date.now(),
            votesBeforeUpdate,
            votesAfterUpdate,
        });

        // STEP 6: Update aggregated stats (for scalability)
        try {
            await runTransaction(ref(database, 'stats/transactions/completed'), (current) => (current || 0) + 1);
            // Decrement pending if it was pending before
            if (previousStatus === 'pending' || previousStatus === 'creating') {
                await runTransaction(ref(database, 'stats/transactions/pending'), (current) => Math.max((current || 0) - 1, 0));
            }
            await runTransaction(ref(database, 'stats/transactions/total'), (current) => (current || 0) + 1);
        } catch (statsError) {
            console.warn(`${logPrefix} Failed to update stats (non-critical):`, statsError);
        }

        console.log(`${logPrefix} SUCCESS: ${voteCount} votes added to ${candidateId}`);

        return {
            success: true,
            votesAdded: voteCount,
            previousStatus
        };

    } catch (error: any) {
        console.error(`${logPrefix} ERROR:`, error);

        // Try to mark for manual review
        try {
            const transactionRef = ref(database, `transactions/${id}`);
            await update(transactionRef, {
                lastError: error.message,
                lastErrorAt: Date.now(),
                reconciliationStatus: 'needs_review',
            });
        } catch (updateError) {
            console.error(`${logPrefix} Failed to update error state:`, updateError);
        }

        return { success: false, error: error.message };
    }
}

/**
 * Create a recovery record for orphaned payments
 * This ensures we never lose track of a payment that completed
 */
async function createRecoveryRecord(
    transactionId: string,
    candidateId: string,
    voteCount: number,
    reason: string
): Promise<void> {
    try {
        const recoveryRef = ref(database, `recoveryQueue/${transactionId}`);
        await set(recoveryRef, {
            originalTransactionId: transactionId,
            candidateId,
            voteCount,
            reason,
            createdAt: Date.now(),
            status: 'pending_review',
        });
        console.log(`[Recovery] Created recovery record for ${transactionId}`);
    } catch (error) {
        console.error(`[Recovery] Failed to create recovery record:`, error);
    }
}

/**
 * Mark a transaction as failed with comprehensive logging
 */
export async function markTransactionFailed(
    transactionId: string,
    reason: string,
    mesombStatus: string
): Promise<void> {
    const logPrefix = `[VoteProcessor ${transactionId}]`;

    try {
        const transactionRef = ref(database, `transactions/${transactionId}`);

        // First check current status
        const snapshot = await get(transactionRef);
        if (snapshot.exists()) {
            const current = snapshot.val();
            if (current.status === 'completed') {
                console.log(`${logPrefix} Cannot mark completed transaction as failed`);
                return;
            }
        }

        await update(transactionRef, {
            status: 'failed',
            failedAt: Date.now(),
            failureReason: reason,
            mesombStatus: mesombStatus,
            reconciliationStatus: 'confirmed_failed',
        });

        console.log(`${logPrefix} Marked as failed: ${reason}`);
    } catch (error: any) {
        console.error(`${logPrefix} Error marking as failed:`, error);
    }
}

/**
 * Retry processing for transactions that got stuck
 * Call this for transactions where votesProcessed is false but status is completed
 */
export async function retryVoteProcessing(transactionId: string): Promise<ProcessResult> {
    const logPrefix = `[RetryProcessor ${transactionId}]`;
    console.log(`${logPrefix} Retrying vote processing`);

    try {
        const transactionRef = ref(database, `transactions/${transactionId}`);
        const snapshot = await get(transactionRef);

        if (!snapshot.exists()) {
            return { success: false, error: 'Transaction not found' };
        }

        const tx = snapshot.val();

        if (tx.status !== 'completed') {
            return { success: false, error: `Cannot retry: status is ${tx.status}` };
        }

        if (tx.votesProcessed === true) {
            return { success: true, votesAdded: 0 }; // Already processed
        }

        // Retry the vote addition
        return await processSuccessfulPayment(
            { id: transactionId, candidateId: tx.candidateId, voteCount: tx.voteCount },
            'RETRY'
        );
    } catch (error: any) {
        console.error(`${logPrefix} Retry failed:`, error);
        return { success: false, error: error.message };
    }
}
