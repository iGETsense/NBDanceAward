# Voting System Integration Guide

## Overview

This guide explains how to integrate the voting functionality into your application pages using the `useVoting` hook.

## Quick Start

### 1. Import the Hook

```typescript
import { useVoting } from '@/hooks/useVoting';
```

### 2. Use in Your Component

```typescript
export default function CandidatePage() {
  const { submitVote, pollPaymentStatus, isSubmitting, error } = useVoting();
  
  const handleVote = async () => {
    // Submit vote and initiate payment
    const result = await submitVote({
      candidateId: 'candidate-id',
      voteCount: 1,
      phoneNumber: '+237670000000',
      paymentMethod: 'mtn'
    });
    
    if (result.success && result.transactionId) {
      // Poll for payment confirmation
      const paymentResult = await pollPaymentStatus(result.transactionId);
      
      if (paymentResult.success) {
        // Payment confirmed! Show success message
        console.log('Vote submitted successfully!');
      }
    }
  };
  
  return (
    <button onClick={handleVote} disabled={isSubmitting}>
      {isSubmitting ? 'Processing...' : 'Vote Now'}
    </button>
  );
}
```

## Complete Example with UI

Here's a complete example with form validation and error handling:

```typescript
'use client';

import { useState } from 'react';
import { useVoting } from '@/hooks/useVoting';
import { validatePhoneNumber } from '@/lib/phoneValidation';

interface VotingFormProps {
  candidateId: string;
  candidateName: string;
  onSuccess?: () => void;
}

export function VotingForm({ candidateId, candidateName, onSuccess }: VotingFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [voteCount, setVoteCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'mtn' | 'orange'>('mtn');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'polling' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const { submitVote, pollPaymentStatus, isSubmitting, error } = useVoting();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.isValid) {
      setMessage(validation.error || 'Invalid phone number');
      setStatus('error');
      return;
    }

    try {
      setStatus('submitting');
      setMessage('Initiating payment...');

      // Submit vote
      const result = await submitVote({
        candidateId,
        voteCount,
        phoneNumber: validation.formatted!,
        paymentMethod,
      });

      if (!result.success) {
        setMessage(result.error || 'Failed to initiate payment');
        setStatus('error');
        return;
      }

      // Show payment instructions
      setMessage('Please complete payment on your phone. Waiting for confirmation...');
      setStatus('polling');

      // Poll for payment confirmation
      const paymentResult = await pollPaymentStatus(result.transactionId!, 30, 2000);

      if (paymentResult.success && paymentResult.status === 'completed') {
        setMessage(`Success! ${voteCount} vote(s) added to ${candidateName}`);
        setStatus('success');
        onSuccess?.();
      } else {
        setMessage(paymentResult.error || 'Payment verification timed out. Please check back later.');
        setStatus('error');
      }
    } catch (err: any) {
      setMessage(err.message || 'An unexpected error occurred');
      setStatus('error');
    }
  };

  const votePrice = 100; // XAF per vote
  const totalAmount = voteCount * votePrice;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+237 6XX XXX XXX"
          className="w-full px-4 py-2 border rounded-lg"
          disabled={isSubmitting}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Number of Votes
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={voteCount}
          onChange={(e) => setVoteCount(parseInt(e.target.value))}
          className="w-full px-4 py-2 border rounded-lg"
          disabled={isSubmitting}
          required
        />
        <p className="text-sm text-gray-600 mt-1">
          Total: {totalAmount} XAF
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Payment Method
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="mtn"
              checked={paymentMethod === 'mtn'}
              onChange={(e) => setPaymentMethod(e.target.value as 'mtn')}
              disabled={isSubmitting}
            />
            <span className="ml-2">MTN Mobile Money</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="orange"
              checked={paymentMethod === 'orange'}
              onChange={(e) => setPaymentMethod(e.target.value as 'orange')}
              disabled={isSubmitting}
            />
            <span className="ml-2">Orange Money</span>
          </label>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          status === 'success' ? 'bg-green-100 text-green-800' :
          status === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? 'Initiating Payment...' :
         status === 'polling' ? 'Waiting for Payment...' :
         `Vote for ${candidateName} (${totalAmount} XAF)`}
      </button>
    </form>
  );
}
```

## API Reference

### `useVoting()` Hook

Returns an object with the following properties:

#### Methods

**`submitVote(params: SubmitVoteParams): Promise<VoteSubmissionResult>`**

Initiates a vote and payment.

Parameters:

- `candidateId` (string): ID of the candidate
- `voteCount` (number): Number of votes (1-100)
- `phoneNumber` (string): Phone number in format +237XXXXXXXXX
- `paymentMethod` (string): 'mtn' or 'orange'

Returns:

- `success` (boolean): Whether submission succeeded
- `transactionId` (string): Transaction ID for polling
- `reference` (string): Mesomb payment reference
- `amount` (number): Total amount in XAF
- `message` (string): User-friendly message
- `error` (string): Error message if failed

**`verifyPayment(transactionId: string): Promise<PaymentVerificationResult>`**

Checks payment status once.

Parameters:

- `transactionId` (string): Transaction ID from submitVote

Returns:

- `success` (boolean): Whether payment is confirmed
- `status` ('pending' | 'completed' | 'failed'): Payment status
- `message` (string): Status message
- `error` (string): Error message if failed

**`pollPaymentStatus(transactionId: string, maxAttempts?: number, intervalMs?: number): Promise<PaymentVerificationResult>`**

Polls payment status until confirmed or timeout.

Parameters:

- `transactionId` (string): Transaction ID from submitVote
- `maxAttempts` (number, optional): Max polling attempts (default: 30)
- `intervalMs` (number, optional): Interval between attempts in ms (default: 2000)

Returns: Same as `verifyPayment`

#### State

- `isSubmitting` (boolean): True while submitting vote
- `isVerifying` (boolean): True while verifying payment
- `error` (string | null): Last error message

## Payment Flow

```
1. User clicks "Vote"
   ↓
2. submitVote() called
   ↓
3. Payment initiated with Mesomb
   ↓
4. User receives payment prompt on phone
   ↓
5. pollPaymentStatus() starts polling
   ↓
6. User completes payment
   ↓
7. Payment confirmed
   ↓
8. Votes updated in database
   ↓
9. UI shows success message
```

## Error Handling

Common errors and how to handle them:

```typescript
const result = await submitVote({...});

if (!result.success) {
  switch (result.error) {
    case 'Invalid phone number':
      // Show phone number validation error
      break;
    case 'Candidate not found':
      // Show candidate error
      break;
    case 'Payment initiation failed':
      // Show payment error, suggest retry
      break;
    default:
      // Show generic error
  }
}
```

## Best Practices

1. **Always validate phone numbers** before submission
2. **Show clear payment instructions** to users
3. **Implement timeout handling** for payment polling
4. **Provide retry options** if payment fails
5. **Show loading states** during submission and polling
6. **Clear form** after successful vote
7. **Log errors** for debugging but show user-friendly messages

## Testing

### Test with Emulator

```typescript
// In development, functions connect to emulator automatically
// if NEXT_PUBLIC_FIREBASE_USE_EMULATOR is set

// .env.local
NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true
```

### Mock Payments

For testing without real payments, you can mock the Mesomb service in your Cloud Functions.

## Troubleshooting

### "Payment verification timed out"

- Increase `maxAttempts` or `intervalMs` in pollPaymentStatus
- Check if user completed payment on their phone
- Verify Mesomb webhook is configured

### "Invalid phone number"

- Ensure phone number includes country code (+237)
- Use the `validatePhoneNumber` utility
- Check operator detection logic

### "Candidate not found"

- Verify candidate exists in database
- Check candidateId is correct
- Ensure database rules allow read access

## Next Steps

- Implement vote history tracking
- Add email/SMS receipts
- Create admin dashboard for monitoring
- Add analytics for voting patterns

---

**Related Documentation:**

- [Firebase Deployment Guide](./FIREBASE_DEPLOYMENT_GUIDE.md)
- [Firebase Functions Config](./FIREBASE_FUNCTIONS_CONFIG.md)
- [Backend Setup Guide](./BACKEND_SETUP_GUIDE.md)
