/**
 * Payment Webhook API Route
 * POST /api/webhook/payment
 * Receives payment confirmations from Mesomb
 */

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, get, update, runTransaction, set, serverTimestamp } from 'firebase/database';

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

        // Handle SUCCESS
        if (status === 'SUCCESS' && transaction.status === 'pending') {
            console.log(`[Webhook] Updating transaction ${transactionId} to completed`);

            // Update votes
            await updateVotesAfterPayment(transaction);

            // Update transaction status
            const transactionRef = ref(database, `transactions/${transactionId}`);
            await update(transactionRef, {
                status: 'completed',
                completedAt: serverTimestamp(),
                mesombStatus: status,
                webhookReceived: true,
                webhookReceivedAt: serverTimestamp()
            });

            console.log(`[Webhook] SUCCESS: Transaction ${transactionId} marked as completed, votes added`);
            return NextResponse.json({ message: 'Payment confirmed successfully', transactionId });
        }
        // Handle FAILED or CANCELED
        else if ((status === 'FAILED' || status === 'CANCELED') && transaction.status === 'pending') {
            console.log(`[Webhook] Marking transaction ${transactionId} as failed`);

            const transactionRef = ref(database, `transactions/${transactionId}`);
            await update(transactionRef, {
                status: 'failed',
                failedAt: serverTimestamp(),
                mesombStatus: status,
                webhookReceived: true,
                webhookReceivedAt: serverTimestamp()
            });

            console.log(`[Webhook] Transaction ${transactionId} marked as failed`);
            return NextResponse.json({ message: 'Payment marked as failed', transactionId });
        }
        else {
            console.log(`[Webhook] No action taken for status: ${status}, transaction status: ${transaction.status}`);
            return NextResponse.json({ message: `Webhook received: ${status} (No action taken)` });
        }
    } catch (error: any) {
        console.error('[Webhook] Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
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
