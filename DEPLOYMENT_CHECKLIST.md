# Quick Deployment Checklist

## ✅ Completed

- [x] Migrated Firebase Functions to Vercel API routes
- [x] Created `/api/vote/submit` endpoint
- [x] Created `/api/vote/verify` endpoint  
- [x] Created `/api/webhook/payment` endpoint
- [x] Installed `@hachther/mesomb` package
- [x] Updated `useVoting` hook to use fetch API
- [x] Build verified successfully
- [x] Fixed ESLint issues

## ⏳ Next Steps (Do These Now)

### 1. Add Mesomb Credentials to Vercel

Go to: <https://vercel.com/tsanga-awanas-projects/nbawardpayement/settings/environment-variables>

Add these three variables:

```
MESOMB_APPLICATION_KEY = <your_key>
MESOMB_ACCESS_KEY = <your_key>
MESOMB_SECRET_KEY = <your_key>
```

### 2. Deploy to Vercel

```bash
git add .
git commit -m "feat: Migrate payment functions to Vercel API routes"
git push origin main
```

Vercel will automatically build and deploy.

### 3. Update Mesomb Webhook

In your Mesomb dashboard, set webhook URL to:

```
https://your-production-domain.vercel.app/api/webhook/payment
```

### 4. Test in Production

1. Visit your deployed site
2. Try voting for a candidate
3. Complete the mobile money payment
4. Verify votes are counted correctly

## Important Notes

- ✅ No more `firebase deploy --only functions` needed!
- ✅ Everything deploys together with `git push`
- ✅ API routes work on Vercel's serverless infrastructure
- ⚠️ Make sure to add environment variables in Vercel dashboard
- ⚠️ Update Mesomb webhook URL after deployment

## Troubleshooting

If votes don't work after deployment:

1. Check Vercel deployment logs for errors
2. Verify environment variables are set correctly
3. Check Mesomb webhook is pointing to correct URL
4. Test API endpoints directly with Postman/curl
