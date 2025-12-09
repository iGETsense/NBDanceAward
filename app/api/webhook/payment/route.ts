/**
 * Payment Webhook API Route
 * POST /api/webhook/payment
 * Receives payment confirmations from Mesomb
 */

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, get, update, runTransaction, set, serverTimestamp } from 'firebase/database';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { reference, status } = body;

        if (!reference) {
            return NextResponse.json(
                { error: 'Missing reference' },
                { status: 400 }
            );
        }

        // Find transaction by Mesomb reference
        const transactionsRef = ref(database, 'transactions');
        const transactionsQuery = query(transactionsRef, orderByChild('mesombReference'), equalTo(reference));
        const transactionsSnapshot = await get(transactionsQuery);

        if (!transactionsSnapshot.exists()) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        const transactions = transactionsSnapshot.val();
        const transactionId = Object.keys(transactions)[0];
        const transaction = transactions[transactionId];

        // Message for logging
        console.log(`[Webhook] Processing ${reference} - Status: ${status}`);

        // Handle SUCCESS
        if (status === 'SUCCESS' && transaction.status === 'pending') {
            // Update votes
            await updateVotesAfterPayment(transaction);

            // Update transaction status
            const transactionRef = ref(database, `transactions/${transactionId}`);
            await update(transactionRef, {
                status: 'completed',
                completedAt: serverTimestamp(),
                mesombStatus: status
            });

            return NextResponse.json({ message: 'Payment confirmed successfully' });
        }
        // Handle FAILED or CANCELED
        else if ((status === 'FAILED' || status === 'CANCELED') && transaction.status === 'pending') {
            const transactionRef = ref(database, `transactions/${transactionId}`);
            await update(transactionRef, {
                status: 'failed',
                failedAt: serverTimestamp(),
                mesombStatus: status
            });

            return NextResponse.json({ message: 'Payment marked as failed' });
        }
        else {
            return NextResponse.json({ message: `Webhook received: ${status} (No action taken)` });
        }
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
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
