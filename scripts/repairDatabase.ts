/**
 * Database Repair Script
 * This script repairs and normalizes the Firebase Realtime Database
 * - Removes duplicate candidates
 * - Normalizes data structure (removes 'quote', ensures 'title')
 * - Standardizes category names
 * - Validates all candidate data
 * 
 * Usage: npx ts-node scripts/repairDatabase.ts
 */

import { database } from '../lib/firebase'
import { ref, get, set, remove } from 'firebase/database'

// Standard category names mapping
const CATEGORY_MAPPING: Record<string, string> = {
  'Meilleur artiste danseur - masculin': 'Meilleur artiste danseur - masculin',
  'Meilleur artiste danseur masculin': 'Meilleur artiste danseur - masculin',
  'Meilleure artiste danseuse féminine': 'Meilleure artiste danseuse féminine',
  'Meilleur Groupe de danse': 'Meilleur Groupe de danse',
  'Meilleur collaboration duo': 'Meilleur collaboration duo',
  'Meilleurs artiste chorégraphes': 'Meilleurs artiste chorégraphes',
  'Meilleur Performance web': 'Meilleur Performance web',
  'meilleur artiste danse au rythme folklorique': 'Meilleur artiste danse au rythme folklorique',
  'Meilleur artiste danse au rythme folklorique': 'Meilleur artiste danse au rythme folklorique',
  'Meilleur artiste danseur Afro Coupé décalé': 'Meilleur artiste danseur Afro Coupé décalé',
  'meilleurs artiste danseurs mbolé': 'Meilleur artiste danseur mbolé',
  'Meilleure artiste danseuse mbolé': 'Meilleure artiste danseuse mbolé',
  'Meilleur artiste jeune danseur/danseuse': 'Meilleur artiste jeune danseur/danseuse',
  'Meilleur artiste danseur de l\'année': 'Meilleur artiste danseur de l\'année',
}

interface Candidate {
  id: string
  name: string
  title?: string
  quote?: string
  image: string
  votes: number
  badge?: number | null
  percentage: number
  category: string
}

function normalizeCandidate(candidate: Candidate, id: string): Candidate {
  // Normalize category
  const normalizedCategory = CATEGORY_MAPPING[candidate.category] || candidate.category
  
  // Ensure title exists (use quote if title doesn't exist, or generate from name)
  const title = candidate.title || candidate.quote || candidate.name
  
  // Remove quote field, ensure title exists
  const normalized: Candidate = {
    id: id,
    name: candidate.name.trim(),
    title: title.trim(),
    image: candidate.image.trim(),
    votes: candidate.votes || 0,
    badge: candidate.badge || null,
    percentage: candidate.percentage || 0,
    category: normalizedCategory,
  }
  
  return normalized
}

function findDuplicates(candidates: Record<string, Candidate>): {
  duplicates: string[]
  toKeep: string
}[] {
  const nameMap = new Map<string, string[]>()
  
  // Group candidates by normalized name
  Object.entries(candidates).forEach(([id, candidate]) => {
    const normalizedName = candidate.name.toLowerCase().trim()
    if (!nameMap.has(normalizedName)) {
      nameMap.set(normalizedName, [])
    }
    nameMap.get(normalizedName)!.push(id)
  })
  
  // Find duplicates (same name, same category)
  const duplicates: { duplicates: string[]; toKeep: string }[] = []
  
  nameMap.forEach((ids, normalizedName) => {
    if (ids.length > 1) {
      // Check if they're in the same category
      const candidatesByCategory = new Map<string, string[]>()
      
      ids.forEach(id => {
        const category = candidates[id].category
        if (!candidatesByCategory.has(category)) {
          candidatesByCategory.set(category, [])
        }
        candidatesByCategory.get(category)!.push(id)
      })
      
      // For each category, if there are multiple, keep the one with most votes
      candidatesByCategory.forEach((categoryIds, category) => {
        if (categoryIds.length > 1) {
          // Sort by votes (descending) and keep the first one
          const sorted = categoryIds.sort((a, b) => {
            const votesA = candidates[a].votes || 0
            const votesB = candidates[b].votes || 0
            return votesB - votesA
          })
          
          duplicates.push({
            toKeep: sorted[0],
            duplicates: sorted.slice(1),
          })
        }
      })
    }
  })
  
  return duplicates
}

async function repairDatabase() {
  try {
    console.log('🔧 Starting database repair...\n')
    
    // Fetch all candidates
    const snapshot = await get(ref(database, 'candidates'))
    if (!snapshot.exists()) {
      console.log('❌ No candidates found in database')
      return
    }
    
    const candidates = snapshot.val() as Record<string, Candidate>
    console.log(`📊 Found ${Object.keys(candidates).length} candidates\n`)
    
    // Step 1: Find and remove duplicates
    console.log('🔍 Step 1: Finding duplicates...')
    const duplicateGroups = findDuplicates(candidates)
    
    if (duplicateGroups.length > 0) {
      console.log(`⚠️  Found ${duplicateGroups.length} duplicate group(s)\n`)
      
      for (const group of duplicateGroups) {
        const toKeep = candidates[group.toKeep]
        console.log(`  Keeping: ${toKeep.name} (${toKeep.category}) - ${toKeep.votes} votes`)
        
        for (const dupId of group.duplicates) {
          const dup = candidates[dupId]
          console.log(`  Removing duplicate: ${dup.name} (${dup.category}) - ${dup.votes} votes`)
          
          // Merge votes if needed (add votes from duplicate to kept candidate)
          if (dup.votes > 0) {
            console.log(`    ⚠️  Merging ${dup.votes} votes from duplicate to kept candidate`)
            toKeep.votes = (toKeep.votes || 0) + (dup.votes || 0)
          }
          
          // Remove duplicate
          await remove(ref(database, `candidates/${dupId}`))
          delete candidates[dupId]
        }
        
        // Update kept candidate with merged votes
        await set(ref(database, `candidates/${group.toKeep}`), normalizeCandidate(toKeep, group.toKeep))
      }
      
      console.log('\n✅ Duplicates removed\n')
    } else {
      console.log('✅ No duplicates found\n')
    }
    
    // Step 2: Normalize all candidates
    console.log('🔧 Step 2: Normalizing candidate data...')
    let normalizedCount = 0
    
    for (const [id, candidate] of Object.entries(candidates)) {
      const normalized = normalizeCandidate(candidate, id)
      
      // Check if normalization is needed
      const needsUpdate = 
        candidate.quote !== undefined ||
        !candidate.title ||
        candidate.category !== normalized.category ||
        candidate.name !== normalized.name ||
        candidate.image !== normalized.image
      
      if (needsUpdate) {
        await set(ref(database, `candidates/${id}`), normalized)
        normalizedCount++
        console.log(`  ✅ Normalized: ${normalized.name}`)
      }
    }
    
    console.log(`\n✅ Normalized ${normalizedCount} candidates\n`)
    
    // Step 3: Validate all candidates
    console.log('✅ Step 3: Validating candidate data...')
    const finalSnapshot = await get(ref(database, 'candidates'))
    const finalCandidates = finalSnapshot.val() as Record<string, Candidate>
    
    let validCount = 0
    let invalidCount = 0
    
    for (const [id, candidate] of Object.entries(finalCandidates)) {
      const isValid = 
        candidate.id &&
        candidate.name &&
        candidate.title &&
        candidate.image &&
        candidate.category &&
        typeof candidate.votes === 'number' &&
        typeof candidate.percentage === 'number'
      
      if (isValid) {
        validCount++
      } else {
        invalidCount++
        console.log(`  ⚠️  Invalid candidate: ${id}`)
        console.log(`     Missing fields:`, {
          id: !candidate.id,
          name: !candidate.name,
          title: !candidate.title,
          image: !candidate.image,
          category: !candidate.category,
          votes: typeof candidate.votes !== 'number',
          percentage: typeof candidate.percentage !== 'number',
        })
      }
    }
    
    console.log(`\n✅ Validation complete:`)
    console.log(`   Valid: ${validCount}`)
    console.log(`   Invalid: ${invalidCount}`)
    
    // Final summary
    console.log('\n' + '='.repeat(50))
    console.log('✨ Database repair completed successfully!')
    console.log(`📊 Total candidates: ${Object.keys(finalCandidates).length}`)
    console.log(`🗑️  Duplicates removed: ${duplicateGroups.reduce((sum, g) => sum + g.duplicates.length, 0)}`)
    console.log(`🔧 Normalized: ${normalizedCount}`)
    console.log('='.repeat(50))
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error repairing database:', error)
    process.exit(1)
  }
}

repairDatabase()

