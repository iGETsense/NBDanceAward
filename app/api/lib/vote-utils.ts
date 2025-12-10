/**
 * Vote Utilities - Shared functions for vote processing
 * Prevents code duplication across webhook, verify, and functions
 */

import { database } from '@/lib/firebase';
import { ref, runTransaction, set, serverTimestamp, get } from 'firebase/database';

/**
 * Helper function to update votes after successful payment
 * Used by: webhook handler, verify route, and cloud functions
 */
export async function updateVotesAfterPayment(transaction: any) {
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
export async function recalculateCategoryPercentages(candidateId: string) {
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
