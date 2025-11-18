/**
 * Calculate percentage for each candidate based on votes
 * Percentage = (candidate votes / total votes in category) * 100
 */

export function calculatePercentages(candidates: any[]): any[] {
  if (!candidates || candidates.length === 0) return candidates

  // Group candidates by category
  const categoriesMap = new Map<string, any[]>()
  
  candidates.forEach((candidate) => {
    const category = candidate.category
    if (!categoriesMap.has(category)) {
      categoriesMap.set(category, [])
    }
    categoriesMap.get(category)!.push(candidate)
  })

  // Calculate total votes per category
  const result = candidates.map((candidate) => {
    const categoryGroup = categoriesMap.get(candidate.category) || []
    const totalVotesInCategory = categoryGroup.reduce((sum, c) => sum + (c.votes || 0), 0)

    // Calculate percentage
    const percentage = totalVotesInCategory > 0 
      ? Math.round((candidate.votes / totalVotesInCategory) * 100)
      : 0

    return {
      ...candidate,
      percentage,
    }
  })

  return result
}

/**
 * Get leaderboard for a specific category
 */
export function getCategoryLeaderboard(candidates: any[], category: string): any[] {
  const categoryGroup = candidates
    .filter((c) => c.category === category)
    .map((c) => ({
      ...c,
      percentage: calculatePercentages([c])[0].percentage,
    }))
    .sort((a, b) => b.votes - a.votes)

  return categoryGroup
}

/**
 * Get top candidate in each category
 */
export function getTopCandidatesPerCategory(candidates: any[]): any[] {
  const categoriesMap = new Map<string, any>()

  candidates.forEach((candidate) => {
    const category = candidate.category
    const existing = categoriesMap.get(category)

    if (!existing || candidate.votes > existing.votes) {
      categoriesMap.set(category, candidate)
    }
  })

  return Array.from(categoriesMap.values())
}

/**
 * Update percentage for a single candidate
 */
export function updateCandidatePercentage(
  candidate: any,
  allCandidates: any[]
): any {
  const categoryGroup = allCandidates.filter((c) => c.category === candidate.category)
  const totalVotesInCategory = categoryGroup.reduce((sum, c) => sum + (c.votes || 0), 0)

  const percentage = totalVotesInCategory > 0
    ? Math.round((candidate.votes / totalVotesInCategory) * 100)
    : 0

  return {
    ...candidate,
    percentage,
  }
}
