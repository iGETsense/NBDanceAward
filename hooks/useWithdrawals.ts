/**
 * Custom Hook for Withdrawal History
 * Listens to Firebase withdrawals and provides the list
 */

import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { database, auth } from '@/lib/firebase';

export interface Withdrawal {
    id: string;
    phoneNumber: string;
    operator: string;
    amount: number;
    mesombReference: string;
    status: 'completed' | 'pending' | 'failed';
    createdAt: number;
}

export function useWithdrawals(limit: number = 50) {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchWithdrawals = async () => {
            try {
                // Get current user token if available
                const user = auth.currentUser;
                const token = user ? await user.getIdToken() : null;

                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch('/api/admin-7f8a9b/withdrawals', {
                    headers
                });
                if (!response.ok) throw new Error('Failed to fetch withdrawals');

                const result = await response.json();

                if (isMounted && result.success) {
                    const withdrawalArray = result.withdrawals || [];
                    setWithdrawals(withdrawalArray);
                    setLoading(false);
                }
            } catch (err: any) {
                console.error('Error fetching withdrawals:', err);
                if (isMounted) {
                    setError('Failed to load withdrawals');
                    setLoading(false);
                }
            }
        };

        fetchWithdrawals();

        // Poll every 30 seconds
        const intervalId = setInterval(fetchWithdrawals, 30000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [limit]);

    return {
        withdrawals,
        loading,
        error,
    };
}

export function useWithdrawalStats() {
    const [totalWithdrawn, setTotalWithdrawn] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchStats = async () => {
            try {
                // Get current user token if available
                const user = auth.currentUser;
                const token = user ? await user.getIdToken() : null;

                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch('/api/admin-7f8a9b/withdrawals', {
                    headers
                });
                if (!response.ok) throw new Error('Failed to fetch withdrawal stats');

                const result = await response.json();

                if (isMounted && result.success) {
                    const withdrawalArray = result.withdrawals || [];
                    const total = withdrawalArray
                        .filter((w: Withdrawal) => w.status === 'completed')
                        .reduce((sum: number, w: Withdrawal) => sum + (w.amount || 0), 0);

                    setTotalWithdrawn(total);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching withdrawal stats:', err);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchStats();

        // Poll every 30 seconds
        const intervalId = setInterval(fetchStats, 30000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    return { totalWithdrawn, loading };
}
