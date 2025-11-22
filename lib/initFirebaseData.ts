/**
 * Initialize Firebase with candidate data
 * This function loads candidates from EXAMPLE_CANDIDATES.json and stores them in Firebase
 * Run this once to populate the database
 */

import { database } from './firebase'
import { ref, set, get } from 'firebase/database'

export async function initializeFirebaseWithCandidates() {
  try {
    // Check if candidates already exist
    const candidatesRef = ref(database, 'candidates')
    const snapshot = await get(candidatesRef)
    
    if (snapshot.exists()) {
      console.log('✅ Candidates already exist in Firebase')
      return { success: true, message: 'Candidates already initialized' }
    }

    // Load candidates from the JSON file
    const response = await fetch('/EXAMPLE_CANDIDATES.json')
    const data = await response.json()
    const candidates = data.candidates || []

    if (candidates.length === 0) {
      console.error('❌ No candidates found in EXAMPLE_CANDIDATES.json')
      return { success: false, error: 'No candidates found' }
    }

    // Convert array to object with candidate IDs as keys
    const candidatesObj: any = {}
    candidates.forEach((candidate: any, index: number) => {
      const id = candidate.id || `candidate-${index + 1}`
      candidatesObj[id] = {
        ...candidate,
        id,
        votes: candidate.votes || 0,
        percentage: 0,
      }
    })

    // Write to Firebase
    await set(candidatesRef, candidatesObj)

    console.log(`✅ Successfully initialized ${candidates.length} candidates in Firebase`)
    return { success: true, count: candidates.length }
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Auto-initialize on first load (client-side only)
if (typeof window !== 'undefined') {
  // Check if we should initialize (only once per session)
  const hasInitialized = sessionStorage.getItem('firebase-initialized')
  if (!hasInitialized) {
    initializeFirebaseWithCandidates().then((result) => {
      if (result.success) {
        sessionStorage.setItem('firebase-initialized', 'true')
        console.log('🎉 Firebase initialized with candidates')
      }
    })
  }
}
