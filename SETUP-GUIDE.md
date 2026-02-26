# SAJI Platform - Complete Backend Setup Guide

## Overview
This guide will walk you through setting up the complete SAJI backend with Neon database, authentication, payment processing, and API endpoints.

## 🚀 Step 1: Neon Database Setup

### 1.1 Create a Neon Account & Project
1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Select PostgreSQL version (latest recommended)
4. Note your connection string

### 1.2 Get Your Connection String
In your Neon dashboard:
1. Click on "Connection string" 
2. Copy the full connection string (looks like: `postgresql://user:password@host/dbname`)
3. This will go in your `.env.local` file as `DATABASE_URL`

### 1.3 Add to Vercel Project
1. Go to your Vercel project Settings
2. Go to Environment Variables
3. Add `DATABASE_URL` with your Neon connection string
4. Add it to all environments (Production, Preview, Development)

---

## 🔐 Step 2: Authentication Setup

### Generate Secret Keys
Run these commands to generate secure keys for your authentication:

```bash
# Generate JWT Secret (at least 32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Session Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Add to Environment Variables
Add these to your `.env.local` and Vercel:
```
JWT_SECRET=<generated-value>
SESSION_SECRET=<generated-value>
```

---

## 💳 Step 3: M-Pesa Daraja API Setup

### 3.1 Register for M-Pesa Daraja
1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create a developer account (use your business email)
3. Create an app in the dashboard
4. You'll get:
   - **Consumer Key**
   - **Consumer Secret**

### 3.2 Add Shortcode & Passkey
1. For **Lipa Na M-Pesa Online (STK Push)**:
   - Get a Business Shortcode from Safaricom
   - Get the Passkey (provided by Safaricom)
   - Timestamp format: `YYYYMMDDHHmmss`

### 3.3 Environment Variables
```
MPESA_CONSUMER_KEY=<your-consumer-key>
MPESA_CONSUMER_SECRET=<your-consumer-secret>
MPESA_SHORTCODE=<your-shortcode>
MPESA_PASSKEY=<your-passkey>
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
```

### 3.4 Test Credentials (Development)
For testing, Safaricom provides test credentials and phone numbers:
- Test Phone: 254708374149
- Test Amount: Any amount
- These work in sandbox mode

---

## 💰 Step 4: Airtel Money Setup

### 4.1 Register for Airtel Money API
1. Go to [airtel.africa/developers](https://airtel.africa/developers)
2. Create a developer account
3. Create an application
4. You'll get:
   - **Client ID**
   - **Client Secret**
   - **API Key**

### 4.2 Environment Variables
```
AIRTEL_CLIENT_ID=<your-client-id>
AIRTEL_CLIENT_SECRET=<your-client-secret>
AIRTEL_API_KEY=<your-api-key>
AIRTEL_CALLBACK_URL=https://yourdomain.com/api/payments/airtel/callback
AIRTEL_MERCHANT_ID=<your-merchant-id>
```

---

## 📧 Step 5: Email Service Setup (Resend)

### 5.1 Setup Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your domain (or use default domain for testing)
4. Get your API key

### 5.2 Environment Variable
```
RESEND_API_KEY=<your-resend-api-key>
```

---

## 📱 Step 6: Optional - SMS Service (AfriSIM)

### 6.1 Setup AfriSIM Account
1. Go to [afrisim.io](https://afrisim.io)
2. Create account
3. Get API credentials

### 6.2 Environment Variable
```
AFRISIM_API_KEY=<your-afrisim-key>
```

---

## 🔧 Complete .env.local Template

Create a `.env.local` file in your project root with:

```
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# Authentication
JWT_SECRET=<your-jwt-secret>
SESSION_SECRET=<your-session-secret>

# M-Pesa (Daraja)
MPESA_CONSUMER_KEY=<consumer-key>
MPESA_CONSUMER_SECRET=<consumer-secret>
MPESA_SHORTCODE=<shortcode>
MPESA_PASSKEY=<passkey>
MPESA_CALLBACK_URL=http://localhost:3000/api/payments/mpesa/callback

# Airtel Money
AIRTEL_CLIENT_ID=<client-id>
AIRTEL_CLIENT_SECRET=<client-secret>
AIRTEL_API_KEY=<api-key>
AIRTEL_MERCHANT_ID=<merchant-id>
AIRTEL_CALLBACK_URL=http://localhost:3000/api/payments/airtel/callback

# Email Service
RESEND_API_KEY=<resend-api-key>

# Optional SMS
AFRISIM_API_KEY=<afrisim-api-key>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📊 Step 7: Database Migration

Once you have your DATABASE_URL set:

```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Seed test data (optional)
npm run db:seed
```

---

## ✅ Verification Checklist

- [ ] Neon database created and connected
- [ ] `.env.local` file created with all required variables
- [ ] Environment variables added to Vercel
- [ ] Database migrations completed
- [ ] M-Pesa credentials obtained
- [ ] Airtel Money credentials obtained
- [ ] Email service configured
- [ ] Run `npm run dev` and verify no errors

---

## 🚨 Important Security Notes

1. **Never commit `.env.local`** to GitHub - it's already in `.gitignore`
2. **Use different credentials** for development, staging, and production
3. **Test payment flows** thoroughly before going live
4. **Keep API keys secure** - rotate them regularly
5. **Use HTTPS** in production for all payment callbacks

---

## 📞 Support & Next Steps

Once setup is complete, the API endpoints will be available at:
- `http://localhost:3000/api/` (development)
- `https://yourdomain.com/api/` (production)

All endpoints are documented in the API_DOCUMENTATION.md file.
