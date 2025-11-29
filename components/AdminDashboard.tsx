/**
 * Enhanced Admin Dashboard Component
 * Shows real-time transactions, revenue, and voting statistics
 */

'use client';

import { useState } from 'react';
import {
    DollarSign,
    TrendingUp,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Activity,
    CreditCard
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBackendCandidates } from '@/hooks/useBackendCandidates';


import { useWithdrawalStats } from '@/hooks/useWithdrawals';

export function AdminStats() {
    const { stats, loading: txLoading } = useTransactions();
    const { candidates, loading: candidatesLoading } = useBackendCandidates();
    const { totalWithdrawn, loading: withdrawalLoading } = useWithdrawalStats();

    // Calculate total votes from candidates
    const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
    const currentBalance = stats.totalRevenue - totalWithdrawn;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {/* Current Balance (Revenue - Withdrawals) */}
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700/50 rounded-lg p-4 sm:p-6 min-h-[140px] hover:border-green-500/50 transition-colors">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-zinc-400 text-xs sm:text-sm mb-1">Solde Actuel</p>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white break-words">
                            {currentBalance.toLocaleString()} <span className="text-sm sm:text-lg text-zinc-400">XAF</span>
                        </h3>
                    </div>
                    <div className="bg-green-500/20 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
                        <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                    </div>
                </div>
                <div className="flex flex-col gap-1 text-xs text-zinc-400">
                    <span className="truncate">Revenu net: {stats.totalRevenue.toLocaleString()} XAF</span>
                    <span className="truncate">Retiré: {totalWithdrawn.toLocaleString()} XAF</span>
                    <span className="truncate text-[10px] opacity-70">(Après frais 5%)</span>
                </div>
            </div>

            {/* Total Votes */}
            <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border border-yellow-700/50 rounded-lg p-4 sm:p-6 min-h-[140px] hover:border-yellow-500/50 transition-colors">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-zinc-400 text-xs sm:text-sm mb-1">Total Votes</p>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white">
                            {totalVotes.toLocaleString()}
                        </h3>
                    </div>
                    <div className="bg-yellow-500/20 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                    </div>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 truncate">
                    {stats.totalVotes} votes payés
                </p>
            </div>

            {/* Active Transactions */}
            <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/50 rounded-lg p-4 sm:p-6 min-h-[140px] hover:border-blue-500/50 transition-colors">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-zinc-400 text-xs sm:text-sm mb-1">Transactions</p>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white">
                            {stats.totalTransactions}
                        </h3>
                    </div>
                    <div className="bg-blue-500/20 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
                        <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                    </div>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2 text-xs">
                    <span className="text-green-400">{stats.completedTransactions} OK</span>
                    <span className="text-yellow-400">{stats.pendingTransactions} attente</span>
                </div>
            </div>

            {/* Average Transaction */}
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/50 rounded-lg p-4 sm:p-6 min-h-[140px] hover:border-purple-500/50 transition-colors">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-zinc-400 text-xs sm:text-sm mb-1">Montant Moyen</p>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white break-words">
                            {Math.round(stats.averageTransactionValue).toLocaleString()} <span className="text-sm sm:text-lg text-zinc-400">XAF</span>
                        </h3>
                    </div>
                    <div className="bg-purple-500/20 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
                        <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
                    </div>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 truncate">
                    Par transaction
                </p>
            </div>
        </div>
    );
}

export function TransactionsList() {
    const { transactions, loading } = useTransactions(50);
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'all') return true;
        return tx.status === filter;
    });

    if (loading) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 sm:p-6">
                <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-zinc-800 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Transactions Récentes</h2>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${filter === 'all'
                            ? 'bg-yellow-500 text-black'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                    >
                        Toutes
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${filter === 'completed'
                            ? 'bg-green-500 text-black'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                    >
                        Complétées
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${filter === 'pending'
                            ? 'bg-yellow-500 text-black'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                    >
                        En attente
                    </button>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto -mx-4 sm:mx-0 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="text-left py-3 px-3 sm:px-4 text-zinc-400 font-semibold text-xs sm:text-sm whitespace-nowrap">Date/Heure</th>
                                <th className="text-left py-3 px-3 sm:px-4 text-zinc-400 font-semibold text-xs sm:text-sm whitespace-nowrap">Candidat</th>
                                <th className="text-left py-3 px-3 sm:px-4 text-zinc-400 font-semibold text-xs sm:text-sm whitespace-nowrap">Opérateur</th>
                                <th className="text-right py-3 px-3 sm:px-4 text-zinc-400 font-semibold text-xs sm:text-sm whitespace-nowrap">Votes</th>
                                <th className="text-right py-3 px-3 sm:px-4 text-zinc-400 font-semibold text-xs sm:text-sm whitespace-nowrap">Montant</th>
                                <th className="text-center py-3 px-3 sm:px-4 text-zinc-400 font-semibold text-xs sm:text-sm whitespace-nowrap">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-zinc-400 text-sm">
                                        Aucune transaction trouvée
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                        <td className="py-3 sm:py-4 px-3 sm:px-4">
                                            <div className="flex flex-col">
                                                <span className="text-white text-xs sm:text-sm whitespace-nowrap">
                                                    {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                                                </span>
                                                <span className="text-zinc-500 text-xs whitespace-nowrap">
                                                    {new Date(tx.createdAt).toLocaleTimeString('fr-FR')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 sm:py-4 px-3 sm:px-4">
                                            <span className="text-white text-xs sm:text-sm font-medium whitespace-nowrap">{tx.candidateId}</span>
                                        </td>
                                        <td className="py-3 sm:py-4 px-3 sm:px-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${tx.operator === 'MTN'
                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                : 'bg-orange-500/20 text-orange-400'
                                                }`}>
                                                {tx.operator}
                                            </span>
                                        </td>
                                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-right">
                                            <span className="text-yellow-500 font-bold text-xs sm:text-sm whitespace-nowrap">{tx.voteCount}</span>
                                        </td>
                                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-right">
                                            <span className="text-green-400 font-semibold text-xs sm:text-sm whitespace-nowrap">{tx.amount.toLocaleString()} XAF</span>
                                        </td>
                                        <td className="py-3 sm:py-4 px-3 sm:px-4">
                                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                                                {tx.status === 'completed' && (
                                                    <>
                                                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                                                        <span className="text-green-400 text-xs sm:text-sm whitespace-nowrap hidden sm:inline">Complété</span>
                                                    </>
                                                )}
                                                {tx.status === 'pending' && (
                                                    <>
                                                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
                                                        <span className="text-yellow-400 text-xs sm:text-sm whitespace-nowrap hidden sm:inline">En attente</span>
                                                    </>
                                                )}
                                                {tx.status === 'failed' && (
                                                    <>
                                                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                                                        <span className="text-red-400 text-xs sm:text-sm whitespace-nowrap hidden sm:inline">Échoué</span>
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
            </div>
        </div>
    );
}
