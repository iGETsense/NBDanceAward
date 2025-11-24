import { database } from './firebase'
import { ref, set, update, get, onValue, increment } from 'firebase/database'
import { calculatePercentages, updateCandidatePercentage } from './percentageCalculator'

// ============ CATEGORIES ============

export async function getCategories() {
  try {
    const snapshot = await get(ref(database, 'categories'))
    if (snapshot.exists()) {
      const categoriesObj = snapshot.val()
      return Object.values(categoriesObj).sort((a: any, b: any) => a.order - b.order)
    }
    return []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export function subscribeToCategories(callback: (data: any) => void) {
  const categoriesRef = ref(database, 'categories')
  const unsubscribe = onValue(categoriesRef, (snapshot) => {
    if (snapshot.exists()) {
      const categoriesObj = snapshot.val()
      const sorted = Object.values(categoriesObj).sort((a: any, b: any) => a.order - b.order)
      callback(sorted)
    }
  })
  return unsubscribe
}

// ============ CANDIDATES ============

export async function getCandidates() {
  try {
    const snapshot = await get(ref(database, 'candidates'))
    if (snapshot.exists()) {
      return snapshot.val()
    }
    return {}
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return {}
  }
}

export async function getCandidatesByCategory(categoryId: string) {
  try {
    // Get category with candidate IDs
    const categoryRef = ref(database, `categories/${categoryId}`)
    const categorySnapshot = await get(categoryRef)
    
    if (!categorySnapshot.exists()) {
      return []
    }
    
    const category = categorySnapshot.val()
    const candidateIds = category.candidates || []
    
    // Fetch full candidate data for each ID
    const candidates = await Promise.all(
      candidateIds.map(async (id: string) => {
        const candRef = ref(database, `candidates/${id}`)
        const candSnapshot = await get(candRef)
        return candSnapshot.val()
      })
    )
    
    return candidates.filter(c => c !== null)
  } catch (error) {
    console.error('Error fetching candidates by category:', error)
    return []
  }
}

export function subscribeToCandidates(callback: (data: any) => void) {
  const candidatesRef = ref(database, 'candidates')
  const categoriesRef = ref(database, 'categories')
  
  let candidates: any = {}
  let categories: any = {}
  
  // Subscribe to candidates
  const unsubscribeCandidates = onValue(candidatesRef, (snapshot) => {
    if (snapshot.exists()) {
      candidates = snapshot.val()
      updateAndCallback()
    }
  }, (error) => {
    console.error('Firebase error (candidates):', error)
  })
  
  // Subscribe to categories
  const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
    if (snapshot.exists()) {
      categories = snapshot.val()
      updateAndCallback()
    }
  }, (error) => {
    console.error('Firebase error (categories):', error)
  })
  
  // Update callback with percentages calculated per category
  const updateAndCallback = () => {
    if (Object.keys(candidates).length === 0 || Object.keys(categories).length === 0) return
    
    const candidatesArray = Object.values(candidates)
    const candidatesWithPercentages = candidatesArray.map((candidate: any) => {
      // Find all categories this candidate belongs to
      const candidateCategories = Object.values(categories).filter((cat: any) => 
        cat.candidates && cat.candidates.includes(candidate.id)
      )
      
      // Calculate percentage for each category
      const percentagesByCategory: any = {}
      candidateCategories.forEach((cat: any) => {
        const categoryId = cat.id
        const candidatesInCategory = cat.candidates
          .map((id: string) => candidates[id])
          .filter((c: any) => c)
        
        const totalVotes = candidatesInCategory.reduce((sum: number, c: any) => sum + (c.votes || 0), 0)
        const percentage = totalVotes > 0 
          ? Math.round((candidate.votes / totalVotes) * 100)
          : 0
        
        percentagesByCategory[categoryId] = percentage
      })
      
      return {
        ...candidate,
        percentage: Object.values(percentagesByCategory)[0] || 0, // Default to first category
        percentagesByCategory,
      }
    })
    
    callback(candidatesWithPercentages)
  }
  
  return () => {
    unsubscribeCandidates()
    unsubscribeCategories()
  }
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
