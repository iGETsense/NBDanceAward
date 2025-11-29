/**
 * Custom Hook for Real-time Transaction Monitoring
 * Listens to Firebase transactions and provides statistics
 */

import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '@/lib/firebase';

export interface Transaction {
    id: string;
    candidateId: string;
    voteCount: number;
    phoneNumber: string;
    paymentMethod: string;
    operator: string;
    amount: number;
    mesombReference: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: number;
    completedAt?: number;
}

export interface TransactionStats {
    totalTransactions: number;
    completedTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    totalRevenue: number;
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
        totalVotes: 0,
        averageTransactionValue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            // Listen to all transactions
            const transactionsRef = ref(database, 'transactions');
            const transactionsQuery = query(
                transactionsRef,
                orderByChild('createdAt'),
                limitToLast(limit)
            );

            const unsubscribe = onValue(
                transactionsQuery,
                (snapshot) => {
                    const data = snapshot.val();

                    if (data) {
                        // Convert to array and sort by newest first
                        const txArray = Object.entries(data).map(([id, tx]) => ({
                            id,
                            ...(tx as Omit<Transaction, 'id'>),
                        }));

                        // Sort by creation date (newest first)
                        txArray.sort((a, b) => b.createdAt - a.createdAt);

                        // Calculate statistics
                        const completed = txArray.filter(tx => tx.status === 'completed');
                        const pending = txArray.filter(tx => tx.status === 'pending');
                        const failed = txArray.filter(tx => tx.status === 'failed');

                        // Calculate gross revenue from completed transactions
                        const grossRevenue = completed.reduce((sum, tx) => sum + tx.amount, 0);

                        // Deduct 5% platform fee to get net revenue
                        const netRevenue = grossRevenue * 0.95;

                        const totalVotes = completed.reduce((sum, tx) => sum + tx.voteCount, 0);

                        setTransactions(txArray);
                        setStats({
                            totalTransactions: txArray.length,
                            completedTransactions: completed.length,
                            pendingTransactions: pending.length,
                            failedTransactions: failed.length,
                            totalRevenue: Math.round(netRevenue), // Net revenue after 5% fee
                            totalVotes,
                            averageTransactionValue: completed.length > 0
                                ? Math.round(netRevenue / completed.length)
                                : 0,
                        });
                    } else {
                        setTransactions([]);
                    }

                    setLoading(false);
                },
                (err) => {
                    console.error('Error fetching transactions:', err);
                    setError('Failed to load transactions');
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        } catch (err: any) {
            console.error('Error setting up transaction listener:', err);
            setError(err.message);
            setLoading(false);
        }
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
