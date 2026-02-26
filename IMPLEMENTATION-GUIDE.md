# SAJI Backend Implementation - Quick Start Guide

## ✅ Phase 1: Setup (You are here)

### What's Already Done:
- ✅ Database schema created (Drizzle ORM)
- ✅ Authentication system (JWT + bcrypt)
- ✅ M-Pesa integration module
- ✅ Airtel Money integration module
- ✅ Email service (Resend)
- ✅ Core API endpoints:
  - Authentication (Signup/Login)
  - Payment initialization
  - M-Pesa callback handler
- ✅ Comprehensive documentation

### What You Need to Do NOW:

#### Step 1: Get Your API Credentials (30 minutes)

**M-Pesa Setup:**
1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create account with business email
3. Create a new application
4. Copy these credentials:
   - Consumer Key
   - Consumer Secret
   - Business Shortcode (get from Safaricom)
   - Passkey (get from Safaricom)

**Airtel Money Setup:**
1. Go to [airtel.africa/developers](https://airtel.africa/developers)
2. Sign up as merchant
3. Create API credentials
4. Get these values:
   - Client ID
   - Client Secret
   - API Key
   - Merchant ID

**Email Service (Resend):**
1. Go to [resend.com](https://resend.com)
2. Sign up
3. Verify your domain (or use default for testing)
4. Get your API key

#### Step 2: Setup Neon Database (15 minutes)

1. Go to [neon.tech](https://neon.tech)
2. Create account
3. Create new PostgreSQL project
4. Get your connection string
5. Add to Vercel project settings:
   - Go to Settings → Environment Variables
   - Add `DATABASE_URL`
   - Apply to all environments

#### Step 3: Configure Environment Variables (10 minutes)

1. Create `.env.local` file from `.env.example`
2. Fill in all values from credentials above
3. Generate JWT secrets:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Add to Vercel project settings

#### Step 4: Install Dependencies (5 minutes)

```bash
npm install
```

The following packages will be installed:
- `pg` - PostgreSQL client
- `drizzle-orm` - ORM
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens
- `axios` - HTTP requests
- `resend` - Email service
- `zod` - Schema validation

#### Step 5: Run Database Migrations (5 minutes)

```bash
# Using drizzle-kit to generate migrations
npx drizzle-kit generate:pg

# Run migrations
npm run db:migrate
```

---

## 📋 Phase 2: Testing (Next Week)

### Test Signup Endpoint
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

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Test Payment (with token from login)
```bash
curl -X POST http://localhost:3000/api/payments/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "bookingId": 1,
    "phoneNumber": "+254712345678",
    "method": "mpesa",
    "amount": 1
  }'
```

---

## 🔄 Phase 3: Remaining Endpoints (Weeks 2-3)

### Booking Management
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List user bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Service Management
- `POST /api/services` - Create service
- `GET /api/services` - List services
- `GET /api/services/:id` - Get service details
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Professional Profile
- `POST /api/professionals` - Create profile
- `GET /api/professionals/:id` - Get profile
- `PUT /api/professionals/:id` - Update profile
- `GET /api/professionals/:id/services` - Get professional's services

### Reviews & Ratings
- `POST /api/reviews` - Create review
- `GET /api/bookings/:id/reviews` - Get booking reviews

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:conversationId` - Get conversation

---

## 🚀 Deployment Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Database backups configured
- [ ] SSL certificate installed
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error logging setup (Sentry/LogRocket)
- [ ] Payment credentials switched to production
- [ ] Testing completed with real payments
- [ ] Security audit completed
- [ ] Documentation updated

---

## 📊 Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/route.ts
│   │   │   └── login/route.ts
│   │   └── payments/
│   │       ├── initialize/route.ts
│   │       └── mpesa/callback/route.ts
│   └── [pages...]
├── lib/
│   ├── db/
│   │   ├── schema.ts          # Database schema
│   │   ├── index.ts           # DB connection
│   │   └── migrations/        # Auto-generated
│   ├── auth.ts                # Authentication utilities
│   └── services/
│       ├── mpesa.ts           # M-Pesa integration
│       ├── airtel.ts          # Airtel integration
│       └── email.ts           # Email service
├── scripts/
│   └── migrate.ts             # Migration script
├── .env.example               # Environment template
├── drizzle.config.ts          # ORM configuration
├── SETUP-GUIDE.md             # Detailed setup
├── API-DOCUMENTATION.md       # API reference
└── package.json
```

---

## 🔐 Security Reminders

1. **Never commit .env.local** (already in .gitignore)
2. **Use HTTPS** in production
3. **Rotate secrets** every 90 days
4. **Monitor failed logins** for suspicious activity
5. **Enable 2FA** for admin accounts
6. **Validate all inputs** on backend
7. **Use parameterized queries** (already done with Drizzle)
8. **Log security events** for audit trails

---

## 📞 Getting Help

### Common Issues:

**"DATABASE_URL not set"**
- Check your `.env.local` file
- Verify connection string format
- Test connection in Neon dashboard

**"M-Pesa credentials invalid"**
- Double-check Consumer Key/Secret
- Verify you're using sandbox (development) or production (live)
- Check if credentials haven't expired

**"Port 3000 already in use"**
- Use different port: `npm run dev -- -p 3001`

**"Module not found"**
- Run `npm install` again
- Clear node_modules: `rm -rf node_modules && npm install`

### Resources:
- M-Pesa Docs: [daraja.safaricom.co.ke](https://daraja.safaricom.co.ke)
- Airtel API: [airtel.africa/developers](https://airtel.africa/developers)
- Neon Docs: [neon.tech/docs](https://neon.tech/docs)
- Drizzle ORM: [orm.drizzle.team](https://orm.drizzle.team)

---

## 📝 Next Actions

1. **Today:** Get API credentials from M-Pesa, Airtel, and Resend
2. **Tomorrow:** Set up Neon database and add connection string
3. **Day 3:** Configure all environment variables
4. **Day 4:** Run database migrations
5. **Day 5:** Test all endpoints
6. **Week 2:** Build remaining 68+ endpoints
7. **Week 3:** Frontend integration and testing
8. **Week 4:** Deployment and go-live

---

## 💡 Key Points to Remember

- **MVP Focus:** Start with Core features only
- **Test Everything:** Before going to production
- **Monitor Errors:** Set up logging for all API calls
- **Document Changes:** Keep documentation updated
- **Secure Secrets:** Use environment variables, never hardcode
- **Backup Data:** Regular database backups
- **Scale Ready:** Architecture supports millions of users

---

Good luck! You're on your way to building a world-class service platform. 🚀
