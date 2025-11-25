/**
 * Initialize Firebase with candidate data
 * This function loads candidates from EXAMPLE_CANDIDATES.json and stores them in Firebase
 * Run this once to populate the database
 */

import { database } from './firebase'
import { ref, set, get, remove } from 'firebase/database'

export async function initializeFirebaseWithCandidates(forceReset: boolean = true) {
  try {
    const candidatesRef = ref(database, 'candidates')

    // Force reset to load new normalized structure
    if (forceReset) {
      console.log('🔄 Force resetting database to load normalized structure...')
      await Promise.all([
        remove(candidatesRef),
        remove(ref(database, 'categories')),
        remove(ref(database, 'candidateCategories'))
      ])
    } else {
      // Check if candidates already exist
      const snapshot = await get(candidatesRef)
      if (snapshot.exists()) {
        console.log('✅ Candidates already exist in Firebase')
        return { success: true, message: 'Candidates already initialized' }
      }
    }

    // Load full database from the JSON file
    const response = await fetch('/full_db.json')
    const data = await response.json()
    const candidates = data.candidates || []
    const categories = data.categories || []
    const candidateCategories = data.candidateCategories || []

    if (candidates.length === 0) {
      console.error('❌ No candidates found in full_db.json')
      return { success: false, error: 'No candidates found' }
    }

    // Convert candidates array to object with candidate IDs as keys
    const candidatesObj: any = {};
    candidates.forEach((candidate: any) => {
      const { categoryIds, ...rest } = candidate; // Remove categoryIds from candidate object
      candidatesObj[candidate.id] = {
        ...rest,
        votes: candidate.votes || 0,
        percentage: candidate.percentage || 0,
      };
    });

    // Convert categories array to object with category IDs as keys
    const categoriesObj: any = {};
    categories.forEach((category: any) => {
      categoriesObj[category.id] = category;
    });

    // Write all data to Firebase
    await set(candidatesRef, candidatesObj);

    const categoriesRef = ref(database, 'categories');
    await set(categoriesRef, categoriesObj);

    const candidateCategoriesRef = ref(database, 'candidateCategories');
    await set(candidateCategoriesRef, candidateCategories);

    console.log(`✅ Successfully initialized ${candidates.length} candidates in Firebase`)
    return { success: true, count: candidates.length }
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Auto-initialize on first load (client-side only)
if (typeof window !== 'undefined') {
  // Version key to force re-initialization when structure changes
  const DB_VERSION = 'v2-normalized'
  const currentVersion = sessionStorage.getItem('firebase-db-version')

  if (currentVersion !== DB_VERSION) {
    console.log('🔄 Database structure changed, re-initializing...')
    sessionStorage.removeItem('firebase-initialized')
    initializeFirebaseWithCandidates(true).then((result) => {
      if (result.success) {
        sessionStorage.setItem('firebase-initialized', 'true')
        sessionStorage.setItem('firebase-db-version', DB_VERSION)
        console.log('🎉 Firebase initialized with normalized structure')
      }
    })
  }
}
