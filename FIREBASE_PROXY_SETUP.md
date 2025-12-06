# Firebase Proxy Server Setup (Orange Network)

## 🎯 Overview

This Flask proxy server allows your Next.js app to access Firebase even when it's blocked by Orange network restrictions.

**Why?** Orange network blocks direct Firebase connections. This proxy server acts as a middleman.

---

## 📋 Prerequisites

- Python 3.8+
- `serviceAccount.json` file (Firebase credentials)
- Flask and dependencies

---

## 🚀 Setup Steps

### Step 1: Install Python Dependencies

```bash
pip install -r firebase_proxy_requirements.txt
```

### Step 2: Get Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Settings** (gear icon) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. **Copy the credentials** (don't save as file)
7. **Paste into `firebase_proxy_server.py`** (see FIREBASE_CREDENTIALS_SETUP.md)

### Step 3: Update Credentials in Code

Edit `firebase_proxy_server.py` and update the `FIREBASE_CREDENTIALS` dictionary with your actual credentials from Firebase Console.

See **FIREBASE_CREDENTIALS_SETUP.md** for detailed instructions.

### Step 4: Start the Proxy Server

```bash
python firebase_proxy_server.py
```

You should see:
```
╔════════════════════════════════════════════════════════════════╗
║          Firebase Proxy Server for Orange Network             ║
╚════════════════════════════════════════════════════════════════╝

📍 Server running on: http://localhost:5000
✅ Firebase initialized successfully with hardcoded credentials
```

### Step 5: Configure Your App

Add to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_PROXY_URL=http://localhost:5000
NEXT_PUBLIC_ENABLE_PROXY=true
```

### Step 6: Start Your App

```bash
npm run dev
```

---

## 🔗 Available Endpoints

The proxy server provides these endpoints:

### Read Operations (GET)

```
GET /api/firebase/candidates          - Get all candidates
GET /api/firebase/categories          - Get all categories
GET /api/firebase/votes               - Get all votes
GET /api/firebase/users               - Get all users
GET /api/firebase/candidates/<id>     - Get specific candidate
GET /api/firebase/users/<id>          - Get specific user
GET /api/firebase/leaderboard         - Get leaderboard
```

### Write Operations (POST/PUT)

```
POST /api/firebase/votes              - Submit a vote
POST /api/firebase/users              - Create a user
PUT  /api/firebase/users/<id>         - Update a user
```

---

## 📊 How It Works

```
Your App (Next.js)
       ↓
   (blocked by Orange)
       ↓
Firebase Proxy Server (Python/Flask)
       ↓
   (can access Firebase)
       ↓
Firebase Realtime Database
```

1. Your app sends requests to `http://localhost:5000`
2. The proxy server receives the request
3. The proxy server connects to Firebase (from server-side, not blocked)
4. Firebase returns data to the proxy
5. The proxy returns data to your app

---

## 🧪 Test the Proxy

### Test Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Firebase Proxy Server",
  "timestamp": "2025-12-06T..."
}
```

### Test Get Candidates

```bash
curl http://localhost:5000/api/firebase/candidates
```

### Test Submit Vote

```bash
curl -X POST http://localhost:5000/api/firebase/votes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "candidateId": "candidate456",
    "voteCount": 1,
    "paymentMethod": "orange_money",
    "provider": "orange",
    "transactionId": "txn789"
  }'
```

---

## 🌐 Deployment

### Local Network Access

To access the proxy from other devices on your network:

```bash
python firebase_proxy_server.py
# Server will be available at: http://<your-ip>:5000
```

### Production Deployment

For production, deploy the Flask server to a cloud provider:

**Option 1: Heroku**
```bash
pip freeze > requirements.txt
git push heroku main
```

**Option 2: Railway**
- Connect your GitHub repo
- Set environment variables
- Deploy

**Option 3: AWS/Google Cloud**
- Use Cloud Run or App Engine
- Set `FIREBASE_DB_URL` as environment variable

---

## 🔐 Security Considerations

### ⚠️ Important

1. **Never commit `serviceAccount.json`** to git
   - Add to `.gitignore` (already done)
   - Use environment variables in production

2. **Restrict API access** in production
   - Add authentication
   - Use API keys
   - Implement rate limiting

3. **Use HTTPS** in production
   - Don't expose proxy over HTTP
   - Use SSL certificates

### Production Setup

For production, set environment variables:

```bash
export FIREBASE_DB_URL="your_firebase_url"
export FLASK_ENV=production
python firebase_proxy_server.py
```

---

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'firebase_admin'"

```bash
pip install -r firebase_proxy_requirements.txt
```

### "FileNotFoundError: serviceAccount.json"

1. Download `serviceAccount.json` from Firebase Console
2. Place it in your project root
3. Restart the proxy server

### "Connection refused" error in app

1. Make sure proxy is running: `python firebase_proxy_server.py`
2. Check `NEXT_PUBLIC_FIREBASE_PROXY_URL` in `.env.local`
3. Verify proxy is on `http://localhost:5000`

### Proxy works but app still slow

1. Check network latency
2. Verify Firebase is responding
3. Check browser console for errors
4. Try disabling cache: `useCache: false`

---

## 📈 Performance Tips

1. **Use caching** - Enabled by default (30 seconds)
2. **Batch requests** - Get all data in one request
3. **Optimize queries** - Only request what you need
4. **Monitor logs** - Check proxy logs for slow requests

---

## 🔄 Monitoring

The proxy logs all requests:

```
✅ Retrieved 100 candidates
✅ Vote submitted: user123_1701865200000
❌ Error fetching user: User not found
```

Monitor these logs to identify issues.

---

## 📚 Related Files

- `firebase_proxy_server.py` - The proxy server (with hardcoded credentials)
- `firebase_proxy_requirements.txt` - Python dependencies
- `FIREBASE_CREDENTIALS_SETUP.md` - How to add your credentials
- `.env.local` - App configuration file
- `lib/database.ts` - Database operations

---

## ✅ Checklist

- [ ] Python 3.8+ installed
- [ ] Dependencies installed: `pip install -r firebase_proxy_requirements.txt`
- [ ] Firebase credentials copied to `firebase_proxy_server.py`
- [ ] Proxy running: `python firebase_proxy_server.py`
- [ ] Proxy shows: "✅ Firebase initialized successfully with hardcoded credentials"
- [ ] `.env.local` configured with proxy URL
- [ ] App running: `npm run dev`
- [ ] Test proxy: `curl http://localhost:5000/health`
- [ ] Test app: Open browser and check console

---

## 🎯 Next Steps

1. ✅ Install Python dependencies
2. ✅ Get Firebase service account
3. ✅ Start proxy server
4. ✅ Configure app
5. ✅ Test everything
6. ✅ Deploy to production (optional)

---

**Status**: ✅ Ready to use
**Last Updated**: December 6, 2025
