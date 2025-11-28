# Vercel API Routes Migration Guide

## Overview

Your payment functions have been successfully migrated from Firebase Cloud Functions to Vercel API Routes! This simplifies deployment - everything now deploys together to Vercel.

## What Changed

### Before (Firebase Functions)

- Separate deployment: `firebase deploy --only functions`
- Functions in `functions/src/`
- Used Firebase callable functions
- Required Firebase Functions configuration

### After (Vercel API Routes)

- Single deployment: `vercel deploy` or `git push`
- API routes in `app/api/`
- Uses standard HTTP fetch
- Uses environment variables

## API Endpoints

### 1. Submit Vote

**Endpoint:** `POST /api/vote/submit`

**Request Body:**

```json
{
  "candidateId": "string",
  "voteCount": number,
  "phoneNumber": "string",
  "paymentMethod": "mobile" | "orange"
}
```

**Response:**

```json
{
  "success": true,
  "transactionId": "string",
  "reference": "string",
  "amount": number,
  "message": "string"
}
```

### 2. Verify Payment

**Endpoint:** `POST /api/vote/verify`

**Request Body:**

```json
{
  "transactionId": "string"
}
```

**Response:**

```json
{
  "success": true,
  "status": "completed" | "pending" | "failed",
  "message": "string"
}
```

### 3. Payment Webhook

**Endpoint:** `POST /api/webhook/payment`

**Request Body:**

```json
{
  "reference": "string",
  "status": "SUCCESS" | "FAILED"
}
```

## Environment Variables Required

Add these to your `.env.local` file and Vercel dashboard:

```bash
# Mesomb API Credentials
MESOMB_APPLICATION_KEY=your_application_key
MESOMB_ACCESS_KEY=your_access_key
MESOMB_SECRET_KEY=your_secret_key

# Vote Configuration
NEXT_PUBLIC_VOTE_PRICE=100
```

## Deployment Steps

### 1. Local Development

```bash
# Install dependencies (already done)
pnpm install

# Add environment variables to .env.local
# Then run dev server
pnpm dev
```

### 2. Vercel Deployment

```bash
# Option 1: Git push (automatic deployment)
git add .
git commit -m "Migrate to Vercel API routes"
git push origin main

# Option 2: Manual deployment
vercel deploy --prod
```

### 3. Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all the variables from `.env.local`
4. Redeploy if needed

## Benefits of This Migration

✅ **Simpler Deployment** - One command instead of two separate deployments
✅ **Better Integration** - API routes are part of your Next.js app
✅ **Faster Development** - No need to deploy functions separately for testing
✅ **Cost Effective** - Vercel's serverless functions are included in your plan
✅ **Better Performance** - API routes run on the same infrastructure as your frontend
✅ **No Firebase Functions Linting Issues** - No more ESLint configuration conflicts

## Files Created

- `app/api/lib/mesomb.ts` - Mesomb payment service
- `app/api/lib/validation.ts` - Vote validation utilities
- `app/api/vote/submit/route.ts` - Submit vote endpoint
- `app/api/vote/verify/route.ts` - Verify payment endpoint
- `app/api/webhook/payment/route.ts` - Payment webhook endpoint

## Files Modified

- `hooks/useVoting.ts` - Updated to use fetch instead of Firebase callable functions

## Firebase Functions (Optional)

You can keep the Firebase Functions code in `functions/` for backup, or delete it if you're confident with the Vercel migration. The Vercel API routes are fully functional replacements.

## Testing

Test the voting flow locally:

1. Start dev server: `pnpm dev`
2. Try submitting a vote
3. The API routes will handle the payment processing

## Webhook Configuration

Update your Mesomb webhook URL to:

```
https://your-domain.vercel.app/api/webhook/payment
```

This will allow Mesomb to automatically notify your app when payments are confirmed.
