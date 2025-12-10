/**
 * Payment Webhook API Route
 * POST /api/webhook/payment
 * Receives payment confirmations from Mesomb
 */

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, onValue, off, get, query, orderByChild, equalTo, update, set, serverTimestamp } from 'firebase/database';
import { updateVotesAfterPayment } from '../../lib/vote-utils';

export async function GET() {
    return NextResponse.json({
        status: 'active',
        message: 'Payment Webhook Endpoint is running. Please send POST requests from Mesomb.'
    });
}

export async function POST(request: NextRequest) {
    const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        const body = await request.json();

        // Mesomb sends: pk, status, type, amount, fees, b_party, message, service, reference, ts, direction, country, currency, customer
        // IMPORTANT: Mesomb sometimes sends 'pk' instead of 'reference' - we must handle both!
        const { reference, status, pk, amount, service, b_party } = body;

        // Use pk as fallback if reference is missing
        const mesombReference = reference || pk;

        console.log('[Webhook] Received payload:', JSON.stringify(body, null, 2));
        console.log('[Webhook] Using mesombReference:', mesombReference, '(from', reference ? 'reference' : 'pk', ')');

        // ========================================================================
        // STEP 1: LOG ALL WEBHOOKS FOR AUDIT TRAIL
        // Even if processing fails, we have a record of receiving this webhook
        // ========================================================================
        const webhookLogRef = ref(database, `webhookLogs/${webhookId}`);
        await set(webhookLogRef, {
            id: webhookId,
            receivedAt: serverTimestamp(),
            status,
            service,
            reference: mesombReference, // Store the actual reference we're using
            originalReference: reference, // Keep original for debugging
            pk,
            amount,
            b_party,
            fullPayload: body,
            processed: false,
        });

        console.log(`[Webhook] Logged webhook ${webhookId} for reference: ${mesombReference}`);

        if (!mesombReference) {
            console.error('[Webhook] Missing both reference AND pk in webhook payload');
            await update(webhookLogRef, {
                error: 'Missing both reference and pk',
                processed: true, // Mark as processed to avoid retry
                processedAt: serverTimestamp(),
            });
            return NextResponse.json(
                { error: 'Missing reference' },
                { status: 400 }
            );
        }

        console.log(`[Webhook] Looking for transaction with mesombReference: ${mesombReference}`);

        // ========================================================================
        // STEP 2: FIND TRANSACTION WITH RETRY MECHANISM
        // Race condition: webhook might arrive before transaction is fully created
        // Solution: Retry with exponential backoff
        // ========================================================================

        let transactionsSnapshot;
        let transactionFound = false;
        const maxRetries = 3;
        const retryDelays = [500, 1000, 2000]; // milliseconds

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const transactionsRef = ref(database, 'transactions');
            const transactionsQuery = query(transactionsRef, orderByChild('mesombReference'), equalTo(mesombReference));
            transactionsSnapshot = await get(transactionsQuery);

            if (transactionsSnapshot.exists()) {
                transactionFound = true;
                console.log(`[Webhook] Transaction found on attempt ${attempt + 1}`);
                break;
            }

            if (attempt < maxRetries - 1) {
                const delay = retryDelays[attempt];
                console.log(`[Webhook] Transaction not found, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        if (!transactionFound) {
            console.error(`[Webhook] Transaction NOT FOUND after ${maxRetries} retries for reference: ${mesombReference}`);
            console.log('[Webhook] This may indicate:');
            console.log('  1. Transaction creation failed in /api/vote/submit');
            console.log('  2. Firebase .indexOn rule is missing for mesombReference');
            console.log('  3. The reference format does not match');

            await update(webhookLogRef, {
                processed: false, // Mark as unprocessed for manual review
                error: 'Transaction not found after retries',
                reference: mesombReference,
                retries: maxRetries,
                processedAt: serverTimestamp(),
            });

            return NextResponse.json(
                { error: 'Transaction not found', reference: mesombReference },
                { status: 404 }
            );
        }

        const transactions = transactionsSnapshot!.val();
        const transactionId = Object.keys(transactions)[0];
        const transaction = transactions[transactionId];

        console.log(`[Webhook] Found transaction: ${transactionId}, current status: ${transaction.status}`);

        // ========================================================================
        // STEP 3: PREVENT DUPLICATE PROCESSING
        // If Mesomb sends the webhook multiple times, process it only once
        // ========================================================================

        if (transaction.webhookReceived === true) {
            console.log(`[Webhook] Webhook already processed for transaction ${transactionId}, skipping (idempotency)`);

            await update(webhookLogRef, {
                processed: true,
                duplicate: true,
                transactionId,
                message: 'Webhook already processed (duplicate prevented)',
                processedAt: serverTimestamp(),
            });

            return NextResponse.json({
                message: 'Webhook already processed (duplicate)',
                transactionId
            });
        }

        // ========================================================================
        // STEP 4: PROCESS WEBHOOK BASED ON STATUS
        // ========================================================================

        const transactionRef = ref(database, `transactions/${transactionId}`);

        // Handle SUCCESS
        if (status === 'SUCCESS') {
            console.log(`[Webhook] Processing SUCCESS for transaction ${transactionId}`);

            try {
                // Update votes FIRST to ensure they're always applied
                await updateVotesAfterPayment(transaction);
                console.log(`[Webhook] ✓ Votes updated for candidate ${transaction.candidateId}`);

                // Then update transaction status
                await update(transactionRef, {
                    status: 'completed',
                    completedAt: serverTimestamp(),
                    mesombStatus: status,
                    webhookReceived: true,
                    webhookReceivedAt: serverTimestamp(),
                    webhookId,
                });

                // Mark webhook as processed
                await update(webhookLogRef, {
                    processed: true,
                    transactionId,
                    result: 'SUCCESS - Votes applied',
                    processedAt: serverTimestamp(),
                });

                console.log(`[Webhook] ✓ SUCCESS: Transaction ${transactionId} completed, votes added`);
                return NextResponse.json({
                    message: 'Payment confirmed successfully',
                    transactionId,
                    votesApplied: true,
                });
            } catch (voteError: any) {
                // CRITICAL: If vote update fails, don't mark transaction as complete
                console.error(`[Webhook] ✗ ERROR updating votes:`, voteError);

                await update(transactionRef, {
                    reconciliationStatus: 'votes_update_failed',
                    voteUpdateError: voteError.message,
                    webhookReceived: true,
                    webhookReceivedAt: serverTimestamp(),
                    webhookId,
                });

                await update(webhookLogRef, {
                    processed: false,
                    transactionId,
                    error: 'Vote update failed - needs manual review',
                    errorDetails: voteError.message,
                    processedAt: serverTimestamp(),
                });

                return NextResponse.json({
                    message: 'Payment received but vote update failed - manual review needed',
                    transactionId,
                    needsReview: true,
                }, { status: 500 });
            }
        }
        // Handle FAILED
        else if (status === 'FAILED') {
            console.log(`[Webhook] Processing FAILED for transaction ${transactionId}`);

            await update(transactionRef, {
                status: 'failed',
                failedAt: serverTimestamp(),
                mesombStatus: 'FAILED',
                webhookReceived: true,
                webhookReceivedAt: serverTimestamp(),
                webhookId,
                reconciliationStatus: 'confirmed_failed',
            });

            await update(webhookLogRef, {
                processed: true,
                transactionId,
                result: 'FAILED - Payment rejected',
                processedAt: serverTimestamp(),
            });

            console.log(`[Webhook] Transaction ${transactionId} marked as FAILED`);
            return NextResponse.json({
                message: 'Payment marked as failed',
                transactionId
            });
        }
        // Handle CANCELED (user explicitly canceled)
        else if (status === 'CANCELED') {
            console.log(`[Webhook] Processing CANCELED for transaction ${transactionId}`);

            await update(transactionRef, {
                status: 'failed',
                failedAt: serverTimestamp(),
                mesombStatus: 'CANCELED', // Keep distinction from FAILED
                webhookReceived: true,
                webhookReceivedAt: serverTimestamp(),
                webhookId,
                reconciliationStatus: 'user_canceled',
            });

            await update(webhookLogRef, {
                processed: true,
                transactionId,
                result: 'CANCELED - User canceled payment',
                processedAt: serverTimestamp(),
            });

            console.log(`[Webhook] Transaction ${transactionId} marked as CANCELED`);
            return NextResponse.json({
                message: 'Payment marked as canceled',
                transactionId
            });
        }
        else {
            // Unknown status
            console.log(`[Webhook] Unknown status: ${status} for transaction ${transactionId}`);

            await update(webhookLogRef, {
                processed: false,
                transactionId,
                result: `Unknown status: ${status}`,
                processedAt: serverTimestamp(),
            });

            return NextResponse.json({
                message: `Webhook received: ${status} (Unknown status)`,
                transactionId
            });
        }
    } catch (error: any) {
        console.error('[Webhook] Error processing webhook:', error);

        // Try to log the error
        try {
            const webhookLogRef = ref(database, `webhookLogs/${webhookId}`);
            await update(webhookLogRef, {
                processed: false,
                error: error.message,
                errorStack: error.stack,
                processedAt: serverTimestamp(),
            });
        } catch (logError) {
            console.error('[Webhook] Could not log error:', logError);
        }

        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * Helper function to update votes after successful payment
 */
