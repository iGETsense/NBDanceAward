/**
 * Mesomb Payment Service - Direct API Implementation
 * Bypasses SDK to avoid header issues in Vercel serverless environment
 * Ported from working project implementation
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

export interface PaymentResult {
    success: boolean;
    status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELED';
    reference?: string;
    message?: string;
    error?: string;
    transactionId?: string;
}

const MESOMB_API_BASE = 'https://mesomb.hachther.com/api/v1.1';
const ALGORITHM = 'HMAC-SHA1';

// Credentials MUST be defined in .env

// Helper: SHA1 Hash
function sha1(content: string): string {
    return crypto.createHash('sha1').update(content).digest('hex');
}

// Helper: Custom URL Parsing to match SDK 'url-parse' behavior roughly
function getSdkHost(urlStr: string): string {
    try {
        const url = new URL(urlStr);
        // SDK headers.host: parse.protocol + '//' + parse.host
        return `${url.protocol}//${url.host}`;
    } catch (e) {
        return 'https://mesomb.hachther.com';
    }
}

// Helper: Generate MeSomb Signature (SDK Replica)
function signRequest(
    service: string,
    method: string,
    urlStr: string,
    date: Date,
    nonce: string,
    body: any,
    credentials: { accessKey: string; secretKey: string }
): string {
    const timestamp = date.getTime();
    const url = new URL(urlStr);

    // 1. Headers
    const headers: Record<string, string> = {};
    headers['host'] = getSdkHost(urlStr);
    headers['x-mesomb-date'] = String(timestamp);
    headers['x-mesomb-nonce'] = nonce;

    if (method !== 'GET' || body) {
        headers['content-type'] = 'application/json';
    }

    // Sort headers
    const headersKeys = Object.keys(headers).sort();

    // Canonical Headers
    const canonicalHeaders = headersKeys.map(key => `${key}:${headers[key]}`).join('\n');

    // Signed Headers
    const signedHeaders = headersKeys.join(';');

    // Payload Hash
    const payloadContent = body ? JSON.stringify(body) : '{}';
    const payloadHash = sha1(payloadContent);

    // Path
    const path = encodeURI(url.pathname);

    // Canonical Query
    let canonicalQuery = '';
    if (url.search) {
        canonicalQuery = url.search.substring(1);
    }

    // Canonical Request
    const canonicalRequest = [
        method,
        path,
        canonicalQuery,
        canonicalHeaders,
        signedHeaders,
        payloadHash
    ].join('\n');

    // Scope
    const scope = `${date.getFullYear()}${date.getMonth()}${date.getDate()}/${service}/mesomb_request`;

    // String to Sign
    const stringToSign = [
        ALGORITHM,
        timestamp,
        scope,
        sha1(canonicalRequest)
    ].join('\n');

    // Signature
    const signature = crypto
        .createHmac('sha1', credentials.secretKey)
        .update(stringToSign)
        .digest('hex');

    return `${ALGORITHM} Credential=${credentials.accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

// Helper: Generic MeSomb Request
async function mesombRequest(
    endpoint: string,
    method: string,
    body: any = null,
    service: string = 'payment'
): Promise<any> {
    const applicationKey = (process.env.MESOMB_APPLICATION_KEY || '').trim();
    const accessKey = (process.env.MESOMB_ACCESS_KEY || '').trim();
    const secretKey = (process.env.MESOMB_SECRET_KEY || '').trim();

    const date = new Date();
    const nonce = crypto.randomBytes(16).toString('hex');
    const url = `${MESOMB_API_BASE}${endpoint}`;

    const validBody = (method === 'GET' && !body) ? null : (body || {});

    const signature = signRequest(
        service,
        method,
        url,
        date,
        nonce,
        validBody,
        { accessKey, secretKey }
    );

    const headers: Record<string, string> = {
        'x-mesomb-date': String(date.getTime()),
        'x-mesomb-nonce': nonce,
        'Authorization': signature,
        'X-MeSomb-Application': applicationKey,
        'X-MeSomb-Source': 'MeSombJS/v1.1.0',
    };

    if (method !== 'GET') {
        headers['Content-Type'] = 'application/json';
    }

    const bodyString = validBody ? JSON.stringify(validBody) : undefined;

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: bodyString,
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `API error: ${response.status}`;
            try {
                const errJson = JSON.parse(errorText);
                errorMessage = errJson.detail || errJson.message || errorMessage;
            } catch (e) {
                errorMessage = errorText;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error: any) {
        console.error('[MeSomb] Request failed:', error.message);
        throw error;
    }
}

// 1. Collect Payment
export async function collectPayment(params: CollectPaymentParams): Promise<PaymentResult> {
    try {
        const body = {
            amount: params.amount,
            service: params.service,
            payer: params.payer,
            nonce: params.nonce,
            country: 'CM',
            currency: 'XAF',
            fees: false,
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
                    name: 'VOTE NB DANCE AWARDS',
                    category: 'Voting',
                    quantity: 1,
                    amount: params.amount,
                },
            ],
        };

        const result = await mesombRequest('/payment/collect/', 'POST', body);

        if (result.success || result.status === 'SUCCESS' || result.status === 'PENDING') {
            return {
                success: true,
                status: 'PENDING',
                reference: result.reference || result.transaction?.pk,
                message: 'Payment initiated. Please confirm on your phone.',
            };
        }

        return {
            success: false,
            status: 'FAILED',
            error: result.message || 'Payment operation failed',
        };

    } catch (error: any) {
        return {
            success: false,
            status: 'FAILED',
            error: error.message || 'Payment initiation failed',
        };
    }
}

// 2. Check Payment Status
export async function checkPaymentStatus(reference: string): Promise<PaymentResult> {
    try {
        const result = await mesombRequest(`/payment/transactions/?ids=${reference}&source=MESOMB`, 'GET');
        const transactions = Array.isArray(result) ? result : (result.transactions || []);

        if (transactions.length === 0) {
            return { success: false, status: 'PENDING' };
        }

        const transaction = transactions[0];
        const isSuccess = transaction.status === 'SUCCESS';
        const isFailed = transaction.status === 'FAILED';

        return {
            success: isSuccess,
            status: isSuccess ? 'SUCCESS' : (isFailed ? 'FAILED' : 'PENDING'),
            reference,
            transactionId: transaction.pk
        };
    } catch (error: any) {
        return { success: false, status: 'PENDING' };
    }
}

// 3. Make Withdrawal
export async function makeWithdrawal(params: { amount: number, service: 'MTN' | 'ORANGE', receiver: string, nonce: string }): Promise<PaymentResult> {
    try {
        const body = {
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
        };

        const result = await mesombRequest('/payment/deposit/', 'POST', body);

        if (result.success || result.status === 'SUCCESS') {
            return {
                success: true,
                status: 'SUCCESS',
                reference: result.reference || result.transaction?.pk,
                message: 'Withdrawal completed successfully.',
            };
        }

        return {
            success: false,
            status: 'FAILED',
            error: result.message || 'Withdrawal operation failed',
        };
    } catch (error: any) {
        return {
            success: false,
            status: 'FAILED',
            error: error.message || 'Withdrawal failed',
        };
    }
}

// 4. Get Account Balance
export async function getAccountBalance(): Promise<{ success: boolean; balance?: number; balances?: any[]; error?: string }> {
    try {
        const application = await mesombRequest('/payment/status/', 'GET');
        const rawBalances = application.balances || [];

        const mtnBalance = (rawBalances.find((b: any) => b.provider === 'MTN' && b.country === 'CM') || {}).value || 0;
        const orangeBalance = (rawBalances.find((b: any) => b.provider === 'ORANGE' && b.country === 'CM') || {}).value || 0;

        return {
            success: true,
            balance: mtnBalance + orangeBalance,
            balances: [
                { service: 'MTN', value: mtnBalance, country: 'CM', provider: 'MTN' },
                { service: 'ORANGE', value: orangeBalance, country: 'CM', provider: 'ORANGE' }
            ]
        };
    } catch (error: any) {
        console.error('[MeSomb] Balance fetch error (returning 0):', error.message);
        return {
            success: true,
            balance: 0,
            balances: [],
            error: error.message
        };
    }
}

// Compatibility
export function getMesombClient() {
    return {
        makeCollect: (params: any) => collectPayment(params),
    };
}
