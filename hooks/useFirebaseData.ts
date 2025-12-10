import { useEffect, useState, useRef } from 'react'

// Polling interval in milliseconds (optimized for real-time updates)
const POLLING_INTERVAL = 5000; // 5 seconds (previously 30s - too slow)

export function useCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      console.log('🚀 [Debug] Fetching categories...');
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');

        const result = await response.json();
        if (isMounted) {
          setCategories(result.categories || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load categories');
          setLoading(false);
        }
      }
    };

    fetchCategories();

    // Poll for updates
    const intervalId = setInterval(fetchCategories, POLLING_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [])

  return { categories, loading, error }
}

export function useCandidates() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;

    const fetchCandidates = async () => {
      console.log('🚀 [Debug] Fetching candidates...');
      try {
        const response = await fetch('/api/candidates');
        if (!response.ok) throw new Error('Failed to fetch candidates');

        const result = await response.json();
        if (isMounted) {
          setCandidates(result.candidates || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load candidates');
          setLoading(false);
        }
      }
    };

    fetchCandidates();

    const intervalId = setInterval(fetchCandidates, POLLING_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [])

  return { candidates, loading, error }
}

export function useLeaderboard(limit: number = 10) {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async () => {
      try {
        // We fetch all candidates and sort client-side to avoid complex backend logic
        // The API route is cached/optimized anyway
        const response = await fetch('/api/candidates');
        if (!response.ok) throw new Error('Failed to fetch leaderboard');

        const result = await response.json();

        if (isMounted) {
          const candidates = result.candidates || [];
          const sorted = candidates
            .sort((a: any, b: any) => (b.votes || 0) - (a.votes || 0))
            .slice(0, limit);

          setLeaderboard(sorted);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();

    const intervalId = setInterval(fetchLeaderboard, POLLING_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
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

    let isMounted = true;

    const fetchVotes = async () => {
      try {
        // Use the proxy endpoint for specific paths
        const response = await fetch(`/api/proxy/firebase?path=users/${userId}/votes`);
        if (!response.ok) throw new Error('Failed to fetch votes');

        const result = await response.json();

        if (isMounted) {
          const votesData = result.data || {};
          // Convert object to array if needed
          const votesArray = Array.isArray(votesData) ? votesData : Object.values(votesData);
          setVotes(votesArray);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching votes:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load votes');
          setLoading(false);
        }
      }
    };

    fetchVotes();

    const intervalId = setInterval(fetchVotes, POLLING_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [userId])

  return { votes, loading, error }
}
