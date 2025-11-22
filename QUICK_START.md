# Quick Start Guide - Backend Candidate Loading

## What Changed?

The application now loads **all candidates directly from the backend** when the page loads. No static data is used.

### Key Changes:
- ✅ New hook: `useBackendCandidates` fetches from `/api/candidates`
- ✅ Page shows loading spinner while fetching
- ✅ Page shows error if backend fails
- ✅ No candidates displayed until backend responds
- ✅ All data comes from backend database

## Getting Started (5 Minutes)

### Step 1: Start the Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

You'll see a loading spinner in the "Toutes les Catégories" section.

### Step 2: Seed the Database

Choose ONE of these methods:

#### Method A: Using the API Seed Script (Recommended)
```bash
npx ts-node scripts/seedViaAPI.ts
```

This will:
- Connect to your running backend
- Add all 100+ candidates via API
- Show progress and summary

#### Method B: Using Firebase Seed Script
```bash
npx ts-node scripts/seedDatabase.ts
```

Requires Firebase credentials in `.env.local`

#### Method C: Manual API Calls
```bash
curl -X POST http://localhost:3000/api/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "id": "candidate-1",
    "name": "Candidate Name",
    "title": "Candidate Title",
    "image": "/dancers/image.jpg",
    "category": "Meilleur artiste danseur - masculin",
    "votes": 0,
    "badge": null
  }'
```

### Step 3: Refresh the Page

After seeding, refresh `http://localhost:3000`

You should now see:
- ✅ All candidates grouped by category
- ✅ Vote counts and percentages
- ✅ Candidate images and badges
- ✅ "Voir Plus" buttons for expanded categories

## Verification Checklist

- [ ] Development server is running (`npm run dev`)
- [ ] Backend API endpoint `/api/candidates` is working
- [ ] Database has candidate data
- [ ] Page shows loading spinner initially
- [ ] Candidates appear after backend responds
- [ ] All categories are displayed
- [ ] Images load correctly
- [ ] Vote counts are visible

## Troubleshooting

### Problem: Loading spinner never disappears
**Solution:**
1. Check browser console for errors
2. Open Network tab and look for `/api/candidates` request
3. Verify the request returns `{ success: true, candidates: [...] }`
4. Check backend logs for errors

### Problem: Error message appears
**Solution:**
1. Read the error message carefully
2. Verify backend is running
3. Check database connection
4. Ensure candidates exist in database

### Problem: No candidates in database
**Solution:**
1. Run the seed script: `npx ts-node scripts/seedViaAPI.ts`
2. Or manually add candidates via API
3. Verify data was added to database

## File Structure

```
app/
├── page.tsx                    # Main page (updated)
├── api/
│   └── candidates/
│       └── route.ts            # GET /api/candidates endpoint
hooks/
├── useBackendCandidates.ts     # NEW: Backend fetch hook
└── useFirebaseData.ts          # Firebase hooks (still available)
scripts/
├── seedDatabase.ts             # Firebase seed script
└── seedViaAPI.ts              # NEW: API seed script
```

## API Endpoint

### GET /api/candidates
Returns all candidates from the database.

**Response:**
```json
{
  "success": true,
  "candidates": [
    {
      "id": "candidate-id",
      "name": "Candidate Name",
      "title": "Candidate Title",
      "image": "/dancers/image.jpg",
      "votes": 1234,
      "badge": 1,
      "percentage": 45,
      "category": "Category Name"
    }
  ]
}
```

### POST /api/candidates
Add a new candidate.

**Request:**
```json
{
  "id": "unique-id",
  "name": "Candidate Name",
  "title": "Candidate Title",
  "image": "/dancers/image.jpg",
  "category": "Category Name",
  "votes": 0,
  "badge": null
}
```

**Response:**
```json
{
  "success": true,
  "candidateId": "unique-id",
  "message": "Candidate added successfully"
}
```

## Next Steps

1. ✅ Seed the database with candidates
2. ✅ Verify candidates appear on page load
3. ✅ Test voting functionality
4. ✅ Check real-time updates
5. ✅ Deploy to production

## Need Help?

- Check `BACKEND_SETUP_GUIDE.md` for detailed setup
- Review `app/api/candidates/route.ts` for API implementation
- Check `hooks/useBackendCandidates.ts` for fetch logic
- Check browser console for error messages
- Check server logs for backend errors

## Performance Notes

- Candidates are fetched once on page load
- No caching is implemented (fetches fresh data each time)
- Consider adding caching for production
- Consider adding pagination for large datasets

---

**Last Updated:** November 22, 2025
**Status:** ✅ Ready for testing
