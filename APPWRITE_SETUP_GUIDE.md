# Appwrite Setup Guide - NBDanceAwards

## ✅ Your Project Details
```
Project ID: 6933b0e9002166bbde7e
Project Name: NBDanceAwards
Endpoint: https://fra.cloud.appwrite.io/v1 (Frankfurt Region)
```

---

## 📋 Next Steps to Complete Setup

### 1. Create Database
1. Go to [Appwrite Console](https://fra.cloud.appwrite.io/console)
2. Select your **NBDanceAwards** project
3. Click **Databases** in the left sidebar
4. Click **Create Database**
5. Name it: `candidates_db`
6. Copy the Database ID and update `.env.local`:
   ```
   NEXT_PUBLIC_APPWRITE_DB_ID=your_copied_database_id
   ```

### 2. Create Collections

Create these 5 collections in your `candidates_db` database:

#### **Collection 1: candidates**
- **Collection ID**: `candidates`
- **Attributes**:
  - `name` (String, Required)
  - `description` (String)
  - `image` (String) - URL to candidate image
  - `votes` (Integer, Default: 0)
  - `category` (String) - Reference to category
  - `order` (Integer, Default: 0)
  - `createdAt` (DateTime)

#### **Collection 2: categories**
- **Collection ID**: `categories`
- **Attributes**:
  - `name` (String, Required)
  - `description` (String)
  - `order` (Integer, Default: 0)
  - `createdAt` (DateTime)

#### **Collection 3: candidateCategories**
- **Collection ID**: `candidateCategories`
- **Attributes**:
  - `candidateId` (String, Required)
  - `categoryId` (String, Required)
  - `createdAt` (DateTime)

#### **Collection 4: votes**
- **Collection ID**: `votes`
- **Attributes**:
  - `userId` (String, Required)
  - `candidateId` (String, Required)
  - `voteCount` (Integer, Required)
  - `paymentMethod` (String)
  - `provider` (String)
  - `transactionId` (String)
  - `status` (String, Default: "completed")
  - `createdAt` (DateTime)

#### **Collection 5: users**
- **Collection ID**: `users`
- **Attributes**:
  - `email` (String)
  - `phone` (String)
  - `totalVotes` (Integer, Default: 0)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)

### 3. Set Permissions

For each collection, set these permissions:

**For Public Read Access** (Candidates, Categories):
1. Open collection → Click **Permissions**
2. Click **Add Permission**
3. Select **Role**: `Any`
4. Select **Permission**: `read`
5. Click **Add**

**For Write Access** (Votes, Users):
1. Open collection → Click **Permissions**
2. Click **Add Permission**
3. Select **Role**: `Any`
4. Select **Permission**: `create`, `update`
5. Click **Add**

### 4. Update .env.local

Once you have all collection IDs, update your `.env.local`:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_PROJECT_ID=6933b0e9002166bbde7e
NEXT_PUBLIC_APPWRITE_PROJECT_NAME=NBDanceAwards
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1

# Database and Collections
NEXT_PUBLIC_APPWRITE_DB_ID=your_database_id_here
NEXT_PUBLIC_APPWRITE_CANDIDATES_COLLECTION=candidates
NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION=categories
NEXT_PUBLIC_APPWRITE_CANDIDATE_CATEGORIES_COLLECTION=candidateCategories
NEXT_PUBLIC_APPWRITE_VOTES_COLLECTION=votes
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION=users

# Performance Configuration
NEXT_PUBLIC_FAILOVER_TIMEOUT_MS=1500
NEXT_PUBLIC_ENABLE_FAILOVER=true
```

---

## 🔑 API Keys (Optional - for Server-Side Operations)

If you need server-side Appwrite access:

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Select scopes: `databases.read`, `databases.write`, `collections.read`, `documents.read`, `documents.write`
4. Copy the key and add to `.env.local`:
   ```
   APPWRITE_API_KEY=your_api_key_here
   ```

---

## 🧪 Testing Your Setup

### 1. Test Connection
```bash
npm run dev
```

Open browser console and check for:
- ✅ `🔥 [getCategories] Fetched from firebase in XXXms` (Firebase working)
- ✅ `📦 [getCategories] Fetched from appwrite in XXXms` (Appwrite working)

### 2. Test Failover
1. Disconnect Firebase (go offline in DevTools)
2. Refresh page
3. Should see: `📦 [getCategories] Fetched from appwrite in XXXms`

### 3. Test Cache
1. Load page
2. Refresh page
3. Should see: `💾 [getCategories] Returned from cache`

---

## 📊 Data Migration (Optional)

If you have existing Firebase data, migrate it to Appwrite:

1. Export Firebase data as JSON
2. Use Appwrite API to import documents
3. Or manually create documents in Appwrite console

---

## 🆘 Troubleshooting

### "Appwrite is not configured"
- Check `.env.local` has all required variables
- Verify `NEXT_PUBLIC_APPWRITE_DB_ID` is set
- Restart dev server: `npm run dev`

### Collections not appearing
- Verify database ID is correct
- Check collection IDs match exactly
- Ensure permissions are set to `Any` for read

### Slow Appwrite responses
- Check network latency to Frankfurt region
- Consider using a closer region if available
- Verify database indexes are created

### Failover not working
- Check `NEXT_PUBLIC_ENABLE_FAILOVER=true`
- Verify `NEXT_PUBLIC_FAILOVER_TIMEOUT_MS=1500`
- Check browser console for error messages

---

## 📚 Useful Links

- [Appwrite Console](https://fra.cloud.appwrite.io/console)
- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Database Guide](https://appwrite.io/docs/databases)
- [Appwrite Permissions](https://appwrite.io/docs/permissions)

---

## ✨ Region Information

Your project is in **Frankfurt (fra)** region:
- **Endpoint**: `https://fra.cloud.appwrite.io/v1`
- **Latency**: Good for Europe-based users
- **Data Center**: Frankfurt, Germany

---

**Status**: 🟡 In Progress
**Last Updated**: December 6, 2025

Once you complete all steps, change status to: 🟢 Complete
