# Firebase Credentials Setup (Hardcoded - Secure)

## 🔐 Overview

The Firebase proxy server uses **hardcoded credentials** instead of envinment files for better sty.

**Why hardcoded?**
- No `.env` file to accidentally commit
- No external file to expose
- Credentials embedded in code (can be protected)
- Easier deployment (no separate config files)

---

## 📋 How to Get Your Credentials

### Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your **nb-dance-award** project
3. Click **Settings** (gear icon) in top-left
4. Go to **Service Accounts** tab

### Step 2: Generate Private Key

1. Click **Generate New Private Key** button
2. A JSON file will download (e.g., `nb-dance-award-xxxxx.json`)
3. **Keep this file safe!** It contains your credentials

### Step 3: Extract Credentials

Open the downloaded JSON file. You'll see something like:

```json
{
  "type": "service_account",
  "project_id": "nb-dance-award",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@nb-dance-award.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## 🔧 Update firebase_proxy_server.py

### Step 1: Open the file

```bash
nano firebase_proxy_server.py
```

### Step 2: Find the FIREBASE_CREDENTIALS section

Look for (around line 40):

```python
FIREBASE_CREDENTIALS = {
    "type": "service_account",
    "project_id": "nb-dance-award",
    "private_key_id": "your_private_key_id",
    "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
    ...
}
```

### Step 3: Replace with your actual credentials

Copy each value from your JSON file:

```python
FIREBASE_CREDENTIALS = {
    "type": "service_account",
    "project_id": "nb-dance-award",  # Copy from JSON
    "private_key_id": "abc123def456...",  # Copy from JSON
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n",  # Copy from JSON
    "client_email": "firebase-adminsdk-xxxxx@nb-dance-award.iam.gserviceaccount.com",  # Copy from JSON
    "client_id": "123456789",  # Copy from JSON
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."  # Copy from JSON
}
```

### Step 4: Save the file

```bash
# In nano: Ctrl+O, Enter, Ctrl+X
# Or: Ctrl+S in your editor
```

---

## ⚠️ Important: Handle the Private Key

The `private_key` field contains newlines. When copying, make sure:

1. **Keep the quotes** around the entire key
2. **Keep the `\n`** characters (they represent newlines)
3. **Don't add extra spaces**

### Example:

❌ **WRONG:**
```python
"private_key": "-----BEGIN PRIVATE KEY-----
MIIEvQIBA...
-----END PRIVATE KEY-----"
```

✅ **CORRECT:**
```python
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
```

---

## 🧪 Test the Configuration

### Step 1: Start the proxy server

```bash
python firebase_proxy_server.py
```

### Step 2: Check for success message

You should see:
```
✅ Firebase initialized successfully with hardcoded credentials
```

### Step 3: Test an endpoint

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

---

## 🔐 Security Best Practices

### ✅ DO:

- ✅ Keep the credentials **private**
- ✅ Don't share the `firebase_proxy_server.py` file publicly
- ✅ Use HTTPS in production
- ✅ Restrict access to the proxy server
- ✅ Rotate credentials periodically
- ✅ Use strong firewall rules

### ❌ DON'T:

- ❌ Commit `firebase_proxy_server.py` to public GitHub
- ❌ Share credentials in chat or email
- ❌ Use the same credentials for multiple projects
- ❌ Expose the proxy server to the internet without authentication
- ❌ Log credentials in console output

---

## 🚀 Deployment

### Local Development

```bash
python firebase_proxy_server.py
```

### Production (Recommended)

For production, use environment variables:

```bash
# Create a secure .env file (not committed to git)
export FIREBASE_CREDENTIALS_JSON='{"type":"service_account",...}'

# Or use a secrets manager:
# - AWS Secrets Manager
# - Google Cloud Secret Manager
# - HashiCorp Vault
# - Azure Key Vault
```

Then update the code:

```python
import os
import json

FIREBASE_CREDENTIALS = json.loads(os.environ.get('FIREBASE_CREDENTIALS_JSON'))
```

---

## 🐛 Troubleshooting

### "Firebase initialization failed"

1. Check all credentials are correct
2. Verify `private_key` has proper `\n` characters
3. Make sure `project_id` matches your Firebase project
4. Check internet connection

### "Invalid credentials"

1. Regenerate the private key in Firebase Console
2. Copy all fields again carefully
3. Check for extra spaces or quotes

### "Permission denied"

1. Verify the service account has database access
2. Check Firebase Realtime Database rules
3. Make sure the database URL is correct

---

## 📚 Related Files

- `firebase_proxy_server.py` - The proxy server with hardcoded credentials
- `firebase_proxy_requirements.txt` - Python dependencies
- `FIREBASE_PROXY_SETUP.md` - General proxy setup guide

---

## ✅ Checklist

- [ ] Downloaded Firebase service account JSON
- [ ] Copied all credentials to `firebase_proxy_server.py`
- [ ] Verified `private_key` format (with `\n`)
- [ ] Saved the file
- [ ] Started proxy: `python firebase_proxy_server.py`
- [ ] Tested health endpoint: `curl http://localhost:5000/health`
- [ ] Got success message in console

---

**Status**: ✅ Ready to use
**Security Level**: 🔒 Hardcoded (no .env file exposure)
**Last Updated**: December 6, 2025
