import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { firebaseToken } = await request.json()

        // Admin UID
        const ADMIN_UID = 'srufAfEDDUU13G2GuxYEPmibTxe2'

        if (!firebaseToken) {
            return NextResponse.json(
                { success: false, message: 'Token required' },
                { status: 401 }
            )
        }

        // Verify token (simplified client-side check for now)
        // In production, use firebase-admin to verify
        try {
            const tokenParts = firebaseToken.split('.')
            if (tokenParts.length !== 3) throw new Error('Invalid token')

            const payload = JSON.parse(atob(tokenParts[1]))
            const uid = payload.user_id || payload.sub

            const isValid = uid === ADMIN_UID

            return NextResponse.json({
                success: isValid,
                message: isValid ? 'Authorized' : 'Unauthorized'
            })
        } catch (e) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            )
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        )
    }
}
