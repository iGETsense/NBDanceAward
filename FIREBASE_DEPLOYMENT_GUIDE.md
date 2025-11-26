# Firebase Cloud Functions Deployment Guide

## Overview

This guide walks you through deploying the secure voting backend with Mesomb payment integration.

## Prerequisites

- [x] Firebase project created
- [x] Firebase CLI installed (`npm install -g firebase-tools`)
- [x] Mesomb account with API credentials
- [x] Node.js 18+ installed

## Step 1: Configure Environment Variables

### Option A: For Local Testing (Emulator)

1. Copy the example configuration:

```bash
cd functions
cp .runtimeconfig.json.example .runtimeconfig.json
```

2. Edit `.runtimeconfig.json` with your actual Mesomb credentials:

```json
{
  "mesomb": {
    "application_key": "your_actual_application_key",
    "access_key": "your_actual_access_key",
    "secret_key": "your_actual_secret_key"
  },
  "vote": {
    "price": "100"
  }
}
```

### Option B: For Production Deployment

Set environment variables using Firebase CLI:

```bash
# Login to Firebase
firebase login

# Set Mesomb credentials
firebase functions:config:set \
  mesomb.application_key="YOUR_APPLICATION_KEY" \
  mesomb.access_key="YOUR_ACCESS_KEY" \
  mesomb.secret_key="YOUR_SECRET_KEY"

# Set vote price (in XAF)
firebase functions:config:set vote.price="100"

# Verify configuration
firebase functions:config:get
```

## Step 2: Test Locally with Emulator

Before deploying to production, test your functions locally:

```bash
cd functions

# Install dependencies (if not already done)
npm install

# Build the functions
npm run build

# Start the Firebase emulator
npm run serve
```

The emulator will start and display URLs like:

```
✔  functions[us-central1-submitVote]: http function initialized (http://localhost:5001/PROJECT_ID/us-central1/submitVote).
✔  functions[us-central1-verifyPayment]: http function initialized (http://localhost:5001/PROJECT_ID/us-central1/verifyPayment).
✔  functions[us-central1-handlePaymentWebhook]: http function initialized (http://localhost:5001/PROJECT_ID/us-central1/handlePaymentWebhook).
```

### Test the Functions

You can test using the Firebase Emulator UI at `http://localhost:4000` or using curl:

```bash
# Test submitVote (replace with your project ID)
curl -X POST http://localhost:5001/YOUR_PROJECT_ID/us-central1/submitVote \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "candidateId": "test-candidate",
      "voteCount": 1,
      "phoneNumber": "+237670000000",
      "paymentMethod": "mtn"
    }
  }'
```

## Step 3: Deploy to Firebase

Once testing is successful, deploy to production:

```bash
# From the project root
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:submitVote,functions:verifyPayment,functions:handlePaymentWebhook
```

Expected output:

```
✔  Deploy complete!

Functions:
  submitVote(us-central1): https://us-central1-PROJECT_ID.cloudfunctions.net/submitVote
  verifyPayment(us-central1): https://us-central1-PROJECT_ID.cloudfunctions.net/verifyPayment
  handlePaymentWebhook(us-central1): https://us-central1-PROJECT_ID.cloudfunctions.net/handlePaymentWebhook
```

## Step 4: Configure Mesomb Webhook

After deployment, configure the webhook in your Mesomb dashboard:

1. Go to <https://mesomb.hachther.com/>
2. Navigate to your application settings
3. Set the webhook URL to:

   ```
   https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/handlePaymentWebhook
   ```

4. Save the configuration

## Step 5: Update Frontend Configuration

Update your Next.js app to use the deployed functions:

1. The `useVoting` hook already uses the Firebase Functions SDK, so no changes needed
2. Ensure your Firebase config in `.env.local` is correct:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 6: Test End-to-End

Test the complete voting flow:

1. Start your Next.js app: `npm run dev`
2. Navigate to a candidate page
3. Click "Vote" button
4. Enter phone number and select payment method
5. Submit vote
6. Complete payment on your phone
7. Verify votes are updated in real-time

## Monitoring and Logs

### View Function Logs

```bash
# View all function logs
firebase functions:log

# View logs for specific function
firebase functions:log --only submitVote

# Follow logs in real-time
firebase functions:log --follow
```

### Firebase Console

Monitor your functions in the Firebase Console:

1. Go to <https://console.firebase.google.com/>
2. Select your project
3. Navigate to Functions
4. View metrics, logs, and performance

## Troubleshooting

### Function deployment fails

**Error:** "Billing account not configured"

- **Solution:** Enable billing for your Firebase project

**Error:** "Insufficient permissions"

- **Solution:** Ensure you're logged in with correct account: `firebase login`

### Function returns error in production

1. Check logs: `firebase functions:log`
2. Verify environment variables: `firebase functions:config:get`
3. Check Mesomb credentials are correct
4. Verify database rules allow function access

### Payment not processing

1. Check Mesomb dashboard for transaction status
2. Verify webhook URL is configured correctly
3. Check function logs for errors
4. Ensure phone number format is correct (+237XXXXXXXXX)

## Security Checklist

- [x] Environment variables configured (not in code)
- [x] `.runtimeconfig.json` added to `.gitignore`
- [x] Database rules properly configured
- [x] CORS configured if needed
- [x] Webhook endpoint secured
- [x] API credentials rotated regularly

## Cost Optimization

### Free Tier Limits (Spark Plan)

- 125K invocations/month
- 40K GB-seconds/month
- 40K CPU-seconds/month

### Paid Plan (Blaze)

- Pay as you go
- First 2M invocations free
- $0.40 per million invocations after

### Tips to Reduce Costs

1. Optimize function execution time
2. Use appropriate memory allocation
3. Implement caching where possible
4. Monitor usage regularly

## Next Steps

After successful deployment:

1. **Monitor Performance**
   - Set up alerts for errors
   - Monitor response times
   - Track payment success rates

2. **Implement Analytics**
   - Track voting patterns
   - Monitor payment methods
   - Analyze user behavior

3. **Add Features**
   - Email receipts
   - SMS confirmations
   - Vote history

4. **Scale as Needed**
   - Increase function memory if needed
   - Add regional deployments
   - Implement caching layer

## Support

For issues or questions:

- Firebase Documentation: <https://firebase.google.com/docs/functions>
- Mesomb Documentation: <https://mesomb.hachther.com/en/api/schema/>
- Project Documentation: See `README_BACKEND.md`

---

**Last Updated:** 2025-11-26  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
