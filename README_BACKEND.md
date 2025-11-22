# Backend Candidate Loading - Complete Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [What Changed](#what-changed)
3. [Quick Start](#quick-start)
4. [Architecture](#architecture)
5. [API Reference](#api-reference)
6. [Database Setup](#database-setup)
7. [Scripts & Tools](#scripts--tools)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## Overview

The NB Dance Award application has been refactored to load all candidates **directly from the backend** on page load. This ensures:

✅ **Data Consistency** - Single source of truth  
✅ **Real-time Updates** - Backend data is always current  
✅ **Scalability** - Can handle large datasets  
✅ **Flexibility** - Easy to add/remove candidates  
✅ **Security** - Sensitive data stays on backend  

### Key Features

- 🔄 Automatic loading on page mount
- ⏳ Loading state with spinner
- ❌ Error handling with user-friendly messages
- 📱 Responsive design
- 🎯 Category-based organization
- 🗳️ Vote tracking and percentages

---

## What Changed

### Files Modified

| File | Change | Impact |
|------|--------|--------|
| `app/page.tsx` | Uses backend hook instead of Firebase | Candidates loaded from API |
| `hooks/useBackendCandidates.ts` | NEW - Fetches from `/api/candidates` | Replaces Firebase hook |
| `scripts/seedViaAPI.ts` | NEW - Seeds via API | Populates database |
| `scripts/initializeDatabase.ts` | NEW - Database management | Initialize/check database |

### Files NOT Changed

- Firebase integration still available
- Static candidates array still exists (not used)
- All other components unchanged

---

## Quick Start

### 1. Start Development Server
```bash
npm run dev
```

### 2. Seed Database
```bash
npx ts-node scripts/initializeDatabase.ts --seed
```

### 3. Check Database
```bash
npx ts-node scripts/initializeDatabase.ts --check
```

### 4. Visit Application
Open `http://localhost:3000`

**Expected Result:**
- Loading spinner appears
- Candidates load from backend
- All categories display with images and votes

---

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────┐
│                  Browser (Client)                   │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │         NBDanceAwardPage Component           │  │
│  │                                              │  │
│  │  ┌────────────────────────────────────────┐ │  │
│  │  │   useBackendCandidates Hook            │ │  │
│  │  │                                        │ │  │
│  │  │  1. Fetch on mount                    │ │  │
│  │  │  2. Set loading state                 │ │  │
│  │  │  3. Handle errors                     │ │  │
│  │  │  4. Return candidates                 │ │  │
│  │  └────────────────────────────────────────┘ │  │
│  │                    ↓                         │  │
│  │  ┌────────────────────────────────────────┐ │  │
│  │  │   Render Candidates by Category        │ │  │
│  │  │   - Loading state                      │ │  │
│  │  │   - Error state                        │ │  │
│  │  │   - Empty state                        │ │  │
│  │  │   - Success state                      │ │  │
│  │  └────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        ↓
              fetch('/api/candidates')
                        ↓
┌─────────────────────────────────────────────────────┐
│                  Backend (Server)                   │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │    GET /api/candidates Route Handler         │  │
│  │                                              │  │
│  │  1. Receive request                         │  │
│  │  2. Query database                          │  │
│  │  3. Format response                         │  │
│  │  4. Return JSON                             │  │
│  └──────────────────────────────────────────────┘  │
│                    ↓                                │
│  ┌──────────────────────────────────────────────┐  │
│  │         Database (Firebase/SQL/etc)          │  │
│  │                                              │  │
│  │  - Candidates table/collection              │  │
│  │  - Vote counts                              │  │
│  │  - Categories                               │  │
│  │  - Images and metadata                      │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Component States

```
Page Load
    ↓
┌─────────────────────┐
│  Loading State      │
│  ⏳ Spinner visible │
│  Fetching data...   │
└─────────────────────┘
    ↓
    ├─→ Success ─→ ┌──────────────────┐
    │              │ Display State    │
    │              │ All candidates   │
    │              │ Grouped by cat.  │
    │              └──────────────────┘
    │
    ├─→ Error ──→ ┌──────────────────┐
    │             │ Error State      │
    │             │ Error message    │
    │             │ Retry option     │
    │             └──────────────────┘
    │
    └─→ Empty ──→ ┌──────────────────┐
                  │ Empty State      │
                  │ No candidates    │
                  │ Helpful message  │
                  └──────────────────┘
```

---

## API Reference

### GET /api/candidates

Fetch all candidates from the database.

**Endpoint:** `GET /api/candidates`

**Request:**
```bash
curl http://localhost:3000/api/candidates
```

**Response (Success):**
```json
{
  "success": true,
  "candidates": [
    {
      "id": "etienne-kampos",
      "name": "Étienne kampos",
      "title": "Male Dance King",
      "image": "/dancers/Etienne kampos.jpg",
      "votes": 1847,
      "badge": 1,
      "percentage": 45,
      "category": "Meilleur artiste danseur - masculin"
    }
  ]
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Failed to fetch candidates"
}
```

### POST /api/candidates

Add a new candidate to the database.

**Endpoint:** `POST /api/candidates`

**Request:**
```bash
curl -X POST http://localhost:3000/api/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "id": "new-candidate",
    "name": "New Candidate",
    "title": "Candidate Title",
    "image": "/dancers/image.jpg",
    "category": "Meilleur artiste danseur - masculin",
    "votes": 0,
    "badge": null
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "candidateId": "new-candidate",
  "message": "Candidate added successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Missing required fields: id, name, image, category"
}
```

---

## Database Setup

### Required Fields

Each candidate must have:

```typescript
{
  id: string;              // Unique identifier (required)
  name: string;            // Candidate name (required)
  title: string;           // Candidate title (required)
  image: string;           // Image path (required)
  category: string;        // Category name (required)
  votes: number;           // Vote count (default: 0)
  badge?: number | null;   // Badge 1-3 or null (optional)
  percentage?: number;     // Calculated percentage (optional)
}
```

### Supported Categories

```
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
```

### Database Examples

#### Firebase Realtime Database
```json
{
  "candidates": {
    "etienne-kampos": {
      "id": "etienne-kampos",
      "name": "Étienne kampos",
      "title": "Male Dance King",
      "image": "/dancers/Etienne kampos.jpg",
      "votes": 1847,
      "badge": 1,
      "percentage": 45,
      "category": "Meilleur artiste danseur - masculin"
    }
  }
}
```

#### SQL Database
```sql
CREATE TABLE candidates (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  image VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  votes INT DEFAULT 0,
  badge INT,
  percentage DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### MongoDB
```javascript
db.candidates.insertOne({
  _id: "etienne-kampos",
  name: "Étienne kampos",
  title: "Male Dance King",
  image: "/dancers/Etienne kampos.jpg",
  votes: 1847,
  badge: 1,
  percentage: 45,
  category: "Meilleur artiste danseur - masculin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## Scripts & Tools

### Initialize Database

```bash
# Seed with example candidates
npx ts-node scripts/initializeDatabase.ts --seed

# Check database status
npx ts-node scripts/initializeDatabase.ts --check

# Show help
npx ts-node scripts/initializeDatabase.ts --help
```

### Seed via API

```bash
# Seed with all candidates from EXAMPLE_CANDIDATES.json
npx ts-node scripts/seedViaAPI.ts
```

### Firebase Seed (Optional)

```bash
# Seed Firebase Realtime Database
npx ts-node scripts/seedDatabase.ts
```

---

## Troubleshooting

### Problem: Loading spinner never disappears

**Cause:** Backend not responding

**Solution:**
1. Verify backend is running: `npm run dev`
2. Check if `/api/candidates` endpoint exists
3. Open DevTools Network tab
4. Look for `/api/candidates` request
5. Check response status and body
6. Check server logs for errors

### Problem: Error message appears

**Cause:** Backend error or network issue

**Solution:**
1. Read error message carefully
2. Check backend logs
3. Verify database connection
4. Verify API endpoint is correct
5. Check firewall/CORS settings

### Problem: No candidates appear

**Cause:** Database is empty

**Solution:**
1. Run seed script: `npx ts-node scripts/initializeDatabase.ts --seed`
2. Verify candidates were added: `npx ts-node scripts/initializeDatabase.ts --check`
3. Refresh page

### Problem: Images don't load

**Cause:** Image paths are incorrect

**Solution:**
1. Check image paths in database
2. Verify images exist in `/public/dancers/`
3. Check browser console for 404 errors
4. Verify image filenames match exactly

### Problem: Vote counts are wrong

**Cause:** Data not synced with backend

**Solution:**
1. Refresh page
2. Check database values
3. Verify calculations are correct
4. Check for data corruption

---

## FAQ

### Q: Can I still use Firebase?
**A:** Yes! Firebase integration is still available. You can use both backend API and Firebase for real-time updates.

### Q: How do I add new candidates?
**A:** Use the API endpoint:
```bash
curl -X POST http://localhost:3000/api/candidates \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

### Q: Can I modify candidates?
**A:** Yes, implement a PUT endpoint in `app/api/candidates/route.ts`

### Q: How do I delete candidates?
**A:** Implement a DELETE endpoint in `app/api/candidates/route.ts`

### Q: Is there pagination?
**A:** Not yet. All candidates are loaded at once. Consider adding pagination for large datasets.

### Q: Can I cache the data?
**A:** Yes, use SWR or React Query for automatic caching and revalidation.

### Q: How do I handle real-time updates?
**A:** Implement WebSockets or use Firebase for real-time sync.

### Q: What about offline support?
**A:** Implement service workers and IndexedDB for offline support.

### Q: Can I filter/search candidates?
**A:** Yes, add filtering logic in the component or backend.

### Q: How do I handle large images?
**A:** Use image optimization, lazy loading, and CDN delivery.

---

## Performance Optimization Tips

1. **Add Caching**
   ```typescript
   import useSWR from 'swr'
   const { data } = useSWR('/api/candidates', fetcher)
   ```

2. **Implement Pagination**
   ```typescript
   // Load 20 candidates at a time
   const [page, setPage] = useState(1)
   const { candidates } = useCandidates(page)
   ```

3. **Optimize Images**
   - Use WebP format
   - Implement lazy loading
   - Use CDN for delivery

4. **Add Database Indexes**
   - Index on `category`
   - Index on `votes`
   - Index on `id`

5. **Implement Compression**
   - Gzip responses
   - Minify JSON
   - Compress images

---

## Security Considerations

1. **Validate Input**
   - Sanitize candidate data
   - Validate image paths
   - Check for SQL injection

2. **Authenticate Requests**
   - Add API authentication
   - Implement role-based access
   - Use API keys

3. **Rate Limiting**
   - Limit requests per IP
   - Implement backoff strategy
   - Monitor for abuse

4. **Data Protection**
   - Encrypt sensitive data
   - Use HTTPS
   - Implement CORS properly

---

## Deployment Checklist

- [ ] Backend API is deployed
- [ ] Database is configured
- [ ] Environment variables are set
- [ ] CORS is configured
- [ ] SSL/HTTPS is enabled
- [ ] Database backups are configured
- [ ] Monitoring is set up
- [ ] Error logging is configured
- [ ] Performance is optimized
- [ ] Security is reviewed

---

## Support & Resources

- **Quick Start:** `QUICK_START.md`
- **Setup Guide:** `BACKEND_SETUP_GUIDE.md`
- **Testing Guide:** `TESTING_GUIDE.md`
- **Changes Summary:** `CHANGES_SUMMARY.md`
- **Example Data:** `EXAMPLE_CANDIDATES.json`

---

**Last Updated:** November 22, 2025  
**Status:** ✅ Production Ready  
**Version:** 1.0.0
