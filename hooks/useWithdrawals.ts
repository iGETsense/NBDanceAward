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

    useEffect(() => {
        try {
            const withdrawalsRef = ref(database, 'withdrawals');
            const withdrawalsQuery = query(
                withdrawalsRef,
                orderByChild('createdAt'),
                limitToLast(limit)
            );

            const unsubscribe = onValue(
                withdrawalsQuery,
                (snapshot) => {
                    const data = snapshot.val();

                    if (data) {
                        // Convert to array and sort by newest first
                        const withdrawalArray = Object.values(data) as Withdrawal[];
                        withdrawalArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

                        setWithdrawals(withdrawalArray);
                    } else {
                        setWithdrawals([]);
                    }

                    setLoading(false);
                },
                (err) => {
                    console.error('Error fetching withdrawals:', err);
                    setError('Failed to load withdrawals');
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        } catch (err: any) {
            console.error('Error setting up withdrawal listener:', err);
            setError(err.message);
            setLoading(false);
        }
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
        const withdrawalsRef = ref(database, 'withdrawals');
        // Fetch all withdrawals to calculate total
        const unsubscribe = onValue(withdrawalsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const withdrawalArray = Object.values(data) as Withdrawal[];
                const total = withdrawalArray
                    .filter(w => w.status === 'completed')
                    .reduce((sum, w) => sum + (w.amount || 0), 0);
                setTotalWithdrawn(total);
            } else {
                setTotalWithdrawn(0);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { totalWithdrawn, loading };
}
