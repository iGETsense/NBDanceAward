/**
 * Mesomb Payment Service for Vercel
 * Direct SDK integration without fetch wrapper
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { PaymentOperation } from '@hachther/mesomb';

// Initialize Mesomb client with hardcoded credentials
export function getMesombClient() {
    // Hardcoded Mesomb API credentials
    const applicationKey = 'a4120748a7093365013b04a8f42bdd24f299936b';
    const accessKey = 'f6c26b42-24de-4ec6-8b1b-7a808052e335';
    const secretKey = 'e45b1545-1b5a-49c4-aadf-ba4cf700a8dc';

    // Create PaymentOperation instance with object parameter
    return new PaymentOperation({
        applicationKey,
        accessKey,
        secretKey,
    });
}

export interface CollectPaymentParams {
    amount: number;
    service: 'MTN' | 'ORANGE';
    payer: string;
    nonce: string;
}

export interface WithdrawalParams {
    amount: number;
    service: 'MTN' | 'ORANGE';
    receiver: string;
    nonce: string;
}

export interface PaymentResult {
    success: boolean;
    reference?: string;
    message?: string;
    error?: string;
}

export async function collectPayment(params: CollectPaymentParams): Promise<PaymentResult> {
    try {
        const payment = getMesombClient();

        const response = await payment.makeCollect({
            amount: params.amount,
            service: params.service,
            payer: params.payer,
            nonce: params.nonce,
            country: 'CM',
            currency: 'XAF',
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
                    quantity: Math.floor(params.amount / 105),
                    amount: params.amount,
                },
            ],
        });

        if (process.env.NODE_ENV === 'development') {
            console.log('Mesomb response:', {
                success: response.success,
                status: response.status,
                message: response.message,
                reference: response.reference,
            });
        }

        if (typeof response.isOperationSuccess === 'function' && !response.isOperationSuccess()) {
            return {
                success: false,
                error: response.message || 'Payment operation failed',
            };
        }

        if (typeof response.isTransactionSuccess === 'function' && !response.isTransactionSuccess()) {
            return {
                success: true,
                reference: response.reference || response.transaction?.pk,
                message: 'Payment initiated. Please complete on your phone.',
            };
        }

        return {
            success: true,
            reference: response.reference || response.transaction?.pk,
            message: 'Payment initiated successfully',
        };
    } catch (error: any) {
        console.error('Mesomb payment error:', error);

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

export async function checkPaymentStatus(reference: string): Promise<PaymentResult> {
    try {
        const payment = getMesombClient();
        const transactions = await payment.getTransactions([reference], 'MESOMB');

        if (!transactions || transactions.length === 0) {
            return {
                success: false,
                error: 'Payment is still processing',
            };
        }

        const transaction = transactions[0];
        const isSuccess = transaction.status === 'SUCCESS';

        return {
            success: isSuccess,
            reference: reference,
            message: isSuccess ? 'Payment confirmed' : `Payment status: ${transaction.status}`,
        };
    } catch (error: any) {
        console.error('Mesomb status check error:', error);
        return {
            success: false,
            error: 'Payment is still processing. Please wait...',
        };
    }
}

export async function makeWithdrawal(params: WithdrawalParams): Promise<PaymentResult> {
    try {
        const payment = getMesombClient();

        const response = await payment.makeDeposit({
            amount: params.amount,
            service: params.service,
            receiver: params.receiver,
            nonce: params.nonce,
            country: 'CM',
            currency: 'XAF',
            customer: {
                email: 'admin@nbdanceaward.com',
                firstName: 'Admin',
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
                    name: 'Withdrawal NBDance Award',
                    category: 'Withdrawal',
                    quantity: 1,
                    amount: params.amount,
                },
            ],
        });

        if (typeof response.isOperationSuccess === 'function' && !response.isOperationSuccess()) {
            return {
                success: false,
                error: response.message || 'Withdrawal operation failed',
            };
        }

        if (typeof response.isTransactionSuccess === 'function' && !response.isTransactionSuccess()) {
            return {
                success: true,
                reference: response.reference || response.transaction?.pk,
                message: 'Withdrawal initiated. Processing...',
            };
        }

        return {
            success: true,
            reference: response.reference || response.transaction?.pk,
            message: 'Withdrawal completed successfully',
        };
    } catch (error: any) {
        console.error('Mesomb withdrawal error:', error);
        return {
            success: false,
            error: error.message || 'Withdrawal failed',
        };
    }
}
