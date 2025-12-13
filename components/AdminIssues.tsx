"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, CheckCircle2, Clock, Image as ImageIcon, ExternalLink, RefreshCw } from "lucide-react"
import Image from "next/image"

interface Issue {
    id: string
    name: string
    phone: string
    description: string
    reference?: string
    time?: string
    imageUrl?: string
    status: 'pending' | 'solved' | 'ignored'
    createdAt: number
}

export function AdminIssues() {
    const [issues, setIssues] = useState<Issue[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const fetchIssues = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/admin-7f8a9b/issues')
            const data = await response.json()
            if (data.success) {
                setIssues(data.issues)
            } else {
                setError(data.error || 'Failed to fetch issues')
            }
        } catch (err) {
            setError('Failed to load issues')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIssues()
    }, [])

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setUpdatingId(id)
        try {
            const response = await fetch('/api/admin-7f8a9b/issues', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            })
            const data = await response.json()
            if (data.success) {
                // Optimistic update
                setIssues(issues.map(issue =>
                    issue.id === id ? { ...issue, status: newStatus as any } : issue
                ))
            }
        } catch (err) {
            console.error('Failed to update status', err)
        } finally {
            setUpdatingId(null)
        }
    }

    const formatDate = (timestamp: number) => {
        if (!timestamp) return '-'
        return new Date(timestamp).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-purple-500" />
                    Support / Signalements
                </CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchIssues}
                    className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualiser
                </Button>
            </CardHeader>
            <CardContent>
                {loading && issues.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-400 text-center py-4">{error}</div>
                ) : issues.length === 0 ? (
                    <div className="text-zinc-500 text-center py-8">Aucun signalement trouvé.</div>
                ) : (
                    <div className="rounded-md border border-zinc-800 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-zinc-800/50">
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="text-zinc-400">Statut</TableHead>
                                    <TableHead className="text-zinc-400">Date/Heure</TableHead>
                                    <TableHead className="text-zinc-400">Utilisateur</TableHead>
                                    <TableHead className="text-zinc-400">Description</TableHead>
                                    <TableHead className="text-zinc-400">Preuve</TableHead>
                                    <TableHead className="text-right text-zinc-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {issues.map((issue) => (
                                    <TableRow key={issue.id} className="border-zinc-800 hover:bg-zinc-800/30">
                                        <TableCell>
                                            <Badge
                                                className={`
                                                    ${issue.status === 'solved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                        issue.status === 'ignored' ? 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' :
                                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}
                                                `}
                                                variant="outline"
                                            >
                                                {issue.status === 'solved' ? 'Résolu' :
                                                    issue.status === 'ignored' ? 'Ignoré' :
                                                        'En attente'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-zinc-300 text-sm">
                                            <div className="flex flex-col">
                                                <span>{formatDate(issue.createdAt)}</span>
                                                {issue.time && <span className="text-zinc-500 text-xs text-purple-400">Vote: {issue.time}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-zinc-300">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white">{issue.name}</span>
                                                <span className="text-zinc-500 text-xs">{issue.phone}</span>
                                                {issue.reference && <span className="text-zinc-500 text-xs font-mono">{issue.reference}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-zinc-400 max-w-[300px]">
                                            <p className="line-clamp-2 text-sm" title={issue.description}>
                                                {issue.description}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            {issue.imageUrl ? (
                                                <Dialog>
                                                    <DialogTrigger>
                                                        <div className="h-10 w-16 relative rounded overflow-hidden border border-zinc-700 cursor-pointer hover:opacity-80 transition-opacity">
                                                            <Image
                                                                src={issue.imageUrl}
                                                                alt="Preuve"
                                                                fill
                                                                className="object-cover"
                                                                sizes="64px"
                                                            />
                                                        </div>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-3xl bg-zinc-900 border-zinc-800 p-0 overflow-hidden">
                                                        <DialogTitle className="sr-only">Preuve</DialogTitle>
                                                        <div className="relative aspect-video w-full">
                                                            <Image
                                                                src={issue.imageUrl}
                                                                alt="Preuve Full"
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                        <div className="p-4 bg-black/50 flex justify-end">
                                                            <Button asChild variant="outline" size="sm">
                                                                <a href={issue.imageUrl} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                                    Ouvrir l'original
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <span className="text-zinc-600 text-xs italic">Aucune</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {issue.status !== 'solved' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                                                        onClick={() => handleStatusUpdate(issue.id, 'solved')}
                                                        disabled={updatingId === issue.id}
                                                    >
                                                        {updatingId === issue.id ? '...' : <CheckCircle2 className="h-4 w-4" />}
                                                    </Button>
                                                )}
                                                {issue.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-zinc-500 hover:text-white hover:bg-zinc-800 h-8 text-xs"
                                                        onClick={() => handleStatusUpdate(issue.id, 'ignored')}
                                                        disabled={updatingId === issue.id}
                                                    >
                                                        Ignorer
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
