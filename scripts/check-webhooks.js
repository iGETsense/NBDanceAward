/**
 * Script to check webhook health
 * Run: node scripts/check-webhooks.js
 */

const admin = require('firebase-admin');

// Initialize (you'll need service account)
// admin.initializeApp(...);

async function checkWebhookHealth() {
    const db = admin.database();

    // Get all transactions from last 24h
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const transactionsRef = db.ref('transactions');
    const snapshot = await transactionsRef
        .orderByChild('createdAt')
        .startAt(oneDayAgo)
        .once('value');

    const transactions = snapshot.val() || {};

    // Analyze
    let total = 0;
    let completed = 0;
    let pending = 0;
    let failed = 0;
    let withWebhook = 0;
    let withoutWebhook = 0;

    Object.values(transactions).forEach(tx => {
        total++;

        if (tx.status === 'completed') completed++;
        else if (tx.status === 'pending') pending++;
        else if (tx.status === 'failed') failed++;

        if (tx.webhookReceived) withWebhook++;
        else withoutWebhook++;
    });

    console.log('\n📊 WEBHOOK HEALTH REPORT (Last 24h)\n');
    console.log(`Total Transactions: ${total}`);
    console.log(`✅ Completed: ${completed} (${(completed / total * 100).toFixed(1)}%)`);
    console.log(`⏳ Pending: ${pending} (${(pending / total * 100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failed} (${(failed / total * 100).toFixed(1)}%)`);
    console.log(`\n🔔 Webhook Status:`);
    console.log(`✅ Received: ${withWebhook} (${(withWebhook / total * 100).toFixed(1)}%)`);
    console.log(`❌ Missing: ${withoutWebhook} (${(withoutWebhook / total * 100).toFixed(1)}%)`);

    // Check webhookLogs
    const webhookLogsRef = db.ref('webhookLogs');
    const webhookSnapshot = await webhookLogsRef
        .orderByChild('receivedAt')
        .startAt(oneDayAgo)
        .once('value');

    const webhooks = webhookSnapshot.val() || {};
    const webhookCount = Object.keys(webhooks).length;

    console.log(`\n📨 Total Webhooks Received: ${webhookCount}`);

    // Alert if issues
    if (pending > total * 0.1) {
        console.log('\n⚠️  WARNING: More than 10% transactions are pending!');
    }

    if (withoutWebhook > total * 0.05) {
        console.log('\n⚠️  WARNING: More than 5% transactions missing webhooks!');
    }

    if (webhookCount < total * 0.9) {
        console.log('\n⚠️  WARNING: Webhook count lower than transaction count!');
    }

    console.log('\n✅ Health check complete!\n');
}

// Run
checkWebhookHealth().catch(console.error);
