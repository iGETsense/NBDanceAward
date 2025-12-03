/**
 * Admin Withdrawal Component
 * Allows admin to withdraw funds to mobile money
 */

'use client';

import { useState } from 'react';
import { Wallet, ArrowDownToLine, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';


import { useWithdrawals } from '@/hooks/useWithdrawals';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export function AdminWithdrawal() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const { withdrawals: firebaseWithdrawals, loading: historyLoading } = useWithdrawals();
    const [optimisticWithdrawals, setOptimisticWithdrawals] = useState<any[]>([]);

    // Merge optimistic withdrawals with Firebase withdrawals, avoiding duplicates
    const withdrawals = [
        ...optimisticWithdrawals,
        ...firebaseWithdrawals.filter(fw => !optimisticWithdrawals.some(ow => ow.id === fw.id))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Get Firebase ID token
            const user = auth.currentUser;
            if (!user) {
                setMessage({
                    type: 'error',
                    text: 'Vous devez être connecté pour effectuer un retrait.',
                });
                setLoading(false);
                return;
            }

            const idToken = await user.getIdToken();

            // Optimistic update object
            const tempId = `temp-${Date.now()}`;
            const optimisticWithdrawal = {
                id: tempId,
                phoneNumber,
                amount: parseInt(amount),
                operator: ['69', '67', '65', '68'].some(prefix => phoneNumber.startsWith(prefix)) ? 'MTN' : 'ORANGE',
                status: 'pending',
                createdAt: Date.now(),
                mesombReference: 'Traitement...',
            };

            const response = await fetch('/api/admin-7f8a9b/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber,
                    amount: parseInt(amount),
                    firebaseToken: idToken,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({
                    type: 'success',
                    text: `Retrait réussi! ${amount} XAF envoyé au ${phoneNumber}. Référence: ${data.reference}`,
                });

                // Update optimistic withdrawal with success details
                setOptimisticWithdrawals(prev => [
                    { ...optimisticWithdrawal, status: 'completed', mesombReference: data.reference, id: data.id || tempId },
                    ...prev
                ]);

                setPhoneNumber('');
                setAmount('');
            } else {
                setMessage({
                    type: 'error',
                    text: data.error || 'Le retrait a échoué',
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Une erreur s\'est produite. Veuillez réessayer.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-green-500/20 p-3 rounded-lg">
                        <Wallet className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Retrait de Fonds</h2>
                        <p className="text-zinc-400 text-sm">Transférer des fonds vers Mobile Money</p>
                    </div>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-4">
                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Numéro de Téléphone
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="6XX XXX XXX"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                            required
                        />
                        <p className="text-xs text-zinc-500 mt-1">MTN ou Orange Money Cameroun</p>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Montant (XAF)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="10000"
                            min="100"
                            max="1000000"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                            required
                        />
                        <p className="text-xs text-zinc-500 mt-1">Minimum: 100 XAF, Maximum: 1,000,000 XAF</p>
                    </div>

                    {/* Message */}
                    {message && (
                        <div
                            className={`p-4 rounded-lg ${message.type === 'success'
                                ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                                : 'bg-red-500/10 border border-red-500/50 text-red-400'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Traitement...
                            </>
                        ) : (
                            <>
                                <ArrowDownToLine className="h-5 w-5" />
                                Retirer les Fonds
                            </>
                        )}
                    </button>
                </form>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                        <strong>Note:</strong> Les retraits sont traités immédiatement. Assurez-vous que le numéro est correct avant de confirmer.
                    </p>
                </div>
            </div>

            {/* Withdrawal History */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-6">Historique des Retraits</h3>

                {historyLoading ? (
                    <div className="animate-pulse space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-zinc-800 rounded"></div>
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="text-left py-3 px-4 text-zinc-400 font-semibold text-sm">Date</th>
                                    <th className="text-left py-3 px-4 text-zinc-400 font-semibold text-sm">Numéro</th>
                                    <th className="text-left py-3 px-4 text-zinc-400 font-semibold text-sm">Opérateur</th>
                                    <th className="text-right py-3 px-4 text-zinc-400 font-semibold text-sm">Montant</th>
                                    <th className="text-left py-3 px-4 text-zinc-400 font-semibold text-sm">Référence</th>
                                    <th className="text-center py-3 px-4 text-zinc-400 font-semibold text-sm">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-zinc-400">
                                            Aucun retrait effectué
                                        </td>
                                    </tr>
                                ) : (
                                    withdrawals.map((withdrawal) => (
                                        <tr key={withdrawal.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-white text-sm">
                                                        {new Date(withdrawal.createdAt).toLocaleDateString('fr-FR')}
                                                    </span>
                                                    <span className="text-zinc-500 text-xs">
                                                        {new Date(withdrawal.createdAt).toLocaleTimeString('fr-FR')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-zinc-300 font-mono text-sm">
                                                {withdrawal.phoneNumber}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${withdrawal.operator === 'MTN'
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-orange-500/20 text-orange-400'
                                                    }`}>
                                                    {withdrawal.operator}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="text-white font-bold">{withdrawal.amount.toLocaleString()} XAF</span>
                                            </td>
                                            <td className="py-4 px-4 text-zinc-500 text-xs font-mono">
                                                {withdrawal.mesombReference || '-'}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {withdrawal.status === 'completed' && (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                            <span className="text-green-400 text-sm">Succès</span>
                                                        </>
                                                    )}
                                                    {withdrawal.status === 'pending' && (
                                                        <>
                                                            <Clock className="h-4 w-4 text-yellow-500" />
                                                            <span className="text-yellow-400 text-sm">En cours</span>
                                                        </>
                                                    )}
                                                    {withdrawal.status === 'failed' && (
                                                        <>
                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                            <span className="text-red-400 text-sm">Échec</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
