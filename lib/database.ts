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
    // Get candidate IDs for this category from the link table
    const linkSnapshot = await get(ref(database, 'candidateCategories'))
    if (!linkSnapshot.exists()) {
      return []
    }

    const links = linkSnapshot.val()
    const candidateIds = Array.isArray(links)
      ? links.filter((link: any) => link.categoryId === categoryId).map((link: any) => link.candidateId)
      : Object.values(links).filter((link: any) => link.categoryId === categoryId).map((link: any) => link.candidateId)

    // Get all candidates
    const candidatesSnapshot = await get(ref(database, 'candidates'))
    if (!candidatesSnapshot.exists()) {
      return []
    }

    const candidatesObj = candidatesSnapshot.val()

    // Filter candidates by IDs from link table
    const filtered = Object.entries(candidatesObj)
      .filter(([id]) => candidateIds.includes(id))
      .map(([_, candidate]) => candidate)

    return filtered
  } catch (error) {
    console.error('Error fetching candidates by category:', error)
    return []
  }
}

export function subscribeToCandidates(callback: (data: any) => void) {
  const candidatesRef = ref(database, 'candidates')
  const unsubscribe = onValue(candidatesRef, async (snapshot) => {
    if (snapshot.exists()) {
      const candidatesObj = snapshot.val()
      const candidatesArray = Object.values(candidatesObj)

      console.log('📊 [DEBUG] Candidates loaded:', candidatesArray.length)

      // Fetch categories and candidateCategories to enrich candidate data
      try {
        const [categoriesSnapshot, linksSnapshot] = await Promise.all([
          get(ref(database, 'categories')),
          get(ref(database, 'candidateCategories'))
        ])

        const categoriesObj = categoriesSnapshot.exists() ? categoriesSnapshot.val() : {}
        const links = linksSnapshot.exists() ? linksSnapshot.val() : []

        console.log('📂 [DEBUG] Categories loaded:', Object.keys(categoriesObj).length)
        console.log('🔗 [DEBUG] Links loaded:', Array.isArray(links) ? links.length : Object.keys(links).length)
        console.log('🔗 [DEBUG] Links structure:', links)

        // Create a map of candidateId -> categoryId
        const candidateCategoryMap = new Map<string, string>()
        const linksArray = Array.isArray(links) ? links : Object.values(links)
        linksArray.forEach((link: any) => {
          candidateCategoryMap.set(link.candidateId, link.categoryId)
        })

        console.log('🗺️ [DEBUG] Category map size:', candidateCategoryMap.size)
        console.log('🗺️ [DEBUG] First 3 mappings:', Array.from(candidateCategoryMap.entries()).slice(0, 3))

        // Enrich candidates with category information
        const enrichedCandidates = candidatesArray.map((candidate: any) => {
          const categoryId = candidateCategoryMap.get(candidate.id)
          const category = categoryId && categoriesObj[categoryId] ? categoriesObj[categoryId] : null

          return {
            ...candidate,
            categoryId: categoryId || 'unknown',
            category: category ? category.name : 'Unknown Category'
          }
        })

        console.log('✨ [DEBUG] First enriched candidate:', enrichedCandidates[0])
        console.log('✨ [DEBUG] Enriched candidates with categories:', enrichedCandidates.filter(c => c.category !== 'Unknown Category').length)

        const withPercentages = calculatePercentages(enrichedCandidates)
        callback(withPercentages)
      } catch (error) {
        console.error('❌ [ERROR] Error enriching candidates with categories:', error)
        // Fallback: return candidates without category info
        const withPercentages = calculatePercentages(candidatesArray)
        callback(withPercentages)
      }
    }
  }, (error) => {
    console.error('❌ [ERROR] Firebase error:', error)
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
  const unsubscribe = onValue(candidatesRef, async (snapshot) => {
    if (snapshot.exists()) {
      const candidatesObj = snapshot.val()
      const candidatesArray = Object.values(candidatesObj)

      // Fetch categories and candidateCategories to enrich candidate data
      try {
        const [categoriesSnapshot, linksSnapshot] = await Promise.all([
          get(ref(database, 'categories')),
          get(ref(database, 'candidateCategories'))
        ])

        const categoriesObj = categoriesSnapshot.exists() ? categoriesSnapshot.val() : {}
        const links = linksSnapshot.exists() ? linksSnapshot.val() : []

        // Create a map of candidateId -> categoryId
        const candidateCategoryMap = new Map<string, string>()
        const linksArray = Array.isArray(links) ? links : Object.values(links)
        linksArray.forEach((link: any) => {
          candidateCategoryMap.set(link.candidateId, link.categoryId)
        })

        // Enrich candidates with category information
        const enrichedCandidates = candidatesArray.map((candidate: any) => {
          const categoryId = candidateCategoryMap.get(candidate.id)
          const category = categoryId && categoriesObj[categoryId] ? categoriesObj[categoryId] : null

          return {
            ...candidate,
            categoryId: categoryId || 'unknown',
            category: category ? category.name : 'Unknown Category'
          }
        })

        const withPercentages = calculatePercentages(enrichedCandidates)
        const sorted = withPercentages
          .sort((a: any, b: any) => (b.votes || 0) - (a.votes || 0))
          .slice(0, limit)
        callback(sorted)
      } catch (error) {
        console.error('Error enriching leaderboard with categories:', error)
        // Fallback: return candidates without category info
        const withPercentages = calculatePercentages(candidatesArray)
        const sorted = withPercentages
          .sort((a: any, b: any) => (b.votes || 0) - (a.votes || 0))
          .slice(0, limit)
        callback(sorted)
      }
    }
  })
  return unsubscribe
}
