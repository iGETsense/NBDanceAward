/**
 * Submit Vote API Route
 * POST /api/vote/submit
 */

// Force Node.js runtime to avoid Edge Runtime header restrictions
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, set, update, serverTimestamp, runTransaction } from 'firebase/database';
import { collectPayment } from '../../lib/mesomb';
import { paymentQueue } from '@/lib/paymentQueue';
import { VOTE_PRICE } from '@/lib/config';
import {
    validatePhoneNumber,
    validateVoteCount,
    validateCandidateExists,
    detectOperator,
} from '../../lib/validation';

export async function POST(request: NextRequest) {
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
        const totalAmount = voteCount * VOTE_PRICE;

        // Detect operator and map to Mesomb service
        // We prioritize the detected operator over the user's selection to avoid mismatch errors
        const operator = detectOperator(phoneNumber);
        const mesombService = operator === 'MTN' ? 'MTN' : 'ORANGE';

        console.log(`[Submit] Detected operator for ${phoneNumber}: ${operator} -> Service: ${mesombService}`);

        // Generate unique transaction ID
        const transactionId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        console.log('[Submit] Processing payment via queue:', {
            transactionId,
            queueLength: paymentQueue.getQueueLength(),
            activeRequests: paymentQueue.getActiveRequests(),
        });

        // CRITICAL FIX: Create transaction record BEFORE calling Mesomb
        // This prevents "phantom transactions" where payment succeeds but DB record is lost
        const transactionRef = ref(database, `transactions/${transactionId}`);
        const initialTransactionData = {
            id: transactionId,
            candidateId,
            voteCount,
            phoneNumber,
            paymentMethod,
            operator: mesombService,
            amount: totalAmount,
            status: 'creating', // Initial status before payment attempt
            createdAt: Date.now(), // Use Date.now() for reliable timestamp comparison
            createdAtServer: serverTimestamp(),
        };

        // Step 1: Create record FIRST
        await set(transactionRef, initialTransactionData);
        console.log('[Submit] Transaction record created with status: creating');

        // Increment pending stats counter (for scalability)
        try {
            await runTransaction(ref(database, 'stats/transactions/pending'), (current) => (current || 0) + 1);
        } catch (statsError) {
            console.warn('[Submit] Failed to update pending stats (non-critical)');
        }

        // Step 2: Initiate payment with Mesomb via queue
        let paymentResult;
        try {
            paymentResult = await paymentQueue.add(() =>
                collectPayment({
                    amount: totalAmount,
                    service: mesombService,
                    payer: phoneNumber.replace(/\s/g, '').replace(/^\+237/, ''),
                    nonce: transactionId,
                })
            );
        } catch (paymentError: any) {
            // Payment call crashed - update record to failed
            await update(transactionRef, {
                status: 'init_failed',
                errorDetails: paymentError.message || 'Payment initiation crashed',
                failedAt: Date.now(),
            });

            return NextResponse.json(
                {
                    success: false,
                    error: 'Erreur de paiement: votre vote n\'est pas passé',
                    details: paymentError.message || 'Payment initiation failed',
                },
                { status: 500 }
            );
        }

        // Step 3: Update transaction with Mesomb response
        if (!paymentResult.success) {
            // Payment was rejected by Mesomb
            // Note: Firebase doesn't accept undefined values, use null or empty string
            await update(transactionRef, {
                status: 'failed',
                mesombReference: paymentResult.reference || null,
                mesombResponse: {
                    success: paymentResult.success,
                    status: paymentResult.status || 'FAILED',
                    message: paymentResult.message || paymentResult.error || 'Payment failed',
                    reference: paymentResult.reference || null,
                },
                errorDetails: paymentResult.error || paymentResult.message || 'Payment rejected',
                failedAt: Date.now(),
                reconciliationStatus: 'confirmed_failed',
            });

            const errorMessage = paymentResult.error || 'Erreur de paiement: votre vote n\'est pas passé';
            return NextResponse.json(
                {
                    success: false,
                    error: errorMessage,
                    details: paymentResult.error || 'Payment initiation failed',
                },
                { status: 400 }
            );
        }

        // Step 4: Update record to pending (payment initiated successfully)
        // Note: Firebase doesn't accept undefined values, use null or empty string
        await update(transactionRef, {
            status: 'pending',
            mesombReference: paymentResult.reference || null,
            mesombResponse: {
                success: paymentResult.success,
                status: paymentResult.status || 'PENDING',
                message: paymentResult.message || 'Payment initiated',
                reference: paymentResult.reference || null,
            },
        });

        // Log transaction creation
        console.log('[Vote] Transaction created:', {
            transactionId,
            candidateId,
            amount: totalAmount,
            operator: mesombService,
            reference: paymentResult.reference,
        });

        return NextResponse.json({
            success: true,
            transactionId,
            reference: paymentResult.reference,
            amount: totalAmount,
            message: 'Payment initiated. Please complete payment on your phone.',
        });
    } catch (error: any) {
        console.error('Submit vote error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'An error occurred while submitting vote',
            },
            { status: 500 }
        );
    }
}
