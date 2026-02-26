# Phase 2 & 3 Implementation Guide: Complete Backend + Frontend

## Overview

This guide covers the complete implementation of Phase 2 (Advanced Backend Features) and Phase 3 (Frontend Integration) with NextAuth OAuth (Google & Apple), comprehensive API endpoints, and user dashboards.

---

## Part 1: Authentication System

### NextAuth Configuration

**Location**: `/lib/auth/nextauth-config.ts`

The authentication system supports three providers:
1. **Google OAuth** - Easiest for users with Google accounts
2. **Apple OAuth** - For Apple ecosystem users  
3. **Credentials** - Traditional email/password authentication

**Key Features**:
- Automatic user creation on first OAuth login
- Profile auto-population from OAuth providers
- OAuth account linking for existing users
- JWT token management with 7-day expiry
- Role-based access control (admin, sub_admin, client, professional, shopkeeper)

### Environment Variables Required

```
# OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret

# NextAuth Configuration
NEXTAUTH_SECRET=generate_with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=your_neon_database_url
```

### OAuth Setup Instructions

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable OAuth 2.0 API
4. Create OAuth 2.0 Credentials (OAuth Client ID)
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

#### Apple OAuth Setup
1. Go to [Apple Developer](https://developer.apple.com)
2. Register your app in App Store Connect
3. Create App ID
4. Create Service ID for OAuth
5. Configure private email relay
6. Get credentials for NextAuth

### Authentication Pages

1. **Sign In** (`/auth/signin`)
   - Google/Apple login buttons
   - Email/password login form
   - Redirects to dashboard on success

2. **Sign Up** (`/auth/signup`)
   - 2-step signup process
   - Google/Apple OAuth
   - Email/password registration
   - Auto-redirect to complete profile

3. **Complete Profile** (`/auth/complete-profile`)
   - First/Last name
   - Phone number
   - Role selection (Client, Professional, Shopkeeper)
   - Optional bio
   - Required for OAuth users

---

## Part 2: Database Schema Extensions

### New OAuth Tables

```typescript
// OAuth Accounts - Store provider credentials
oauthAccounts {
  id, userId, provider, providerAccountId, 
  accessToken, refreshToken, expiresAt, 
  tokenType, scope, idToken, createdAt, updatedAt
}

// OAuth Sessions - Track user sessions
oauthSessions {
  id, userId, sessionToken, expiresAt, createdAt
}
```

### Updated Users Table

Added OAuth fields:
- `googleId` - Google provider ID
- `appleId` - Apple provider ID  
- `oauthProvider` - Which provider was used
- `profileCompletedAt` - When user completed profile
- Made `firstName`, `lastName`, `password` optional (for OAuth users)

---

## Part 3: API Endpoints (50+)

### Authentication Endpoints
- `POST /api/auth/signup` - Create account with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/[...nextauth]` - NextAuth OAuth handlers
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout (handled by NextAuth)

### User Management (8 endpoints)
- `GET /api/users/search` - Search users by name/email/role
- `GET /api/users/[id]` - Get specific user details
- `POST /api/users/complete-profile` - Complete OAuth profile
- `PUT /api/users/[id]` - Update user information
- `GET /api/users/recommendations` - Get recommended professionals
- `POST /api/users/[id]/follow` - Follow a professional
- `GET /api/users/[id]/followers` - Get user's followers
- `DELETE /api/users/[id]` - Deactivate account

### Professional Management (8 endpoints)
- `GET /api/professionals` - List all professionals (searchable, filterable)
- `POST /api/professionals` - Create professional profile
- `GET /api/professionals/[id]` - Get professional details with portfolio
- `PUT /api/professionals/[id]` - Update professional profile
- `POST /api/professionals/[id]/availability` - Set availability schedule
- `GET /api/professionals/[id]/bookings` - Get professional's bookings
- `GET /api/professionals/categories` - List service categories
- `POST /api/professionals/[id]/verify` - Request verification

### Reviews & Ratings (6 endpoints)
- `POST /api/reviews` - Create review after booking
- `GET /api/reviews` - Get reviews (by professional, booking, or user)
- `PUT /api/reviews/[id]` - Edit own review
- `DELETE /api/reviews/[id]` - Delete own review
- `GET /api/professionals/[id]/rating-summary` - Get rating statistics
- `POST /api/reviews/[id]/helpful` - Mark review as helpful

### Messaging System (5 endpoints)
- `POST /api/messages` - Send message
- `GET /api/messages` - Get messages in conversation
- `GET /api/messages/conversations` - List all conversations
- `PUT /api/messages/[id]/read` - Mark message as read
- `DELETE /api/messages/[id]` - Delete message

### Booking Management (5 endpoints)
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - List user's bookings
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking status (reschedule/cancel)
- `DELETE /api/bookings/[id]` - Cancel booking (soft delete)

### Wallet & Balance (6 endpoints)
- `GET /api/wallet/balance` - Get current balance
- `POST /api/wallet/topup` - Add funds to wallet
- `POST /api/wallet/withdraw` - Withdraw funds
- `GET /api/wallet/transactions` - Transaction history
- `POST /api/wallet/transfer` - Transfer funds between users
- `GET /api/wallet/refunds` - Get pending refunds

### Payment Processing (8 endpoints)
- `POST /api/payments/initialize` - Start payment process
- `POST /api/payments/mpesa/callback` - M-Pesa webhook callback
- `POST /api/payments/airtel/callback` - Airtel webhook callback
- `GET /api/payments` - Get user's payment history
- `GET /api/payments/[id]` - Get payment details
- `POST /api/payments/[id]/refund` - Request refund
- `GET /api/payments/pending` - Get pending payments
- `POST /api/payments/verify` - Verify payment status

### Admin Dashboard & Management (12 endpoints)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - List all users (paginated)
- `PUT /api/admin/users` - Update user role/status
- `GET /api/admin/bookings` - List all bookings
- `PUT /api/admin/bookings` - Update booking status
- `GET /api/admin/payments` - Payment analytics
- `GET /api/admin/reports/revenue` - Revenue reports
- `GET /api/admin/reports/activity` - Activity analytics
- `POST /api/admin/users/[id]/suspend` - Suspend user account
- `POST /api/admin/users/[id]/restore` - Restore suspended account
- `GET /api/admin/verification-requests` - Pending verifications
- `PUT /api/admin/verification-requests/[id]` - Approve/reject verification

### Services Management (6 endpoints)
- `GET /api/services` - Search services by category
- `POST /api/services` - Create new service listing
- `GET /api/services/[id]` - Get service details
- `PUT /api/services/[id]` - Update service information
- `DELETE /api/services/[id]` - Archive service
- `GET /api/services/categories` - List all categories

---

## Part 4: Frontend Components

### Authentication Components
- `AuthProvider` - Context for authentication state
- `SignIn` - Sign in page with OAuth buttons
- `SignUp` - Sign up with 2-step form
- `CompleteProfile` - Profile completion after OAuth

### Dashboard Components (Phase 3)
- **Client Dashboard**
  - Browse professionals & services
  - Make bookings
  - View booking history
  - Leave reviews
  - Manage wallet

- **Professional Dashboard**
  - Manage services & availability
  - View bookings & calendar
  - Respond to messages
  - Track ratings & reviews
  - Manage earnings

- **Admin Dashboard**
  - User management
  - Booking oversight
  - Payment tracking
  - Verification requests
  - Revenue analytics

---

## Part 5: Security Implementation

### OAuth Security
- CSRF protection via state parameter
- Secure callback handling
- Token validation
- Encrypted refresh tokens

### API Security
- JWT authentication required for protected routes
- Role-based access control checks
- Request validation with Zod schemas
- SQL injection prevention (Drizzle ORM)
- Rate limiting on auth endpoints
- HTTPS enforcement in production

### Data Security
- Password hashing with bcrypt (10 rounds)
- Sensitive data encryption
- GDPR compliance ready
- Audit logging for admin actions
- Secure session management

---

## Part 6: Setup Checklist

- [ ] Get OAuth credentials (Google & Apple)
- [ ] Set up Neon PostgreSQL database
- [ ] Add environment variables
- [ ] Run database migrations
- [ ] Test OAuth signup/login flows
- [ ] Verify profile completion process
- [ ] Test API endpoints with Postman/Insomnia
- [ ] Set up payment webhooks (M-Pesa & Airtel)
- [ ] Configure email service (Resend)
- [ ] Deploy to Vercel
- [ ] Configure production OAuth redirect URIs
- [ ] Set up monitoring & logging
- [ ] Create admin accounts for dashboard access

---

## Part 7: Testing Workflows

### User Signup Flow
1. User visits `/auth/signup`
2. Clicks "Sign up with Google"
3. Authenticates with Google
4. Redirected to `/auth/complete-profile`
5. Fills in profile information
6. Redirected to dashboard

### OAuth Integration Flow
1. System creates user from OAuth data
2. Stores OAuth credentials securely
3. Allows linking multiple OAuth providers
4. Auto-fills profile from provider

### Booking Flow
1. Client searches for professionals
2. Views professional profile & reviews
3. Creates booking with date/time
4. Initiates payment
5. Professional receives notification via message
6. After completion, can leave review

### Admin Oversight
1. Admin logs in to dashboard
2. Views real-time statistics
3. Manages users & bookings
4. Processes verification requests
5. Monitors payments & revenue
6. Generates reports

---

## Part 8: Performance Optimization

- Database query optimization with proper indexing
- Pagination for large datasets
- Caching with Redis (optional upgrade)
- Image optimization
- Code splitting for auth components
- Lazy loading for dashboards

---

## Part 9: Monitoring & Maintenance

### Logging
- Authentication events
- API request tracking
- Error logging
- Payment webhook logging
- Admin action audit trail

### Alerts
- Failed login attempts
- Payment failures
- OAuth connection issues
- Database errors
- System performance

---

## Next Steps After Deployment

1. **Collect Feedback** - Get user feedback on flows
2. **Optimize Performance** - Monitor and optimize slow queries
3. **Add Analytics** - Track user behavior
4. **Implement Notifications** - Email/SMS for bookings
5. **Expand Integrations** - Add more payment methods
6. **Scale Infrastructure** - CDN, load balancing if needed
7. **Mobile App** - Consider native iOS/Android apps

---

This completes the full Phase 2 & 3 implementation with production-ready authentication, comprehensive APIs, and frontend readiness for user dashboards.
