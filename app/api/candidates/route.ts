import { NextRequest, NextResponse } from 'next/server'
import { addCandidate, updateCandidate } from '@/lib/database'
import { sanitizeInput } from '@/lib/security'
import {
  getSecureCandidates,
  getSecureCategories,
  getSecureCandidateCategories
} from '@/lib/secureDatabase'
import { getCandidateImage } from '@/lib/candidateImages'
import { calculatePercentages } from '@/lib/percentageCalculator'

/**
 * GET /api/candidates
 * Get all candidates with secure Firebase access (Cloudflare fallback)
 */
export async function GET() {
  try {
    // Fetch all data using secure server-side service
    const [candidates, categories, links] = await Promise.all([
      getSecureCandidates(),
      getSecureCategories(),
      getSecureCandidateCategories(),
    ]);

    // If all backends failed, use static data
    if (!candidates || Object.keys(candidates).length === 0) {
      console.log('⚠️ All backends failed, using static candidate data');
      const { allCandidatesData } = await import('@/lib/candidatesData');

      const staticCandidates = allCandidatesData.reduce((acc: any, candidate: any, index: number) => {
        const id = candidate.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '') + `-${index}`;
        acc[id] = {
          ...candidate,
          id,
          baseId: id,
          votes: 0,
          percentage: 0
        };
        return acc;
      }, {});

      return NextResponse.json({ success: true, candidates: Object.values(staticCandidates) });
    }

    // Create category lookup map
    const candidateCategoryMap = new Map<string, string>();
    const linksArray = Array.isArray(links) ? links : Object.values(links || {});
    linksArray.forEach((link: any) => {
      if (link) candidateCategoryMap.set(link.candidateId, link.categoryId);
    });

    // Enrich candidates with category info and images
    const candidatesArray = Object.values(candidates);
    const enrichedCandidates = candidatesArray.map((candidate: any) => {
      const categoryId = candidateCategoryMap.get(candidate.id);
      const category = categoryId && categories?.[categoryId]
        ? categories[categoryId]
        : null;

      return {
        ...candidate,
        categoryId: categoryId || 'unknown',
        category: category ? category.name : 'Unknown Category',
        image: getCandidateImage(candidate.id, candidate.baseId),
      };
    });

    // Calculate vote percentages
    const withPercentages = calculatePercentages(enrichedCandidates);

    return NextResponse.json({
      success: true,
      candidates: withPercentages,
      source: 'secure-api'
    });
  } catch (error) {
    console.error('❌ Error in candidates API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/candidates
 * Add a new candidate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract and sanitize data
    const {
      id,
      name,
      title,
      image,
      category,
      votes = 0,
      badge = null,
    } = body

    // Validate required fields
    if (!id || !name || !image || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: id, name, image, category' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const candidateData = {
      id: sanitizeInput(id).trim().toLowerCase().replace(/\s+/g, '-'),
      name: sanitizeInput(name).trim(),
      title: title ? sanitizeInput(title).trim() : sanitizeInput(name).trim(),
      image: sanitizeInput(image).trim(),
      category: sanitizeInput(category).trim(),
      votes: typeof votes === 'number' ? votes : 0,
      badge: badge || null,
      percentage: 0,
    }

    // Add candidate
    const result = await addCandidate(candidateData.id, candidateData)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      candidateId: result.candidateId,
      message: 'Candidate added successfully',
    })
  } catch (error) {
    console.error('Error adding candidate:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to add candidate' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/candidates
 * Update an existing candidate
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      id,
      name,
      title,
      image,
      category,
      votes,
      badge,
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Candidate ID is required' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const candidateData: any = {}
    if (name) candidateData.name = sanitizeInput(name).trim()
    if (title) candidateData.title = sanitizeInput(title).trim()
    if (image) candidateData.image = sanitizeInput(image).trim()
    if (category) candidateData.category = sanitizeInput(category).trim()
    if (votes !== undefined) candidateData.votes = typeof votes === 'number' ? votes : 0
    if (badge !== undefined) candidateData.badge = badge || null

    // Update candidate
    const result = await updateCandidate(id, candidateData)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      candidateId: result.candidateId,
      message: 'Candidate updated successfully',
    })
  } catch (error) {
    console.error('Error updating candidate:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update candidate' },
      { status: 500 }
    )
  }
}

