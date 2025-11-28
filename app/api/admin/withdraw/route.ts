/**
 * Admin Withdrawal API Route
 * POST /api/admin/withdraw
 */

// Force Node.js runtime to avoid Edge Runtime header restrictions
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
import { makeWithdrawal } from '../../lib/mesomb';
import { validatePhoneNumber, detectOperator } from '../../lib/validation';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phoneNumber, amount, firebaseToken } = body;

        // Verify Firebase ID token and check admin UID
        const ADMIN_UID = 'srufAfEDDUU13G2GuxYEPmibTxe2';

        if (!firebaseToken) {
            return NextResponse.json(
                { success: false, error: 'Non autorisé - Token Firebase requis' },
                { status: 401 }
            );
        }

        // Simple client-side token verification (decode without verification for now)
        // In production, you should verify the token server-side with Firebase Admin SDK
        try {
            // Decode the JWT token to get the UID
            const tokenParts = firebaseToken.split('.');
            if (tokenParts.length !== 3) {
                throw new Error('Invalid token format');
            }

            const payload = JSON.parse(atob(tokenParts[1]));
            const uid = payload.user_id || payload.sub;

            if (uid !== ADMIN_UID) {
                return NextResponse.json(
                    { success: false, error: 'Non autorisé - Vous n\'êtes pas administrateur' },
                    { status: 403 }
                );
            }
        } catch (error) {
            return NextResponse.json(
                { success: false, error: 'Non autorisé - Token invalide' },
                { status: 401 }
            );
        }

        // Validate phone number
        const phoneValidation = validatePhoneNumber(phoneNumber);
        if (!phoneValidation.valid) {
            return NextResponse.json(
                { success: false, error: phoneValidation.error },
                { status: 400 }
            );
        }

        // Validate amount
        if (!amount || amount < 100 || amount > 1000000) {
            return NextResponse.json(
                { success: false, error: 'Amount must be between 100 and 1,000,000 XAF' },
                { status: 400 }
            );
        }

        // Detect operator
        const operator = detectOperator(phoneNumber);
        if (operator === 'UNKNOWN') {
            return NextResponse.json(
                { success: false, error: 'Unsupported operator. Only MTN and Orange are supported.' },
                { status: 400 }
            );
        }

        const mesombService = operator === 'MTN' ? 'MTN' : 'ORANGE';

        // Generate unique transaction ID
        const transactionId = `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Initiate withdrawal with Mesomb
        const withdrawalResult = await makeWithdrawal({
            amount: amount,
            service: mesombService,
            receiver: phoneNumber.replace(/\s/g, '').replace(/^\\+237/, ''),
            nonce: transactionId,
        });

        if (!withdrawalResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: withdrawalResult.error || 'Withdrawal failed',
                },
                { status: 500 }
            );
        }

        // Log withdrawal in Firebase
        const withdrawalsRef = ref(database, 'withdrawals');
        await push(withdrawalsRef, {
            id: transactionId,
            phoneNumber,
            operator: mesombService,
            amount: amount,
            mesombReference: withdrawalResult.reference,
            status: 'completed',
            createdAt: serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            transactionId,
            reference: withdrawalResult.reference,
            amount: amount,
            message: withdrawalResult.message || 'Withdrawal completed successfully',
        });
    } catch (error: any) {
        console.error('Withdrawal error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'An error occurred during withdrawal',
            },
            { status: 500 }
        );
    }
}
