/**
 * Verify Payment API Route
 * POST /api/vote/verify
 */

// Force Node.js runtime to avoid Edge Runtime header restrictions
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, update, serverTimestamp } from 'firebase/database';
import { checkPaymentStatus } from '../../lib/mesomb';
import { processSuccessfulPayment, markTransactionFailed } from '@/lib/voteProcessor';

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

        // If already failed, return failure
        if (transaction.status === 'failed' || transaction.status === 'init_failed') {
            return NextResponse.json({
                success: false,
                status: 'failed',
                message: transaction.failureReason || 'Payment failed',
            });
        }

        // Only check with Mesomb if we have a reference (status is 'pending')
        if (!transaction.mesombReference) {
            // Transaction is still in 'creating' state - payment not yet initiated
            return NextResponse.json({
                success: false,
                status: 'creating',
                message: 'Payment is being initiated. Please wait.',
            });
        }

        // Check payment status with Mesomb
        const paymentStatus = await checkPaymentStatus(transaction.mesombReference);

        if (paymentStatus.success && paymentStatus.status === 'SUCCESS') {
            console.log('[Verify] Payment confirmed, processing:', {
                transactionId,
                reference: transaction.mesombReference,
            });

            // Use shared vote processor - marks completed FIRST, then processes votes
            const result = await processSuccessfulPayment({
                id: transactionId,
                candidateId: transaction.candidateId,
                voteCount: transaction.voteCount
            }, 'SUCCESS');

            if (result.success) {
                return NextResponse.json({
                    success: true,
                    status: 'completed',
                    message: 'Payment confirmed! Votes have been added.',
                });
            } else {
                console.error('[Verify] Failed to process payment:', result.error);
                return NextResponse.json({
                    success: false,
                    status: 'error',
                    message: 'Payment was received but there was an error processing your vote. Please contact support.',
                    reference: transactionId,
                });
            }
        }

        if (paymentStatus.status === 'FAILED' || paymentStatus.status === 'CANCELED') {
            console.warn('[Verify] Payment failed:', {
                transactionId,
                reference: transaction.mesombReference,
                error: paymentStatus.error
            });

            await markTransactionFailed(
                transactionId,
                paymentStatus.error || 'Payment failed at provider',
                paymentStatus.status
            );

            return NextResponse.json({
                success: false,
                status: 'failed',
                message: 'Erreur de paiement: votre vote n\'est pas passé',
                details: paymentStatus.error || 'Payment failed. Please try again.',
            });
        }

        // Still pending - check timeout
        // FIX: Use createdAt properly - it's stored as Date.now() (number) in new transactions
        const createdAt = typeof transaction.createdAt === 'number'
            ? transaction.createdAt
            : (transaction.createdAt?._seconds ? transaction.createdAt._seconds * 1000 : null);

        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;

        if (createdAt && (now - createdAt > tenMinutes)) {
            // Transaction timed out - mark for manual review
            await update(transactionRef, {
                status: 'failed',
                reconciliationStatus: 'needs_review',
                failedAt: Date.now(),
                failureReason: 'Timeout - payment not confirmed within 10 minutes',
            });

            console.warn('[Verify] Transaction timed out:', {
                transactionId,
                reference: transaction.mesombReference,
                age: now - createdAt,
            });

            return NextResponse.json({
                success: false,
                status: 'timeout',
                message: 'Payment verification timed out. If you were charged, please contact support with this reference: ' + transactionId,
            });
        }

        // Still pending
        console.log('[Verify] Payment still pending:', {
            transactionId,
            reference: transaction.mesombReference,
            status: paymentStatus.status,
        });

        return NextResponse.json({
            success: false,
            status: 'pending',
            message: 'Payment is still pending. Please complete payment on your phone.',
        });

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
