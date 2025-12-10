/**
 * Custom Hook for Voting Operations
 * Handles vote submission and payment verification using Vercel API Routes
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';

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
   * Listen to transaction updates in real-time
   * This provides instant feedback when webhook updates the transaction
   */
  const useTransactionListener = useCallback((transactionId: string | null) => {
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
      if (!transactionId) {
        setIsListening(false);
        return;
      }

      console.log(`[useVoting] Starting real-time listener for transaction: ${transactionId}`);
      setIsListening(true);

      const transactionRef = ref(database, `transactions/${transactionId}`);

      // Listen for changes to the transaction
      const unsubscribe = onValue(transactionRef, (snapshot) => {
        if (snapshot.exists()) {
          const transaction = snapshot.val();

          console.log(`[useVoting] Real-time update received:`, {
            transactionId,
            status: transaction.status,
            webhookReceived: transaction.webhookReceived,
          });

          // Update state based on transaction status
          if (transaction.status === 'completed') {
            setPaymentStatus('completed');
            setSuccess(true);
            setError(null);
            console.log(`[useVoting] ✓ Payment confirmed via real-time listener!`);
          } else if (transaction.status === 'failed') {
            setPaymentStatus('failed');
            setSuccess(false);
            setError(
              transaction.errorDetails ||
              'Le paiement a échoué. Veuillez réessayer.'
            );
            console.log(`[useVoting] ✗ Payment failed:`, transaction.errorDetails);
          }
        }
      }, (error) => {
        console.error('[useVoting] Real-time listener error:', error);
        // Don't set error state - polling will continue as fallback
      });

      // Cleanup: stop listening when component unmounts or transactionId changes
      return () => {
        console.log(`[useVoting] Stopping real-time listener for transaction: ${transactionId}`);
        off(transactionRef);
        setIsListening(false);
      };
    }, [transactionId]);

    return isListening;
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
   * Improved payment monitoring with BOTH real-time listener AND polling
   * This dual approach ensures payment status is detected even if:
   * - Webhook arrives immediately (listener catches it)
   * - Network is unstable (polling catches it)
   * - User closes and reopens app (listener catches it on reopen)
   */
  const monitorPaymentWithListener = useCallback(async (
    transactionId: string,
    maxAttempts: number = 90, // 3 minutes
    intervalMs: number = 2000
  ): Promise<PaymentVerificationResult> => {
    console.log(`[useVoting] Starting dual monitoring (listener + polling) for ${transactionId}`);
    setPaymentStatus('pending');

    // Track if we've already detected completion to avoid race conditions
    let completed = false;

    // Set up real-time listener
    const transactionRef = ref(database, `transactions/${transactionId}`);
    const unsubscribe = onValue(transactionRef, (snapshot) => {
      if (snapshot.exists() && !completed) {
        const transaction = snapshot.val();

        if (transaction.status === 'completed') {
          completed = true;
          setPaymentStatus('completed');
          setSuccess(true);
          setError(null);
          console.log(`[useVoting] ✓ Payment confirmed via real-time listener!`);
        } else if (transaction.status === 'failed') {
          completed = true;
          setPaymentStatus('failed');
          setError(transaction.errorDetails || 'Le paiement a échoué');
          console.log(`[useVoting] ✗ Payment failed via real-time listener`);
        }
      }
    });

    // Also poll as fallback (in case listener fails due to network issues)
    for (let attempt = 0; attempt < maxAttempts && !completed; attempt++) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));

      if (completed) {
        // Listener already detected completion
        break;
      }

      const result = await verifyPayment(transactionId);

      if (result.success && result.status === 'completed') {
        completed = true;
        setPaymentStatus('completed');
        setSuccess(true);
        setError(null);
        off(transactionRef); // Stop listener
        console.log(`[useVoting] ✓ Payment confirmed via polling`);
        return result;
      }

      if (result.error && result.status !== 'pending') {
        completed = true;
        setPaymentStatus('failed');
        setError(result.error);
        off(transactionRef); // Stop listener
        console.log(`[useVoting] ✗ Payment failed via polling`);
        return result;
      }
    }

    // Stop listener after max attempts
    off(transactionRef);

    if (!completed) {
      setPaymentStatus('failed');
      const timeoutError = 'La vérification du paiement a expiré. Si vous avez été débité, vos votes seront ajoutés automatiquement.';
      setError(timeoutError);
      return {
        success: false,
        status: 'pending',
        error: timeoutError,
      };
    }

    return {
      success: true,
      status: 'completed',
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
    monitorPaymentWithListener, // New: dual listener + polling approach
    resetState,
    isSubmitting,
    isVerifying,
    error,
    success,
    paymentStatus,
  };
}
