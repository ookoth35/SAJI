# How Templates Become Real Data - Complete Guide

## The Problem
You see hardcoded templates in the frontend, but you want to replace them with real data from the database.

## The Solution (3 Steps)

### Step 1: API Endpoints (Already Done!)
We created backend endpoints that return real database data:
- `GET /api/bookings` → Returns all user bookings
- `GET /api/wallet/balance` → Returns wallet info
- `GET /api/users/[id]` → Returns user profile
- `GET /api/reviews` → Returns reviews

### Step 2: Create Data Hooks (SWR)
We created React hooks that fetch data from the API:

```typescript
// hooks/useBookings.ts
export function useBookings() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/bookings',  // API endpoint
    fetcher,          // function to fetch
    { revalidateOnFocus: false }
  )
  return { bookings: data?.bookings || [], isLoading, error, mutate }
}
```

### Step 3: Use Hooks in Components
Replace hardcoded data with API data:

```typescript
// OLD (hardcoded)
const recentBookings = [
  { id: 1, service: 'Cleaning', status: 'confirmed' },
  { id: 2, service: 'Plumbing', status: 'pending' },
]

// NEW (from API)
const { bookings, isLoading } = useBookings()

// In JSX
{bookings.map(booking => (
  <tr key={booking.id}>
    <td>{booking.serviceId}</td>
    <td>{booking.status}</td>
  </tr>
))}
```

## How It Works - Data Flow

```
1. User visits /dashboard
   ↓
2. useBookings() hook runs
   ↓
3. Hook calls fetch('/api/bookings')
   ↓
4. Backend queries database
   ↓
5. Database returns real booking records
   ↓
6. API returns JSON response
   ↓
7. Hook receives data and updates component
   ↓
8. Component re-renders with REAL DATA (not templates!)
```

## Current Status

### Already Updated to Use Real Data
- ✅ `/dashboard/page.tsx` - Uses useBookings() and useWallet()
- ✅ Stats dynamically calculated from real data
- ✅ Booking table shows real database records

### Still Using Hardcoded Templates (Need Update)
- 🔄 `/dashboard/bookings/page.tsx` - Needs update
- 🔄 `/dashboard/professional/page.tsx` - Needs update
- 🔄 `/dashboard/admin/page.tsx` - Needs update
- 🔄 `/dashboard/wallet/page.tsx` - Needs update
- 🔄 `/dashboard/messages/page.tsx` - Needs update

## Next Steps

To update a page with real data:

1. **Import the hook:**
```typescript
import { useBookings } from '@/hooks/useBookings'
```

2. **Use the hook in component:**
```typescript
const { bookings, isLoading, error } = useBookings()
```

3. **Replace hardcoded data:**
```typescript
// OLD
const recentBookings = [{ id: 1, ... }]
bookings.map(b => ...)

// NEW
const { bookings } = useBookings()
bookings.map(b => ...)
```

4. **Add loading state:**
```typescript
if (isLoading) return <Loader/>
if (error) return <Error/>
if (bookings.length === 0) return <Empty/>
```

## Available Hooks

```typescript
// User data
import { useProfile } from '@/hooks/useProfile'
import { useUserById } from '@/hooks/useProfile'

// Bookings
import { useBookings } from '@/hooks/useBookings'
import { useBookingById } from '@/hooks/useBookings'

// Wallet
import { useWallet } from '@/hooks/useWallet'
import { useTransactions } from '@/hooks/useWallet'

// Reviews
import { useReviews } from '@/hooks/useReviews'
import { useReviewById } from '@/hooks/useReviews'
```

## Example: Full Page Update

**Before (Hardcoded):**
```typescript
export default function BookingsPage() {
  const bookings = [
    { id: 1, service: 'Cleaning', status: 'confirmed' },
    { id: 2, service: 'Plumbing', status: 'pending' },
  ]
  
  return (
    <div>
      {bookings.map(b => (
        <div key={b.id}>{b.service}</div>
      ))}
    </div>
  )
}
```

**After (Real Data):**
```typescript
import { useBookings } from '@/hooks/useBookings'

export default function BookingsPage() {
  const { bookings, isLoading, error } = useBookings()
  
  if (isLoading) return <LoadingSpinner/>
  if (error) return <ErrorMessage/>
  if (!bookings.length) return <EmptyState/>
  
  return (
    <div>
      {bookings.map(b => (
        <div key={b.id}>{b.serviceId}</div>
      ))}
    </div>
  )
}
```

## Testing the Integration

1. **Stop dev server:** `Ctrl+C`
2. **Run migrations:** `npm run db:migrate`
3. **Seed test data:** `npm run db:seed` (we created this)
4. **Start server:** `npm run dev`
5. **Visit `/dashboard`** - Should show real data from database!

## What Happens When You Create Data

1. User enters data in form (e.g., books a service)
2. Form submits to API (`POST /api/bookings`)
3. API validates data
4. API stores in database
5. Hook automatically fetches updated data
6. Component re-renders with new data!

## Key Concepts

- **SWR** = "Stale While Revalidate" - Fetches fresh data while showing cached data
- **Hook** = Reusable function to fetch data
- **Mutate** = Refresh data manually if needed
- **Revalidate** = Update data from server

## Common Patterns

### Refresh data after creating something:
```typescript
const { bookings, mutate } = useBookings()

async function createBooking(data) {
  await fetch('/api/bookings', { method: 'POST', body: JSON.stringify(data) })
  mutate() // Refresh the list
}
```

### Filter data in component:
```typescript
const { bookings } = useBookings()
const pending = bookings.filter(b => b.status === 'pending')
```

### Combine multiple hooks:
```typescript
const { user } = useProfile()
const { bookings } = useBookings()
const { wallet } = useWallet()
```

---

## Summary

Templates disappear when you:
1. ✅ Create API endpoints (DONE)
2. ✅ Create React hooks (DONE)
3. ⏳ Update components to use hooks (IN PROGRESS - you can do this now!)

The dashboard homepage is already updated. Other pages will auto-update when you apply the same pattern!
