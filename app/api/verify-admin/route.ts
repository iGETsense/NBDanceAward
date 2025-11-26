import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json()

        // Get admin password from environment variable (server-side only)
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'NB2024Admin'

        // Verify password
        const isValid = password === ADMIN_PASSWORD

        return NextResponse.json({
            success: isValid,
            message: isValid ? 'Password correct' : 'Invalid password'
        })
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        )
    }
}
