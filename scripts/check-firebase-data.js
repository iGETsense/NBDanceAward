/**
 * Script to check Firebase data
 * Run with: export $(cat .env.local | xargs) && node scripts/check-firebase-data.js
 */

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

// Firebase config (same as in lib/firebase.ts)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

async function checkData() {
    console.log('🔍 Checking Firebase data...\n');

    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    try {
        // Check transactions
        console.log('📊 Checking transactions...');
        const txRef = ref(database, 'transactions');
        const txSnapshot = await get(txRef);

        if (txSnapshot.exists()) {
            const transactions = txSnapshot.val();
            const txArray = Object.values(transactions);
            const completed = txArray.filter(tx => tx.status === 'completed');

            console.log(`  ✅ Total transactions: ${txArray.length}`);
            console.log(`  ✅ Completed: ${completed.length}`);
            console.log(`  ✅ Pending: ${txArray.filter(tx => tx.status === 'pending').length}`);
            console.log(`  ✅ Failed: ${txArray.filter(tx => tx.status === 'failed').length}`);

            const totalRevenue = completed.reduce((sum, tx) => sum + (tx.amount || 0), 0);
            const netRevenue = totalRevenue * 0.95;
            console.log(`  💰 Total revenue (gross): ${totalRevenue} XAF`);
            console.log(`  💰 Net revenue (after 5% fee): ${Math.round(netRevenue)} XAF\n`);
        } else {
            console.log('  ❌ No transactions found\n');
        }

        // Check withdrawals
        console.log('💸 Checking withdrawals...');
        const wdRef = ref(database, 'withdrawals');
        const wdSnapshot = await get(wdRef);

        if (wdSnapshot.exists()) {
            const withdrawals = wdSnapshot.val();
            const wdArray = Object.values(withdrawals);
            const completed = wdArray.filter(w => w.status === 'completed');

            console.log(`  ✅ Total withdrawals: ${wdArray.length}`);
            console.log(`  ✅ Completed: ${completed.length}`);

            const totalWithdrawn = completed.reduce((sum, w) => sum + (w.amount || 0), 0);
            console.log(`  💰 Total withdrawn: ${totalWithdrawn} XAF\n`);
        } else {
            console.log('  ❌ No withdrawals found\n');
        }

        // Check candidates
        console.log('👥 Checking candidates...');
        const candRef = ref(database, 'candidates');
        const candSnapshot = await get(candRef);

        if (candSnapshot.exists()) {
            const candidates = candSnapshot.val();
            const candArray = Object.values(candidates);
            const totalVotes = candArray.reduce((sum, c) => sum + (c.votes || 0), 0);

            console.log(`  ✅ Total candidates: ${candArray.length}`);
            console.log(`  ✅ Total votes: ${totalVotes}\n`);
        } else {
            console.log('  ❌ No candidates found\n');
        }

        console.log('✅ Check complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkData();
