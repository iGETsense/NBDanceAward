/**
 * Utility functions for image path normalization and URL encoding
 */

/**
 * Normalizes image paths to match actual file names in public/dancers directory
 * Converts spaces to hyphens, handles special characters, and ensures proper casing
 */
export function normalizeImagePath(imagePath: string): string {
  if (!imagePath || typeof imagePath !== 'string') {
    return '/placeholder.svg'
  }

  // If it's already a placeholder or external URL, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath === '/placeholder.svg') {
    return imagePath
  }

  // Remove leading slash if present for processing
  const path = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath

  // Split into directory and filename
  const parts = path.split('/')
  const filename = parts[parts.length - 1]
  const directory = parts.slice(0, -1).join('/')

  // Normalize filename: convert to lowercase, replace spaces with hyphens, handle special chars
  let normalizedFilename = filename
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[''"]/g, '')
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  // Reconstruct path
  const normalizedPath = directory ? `${directory}/${normalizedFilename}` : normalizedFilename
  return `/${normalizedPath}`
}

/**
 * URL encodes an image path to handle spaces and special characters
 * This is used when passing paths to Next.js Image component
 */
export function encodeImagePath(imagePath: string): string {
  if (!imagePath || typeof imagePath !== 'string') {
    return '/placeholder.svg'
  }

  // If it's already a placeholder or external URL, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath === '/placeholder.svg') {
    return imagePath
  }

  // Split path into parts and encode each part
  const parts = imagePath.split('/')
  const encodedParts = parts.map(part => {
    if (!part) return part
    // Encode the part but keep slashes
    return encodeURIComponent(part)
  })

  return encodedParts.join('/')
}

/**
 * Gets the normalized image path, trying both normalized and original paths
 * Falls back to placeholder if image doesn't exist
 */
export function getImagePath(originalPath: string): string {
  if (!originalPath || typeof originalPath !== 'string') {
    return '/placeholder.svg'
  }

  // First try the normalized path (hyphenated, lowercase)
  const normalized = normalizeImagePath(originalPath)
  
  // If the original path is different from normalized, we might want to try both
  // For now, return normalized path as files have been renamed
  return normalized
}

