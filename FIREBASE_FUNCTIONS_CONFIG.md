# Firebase Functions Environment Configuration

## Overview

This guide explains how to configure environment variables for the Firebase Cloud Functions that handle voting and payment processing.

## Required Environment Variables

### Mesomb API Credentials

You need to obtain these from your Mesomb dashboard at <https://mesomb.hachther.com/>

- `mesomb.application_key` - Your Mesomb application key
- `mesomb.access_key` - Your Mesomb access key  
- `mesomb.secret_key` - Your Mesomb secret key

### Vote Configuration

- `vote.price` - Price per vote in XAF (default: 100)

## Setting Environment Variables

### For Local Development (Emulator)

Create a `.runtimeconfig.json` file in the `functions` directory:

```json
{
  "mesomb": {
    "application_key": "your_application_key_here",
    "access_key": "your_access_key_here",
    "secret_key": "your_secret_key_here"
  },
  "vote": {
    "price": "100"
  }
}
```

**IMPORTANT:** Add `.runtimeconfig.json` to `.gitignore` to prevent committing secrets!

### For Production (Firebase)

Use the Firebase CLI to set environment variables:

```bash
# Set Mesomb credentials
firebase functions:config:set mesomb.application_key="your_application_key_here"
firebase functions:config:set mesomb.access_key="your_access_key_here"
firebase functions:config:set mesomb.secret_key="your_secret_key_here"

# Set vote price
firebase functions:config:set vote.price="100"

# View current configuration
firebase functions:config:get

# Deploy functions with new config
firebase deploy --only functions
```

## Alternative: Environment Variables

You can also use environment variables (useful for local testing):

```bash
export MESOMB_APPLICATION_KEY="your_application_key_here"
export MESOMB_ACCESS_KEY="your_access_key_here"
export MESOMB_SECRET_KEY="your_secret_key_here"
```

The code will fall back to these environment variables if Firebase config is not available.

## Testing Configuration

### 1. Start Firebase Emulator

```bash
cd functions
npm run serve
```

### 2. Test Functions

The emulator will start on `http://localhost:5001` (or similar). You can test the functions using the Firebase Emulator UI.

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use different credentials** for development and production
3. **Rotate keys regularly** for security
4. **Limit API permissions** in Mesomb dashboard to only what's needed
5. **Monitor usage** to detect unauthorized access

## Troubleshooting

### "Config not found" error

Make sure you've set the config using `firebase functions:config:set` or created `.runtimeconfig.json` for local development.

### "Invalid credentials" error

Verify your Mesomb credentials are correct and have the necessary permissions.

### "Payment failed" error

Check that:

- The phone number is valid
- The operator (MTN/Orange) is correct
- The amount is within allowed limits
- Your Mesomb account has sufficient balance/permissions

## Next Steps

After configuring environment variables:

1. Test locally with Firebase emulator
2. Deploy to Firebase
3. Configure webhook URL in Mesomb dashboard
4. Test end-to-end payment flow
