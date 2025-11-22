import { database } from './firebase'
import { ref, update, increment, set, get } from 'firebase/database'

/**
 * Submit a vote and update Firebase in real-time
 * This will trigger updates across all connected clients
 */
export async function submitVoteToFirebase(
  candidateId: string,
  voteCount: number,
  phoneNumber: string,
  paymentMethod: string,
  provider: string
) {
  try {
    // Generate unique vote ID
    const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create vote record
    const voteData = {
      id: voteId,
      candidateId,
      voteCount,
      phoneNumber,
      paymentMethod,
      provider,
      status: 'completed',
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
    }

    // Update candidate votes count
    await update(ref(database, `candidates/${candidateId}`), {
      votes: increment(voteCount),
      updatedAt: Date.now(),
    })

    // Store vote record
    await set(ref(database, `votes/${voteId}`), voteData)

    return {
      success: true,
      voteId,
      message: 'Vote submitted successfully!',
    }
  } catch (error) {
    console.error('Error submitting vote:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit vote',
    }
  }
}

/**
 * Get current vote count for a candidate
 */
export async function getCandidateVotes(candidateId: string) {
  try {
    const snapshot = await get(ref(database, `candidates/${candidateId}/votes`))
    if (snapshot.exists()) {
      return snapshot.val()
    }
    return 0
  } catch (error) {
    console.error('Error fetching candidate votes:', error)
    return 0
  }
}

/**
 * Get all votes for a specific candidate
 */
export async function getCandidateVoteHistory(candidateId: string) {
  try {
    const snapshot = await get(ref(database, 'votes'))
    if (snapshot.exists()) {
      const allVotes = snapshot.val()
      const candidateVotes = Object.values(allVotes).filter(
        (vote: any) => vote.candidateId === candidateId
      )
      return candidateVotes
    }
    return []
  } catch (error) {
    console.error('Error fetching vote history:', error)
    return []
  }
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // Cameroon phone number format: 6xx xxx xxx (9 digits starting with 6)
  const phoneRegex = /^6\d{8}$/
  return phoneRegex.test(phoneNumber.replace(/\s/g, ''))
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '')
  if (cleaned.length === 9) {
    return `+237 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  return phoneNumber
}

/**
 * Calculate total cost of votes
 */
export function calculateVoteCost(voteCount: number, pricePerVote: number = 5): number {
  return voteCount * pricePerVote
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'XAF'): string {
  return `${amount.toLocaleString()} ${currency}`
}
