# Mesomb Payment Integration Guide

## What is Mesomb?

**Mesomb** is a Cameroonian payment aggregator that provides a unified API for mobile money payments. Instead of integrating separately with MTN MoMo and Orange Money, you use one API for both.

## ✅ Advantages of Using Mesomb

| Feature | Direct Integration | Mesomb Aggregator |
|---------|-------------------|-------------------|
| **APIs to integrate** | 2 (MTN + Orange) | 1 (Mesomb) |
| **Credentials needed** | 5+ keys | 3 keys |
| **Code complexity** | High | Low |
| **Webhook handling** | 2 separate webhooks | 1 unified webhook |
| **Testing** | Need sandbox for each | Built-in test mode |
| **Support** | Contact each provider | Single support team |
| **Setup time** | Weeks | Days |

## 🔑 Mesomb Credentials Explained

When you create a Mesomb account and application, you get 3 credentials:

### 1. **Application Key**

```
Example: app_abc123def456
```

- Identifies your application
- Public identifier (not secret)
- Used in API requests

### 2. **Access Key**

```
Example: access_xyz789uvw012
```

- Your API username
- Used for authentication
- Keep secret!

### 3. **Secret Key**

```
Example: secret_mno345pqr678
```

- Your API password
- Used for authentication
- Keep very secret!

## 📋 How to Get Mesomb Credentials

### Step 1: Create Account

1. Go to [mesomb.com](https://mesomb.com)
2. Click "Sign Up" or "Create Account"
3. Fill in your details:
   - Name
   - Email
   - Phone number
   - Password
4. Verify your email

### Step 2: Create Application

1. Log in to Mesomb dashboard
2. Navigate to **"My Applications"**
3. Click **"Create New Application"**
4. Fill in application details:
   - **Name**: "NB Dance Awards Voting"
   - **Description**: "Mobile voting system for dance awards"
   - **Type**: Payment/Collection
5. Click **"Create"**

### Step 3: Generate API Keys

1. Go to your application dashboard
2. Click on **"API Keys"** section
3. Click **"Create New API Credentials"**
4. **Important**: Check the box for **"Payment Integration"**
5. Click **"Generate"**
6. **Copy and save** your credentials:
   - Application Key
   - Access Key
   - Secret Key

   ⚠️ **Warning**: The Secret Key is shown only once! Save it immediately.

### Step 4: Configure Test Mode (Optional)

1. In your application settings
2. Enable **"Test Mode"** for development
3. You'll get test credentials for testing without real money

## 💰 Pricing

Mesomb charges a small transaction fee:

- **MTN MoMo**: ~2% per transaction
- **Orange Money**: ~2% per transaction
- **No monthly fees**
- **No setup fees**

**Example:**

- User votes 5 times at 100 XAF each = 500 XAF
- Mesomb fee: ~10 XAF (2%)
- You receive: ~490 XAF

## 🔄 How Mesomb Payment Flow Works

```
1. User clicks "Vote" on your website
   ↓
2. Your Firebase Function calls Mesomb API
   ↓
3. Mesomb initiates payment with MTN/Orange
   ↓
4. User receives USSD prompt on their phone
   Example MTN: "*126*1*123456#"
   Example Orange: "*144*1*123456#"
   ↓
5. User enters PIN on their phone to confirm
   ↓
6. Payment provider (MTN/Orange) processes payment
   ↓
7. Mesomb receives confirmation
   ↓
8. Mesomb sends webhook to your Firebase Function
   ↓
9. Your function updates vote count in database
   ↓
10. User sees success message on website
```

## 📝 Mesomb API Example

Here's how simple it is to use Mesomb:

### Install SDK

```bash
npm install mesomb
```

### Initialize Client

```typescript
import { PaymentOperation, TransactionStatus } from 'mesomb';

const payment = new PaymentOperation({
  applicationKey: 'your_app_key',
  accessKey: 'your_access_key',
  secretKey: 'your_secret_key'
});
```

### Collect Payment

```typescript
// Initiate payment
const transaction = await payment.makeCollect({
  amount: 500,           // 500 XAF
  service: 'MTN',        // or 'ORANGE'
  payer: '675123456',    // User's phone number
  nonce: 'unique_id',    // Unique transaction ID
  country: 'CM',         // Cameroon
  currency: 'XAF'        // Central African Franc
});

console.log(transaction.reference); // Save this!
```

### Check Payment Status

```typescript
const status = await payment.getStatus(transaction.reference);

if (status.success) {
  console.log('Payment confirmed!');
  // Update vote count
} else {
  console.log('Payment pending or failed');
}
```

## 🔐 Security in Firebase Functions

Your Mesomb credentials will be stored securely in Firebase:

```bash
# Set credentials in Firebase (encrypted)
firebase functions:config:set \
  mesomb.application_key="app_abc123" \
  mesomb.access_key="access_xyz789" \
  mesomb.secret_key="secret_mno345" \
  mesomb.mode="test"
```

Access in your function:

```typescript
import * as functions from 'firebase-functions';

const config = functions.config();
const mesombAppKey = config.mesomb.application_key;
const mesombAccessKey = config.mesomb.access_key;
const mesombSecretKey = config.mesomb.secret_key;
```

## 🧪 Testing

### Test Mode

- Use test credentials from Mesomb
- No real money is charged
- Simulate successful/failed payments
- Test webhook delivery

### Test Phone Numbers

Mesomb provides test phone numbers:

- MTN Test: `675000000`
- Orange Test: `655000000`

## 🎯 Integration Checklist

- [ ] Create Mesomb account at mesomb.com
- [ ] Create application in dashboard
- [ ] Generate API credentials with "Payment Integration"
- [ ] Save Application Key, Access Key, Secret Key
- [ ] Enable test mode for development
- [ ] Configure webhook URL in Mesomb dashboard
- [ ] Set credentials in Firebase Functions config
- [ ] Test payment flow with test numbers
- [ ] Switch to live mode for production

## 📞 Support

If you have issues:

- **Mesomb Support**: <support@mesomb.com>
- **Documentation**: [mesomb.com/docs](https://mesomb.com/docs)
- **Dashboard**: [mesomb.com/dashboard](https://mesomb.com/dashboard)

## 🆚 Comparison: Environment Variables

### Before (Direct Integration)

```bash
# Need 5+ credentials
MTN_MOMO_API_KEY=...
MTN_MOMO_API_SECRET=...
MTN_MOMO_SUBSCRIPTION_KEY=...
ORANGE_API_KEY=...
ORANGE_API_SECRET=...
```

### After (Mesomb)

```bash
# Only 3 credentials!
MESOMB_APPLICATION_KEY=...
MESOMB_ACCESS_KEY=...
MESOMB_SECRET_KEY=...
```

Much simpler! 🎉
