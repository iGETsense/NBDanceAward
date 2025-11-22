# Database Repair Guide

## Problem
The database crashed after adding 2 new candidates due to:
- Duplicate candidates (same name in same category)
- Inconsistent data structure (some have `quote` field instead of `title`)
- Inconsistent category naming (case sensitivity issues)
- Missing validation when adding candidates

## Solution

### 1. Run the Database Repair Script

The repair script will:
- ✅ Remove duplicate candidates (keeps the one with most votes, merges votes)
- ✅ Normalize data structure (removes `quote`, ensures `title` exists)
- ✅ Standardize category names
- ✅ Validate all candidate data

**To run the repair:**

```bash
npx ts-node scripts/repairDatabase.ts
```

**What it does:**
1. Finds and removes duplicate candidates
2. Merges votes from duplicates into the kept candidate
3. Normalizes all candidate data (removes `quote`, ensures `title`)
4. Standardizes category names
5. Validates all data

### 2. Adding New Candidates (Safe Method)

**Option A: Using the API Route (Recommended)**

```typescript
// POST /api/candidates
const response = await fetch('/api/candidates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'candidate-id', // Will be auto-normalized (lowercase, hyphens)
    name: 'Candidate Name',
    title: 'Candidate Title', // Optional, defaults to name
    image: '/dancers/image.jpg',
    category: 'Meilleur artiste danseur - masculin',
    votes: 0, // Optional, defaults to 0
    badge: null, // Optional
  })
})
```

**Option B: Using the Database Function**

```typescript
import { addCandidate } from '@/lib/database'

const result = await addCandidate('candidate-id', {
  name: 'Candidate Name',
  title: 'Candidate Title',
  image: '/dancers/image.jpg',
  category: 'Meilleur artiste danseur - masculin',
  votes: 0,
  badge: null,
  percentage: 0,
})

if (!result.success) {
  console.error('Error:', result.error)
}
```

### 3. Validation Features

The new `addCandidate` function includes:
- ✅ **ID Validation**: Ensures ID is valid and doesn't already exist
- ✅ **Duplicate Prevention**: Checks for same name + category combination
- ✅ **Data Normalization**: Automatically normalizes and sanitizes data
- ✅ **Required Fields**: Validates all required fields are present
- ✅ **Type Checking**: Ensures votes and percentage are numbers

### 4. Standard Category Names

Use these exact category names when adding candidates:

- `Meilleur artiste danseur - masculin`
- `Meilleure artiste danseuse féminine`
- `Meilleur Groupe de danse`
- `Meilleur collaboration duo`
- `Meilleurs artiste chorégraphes`
- `Meilleur Performance web`
- `Meilleur artiste danse au rythme folklorique`
- `Meilleur artiste danseur Afro Coupé décalé`
- `Meilleur artiste danseur mbolé`
- `Meilleure artiste danseuse mbolé`
- `Meilleur artiste jeune danseur/danseuse`
- `Meilleur artiste danseur de l'année`

### 5. Data Structure

All candidates must have this structure:

```typescript
{
  id: string,              // Required: unique identifier (lowercase, hyphens)
  name: string,            // Required: candidate name
  title: string,           // Required: display title (defaults to name)
  image: string,           // Required: image path
  category: string,        // Required: category name (use standard names)
  votes: number,           // Required: vote count (defaults to 0)
  percentage: number,      // Required: percentage in category (auto-calculated)
  badge: number | null,    // Optional: badge number (1, 2, 3, etc.)
}
```

### 6. Error Handling

The system will return clear error messages:

- `"Invalid candidate ID"` - ID is missing or invalid
- `"Candidate with ID 'xxx' already exists"` - Duplicate ID
- `"A candidate with the name 'xxx' already exists in category 'yyy'"` - Duplicate name+category
- `"Missing required fields: id, name, image, category"` - Missing data
- `"Candidate name is required and must be a non-empty string"` - Invalid name

### 7. Updating Candidates

Use the `updateCandidate` function:

```typescript
import { updateCandidate } from '@/lib/database'

const result = await updateCandidate('candidate-id', {
  name: 'Updated Name',
  votes: 100,
  // Only include fields you want to update
})
```

Or use the API:

```typescript
// PUT /api/candidates
const response = await fetch('/api/candidates', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'candidate-id',
    name: 'Updated Name',
    votes: 100,
  })
})
```

## Troubleshooting

### Database Still Has Issues?

1. **Check Firebase Console**: Go to Firebase Console → Realtime Database
2. **Verify Structure**: Ensure all candidates have required fields
3. **Run Repair Again**: The repair script is safe to run multiple times
4. **Check Logs**: Look for error messages in the console

### Frontend Not Showing Candidates?

1. **Check Firebase Connection**: Verify environment variables are set
2. **Check Data Format**: Ensure candidates match the expected structure
3. **Clear Cache**: Hard refresh the browser (Ctrl+Shift+R)
4. **Check Console**: Look for Firebase errors in browser console

### Still Getting Duplicate Errors?

1. **Check Exact Match**: The system checks for exact name + category match
2. **Case Sensitivity**: Names are case-insensitive, but must match exactly
3. **Category Names**: Use exact standard category names
4. **Run Repair**: The repair script will merge duplicates

## Next Steps

After running the repair:
1. ✅ Test adding a new candidate using the API
2. ✅ Verify frontend displays all candidates correctly
3. ✅ Check admin page shows all candidates
4. ✅ Test voting functionality
5. ✅ Monitor for any errors

## Support

If you encounter issues:
1. Check the console logs for specific error messages
2. Verify Firebase credentials in `.env.local`
3. Ensure Firebase Realtime Database rules allow read/write
4. Run the repair script again if needed

