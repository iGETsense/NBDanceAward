
import { PaymentOperation } from '@hachther/mesomb';

const applicationKey = 'cca4687beac8cea4bb124a6573531b4145a53251';
const accessKey = '509a85ce-4abc-4380-9490-02840169e5f3';
const secretKey = '558f9ad4-0a16-4900-bdbd-16a8d7c6cda9';

async function testSDK() {
    const payment = new PaymentOperation({
        applicationKey,
        accessKey,
        secretKey,
    });

    console.log('SDK initialized');

    // We want to see how it signs things. 
    // Since we can't easily intercept the internal fetch without a proxy,
    // we'll try to call something and catch the error if it fails, 
    // but the SDK doesn't expose the signature easily.

    // However, we can use the 'Signature' class if it's exported, but it's likely internal.

    // Let's try to initiate a collect with a dummy number.
    try {
        console.log('Initiating collect...');
        const response = await payment.makeCollect({
            amount: 100,
            service: 'MTN',
            payer: '670000000',
            nonce: 'test_' + Date.now(),
            country: 'CM',
            currency: 'XAF',
        });
        console.log('Response:', JSON.stringify(response, null, 2));
    } catch (error: any) {
        console.log('Error Name:', error.name);
        console.log('Error Message:', error.message);
        if (error.fullError) {
            console.log('Full Error:', error.fullError);
        } else {
            console.log('Error:', error);
        }
    }
}

testSDK();
