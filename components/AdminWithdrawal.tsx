/**
 * Admin Withdrawal Component
 * Allows admin to withdraw funds to mobile money
 */

'use client';

import { useState } from 'react';
import { Wallet, ArrowDownToLine, Loader2 } from 'lucide-react';

export function AdminWithdrawal() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/admin/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber,
                    amount: parseInt(amount),
                    adminPassword: password,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({
                    type: 'success',
                    text: `Withdrawal successful! ${amount} XAF sent to ${phoneNumber}. Reference: ${data.reference}`,
                });
                setPhoneNumber('');
                setAmount('');
                setPassword('');
            } else {
                setMessage({
                    type: 'error',
                    text: data.error || 'Withdrawal failed',
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'An error occurred. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
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

                {/* Admin Password */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Mot de Passe Admin
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                        required
                    />
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
    );
}
