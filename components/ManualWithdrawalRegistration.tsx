/**
 * Manual Withdrawal Registration Component
 * Allows admin to register past withdrawals to sync with Mesomb
 */

'use client';

import { useState } from 'react';
import { FileEdit, AlertCircle, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';

export function ManualWithdrawalRegistration() {
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const user = auth.currentUser;
            if (!user) {
                setMessage({
                    type: 'error',
                    text: 'Vous devez être connecté',
                });
                setLoading(false);
                return;
            }

            const idToken = await user.getIdToken();

            const response = await fetch('/api/admin-7f8a9b/register-withdrawal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseInt(amount),
                    mesombReference: reference,
                    note: note,
                    firebaseToken: idToken,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({
                    type: 'success',
                    text: `Retrait de ${amount} XAF enregistré avec succès!`,
                });
                setAmount('');
                setReference('');
                setNote('');
            } else {
                setMessage({
                    type: 'error',
                    text: data.error || 'L\'enregistrement a échoué',
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Une erreur s\'est produite',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-500/20 p-3 rounded-lg">
                    <FileEdit className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Enregistrer un Retrait Manuel</h2>
                    <p className="text-zinc-400 text-sm">Pour synchroniser avec Mesomb</p>
                </div>
            </div>

            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-400">
                    <p className="font-semibold mb-1">Quand utiliser cet outil:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Un retrait a été effectué sur Mesomb mais n'apparaît pas dans l'historique</li>
                        <li>Le solde de la plateforme ne correspond pas à celui de Mesomb</li>
                        <li>Vous devez corriger manuellement le solde</li>
                    </ul>
                </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Montant Retiré (XAF)
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="5409"
                        min="0"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                        required
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                        Différence entre le solde plateforme et Mesomb
                    </p>
                </div>

                {/* Reference */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Référence Mesomb (optionnel)
                    </label>
                    <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="REF-MESOMB-123"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                </div>

                {/* Note */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Note (optionnel)
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Retrait effectué le..."
                        rows={3}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    />
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                                ? 'bg-green-500/10 border border-green-500/50'
                                : 'bg-red-500/10 border border-red-500/50'
                            }`}
                    >
                        {message.type === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        )}
                        <span className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                            {message.text}
                        </span>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <FileEdit className="h-5 w-5 animate-pulse" />
                            Enregistrement...
                        </>
                    ) : (
                        <>
                            <FileEdit className="h-5 w-5" />
                            Enregistrer le Retrait
                        </>
                    )}
                </button>
            </form>

            {/* Warning */}
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                <p className="text-yellow-400 text-sm">
                    <strong>Attention:</strong> Cette opération va diminuer le solde affiché. Assurez-vous que le montant correspond bien à la différence avec Mesomb.
                </p>
            </div>
        </div>
    );
}
