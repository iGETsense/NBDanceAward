/**
 * Security Utilities for XSS, SQL Injection, and other attack prevention
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate phone number format (Cameroon format)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[0-9]{9}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

/**
 * Validate numeric input
 */
export function validateNumeric(value: any): boolean {
  const num = Number(value)
  return !isNaN(num) && isFinite(num) && num > 0
}

/**
 * Prevent SQL injection by validating input patterns
 */
export function validateSQLSafe(input: string): boolean {
  // Block common SQL injection patterns
  const sqlInjectionPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT)\b)/gi,
    /(-{2}|\/\*|\*\/|;|'|")/,
    /(xp_|sp_)/i,
  ]

  return !sqlInjectionPatterns.some(pattern => pattern.test(input))
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(key: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs)
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false
    }

    recentAttempts.push(now)
    this.attempts.set(key, recentAttempts)
    return true
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }
}

/**
 * CSRF Token generation
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false
  
  // Use constant-time comparison to prevent timing attacks
  return token === storedToken
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  const sanitized: any = Array.isArray(obj) ? [] : {}
  
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeInput(obj[key])
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitized[key] = sanitizeObject(obj[key])
    } else {
      sanitized[key] = obj[key]
    }
  }
  
  return sanitized
}

/**
 * Validate candidate data
 */
export function validateCandidateData(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  
  const { name, category, votes, percentage } = data
  
  return (
    typeof name === 'string' && name.length > 0 && name.length <= 100 &&
    typeof category === 'string' && category.length > 0 && category.length <= 100 &&
    typeof votes === 'number' && votes >= 0 && votes <= 1000000 &&
    typeof percentage === 'number' && percentage >= 0 && percentage <= 100
  )
}

/**
 * Validate withdrawal data
 */
export function validateWithdrawalData(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  
  const { amount, method } = data
  const validMethods = ['om', 'momo']
  
  return (
    typeof amount === 'number' &&
    amount > 0 &&
    amount <= 10000000 &&
    typeof method === 'string' &&
    validMethods.includes(method)
  )
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, char => map[char])
}

/**
 * Validate URL to prevent open redirect attacks
 */
export function isValidRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url, 'https://nb-dance-award.vercel.app')
    return parsed.origin === 'https://nb-dance-award.vercel.app'
  } catch {
    return false
  }
}
