# Backend Candidate Loading Setup Guide

## Overview
The application has been updated to load all candidates directly from the backend API on page load. No candidates will be displayed until the backend successfully returns data.

## Changes Made

### 1. New Hook: `useBackendCandidates`
**File:** `hooks/useBackendCandidates.ts`

This hook handles fetching candidates from the backend API endpoint `/api/candidates`:
- Fetches data on component mount
- Provides loading state while fetching
- Provides error state if fetch fails
- Returns empty array if no candidates available

### 2. Updated Page Component
**File:** `app/page.tsx`

The main page now:
- Uses `useBackendCandidates` hook instead of Firebase
- Shows loading spinner while fetching candidates
- Shows error message if backend fails
- Shows "no candidates" message if backend returns empty array
- Only displays candidates once backend data is loaded

### 3. Backend API Endpoint
**File:** `app/api/candidates/route.ts`

The GET endpoint:
- Fetches all candidates from database
- Returns JSON with format: `{ success: true, candidates: [...] }`
- Returns error if fetch fails

## How to Populate the Database

### Option 1: Using the Seed Script (Firebase)
If you're using Firebase Realtime Database:

```bash
npx ts-node scripts/seedDatabase.ts
```

This will populate Firebase with all candidate data.

### Option 2: Using the API Directly
You can POST candidates to the backend API:

```bash
curl -X POST http://localhost:3000/api/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "id": "candidate-id",
    "name": "Candidate Name",
    "title": "Candidate Title",
    "image": "/path/to/image.jpg",
    "category": "Category Name",
    "votes": 0,
    "badge": null
  }'
```

### Option 3: Manual Database Entry
Add candidates directly to your database (Firebase or other backend):

```json
{
  "id": "candidate-id",
  "name": "Candidate Name",
  "title": "Candidate Title",
  "image": "/path/to/image.jpg",
  "votes": 0,
  "badge": 1,
  "percentage": 0,
  "category": "Category Name"
}
```

## Testing the Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Visit the homepage:**
   - You should see a loading spinner in the "Toutes les Catégories" section
   - Once the backend responds, candidates will appear

3. **Check the Network tab:**
   - Look for the `/api/candidates` request
   - Verify it returns `{ success: true, candidates: [...] }`

4. **Test error handling:**
   - Stop the backend server
   - Refresh the page
   - You should see an error message

## Data Structure

Each candidate must have:
```typescript
{
  id: string;              // Unique identifier
  name: string;            // Candidate name
  title: string;           // Candidate title/description
  image: string;           // Path to image (e.g., "/dancers/name.jpg")
  category: string;        // Category name
  votes: number;           // Number of votes (default: 0)
  badge?: number | null;   // Badge number (1, 2, 3) or null
  percentage?: number;     // Vote percentage (calculated automatically)
}
```

## Categories Available

The application supports these categories:
- Meilleur artiste danseur - masculin
- Meilleure artiste danseuse féminine
- Meilleur groupe de danse
- Meilleur collaboration duo
- Meilleur artiste Chorégraphe
- Meilleur Performance web
- Meilleur artiste danseur au rythme folklorique
- Meilleur artiste danseur afro coupé décalé
- Meilleur artiste danseur mbolé
- Meilleure artiste danseuse mbolé
- Meilleur artiste danseur de l'année
- Meilleur artiste jeune danseur/danseuse
- Meilleure artiste danseuse de l'année

## Troubleshooting

### No candidates appear
1. Check if the backend is running
2. Verify the `/api/candidates` endpoint returns data
3. Check browser console for errors
4. Ensure database has candidates

### Loading spinner never disappears
1. Check network tab for failed requests
2. Verify backend is responding
3. Check server logs for errors

### Error message appears
1. Check the error message for details
2. Verify backend database connection
3. Ensure `/api/candidates` endpoint is working

## Performance Notes

- Candidates are fetched once on page load
- No static fallback data is used
- Page will be empty until backend responds
- Consider adding a timeout if backend is slow

## Next Steps

1. Populate your database with candidate data
2. Test the page load
3. Verify all categories display correctly
4. Test voting functionality with backend data
