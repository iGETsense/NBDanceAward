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
  })
  return unsubscribe
}

export async function addCandidate(candidateId: string, candidateData: any) {
  try {
    await set(ref(database, `candidates/${candidateId}`), candidateData)
    return { success: true }
  } catch (error) {
    console.error('Error adding candidate:', error)
    return { success: false, error }
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
