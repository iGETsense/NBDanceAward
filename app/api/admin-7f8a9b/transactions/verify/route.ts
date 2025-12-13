/**
 * Admin Transaction Verify API
 * POST /api/admin-7f8a9b/transactions/verify
 * Verifies a pending transaction with MeSomb and updates status if completed
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, update, runTransaction } from 'firebase/database';
import { checkPaymentStatus } from '@/app/api/lib/mesomb';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { transactionId } = body;

        if (!transactionId) {
            return NextResponse.json(
                { success: false, error: 'Transaction ID required' },
                { status: 400 }
            );
        }

        console.log(`[Verify] Checking transaction: ${transactionId}`);

        // Get transaction from database
        const transactionRef = ref(database, `transactions/${transactionId}`);
        const transactionSnapshot = await get(transactionRef);

        if (!transactionSnapshot.exists()) {
            return NextResponse.json(
                { success: false, error: 'Transaction not found' },
                { status: 404 }
            );
        }

        const transaction = transactionSnapshot.val();
        const mesombReference = transaction.mesombReference;

        if (!mesombReference) {
            return NextResponse.json({
                success: false,
                error: 'No MeSomb reference found for this transaction',
                status: transaction.status
            });
        }

        // Prevent double-counting: Check if already completed
        if (transaction.status === 'completed') {
            return NextResponse.json({
                success: true,
                message: 'Transaction déjà vérifiée et confirmée.',
                status: 'completed',
                votesAdded: 0
            });
        }

        // Check with MeSomb
        const mesombResult = await checkPaymentStatus(mesombReference);

        console.log(`[Verify] MeSomb result for ${transactionId}:`, mesombResult);

        if (mesombResult.status === 'SUCCESS') {
            // Payment confirmed - update transaction and candidate votes
            const candidateId = transaction.candidateId;
            const voteCount = transaction.voteCount || 0;

            // Get current candidate votes
            const candidateRef = ref(database, `candidates/${candidateId}`);
            const candidateSnapshot = await get(candidateRef);

            if (candidateSnapshot.exists()) {
                const currentVotes = candidateSnapshot.val().votes || 0;

                // Update both transaction and candidate atomically-ish
                const updates: any = {
                    [`transactions/${transactionId}/status`]: 'completed',
                    [`transactions/${transactionId}/completedAt`]: Date.now(),
                    [`transactions/${transactionId}/verifiedAt`]: Date.now(),
                    [`transactions/${transactionId}/verifiedBy`]: 'admin_manual',
                    [`candidates/${candidateId}/votes`]: currentVotes + voteCount,
                };

                // Add stats updates if possible (best effort, race conditions possible but rare for manual verify)
                // We increment completed and technically should decrement pending
                // Since this is admin manual action, precision matters less than flow

                await update(ref(database), updates);

                // Update stats separately to keep main flow clean
                try {
                    await runTransaction(ref(database, 'stats/transactions'), (currentStats) => {
                        if (!currentStats) return { completed: 1, pending: 0 };
                        return {
                            ...currentStats,
                            completed: (currentStats.completed || 0) + 1,
                            pending: Math.max(0, (currentStats.pending || 0) - 1)
                        };
                    });
                } catch (e) {
                    console.warn('Failed to update stats on verify', e);
                }

                console.log(`[Verify] Transaction ${transactionId} verified and votes updated (+${voteCount})`);

                return NextResponse.json({
                    success: true,
                    message: `Transaction vérifiée! ${voteCount} votes ajoutés.`,
                    previousStatus: transaction.status,
                    newStatus: 'completed',
                    votesAdded: voteCount
                });
            } else {
                // Candidate not found, just update transaction
                await update(transactionRef, {
                    status: 'completed',
                    completedAt: Date.now(),
                    verifiedAt: Date.now(),
                    verifiedBy: 'admin_manual',
                    error: 'Candidate not found during verification'
                });

                return NextResponse.json({
                    success: true,
                    message: 'Transaction vérifiée mais candidat introuvable',
                    warning: 'Votes non ajoutés - candidat introuvable'
                });
            }
        } else if (mesombResult.status === 'FAILED') {
            // Payment failed
            await update(transactionRef, {
                status: 'failed',
                failedAt: Date.now(),
                failureReason: mesombResult.error || 'Payment failed at MeSomb',
                verifiedAt: Date.now(),
                verifiedBy: 'admin_manual'
            });

            return NextResponse.json({
                success: false,
                message: 'Paiement échoué chez MeSomb',
                status: 'failed',
                reason: mesombResult.error
            });
        } else {
            // Still pending
            return NextResponse.json({
                success: false,
                message: 'Paiement toujours en attente chez MeSomb',
                status: 'pending',
                mesombStatus: mesombResult.status
            });
        }

    } catch (error: any) {
        console.error('[Verify] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Verification failed' },
            { status: 500 }
        );
    }
}
