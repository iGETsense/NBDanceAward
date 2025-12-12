/**
 * Real-time Transaction Status Hook
 * Uses Firebase onValue for instant payment status updates
 * No more polling - updates appear within milliseconds
 */

import { useState, useEffect, useCallback } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { VOTE_SUCCESS_EVENT } from './useFirebaseData';

export type TransactionStatus = 'creating' | 'pending' | 'completed' | 'failed' | 'init_failed' | 'timeout';

interface TransactionState {
    status: TransactionStatus;
    isLoading: boolean;
    error: string | null;
    completedAt?: number;
    failureReason?: string;
    voteCount?: number;
    candidateId?: string;
}

// Dispatch event to trigger immediate data refresh
function triggerDataRefresh() {
    if (typeof window !== 'undefined') {
        console.log('🎉 [useTransactionStatus] Dispatching vote success event');
        window.dispatchEvent(new CustomEvent(VOTE_SUCCESS_EVENT));
    }
}

/**
 * Hook to listen to a specific transaction's status in real-time
 * @param transactionId The transaction ID to monitor
 * @returns Current state and control functions
 */
export function useTransactionStatus(transactionId: string | null) {
    const [state, setState] = useState<TransactionState>({
        status: 'creating',
        isLoading: true,
        error: null,
    });

    const [hasNotified, setHasNotified] = useState(false);

    useEffect(() => {
        if (!transactionId) {
            setState({ status: 'creating', isLoading: false, error: null });
            return;
        }

        console.log(`[useTransactionStatus] Starting real-time listener for ${transactionId}`);

        const transactionRef = ref(database, `transactions/${transactionId}`);

        const unsubscribe = onValue(transactionRef, (snapshot) => {
            if (!snapshot.exists()) {
                console.warn(`[useTransactionStatus] Transaction ${transactionId} not found`);
                setState({
                    status: 'creating',
                    isLoading: false,
                    error: 'Transaction not found',
                });
                return;
            }

            const data = snapshot.val();
            const newStatus = data.status as TransactionStatus;

            console.log(`[useTransactionStatus] Status update for ${transactionId}: ${newStatus}`);

            setState({
                status: newStatus,
                isLoading: false,
                error: data.failureReason || data.errorDetails || null,
                completedAt: data.completedAt,
                failureReason: data.failureReason,
                voteCount: data.voteCount,
                candidateId: data.candidateId,
            });

            // Trigger data refresh on completion (only once)
            if (newStatus === 'completed' && !hasNotified) {
                setHasNotified(true);
                triggerDataRefresh();
            }
        }, (error) => {
            console.error(`[useTransactionStatus] Error listening to ${transactionId}:`, error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to connect to database',
            }));
        });

        // Cleanup listener on unmount
        return () => {
            console.log(`[useTransactionStatus] Cleaning up listener for ${transactionId}`);
            off(transactionRef);
        };
    }, [transactionId, hasNotified]);

    // Manual reset for new transactions
    const reset = useCallback(() => {
        setState({ status: 'creating', isLoading: true, error: null });
        setHasNotified(false);
    }, []);

    return {
        ...state,
        reset,
        isCompleted: state.status === 'completed',
        isFailed: state.status === 'failed' || state.status === 'init_failed',
        isPending: state.status === 'pending' || state.status === 'creating',
    };
}

/**
 * Enhanced version that also handles the backend verification call
 * Use this when you need to both listen and fallback to polling
 */
export function useTransactionVerification(transactionId: string | null) {
    const status = useTransactionStatus(transactionId);
    const [verifyAttempts, setVerifyAttempts] = useState(0);

    // If stuck in pending for too long, trigger a verify call
    useEffect(() => {
        if (!transactionId || status.isCompleted || status.isFailed) return;

        // After 30 seconds of pending, try to verify manually
        const timeoutId = setTimeout(async () => {
            if (status.isPending) {
                console.log(`[useTransactionVerification] Triggering manual verify for ${transactionId}`);
                try {
                    const response = await fetch('/api/vote/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ transactionId }),
                    });
                    const result = await response.json();
                    console.log(`[useTransactionVerification] Verify result:`, result);
                    setVerifyAttempts(prev => prev + 1);
                } catch (err) {
                    console.error(`[useTransactionVerification] Verify failed:`, err);
                }
            }
        }, 30000); // 30 seconds

        return () => clearTimeout(timeoutId);
    }, [transactionId, status.isPending, status.isCompleted, status.isFailed, verifyAttempts]);

    return {
        ...status,
        verifyAttempts,
    };
}
