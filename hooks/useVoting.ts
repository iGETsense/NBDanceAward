/**
 * Custom Hook for Voting Operations
 * Handles vote submission and payment verification using Vercel API Routes
 */

import { useState, useCallback } from 'react';
import { VOTE_SUCCESS_EVENT } from './useFirebaseData';

// Save transaction ID to localStorage for later recovery
const PENDING_TRANSACTION_KEY = 'nbdance_pending_transaction';

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
  status?: 'pending' | 'completed' | 'failed' | 'timeout' | 'creating';
  message?: string;
  error?: string;
}

// Helper to save pending transaction
function savePendingTransaction(transactionId: string, candidateId: string) {
  try {
    localStorage.setItem(PENDING_TRANSACTION_KEY, JSON.stringify({
      transactionId,
      candidateId,
      timestamp: Date.now()
    }));
  } catch (e) {
    // localStorage may not be available
  }
}

// Helper to clear pending transaction
function clearPendingTransaction() {
  try {
    localStorage.removeItem(PENDING_TRANSACTION_KEY);
  } catch (e) {
    // localStorage may not be available
  }
}

// Helper to get pending transaction
export function getPendingTransaction(): { transactionId: string; candidateId: string; timestamp: number } | null {
  try {
    const stored = localStorage.getItem(PENDING_TRANSACTION_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Only return if less than 1 hour old
      if (Date.now() - data.timestamp < 60 * 60 * 1000) {
        return data;
      }
      localStorage.removeItem(PENDING_TRANSACTION_KEY);
    }
  } catch (e) {
    // localStorage may not be available
  }
  return null;
}

// Dispatch event to trigger immediate data refresh
function triggerDataRefresh() {
  if (typeof window !== 'undefined') {
    console.log('🎉 [useVoting] Dispatching vote success event');
    window.dispatchEvent(new CustomEvent(VOTE_SUCCESS_EVENT));
  }
}

export function useVoting() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'completed' | 'failed' | 'timeout'>('idle');
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);

  /**
   * Submit a vote and initiate payment
   */
  const submitVote = useCallback(async (params: SubmitVoteParams): Promise<VoteSubmissionResult> => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    setPaymentStatus('idle');
    setCurrentTransactionId(null);

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
        setCurrentTransactionId(result.transactionId);
        // Save to localStorage for recovery
        savePendingTransaction(result.transactionId, params.candidateId);
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

      if (!result.success && result.status !== 'pending' && result.status !== 'creating') {
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
    maxAttempts: number = 90, // 3 minutes (90 * 2s)
    intervalMs: number = 2000
  ): Promise<PaymentVerificationResult> => {
    setPaymentStatus('pending');

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await verifyPayment(transactionId);

      if (result.success && result.status === 'completed') {
        setPaymentStatus('completed');
        setSuccess(true);
        setError(null);
        clearPendingTransaction();
        // Trigger immediate data refresh so user sees updated vote count
        triggerDataRefresh();
        return result;
      }

      // Handle explicit failure (not timeout)
      if (result.status === 'failed') {
        setPaymentStatus('failed');
        setError(result.error || result.message || 'Payment failed');
        clearPendingTransaction();
        return result;
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    // IMPROVED: Don't mark as failed on timeout - mark as timeout
    // The payment might still succeed via webhook
    setPaymentStatus('timeout');
    const timeoutMessage = 'La vérification a pris trop de temps. Votre paiement est peut-être encore en cours. Vous pouvez vérifier le statut plus tard avec ce numéro: ' + transactionId;
    setError(timeoutMessage);

    // Keep the transaction in localStorage for recovery
    return {
      success: false,
      status: 'timeout',
      message: timeoutMessage,
    };
  }, [verifyPayment]);

  /**
   * Check status of a previously pending transaction
   */
  const checkPendingTransaction = useCallback(async (): Promise<PaymentVerificationResult | null> => {
    const pending = getPendingTransaction();
    if (!pending) return null;

    const result = await verifyPayment(pending.transactionId);

    if (result.success && result.status === 'completed') {
      clearPendingTransaction();
      triggerDataRefresh();
    } else if (result.status === 'failed') {
      clearPendingTransaction();
    }

    return result;
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
    setCurrentTransactionId(null);
  }, []);

  return {
    submitVote,
    verifyPayment,
    pollPaymentStatus,
    checkPendingTransaction,
    resetState,
    isSubmitting,
    isVerifying,
    error,
    success,
    paymentStatus,
    currentTransactionId,
  };
}
