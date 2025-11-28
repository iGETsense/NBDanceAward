/**
 * Test script to debug Mesomb payment integration
 * Run with: node test-mesomb.js
 */

const { PaymentOperation } = require('@hachther/mesomb');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=:#]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim();
            process.env[key] = value;
        }
    });
}

async function testMesombPayment() {
    console.log('Testing Mesomb Payment Integration...\n');

    // Check environment variables
    console.log('Environment variables:');
    console.log('MESOMB_APPLICATION_KEY:', process.env.MESOMB_APPLICATION_KEY ? '✓ Set' : '✗ Missing');
    console.log('MESOMB_ACCESS_KEY:', process.env.MESOMB_ACCESS_KEY ? '✓ Set' : '✗ Missing');
    console.log('MESOMB_SECRET_KEY:', process.env.MESOMB_SECRET_KEY ? '✓ Set' : '✗ Missing');
    console.log('');

    if (!process.env.MESOMB_APPLICATION_KEY || !process.env.MESOMB_ACCESS_KEY || !process.env.MESOMB_SECRET_KEY) {
        console.error('ERROR: Missing Mesomb credentials in .env.local');
        process.exit(1);
    }

    try {
        const client = new PaymentOperation({
            applicationKey: process.env.MESOMB_APPLICATION_KEY,
            accessKey: process.env.MESOMB_ACCESS_KEY,
            secretKey: process.env.MESOMB_SECRET_KEY,
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
