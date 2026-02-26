# SAJI Backend API - Complete Setup

## 📚 Documentation Files

This project includes comprehensive documentation:

1. **SETUP-GUIDE.md** - Step-by-step setup instructions
2. **API-DOCUMENTATION.md** - Complete API reference
3. **IMPLEMENTATION-GUIDE.md** - Implementation roadmap
4. **DATABASE-SCHEMA.md** - Database structure details

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon)
- API credentials for:
  - M-Pesa (Daraja API)
  - Airtel Money
  - Resend (Email service)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local file with your credentials
cp .env.example .env.local

# 3. Run database migrations
npm run db:migrate

# 4. (Optional) Seed database with test data
npm run db:seed

# 5. Start development server
npm run dev
```

Visit `http://localhost:3000` to start using the API.

---

## 🔑 Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# Authentication
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-secure-session-secret

# M-Pesa
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback

# Airtel Money
AIRTEL_CLIENT_ID=your-id
AIRTEL_CLIENT_SECRET=your-secret
AIRTEL_API_KEY=your-key
AIRTEL_MERCHANT_ID=your-merchant-id
AIRTEL_CALLBACK_URL=https://yourdomain.com/api/payments/airtel/callback

# Email
RESEND_API_KEY=your-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📊 Implemented Endpoints (MVP)

### Authentication
- ✅ `POST /api/auth/signup` - Create account
- ✅ `POST /api/auth/login` - Login

### Bookings
- ✅ `POST /api/bookings` - Create booking
- ✅ `GET /api/bookings` - List user bookings
- ✅ `GET /api/bookings/:id` - Get booking details
- ✅ `PUT /api/bookings/:id` - Update booking
- ✅ `DELETE /api/bookings/:id` - Cancel booking

### Services
- ✅ `GET /api/services` - List services
- ✅ `POST /api/services` - Create service (professionals only)

### Payments
- ✅ `POST /api/payments/initialize` - Start payment
- ✅ `POST /api/payments/mpesa/callback` - M-Pesa webhook

---

## 📋 Remaining Endpoints (Phase 2)

### Professional Profiles
- `POST /api/professionals` - Create profile
- `GET /api/professionals/:id` - Get profile
- `PUT /api/professionals/:id` - Update profile
- `GET /api/professionals/:id/services` - List services

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/bookings/:id/reviews` - Get reviews

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:conversationId` - Get conversation

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/payments` - Payment analytics
- `PUT /api/admin/users/:id` - Manage user

---

## 🏗️ Project Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── signup/route.ts
│   │   └── login/route.ts
│   ├── bookings/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── services/
│   │   └── route.ts
│   └── payments/
│       ├── initialize/route.ts
│       └── mpesa/callback/route.ts
├── layout.tsx
└── page.tsx

lib/
├── db/
│   ├── schema.ts
│   ├── index.ts
│   └── migrations/
├── auth.ts
├── services/
│   ├── mpesa.ts
│   ├── airtel.ts
│   └── email.ts

scripts/
├── migrate.ts
└── seed.ts
```

---

## 🧪 Testing the API

### Using cURL

**Signup:**
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

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Create Booking:**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "professionalId": 1,
    "serviceId": 1,
    "bookingDate": "2024-03-15T14:00:00Z",
    "duration": 60,
    "notes": "I need help with...",
    "location": "Nairobi, Kenya"
  }'
```

### Using Postman

1. Import the Postman collection
2. Set environment variables
3. Run requests in order

---

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Input validation with Zod
- ✅ SQL injection protection (Drizzle ORM)
- ✅ CORS configuration
- ✅ Rate limiting (ready to implement)
- ✅ Secure session management

---

## 📈 Database Schema

The system uses PostgreSQL with the following main tables:

- **users** - User accounts and authentication
- **professional_profiles** - Professional information
- **services** - Services offered
- **bookings** - Service bookings
- **payments** - Payment records
- **reviews** - Customer reviews
- **messages** - User communications
- **wallets** - User funds
- **verification_requests** - Document verification
- **transaction_logs** - Financial transaction history

---

## 🚨 Common Issues

### "DATABASE_URL not set"
- Add `DATABASE_URL` to `.env.local`
- Verify Neon connection string

### "M-Pesa credentials invalid"
- Check Consumer Key/Secret from Daraja dashboard
- Verify shortcode and passkey
- Ensure you're using correct environment (sandbox vs production)

### "Module not found"
```bash
rm -rf node_modules
npm install
```

---

## 📞 Support Resources

- **M-Pesa**: https://developer.safaricom.co.ke
- **Airtel**: https://airtel.africa/developers
- **Neon**: https://neon.tech/docs
- **Drizzle**: https://orm.drizzle.team

---

## 🚀 Deployment

### To Vercel

1. Connect your GitHub repository
2. Add environment variables in Vercel Settings
3. Deploy with `git push`

### Environment Configuration

```env
# Production
DATABASE_URL=postgresql://prod-user:prod-pass@prod-host/prod-db
JWT_SECRET=<production-jwt-secret>
MPESA_CONSUMER_KEY=<production-mpesa-key>
```

---

## 📝 Development Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Run tests: `npm run test`
4. Commit changes: `git commit -m "Add feature"`
5. Push to GitHub: `git push`
6. Create Pull Request
7. Deploy to production

---

## 🎯 Next Steps

1. **Complete Setup**
   - [ ] Get all API credentials
   - [ ] Configure database
   - [ ] Run migrations

2. **Test Core Features**
   - [ ] Signup/Login
   - [ ] Create booking
   - [ ] Process payment

3. **Build Remaining Endpoints**
   - [ ] Professional profiles
   - [ ] Reviews system
   - [ ] Messaging

4. **Frontend Integration**
   - [ ] Connect auth flows
   - [ ] Payment UI
   - [ ] Booking management

5. **Go Live**
   - [ ] Production credentials
   - [ ] Database backups
   - [ ] Monitoring setup

---

## 📄 License

This project is proprietary. All rights reserved.

---

## 💡 Key Features

- **Multi-role system** - Admin, Professional, Client, Shopkeeper
- **Secure payments** - M-Pesa & Airtel Money integration
- **Booking management** - Full CRUD operations
- **Service marketplace** - Browse and book services
- **User verification** - Document-based KYC
- **Reviews & ratings** - Quality assurance
- **Wallet system** - Fund management
- **Email notifications** - Automated communications

---

Good luck building the future of services in Africa! 🚀
