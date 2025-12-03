/**
 * Manual Withdrawal Registration API
 * Allows admin to manually register a withdrawal that was done in Mesomb
 * but not recorded in Firebase
 * POST /api/admin-7f8a9b/register-withdrawal
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, push } from 'firebase/database';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phoneNumber, amount, mesombReference, firebaseToken, note } = body;

        // Verify admin authorization
        const ADMIN_UID = 'He7g6275fIV459UbdKySfa5v5zJ3';

        if (!firebaseToken) {
            return NextResponse.json(
                { success: false, error: 'Non autorisé - Token Firebase requis' },
                { status: 401 }
            );
        }

        try {
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

        // Validate inputs
        if (!amount || amount < 0) {
            return NextResponse.json(
                { success: false, error: 'Montant invalide' },
                { status: 400 }
            );
        }

        // Generate transaction ID
        const transactionId = `manual_withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Register withdrawal in Firebase
        const withdrawalsRef = ref(database, 'withdrawals');
        await push(withdrawalsRef, {
            id: transactionId,
            phoneNumber: phoneNumber || 'N/A',
            operator: 'MANUAL',
            amount: amount,
            mesombReference: mesombReference || 'MANUAL_ENTRY',
            status: 'completed',
            createdAt: Date.now(),
            note: note || 'Retrait manuel enregistré pour synchronisation avec Mesomb',
            isManual: true,
        });

        console.log('[Manual Withdrawal] Registered:', {
            transactionId,
            amount,
            mesombReference,
        });

        return NextResponse.json({
            success: true,
            transactionId,
            amount,
            message: 'Retrait enregistré avec succès',
        });

    } catch (error: any) {
        console.error('[Manual Withdrawal] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Une erreur est survenue',
            },
            { status: 500 }
        );
    }
}
