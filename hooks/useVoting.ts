/**
 * Custom Hook for Voting Operations
 * Handles vote submission and payment verification using Vercel API Routes
 */

import { useState, useCallback } from 'react';

export interface SubmitVoteParams {
  candidateId: string;
  voteCount: number;
  phoneNumber: string;
  paymentMethod: string;
}

export interface VoteSubmissionResult {
  success: boolean;
  transactionId?: string;
  reference?: string;
  amount?: number;
  message?: string;
  error?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  status?: 'pending' | 'completed' | 'failed';
  message?: string;
  error?: string;
}

export function useVoting() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'completed' | 'failed'>('idle');

  /**
   * Submit a vote and initiate payment
   */
  const submitVote = useCallback(async (params: SubmitVoteParams): Promise<VoteSubmissionResult> => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    setPaymentStatus('idle');

    try {
      const response = await fetch('/api/vote/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Vote submission failed');
        setPaymentStatus('failed');
      } else {
        setPaymentStatus('pending');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while submitting vote';
      setError(errorMessage);
      setPaymentStatus('failed');
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * Verify payment status
   */
  const verifyPayment = useCallback(async (transactionId: string): Promise<PaymentVerificationResult> => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/vote/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      });

      const result = await response.json();

      if (!result.success && result.status !== 'pending') {
        setError(result.error || 'Payment verification failed');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while verifying payment';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsVerifying(false);
    }
  }, []);

  /**
   * Poll payment status until confirmed or timeout
   */
  const pollPaymentStatus = useCallback(async (
    transactionId: string,
    maxAttempts: number = 90, // Increased to 3 minutes (90 * 2s)
    intervalMs: number = 2000
  ): Promise<PaymentVerificationResult> => {
    setPaymentStatus('pending');

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await verifyPayment(transactionId);

      if (result.success && result.status === 'completed') {
        setPaymentStatus('completed');
        setSuccess(true);
        setError(null);
        return result;
      }

      if (result.error) {
        setPaymentStatus('failed');
        setError(result.error);
        return result;
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    setPaymentStatus('failed');
    const timeoutError = 'Payment verification timed out. Please check back later.';
    setError(timeoutError);
    return {
      success: false,
      status: 'pending',
      error: timeoutError,
    };
  }, [verifyPayment]);

  /**
   * Reset all states
   */
  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
    setPaymentStatus('idle');
    setIsSubmitting(false);
    setIsVerifying(false);
  }, []);

  return {
    submitVote,
    verifyPayment,
    pollPaymentStatus,
    resetState,
    isSubmitting,
    isVerifying,
    error,
    success,
    paymentStatus,
  };
}
