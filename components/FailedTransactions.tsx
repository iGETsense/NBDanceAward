/**
 * Failed Transactions Component
 * Displays transactions that need manual review
 */

'use client'

import { useState } from 'react'
import { AlertCircle, Clock, XCircle } from 'lucide-react'
import { useTransactionsByStatus } from '@/hooks/useTransactions'

export function FailedTransactions() {
    const { transactions: failedTransactions, loading } = useTransactionsByStatus('failed')
    const [showAll, setShowAll] = useState(false)

    // Filter for transactions that need review
    const needsReview = failedTransactions.filter(
        (tx: any) => tx.reconciliationStatus === 'needs_review'
    )

    const displayTransactions = showAll ? failedTransactions : needsReview

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Transactions Échouées</h2>
                <p className="text-zinc-400">Chargement...</p>
            </div>
        )
    }

    if (failedTransactions.length === 0) {
        return (
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Transactions Échouées</h2>
                <div className="flex items-center gap-2 text-green-400">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-sm">Aucune transaction échouée</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Transactions Échouées</h2>
                <div className="flex items-center gap-4">
                    {needsReview.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            <span className="text-sm text-red-400 font-medium">
                                {needsReview.length} à vérifier
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
                    >
                        {showAll ? 'Afficher uniquement à vérifier' : 'Afficher tout'}
                    </button>
                </div>
            </div>

            {needsReview.length > 0 && !showAll && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-yellow-400">
                        <strong>⚠️ Attention:</strong> Ces transactions ont échoué mais l'utilisateur a peut-être été débité.
                        Vérifiez Mesomb et Orange Money avant de prendre une décision.
                    </p>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-zinc-700">
                            <th className="text-left py-3 px-4 text-zinc-400 font-semibold text-sm">
                                Statut
                            </th>
                            <th className="text-left py-3 px-4 text-zinc-400 font-semibold text-sm">
                                Transaction ID
                            </th>
                            <th className="text-left py-3 px-4 text-zinc-400 font-semibold text-sm">
                                Téléphone
                            </th>
                            <th className="text-left py-3 px-4 text-zinc-400 font-semibold text-sm">
                                Montant
                            </th>
                            <th className="text-left py-3 px-4 text-zinc-400 font-semibold text-sm">
                                Raison
                            </th>
                            <th className="text-left py-3 px-4 text-zinc-400 font-semibold text-sm">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayTransactions.map((tx: any) => (
                            <tr
                                key={tx.id}
                                className={`border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors ${tx.reconciliationStatus === 'needs_review'
                                        ? 'bg-red-500/5'
                                        : ''
                                    }`}
                            >
                                <td className="py-3 px-4">
                                    {tx.reconciliationStatus === 'needs_review' ? (
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-400" />
                                            <span className="text-xs text-red-400 font-medium">
                                                À vérifier
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-zinc-500" />
                                            <span className="text-xs text-zinc-500">Échoué</span>
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    <code className="text-xs text-yellow-500 bg-zinc-800 px-2 py-1 rounded">
                                        {tx.id.substring(0, 20)}...
                                    </code>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="text-sm text-white">{tx.phoneNumber}</span>
                                    <div className="text-xs text-zinc-500">{tx.operator}</div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="text-sm font-bold text-white">
                                        {tx.amount} XAF
                                    </span>
                                    <div className="text-xs text-zinc-500">
                                        {tx.voteCount} vote{tx.voteCount > 1 ? 's' : ''}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="text-xs text-zinc-400">
                                        {tx.failureReason || tx.errorDetails || 'Non spécifié'}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                                        <Clock className="h-3 w-3" />
                                        {new Date(tx.createdAt).toLocaleString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {displayTransactions.length === 0 && showAll && (
                <p className="text-center text-zinc-400 py-4">Aucune transaction échouée</p>
            )}
        </div>
    )
}
