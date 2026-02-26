# SAJI Backend - Quick Reference Card

## Start Here
Read in this order:
1. **GET-STARTED.md** (this directory)
2. **IMPLEMENTATION-GUIDE.md** (your action plan)
3. **SETUP-GUIDE.md** (detailed steps)
4. **API-DOCUMENTATION.md** (reference)
5. **TESTING-GUIDE.md** (validate everything)

---

## Immediate Action Items (Today)

### 1. Get Credentials (30 minutes)

**M-Pesa**
- Go: https://developer.safaricom.co.ke
- Get: Consumer Key, Consumer Secret
- Ask Safaricom: Business Shortcode, Passkey

**Airtel Money**
- Go: https://airtel.africa/developers
- Get: Client ID, Client Secret, API Key

**Email (Resend)**
- Go: https://resend.com
- Get: API Key

**Database (Neon)**
- Go: https://neon.tech
- Create: PostgreSQL database
- Copy: Connection string

### 2. Setup Environment (10 minutes)
```bash
# Create .env.local from template
cp .env.example .env.local

# Edit and fill in all credentials
nano .env.local  # or open in your editor
```

### 3. Install & Migrate (10 minutes)
```bash
npm install
npm run db:migrate
```

### 4. Start Server (5 minutes)
```bash
npm run dev
```

Visit: http://localhost:3000/api/health (you'll get an error, that's fine - server is running)

---

## Database Connection String Format

```
postgresql://username:password@host/database
```

Example from Neon:
```
postgresql://user:password@ep-xyz.us-east-1.neon.tech/saji_db
```

---

## Key API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/signup` | Create account |
| POST | `/auth/login` | Get JWT token |
| GET | `/auth/profile` | Get user profile |
| POST | `/bookings` | Create booking |
| GET | `/bookings` | List bookings |
| POST | `/services` | Create service |
| GET | `/services` | List services |
| POST | `/payments/initialize` | Start payment |

---

## Testing an Endpoint

### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "password": "SecurePass123!",
    "role": "client"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Profile (use token from login response)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Environment Variables Template

```env
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Auth Secrets (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-secret-here
SESSION_SECRET=your-secret-here

# M-Pesa
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=http://localhost:3000/api/payments/mpesa/callback

# Airtel Money
AIRTEL_CLIENT_ID=your-id
AIRTEL_CLIENT_SECRET=your-secret
AIRTEL_API_KEY=your-key
AIRTEL_MERCHANT_ID=your-merchant-id
AIRTEL_CALLBACK_URL=http://localhost:3000/api/payments/airtel/callback

# Email
RESEND_API_KEY=your-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "DATABASE_URL not set" | Add it to `.env.local` |
| Port 3000 in use | `npm run dev -- -p 3001` |
| "Module not found" | `npm install` |
| Migrations fail | `psql $DATABASE_URL` to test connection |
| M-Pesa error | Normal on sandbox - credentials needed |

---

## Authentication Header Format

All protected endpoints need:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Example:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." http://localhost:3000/api/auth/profile
```

---

## File Locations

| Item | Location |
|------|----------|
| Database Schema | `lib/db/schema.ts` |
| Auth Utilities | `lib/auth.ts` |
| M-Pesa Service | `lib/services/mpesa.ts` |
| Airtel Service | `lib/services/airtel.ts` |
| Email Service | `lib/services/email.ts` |
| API Endpoints | `app/api/` |
| Environment Template | `.env.example` |
| Setup Guide | `SETUP-GUIDE.md` |
| API Docs | `API-DOCUMENTATION.md` |
| Testing Guide | `TESTING-GUIDE.md` |

---

## Production Deployment

1. Add env vars to Vercel dashboard
2. Switch credentials to production:
   - M-Pesa: prod URL
   - Airtel: prod credentials
   - Database: prod connection string
3. Push to main branch
4. Vercel auto-deploys

---

## Support Resources

- **Docs in This Project**: Read all .md files
- **M-Pesa API**: https://developer.safaricom.co.ke/apis
- **Airtel API**: https://airtel.africa/developers
- **Neon DB**: https://neon.tech/docs
- **Drizzle ORM**: https://orm.drizzle.team
- **Next.js**: https://nextjs.org/docs

---

## Status Dashboard

Current MVP Implementation:
- ✅ Database: Neon PostgreSQL with 10 tables
- ✅ Auth: JWT + Bcrypt authentication
- ✅ Payments: M-Pesa & Airtel Money integration
- ✅ Email: Resend email service
- ✅ API: 15+ endpoints implemented
- ✅ Docs: Complete setup, API, and testing guides

Ready to: Test locally, deploy to production, scale to millions of users

---

## Your Next 24 Hours

- [ ] **Hour 1-2**: Get all credentials
- [ ] **Hour 3**: Setup .env.local
- [ ] **Hour 4**: Run `npm install` & `npm run db:migrate`
- [ ] **Hour 5-6**: Test endpoints with curl
- [ ] **Hour 7-24**: Review documentation, plan Phase 2

---

## Phase Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Setup** | 1-2 days | Get credentials, configure database |
| **Testing** | 2-3 days | Test all endpoints, fix issues |
| **Deployment** | 1 day | Deploy to production |
| **Phase 2** | 2-3 weeks | Build remaining 50+ endpoints |
| **Frontend** | 2-4 weeks | Connect frontend, integrate payments |
| **Launch** | Day 1 | Go live! |

---

## Success Metrics

Your backend is ready when:
- ✅ All tests in TESTING-GUIDE.md pass
- ✅ Signup/login working
- ✅ Bookings can be created
- ✅ Payments initialize (even if sandbox errors)
- ✅ Emails are sent
- ✅ Database queries return correct data

---

Remember: This is an MVP-ready backend. You can deploy to production today if you have credentials. Additional features from the documentation will be added in Phase 2.

**Start with GET-STARTED.md next!** 🚀
