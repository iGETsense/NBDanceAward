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
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    reference?: string;
    message?: string;
    error?: string;
    transactionId?: string;
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

        // CRITICAL: Log full Mesomb response for debugging
        console.log('[Mesomb] Payment collection response:', {
            nonce: params.nonce,
            amount: params.amount,
            service: params.service,
            payer: params.payer,
            success: response.success,
            status: response.status,
            message: response.message,
            reference: response.reference,
            transactionPk: response.transaction?.pk,
            transactionStatus: response.transaction?.status,
        });

        // Check if operation failed at API level
        if (typeof response.isOperationSuccess === 'function' && !response.isOperationSuccess()) {
            console.error('[Mesomb] Operation failed:', {
                message: response.message,
                status: response.status,
                nonce: params.nonce,
            });
            return {
                success: false,
                status: 'FAILED',
                error: response.message || 'Payment operation failed. Please try again.',
            };
        }

        // Check transaction success status
        if (typeof response.isTransactionSuccess === 'function') {
            const transactionSuccess = response.isTransactionSuccess();

            if (!transactionSuccess) {
                // Transaction explicitly failed
                console.error('[Mesomb] Transaction failed:', {
                    message: response.message,
                    status: response.status,
                    transactionStatus: response.transaction?.status,
                    nonce: params.nonce,
                });
                return {
                    success: false,
                    status: 'FAILED',
                    error: response.message || 'Payment was rejected. Please check your balance and try again.',
                };
            }
        }

        // Check for explicit success indicators
        const reference = response.reference || response.transaction?.pk;
        if (!reference) {
            console.error('[Mesomb] No reference returned:', {
                response: response,
                nonce: params.nonce,
            });
            return {
                success: false,
                status: 'FAILED',
                error: 'Payment initiation failed - no transaction reference received.',
            };
        }

        // Payment successfully initiated
        console.log('[Mesomb] Payment initiated successfully:', {
            reference: reference,
            nonce: params.nonce,
            amount: params.amount,
        });

        return {
            success: true,
            status: 'PENDING',
            reference: reference,
            message: 'Payment initiated successfully. Please complete payment on your phone.',
        };
    } catch (error: any) {
        console.error('[Mesomb] Payment error:', {
            error: error.message,
            stack: error.stack,
            nonce: params.nonce,
            amount: params.amount,
            service: params.service,
        });

        if (error.message?.includes('credentials are not configured')) {
            return {
                success: false,
                status: 'FAILED',
                error: 'Payment system is not configured. Please contact support.',
            };
        }

        // Check for common Mesomb errors
        if (error.message?.includes('insufficient')) {
            return {
                success: false,
                status: 'FAILED',
                error: 'Insufficient balance. Please top up your mobile money account and try again.',
            };
        }

        if (error.message?.includes('invalid')) {
            return {
                success: false,
                status: 'FAILED',
                error: 'Invalid phone number or payment details. Please check and try again.',
            };
        }

        return {
            success: false,
            status: 'FAILED',
            error: error.message || 'Payment initiation failed. Please try again.',
        };
    }
}

export async function checkPaymentStatus(reference: string): Promise<PaymentResult> {
    try {
        const payment = getMesombClient();
        const transactions = await payment.getTransactions([reference], 'MESOMB');

        console.log('[Mesomb] Check payment status:', {
            reference,
            transactionsFound: transactions?.length || 0,
        });

        if (!transactions || transactions.length === 0) {
            console.warn('[Mesomb] No transaction found for reference:', reference);
            return {
                success: false,
                status: 'PENDING',
                error: 'Payment is still processing',
            };
        }

        const transaction = transactions[0];
        const isSuccess = transaction.status === 'SUCCESS';
        const isFailed = transaction.status === 'FAILED';

        console.log('[Mesomb] Transaction status:', {
            reference,
            status: transaction.status,
            isSuccess,
        });

        if (isSuccess) {
            return {
                success: true,
                status: 'SUCCESS',
                reference: reference,
                message: 'Payment confirmed',
                transactionId: transaction.pk
            };
        } else if (isFailed) {
            return {
                success: false,
                status: 'FAILED',
                reference: reference,
                message: 'Payment failed',
                error: transaction.message || 'Payment failed'
            };
        } else {
            return {
                success: false,
                status: 'PENDING',
                reference: reference,
                message: `Payment status: ${transaction.status}`,
            };
        }
    } catch (error: any) {
        console.error('[Mesomb] Status check error:', {
            reference,
            error: error.message,
        });
        return {
            success: false,
            status: 'PENDING',
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
                status: 'FAILED',
                error: response.message || 'Withdrawal operation failed',
            };
        }

        if (typeof response.isTransactionSuccess === 'function' && !response.isTransactionSuccess()) {
            return {
                success: true,
                status: 'PENDING',
                reference: response.reference || response.transaction?.pk,
                message: 'Withdrawal initiated. Processing...',
            };
        }

        return {
            success: true,
            status: 'SUCCESS',
            reference: response.reference || response.transaction?.pk,
            message: 'Withdrawal completed successfully',
        };
    } catch (error: any) {
        console.error('Mesomb withdrawal error:', error);
        return {
            success: false,
            status: 'FAILED',
            error: error.message || 'Withdrawal failed',
        };
    }
}
