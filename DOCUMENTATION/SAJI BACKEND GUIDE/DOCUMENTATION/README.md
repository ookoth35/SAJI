# SAJI Platform - Complete Documentation

## Overview
This directory contains comprehensive documentation for the SAJI multi-role service platform. Use these guides to understand the system architecture, implement features, and convert the frontend prototype to a fully functional backend system.

---

## Documentation Files

### 1. **Portal Workflow** (`01-Portal-Workflow.md`)
Complete guide to all 7 user portals and their functionality.

**Includes:**
- Customer, Provider, Shopkeeper, Agent, Sub-Admin, Secretary, and Admin portals
- Key features for each role
- User flows through the system
- Cross-portal shared features (authentication, messaging, payments)
- Data flow architecture
- Real-time features
- Authentication & authorization flow

**Use this when:**
- Understanding the overall system architecture
- Planning new features
- Mapping user journeys
- Determining which role has access to what

---

### 2. **API Requirements** (`02-API-Requirements.md`)
Guide to all third-party APIs and services needed for a production SAJI platform.

**Includes:**
- Core backend infrastructure (database, file storage, auth)
- Payment processing (Stripe, PayPal, Razorpay)
- Payout systems (Stripe Connect, Wise)
- Real-time communication (WebSockets, Firebase, Pusher)
- Push notifications (Firebase, OneSignal)
- Email services (SendGrid, Resend, Brevo)
- Analytics & monitoring (Google Analytics, Mixpanel, Sentry)
- Search solutions (Algolia, Elasticsearch, Supabase FTS)
- Maps & location (Google Maps, Mapbox)
- Verification & compliance (Onfido, Veriff)
- SMS & voice (Twilio)
- Video streaming (Agora.io)
- AI & chatbot (OpenAI, Claude, Vertex AI)
- Implementation priorities (phases 1-4)
- Cost estimations for MVP, small scale, and growth
- Configuration template with environment variables

**Use this when:**
- Planning which services to integrate
- Choosing between competing solutions
- Understanding cost implications
- Setting up environment variables
- Creating a roadmap for backend development

---

### 3. **Database Schema** (`03-Database-Schema.md`)
Complete SQL schema for all database tables with relationships and indexes.

**Includes:**
- Authentication & user management tables
- Customer portal tables
- Provider portal tables
- Shopkeeper portal tables
- Financial management tables
- Communication & support tables
- Disputes & moderation tables
- Analytics & logging tables
- Reference tables (categories)
- Data integrity rules
- Performance considerations

**Use this when:**
- Setting up your database
- Creating tables in PostgreSQL or your chosen database
- Understanding data relationships
- Creating indexes for performance
- Planning data migrations

---

### 4. **POST Methods** (`04-POST-Methods.md`)
All endpoints that submit data to the database, with request/response formats.

**Includes 36 endpoints covering:**
- User authentication (registration, login, password reset)
- Email subscriptions and newsletters
- Customer bookings and payments
- Provider services and availability
- Shopkeeper products and promotions
- Agent dispute resolution
- Sub-admin verifications and moderation
- Admin team management and announcements
- Messaging and support
- Content uploads

**Each endpoint includes:**
- Page it's used on
- HTTP method and endpoint path
- Database tables affected
- Request payload structure
- Validation requirements
- Response format

**Use this when:**
- Implementing form submissions
- Creating API endpoints
- Building the backend logic
- Testing data submission flows

---

### 5. **GET Methods** (`05-GET-Methods.md`)
All endpoints that fetch data from the database, with query parameters and response formats.

**Includes 50 endpoints covering:**
- User profile retrieval
- Service browsing and search
- Booking history and details
- Analytics and reports
- Dashboard data
- Messages and conversations
- Order and product listings
- Payment history
- Performance metrics
- Audit logs

**Each endpoint includes:**
- Page it's used on
- Database tables queried
- Query parameters for filtering/sorting
- Response structure with examples
- Recommended cache duration
- Performance considerations

**Use this when:**
- Fetching data to display on pages
- Implementing search and filters
- Building dashboards
- Creating analytics views
- Optimizing database queries

---

## Quick Start Guide

### Step 1: Understand the System
1. Read `01-Portal-Workflow.md` to understand all 7 user roles and their portals
2. Review the data flow architecture section
3. Map out which pages you need to build first

### Step 2: Choose Your Backend Stack
1. Read `02-API-Requirements.md`
2. Choose your database (PostgreSQL recommended)
3. Select payment processor (Stripe recommended)
4. Choose email service (Resend recommended)
5. Plan your implementation phases

### Step 3: Set Up Database
1. Use `03-Database-Schema.md` to create all tables
2. Set up proper indexes for performance
3. Create relationships and constraints
4. Test with sample data

### Step 4: Build POST Endpoints
1. Use `04-POST-Methods.md` to understand what data each form needs to submit
2. Create API endpoints for each form on your pages
3. Implement validation and error handling
4. Test with real data

### Step 5: Build GET Endpoints
1. Use `05-GET-Methods.md` to understand what data each page needs to fetch
2. Create API endpoints to retrieve data from database
3. Implement filtering, sorting, and pagination
4. Set up caching where appropriate
5. Test with production data

### Step 6: Connect Frontend to Backend
1. Replace mock data with real API calls
2. Update authentication to use your auth system
3. Implement real-time features (messages, notifications)
4. Handle errors and loading states
5. Test end-to-end flows

---

## Database Tables Overview

### User Management (6 tables)
- `users` - Core user accounts
- `user_roles` - Multiple roles per user
- `team_members` - Admin staff access
- `sessions` - Active sessions tracking
- `customers` - Customer-specific data
- `providers` - Provider-specific data

### Services & Products (5 tables)
- `services` - Provider service listings
- `products` - Shopkeeper product listings
- `service_categories` - Service types
- `product_categories` - Product types
- `provider_skills` - Provider expertise

### Transactions & Payments (7 tables)
- `bookings` - Customer service orders
- `orders` - Shopkeeper product orders
- `payments` - All payment records
- `wallets` - User account balances
- `wallet_transactions` - Wallet history
- `payouts` - Provider/shopkeeper withdrawals
- `invoices` - Generated invoices

### Communication (6 tables)
- `messages` - In-app messaging
- `email_subscribers` - Newsletter list
- `chatbot_conversations` - AI chat history
- `chatbot_messages` - Individual chat messages
- `support_tickets` - User support requests
- `notifications` - User alerts (new table)

### Disputes & Moderation (3 tables)
- `disputes` - Customer complaints
- `reports` - User-submitted reports
- `content_moderation` - Moderated content

### Analytics & Logging (3 tables)
- `audit_logs` - All system actions
- `analytics_events` - User behavior tracking
- `commission_tiers` - Payment rate configuration

**Total: ~40+ tables for complete platform**

---

## API Endpoints Summary

### Authentication (5 POST endpoints)
- Register new user
- User login
- Team member login
- Password reset request
- Password reset confirmation

### Customer Functions (12 POST/GET endpoints)
- Browse services and search
- View service details
- Book services
- View booking history
- Save favorite addresses
- Add favorites
- Submit reviews
- Manage wallet

### Provider Functions (14 POST/GET endpoints)
- Create and manage services
- Add skills and certifications
- Set availability
- Accept/complete bookings
- Create quotes
- View analytics
- Manage clients
- Request payouts

### Shopkeeper Functions (10 POST/GET endpoints)
- Create and manage products
- Create promotions
- Manage orders
- View shop analytics
- Respond to reviews
- Manage inventory

### Agent Functions (6 POST/GET endpoints)
- View assigned disputes
- Resolve disputes
- Escalate cases
- View performance stats
- View leaderboard
- Manage commissions

### Admin Functions (15 POST/GET endpoints)
- Manage users
- Configure commissions
- Create announcements
- Manage team members
- Process payouts
- View all disputes
- Access audit logs
- Manage subscribers

### Shared Functions (6 POST/GET endpoints)
- Send messages
- Send/receive chatbot messages
- Escalate to human agent
- Create support tickets
- Upload files
- Search users

**Total: 68+ API endpoints**

---

## Key Decisions Made

### 1. Database
- **Choice**: PostgreSQL (via Supabase or Neon)
- **Reason**: Relational data, scalable, good for transactions

### 2. Authentication
- **Choice**: Supabase Auth
- **Reason**: Built-in PostgreSQL support, JWT tokens, OAuth ready

### 3. Payments
- **Choice**: Stripe
- **Reason**: Industry standard, good for India, webhooks, Stripe Connect

### 4. Email
- **Choice**: Resend
- **Reason**: Next.js native, simple API, good pricing

### 5. File Storage
- **Choice**: Vercel Blob
- **Reason**: Already in your Next.js stack, simple, CDN included

### 6. Real-time
- **Choice**: Supabase Realtime
- **Reason**: Included with PostgreSQL, managed, built-in auth

### 7. AI Chatbot
- **Choice**: OpenAI GPT-4
- **Reason**: Best quality, good documentation, competitive pricing

---

## Implementation Roadmap

### Phase 1: MVP (Weeks 1-4)
- [ ] Database setup (PostgreSQL)
- [ ] Authentication system
- [ ] User registration & login
- [ ] Basic booking system
- [ ] Stripe payment integration
- [ ] Email service
- [ ] Core endpoints (15-20)

### Phase 2: Core Features (Weeks 5-8)
- [ ] Provider services
- [ ] Shopkeeper products
- [ ] In-app messaging
- [ ] Push notifications
- [ ] AI chatbot
- [ ] Dispute resolution
- [ ] Analytics endpoints

### Phase 3: Growth Features (Weeks 9-12)
- [ ] Google Maps integration
- [ ] SMS notifications
- [ ] Error monitoring
- [ ] Advanced search
- [ ] Admin team management
- [ ] Audit logging

### Phase 4: Scale & Polish (Weeks 13+)
- [ ] Video streaming
- [ ] Background checks
- [ ] Identity verification
- [ ] Performance optimization
- [ ] Mobile app
- [ ] Advanced analytics

---

## Environment Variables Template

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# Authentication
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# Payment Processing
STRIPE_PUBLIC_KEY=pk_xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email Service
RESEND_API_KEY=re_xxx

# File Storage
BLOB_READ_WRITE_TOKEN=xxx

# AI Services
OPENAI_API_KEY=sk-xxx

# Push Notifications
ONESIGNAL_APP_ID=xxx
ONESIGNAL_APP_KEY=xxx
ONESIGNAL_USER_KEY=xxx

# Maps
GOOGLE_MAPS_API_KEY=AIzaSyxxx

# SMS
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx

# Analytics
NEXT_PUBLIC_GA_ID=G-xxx

# Monitoring
SENTRY_AUTH_TOKEN=xxx
```

---

## Frequently Asked Questions

### Q: Where do I start?
**A**: Start with `01-Portal-Workflow.md` to understand the system, then choose your backend stack using `02-API-Requirements.md`.

### Q: How many database tables do I need?
**A**: Around 40+ tables. Check `03-Database-Schema.md` for complete schema.

### Q: How many API endpoints do I need?
**A**: Around 68+ endpoints (36 POST + 50 GET). See `04-POST-Methods.md` and `05-GET-Methods.md`.

### Q: What's the minimum cost to run?
**A**: ~$60/month for MVP (database, email, storage) + payment processing fees (2.9% + $0.30 per transaction).

### Q: Can I use a different database?
**A**: Yes, but PostgreSQL is recommended. Firebase, MongoDB are alternatives but have tradeoffs.

### Q: Do I need all features from day one?
**A**: No. Follow the Phase 1-4 roadmap. Start with authentication, bookings, and payments.

### Q: How do I handle payments?
**A**: Use Stripe for both customer payments and provider payouts via Stripe Connect.

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **TypeScript Docs**: https://typescriptlang.org

---

## Last Updated
December 2024

## Version
1.0 - Complete Documentation

---

**Ready to build the full SAJI backend? Start with `01-Portal-Workflow.md` and work through the other documentation files in order!**
