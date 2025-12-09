/**
 * Custom Hook for Withdrawal History
 * Listens to Firebase withdrawals and provides the list
 */

import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { database, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

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
        let intervalId: NodeJS.Timeout | null = null;

        const fetchWithdrawals = async () => {
            try {
                // Get current user token if available
                const user = auth.currentUser;
                console.log(`[Withdrawals] Current user: ${user ? user.uid : 'null'}`);
                const token = user ? await user.getIdToken() : null;

                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch('/api/admin-7f8a9b/withdrawals', {
                    headers
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`[Withdrawals] Fetch failed: ${response.status} ${response.statusText}`, errorText);
                    throw new Error(`Failed to fetch withdrawals: ${response.status} ${errorText}`);
                }

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

        // Wait for auth state to be ready before fetching
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is authenticated, fetch withdrawals
                fetchWithdrawals();

                // Set up polling interval
                if (intervalId) clearInterval(intervalId);
                intervalId = setInterval(fetchWithdrawals, 30000);
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
        let intervalId: NodeJS.Timeout | null = null;

        const fetchStats = async () => {
            try {
                // Get current user token if available
                const user = auth.currentUser;
                console.log(`[Withdrawals Stats] Current user: ${user ? user.uid : 'null'}`);
                const token = user ? await user.getIdToken() : null;

                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch('/api/admin-7f8a9b/withdrawals', {
                    headers
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`[Withdrawals Stats] Fetch failed: ${response.status} ${response.statusText}`, errorText);
                    throw new Error(`Failed to fetch withdrawal stats: ${response.status} ${errorText}`);
                }

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

        // Wait for auth state to be ready before fetching
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is authenticated, fetch stats
                fetchStats();

                // Set up polling interval
                if (intervalId) clearInterval(intervalId);
                intervalId = setInterval(fetchStats, 30000);
            } else {
                // No user authenticated
                if (isMounted) {
                    setLoading(false);
                }
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    return { totalWithdrawn, loading };
}
