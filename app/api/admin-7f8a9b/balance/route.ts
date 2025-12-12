
import { NextResponse } from 'next/server';
import { getAccountBalance } from '@/app/api/lib/mesomb';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await getAccountBalance();

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            balance: result.balance,
            balances: result.balances
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
    } catch (error: any) {
        console.error('Error in balance API:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
