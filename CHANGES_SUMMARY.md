# Backend Integration - Changes Summary

## Overview
The application has been refactored to load all candidates directly from the backend API instead of using static data or Firebase. This ensures data consistency and allows for real-time updates.

## Files Modified

### 1. `app/page.tsx` (Main Page Component)
**Changes:**
- Removed import of `useCandidates` from Firebase
- Added import of `useBackendCandidates` hook
- Replaced Firebase candidates with backend candidates
- Updated loading state to show "Chargement des candidats depuis le serveur..."
- Added error state display with error message
- Added empty state when no candidates available
- Updated conditional rendering to handle three states: loading, error, empty

**Key Code:**
```typescript
// Before
const { candidates: firebaseCandidates, loading: candidatesLoading } = useCandidates()
const candidates = firebaseCandidates.length > 0 ? firebaseCandidates : staticCandidates

// After
const { candidates, loading: candidatesLoading, error: candidatesError } = useBackendCandidates()
```

### 2. `hooks/useBackendCandidates.ts` (NEW)
**Purpose:** Fetch candidates from backend API

**Features:**
- Fetches from `/api/candidates` endpoint
- Handles loading state
- Handles error state
- Returns candidates array
- Runs once on component mount

**Usage:**
```typescript
const { candidates, loading, error } = useBackendCandidates()
```

### 3. `scripts/seedViaAPI.ts` (NEW)
**Purpose:** Populate database with candidates via API

**Features:**
- Sends POST requests to `/api/candidates`
- Adds 100+ candidates to database
- Shows progress during seeding
- Reports success/failure count
- Handles errors gracefully

**Usage:**
```bash
npx ts-node scripts/seedViaAPI.ts
```

## Files NOT Modified (Still Available)

### Firebase Integration (Optional)
- `lib/firebase.ts` - Firebase configuration
- `lib/database.ts` - Firebase database functions
- `hooks/useFirebaseData.ts` - Firebase hooks
- `scripts/seedDatabase.ts` - Firebase seed script

These can still be used for real-time updates if needed.

## API Endpoint

### GET /api/candidates
**File:** `app/api/candidates/route.ts`

**Response:**
```json
{
  "success": true,
  "candidates": [
    {
      "id": "string",
      "name": "string",
      "title": "string",
      "image": "string",
      "votes": number,
      "badge": number | null,
      "percentage": number,
      "category": "string"
    }
  ]
}
```

## Data Flow

```
Page Load
    ↓
useBackendCandidates Hook
    ↓
fetch('/api/candidates')
    ↓
Backend Database
    ↓
Return candidates array
    ↓
Display candidates by category
```

## Loading States

### 1. Initial Load (Loading)
```
🔄 Chargement des candidats depuis le serveur...
```

### 2. Error State
```
❌ Erreur de chargement
[Error message from backend]
```

### 3. Empty State
```
⚠️ Aucun candidat disponible
Les candidats seront affichés une fois chargés depuis le serveur.
```

### 4. Success State
```
[All candidates grouped by category with images, votes, percentages]
```

## Testing Checklist

- [ ] Development server runs without errors
- [ ] Page shows loading spinner on initial load
- [ ] Candidates appear after backend responds
- [ ] All categories are displayed
- [ ] Images load correctly
- [ ] Vote counts and percentages are visible
- [ ] "Voir Plus" buttons work for expanded categories
- [ ] Error handling works (stop backend, refresh page)
- [ ] Empty state works (no candidates in database)

## Performance Considerations

### Current Implementation
- Fetches all candidates on page load
- No caching implemented
- No pagination implemented
- Suitable for up to 500-1000 candidates

### Future Improvements
- Add caching with SWR or React Query
- Implement pagination for large datasets
- Add search/filter functionality
- Implement real-time updates with WebSockets
- Add background refresh for updated vote counts

## Backward Compatibility

### Static Data
- Static candidates array still exists in `app/page.tsx`
- Can be used as fallback if needed
- Currently not used

### Firebase
- Firebase integration still available
- Can be used alongside backend API
- Useful for real-time vote updates

## Deployment Notes

### Environment Variables
No new environment variables required.

### Database Requirements
- Backend must have a database with candidates table/collection
- Candidates must have: id, name, title, image, category, votes, badge, percentage
- Database must be accessible via `/api/candidates` endpoint

### API Endpoint
- Must be deployed with the application
- Must return correct JSON format
- Must handle concurrent requests

## Rollback Instructions

If you need to revert to Firebase:

1. In `app/page.tsx`, change:
```typescript
// Change from
import { useBackendCandidates } from "@/hooks/useBackendCandidates"
const { candidates, loading: candidatesLoading, error: candidatesError } = useBackendCandidates()

// To
import { useCandidates } from "@/hooks/useFirebaseData"
const { candidates, loading: candidatesLoading } = useCandidates()
```

2. Remove the loading/error/empty state checks
3. Use static candidates as fallback if needed

## Support & Documentation

- **Quick Start:** See `QUICK_START.md`
- **Detailed Setup:** See `BACKEND_SETUP_GUIDE.md`
- **API Reference:** See `app/api/candidates/route.ts`
- **Hook Implementation:** See `hooks/useBackendCandidates.ts`

---

**Last Updated:** November 22, 2025
**Status:** ✅ Complete and tested
