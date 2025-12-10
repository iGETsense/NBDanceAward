/**
 * Custom Hook for Real-time Transaction Monitoring
 * Listens to Firebase transactions and provides statistics
 */

import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { database, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface Transaction {
    id: string;
    candidateId: string;
    voteCount: number;
    phoneNumber: string;
    paymentMethod: string;
    operator: string;
    amount: number;
    mesombReference: string;
    status: 'creating' | 'pending' | 'completed' | 'failed' | 'init_failed';
    createdAt: number;
    completedAt?: number;
    failedAt?: number;
    // Enhanced fields for debugging and reconciliation
    mesombResponse?: {
        success: boolean;
        message?: string;
        reference?: string;
    };
    errorDetails?: string | null;
    reconciliationStatus?: 'needs_review' | null;
    failureReason?: string;
}

export interface TransactionStats {
    totalTransactions: number;
    completedTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    totalRevenue: number;
    netRevenue: number;
    totalVotes: number;
    averageTransactionValue: number;
}

export function useTransactions(limit: number = 100) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState<TransactionStats>({
        totalTransactions: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
        totalRevenue: 0,
        netRevenue: 0,
        totalVotes: 0,
        averageTransactionValue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        let intervalId: NodeJS.Timeout | null = null;

        const fetchTransactions = async () => {
            try {
                // Get current user token if available
                const user = auth.currentUser;
                console.log(`[Transactions] Current user: ${user ? user.uid : 'null'}`);
                const token = user ? await user.getIdToken() : null;

                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch('/api/admin-7f8a9b/transactions', {
                    headers
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`[Transactions] Fetch failed: ${response.status} ${response.statusText}`, errorText);
                    throw new Error(`Failed to fetch transactions: ${response.status} ${errorText}`);
                }

                const result = await response.json();

                if (isMounted && result.success) {
                    const txArray = result.transactions || [];

                    // Calculate statistics
                    const completed = txArray.filter((tx: Transaction) => tx.status === 'completed');
                    const pending = txArray.filter((tx: Transaction) => tx.status === 'pending' || tx.status === 'creating');
                    const failed = txArray.filter((tx: Transaction) => tx.status === 'failed' || tx.status === 'init_failed');

                    // Calculate total votes first
                    const totalVotes = completed.reduce((sum: number, tx: Transaction) => sum + tx.voteCount, 0);

                    // Calculate gross revenue based on Total Votes * 105 XAF (as per user request)
                    const PRICE_PER_VOTE = 105;
                    const grossRevenue = totalVotes * PRICE_PER_VOTE;

                    // Deduct 5% platform fee to get net revenue
                    const netRevenue = grossRevenue * 0.95;

                    setTransactions(txArray);
                    setStats({
                        totalTransactions: txArray.length,
                        completedTransactions: completed.length,
                        pendingTransactions: pending.length,
                        failedTransactions: failed.length,
                        totalRevenue: Math.round(grossRevenue), // Store as Gross (Votes * 105)
                        netRevenue: Math.round(netRevenue),     // Store as Net (Gross * 0.95)
                        totalVotes,
                        averageTransactionValue: completed.length > 0
                            ? Math.round(grossRevenue / completed.length)
                            : 0,
                    });
                    setLoading(false);
                }
            } catch (err: any) {
                console.error('Error fetching transactions:', err);
                if (isMounted) {
                    setError('Failed to load transactions');
                    setLoading(false);
                }
            }
        };

        // Wait for auth state to be ready before fetching
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is authenticated, fetch transactions
                fetchTransactions();

                // Set up polling interval
                if (intervalId) clearInterval(intervalId);
                intervalId = setInterval(fetchTransactions, 30000);
            } else {
                // No user authenticated
                if (isMounted) {
                    setLoading(false);
                    setError('Authentication required');
                }
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
            if (intervalId) clearInterval(intervalId);
        };
    }, [limit]);

    return {
        transactions,
        stats,
        loading,
        error,
    };
}

/**
 * Get recent transactions (last 24 hours)
 */
export function useRecentTransactions() {
    const { transactions, loading, error } = useTransactions(1000);

    const recentTransactions = transactions.filter(tx => {
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
        return (tx.createdAt || 0) > twentyFourHoursAgo;
    });

    return {
        transactions: recentTransactions,
        loading,
        error,
    };
}

/**
 * Get transactions by status
 */
export function useTransactionsByStatus(status: 'pending' | 'completed' | 'failed') {
    const { transactions, loading, error } = useTransactions();

    const filteredTransactions = transactions.filter(tx => tx.status === status);

    return {
        transactions: filteredTransactions,
        loading,
        error,
    };
}
