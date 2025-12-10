/**
 * Submit Vote API Route
 * POST /api/vote/submit
 */

// Force Node.js runtime to avoid Edge Runtime header restrictions
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, set, serverTimestamp } from 'firebase/database';
import { collectPayment } from '../../lib/mesomb';
import { paymentQueue } from '@/lib/paymentQueue';
import {
    validatePhoneNumber,
    validateVoteCount,
    validateCandidateExists,
    detectOperator,
} from '../../lib/validation';

export async function POST(request: NextRequest) {
    let transactionRef: any = null;
    let transactionId: string | null = null;

    try {
        const body = await request.json();
        const { candidateId, voteCount, phoneNumber, paymentMethod } = body;

        // Validate inputs
        const phoneValidation = validatePhoneNumber(phoneNumber);
        if (!phoneValidation.valid) {
            return NextResponse.json(
                { success: false, error: phoneValidation.error },
                { status: 400 }
            );
        }

        const voteValidation = validateVoteCount(voteCount);
        if (!voteValidation.valid) {
            return NextResponse.json(
                { success: false, error: voteValidation.error },
                { status: 400 }
            );
        }

        const candidateValidation = await validateCandidateExists(candidateId);
        if (!candidateValidation.valid) {
            return NextResponse.json(
                { success: false, error: candidateValidation.error },
                { status: 404 }
            );
        }

        // Calculate payment amount
        const votePrice = parseInt(process.env.NEXT_PUBLIC_VOTE_PRICE || '105');
        const totalAmount = voteCount * votePrice;

        // Detect operator and map to Mesomb service
        const operator = detectOperator(phoneNumber);
        const mesombService = operator === 'MTN' ? 'MTN' : 'ORANGE';

        console.log(`[Submit] Detected operator for ${phoneNumber}: ${operator} -> Service: ${mesombService}`);

        // ========================================================================
        // PHASE 1: CREATE TRANSACTION FIRST (Two-Phase Commit Pattern)
        // This GUARANTEES the client will NEVER be charged without a transaction record
        // ========================================================================

        // Generate unique transaction ID (idempotency key)
        transactionId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        console.log('[Submit] PHASE 1: Creating transaction BEFORE payment initiation:', {
            transactionId,
            candidateId,
            amount: totalAmount,
        });

        // Create transaction record with status='pending' BEFORE calling Mesomb
        const initialTransactionData = {
            id: transactionId,
            candidateId,
            voteCount,
            phoneNumber,
            paymentMethod,
            operator: mesombService,
            amount: totalAmount,
            status: 'pending', // Transaction exists but payment not yet initiated
            createdAt: serverTimestamp(),
            createdBeforePayment: true, // Flag indicating we used the safe pattern
            paymentInitiated: false, // Will be set to true when we call Mesomb
            // Initially empty, will be filled after payment attempt
            mesombReference: null,
            mesombResponse: null,
            errorDetails: null,
            reconciliationStatus: null,
        };

        transactionRef = ref(database, `transactions/${transactionId}`);

        try {
            await set(transactionRef, initialTransactionData);
            console.log('[Submit] ✓ PHASE 1 SUCCESS: Transaction created in Firebase');
        } catch (firebaseError: any) {
            // CRITICAL: If Firebase fails, we STOP here. Client will NOT be charged.
            console.error('[Submit] ✗ PHASE 1 FAILED: Cannot create transaction in Firebase:', firebaseError);

            // Detect if it's a network error
            const isNetworkError = firebaseError.message?.includes('network') ||
                firebaseError.message?.includes('fetch') ||
                firebaseError.code === 'unavailable';

            return NextResponse.json(
                {
                    success: false,
                    error: isNetworkError
                        ? 'Erreur de connexion: Vérifiez votre connexion internet et réessayez'
                        : 'Service temporairement indisponible. Veuillez réessayer dans quelques instants.',
                    errorType: 'transaction_creation_failed',
                    isNetworkError,
                    details: firebaseError.message,
                },
                { status: 503 } // Service Unavailable
            );
        }

        // ========================================================================
        // PHASE 2: INITIATE PAYMENT (Client will be charged here)
        // ========================================================================

        console.log('[Submit] PHASE 2: Initiating payment with Mesomb:', {
            transactionId,
            queueLength: paymentQueue.getQueueLength(),
            activeRequests: paymentQueue.getActiveRequests(),
        });

        // Update transaction to indicate payment is being initiated
        await set(transactionRef, {
            ...initialTransactionData,
            paymentInitiated: true,
            paymentInitiatedAt: serverTimestamp(),
        });

        let paymentResult;
        try {
            // Initiate payment with Mesomb via queue (handles concurrency + retries)
            paymentResult = await paymentQueue.add(() =>
                collectPayment({
                    amount: totalAmount,
                    service: mesombService,
                    payer: phoneNumber.replace(/\s/g, '').replace(/^\+237/, ''),
                    nonce: transactionId!, // Use transactionId as idempotency key (definitely defined here)
                })
            );
        } catch (mesombError: any) {
            // Payment initiation failed (network error, Mesomb down, etc.)
            console.error('[Submit] ✗ PHASE 2 FAILED: Mesomb payment error:', mesombError);

            // Update transaction with error details
            await set(transactionRef, {
                ...initialTransactionData,
                paymentInitiated: true,
                paymentInitiatedAt: serverTimestamp(),
                status: 'failed',
                failedAt: serverTimestamp(),
                errorDetails: mesombError.message,
                reconciliationStatus: 'needs_review', // Admin should check if money was actually debited
            });

            const isNetworkError = mesombError.message?.includes('network') ||
                mesombError.message?.includes('fetch') ||
                mesombError.message?.includes('timeout');

            return NextResponse.json(
                {
                    success: false,
                    error: isNetworkError
                        ? 'Erreur de connexion: Impossible de contacter le service de paiement. Vérifiez votre connexion internet.'
                        : 'Erreur de paiement: Le service de paiement est temporairement indisponible.',
                    errorType: 'payment_initiation_failed',
                    isNetworkError,
                    transactionId: transactionId || undefined, // Return transaction ID so user can check status later
                    details: mesombError.message,
                },
                { status: 503 }
            );
        }

        // ========================================================================
        // PHASE 3: UPDATE TRANSACTION WITH PAYMENT RESULT
        // ========================================================================

        console.log('[Submit] PHASE 3: Payment initiated, updating transaction with result');

        if (!paymentResult.success) {
            // Payment explicitly failed (insufficient balance, invalid number, etc.)
            console.log('[Submit] Payment failed:', paymentResult.error);

            await set(transactionRef, {
                ...initialTransactionData,
                paymentInitiated: true,
                paymentInitiatedAt: serverTimestamp(),
                status: 'failed',
                failedAt: serverTimestamp(),
                mesombReference: paymentResult.reference || null,
                mesombResponse: {
                    success: false,
                    status: paymentResult.status,
                    message: paymentResult.message,
                    error: paymentResult.error,
                },
                errorDetails: paymentResult.error,
                reconciliationStatus: 'confirmed_failed', // Confirmed failure, no money debited
            });

            return NextResponse.json(
                {
                    success: false,
                    error: paymentResult.error || 'Erreur de paiement: votre vote n\'est pas passé',
                    errorType: 'payment_rejected',
                    transactionId,
                    details: paymentResult.error,
                },
                { status: 400 }
            );
        }

        // Payment successfully initiated! Update transaction with Mesomb reference
        await set(transactionRef, {
            ...initialTransactionData,
            paymentInitiated: true,
            paymentInitiatedAt: serverTimestamp(),
            status: 'pending', // Waiting for webhook confirmation
            mesombReference: paymentResult.reference,
            mesombResponse: {
                success: true,
                status: paymentResult.status,
                message: paymentResult.message,
                reference: paymentResult.reference,
            },
        });

        console.log('[Submit] ✓ SUCCESS: Transaction created and payment initiated:', {
            transactionId,
            candidateId,
            amount: totalAmount,
            operator: mesombService,
            reference: paymentResult.reference,
            flow: 'Two-Phase Commit (Transaction → Payment)',
        });

        return NextResponse.json({
            success: true,
            transactionId,
            reference: paymentResult.reference,
            amount: totalAmount,
            message: 'Paiement initié. Veuillez compléter le paiement sur votre téléphone.',
        });
    } catch (error: any) {
        console.error('[Submit] Unexpected error:', error);

        // If we have a transaction, mark it as failed
        if (transactionRef && transactionId) {
            try {
                await set(transactionRef, {
                    id: transactionId,
                    status: 'failed',
                    failedAt: serverTimestamp(),
                    errorDetails: error.message,
                    reconciliationStatus: 'needs_review',
                });
            } catch (updateError) {
                console.error('[Submit] Could not update transaction with error:', updateError);
            }
        }

        const isNetworkError = error.message?.includes('network') ||
            error.message?.includes('fetch') ||
            error.code === 'unavailable';

        return NextResponse.json(
            {
                success: false,
                error: isNetworkError
                    ? 'Erreur de connexion: Vérifiez votre connexion internet et réessayez'
                    : 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
                errorType: 'unexpected_error',
                isNetworkError,
                transactionId: transactionId || undefined,
                details: error.message,
            },
            { status: 500 }
        );
    }
}
