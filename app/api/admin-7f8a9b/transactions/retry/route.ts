/**
 * Admin Retry Votes API
 * POST /api/admin-7f8a9b/transactions/retry
 * Retries vote processing for transactions that completed but votes weren't added
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { retryVoteProcessing } from '@/lib/voteProcessor';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { transactionId } = body;

        if (!transactionId) {
            return NextResponse.json(
                { success: false, error: 'Transaction ID required' },
                { status: 400 }
            );
        }

        console.log(`[Retry API] Retrying votes for ${transactionId}`);

        const result = await retryVoteProcessing(transactionId);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: result.votesAdded
                    ? `${result.votesAdded} votes ajoutés avec succès!`
                    : 'Votes déjà traités (aucune action nécessaire)',
                votesAdded: result.votesAdded || 0,
            });
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }

    } catch (error: any) {
        console.error('[Retry API] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Retry failed' },
            { status: 500 }
        );
    }
}
