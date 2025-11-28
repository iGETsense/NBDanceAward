/**
 * Admin Withdrawal API Route
 * POST /api/admin/withdraw
 */

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
import { makeWithdrawal } from '../../lib/mesomb';
import { validatePhoneNumber, detectOperator } from '../../lib/validation';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phoneNumber, amount, adminPassword } = body;

        // Simple admin authentication (you should use proper auth in production)
        const expectedPassword = process.env.ADMIN_WITHDRAWAL_PASSWORD;
        if (!expectedPassword || adminPassword !== expectedPassword) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
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
