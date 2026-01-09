/**
 * Mesomb Direct Implementation
 * Synchronized with the working mesomb.ts code
 */

import crypto from 'crypto';

const MESOMB_API_BASE = 'https://mesomb.hachther.com/api/v1.1';
const ALGORITHM = 'HMAC-SHA1';

// Credentials MUST be defined in .env

function sha1(content: string): string {
    return crypto.createHash('sha1').update(content).digest('hex');
}

function getSdkHost(urlStr: string): string {
    try {
        const url = new URL(urlStr);
        return `${url.protocol}//${url.host}`;
    } catch (e) {
        return 'https://mesomb.hachther.com';
    }
}

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

    const headers: Record<string, string> = {
        'host': getSdkHost(urlStr),
        'x-mesomb-date': String(timestamp),
        'x-mesomb-nonce': nonce
    };

    if (method !== 'GET' || body) {
        headers['content-type'] = 'application/json';
    }

    const headersKeys = Object.keys(headers).sort();
    const canonicalHeaders = headersKeys.map(key => `${key}:${headers[key]}`).join('\n');
    const signedHeaders = headersKeys.join(';');
    const payloadHash = sha1(body ? JSON.stringify(body) : '{}');
    const path = encodeURI(url.pathname);

    let canonicalQuery = '';
    if (url.search) {
        canonicalQuery = url.search.substring(1);
    }

    const canonicalRequest = [method, path, canonicalQuery, canonicalHeaders, signedHeaders, payloadHash].join('\n');
    const scope = `${date.getFullYear()}${date.getMonth()}${date.getDate()}/${service}/mesomb_request`;
    const stringToSign = [ALGORITHM, timestamp, scope, sha1(canonicalRequest)].join('\n');

    const signature = crypto.createHmac('sha1', credentials.secretKey).update(stringToSign).digest('hex');

    return `${ALGORITHM} Credential=${credentials.accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

export async function mesombRequestDirect(
    endpoint: string,
    method: string,
    body: any = null
): Promise<any> {
    const applicationKey = (process.env.MESOMB_APPLICATION_KEY || '').trim();
    const accessKey = (process.env.MESOMB_ACCESS_KEY || '').trim();
    const secretKey = (process.env.MESOMB_SECRET_KEY || '').trim();

    const date = new Date();
    const nonce = crypto.randomBytes(16).toString('hex');
    const url = `${MESOMB_API_BASE}${endpoint}`;
    const validBody = (method === 'GET' && !body) ? null : (body || {});

    const signature = signRequest('payment', method, url, date, nonce, validBody, { accessKey, secretKey });

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

    const response = await fetch(url, {
        method,
        headers,
        body: validBody ? JSON.stringify(validBody) : undefined,
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
}
