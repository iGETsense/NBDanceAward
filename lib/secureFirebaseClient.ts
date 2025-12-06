/**
 * Secure Firebase Client
 * 
 * Frontend client that uses backend API route
 * Never exposes Firebase URLs or credentials
 * All requests go through /api/firebase endpoint
 */

/**
 * Make secure request to Firebase through backend
 */
async function secureFirebaseRequest<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  data?: any
): Promise<T> {
  try {
    const response = await fetch('/api/firebase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method,
        path,
        data,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Request failed')
    }

    return result.data as T
  } catch (error) {
    console.error(`Secure Firebase request failed for ${path}:`, error)
    throw error
  }
}

/**
 * Get all candidates (secure)
 */
export async function getSecureCandidates(): Promise<Record<string, any>> {
  const data = await secureFirebaseRequest<Record<string, any>>('GET', '/candidates')
  return data || {}
}

/**
 * Get all categories (secure)
 */
export async function getSecureCategories(): Promise<Record<string, any>> {
  const data = await secureFirebaseRequest<Record<string, any>>('GET', '/categories')
  return data || {}
}

/**
 * Get all votes (secure)
 */
export async function getSecureVotes(): Promise<Record<string, any>> {
  const data = await secureFirebaseRequest<Record<string, any>>('GET', '/votes')
  return data || {}
}

/**
 * Get all users (secure)
 */
export async function getSecureUsers(): Promise<Record<string, any>> {
  const data = await secureFirebaseRequest<Record<string, any>>('GET', '/users')
  return data || {}
}

/**
 * Get specific user (secure)
 */
export async function getSecureUser(userId: string): Promise<any | null> {
  try {
    const data = await secureFirebaseRequest<any>('GET', `/users/${userId}`)
    return data || null
  } catch (error) {
    console.warn(`User ${userId} not found`)
    return null
  }
}

/**
 * Submit vote (secure)
 */
export async function submitSecureVote(voteData: {
  userId: string
  candidateId: string
  voteCount: number
  paymentMethod: string
  provider: string
  transactionId: string
}): Promise<{ success: boolean; voteId: string }> {
  try {
    const voteId = `${voteData.userId}_${Date.now()}`

    // Create vote
    await secureFirebaseRequest('POST', `/votes/${voteId}`, {
      ...voteData,
      status: 'completed',
      createdAt: new Date().toISOString(),
    })

    // Update candidate votes
    const candidates = await getSecureCandidates()
    const candidate = candidates[voteData.candidateId]
    const currentVotes = candidate?.votes || 0

    await secureFirebaseRequest('PATCH', `/candidates/${voteData.candidateId}`, {
      votes: currentVotes + voteData.voteCount,
    })

    // Update user votes
    const users = await getSecureUsers()
    const user = users[voteData.userId]
    const currentUserVotes = user?.totalVotes || 0

    await secureFirebaseRequest('PATCH', `/users/${voteData.userId}`, {
      totalVotes: currentUserVotes + voteData.voteCount,
    })

    console.log(`✅ Vote submitted securely: ${voteId}`)
    return { success: true, voteId }
  } catch (error) {
    console.error('Error submitting vote:', error)
    return { success: false, voteId: '', error }
  }
}

/**
 * Create user (secure)
 */
export async function createSecureUser(userId: string, userData: any): Promise<any> {
  return secureFirebaseRequest('POST', `/users/${userId}`, {
    ...userData,
    createdAt: new Date().toISOString(),
    totalVotes: 0,
  })
}

/**
 * Update user (secure)
 */
export async function updateSecureUser(userId: string, userData: any): Promise<any> {
  return secureFirebaseRequest('PATCH', `/users/${userId}`, {
    ...userData,
    updatedAt: new Date().toISOString(),
  })
}

/**
 * Get leaderboard (secure)
 */
export async function getSecureLeaderboard(limit: number = 10): Promise<any[]> {
  const candidates = await getSecureCandidates()

  const leaderboard = Object.entries(candidates)
    .map(([id, candidate]) => ({
      ...candidate,
      id,
    }))
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    .slice(0, limit)

  return leaderboard
}

/**
 * Get user votes (secure)
 */
export async function getSecureUserVotes(userId: string): Promise<Record<string, any>> {
  const allVotes = await getSecureVotes()
  const userVotes: Record<string, any> = {}

  for (const [voteId, vote] of Object.entries(allVotes)) {
    if ((vote as any).userId === userId) {
      userVotes[voteId] = vote
    }
  }

  return userVotes
}

/**
 * Get candidates by category (secure)
 */
export async function getSecureCandidatesByCategory(categoryId: string): Promise<any[]> {
  const candidates = await getSecureCandidates()

  return Object.entries(candidates)
    .filter(([_, candidate]) => (candidate as any).categoryId === categoryId)
    .map(([id, candidate]) => ({
      ...candidate,
      id,
    }))
}
