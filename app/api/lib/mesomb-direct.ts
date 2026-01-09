/**
 * Mesomb Direct Implementation
 * Updated to use standard https module and SDK-compatible signatures
 */

import crypto from 'crypto';
import https from 'https';

const MESOMB_HOST = 'mesomb.hachther.com';
const MESOMB_API_VERSION = 'v1.1.1';
const MESOMB_ALGORITHM = 'HMAC-SHA1';

const applicationKey = (process.env.MESOMB_APPLICATION_KEY || 'a4120748a7093365013b04a8f42bdd24f299936b').trim();
const accessKey = (process.env.MESOMB_ACCESS_KEY || 'fe3efd4c-cb89-45ef-a18b-d831cf25d1ea').trim();
const secretKey = (process.env.MESOMB_SECRET_KEY || '1bb8c37c-1b92-4428-b060-8716cafcedca').trim();

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

export async function mesombRequestDirect(
    endpoint: string,
    method: string,
    body: any = null
): Promise<any> {
    return new Promise((resolve, reject) => {
        const date = new Date();
        const nonce = crypto.randomBytes(16).toString('hex');
        const url = `https://${MESOMB_HOST}/api/${MESOMB_API_VERSION}/${endpoint.replace(/^\//, '')}`;
        const bodyString = body ? JSON.stringify(body) : '';

        const signature = generateSignature(
            'payment',
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
                'Authorization': signature,
                'Content-Length': Buffer.byteLength(bodyString)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse MeSomb response: ${data}`));
                }
            });
        });

        req.on('error', reject);
        if (bodyString) req.write(bodyString);
        req.end();
    });
}
