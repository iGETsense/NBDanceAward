/**
 * Mesomb Payment Service for Vercel
 * 100% SDK-compatible direct implementation using Node.js https module
 * Resolves SSL Alert 80 and authentication errors.
 */

import crypto from 'crypto';
import https from 'https';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MESOMB_HOST = 'mesomb.hachther.com';
const MESOMB_API_VERSION = 'v1.1.1';
const MESOMB_ALGORITHM = 'HMAC-SHA1';

// Credentials - prioritize env variables
const applicationKey = (process.env.MESOMB_APPLICATION_KEY || 'a4120748a7093365013b04a8f42bdd24f299936b').trim();
const accessKey = (process.env.MESOMB_ACCESS_KEY || 'fe3efd4c-cb89-45ef-a18b-d831cf25d1ea').trim();
const secretKey = (process.env.MESOMB_SECRET_KEY || '1bb8c37c-1b92-4428-b060-8716cafcedca').trim();

/**
 * Replicates the SDK's Signature.ts logic perfectly
 */
function generateSignature(
    service: string,
    method: string,
    url: string,
    date: Date,
    nonce: string,
    body: any = null
): string {
    const parsedUrl = new URL(url);
    const path = encodeURI(parsedUrl.pathname);
    const canonicalQuery = parsedUrl.search ? parsedUrl.search.substring(1) : '';
    const timestamp = date.getTime().toString();

    // Headers used in canonical request
    const headers: Record<string, string> = {
        'host': `${parsedUrl.protocol}//${parsedUrl.host}`,
        'x-mesomb-date': timestamp,
        'x-mesomb-nonce': nonce
    };

    const sortedHeaderKeys = Object.keys(headers).sort();
    const canonicalHeaders = sortedHeaderKeys.map(key => `${key}:${headers[key]}`).join('\n');
    const signedHeaders = sortedHeaderKeys.join(';');

    const payloadHash = crypto.createHash('sha1').update(body ? JSON.stringify(body) : '{}').digest('hex');

    const canonicalRequest = [
        method,
        path,
        canonicalQuery,
        canonicalHeaders,
        signedHeaders,
        payloadHash
    ].join('\n');

    // SDK uses unpadded date components for scope
    // getMonth() is 0-indexed. e.g. January 9th -> 202609
    const scope = `${date.getFullYear()}${date.getMonth()}${date.getDate()}/${service}/mesomb_request`;

    const stringToSign = [
        MESOMB_ALGORITHM,
        timestamp,
        scope,
        crypto.createHash('sha1').update(canonicalRequest).digest('hex')
    ].join('\n');

    const signature = crypto.createHmac('sha1', secretKey).update(stringToSign).digest('hex');

    return `${MESOMB_ALGORITHM} Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

/**
 * Direct HTTPS request to avoid SSL issues with fetch in some environments
 */
async function mesombRequest(
    endpoint: string,
    method: string,
    body: any = null,
    mode: string = 'asynchronous'
): Promise<any> {
    return new Promise((resolve, reject) => {
        const date = new Date();
        const nonce = crypto.randomBytes(16).toString('hex');
        const url = `https://${MESOMB_HOST}/api/${MESOMB_API_VERSION}/${endpoint.replace(/^\//, '')}`;
        const bodyString = body ? JSON.stringify(body) : '';

        const signature = generateSignature(
            'payment', // Internal SDK service name for payment operations
            method,
            url,
            date,
            nonce,
            body
        );

        const options = {
            hostname: MESOMB_HOST,
            port: 443,
            path: `/api/${MESOMB_API_VERSION}/${endpoint.replace(/^\//, '')}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-MeSomb-Application': applicationKey,
                'X-MeSomb-Date': date.getTime().toString(),
                'X-MeSomb-Nonce': nonce,
                'X-MeSomb-OperationMode': mode,
                'Authorization': signature,
                'Content-Length': Buffer.byteLength(bodyString)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                        console.error(`[Mesomb] API Error (${res.statusCode}):`, data);
                        reject(new Error(parsed.message || `Mesomb API error: ${res.statusCode}`));
                    } else {
                        resolve(parsed);
                    }
                } catch (e) {
                    if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                        reject(new Error(`Mesomb API error: ${res.statusCode}`));
                    } else {
                        reject(new Error('Failed to parse MeSomb response'));
                    }
                }
            });
        });

        req.on('error', (e) => {
            console.error('[Mesomb] Connection Error:', e.message);
            reject(e);
        });

        if (bodyString) {
            req.write(bodyString);
        }
        req.end();
    });
}

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

export async function collectPayment(params: CollectPaymentParams): Promise<PaymentResult> {
    try {
        console.log('[Mesomb] Initiating collection (Direct HTTPS):', params);

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
            products: [
                {
                    name: 'Vote NBDance Award',
                    category: 'Voting',
                    quantity: 1,
                    amount: params.amount,
                },
            ],
        };

        const response = await mesombRequest('payment/collect/', 'POST', body);
        console.log('[Mesomb] Payment collection response:', JSON.stringify(response, null, 2));

        if (response.success || response.status === 'SUCCESS' || response.status === 'PENDING') {
            return {
                success: true,
                status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                reference: response.reference || response.transaction?.pk,
                message: 'Payment initiated successfully.',
            };
        }

        return {
            success: false,
            status: 'FAILED',
            error: response.message || 'Payment failed.',
        };
    } catch (error: any) {
        console.error('[Mesomb] Payment error:', error.message);
        return {
            success: false,
            status: 'FAILED',
            error: error.message || 'Payment initiation failed.',
        };
    }
}

export async function checkPaymentStatus(reference: string): Promise<PaymentResult> {
    try {
        const response = await mesombRequest(`payment/transactions/?ids=${reference}&source=MESOMB`, 'GET');

        if (!response || response.length === 0) {
            return {
                success: false,
                status: 'PENDING',
                error: 'Payment is still processing',
            };
        }

        const transaction = response[0];
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
        console.error('[Mesomb] Status check error:', error.message);
        return {
            success: false,
            status: 'PENDING',
            error: 'Payment status check failed',
        };
    }
}

// Dummy for compatibility
export function getMesombClient() {
    console.warn('[Mesomb] getMesombClient is deprecated. Direct HTTPS calls are used.');
    return {
        makeCollect: (params: any) => collectPayment(params),
    };
}

export async function makeWithdrawal(params: any): Promise<PaymentResult> {
    try {
        const response = await mesombRequest('payment/deposit/', 'POST', {
            amount: params.amount,
            service: params.service,
            receiver: params.receiver,
            nonce: params.nonce,
            country: 'CM',
            currency: 'XAF',
        });

        return {
            success: response.success,
            status: response.success ? 'SUCCESS' : 'FAILED',
            reference: response.reference,
            message: response.message
        };
    } catch (error: any) {
        return {
            success: false,
            status: 'FAILED',
            error: error.message
        };
    }
}

export async function getAccountBalance(): Promise<any> {
    try {
        const response = await mesombRequest('payment/status/', 'GET');
        return {
            success: true,
            balance: (response.balances || []).reduce((acc: number, b: any) => acc + (b.value || 0), 0),
            balances: response.balances
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
