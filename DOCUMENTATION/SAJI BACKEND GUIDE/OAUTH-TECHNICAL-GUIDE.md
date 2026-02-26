# OAuth Account Flow - Technical Deep Dive

## How User Signup with Google/Apple Works

### The Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SAJI Authentication Flow                  │
└─────────────────────────────────────────────────────────────┘

START: User at /auth/signup
  │
  ├─→ Clicks "Sign up with Google"
  │   │
  │   ├─→ Redirects to: /api/auth/signin?callbackUrl=/auth/complete-profile&provider=google
  │   │
  │   ├─→ Redirects to Google OAuth endpoint
  │   │
  │   ├─→ User authenticates with Google
  │   │
  │   ├─→ User grants SAJI permissions
  │   │
  │   ├─→ Google sends back code
  │   │
  │   ├─→ SAJI backend exchanges code for tokens + user data
  │   │
  │   └─→ NextAuth calls signIn callback
  │
  ├─→ INSIDE signIn CALLBACK:
  │   │
  │   ├─→ Check if user exists by email
  │   │
  │   ├─→ IF NEW USER:
  │   │   ├─→ Create user record with:
  │   │   │   - email (from Google)
  │   │   │   - firstName, lastName (from Google)
  │   │   │   - profileImage (from Google)
  │   │   │   - googleId (from provider)
  │   │   │   - oauthProvider = "google"
  │   │   │   - isEmailVerified = true
  │   │   └─→ Create oauthAccounts record with tokens
  │   │
  │   ├─→ IF EXISTING USER:
  │   │   ├─→ Link Google account to existing user
  │   │   ├─→ Store OAuth tokens
  │   │   ├─→ Update user oauthProvider field
  │   │   └─→ No duplicate user created
  │   │
  │   └─→ Return success
  │
  └─→ Redirect to: /auth/complete-profile
      │
      └─→ User sees:
          - Email: pre-filled (from Google)
          - Name: pre-filled (from Google)
          - Profile image: from Google
          - Form for: Phone, Role, Bio
          │
          └─→ User fills form and submits
              │
              └─→ POST /api/users/complete-profile
                  │
                  ├─→ Update user record with phone, role, bio
                  ├─→ Set profileCompletedAt timestamp
                  └─→ Redirect to /dashboard
                      │
                      └─→ ACCOUNT COMPLETE ✅
```

---

## Key Points About OAuth Implementation

### 1. Data Flow

**From Google OAuth**
```javascript
{
  id: "google_user_id_12345",        // Becomes googleId
  email: "user@gmail.com",           // Becomes user email
  name: "John Doe",                  // Split into firstName/lastName
  image: "https://...profile.jpg",   // Becomes profileImage
  email_verified: true               // Becomes isEmailVerified
}
```

**Stored in SAJI Database**
```
users table:
- email: user@gmail.com
- firstName: John
- lastName: Doe
- profileImage: https://...jpg
- googleId: google_user_id_12345
- oauthProvider: "google"
- isEmailVerified: true

oauth_accounts table:
- userId: 1 (references users.id)
- provider: "google"
- providerAccountId: google_user_id_12345
- accessToken: encrypted_token
- refreshToken: encrypted_refresh
- expiresAt: 1234567890
```

### 2. Profile Completion Workflow

After OAuth, user is NOT fully registered. Here's why:

- ✅ Name, email, image available from provider
- ✅ Email verification done by provider
- ❌ Phone number unknown
- ❌ Service type (client/professional) unknown
- ❌ Bio/description not available

**Profile completion fills the gaps:**

```typescript
POST /api/users/complete-profile
{
  firstName: "John",        // Pre-filled from Google
  lastName: "Doe",          // Pre-filled from Google
  phone: "+254712345678",   // User provides
  role: "professional",     // User selects
  bio: "10 years experience..." // User provides
}
```

### 3. Multiple OAuth Providers

Users can link multiple providers to one account:

**Scenario 1: Signup with Google**
```
1. User signs up via Google with email@example.com
2. Account created with googleId set
3. User has profile linked to Google
```

**Scenario 2: Later Login with Apple**
```
1. Same user tries to sign in with Apple
2. Uses same email@example.com
3. System finds existing user
4. Links Apple account to same user
5. User now has both googleId AND appleId
6. Can login with either provider
```

**Scenario 3: Account Linking**
```
User can intentionally link multiple accounts:
- Start with Google
- Go to settings
- "Link Apple Account"
- Authenticate with Apple
- Both providers now work for this account
```

### 4. Session Management

**What happens after profile completion:**

```javascript
// User gets JWT token valid for 7 days
const session = {
  user: {
    id: 1,
    email: "user@gmail.com",
    name: "John Doe",
    image: "profile.jpg",
    role: "professional"  // From profile
  },
  expires: "2025-03-01T12:00:00Z"
}

// Token stored in NextAuth session
// Used for authenticated API calls
// Automatically refreshed when needed
```

### 5. Security: How OAuth Tokens Are Protected

```typescript
// Tokens stored in oauth_accounts table
oauth_accounts {
  accessToken: "encrypted_value",   // Stored encrypted
  refreshToken: "encrypted_value",  // Stored encrypted
  expiresAt: 1234567890,           // When to refresh
  idToken: "encrypted_value",       // JWT from provider
}

// When user makes API call:
GET /api/bookings
  Authorization: Bearer eyJhbGc...  // NextAuth JWT
  
// NextAuth verifies JWT is valid
// Then API checks user role/permissions
// OAuth tokens only used for refresh
```

---

## Account Scenarios

### Scenario A: Complete New Signup (OAuth)

```
Time  Action                           Database State
────  ────────────────────────────     ──────────────
0s    User clicks "Google Sign Up"    (nothing yet)
       │
1s    Google authentication           (nothing yet)
       │
2s    Google sends code back          (nothing yet)
       │
3s    SAJI exchanges code for tokens  NEW: oauth_accounts created
       │                              NEW: user created
       │
4s    User redirected to              users table shows:
      /auth/complete-profile          - email: verified
                                      - firstName: from Google
                                      - googleId: set
                                      - profileCompletedAt: NULL
                                      
5s    User fills profile form         (form state only)
       │
6s    POST /api/users/complete-profile users.profileCompletedAt = NOW()
       │                              users.phone = "712345678"
       │                              users.role = "professional"
       │                              users.bio = "..."
       │
7s    Redirect to /dashboard          READY FOR USE ✅
```

### Scenario B: Existing User + New OAuth

```
Time  Action                           Database State
────  ────────────────────────────     ──────────────
0s    User signs in with Apple        exists: users table with Apple
       │
1s    Apple authentication            exists: oauth_accounts (apple)
       │
2s    Apple sends back code           exists: oauth_accounts (apple)
       │
3s    SAJI exchanges code             NEW: oauth_accounts (google)
       │                              UPDATED: users.googleId set
       │
4s    User sees "Complete Profile?"   ALREADY COMPLETE, so auto-skip
       │
5s    Redirect to /dashboard          Users table now has:
                                      - appleId: set
                                      - googleId: set
                                      - Can use either to login
```

---

## Code Examples

### Google Sign Up Button

```jsx
<form action={async () => {
  "use server";
  await signIn("google", { redirectTo: "/auth/complete-profile" });
}}>
  <button type="submit">Sign up with Google</button>
</form>

// When clicked:
// 1. Calls signIn("google")
// 2. Redirects to Google OAuth
// 3. After auth, calls NextAuth callback
// 4. Creates user if new
// 5. Redirects to /auth/complete-profile
```

### Complete Profile API

```typescript
// POST /api/users/complete-profile
{
  firstName: "John",
  lastName: "Doe",
  phone: "+254712345678",
  role: "professional",
  bio: "Experienced plumber"
}

// Response
{
  message: "Profile updated successfully",
  user: {
    id: 1,
    email: "john@gmail.com",
    firstName: "John",
    lastName: "Doe",
    phone: "+254712345678",
    role: "professional",
    bio: "Experienced plumber"
  }
}
```

### Check Current Session

```typescript
// In any API route or page component
const session = await auth();

if (session?.user?.email) {
  // User is logged in
  console.log("Current user:", session.user.email);
} else {
  // Not logged in
  redirect("/auth/signin");
}
```

---

## Database View

### Sample Data After Setup

```sql
-- users table
SELECT * FROM users WHERE id = 1;
┌────┬─────────────────┬───────────┬──────────┬──────────┬────────────┬────────────┬─────────────────────────────────────┐
│ id │ email           │ firstName │ lastName │ googleId │ appleId    │ role       │ profileCompletedAt                  │
├────┼─────────────────┼───────────┼──────────┼──────────┼────────────┼────────────┼─────────────────────────────────────┤
│ 1  │ john@gmail.com  │ John      │ Doe      │ goog_123 │ NULL       │ professional │ 2025-02-22 10:30:45.123456+00:00 │
└────┴─────────────────┴───────────┴──────────┴──────────┴────────────┴────────────┴─────────────────────────────────────┘

-- oauth_accounts table
SELECT * FROM oauth_accounts WHERE user_id = 1;
┌────┬─────────┬──────────┬─────────────────────────────┬──────────────────────────┬─────────────────────────────┐
│ id │ user_id │ provider │ provider_account_id         │ access_token             │ refresh_token               │
├────┼─────────┼──────────┼─────────────────────────────┼──────────────────────────┼─────────────────────────────┤
│ 1  │ 1       │ google   │ goog_123                    │ encrypted_access_token   │ encrypted_refresh_token     │
└────┴─────────┴──────────┴─────────────────────────────┴──────────────────────────┴─────────────────────────────┘
```

---

## Common Questions

**Q: What if user signs up with Google, then tries email login?**
A: They can't. Password wasn't set. They must use "Sign up" form to create email/password account OR use Google login again.

**Q: What if user signs up with Google and Apple with different emails?**
A: Two separate accounts created (one for each email). This is expected behavior.

**Q: What if user signs up with Google using email@gmail.com, then tries to signup with Apple using email@gmail.com?**
A: Same person, same email → accounts automatically linked. Single account with both OAuth providers.

**Q: Are OAuth tokens stored in user's browser?**
A: No. Tokens stored securely in database. Browser gets JWT session token instead.

**Q: What happens when OAuth token expires?**
A: NextAuth automatically refreshes it using refreshToken. User doesn't notice.

---

## Ready to Deploy

Your OAuth system is now:
- ✅ Fully configured
- ✅ Database schema ready
- ✅ User flow documented
- ✅ API endpoints built
- ✅ Pages created
- ✅ Secure by default

Just need:
1. Google OAuth credentials
2. Apple OAuth credentials
3. Environment variables set
4. One test signup to verify

Then you're live!
