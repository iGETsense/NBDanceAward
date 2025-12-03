/**
 * Custom Hook for Withdrawal History
 * Listens to Firebase withdrawals and provides the list
 */

import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '@/lib/firebase';

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

    const fetchWithdrawals = async () => {
        setLoading(true); // Set loading to true before fetching
        try {
            const response = await fetch('/api/admin-7f8a9b/withdrawals');
            const data = await response.json();

            if (data.success) {
                // Assuming the API returns withdrawals sorted by createdAt descending
                setWithdrawals(data.withdrawals);
                setError(null);
            } else {
                setError(data.error || 'Failed to load withdrawals');
            }
        } catch (err: any) {
            console.error('Error fetching withdrawals:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();

        // Poll every 30 seconds to keep updated
        const interval = setInterval(fetchWithdrawals, 30000);
        return () => clearInterval(interval);
    }, []); // Removed 'limit' from dependency array as it's not used in the new fetch logic

    return {
        withdrawals,
        loading,
        error,
        refresh: fetchWithdrawals
    };
}

export function useWithdrawalStats() {
    const [totalWithdrawn, setTotalWithdrawn] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin-7f8a9b/withdrawals');
                const data = await response.json();

                if (data.success && data.withdrawals) {
                    const total = data.withdrawals
                        .filter((w: Withdrawal) => w.status === 'completed')
                        .reduce((sum: number, w: Withdrawal) => sum + (w.amount || 0), 0);
                    setTotalWithdrawn(total);
                }
            } catch (err) {
                console.error('Error fetching withdrawal stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return { totalWithdrawn, loading };
}
