/**
 * Verify Payment API Route
 * POST /api/vote/verify
 */

// Force Node.js runtime to avoid Edge Runtime header restrictions
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, update, runTransaction, serverTimestamp, set } from 'firebase/database';
import { checkPaymentStatus } from '../../lib/mesomb';
import { updateVotesAfterPayment } from '../lib/vote-utils';

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

        // CRITICAL FIX: Check if mesombReference exists
        // With Two-Phase Commit, transaction is created BEFORE payment initiation
        // So mesombReference might be null if payment hasn't been initiated yet
        if (!transaction.mesombReference) {
            console.log('[Verify] Transaction exists but payment not yet initiated:', {
                transactionId,
                paymentInitiated: transaction.paymentInitiated,
            });

            return NextResponse.json({
                success: false,
                status: 'pending',
                message: 'Paiement en cours d\'initialisation. Veuillez patienter...',
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
                message: 'Erreur de paiement: votre vote n\'est pas passé',
                details: paymentStatus.error || 'Payment failed. Please try again.',
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


