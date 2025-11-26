/**
 * Custom Hook for Voting Operations
 * Handles vote submission and payment verification using Firebase Cloud Functions
 */

import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

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
      const submitVoteFunction = httpsCallable<SubmitVoteParams, VoteSubmissionResult>(
        functions,
        'submitVote'
      );

      const result = await submitVoteFunction(params);

      if (!result.data.success) {
        setError(result.data.error || 'Vote submission failed');
        setPaymentStatus('failed');
      } else {
        setPaymentStatus('pending');
      }

      return result.data;
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
      const verifyPaymentFunction = httpsCallable<{ transactionId: string }, PaymentVerificationResult>(
        functions,
        'verifyPayment'
      );

      const result = await verifyPaymentFunction({ transactionId });

      if (!result.data.success && result.data.status !== 'pending') {
        setError(result.data.error || 'Payment verification failed');
      }

      return result.data;
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
    maxAttempts: number = 30,
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
