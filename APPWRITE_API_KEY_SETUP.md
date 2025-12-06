# Appwrite API Key Setup

## 🔑 Get Your API Key

To sync data from Firebase to Appwrite, you need an API key with database permissions.

### Steps:

1. **Go to Appwrite Console**
   - URL: https://fra.cloud.appwrite.io/console
   - Select your **NBDanceAwards** project

2. **Navigate to API Keys**
   - Click **Settings** in the left sidebar
   - Click **API Keys**

3. **Create New API Key**
   - Click **Create API Key**
   - Name: `Firebase Sync` (or any name)

4. **Select Scopes**
   - Check these permissions:
     - ✅ `databases.read`
     - ✅ `databases.write`
     - ✅ `collections.read`
     - ✅ `collections.write`
     - ✅ `documents.read`
     - ✅ `documents.write`
     - ✅ `attributes.read`
     - ✅ `attributes.write`

5. **Copy the Key**
   - Click **Create**
   - Copy the API key (it will only show once!)

6. **Add to .env.local**
   ```
   APPWRITE_API_KEY=your_api_key_here
   ```

## ⚠️ Security Note

- **Never commit** `.env.local` to git (it's in `.gitignore`)
- **Keep your API key secret** - treat it like a password
- **Use server-side only** - don't expose in client code

## 🚀 Run the Sync

Once you have the API key:

```bash
# Add API key to .env.local
echo "APPWRITE_API_KEY=your_key_here" >> .env.local

# Run the sync script
node scripts/sync-firebase-to-appwrite.js
```

## ✅ What Gets Synced

The script will:
1. Create collections if they don't exist
2. Sync all categories
3. Sync all candidates
4. Link candidates to categories

## 🔍 Verify

After syncing, check your Appwrite console:
- Go to **Databases** → **6933b35900367c7979ad**
- You should see:
  - `categories` collection with 13 categories
  - `candidates` collection with all dancers
  - `candidateCategories` collection with links

## 🐛 Troubleshooting

### "API Key not found"
- Make sure you added it to `.env.local`
- Restart your terminal/IDE

### "Permission denied"
- Check that all required scopes are selected
- Create a new API key with all permissions

### "Collection not found"
- Run the script again - it will create missing collections
- Wait a few seconds between runs

### "Document already exists"
- The script skips existing documents
- This is normal - it prevents duplicates

## 📚 Next Steps

1. Run the sync script
2. Verify data in Appwrite console
3. Test the app: `npm run dev`
4. Check browser console for Appwrite logs
