/**
 * Mesomb Payment Service - Direct API Implementation
 * Bypasses SDK to avoid header issues in Vercel serverless
 */

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

const MESOMB_API_BASE = 'https://mesomb.hachther.com/api/v1.1';

function generateSignature(
    method: string,
    endpoint: string,
    date: string,
    nonce: string,
    body: string,
    secretKey: string,
    accessKey: string
): string {
    const canonicalRequest = [
        method,
        endpoint,
        date,
        nonce,
        body
    ].join('\n');

    const signature = crypto
        .createHmac('sha1', secretKey)
        .update(canonicalRequest)
        .digest('hex');

    return `HMAC-SHA1 Credential=${accessKey}, SignedHeaders=content-type;host;x-mesomb-date;x-mesomb-nonce, Signature=${signature}`;
}

async function mesombRequest(
    endpoint: string,
    method: string,
    body: any
): Promise<any> {
    const applicationKey = process.env.MESOMB_APPLICATION_KEY;
    const accessKey = process.env.MESOMB_ACCESS_KEY;
    const secretKey = process.env.MESOMB_SECRET_KEY;

    if (!applicationKey || !accessKey || !secretKey) {
        throw new Error('Mesomb credentials not configured');
    }

    const date = new Date().toISOString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const bodyString = JSON.stringify(body);

    const signature = generateSignature(
        method,
        endpoint,
        date,
        nonce,
        bodyString,
        secretKey,
        accessKey
    );

    const url = `${MESOMB_API_BASE}${endpoint}`;

    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-MeSomb-Application': applicationKey,
            'X-MeSomb-Date': date,
            'X-MeSomb-Nonce': nonce,
            'Authorization': signature,
        },
        body: bodyString,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Mesomb API error: ${error}`);
    }

    return response.json();
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

        const result = await mesombRequest('/payment/collect/', 'POST', body);

        if (result.success) {
            return {
                success: true,
                reference: result.reference || result.transaction?.pk,
                message: 'Payment initiated successfully',
            };
        }

        return {
            success: false,
            error: result.message || 'Payment failed',
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
        const result = await mesombRequest(
            `/payment/transactions/?ids=${reference}&source=MESOMB`,
            'GET',
            {}
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

        const result = await mesombRequest('/payment/deposit/', 'POST', body);

        if (result.success) {
            return {
                success: true,
                reference: result.reference || result.transaction?.pk,
                message: 'Withdrawal completed successfully',
            };
        }

        return {
            success: false,
            error: result.message || 'Withdrawal failed',
        };
    } catch (error: any) {
        console.error('Mesomb withdrawal error:', error);
        return {
            success: false,
            error: error.message || 'Withdrawal failed',
        };
    }
}
