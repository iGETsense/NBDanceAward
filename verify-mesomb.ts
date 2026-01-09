
import crypto from 'crypto';

const applicationKey = 'cca4687beac8cea4bb124a6573531b4145a53251';
const accessKey = '509a85ce-4abc-4380-9490-02840169e5f3';
const secretKey = '558f9ad4-0a16-4900-bdbd-16a8d7c6cda9';

const MESOMB_API_BASE = 'https://mesomb.hachther.com/api/v1.1';

function generateSignature(
    method: string,
    endpoint: string,
    date: Date,
    nonce: string,
    body: string,
    secretKey: string,
    accessKey: string
): string {
    const dateStr = date.toISOString();
    const canonicalRequest = [
        method,
        endpoint,
        dateStr,
        nonce,
        body
    ].join('\n');

    const signature = crypto
        .createHmac('sha1', secretKey)
        .update(canonicalRequest)
        .digest('hex');

    return `HMAC-SHA1 Credential=${accessKey}, SignedHeaders=content-type;host;x-mesomb-date;x-mesomb-nonce, Signature=${signature}`;
}

async function testConnection() {
    console.log('Testing MeSomb connection...');
    const endpoint = '/payment/status/';
    const method = 'GET';
    const body = '';
    const date = new Date();
    const nonce = crypto.randomBytes(16).toString('hex');

    const signature = generateSignature(
        method,
        endpoint,
        date,
        nonce,
        body,
        secretKey,
        accessKey
    );

    const url = `${MESOMB_API_BASE}${endpoint}`;

    try {
        console.log(`URL: ${url}`);
        console.log(`X-MeSomb-Application: ${applicationKey}`);
        console.log(`X-MeSomb-Date: ${date.toISOString()}`);
        console.log(`X-MeSomb-Nonce: ${nonce}`);
        console.log(`Authorization: ${signature}`);

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-MeSomb-Application': applicationKey,
                'X-MeSomb-Date': date.toISOString(),
                'X-MeSomb-Nonce': nonce,
                'Authorization': signature,
            },
        });

        const status = response.status;
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = text;
        }

        console.log(`Status: ${status}`);
        console.log('Response:', typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error during test:', error);
    }
}

testConnection();
