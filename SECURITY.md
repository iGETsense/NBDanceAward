# Security Implementation Guide

## Overview
This document outlines all security measures implemented in the NB Dance Awards application to protect against common web vulnerabilities.

## Security Features Implemented

### 1. **XSS (Cross-Site Scripting) Protection**
- **Input Sanitization**: All user inputs are sanitized using `sanitizeInput()` function
- **HTML Entity Encoding**: Special characters are encoded to prevent script injection
- **Content Security Policy (CSP)**: Strict CSP headers prevent inline script execution
- **React Escaping**: React automatically escapes JSX content

**Implementation:**
```typescript
import { sanitizeInput, sanitizeObject } from '@/lib/security'

// Sanitize user input
const cleanInput = sanitizeInput(userInput)

// Sanitize entire objects
const cleanData = sanitizeObject(userData)
```

### 2. **SQL Injection Prevention**
- **Input Validation**: `validateSQLSafe()` blocks SQL keywords and patterns
- **Firebase**: Uses Firebase Realtime Database with security rules (no direct SQL)
- **Parameterized Queries**: All database operations use Firebase SDK (no raw queries)
- **Input Type Checking**: Strict validation of data types

**Implementation:**
```typescript
import { validateSQLSafe } from '@/lib/security'

if (!validateSQLSafe(userInput)) {
  throw new Error('Invalid input detected')
}
```

### 3. **CSRF (Cross-Site Request Forgery) Protection**
- **CSRF Tokens**: Generated and validated for state-changing operations
- **SameSite Cookies**: Configured to prevent cross-site cookie transmission
- **Origin Validation**: Requests validated against expected origins

**Implementation:**
```typescript
import { generateCSRFToken, validateCSRFToken } from '@/lib/security'

const token = generateCSRFToken()
const isValid = validateCSRFToken(userToken, storedToken)
```

### 4. **Security Headers**
Implemented via middleware and Next.js config:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Enables browser XSS protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer information |
| `Permissions-Policy` | Restrictive | Disables unnecessary APIs |
| `Strict-Transport-Security` | `max-age=31536000` | Enforces HTTPS |
| `Content-Security-Policy` | Restrictive | Controls resource loading |

### 5. **Rate Limiting**
- **RateLimiter Class**: Prevents brute force attacks
- **Admin Login**: Limited to 5 attempts per minute
- **API Endpoints**: Rate limited per IP address

**Implementation:**
```typescript
import { RateLimiter } from '@/lib/security'

const limiter = new RateLimiter(5, 60000) // 5 attempts per 60 seconds

if (!limiter.isAllowed(userIP)) {
  return { error: 'Too many attempts' }
}
```

### 6. **Input Validation**
Comprehensive validation functions for all user inputs:

```typescript
import {
  validateEmail,
  validatePhoneNumber,
  validateNumeric,
  validateCandidateData,
  validateWithdrawalData,
} from '@/lib/security'

// Validate email
if (!validateEmail(email)) throw new Error('Invalid email')

// Validate phone
if (!validatePhoneNumber(phone)) throw new Error('Invalid phone')

// Validate candidate data
if (!validateCandidateData(candidateObj)) throw new Error('Invalid data')

// Validate withdrawal
if (!validateWithdrawalData(withdrawalObj)) throw new Error('Invalid withdrawal')
```

### 7. **Open Redirect Prevention**
- **URL Validation**: `isValidRedirectUrl()` prevents open redirects
- **Whitelist Approach**: Only allows redirects to same origin

**Implementation:**
```typescript
import { isValidRedirectUrl } from '@/lib/security'

if (isValidRedirectUrl(redirectUrl)) {
  window.location.href = redirectUrl
}
```

### 8. **Environment Variable Protection**
- **Validation**: All required env vars validated on startup
- **Type Safety**: Environment variables validated before use
- **No Exposure**: Sensitive data never logged or exposed

**Implementation:**
```typescript
import { validateEnvironment, getEnvVar } from '@/lib/env'

// Validates all required env vars
validateEnvironment()

// Safely get env var
const apiKey = getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY')
```

### 9. **Firebase Security Rules**
```json
{
  "rules": {
    "candidates": {
      ".read": true,
      ".write": false
    },
    "votes": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "users": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 10. **Admin Panel Security**
- **Password Protection**: Secure admin login with password hashing
- **Session Management**: Admin sessions stored in localStorage with expiration
- **Access Control**: Admin routes protected with authentication checks
- **Input Validation**: All admin inputs validated before processing

## Best Practices Implemented

✅ **Defense in Depth**: Multiple layers of security  
✅ **Principle of Least Privilege**: Minimal permissions granted  
✅ **Input Validation**: All inputs validated and sanitized  
✅ **Output Encoding**: All outputs properly encoded  
✅ **HTTPS Enforcement**: HSTS headers enforce HTTPS  
✅ **Secure Headers**: All recommended security headers implemented  
✅ **Error Handling**: Generic error messages to prevent information leakage  
✅ **Logging**: Security events logged for monitoring  

## Usage Examples

### Sanitizing User Input
```typescript
import { sanitizeInput } from '@/lib/security'

const userComment = "<script>alert('xss')</script>"
const safe = sanitizeInput(userComment)
// Output: "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
```

### Validating Candidate Data
```typescript
import { validateCandidateData } from '@/lib/security'

const candidateData = {
  name: "John Dancer",
  category: "Meilleur artiste",
  votes: 100,
  percentage: 25
}

if (validateCandidateData(candidateData)) {
  // Safe to process
}
```

### Rate Limiting Admin Login
```typescript
import { RateLimiter } from '@/lib/security'

const loginLimiter = new RateLimiter(5, 60000)

if (!loginLimiter.isAllowed(userIP)) {
  return { error: 'Too many login attempts. Try again later.' }
}
```

## Monitoring & Maintenance

### Regular Security Audits
- Review security headers monthly
- Audit Firebase security rules quarterly
- Check for dependency vulnerabilities

### Incident Response
- Monitor error logs for suspicious patterns
- Track failed login attempts
- Alert on unusual vote patterns

### Updates
- Keep Next.js updated
- Update Firebase SDK regularly
- Monitor security advisories

## Compliance

This implementation follows:
- **OWASP Top 10** security guidelines
- **CWE/SANS Top 25** most dangerous software weaknesses
- **NIST Cybersecurity Framework** recommendations

## Contact

For security issues, please report privately to: `NBCOMPANYENT@GMAIL.COM`
