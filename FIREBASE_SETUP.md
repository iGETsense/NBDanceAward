# Firebase Realtime Database Integration Guide

## Step 1: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Settings** (gear icon) → **Project Settings**
4. Scroll to **Your apps** section
5. Find your web app and click the config button
6. Copy all the configuration values

## Step 2: Setup Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Firebase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_value
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_value
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_value
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_value
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_value
   NEXT_PUBLIC_FIREBASE_APP_ID=your_value
   ```

## Step 3: Setup Realtime Database Structure

In Firebase Console, go to **Realtime Database** and create this structure:

```json
{
  "candidates": {
    "candidate_1": {
      "id": "candidate_1",
      "name": "Étienne kampos",
      "title": "Male Dance King",
      "image": "/dancers/Etienne kampos.jpg",
      "votes": 1847,
      "category": "Meilleur artiste danseur - masculin",
      "percentage": 45
    }
  },
  "votes": {
    "user_123_timestamp": {
      "userId": "user_123",
      "candidateId": "candidate_1",
      "voteCount": 5,
      "paymentMethod": "mobile",
      "provider": "mtn-momo-cameroon",
      "transactionId": "tx_123",
      "status": "completed",
      "createdAt": "2025-11-18T20:00:00Z"
    }
  },
  "users": {
    "user_123": {
      "uid": "user_123",
      "email": "user@example.com",
      "phone": "+237...",
      "totalVotes": 5,
      "createdAt": "2025-11-18T20:00:00Z"
    }
  }
}
```

## Step 4: Setup Realtime Database Security Rules

In Firebase Console → Realtime Database → Rules, paste this:

```json
{
  "rules": {
    "candidates": {
      ".read": true,
      ".write": false,
      "$candidateId": {
        "votes": {
          ".validate": "newData.isNumber()"
        }
      }
    },
    "votes": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$voteId": {
        ".validate": "newData.hasChildren(['userId', 'candidateId', 'voteCount'])",
        "userId": {
          ".validate": "newData.val() === auth.uid"
        }
      }
    },
    "users": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$uid": {
        ".validate": "$uid === auth.uid",
        "totalVotes": {
          ".validate": "newData.isNumber()"
        }
      }
    }
  }
}
```

## Step 5: Usage Examples

### Get All Candidates
```typescript
import { getCandidates } from '@/lib/database'

const candidates = await getCandidates()
```

### Subscribe to Real-time Candidate Updates
```typescript
import { subscribeToCandidates } from '@/lib/database'
import { useEffect, useState } from 'react'

export function CandidatesList() {
  const [candidates, setCandidates] = useState([])

  useEffect(() => {
    const unsubscribe = subscribeToCandidates((data) => {
      setCandidates(Object.values(data))
    })
    return unsubscribe
  }, [])

  return (
    <div>
      {candidates.map((candidate: any) => (
        <div key={candidate.id}>
          <h3>{candidate.name}</h3>
          <p>Votes: {candidate.votes}</p>
        </div>
      ))}
    </div>
  )
}
```

### Submit a Vote
```typescript
import { submitVote } from '@/lib/database'

const result = await submitVote(
  userId,
  candidateId,
  5, // vote count
  'mobile', // payment method
  'mtn-momo-cameroon', // provider
  'tx_123' // transaction ID
)

if (result.success) {
  console.log('Vote submitted:', result.voteId)
}
```

### Get User Votes
```typescript
import { getUserVotes } from '@/lib/database'

const userVotes = await getUserVotes(userId)
```

### Get Leaderboard
```typescript
import { subscribeToLeaderboard } from '@/lib/database'

useEffect(() => {
  const unsubscribe = subscribeToLeaderboard((leaderboard) => {
    console.log('Top candidates:', leaderboard)
  }, 10) // Top 10
  return unsubscribe
}, [])
```

## Step 6: Integrate into Your Pages

### Update `app/page.tsx`

```typescript
import { getCandidates, subscribeToLeaderboard } from '@/lib/database'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [candidates, setCandidates] = useState([])

  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((data) => {
      setCandidates(data)
    })
    return unsubscribe
  }, [])

  // Rest of your component...
}
```

### Update Vote Submission

```typescript
import { submitVote } from '@/lib/database'

const handleVoteSubmit = async () => {
  const result = await submitVote(
    userId,
    selectedCandidate.id,
    voteCount,
    selectedPaymentMethod,
    selectedProvider,
    transactionId
  )
  
  if (result.success) {
    alert('Vote submitted successfully!')
  }
}
```

## Free Plan Limits

- **Realtime Database**: 100 concurrent connections, 1GB storage
- **Authentication**: Unlimited users
- **Bandwidth**: 10GB/month download, 1GB/month upload

## Troubleshooting

### "Permission denied" error
- Check your security rules in Firebase Console
- Ensure user is authenticated
- Verify database URL is correct

### Data not updating in real-time
- Check if `onValue` subscription is active
- Verify security rules allow read access
- Check browser console for errors

### Environment variables not loading
- Restart your dev server after adding `.env.local`
- Variables must start with `NEXT_PUBLIC_` to be accessible in browser
- Check `.gitignore` includes `.env.local`

## Next Steps

1. Migrate candidate data from static arrays to Firebase
2. Implement user authentication with Firebase Auth
3. Add payment integration with vote submission
4. Setup analytics to track voting patterns
