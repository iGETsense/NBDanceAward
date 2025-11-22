import { useEffect, useState } from 'react'

export function useBackendCandidates() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/candidates', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch candidates: ${response.statusText}`)
        }

        const data = await response.json()
        
        if (data.success && Array.isArray(data.candidates)) {
          setCandidates(data.candidates)
          setError(null)
        } else {
          throw new Error('Invalid response format from backend')
        }
      } catch (err) {
        // Log error details for debugging (not shown to user)
        console.error('Error fetching candidates:', err)
        // Show generic error message to user (no technical details)
        setError('Une erreur est survenue lors du chargement des candidats. Veuillez rafraîchir la page.')
      } finally {
        setLoading(false)
      }
    }

    fetchCandidates()
  }, [])

  return { candidates, loading, error }
}
