
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get, query, orderByKey, limitToLast, update } from 'firebase/database';

export async function GET(request: NextRequest) {
    try {
        console.log(`[API] Fetching issues.`);

        let issues: any[] = [];
        try {
            const issuesRef = ref(database, 'issues');
            // Fetch last 100 issues
            const recentIssuesQuery = query(issuesRef, orderByKey(), limitToLast(100));

            const snapshot = await get(recentIssuesQuery);

            if (snapshot.exists()) {
                const data = snapshot.val();
                issues = Object.entries(data).map(([id, issue]: [string, any]) => ({
                    id,
                    ...issue,
                })).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
            }
        } catch (dbError: any) {
            console.error('[API] Firebase SDK fetch failed for issues:', dbError);
            throw new Error(`Firebase SDK fetch failed: ${dbError.message}`);
        }

        return NextResponse.json({
            success: true,
            issues
        });

    } catch (error: any) {
        console.error('Error fetching issues:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json(
                { success: false, error: 'Missing id or status' },
                { status: 400 }
            );
        }

        console.log(`[API] Updating issue ${id} to status ${status}`);

        const issueRef = ref(database, `issues/${id}`);
        await update(issueRef, {
            status,
            updatedAt: Date.now() // or serverTimestamp if imported, but Date.now() is fine here
        });

        return NextResponse.json({
            success: true,
            message: 'Status updated successfully'
        });

    } catch (error: any) {
        console.error('Error updating issue:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
