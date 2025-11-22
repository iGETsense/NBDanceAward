import { database } from './firebase'
import { ref, set, update, get, onValue, increment } from 'firebase/database'
import { calculatePercentages, updateCandidatePercentage } from './percentageCalculator'

// ============ CANDIDATES ============

export async function getCandidates() {
  try {
    const snapshot = await get(ref(database, 'candidates'))
    if (snapshot.exists()) {
      return snapshot.val()
    }
    return []
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return []
  }
}

export function subscribeToCandidates(callback: (data: any) => void) {
  const candidatesRef = ref(database, 'candidates')
  const unsubscribe = onValue(candidatesRef, (snapshot) => {
    if (snapshot.exists()) {
      const candidatesObj = snapshot.val()
      const candidatesArray = Object.values(candidatesObj)
      const withPercentages = calculatePercentages(candidatesArray)
      callback(withPercentages)
    }
  }, (error) => {
    console.error('Firebase error:', error)
  })
  return unsubscribe
}

/**
 * Validates candidate data before adding
 */
function validateCandidateData(candidateData: any): { valid: boolean; error?: string } {
  if (!candidateData) {
    return { valid: false, error: 'Candidate data is required' }
  }

  if (!candidateData.name || typeof candidateData.name !== 'string' || candidateData.name.trim().length === 0) {
    return { valid: false, error: 'Candidate name is required and must be a non-empty string' }
  }

  if (!candidateData.image || typeof candidateData.image !== 'string' || candidateData.image.trim().length === 0) {
    return { valid: false, error: 'Candidate image path is required' }
  }

  if (!candidateData.category || typeof candidateData.category !== 'string' || candidateData.category.trim().length === 0) {
    return { valid: false, error: 'Candidate category is required' }
  }

  // Ensure title exists (use name if not provided)
  if (!candidateData.title) {
    candidateData.title = candidateData.name
  }

  // Normalize data
  candidateData.name = candidateData.name.trim()
  candidateData.title = candidateData.title.trim()
  candidateData.image = candidateData.image.trim()
  candidateData.category = candidateData.category.trim()
  candidateData.votes = candidateData.votes || 0
  candidateData.percentage = candidateData.percentage || 0
  candidateData.badge = candidateData.badge || null

  // Remove quote field if it exists (use title instead)
  if (candidateData.quote) {
    delete candidateData.quote
  }

  return { valid: true }
}

/**
 * Check if a candidate with the same name and category already exists
 */
async function checkDuplicateCandidate(name: string, category: string, excludeId?: string): Promise<{ exists: boolean; existingId?: string }> {
  try {
    const snapshot = await get(ref(database, 'candidates'))
    if (!snapshot.exists()) {
      return { exists: false }
    }

    const candidates = snapshot.val()
    const normalizedName = name.toLowerCase().trim()
    const normalizedCategory = category.trim()

    for (const [id, candidate] of Object.entries(candidates as any)) {
      if (excludeId && id === excludeId) continue

      const candidateName = (candidate.name || '').toLowerCase().trim()
      const candidateCategory = (candidate.category || '').trim()

      if (candidateName === normalizedName && candidateCategory === normalizedCategory) {
        return { exists: true, existingId: id }
      }
    }

    return { exists: false }
  } catch (error) {
    console.error('Error checking duplicate candidate:', error)
    return { exists: false }
  }
}

export async function addCandidate(candidateId: string, candidateData: any) {
  try {
    // Validate candidate ID
    if (!candidateId || typeof candidateId !== 'string' || candidateId.trim().length === 0) {
      return { success: false, error: 'Invalid candidate ID' }
    }

    candidateId = candidateId.trim().toLowerCase().replace(/\s+/g, '-')

    // Check if candidate ID already exists
    const existingSnapshot = await get(ref(database, `candidates/${candidateId}`))
    if (existingSnapshot.exists()) {
      return { success: false, error: `Candidate with ID "${candidateId}" already exists` }
    }

    // Validate candidate data
    const validation = validateCandidateData(candidateData)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Check for duplicate name + category combination
    const duplicateCheck = await checkDuplicateCandidate(candidateData.name, candidateData.category)
    if (duplicateCheck.exists) {
      return { 
        success: false, 
        error: `A candidate with the name "${candidateData.name}" already exists in category "${candidateData.category}" (ID: ${duplicateCheck.existingId})` 
      }
    }

    // Ensure ID matches the candidateId parameter
    candidateData.id = candidateId

    // Add candidate to database
    await set(ref(database, `candidates/${candidateId}`), candidateData)
    
    return { success: true, candidateId }
  } catch (error) {
    console.error('Error adding candidate:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
  }
}

/**
 * Update an existing candidate
 */
export async function updateCandidate(candidateId: string, candidateData: any) {
  try {
    if (!candidateId || typeof candidateId !== 'string' || candidateId.trim().length === 0) {
      return { success: false, error: 'Invalid candidate ID' }
    }

    // Check if candidate exists
    const existingSnapshot = await get(ref(database, `candidates/${candidateId}`))
    if (!existingSnapshot.exists()) {
      return { success: false, error: `Candidate with ID "${candidateId}" does not exist` }
    }

    // Validate candidate data
    const validation = validateCandidateData(candidateData)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Check for duplicate name + category (excluding current candidate)
    const duplicateCheck = await checkDuplicateCandidate(candidateData.name, candidateData.category, candidateId)
    if (duplicateCheck.exists) {
      return { 
        success: false, 
        error: `A candidate with the name "${candidateData.name}" already exists in category "${candidateData.category}" (ID: ${duplicateCheck.existingId})` 
      }
    }

    // Preserve existing votes and percentage if not provided
    const existing = existingSnapshot.val()
    candidateData.votes = candidateData.votes !== undefined ? candidateData.votes : existing.votes
    candidateData.percentage = candidateData.percentage !== undefined ? candidateData.percentage : existing.percentage
    candidateData.id = candidateId

    // Update candidate
    await set(ref(database, `candidates/${candidateId}`), candidateData)
    
    return { success: true, candidateId }
  } catch (error) {
    console.error('Error updating candidate:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
  }
}

// ============ VOTES ============

export async function submitVote(
  userId: string,
  candidateId: string,
  voteCount: number,
  paymentMethod: string,
  provider: string,
  transactionId: string
) {
  try {
    const voteId = `${userId}_${Date.now()}`
    
    // Add vote record
    await set(ref(database, `votes/${voteId}`), {
      userId,
      candidateId,
      voteCount,
      paymentMethod,
      provider,
      transactionId,
      status: 'completed',
      createdAt: new Date().toISOString(),
    })

    // Update candidate vote count
    await update(ref(database, `candidates/${candidateId}`), {
      votes: increment(voteCount),
    })

    // Update user vote count
    await update(ref(database, `users/${userId}`), {
      totalVotes: increment(voteCount),
    })

    return { success: true, voteId }
  } catch (error) {
    console.error('Error submitting vote:', error)
    return { success: false, error }
  }
}

export async function getUserVotes(userId: string) {
  try {
    const snapshot = await get(ref(database, `votes`))
    if (snapshot.exists()) {
      const allVotes = snapshot.val()
      const userVotes = Object.values(allVotes).filter((vote: any) => vote.userId === userId)
      return userVotes
    }
    return []
  } catch (error) {
    console.error('Error fetching user votes:', error)
    return []
  }
}

export function subscribeToVotes(callback: (data: any) => void) {
  const votesRef = ref(database, 'votes')
  const unsubscribe = onValue(votesRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    }
  })
  return unsubscribe
}

// ============ USERS ============

export async function createUser(userId: string, userData: any) {
  try {
    await set(ref(database, `users/${userId}`), {
      ...userData,
      totalVotes: 0,
      createdAt: new Date().toISOString(),
    })
    return { success: true }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error }
  }
}

export async function getUser(userId: string) {
  try {
    const snapshot = await get(ref(database, `users/${userId}`))
    if (snapshot.exists()) {
      return snapshot.val()
    }
    return null
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function updateUser(userId: string, userData: any) {
  try {
    await update(ref(database, `users/${userId}`), userData)
    return { success: true }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error }
  }
}

// ============ LEADERBOARD ============

export async function getLeaderboard(limit: number = 10) {
  try {
    const snapshot = await get(ref(database, 'candidates'))
    if (snapshot.exists()) {
      const candidates = snapshot.val()
      const sorted = Object.values(candidates)
        .sort((a: any, b: any) => (b.votes || 0) - (a.votes || 0))
        .slice(0, limit)
      return sorted
    }
    return []
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }
}

export function subscribeToLeaderboard(callback: (data: any) => void, limit: number = 10) {
  const candidatesRef = ref(database, 'candidates')
  const unsubscribe = onValue(candidatesRef, (snapshot) => {
    if (snapshot.exists()) {
      const candidatesObj = snapshot.val()
      const candidatesArray = Object.values(candidatesObj)
      const withPercentages = calculatePercentages(candidatesArray)
      const sorted = withPercentages
        .sort((a: any, b: any) => (b.votes || 0) - (a.votes || 0))
        .slice(0, limit)
      callback(sorted)
    }
  })
  return unsubscribe
}
