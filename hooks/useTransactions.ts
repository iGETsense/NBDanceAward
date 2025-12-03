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

    const fetchTransactions = async () => {
        try {
            const response = await fetch('/api/admin-7f8a9b/transactions');
            const data = await response.json();

            if (data.success) {
                const txArray = data.transactions;

                // Calculate statistics
                const completed = txArray.filter((tx: Transaction) => tx.status === 'completed');
                const pending = txArray.filter((tx: Transaction) => tx.status === 'pending');
                const failed = txArray.filter((tx: Transaction) => tx.status === 'failed');

                // Calculate gross revenue from completed transactions
                const grossRevenue = completed.reduce((sum: number, tx: Transaction) => sum + (tx.amount || 0), 0);

                // Deduct 5% platform fee to get net revenue
                const netRevenue = grossRevenue * 0.95;

                const totalVotes = completed.reduce((sum: number, tx: Transaction) => sum + (tx.voteCount || 0), 0);

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
                setError(null);
            } else {
                setError(data.error || 'Failed to load transactions');
            }
        } catch (err: any) {
            console.error('Error fetching transactions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();

        // Poll every 30 seconds
        const interval = setInterval(fetchTransactions, 30000);
        return () => clearInterval(interval);
    }, []);

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
