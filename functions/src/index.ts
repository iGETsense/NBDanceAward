/**
 * Firebase Cloud Functions for NB Dance Awards Voting System
 * Handles vote submissions with Mesomb payment integration
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { collectPayment, checkPaymentStatus } from './mesombService';
import {
    validatePhoneNumber,
    validatePaymentMethod,
    validateVoteCount,
    validateCandidateExists,
    detectOperator,
} from './voteValidation';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Submit Vote - Callable Function
 * Initiates payment and creates pending transaction
 */
export const submitVote = functions.https.onCall(async (data, context) => {
    try {
        const { candidateId, voteCount, phoneNumber, paymentMethod } = data;

        // Validate inputs
        const phoneValidation = validatePhoneNumber(phoneNumber);
        if (!phoneValidation.valid) {
            return { success: false, error: phoneValidation.error };
        }

        const voteValidation = validateVoteCount(voteCount);
        if (!voteValidation.valid) {
            return { success: false, error: voteValidation.error };
        }

        const paymentValidation = validatePaymentMethod(phoneNumber, paymentMethod);
        if (!paymentValidation.valid) {
            return { success: false, error: paymentValidation.error };
        }

        const candidateValidation = await validateCandidateExists(candidateId, admin);
        if (!candidateValidation.valid) {
            return { success: false, error: candidateValidation.error };
        }

        // Calculate payment amount
        const config = functions.config();
        const votePrice = parseInt(config.vote?.price || '105');
        const totalAmount = voteCount * votePrice;

        // Detect operator and map to Mesomb service
        const operator = detectOperator(phoneNumber);
        const mesombService = operator === 'MTN' ? 'MTN' : 'ORANGE';

        // Generate unique transaction ID
        const transactionId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Initiate payment with Mesomb
        const paymentResult = await collectPayment({
            amount: totalAmount,
            service: mesombService,
            payer: phoneNumber.replace(/\s/g, '').replace(/^\+237/, ''),
            nonce: transactionId,
        });

        if (!paymentResult.success) {
            return {
                success: false,
                error: paymentResult.error || 'Payment initiation failed',
            };
        }

        // Create transaction record in Firebase
        const transactionData = {
            id: transactionId,
            candidateId,
            voteCount,
            phoneNumber,
            paymentMethod,
            operator: mesombService,
            amount: totalAmount,
            mesombReference: paymentResult.reference,
            status: 'pending',
            createdAt: admin.database.ServerValue.TIMESTAMP,
        };

        await admin.database().ref(`transactions/${transactionId}`).set(transactionData);

        return {
            success: true,
            transactionId,
            reference: paymentResult.reference,
            amount: totalAmount,
            message: 'Payment initiated. Please complete payment on your phone.',
        };
    } catch (error: any) {
        console.error('Submit vote error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while submitting vote',
        };
    }
});

/**
 * Verify Payment - Callable Function
 * Checks payment status and updates votes if confirmed
 */
export const verifyPayment = functions.https.onCall(async (data, context) => {
    try {
        const { transactionId } = data;

        if (!transactionId) {
            return { success: false, error: 'Transaction ID is required' };
        }

        // Get transaction from database
        const transactionSnapshot = await admin.database().ref(`transactions/${transactionId}`).once('value');

        if (!transactionSnapshot.exists()) {
            return { success: false, error: 'Transaction not found' };
        }

        const transaction = transactionSnapshot.val();

        // If already completed, return success
        if (transaction.status === 'completed') {
            return {
                success: true,
                status: 'completed',
                message: 'Payment already confirmed',
            };
        }

        // Check payment status with Mesomb
        const paymentStatus = await checkPaymentStatus(transaction.mesombReference);

        if (paymentStatus.success) {
            // Payment confirmed - update votes
            await updateVotesAfterPayment(transaction);

            // Update transaction status
            await admin.database().ref(`transactions/${transactionId}`).update({
                status: 'completed',
                completedAt: admin.database.ServerValue.TIMESTAMP,
            });

            return {
                success: true,
                status: 'completed',
                message: 'Payment confirmed! Votes have been added.',
            };
        } else {
            return {
                success: false,
                status: 'pending',
                message: 'Payment is still pending. Please complete payment on your phone.',
            };
        }
    } catch (error: any) {
        console.error('Verify payment error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while verifying payment',
        };
    }
});

/**
 * Handle Payment Webhook - HTTP Function
 * Receives payment confirmations from Mesomb
 */
export const handlePaymentWebhook = functions.https.onRequest(async (req, res) => {
    try {
        // Only accept POST requests
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        const { reference, status } = req.body;

        if (!reference) {
            res.status(400).send('Missing reference');
            return;
        }

        // Find transaction by Mesomb reference
        const transactionsSnapshot = await admin.database().ref('transactions')
            .orderByChild('mesombReference')
            .equalTo(reference)
            .once('value');

        if (!transactionsSnapshot.exists()) {
            res.status(404).send('Transaction not found');
            return;
        }

        const transactions = transactionsSnapshot.val();
        const transactionId = Object.keys(transactions)[0];
        const transaction = transactions[transactionId];

        // Only process if payment is successful and transaction is pending
        if (status === 'SUCCESS' && transaction.status === 'pending') {
            // Update votes
            await updateVotesAfterPayment(transaction);

            // Update transaction status
            await admin.database().ref(`transactions/${transactionId}`).update({
                status: 'completed',
                completedAt: admin.database.ServerValue.TIMESTAMP,
            });

            res.status(200).send('Webhook processed successfully');
        } else {
            res.status(200).send('Webhook received but not processed');
        }
    } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(500).send('Internal server error');
    }
});

/**
 * Helper function to update votes after successful payment
 */
async function updateVotesAfterPayment(transaction: any) {
    const { candidateId, voteCount } = transaction;

    // Increment candidate votes atomically
    await admin.database().ref(`candidates/${candidateId}/votes`).transaction((currentVotes) => {
        return (currentVotes || 0) + voteCount;
    });

    // Recalculate percentages for the category
    await recalculateCategoryPercentages(candidateId);

    // Store vote record
    const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await admin.database().ref(`votes/${voteId}`).set({
        id: voteId,
        candidateId,
        voteCount,
        transactionId: transaction.id,
        createdAt: admin.database.ServerValue.TIMESTAMP,
    });
}

/**
 * Recalculate percentages for all candidates in a category
 */
async function recalculateCategoryPercentages(candidateId: string) {
    try {
        // Get candidate's category
        const candidateSnapshot = await admin.database().ref(`candidates/${candidateId}`).once('value');
        const candidate = candidateSnapshot.val();

        if (!candidate) return;

        // Get candidate's category ID from candidateCategories
        const linksSnapshot = await admin.database().ref('candidateCategories').once('value');
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
        const candidatesSnapshot = await admin.database().ref('candidates').once('value');
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
                    await admin.database().ref(`candidates/${cId}/percentage`).set(percentage);
                }
            }
        }
    } catch (error) {
        console.error('Error recalculating percentages:', error);
    }
}
