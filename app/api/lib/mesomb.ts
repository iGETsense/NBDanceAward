/**
 * Mesomb Payment Service for Vercel
 * Handles all payment operations using Mesomb API
 */

import { PaymentOperation } from '@hachther/mesomb';

// Initialize Mesomb client
export function getMesombClient() {
    const applicationKey = process.env.MESOMB_APPLICATION_KEY;
    const accessKey = process.env.MESOMB_ACCESS_KEY;
    const secretKey = process.env.MESOMB_SECRET_KEY;

    // Validate all required credentials are present
    if (!applicationKey || !accessKey || !secretKey) {
        throw new Error(
            'Mesomb credentials are not configured. Please set MESOMB_APPLICATION_KEY, ' +
            'MESOMB_ACCESS_KEY, and MESOMB_SECRET_KEY in your .env.local file.'
        );
    }

    return new PaymentOperation({
        applicationKey,
        accessKey,
        secretKey,
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

        const response = await payment.makeCollect({
            amount: params.amount,
            service: params.service,
            payer: params.payer,
            nonce: params.nonce,
            country: 'CM', // Cameroon
            currency: 'XAF', // Central African Franc
            customer: {
                email: 'vote@nbdanceaward.com',
                firstName: 'Voter',
                lastName: 'NBDance',
                town: 'Douala',
                region: 'Littoral',
                country: 'CM',
                address: 'Cameroon',
            },
            location: {
                town: 'Douala',
                region: 'Littoral',
                country: 'CM',
            },
            products: [
                {
                    name: 'Vote NBDance Award',
                    category: 'Voting',
                    quantity: params.amount / 100, // Number of votes (assuming 100 XAF per vote)
                    amount: params.amount,
                },
            ],
        });

        // Check if operation was successful
        if (!response.isOperationSuccess()) {
            return {
                success: false,
                error: 'Payment operation failed',
            };
        }

        return {
            success: true,
            reference: response.reference,
            message: 'Payment initiated successfully',
        };
    } catch (error: any) {
        console.error('Mesomb payment error:', error);

        // Check if it's a credential configuration error
        if (error.message?.includes('credentials are not configured')) {
            return {
                success: false,
                error: 'Payment system is not configured. Please contact support.',
            };
        }

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

        // Fetch transaction using Mesomb reference with source type
        const transactions = await payment.getTransactions([reference], 'MESOMB');

        if (!transactions || transactions.length === 0) {
            // Transaction not found yet - might still be processing
            return {
                success: false,
                error: 'Payment is still processing',
            };
        }

        const transaction = transactions[0];

        // Check transaction status - SUCCESS is the final successful state
        const isSuccess = transaction.status === 'SUCCESS';

        return {
            success: isSuccess,
            reference: reference,
            message: isSuccess ? 'Payment confirmed' : `Payment status: ${transaction.status}`,
        };
    } catch (error: any) {
        console.error('Mesomb status check error:', error);

        // Treat API errors as pending state (transaction might not be ready yet)
        // This is normal for newly initiated payments
        return {
            success: false,
            error: 'Payment is still processing. Please wait...',
        };
    }
}
