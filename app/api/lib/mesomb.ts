/**
 * Mesomb Payment Service for Vercel
 * Uses SDK with fetch wrapper to fix header issues
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { PaymentOperation } from '@hachther/mesomb';

// Store original fetch
const originalFetch = global.fetch;

// Patch fetch to sanitize headers
global.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (init?.headers) {
        const headers = new Headers(init.headers);
        const authHeader = headers.get('authorization');

        if (authHeader && authHeader.includes('HMAC-SHA1')) {
            // Remove the problematic Authorization header
            headers.delete('authorization');

            // Extract components from the auth header
            const credMatch = authHeader.match(/Credential=([^\s,]+)/);
            const sigMatch = authHeader.match(/Signature=([^\s,]+)/);

            if (credMatch && sigMatch) {
                // Use X-MeSomb headers instead
                headers.set('X-MeSomb-Credential', credMatch[1]);
                headers.set('X-MeSomb-Signature', sigMatch[2]);
            }

            init.headers = headers;
        }
    }

    return originalFetch(input, init);
} as typeof fetch;

// Initialize Mesomb client
export function getMesombClient() {
    const applicationKey = process.env.MESOMB_APPLICATION_KEY;
    const accessKey = process.env.MESOMB_ACCESS_KEY;
    const secretKey = process.env.MESOMB_SECRET_KEY;

    if (!applicationKey || !accessKey || !secretKey) {
        throw new Error(
            'Mesomb credentials are not configured. Please set MESOMB_APPLICATION_KEY, ' +
            'MESOMB_ACCESS_KEY, and MESOMB_SECRET_KEY in your environment variables.'
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
