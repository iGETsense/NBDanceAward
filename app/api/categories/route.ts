import { NextResponse } from 'next/server';
import { getSecureCategories } from '@/lib/secureDatabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/categories
 * Get all categories with secure Firebase access (Edge proxy fallback)
 */
export async function GET() {
    try {
        const categories = await getSecureCategories();

        // Sort by order if available
        const sortedCategories = Object.values(categories || {}).sort((a: any, b: any) =>
            (a.order || 0) - (b.order || 0)
        );

        return NextResponse.json({
            success: true,
            categories: sortedCategories,
            source: 'secure-api'
        });
    } catch (error) {
        console.error('❌ Error in categories API:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}
