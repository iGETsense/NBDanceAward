/**
 * Reconciliation Tool Component
 * Allows admin to recalculate votes based on completed transactions
 */

'use client';

import { useState } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';

export function ReconciliationTool() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleReconcile = async () => {
        if (!confirm('⚠️ ATTENTION: Cette opération va recalculer tous les votes basés sur les transactions réussies. Continuer?')) {
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const user = auth.currentUser;
            if (!user) {
                setError('Vous devez être connecté');
                setLoading(false);
                return;
            }

            const idToken = await user.getIdToken();

            const response = await fetch('/api/admin-7f8a9b/reconcile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firebaseToken: idToken }),
            });

            const data = await response.json();

            if (data.success) {
                setResult(data.summary);
            } else {
                setError(data.error || 'La réconciliation a échoué');
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                    <RefreshCw className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Réconciliation des Votes</h2>
                    <p className="text-zinc-400 text-sm">Recalculer les votes basés sur les transactions réussies</p>
                </div>
            </div>

            {/* Warning Box */}
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-400">
                    <p className="font-semibold mb-1">Attention:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Cette opération va recalculer tous les compteurs de votes</li>
                        <li>Seules les transactions avec status "completed" seront comptées</li>
                        <li>Les votes non payés seront retirés du compteur</li>
                        <li>Le solde sera ajusté pour correspondre à Mesomb</li>
                    </ul>
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={handleReconcile}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Réconciliation en cours...
                    </>
                ) : (
                    <>
                        <RefreshCw className="h-5 w-5" />
                        Lancer la Réconciliation
                    </>
                )}
            </button>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Success Result */}
            {result && (
                <div className="mt-6 space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-green-400 font-semibold">Réconciliation réussie!</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-800 rounded-lg p-4">
                            <p className="text-zinc-400 text-xs mb-1">Total Votes</p>
                            <p className="text-white text-2xl font-bold">{result.totalVotes.toLocaleString()}</p>
                        </div>
                        <div className="bg-zinc-800 rounded-lg p-4">
                            <p className="text-zinc-400 text-xs mb-1">Revenu Net</p>
                            <p className="text-white text-2xl font-bold">{result.netRevenue.toLocaleString()} XAF</p>
                        </div>
                        <div className="bg-zinc-800 rounded-lg p-4">
                            <p className="text-zinc-400 text-xs mb-1">Candidats Mis à Jour</p>
                            <p className="text-white text-2xl font-bold">{result.candidatesUpdated}</p>
                        </div>
                        <div className="bg-zinc-800 rounded-lg p-4">
                            <p className="text-zinc-400 text-xs mb-1">Transactions Complétées</p>
                            <p className="text-white text-2xl font-bold">{result.transactions.completed}</p>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-lg p-4">
                        <p className="text-zinc-400 text-xs mb-2">Détails</p>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Revenu Total:</span>
                                <span className="text-white font-mono">{result.totalRevenue.toLocaleString()} XAF</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Frais Plateforme (5%):</span>
                                <span className="text-white font-mono">-{result.platformFee.toLocaleString()} XAF</span>
                            </div>
                            <div className="flex justify-between border-t border-zinc-700 pt-1 mt-1">
                                <span className="text-zinc-400 font-semibold">Solde Net:</span>
                                <span className="text-green-400 font-mono font-bold">{result.netRevenue.toLocaleString()} XAF</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded-lg p-4">
                        <p className="text-zinc-400 text-xs mb-2">Transactions</p>
                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-zinc-400">Complétées: <span className="text-white">{result.transactions.completed}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="text-zinc-400">En attente: <span className="text-white">{result.transactions.pending}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-zinc-400">Échouées: <span className="text-white">{result.transactions.failed}</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
