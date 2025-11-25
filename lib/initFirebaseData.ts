/**
 * Initialize Firebase with candidate data
 * This function loads candidates from EXAMPLE_CANDIDATES.json and stores them in Firebase
 * Run this once to populate the database
 */

import { database } from './firebase'
import { ref, set, get, remove } from 'firebase/database'

export async function initializeFirebaseWithCandidates(forceReset: boolean = false) {
  try {
    const candidatesRef = ref(database, 'candidates')

    // Check if candidates already exist
    if (!forceReset) {
      const snapshot = await get(candidatesRef)
      if (snapshot.exists()) {
        console.log('✅ Candidates already exist in Firebase')
        return { success: true, message: 'Candidates already initialized' }
      }
    } else {
      console.log('🔄 Force resetting candidates...')
      await remove(candidatesRef)
    }

    // Load candidates from the JSON file
    const response = await fetch('/EXAMPLE_CANDIDATES.json')
    const data = await response.json()
    const candidates = data.candidates || []

    if (candidates.length === 0) {
      console.error('❌ No candidates found in EXAMPLE_CANDIDATES.json')
      return { success: false, error: 'No candidates found' }
    }

    // Convert array to object with candidate IDs as keys (without category fields)
    const candidatesObj: any = {};
    const candidateCategories: any[] = [];
    candidates.forEach((candidate: any, index: number) => {
      const id = candidate.id || `candidate-${index + 1}`;
      // Store candidate data without category info
      const { category, categoryId, ...rest } = candidate;
      candidatesObj[id] = {
        ...rest,
        id,
        votes: candidate.votes || 0,
        percentage: 0,
      };
      // Record link(s) – a candidate may belong to multiple categories in future
      if (categoryId) {
        candidateCategories.push({ candidateId: id, categoryId });
      }
    });

    // Write candidates to Firebase
    await set(candidatesRef, candidatesObj);

    // Write candidateCategories link table
    const candidateCategoriesRef = ref(database, 'candidateCategories');
    await set(candidateCategoriesRef, candidateCategories);

    // Write categories to Firebase
    const categoriesRef = ref(database, 'categories');
    await set(categoriesRef, {
      // categories defined in categories.json
      // This will be overwritten each init
    });

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
