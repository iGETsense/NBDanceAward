/**
 * Verify Payment API Route
 * POST /api/vote/verify
 */

// Force Node.js runtime to avoid Edge Runtime header restrictions
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, update, runTransaction, serverTimestamp } from 'firebase/database';
import { checkPaymentStatus } from '../../lib/mesomb';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { transactionId } = body;

        if (!transactionId) {
            return NextResponse.json(
                { success: false, error: 'Transaction ID is required' },
                { status: 400 }
            );
        }

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

        // If already completed, return success
        if (transaction.status === 'completed') {
            return NextResponse.json({
                success: true,
                status: 'completed',
                message: 'Payment already confirmed',
            });
        }

        // Check payment status with Mesomb
        const paymentStatus = await checkPaymentStatus(transaction.mesombReference);

        if (paymentStatus.success && paymentStatus.status === 'SUCCESS') {
            // Payment confirmed - update votes
            await updateVotesAfterPayment(transaction);

            // Update transaction status
            await update(transactionRef, {
                status: 'completed',
                completedAt: serverTimestamp(),
                mesombResponse: {
                    ...transaction.mesombResponse,
                    finalStatus: 'SUCCESS',
                    verifiedAt: serverTimestamp()
                }
            });

            console.log('[Verify] Payment confirmed:', {
                transactionId,
                reference: transaction.mesombReference,
            });

            return NextResponse.json({
                success: true,
                status: 'completed',
                message: 'Payment confirmed! Votes have been added.',
            });
        } else if (paymentStatus.status === 'FAILED') {
            // Explicit failure from Mesomb
            await update(transactionRef, {
                status: 'failed',
                reconciliationStatus: 'confirmed_failed',
                failedAt: serverTimestamp(),
                failureReason: paymentStatus.error || 'Payment failed at provider',
                mesombResponse: {
                    ...transaction.mesombResponse,
                    finalStatus: 'FAILED',
                    error: paymentStatus.error,
                    verifiedAt: serverTimestamp()
                }
            });

            console.warn('[Verify] Payment failed:', {
                transactionId,
                reference: transaction.mesombReference,
                error: paymentStatus.error
            });

            return NextResponse.json({
                success: false,
                status: 'failed',
                message: paymentStatus.error || 'Payment failed. Please try again.',
            });
        } else {
            // Check if transaction is too old (more than 10 minutes)
            const createdAt = transaction.createdAt;
            const now = Date.now();
            const tenMinutes = 10 * 60 * 1000;

            if (createdAt && (now - createdAt > tenMinutes)) {
                // Transaction timed out - mark for review
                await update(transactionRef, {
                    status: 'failed',
                    reconciliationStatus: 'needs_review',
                    failedAt: serverTimestamp(),
                    failureReason: 'Timeout - payment not confirmed within 10 minutes',
                });

                console.warn('[Verify] Transaction timed out:', {
                    transactionId,
                    reference: transaction.mesombReference,
                    age: now - createdAt,
                });

                return NextResponse.json({
                    success: false,
                    status: 'failed',
                    message: 'Payment verification timed out. If you were charged, please contact support with this reference: ' + transactionId,
                });
            }

            // Still pending
            console.log('[Verify] Payment still pending:', {
                transactionId,
                reference: transaction.mesombReference,
                status: paymentStatus.status,
                error: paymentStatus.error,
            });

            return NextResponse.json({
                success: false,
                status: 'pending',
                message: 'Payment is still pending. Please complete payment on your phone.',
            });
        }
    } catch (error: any) {
        console.error('Verify payment error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'An error occurred while verifying payment',
            },
            { status: 500 }
        );
    }
}

/**
 * Helper function to update votes after successful payment
 */
async function updateVotesAfterPayment(transaction: any) {
    const { candidateId, voteCount } = transaction;

    // Increment candidate votes atomically
    const candidateVotesRef = ref(database, `candidates/${candidateId}/votes`);
    await runTransaction(candidateVotesRef, (currentVotes) => {
        return (currentVotes || 0) + voteCount;
    });

    // Recalculate percentages for the category
    await recalculateCategoryPercentages(candidateId);

    // Store vote record
    const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const voteRef = ref(database, `votes/${voteId}`);
    await set(voteRef, {
        id: voteId,
        candidateId,
        voteCount,
        transactionId: transaction.id,
        createdAt: serverTimestamp(),
    });
}

/**
 * Recalculate percentages for all candidates in a category
 */
async function recalculateCategoryPercentages(candidateId: string) {
    try {
        // Get candidate's category
        const candidateRef = ref(database, `candidates/${candidateId}`);
        const candidateSnapshot = await get(candidateRef);
        const candidate = candidateSnapshot.val();

        if (!candidate) return;

        // Get candidate's category ID from candidateCategories
        const linksRef = ref(database, 'candidateCategories');
        const linksSnapshot = await get(linksRef);
        const links = linksSnapshot.val();

        if (!links) return;

        // Find category for this candidate
        let categoryId: string | null = null;
        const linksArray = Array.isArray(links) ? links : Object.values(links);

        for (const link of linksArray as any[]) {
            if (link.candidateId === candidateId) {
                categoryId = link.categoryId;
                break;
            }
        }

        if (!categoryId) return;

        // Get all candidates in this category
        const categoryCandidateIds: string[] = [];
        for (const link of linksArray as any[]) {
            if (link.categoryId === categoryId) {
                categoryCandidateIds.push(link.candidateId);
            }
        }

        // Get all candidates data
        const candidatesRef = ref(database, 'candidates');
        const candidatesSnapshot = await get(candidatesRef);
        const allCandidates = candidatesSnapshot.val();

        // Calculate total votes in category
        let totalVotes = 0;
        for (const cId of categoryCandidateIds) {
            if (allCandidates[cId]) {
                totalVotes += allCandidates[cId].votes || 0;
            }
        }

        // Update percentages
        if (totalVotes > 0) {
            for (const cId of categoryCandidateIds) {
                if (allCandidates[cId]) {
                    const votes = allCandidates[cId].votes || 0;
                    const percentage = Math.round((votes / totalVotes) * 100);
                    const percentageRef = ref(database, `candidates/${cId}/percentage`);
                    await set(percentageRef, percentage);
                }
            }
        }
    } catch (error) {
        console.error('Error recalculating percentages:', error);
    }
}

// Import set from firebase/database
import { set } from 'firebase/database';
