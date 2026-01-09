
import crypto from 'crypto';

const applicationKey = 'cca4687beac8cea4bb124a6573531b4145a53251';
const accessKey = '509a85ce-4abc-4380-9490-02840169e5f3';
const secretKey = '558f9ad4-0a16-4900-bdbd-16a8d7c6cda9';

function signRequest(
    service: string,
    method: string,
    url: string,
    date: Date,
    nonce: string,
    credentials: { accessKey: string; secretKey: string },
    body: any = {}
) {
    const algorithm = 'HMAC-SHA1';
    const parsedUrl = new URL(url);
    const host = parsedUrl.host; // Correct: no protocol
    const path = encodeURI(parsedUrl.pathname);
    const canonicalQuery = parsedUrl.search ? parsedUrl.search.substring(1) : '';
    const timestamp = date.getTime();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD

    // Headers used in signature
    const headers: Record<string, string> = {
        'content-type': 'application/json',
        'host': host,
        'x-mesomb-date': String(timestamp),
        'x-mesomb-nonce': nonce,
    };

    const headerKeys = Object.keys(headers).sort();
    const canonicalHeaders = headerKeys.map(k => `${k}:${headers[k]}`).join('\n');
    const signedHeaders = headerKeys.join(';');

    const bodyStr = JSON.stringify(body || {});
    const payloadHash = crypto.createHash('sha1').update(bodyStr).digest('hex');

    const canonicalRequest = `${method}\n${path}\n${canonicalQuery}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const scope = `${dateStr}/${service}/mesomb_request`;
    const stringToSign = `${algorithm}\n${timestamp}\n${scope}\n${crypto.createHash('sha1').update(canonicalRequest).digest('hex')}`;

    const signature = crypto.createHmac('sha1', credentials.secretKey).update(stringToSign).digest('hex');

    const authHeader = `${algorithm} Credential=${credentials.accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
        authHeader,
        headers: {
            ...headers,
            'X-MeSomb-Application': applicationKey,
            'Authorization': authHeader,
            'X-MeSomb-Date': String(timestamp),
            'X-MeSomb-Nonce': nonce,
        }
    };
}

async function testConnection() {
    console.log('Testing FIXED MeSomb connection...');
    const url = 'https://mesomb.hachther.com/api/v1.1/payment/status/';
    const date = new Date();
    const nonce = crypto.randomBytes(16).toString('hex');

    const { headers } = signRequest(
        'payment',
        'GET',
        url,
        date,
        nonce,
        { accessKey, secretKey },
        {}
    );

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers as any,
        });

        console.log(`Status: ${response.status}`);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testConnection();
