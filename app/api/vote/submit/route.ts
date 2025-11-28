/**
 * Submit Vote API Route
 * POST /api/vote/submit
 */

// Force Node.js runtime to avoid Edge Runtime header restrictions
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, set, serverTimestamp } from 'firebase/database';
import { collectPayment } from '../../lib/mesomb';
import {
    validatePhoneNumber,
    validatePaymentMethod,
    validateVoteCount,
    validateCandidateExists,
    detectOperator,
} from '../../lib/validation';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { candidateId, voteCount, phoneNumber, paymentMethod } = body;

        // Validate inputs
        const phoneValidation = validatePhoneNumber(phoneNumber);
        if (!phoneValidation.valid) {
            return NextResponse.json(
                { success: false, error: phoneValidation.error },
                { status: 400 }
            );
        }

        const voteValidation = validateVoteCount(voteCount);
        if (!voteValidation.valid) {
            return NextResponse.json(
                { success: false, error: voteValidation.error },
                { status: 400 }
            );
        }

        const paymentValidation = validatePaymentMethod(phoneNumber, paymentMethod);
        if (!paymentValidation.valid) {
            return NextResponse.json(
                { success: false, error: paymentValidation.error },
                { status: 400 }
            );
        }

        const candidateValidation = await validateCandidateExists(candidateId);
        if (!candidateValidation.valid) {
            return NextResponse.json(
                { success: false, error: candidateValidation.error },
                { status: 404 }
            );
        }

        // Calculate payment amount
        const votePrice = parseInt(process.env.NEXT_PUBLIC_VOTE_PRICE || '105');
        const totalAmount = voteCount * votePrice;

        // Detect operator and map to Mesomb service
        const operator = detectOperator(phoneNumber);
        const mesombService = operator === 'MTN' ? 'MTN' : 'ORANGE';

        // Generate unique transaction ID
        const transactionId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Initiate payment with Mesomb
        const paymentResult = await collectPayment({
            amount: totalAmount,
            service: mesombService,
            payer: phoneNumber.replace(/\s/g, '').replace(/^\+237/, ''),
            nonce: transactionId,
        });

        if (!paymentResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: paymentResult.error || 'Payment initiation failed',
                },
                { status: 500 }
            );
        }

        // Create transaction record in Firebase
        const transactionData = {
            id: transactionId,
            candidateId,
            voteCount,
            phoneNumber,
            paymentMethod,
            operator: mesombService,
            amount: totalAmount,
            mesombReference: paymentResult.reference,
            status: 'pending',
            createdAt: serverTimestamp(),
        };

        const transactionRef = ref(database, `transactions/${transactionId}`);
        await set(transactionRef, transactionData);

        return NextResponse.json({
            success: true,
            transactionId,
            reference: paymentResult.reference,
            amount: totalAmount,
            message: 'Payment initiated. Please complete payment on your phone.',
        });
    } catch (error: any) {
        console.error('Submit vote error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'An error occurred while submitting vote',
            },
            { status: 500 }
        );
    }
}
