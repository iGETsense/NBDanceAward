/**
 * Secure Firebase API Route
 * 
 * All Firebase operations go through this backend route
 * Frontend never sees credentials or direct Firebase URLs
 * Everything is proxied through Next.js backend
 */

import { NextRequest, NextResponse } from 'next/server'

// Hardcoded Firebase config (server-side only, never exposed to frontend)
const FIREBASE_DB_URL = 'https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app'

// Hardcoded Proxy URL (server-side only)
const PROXY_URL = process.env.NEXT_PUBLIC_FIREBASE_PROXY_URL || 'http://localhost:5000'

/**
 * POST /api/firebase
 * 
 * Request body:
 * {
 *   "method": "GET" | "POST" | "PATCH" | "DELETE",
 *   "path": "/candidates",
 *   "data": { ... } // optional, for POST/PATCH
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { method = 'GET', path, data } = body

    // Validate path (prevent directory traversal)
    if (!path || !path.startsWith('/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid path' },
        { status: 400 }
      )
    }

    // Build Firebase URL (server-side, never exposed to frontend)
    const firebaseUrl = `${FIREBASE_DB_URL}${path}.json`

    // Make request to Firebase (from server, not blocked by Orange)
    const response = await fetch(firebaseUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`Firebase error: ${response.status}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      data: result,
      source: 'firebase',
    })
  } catch (error) {
    console.error('Firebase API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/firebase?path=/candidates
 * 
 * Query params:
 * - path: "/candidates" or "/categories" etc
 */
export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get('path')

    if (!path || !path.startsWith('/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid path' },
        { status: 400 }
      )
    }

    // Build Firebase URL (server-side, never exposed to frontend)
    const firebaseUrl = `${FIREBASE_DB_URL}${path}.json`

    // Make request to Firebase (from server, not blocked by Orange)
    const response = await fetch(firebaseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Firebase error: ${response.status}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      data: result,
      source: 'firebase',
    })
  } catch (error) {
    console.error('Firebase API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
