/**
 * Test script to debug Mesomb payment integration
 * Run with: node test-mesomb.js
 */

const { PaymentOperation } = require('@hachther/mesomb');

// Hardcoded Mesomb API credentials
const MESOMB_APPLICATION_KEY = 'a4120748a7093365013b04a8f42bdd24f299936b';
const MESOMB_ACCESS_KEY = 'f6c26b42-24de-4ec6-8b1b-7a808052e335';
const MESOMB_SECRET_KEY = 'e45b1545-1b5a-49c4-aadf-ba4cf700a8dc';

async function testMesombPayment() {
    console.log('Testing Mesomb Payment Integration...\n');

    // Display credentials being used
    console.log('Using hardcoded credentials:');
    console.log('APPLICATION_KEY:', MESOMB_APPLICATION_KEY);
    console.log('ACCESS_KEY:', MESOMB_ACCESS_KEY);
    console.log('SECRET_KEY:', MESOMB_SECRET_KEY);
    console.log('');

    try {
        const client = new PaymentOperation({
            applicationKey: MESOMB_APPLICATION_KEY,
            accessKey: MESOMB_ACCESS_KEY,
            secretKey: MESOMB_SECRET_KEY,
        });

        console.log('Mesomb client created successfully\n');

        const testParams = {
            amount: 100,
            service: 'MTN',
            payer: '650123456', // Test MTN number
            nonce: `test_${Date.now()}`,
            country: 'CM',
            currency: 'XAF',
            customer: {
                email: 'vote@nbdanceaward.com',
                firstName: 'Voter',
                lastName: 'NBDance',
                town: 'Douala',
                region: 'Littoral',
                country: 'CM',
                address: 'Cameroon',
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
                    quantity: 1,
                    amount: 100,
                },
            ],
        };

        console.log('Making test payment with params:');
        console.log(JSON.stringify(testParams, null, 2));
        console.log('');

        const response = await client.makeCollect(testParams);

        console.log('Response received:');
        console.log('Type:', typeof response);
        console.log('Constructor:', response.constructor.name);
        console.log('');

        console.log('Response object:');
        console.log(JSON.stringify(response, null, 2));
        console.log('');

        console.log('Available methods:');
        console.log('isOperationSuccess:', typeof response.isOperationSuccess);
        console.log('isTransactionSuccess:', typeof response.isTransactionSuccess);
        console.log('');

        if (typeof response.isOperationSuccess === 'function') {
            console.log('isOperationSuccess():', response.isOperationSuccess());
        }

        if (typeof response.isTransactionSuccess === 'function') {
            console.log('isTransactionSuccess():', response.isTransactionSuccess());
        }

        console.log('\n✓ Test completed successfully');
    } catch (error) {
        console.error('\n✗ Error occurred:');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        console.error('Full error:', error);
    }
}

testMesombPayment();
