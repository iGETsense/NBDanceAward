/**
 * Payment Webhook API Route
 * POST /api/webhook/payment
 * Receives payment confirmations from Mesomb
 */

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, get, update } from 'firebase/database';
import { processSuccessfulPayment, markTransactionFailed } from '@/lib/voteProcessor';

export async function GET() {
    return NextResponse.json({
        status: 'active',
        message: 'Payment Webhook Endpoint is running. Please send POST requests from Mesomb.'
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Mesomb sends: pk, status, type, amount, fees, b_party, message, service, reference, ts, direction, country, currency, customer
        // We need 'reference' to find our transaction and 'status' to determine outcome
        const { reference, status, pk, amount, service, b_party } = body;

        console.log('[Webhook] Received payload:', JSON.stringify(body, null, 2));

        if (!reference) {
            console.error('[Webhook] Missing reference in payload');
            return NextResponse.json(
                { error: 'Missing reference' },
                { status: 400 }
            );
        }

        console.log(`[Webhook] Looking for transaction with mesombReference: ${reference}`);

        // Find transaction by Mesomb reference
        // NOTE: This query requires .indexOn for mesombReference in Firebase rules
        const transactionsRef = ref(database, 'transactions');
        const transactionsQuery = query(transactionsRef, orderByChild('mesombReference'), equalTo(reference));
        const transactionsSnapshot = await get(transactionsQuery);

        if (!transactionsSnapshot.exists()) {
            console.error(`[Webhook] Transaction NOT FOUND for reference: ${reference}`);
            console.log('[Webhook] This may indicate:');
            console.log('  1. The transaction was never created in our system');
            console.log('  2. Firebase .indexOn rule is missing for mesombReference');
            console.log('  3. The reference format does not match');
            return NextResponse.json(
                { error: 'Transaction not found', reference },
                { status: 404 }
            );
        }

        const transactions = transactionsSnapshot.val();
        const transactionId = Object.keys(transactions)[0];
        const transaction = transactions[transactionId];

        console.log(`[Webhook] Found transaction: ${transactionId}, current status: ${transaction.status}`);

        // Only process if still pending or creating
        if (transaction.status !== 'pending' && transaction.status !== 'creating') {
            console.log(`[Webhook] Transaction ${transactionId} already processed (status: ${transaction.status}), skipping`);
            return NextResponse.json({
                message: `Transaction already has status: ${transaction.status}`,
                transactionId
            });
        }

        // Handle SUCCESS
        if (status === 'SUCCESS') {
            console.log(`[Webhook] Processing successful payment for ${transactionId}`);

            // Use shared vote processor - handles marking completed FIRST, then votes
            const result = await processSuccessfulPayment({
                id: transactionId,
                candidateId: transaction.candidateId,
                voteCount: transaction.voteCount
            }, status);

            if (result.success) {
                console.log(`[Webhook] SUCCESS: Transaction ${transactionId} processed successfully`);
                return NextResponse.json({
                    message: 'Payment confirmed successfully',
                    transactionId
                });
            } else {
                console.error(`[Webhook] Failed to process payment: ${result.error}`);
                return NextResponse.json(
                    { error: 'Failed to process payment', details: result.error },
                    { status: 500 }
                );
            }
        }

        // Handle FAILED or CANCELED
        if (status === 'FAILED' || status === 'CANCELED') {
            console.log(`[Webhook] Marking transaction ${transactionId} as failed`);

            await markTransactionFailed(
                transactionId,
                `Mesomb returned ${status}`,
                status
            );

            console.log(`[Webhook] Transaction ${transactionId} marked as failed`);
            return NextResponse.json({
                message: 'Payment marked as failed',
                transactionId
            });
        }

        // Unknown status
        console.log(`[Webhook] Unknown status received: ${status}`);
        return NextResponse.json({
            message: `Webhook received with unknown status: ${status}`
        });

    } catch (error: any) {
        console.error('[Webhook] Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
