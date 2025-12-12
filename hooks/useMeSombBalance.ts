
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface MeSombBalance {
    balance: number;
    balances: Array<{
        country: string;
        service: string;
        value: number;
    }>;
}

export function useMeSombBalance() {
    const [balanceData, setBalanceData] = useState<MeSombBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchBalance = async () => {
            try {
                // Get current user token if available
                const user = auth.currentUser;
                const token = user ? await user.getIdToken() : null;

                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch('/api/admin-7f8a9b/balance', {
                    headers,
                    cache: 'no-store'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch balance');
                }

                const data = await response.json();

                if (isMounted && data.success) {
                    setBalanceData({
                        balance: data.balance,
                        balances: data.balances
                    });
                    setError(null);
                }
            } catch (err: any) {
                console.error('Error fetching balance:', err);
                if (isMounted) {
                    setError('Impossible de charger le solde');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchBalance();
            } else {
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    return { balanceData, loading, error };
}
