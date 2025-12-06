import { database } from './firebase'
import { ref, set, update, get, onValue, increment } from 'firebase/database'
import { calculatePercentages, updateCandidatePercentage } from './percentageCalculator'
import { getCandidateImage } from './candidateImages'
import { hybridRead, hybridWrite, withFailover, FAILOVER_TIMEOUT_MS, clearCache } from './hybridDatabase'
import {
  getAppwriteCandidates,
  getAppwriteCategories,
  getAppwriteCandidatesByCategory,
  getAppwriteUserVotes,
  getAppwriteUser,
  getAppwriteLeaderboard,
  submitAppwriteVote,
  createAppwriteUser,
  updateAppwriteUser,
  isAppwriteConfigured
} from './appwrite'

// ============ CATEGORIES ============

// Internal Firebase fetch for categories
async function getFirebaseCategories() {
  const snapshot = await get(ref(database, 'categories'))
  if (snapshot.exists()) {
    const categoriesObj = snapshot.val()
    return Object.values(categoriesObj).sort((a: any, b: any) => a.order - b.order)
  }
  return []
}

export async function getCategories() {
  return hybridRead(
    getFirebaseCategories,
    () => Promise.reject(new Error('Appwrite disabled')),
    'getCategories',
    { useCache: true }
  )
}

export function subscribeToCategories(callback: (data: any) => void) {
  const categoriesRef = ref(database, 'categories')
  let fallbackTriggered = false

  // Set up timeout to trigger Appwrite fallback
  const timeoutId = setTimeout(async () => {
    if (!fallbackTriggered) {
      fallbackTriggered = true
      console.log('📦 [subscribeToCategories] Firebase timeout, switching to Appwrite')
      try {
        const appwriteData = await getAppwriteCategories()
        callback(appwriteData)
      } catch (error) {
        console.error('❌ Appwrite fallback failed:', error)
      }
    }
  }, FAILOVER_TIMEOUT_MS)

  const unsubscribe = onValue(categoriesRef, (snapshot) => {
    clearTimeout(timeoutId)
    fallbackTriggered = true
    if (snapshot.exists()) {
      const categoriesObj = snapshot.val()
      const sorted = Object.values(categoriesObj).sort((a: any, b: any) => a.order - b.order)
      callback(sorted)
    }
  }, (error) => {
    clearTimeout(timeoutId)
    console.error('🔥 Firebase subscription error:', error)
    // Fallback to Appwrite on error
    if (!fallbackTriggered) {
      fallbackTriggered = true
      getAppwriteCategories().then(callback).catch(console.error)
    }
  })

  return () => {
    clearTimeout(timeoutId)
    unsubscribe()
  }
}

// ============ CANDIDATES ============

// Internal Firebase fetch for candidates
async function getFirebaseCandidates() {
  const snapshot = await get(ref(database, 'candidates'))
  if (snapshot.exists()) {
    return snapshot.val()
  }
  return {}
}

export async function getCandidates() {
  // Proxy function for server-side Firebase access (network workaround)
  const proxyFn = async () => {
    const proxyUrl = '/api/proxy/firebase?path=candidates'
    const proxyResponse = await fetch(proxyUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })

    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json()
      if (proxyData.success && proxyData.data) {
        return proxyData.data
      }
    }
    throw new Error('Proxy request failed')
  }

  const result = await withFailover(
    getFirebaseCandidates,
    getAppwriteCandidates,
    'getCandidates',
    { proxyFn }
  )

  return result.data
}


// Internal Firebase fetch for candidates by category
async function getFirebaseCandidatesByCategory(categoryId: string) {
  const linkSnapshot = await get(ref(database, 'candidateCategories'))
  if (!linkSnapshot.exists()) {
    return []
  }

  const links = linkSnapshot.val()
  const candidateIds = Array.isArray(links)
    ? links.filter((link: any) => link.categoryId === categoryId).map((link: any) => link.candidateId)
    : Object.values(links).filter((link: any) => link.categoryId === categoryId).map((link: any) => link.candidateId)

  const candidatesSnapshot = await get(ref(database, 'candidates'))
  if (!candidatesSnapshot.exists()) {
    return []
  }

  const candidatesObj = candidatesSnapshot.val()
  return Object.entries(candidatesObj)
    .filter(([id]) => candidateIds.includes(id))
    .map(([_, candidate]) => candidate)
}

export async function getCandidatesByCategory(categoryId: string) {
  return hybridRead(
    () => getFirebaseCandidatesByCategory(categoryId),
    () => getAppwriteCandidatesByCategory(categoryId),
    'getCandidatesByCategory'
  )
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

        // Enrich candidates with category information AND images from frontend
        const enrichedCandidates = candidatesArray.map((candidate: any) => {
          const categoryId = candidateCategoryMap.get(candidate.id)
          const category = categoryId && categoriesObj[categoryId] ? categoriesObj[categoryId] : null

          return {
            ...candidate,
            categoryId: categoryId || 'unknown',
            category: category ? category.name : 'Unknown Category',
            image: getCandidateImage(candidate.id, candidate.baseId)
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
    return { success: true, candidateId }
  } catch (error) {
    console.error('Error adding candidate:', error)
    return { success: false, error }
  }
}

export async function updateCandidate(candidateId: string, candidateData: any) {
  try {
    await update(ref(database, `candidates/${candidateId}`), candidateData)
    return { success: true, candidateId }
  } catch (error) {
    console.error('Error updating candidate:', error)
    return { success: false, error }
  }
}

// ============ VOTES ============

// Internal Firebase submit vote
async function firebaseSubmitVote(
  userId: string,
  candidateId: string,
  voteCount: number,
  paymentMethod: string,
  provider: string,
  transactionId: string
) {
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
}

export async function submitVote(
  userId: string,
  candidateId: string,
  voteCount: number,
  paymentMethod: string,
  provider: string,
  transactionId: string
) {
  try {
    // Use hybrid failover for Orange network compatibility
    const result = await hybridWrite(
      () => firebaseSubmitVote(userId, candidateId, voteCount, paymentMethod, provider, transactionId),
      () => submitAppwriteVote({ userId, candidateId, voteCount, paymentMethod, provider, transactionId }),
      'submitVote'
    )
    console.log(`✅ Vote submitted via ${result.source}`)
    return result.data
  } catch (error) {
    console.error('Error submitting vote:', error)
    return { success: false, error }
  }
}

// Internal Firebase fetch for user votes
async function getFirebaseUserVotes(userId: string) {
  const snapshot = await get(ref(database, `votes`))
  if (snapshot.exists()) {
    const allVotes = snapshot.val()
    return Object.values(allVotes).filter((vote: any) => vote.userId === userId)
  }
  return []
}

export async function getUserVotes(userId: string) {
  return hybridRead(
    () => getFirebaseUserVotes(userId),
    () => getAppwriteUserVotes(userId),
    `getUserVotes_${userId}`,
    { useCache: true }
  )
}

export function subscribeToVotes(callback: (data: any) => void) {
  const votesRef = ref(database, 'votes')
  let fallbackTriggered = false

  const timeoutId = setTimeout(async () => {
    if (!fallbackTriggered) {
      fallbackTriggered = true
      console.log('📦 [subscribeToVotes] Firebase timeout')
    }
  }, FAILOVER_TIMEOUT_MS)

  const unsubscribe = onValue(votesRef, (snapshot) => {
    clearTimeout(timeoutId)
    fallbackTriggered = true
    if (snapshot.exists()) {
      callback(snapshot.val())
    }
  })

  return () => {
    clearTimeout(timeoutId)
    unsubscribe()
  }
}

// ============ USERS ============

// Internal Firebase create user
async function firebaseCreateUser(userId: string, userData: any) {
  await set(ref(database, `users/${userId}`), {
    ...userData,
    totalVotes: 0,
    createdAt: new Date().toISOString(),
  })
  return { success: true }
}

export async function createUser(userId: string, userData: any) {
  try {
    // Use hybrid failover for Orange network compatibility
    const result = await hybridWrite(
      () => firebaseCreateUser(userId, userData),
      () => createAppwriteUser(userId, userData),
      'createUser'
    )
    console.log(`✅ User created via ${result.source}`)
    return result.data
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error }
  }
}

// Internal Firebase fetch for user
async function getFirebaseUser(userId: string) {
  const snapshot = await get(ref(database, `users/${userId}`))
  if (snapshot.exists()) {
    return snapshot.val()
  }
  return null
}

export async function getUser(userId: string) {
  return hybridRead(
    () => getFirebaseUser(userId),
    () => getAppwriteUser(userId),
    'getUser'
  )
}

// Internal Firebase update user
async function firebaseUpdateUser(userId: string, userData: any) {
  await update(ref(database, `users/${userId}`), userData)
  return { success: true }
}

export async function updateUser(userId: string, userData: any) {
  try {
    // Use hybrid failover for Orange network compatibility
    const result = await hybridWrite(
      () => firebaseUpdateUser(userId, userData),
      () => updateAppwriteUser(userId, userData),
      'updateUser'
    )
    console.log(`✅ User updated via ${result.source}`)
    return result.data
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error }
  }
}

// ============ LEADERBOARD ============

// Internal Firebase fetch for leaderboard
async function getFirebaseLeaderboard(limit: number) {
  const snapshot = await get(ref(database, 'candidates'))
  if (snapshot.exists()) {
    const candidates = snapshot.val()
    return Object.values(candidates)
      .sort((a: any, b: any) => (b.votes || 0) - (a.votes || 0))
      .slice(0, limit)
  }
  return []
}

export async function getLeaderboard(limit: number = 10) {
  return hybridRead(
    () => getFirebaseLeaderboard(limit),
    () => getAppwriteLeaderboard(limit),
    `getLeaderboard_${limit}`,
    { useCache: true }
  )
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

        // Enrich candidates with category information AND images from frontend
        const enrichedCandidates = candidatesArray.map((candidate: any) => {
          const categoryId = candidateCategoryMap.get(candidate.id)
          const category = categoryId && categoriesObj[categoryId] ? categoriesObj[categoryId] : null

          return {
            ...candidate,
            categoryId: categoryId || 'unknown',
            category: category ? category.name : 'Unknown Category',
            image: getCandidateImage(candidate.id, candidate.baseId)
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
