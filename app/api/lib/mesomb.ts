/**
 * Mesomb Payment Service - Direct API Implementation
 * Bypasses SDK to avoid header issues
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import crypto from 'crypto';

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

const MESOMB_API_BASE = 'https://mesomb.hachther.com/en/api/v1.1';

function generateAuthSignature(
    method: string,
    url: string,
    date: string,
    nonce: string,
    credentials: { accessKey: string; secretKey: string }
): string {
    const canonicalRequest = `${method}\n${url}\n${date}\n${nonce}`;

    const signature = crypto
        .createHmac('sha1', credentials.secretKey)
        .update(canonicalRequest)
        .digest('hex');

    return signature;
}

async function callMesombAPI(
    endpoint: string,
    method: string,
    body?: any
): Promise<any> {
    const applicationKey = process.env.MESOMB_APPLICATION_KEY;
    const accessKey = process.env.MESOMB_ACCESS_KEY;
    const secretKey = process.env.MESOMB_SECRET_KEY;

    if (!applicationKey || !accessKey || !secretKey) {
        throw new Error('Mesomb credentials not configured');
    }

    const url = `${MESOMB_API_BASE}${endpoint}`;
    const date = new Date().toISOString();
    const nonce = crypto.randomBytes(16).toString('hex');

    const signature = generateAuthSignature(method, endpoint, date, nonce, {
        accessKey,
        secretKey,
    });

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-MeSomb-Application': applicationKey,
        'X-MeSomb-Date': date,
        'X-MeSomb-Nonce': nonce,
        'X-MeSomb-Algorithm': 'HMAC-SHA1',
        'X-MeSomb-Credential': accessKey,
        'X-MeSomb-Signature': signature,
    };

    const options: RequestInit = {
        method,
        headers,
    };

    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        console.error('Mesomb API error:', data);
        throw new Error(data.message || data.detail || 'Mesomb API error');
    }

    return data;
}

export async function collectPayment(params: CollectPaymentParams): Promise<PaymentResult> {
    try {
        const body = {
            amount: params.amount,
            service: params.service,
            payer: params.payer,
            nonce: params.nonce,
            country: 'CM',
            currency: 'XAF',
            customer: {
                email: 'vote@nbdanceaward.com',
                first_name: 'Voter',
                last_name: 'NBDance',
                town: 'Douala',
                region: 'Littoral',
                country: 'CM',
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
        };

        const result = await callMesombAPI('/payment/collect/', 'POST', body);

        if (result.success || result.status === 'SUCCESS') {
            return {
                success: true,
                reference: result.reference || result.transaction?.pk || result.pk,
                message: result.message || 'Payment initiated successfully',
            };
        }

        return {
            success: false,
            error: result.message || result.detail || 'Payment failed',
        };
    } catch (error: any) {
        console.error('Mesomb payment error:', error);
        return {
            success: false,
            error: error.message || 'Payment initiation failed',
        };
    }
}

export async function checkPaymentStatus(reference: string): Promise<PaymentResult> {
    try {
        const result = await callMesombAPI(
            `/payment/transactions/?ids=${reference}&source=MESOMB`,
            'GET'
        );

        if (result.transactions && result.transactions.length > 0) {
            const transaction = result.transactions[0];
            const isSuccess = transaction.status === 'SUCCESS';

            return {
                success: isSuccess,
                reference: reference,
                message: isSuccess ? 'Payment confirmed' : `Payment status: ${transaction.status}`,
            };
        }

        return {
            success: false,
            error: 'Transaction not found',
        };
    } catch (error: any) {
        console.error('Mesomb status check error:', error);
        return {
            success: false,
            error: 'Payment is still processing',
        };
    }
}

export async function makeWithdrawal(params: WithdrawalParams): Promise<PaymentResult> {
    try {
        const body = {
            amount: params.amount,
            service: params.service,
            receiver: params.receiver,
            nonce: params.nonce,
            country: 'CM',
            currency: 'XAF',
            customer: {
                email: 'admin@nbdanceaward.com',
                first_name: 'Admin',
                last_name: 'NBDance',
                town: 'Douala',
                region: 'Littoral',
                country: 'CM',
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
        };

        const result = await callMesombAPI('/payment/deposit/', 'POST', body);

        if (result.success || result.status === 'SUCCESS') {
            return {
                success: true,
                reference: result.reference || result.transaction?.pk || result.pk,
                message: result.message || 'Withdrawal completed successfully',
            };
        }

        return {
            success: false,
            error: result.message || result.detail || 'Withdrawal failed',
        };
    } catch (error: any) {
        console.error('Mesomb withdrawal error:', error);
        return {
            success: false,
            error: error.message || 'Withdrawal failed',
        };
    }
}
