/**
 * Firebase with Triple-Layer Fallback
 * 
 * Tries in order:
 * 1. Firebase SDK (fastest)
 * 2. Firebase REST API (if SDK fails)
 * 3. Flask Proxy Server (if REST API fails)
 * 
 * Automatic switching with configurable delays
 */

import {
  getCandidatesRest,
  getCategoriesRest,
  getVotesRest,
  getUserVotesRest,
  submitVoteRest,
  getUserRest,
  createUserRest,
  updateUserRest,
  getLeaderboardRest,
} from './firebaseRestApi'

// Configuration
const PROXY_URL = process.env.NEXT_PUBLIC_FIREBASE_PROXY_URL || 'http://localhost:5000'
const SDK_TIMEOUT = 3000 // 3 seconds for SDK
const REST_TIMEOUT = 5000 // 5 seconds for REST API

// Track which method is working
let workingMethod: 'sdk' | 'rest' | 'proxy' = 'sdk'

/**
 * Try SDK with timeout
 */
async function trySDK<T>(fn: () => Promise<T>, operationName: string): Promise<{ success: boolean; data?: T; error?: any }> {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SDK timeout')), SDK_TIMEOUT)
    )
    
    const data = await Promise.race([fn(), timeoutPromise])
    console.log(`✅ [${operationName}] SDK succeeded`)
    workingMethod = 'sdk'
    return { success: true, data: data as T }
  } catch (error) {
    console.warn(`⚠️ [${operationName}] SDK failed:`, (error as Error).message)
    return { success: false, error }
  }
}

/**
 * Try REST API with timeout
 */
async function tryREST<T>(fn: () => Promise<T>, operationName: string): Promise<{ success: boolean; data?: T; error?: any }> {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('REST API timeout')), REST_TIMEOUT)
    )
    
    const data = await Promise.race([fn(), timeoutPromise])
    console.log(`📡 [${operationName}] REST API succeeded`)
    workingMethod = 'rest'
    return { success: true, data: data as T }
  } catch (error) {
    console.warn(`⚠️ [${operationName}] REST API failed:`, (error as Error).message)
    return { success: false, error }
  }
}

/**
 * Try Proxy Server with timeout
 */
async function tryProxy<T>(fn: () => Promise<T>, operationName: string): Promise<{ success: boolean; data?: T; error?: any }> {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Proxy timeout')), REST_TIMEOUT)
    )
    
    const data = await Promise.race([fn(), timeoutPromise])
    console.log(`🔄 [${operationName}] Proxy succeeded`)
    workingMethod = 'proxy'
    return { success: true, data: data as T }
  } catch (error) {
    console.warn(`⚠️ [${operationName}] Proxy failed:`, (error as Error).message)
    return { success: false, error }
  }
}

/**
 * Proxy API call
 */
async function proxyCall<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${PROXY_URL}/api/firebase${endpoint}`)
  if (!response.ok) {
    throw new Error(`Proxy error: ${response.status}`)
  }
  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Proxy request failed')
  }
  return data.candidates || data.categories || data.votes || data.users || data.user || data.leaderboard || data
}

/**
 * Get candidates with triple fallback
 */
export async function getCandidatesWithFallback() {
  // Try SDK first
  const sdkResult = await trySDK(
    () => import('./database').then(m => m.getFirebaseCandidates?.() || Promise.reject('SDK not available')),
    'getCandidates'
  )
  if (sdkResult.success) return sdkResult.data

  // Try REST API
  const restResult = await tryREST(
    () => getCandidatesRest(),
    'getCandidates'
  )
  if (restResult.success) return restResult.data

  // Try Proxy
  const proxyResult = await tryProxy(
    () => proxyCall('/candidates'),
    'getCandidates'
  )
  if (proxyResult.success) return proxyResult.data

  throw new Error('All methods failed: SDK, REST API, and Proxy')
}

/**
 * Get categories with triple fallback
 */
export async function getCategoriesWithFallback() {
  // Try SDK first
  const sdkResult = await trySDK(
    () => import('./database').then(m => m.getFirebaseCategories?.() || Promise.reject('SDK not available')),
    'getCategories'
  )
  if (sdkResult.success) return sdkResult.data

  // Try REST API
  const restResult = await tryREST(
    () => getCategoriesRest(),
    'getCategories'
  )
  if (restResult.success) return restResult.data

  // Try Proxy
  const proxyResult = await tryProxy(
    () => proxyCall('/categories'),
    'getCategories'
  )
  if (proxyResult.success) return proxyResult.data

  throw new Error('All methods failed: SDK, REST API, and Proxy')
}

/**
 * Get votes with triple fallback
 */
export async function getVotesWithFallback() {
  // Try SDK first
  const sdkResult = await trySDK(
    () => import('./database').then(m => m.getFirebaseVotes?.() || Promise.reject('SDK not available')),
    'getVotes'
  )
  if (sdkResult.success) return sdkResult.data

  // Try REST API
  const restResult = await tryREST(
    () => getVotesRest(),
    'getVotes'
  )
  if (restResult.success) return restResult.data

  // Try Proxy
  const proxyResult = await tryProxy(
    () => proxyCall('/votes'),
    'getVotes'
  )
  if (proxyResult.success) return proxyResult.data

  throw new Error('All methods failed: SDK, REST API, and Proxy')
}

/**
 * Submit vote with triple fallback
 */
export async function submitVoteWithFallback(voteData: {
  userId: string
  candidateId: string
  voteCount: number
  paymentMethod: string
  provider: string
  transactionId: string
}) {
  // Try SDK first
  const sdkResult = await trySDK(
    () => import('./database').then(m => m.firebaseSubmitVote?.(
      voteData.userId,
      voteData.candidateId,
      voteData.voteCount,
      voteData.paymentMethod,
      voteData.provider,
      voteData.transactionId
    ) || Promise.reject('SDK not available')),
    'submitVote'
  )
  if (sdkResult.success) return sdkResult.data

  // Try REST API
  const restResult = await tryREST(
    () => submitVoteRest(voteData),
    'submitVote'
  )
  if (restResult.success) return restResult.data

  // Try Proxy
  const proxyResult = await tryProxy(
    () => proxyCall('/votes'),
    'submitVote'
  )
  if (proxyResult.success) return proxyResult.data

  throw new Error('All methods failed: SDK, REST API, and Proxy')
}

/**
 * Get user with triple fallback
 */
export async function getUserWithFallback(userId: string) {
  // Try SDK first
  const sdkResult = await trySDK(
    () => import('./database').then(m => m.getFirebaseUser?.(userId) || Promise.reject('SDK not available')),
    `getUser_${userId}`
  )
  if (sdkResult.success) return sdkResult.data

  // Try REST API
  const restResult = await tryREST(
    () => getUserRest(userId),
    `getUser_${userId}`
  )
  if (restResult.success) return restResult.data

  // Try Proxy
  const proxyResult = await tryProxy(
    () => proxyCall(`/users/${userId}`),
    `getUser_${userId}`
  )
  if (proxyResult.success) return proxyResult.data

  throw new Error('All methods failed: SDK, REST API, and Proxy')
}

/**
 * Get leaderboard with triple fallback
 */
export async function getLeaderboardWithFallback(limit: number = 10) {
  // Try SDK first
  const sdkResult = await trySDK(
    () => import('./database').then(m => m.getFirebaseLeaderboard?.(limit) || Promise.reject('SDK not available')),
    `getLeaderboard_${limit}`
  )
  if (sdkResult.success) return sdkResult.data

  // Try REST API
  const restResult = await tryREST(
    () => getLeaderboardRest(limit),
    `getLeaderboard_${limit}`
  )
  if (restResult.success) return restResult.data

  // Try Proxy
  const proxyResult = await tryProxy(
    () => proxyCall(`/leaderboard?limit=${limit}`),
    `getLeaderboard_${limit}`
  )
  if (proxyResult.success) return proxyResult.data

  throw new Error('All methods failed: SDK, REST API, and Proxy')
}

/**
 * Get current working method
 */
export function getWorkingMethod(): 'sdk' | 'rest' | 'proxy' {
  return workingMethod
}

/**
 * Get method status
 */
export function getMethodStatus(): string {
  const methods = {
    sdk: '🔥 Firebase SDK',
    rest: '📡 REST API',
    proxy: '🔄 Proxy Server',
  }
  return methods[workingMethod]
}
