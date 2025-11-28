/**
 * Mesomb Payment Service for Vercel
 * Handles all payment operations using Mesomb API
 */

import { PaymentOperation } from '@hachther/mesomb';

// Initialize Mesomb client
export function getMesombClient() {
    return new PaymentOperation({
        applicationKey: process.env.MESOMB_APPLICATION_KEY!,
        accessKey: process.env.MESOMB_ACCESS_KEY!,
        secretKey: process.env.MESOMB_SECRET_KEY!,
    });
}

export interface CollectPaymentParams {
    amount: number;
    service: 'MTN' | 'ORANGE';
    payer: string; // Phone number
    nonce: string; // Unique transaction ID
}

export interface PaymentResult {
    success: boolean;
    reference?: string;
    message?: string;
    error?: string;
}

/**
 * Initiate payment collection from user
 */
export async function collectPayment(params: CollectPaymentParams): Promise<PaymentResult> {
    try {
        const payment = getMesombClient();

        const transaction = await payment.makeCollect({
            amount: params.amount,
            service: params.service,
            payer: params.payer,
            nonce: params.nonce,
            country: 'CM', // Cameroon
            currency: 'XAF', // Central African Franc
        });

        return {
            success: true,
            reference: transaction.reference,
            message: 'Payment initiated successfully',
        };
    } catch (error: any) {
        console.error('Mesomb payment error:', error);
        return {
            success: false,
            error: error.message || 'Payment initiation failed',
        };
    }
}

/**
 * Check payment status by fetching transaction details
 */
export async function checkPaymentStatus(reference: string): Promise<PaymentResult> {
    try {
        const payment = getMesombClient();

        // Fetch transaction using Mesomb reference
        const transactions = await payment.getTransactions([reference], 'MESOMB');

        if (!transactions || transactions.length === 0) {
            return {
                success: false,
                error: 'Transaction not found',
            };
        }

        const transaction = transactions[0];
        const isSuccess = transaction.status === 'SUCCESS' || transaction.status === 'COMPLETED';

        return {
            success: isSuccess,
            reference: reference,
            message: isSuccess ? 'Payment confirmed' : 'Payment pending or failed',
        };
    } catch (error: any) {
        console.error('Mesomb status check error:', error);
        return {
            success: false,
            error: error.message || 'Status check failed',
        };
    }
}
