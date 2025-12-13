/**
 * Mesomb Payment Service for Vercel
 * Using official SDK
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

    // Create PaymentOperation instance
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
    status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELED';
    reference?: string;
    message?: string;
    error?: string;
    transactionId?: string;
}

export async function collectPayment(params: CollectPaymentParams): Promise<PaymentResult> {
    try {
        const payment = getMesombClient();

        console.log('[Mesomb] Initiating collection:', {
            amount: params.amount,
            service: params.service,
            payer: params.payer,
            nonce: params.nonce
        });

        // Use asynchronous mode to avoid gateway timeouts and strict validation
        const response = await payment.makeCollect({
            amount: params.amount,
            service: params.service,
            payer: params.payer,
            nonce: params.nonce,
            country: 'CM',
            currency: 'XAF',
            fees: true,
            mode: 'asynchronous',
            customer: {
                email: 'vote@nbdanceaward.com',
                first_name: 'Voter',
                last_name: 'NBDance',
                town: 'Douala',
                region: 'Littoral',
                country: 'CM',
            },
            products: [
                {
                    name: 'Vote NBDance Award',
                    category: 'Voting',
                    quantity: 1,
                    amount: params.amount,
                },
            ],
        });

        // CRITICAL: Log full Mesomb response for debugging
        console.log('[Mesomb] Payment collection response:', JSON.stringify(response, null, 2));

        // Check if operation failed at API level
        // The SDK might return an object with isOperationSuccess method OR just plain object
        const isOpSuccess = typeof response.isOperationSuccess === 'function'
            ? response.isOperationSuccess()
            : (response as any).success;

        if (!isOpSuccess) {
            console.error('[Mesomb] Operation failed:', {
                message: response.message,
                status: response.status,
                nonce: params.nonce,
            });
            return {
                success: false,
                status: 'FAILED',
                error: response.message || 'Payment operation failed. Please try again.',
                message: response.message
            };
        }

        // Check transaction success status
        const isTxSuccess = typeof response.isTransactionSuccess === 'function'
            ? response.isTransactionSuccess()
            : (response as any).status === 'SUCCESS' || (response as any).status === 'PENDING';

        if (!isTxSuccess) {
            console.error('[Mesomb] Transaction failed:', {
                message: response.message,
                status: response.status,
                nonce: params.nonce,
            });
            return {
                success: false,
                status: 'FAILED',
                error: response.message || 'Payment was rejected.',
            };
        }

        // Success or Pending
        const reference = response.reference || response.transaction?.pk;

        return {
            success: true,
            status: 'PENDING',
            reference: reference,
            message: 'Payment initiated successfully. Please complete payment on your phone.',
        };
    } catch (error: any) {
        console.error('[Mesomb] Payment error:', {
            error: error.message,
            fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });

        // Parse generic Mesomb errors
        if (error.message?.includes('insufficient')) {
            return {
                success: false,
                status: 'FAILED',
                error: 'Insufficient balance.',
            };
        }

        return {
            success: false,
            status: 'FAILED',
            error: error.message || 'Payment initiation failed.',
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
                status: 'PENDING',
                error: 'Payment is still processing',
            };
        }

        const transaction = transactions[0];
        const isSuccess = transaction.status === 'SUCCESS';
        const isFailed = transaction.status === 'FAILED';

        return {
            success: isSuccess,
            status: isSuccess ? 'SUCCESS' : (isFailed ? 'FAILED' : 'PENDING'),
            reference: reference,
            message: isSuccess ? 'Payment confirmed' : `Payment status: ${transaction.status}`,
            transactionId: transaction.pk
        };
    } catch (error: any) {
        console.error('[Mesomb] Status check error:', error);
        return {
            success: false,
            status: 'PENDING',
            error: 'Payment is still processing',
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
            location: {
                town: 'Douala',
                region: 'Littoral',
                country: 'CM',
            }
        });

        if (typeof response.isOperationSuccess === 'function' && !response.isOperationSuccess()) {
            return {
                success: false,
                status: 'FAILED',
                error: response.message || 'Withdrawal operation failed',
            };
        }

        return {
            success: true,
            status: 'SUCCESS',
            reference: response.reference || response.transaction?.pk,
            message: 'Withdrawal initiated',
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

export async function getAccountBalance(): Promise<{ success: boolean; balance?: number; balances?: any[]; error?: string }> {
    try {
        const payment = getMesombClient();
        const application = await payment.getStatus();
        const rawBalances = (application as any).balances || [];

        const findBalance = (provider: string) => {
            const found = rawBalances.find((b: any) => b.provider === provider && b.country === 'CM');
            return found ? found.value : 0;
        };

        const mtnBalance = findBalance('MTN');
        const orangeBalance = findBalance('ORANGE');

        return {
            success: true,
            balance: mtnBalance + orangeBalance,
            balances: [
                { service: 'MTN', value: mtnBalance, country: 'CM' },
                { service: 'ORANGE', value: orangeBalance, country: 'CM' }
            ]
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
            balance: 0,
            balances: []
        };
    }
}
