# Phase 2 & 3: Quick Start - Get Live in 1 Hour

## The 4 Essential Steps

### Step 1: Get OAuth Credentials (25 mins)

#### Google OAuth
1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Search for "OAuth 2.0" → Click APIs & Services
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web Application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy Client ID and Client Secret

#### Apple OAuth
1. Go to https://developer.apple.com/
2. Sign in with Apple Developer account
3. Go to Certificates, Identifiers & Profiles
4. Create new identifier for your app
5. Enable "Sign in with Apple"
6. Create Service ID for web
7. Configure return URL (same pattern as above)
8. Get Certificates and keys

### Step 2: Set Environment Variables (5 mins)

Create `.env.local` file:

```bash
# OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
APPLE_CLIENT_ID=your_apple_id_here
APPLE_CLIENT_SECRET=your_apple_secret_here

# NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=your_neon_postgresql_url_here
```

### Step 3: Install & Migrate (15 mins)

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Seed test data (optional)
npm run db:seed
```

### Step 4: Start Local Server (5 mins)

```bash
# Start development server
npm run dev

# Open browser to
http://localhost:3000/auth/signup
```

---

## Test OAuth Flow (5 mins)

### Test with Google
1. Click "Sign up with Google" button
2. Authenticate with your Google account
3. See your name/email auto-filled
4. Fill phone, select role, submit
5. Should redirect to dashboard

### Test with Apple
1. Click "Sign up with Apple" button
2. Authenticate with Apple
3. Profile auto-filled
4. Complete profile info
5. Should redirect to dashboard

### Test Email/Password
1. Fill form manually
2. Use strong password (8+ chars, mixed case, numbers)
3. Submit
4. Should redirect to complete profile
5. Fill additional info

---

## Verify Everything Works

### Check Database
```sql
-- Connect to Neon
psql $DATABASE_URL

-- See your new user
SELECT id, email, first_name, google_id FROM users WHERE email = 'your@email.com';

-- See OAuth account
SELECT provider, provider_account_id FROM oauth_accounts WHERE user_id = 1;
```

### Test API Endpoints
```bash
# Get current user (requires authentication)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/profile

# Search users
curl http://localhost:3000/api/users/search?q=john&limit=5

# Get user by ID
curl http://localhost:3000/api/users/1
```

---

## Deploy to Vercel (Optional - Only if ready)

### 1. Connect GitHub
- Push code to GitHub
- Visit https://vercel.com/new
- Select your repository
- Deploy

### 2. Add Environment Variables in Vercel
- Go to Project Settings → Environment Variables
- Add all 6 variables from `.env.local`
- Redeploy

### 3. Update OAuth Redirect URIs
- Google Console: Add `https://yourdomain.vercel.app/api/auth/callback/google`
- Apple Developer: Add same for Apple

### 4. Update NEXTAUTH_URL
```
NEXTAUTH_URL=https://yourdomain.vercel.app
```

---

## Troubleshooting

### OAuth Not Working?
- ✅ Check Client ID/Secret are correct
- ✅ Verify redirect URIs match EXACTLY (http vs https, trailing slash)
- ✅ Check NEXTAUTH_URL is set
- ✅ Clear browser cookies and cache
- ✅ Try in incognito window

### Database Connection Error?
- ✅ Verify DATABASE_URL is correct
- ✅ Check Neon dashboard shows active connection
- ✅ Run `npm run db:migrate` again
- ✅ Check firewall allows outbound connections

### Profile Page Not Loading?
- ✅ Ensure you're authenticated first
- ✅ Check NextAuth session is valid
- ✅ Verify API route `/api/users/complete-profile` exists
- ✅ Check browser console for errors

### Redirect Loop?
- ✅ Clear cookies
- ✅ Check NEXTAUTH_SECRET is set
- ✅ Verify database connection works
- ✅ Check user record exists in database

---

## What's Next After Testing

### Immediate
- [ ] Test all 3 auth methods
- [ ] Create 2-3 test accounts
- [ ] Verify database has records
- [ ] Test creating bookings (API call)

### This Week
- [ ] Deploy to Vercel
- [ ] Share staging URL with team
- [ ] Get feedback on auth flow
- [ ] Plan dashboard UI

### Next 2 Weeks
- [ ] Build client dashboard
- [ ] Build professional dashboard
- [ ] Implement real-time messaging
- [ ] Add payment UI

---

## File Structure for Reference

```
app/
├── auth/
│   ├── signin/page.tsx          ← Sign in form
│   ├── signup/page.tsx          ← Sign up form (2 steps)
│   └── complete-profile/        ← OAuth profile completion
│       └── page.tsx
└── api/
    ├── auth/[...nextauth]/
    │   └── route.ts             ← OAuth route handler
    ├── users/
    │   ├── search/route.ts       ← Search users
    │   ├── [id]/route.ts         ← Get user by ID
    │   └── complete-profile/     ← Complete OAuth profile
    │       └── route.ts
    ├── reviews/route.ts          ← Create/get reviews
    ├── messages/route.ts         ← Send/receive messages
    ├── bookings/route.ts         ← Manage bookings
    ├── wallet/
    │   ├── balance/route.ts      ← Get balance
    │   └── transactions/route.ts ← Get history
    ├── payments/
    │   └── initialize/route.ts   ← Start payment
    └── admin/
        ├── dashboard/route.ts    ← Admin stats
        ├── users/route.ts        ← Manage users
        ├── bookings/route.ts     ← Manage bookings
        └── payments/route.ts     ← Payment overview

lib/
├── auth/
│   └── nextauth-config.ts       ← OAuth setup
├── db/
│   ├── schema.ts                ← Database tables
│   └── index.ts                 ← Connection
├── services/
│   ├── mpesa.ts                 ← M-Pesa integration
│   ├── airtel.ts                ← Airtel integration
│   └── email.ts                 ← Email service
└── middleware/
    └── auth.ts                  ← Auth checks
```

---

## Success Checklist

- [ ] OAuth credentials obtained
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Local server running
- [ ] Sign up with Google works
- [ ] Sign up with Apple works
- [ ] Email signup works
- [ ] Profile completion works
- [ ] User appears in database
- [ ] API endpoints respond correctly
- [ ] Ready for dashboard UI
- [ ] Ready for production deployment

---

## Key Files to Reference

1. **OAUTH-TECHNICAL-GUIDE.md** - Deep dive into how OAuth works
2. **PHASE-2-AND-3-GUIDE.md** - Complete API reference
3. **PHASE-2-3-COMPLETE-SUMMARY.md** - What was built & next steps
4. **API-DOCUMENTATION.md** - Full endpoint documentation

---

## Get Help

### Check Logs
```bash
# Terminal output
npm run dev

# Browser console
Press F12 → Console tab

# Network tab
Press F12 → Network tab → See API calls
```

### Common Errors
- "NEXTAUTH_SECRET not set" → Set in `.env.local`
- "Database connection failed" → Check DATABASE_URL
- "Redirect URI mismatch" → Verify in OAuth provider settings
- "User not found" → Check database has user record

---

**You're all set! Get those OAuth credentials and go live!**
