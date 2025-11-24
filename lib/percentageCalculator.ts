/**
 * Calculate percentage for each candidate based on votes
 * Percentage = (candidate votes / total votes in category) * 100
 */

export function calculatePercentages(candidates: any[]): any[] {
  if (!candidates || candidates.length === 0) return candidates

  // Group candidates by categoryId
  const categoriesMap = new Map<string, any[]>()
  
  candidates.forEach((candidate) => {
    const categoryId = candidate?.categoryId || 'unknown'
    if (!categoriesMap.has(categoryId)) {
      categoriesMap.set(categoryId, [])
    }
    categoriesMap.get(categoryId)!.push(candidate)
  })

  // Calculate total votes per category
  const result = candidates.map((candidate) => {
    const categoryId = candidate?.categoryId || 'unknown'
    const categoryGroup = categoriesMap.get(categoryId) || []
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
export function getCategoryLeaderboard(candidates: any[], categoryId: string): any[] {
  const categoryGroup = candidates
    .filter((c) => (c?.categoryId || 'unknown') === categoryId)
    .map((c) => ({
      ...c,
      percentage: calculatePercentages([c])[0].percentage,
    }))
    .sort((a, b) => (b?.votes || 0) - (a?.votes || 0))

  return categoryGroup
}

/**
 * Get top candidate in each category
 */
export function getTopCandidatesPerCategory(candidates: any[]): any[] {
  const categoriesMap = new Map<string, any>()

  candidates.forEach((candidate) => {
    const categoryId = candidate?.categoryId || 'unknown'
    const existing = categoriesMap.get(categoryId)

    if (!existing || (candidate?.votes || 0) > (existing?.votes || 0)) {
      categoriesMap.set(categoryId, candidate)
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
  const categoryId = candidate?.categoryId || 'unknown'
  const categoryGroup = allCandidates.filter((c) => (c?.categoryId || 'unknown') === categoryId)
  const totalVotesInCategory = categoryGroup.reduce((sum, c) => sum + (c?.votes || 0), 0)

  const percentage = totalVotesInCategory > 0
    ? Math.round(((candidate?.votes || 0) / totalVotesInCategory) * 100)
    : 0

  return {
    ...candidate,
    percentage,
  }
}
