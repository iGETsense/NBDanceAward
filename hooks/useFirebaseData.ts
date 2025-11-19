import { useEffect, useState } from 'react'
import { subscribeToCandidates, subscribeToLeaderboard, getUserVotes } from '@/lib/database'

export function useCandidates() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const unsubscribe = subscribeToCandidates((data) => {
        const candidatesArray = Array.isArray(data) ? data : Object.values(data || {})
        setCandidates(candidatesArray)
        setLoading(false)
      })
      return unsubscribe
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates')
      setLoading(false)
    }
  }, [])

  return { candidates, loading, error }
}

export function useLeaderboard(limit: number = 10) {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const unsubscribe = subscribeToLeaderboard((data) => {
        setLeaderboard(data)
        setLoading(false)
      }, limit)
      return unsubscribe
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
      setLoading(false)
    }
  }, [limit])

  return { leaderboard, loading, error }
}

export function useUserVotes(userId: string | null) {
  const [votes, setVotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchVotes = async () => {
      try {
        const userVotes = await getUserVotes(userId)
        setVotes(userVotes)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load votes')
        setLoading(false)
      }
    }

    fetchVotes()
  }, [userId])

  return { votes, loading, error }
}
