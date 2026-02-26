# SAJI Platform - GET Methods Documentation

## Overview
This document lists all pages and features that require GET methods to fetch data from the database. Each entry includes the endpoint, query parameters, response structure, and database tables involved.

---

## Authentication & User Management

### 1. **Get Current User Profile**
- **Pages**: All authenticated pages
- **Endpoint**: `GET /api/user` or `GET /api/user/:id`
- **Database Tables**: `users`, role-specific tables (customers, providers, providers, team_members)
- **Query Params**: None for current user
- **Response**:
```json
{
  "id": "user_uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "profile_picture_url": "url",
  "role": "customer",
  "bio": "Bio text",
  "is_verified": true,
  "created_at": "2024-01-01T00:00:00Z",
  "profile": {
    // Role-specific data
    "total_spent": 5000,
    "total_bookings": 25
  }
}
```
- **Cache**: 5 minutes

---

### 2. **Get User by ID** (Admin view)
- **Page**: `/admin/users` (detail view)
- **Endpoint**: `GET /api/admin/users/:id`
- **Database Tables**: `users`, related tables
- **Query Params**: None
- **Response**: Full user profile with all details, verification status, account status
- **Cache**: 2 minutes

---

### 3. **Verify Session Token**
- **Pages**: All
- **Endpoint**: `GET /api/auth/verify`
- **Database Tables**: `sessions`
- **Query Params**: token (in header)
- **Response**:
```json
{
  "valid": true,
  "user_id": "user_uuid",
  "expires_at": "2024-12-31T00:00:00Z"
}
```
- **Cache**: No cache (security-sensitive)

---

## Payment & Transactions (Kenya-Focused)

### 4. **Get Payment Methods**
- **Page**: `/customer/payment-settings`, `/checkout`
- **Endpoint**: `GET /api/payment-methods`
- **Database Tables**: `payment_methods`
- **Query Params**: None
- **Response**:
```json
{
  "payment_methods": [
    {
      "id": "uuid",
      "payment_method": "mpesa",
      "phone_number": "254712****",
      "is_default": true,
      "is_verified": true,
      "last_used_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "payment_method": "airtel_money",
      "phone_number": "254714****",
      "is_default": false,
      "is_verified": true,
      "last_used_at": "2024-01-10T14:20:00Z"
    }
  ]
}
```
- **Cache**: 5 minutes

---

### 5. **Get Payment History**
- **Page**: `/customer/transactions`, `/customer/wallet/history`
- **Endpoint**: `GET /api/payments/history`
- **Database Tables**: `payments`, `orders`
- **Query Params**:
```
?status=all|pending|completed|failed
&payment_method=all|mpesa|airtel_money|bank
&start_date=2024-01-01
&end_date=2024-01-31
&page=1
&limit=20
```
- **Response**:
```json
{
  "payments": [
    {
      "id": "payment_uuid",
      "order_id": "order_uuid",
      "amount": 5000,
      "currency": "KES",
      "payment_method": "mpesa",
      "status": "completed",
      "transaction_reference": "RFP711V6Z0K1",
      "paid_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 15,
  "page": 1
}
```
- **Cache**: 2 minutes

---

### 6. **Get Payment Status**
- **Page**: `/checkout` (real-time check)
- **Endpoint**: `GET /api/payments/:payment_id/status`
- **Database Tables**: `payments`
- **Query Params**: None
- **Response**:
```json
{
  "id": "payment_uuid",
  "status": "completed",
  "amount": 5000,
  "currency": "KES",
  "payment_method": "mpesa",
  "mpesa_receipt_number": "RFP711V6Z0K1",
  "completed_at": "2024-01-15T10:30:00Z"
}
```
- **Cache**: No cache (real-time)

---

### 7. **Get Invoices**
- **Page**: `/customer/invoices`
- **Endpoint**: `GET /api/invoices`
- **Database Tables**: `invoices`, `orders`
- **Query Params**:
```
?status=all|draft|issued|paid
&page=1
&limit=20
```
- **Response**:
```json
{
  "invoices": [
    {
      "id": "invoice_uuid",
      "invoice_number": "INV-2024-001",
      "order_id": "order_uuid",
      "amount": 5000,
      "currency": "KES",
      "status": "paid",
      "issue_date": "2024-01-15T00:00:00Z",
      "due_date": "2024-01-20T00:00:00Z"
    }
  ]
}
```
- **Cache**: 5 minutes

---

## Customer Portal

### 8. **Browse Services**
- **Page**: `/customer/services` or `/customer/find-specialists`
- **Endpoint**: `GET /api/services`
- **Database Tables**: `services`, `providers`, `provider_reviews`
- **Query Params**:
```
?category_id=uuid
&search=keyword
&min_price=0
&max_price=1000
&rating_min=3
&sort_by=rating|price|popular
&page=1
&limit=20
```
- **Response**:
```json
{
  "total": 150,
  "page": 1,
  "limit": 20,
  "services": [
    {
      "id": "service_uuid",
      "name": "Web Design",
      "provider_id": "provider_uuid",
      "provider_name": "John's Design Studio",
      "provider_rating": 4.8,
      "price": 500,
      "duration_minutes": 480,
      "category": "Design",
      "image_url": "url",
      "reviews_count": 42,
      "available_slots": 5
    }
  ]
}
```
- **Cache**: 10 minutes

---

### 5. **Get Service Details**
- **Page**: `/customer/services/[id]`
- **Endpoint**: `GET /api/services/:id`
- **Database Tables**: `services`, `providers`, `provider_reviews`, `provider_skills`
- **Response**:
```json
{
  "id": "service_uuid",
  "name": "Web Design",
  "description": "Full service...",
  "price": 500,
  "duration_minutes": 480,
  "provider": {
    "id": "provider_uuid",
    "name": "John Doe",
    "rating": 4.8,
    "reviews": 42,
    "response_time_minutes": 30,
    "skills": ["HTML", "CSS", "React"],
    "certifications": [...]
  },
  "reviews": [
    {
      "author": "Jane Smith",
      "rating": 5,
      "text": "Excellent work!",
      "date": "2024-01-15"
    }
  ],
  "availability": [
    { "date": "2024-12-25", "slots": ["09:00", "10:00", "14:00"] }
  ]
}
```
- **Cache**: 15 minutes

---

### 6. **Get Customer Bookings**
- **Page**: `/customer/jobs`
- **Endpoint**: `GET /api/bookings`
- **Database Tables**: `bookings`, `services`, `providers`, `payments`
- **Query Params**:
```
?status=pending|accepted|in_progress|completed|cancelled
&sort_by=recent|upcoming|past
&page=1
&limit=10
```
- **Response**:
```json
{
  "total": 45,
  "bookings": [
    {
      "id": "booking_uuid",
      "booking_number": "BK001234",
      "service_name": "Web Design",
      "provider_name": "John Doe",
      "scheduled_date": "2024-12-25",
      "scheduled_time": "10:00",
      "status": "confirmed",
      "total_amount": 500,
      "payment_status": "paid",
      "provider_rating": 4.8
    }
  ]
}
```
- **Cache**: 5 minutes

---

### 7. **Get Booking Details**
- **Page**: `/customer/booking-confirmation`
- **Endpoint**: `GET /api/bookings/:id`
- **Database Tables**: `bookings`, `services`, `providers`, `payments`, `messages`
- **Response**: Full booking details, provider info, payment info, messages
- **Cache**: 2 minutes

---

### 8. **Get Saved Addresses**
- **Page**: `/customer/saved-addresses`
- **Endpoint**: `GET /api/addresses`
- **Database Tables**: `saved_addresses`
- **Response**:
```json
{
  "addresses": [
    {
      "id": "address_uuid",
      "label": "home",
      "address_line_1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "is_default": true
    }
  ]
}
```
- **Cache**: 30 minutes

---

### 9. **Get Customer Favorites**
- **Page**: `/customer/favorites`
- **Endpoint**: `GET /api/favorites`
- **Database Tables**: `favorites`, `services`, `providers`
- **Response**:
```json
{
  "providers": [
    {
      "id": "provider_uuid",
      "name": "John Doe",
      "rating": 4.8,
      "reviews": 42,
      "image": "url"
    }
  ],
  "services": [
    {
      "id": "service_uuid",
      "name": "Web Design",
      "provider_name": "Jane Smith",
      "price": 500
    }
  ]
}
```
- **Cache**: 10 minutes

---

### 10. **Get Customer Wallet**
- **Page**: `/customer/wallet`
- **Endpoint**: `GET /api/wallet`
- **Database Tables**: `wallets`, `wallet_transactions`, `payouts`
- **Response**:
```json
{
  "balance": 1500.00,
  "currency": "USD",
  "total_earned": 0,
  "total_spent": 3500.00,
  "transactions": [
    {
      "id": "transaction_uuid",
      "type": "debit",
      "amount": 500.00,
      "description": "Booking payment",
      "date": "2024-12-01"
    }
  ]
}
```
- **Cache**: 2 minutes

---

### 11. **Get Notifications**
- **Page**: `/customer/notifications`
- **Endpoint**: `GET /api/notifications`
- **Database Tables**: `notifications` (new table needed)
- **Query Params**:
```
?unread_only=false
&type=booking|message|review|payment
&page=1
&limit=20
```
- **Response**:
```json
{
  "unread_count": 5,
  "notifications": [
    {
      "id": "notification_uuid",
      "type": "booking",
      "title": "Your booking is confirmed",
      "message": "John accepted your booking for Dec 25",
      "is_read": false,
      "created_at": "2024-12-01T10:00:00Z"
    }
  ]
}
```
- **Cache**: No cache (real-time)

---

### 9. **Get Provider Earnings & Payouts**
- **Page**: `/provider/earnings`
- **Endpoint**: `GET /api/provider/earnings`
- **Database Tables**: `orders`, `payments`, `payouts`, `wallet_transactions`
- **Query Params**:
```
?period=today|week|month|all
&start_date=2024-01-01
&end_date=2024-01-31
```
- **Response**:
```json
{
  "total_earnings": 150000,
  "total_pending": 25000,
  "total_paid": 125000,
  "pending_payouts": [
    {
      "id": "payout_uuid",
      "amount": 25000,
      "currency": "KES",
      "status": "pending_approval",
      "requested_at": "2024-01-15T10:30:00Z"
    }
  ],
  "completed_payouts": [
    {
      "id": "payout_uuid",
      "amount": 50000,
      "currency": "KES",
      "status": "completed",
      "payout_method": "mpesa",
      "completed_at": "2024-01-14T16:45:00Z",
      "transaction_id": "RFP711V6Z0K1"
    }
  ],
  "earnings_breakdown": {
    "completed_orders": 75000,
    "referral_bonus": 10000,
    "platform_credit": 5000
  }
}
```
- **Cache**: 5 minutes

---

### 10. **Get Payout Methods**
- **Page**: `/provider/earnings/payout-settings`
- **Endpoint**: `GET /api/provider/payout-methods`
- **Database Tables**: `payment_methods`
- **Query Params**: None
- **Response**:
```json
{
  "payout_methods": [
    {
      "id": "uuid",
      "payment_method": "mpesa",
      "phone_number": "254712****",
      "is_default": true,
      "is_verified": true,
      "bank_name": null
    },
    {
      "id": "uuid",
      "payment_method": "bank_transfer",
      "bank_name": "Equity Bank",
      "account_number": "****6789",
      "is_default": false,
      "is_verified": true
    }
  ]
}
```
- **Cache**: 5 minutes

---

### 11. **Get Payout History**
- **Page**: `/provider/earnings/payout-history`
- **Endpoint**: `GET /api/provider/payouts/history`
- **Database Tables**: `payouts`
- **Query Params**:
```
?status=all|pending|completed|failed
&start_date=2024-01-01
&end_date=2024-01-31
&page=1
&limit=20
```
- **Response**:
```json
{
  "payouts": [
    {
      "id": "payout_uuid",
      "amount": 50000,
      "currency": "KES",
      "payout_method": "mpesa",
      "status": "completed",
      "transaction_id": "RFP711V6Z0K1",
      "phone_number": "254712****",
      "completed_at": "2024-01-14T16:45:00Z",
      "reason": "earnings_payout"
    }
  ],
  "total": 5,
  "page": 1
}
```
- **Cache**: 5 minutes

---

### 12. **Get Pending Payout Requests**
- **Page**: `/admin/payouts` (for admin review)
- **Endpoint**: `GET /api/admin/payouts/pending`
- **Database Tables**: `payouts`, `users`
- **Query Params**:
```
?priority=high|medium|low
&sort_by=amount_desc|date_newest
&page=1
&limit=50
```
- **Response**:
```json
{
  "pending_payouts": [
    {
      "id": "payout_uuid",
      "provider_id": "provider_uuid",
      "provider_name": "John Doe",
      "amount": 25000,
      "currency": "KES",
      "payout_method": "mpesa",
      "phone_number": "254712****",
      "status": "pending_approval",
      "requested_at": "2024-01-15T10:30:00Z",
      "priority": "high"
    }
  ],
  "total_pending_amount": 125000,
  "total_requests": 15
}
```
- **Cache**: 2 minutes

---

## Provider Portal

### 12. **Get Provider Profile**
- **Page**: `/provider/profile`
- **Endpoint**: `GET /api/provider/profile`
- **Database Tables**: `providers`, `users`, `services`, `provider_reviews`
- **Response**:
```json
{
  "profile": {
    "name": "John Doe",
    "business_name": "Design Studio",
    "years_of_experience": 5,
    "total_earnings": 15000,
    "completed_jobs": 48,
    "average_rating": 4.8,
    "total_reviews": 48,
    "services_count": 5
  },
  "reviews": [...]
}
```
- **Cache**: 5 minutes

---

### 13. **Get Provider Services**
- **Page**: `/provider/services`
- **Endpoint**: `GET /api/provider/services`
- **Database Tables**: `services`, `providers`
- **Query Params**:
```
?status=active|inactive|all
&sort_by=recent|popular|price
&page=1
&limit=10
```
- **Response**:
```json
{
  "services": [
    {
      "id": "service_uuid",
      "name": "Web Design",
      "price": 500,
      "duration_minutes": 480,
      "rating": 4.8,
      "total_bookings": 42,
      "is_available": true
    }
  ]
}
```
- **Cache**: 10 minutes

---

### 14. **Get Available Jobs**
- **Page**: `/provider/jobs`
- **Endpoint**: `GET /api/jobs/available`
- **Database Tables**: `bookings`, `customers`, `services`
- **Query Params**:
```
?date_from=2024-12-25
&date_to=2024-12-31
&sort_by=nearest|highest_pay
&page=1
```
- **Response**:
```json
{
  "available_jobs": [
    {
      "booking_id": "booking_uuid",
      "customer_name": "Jane Smith",
      "service": "Web Design",
      "scheduled_date": "2024-12-25",
      "scheduled_time": "10:00",
      "price": 500,
      "distance_km": 5
    }
  ]
}
```
- **Cache**: 2 minutes (real-time updates important)

---

### 15. **Get Provider Jobs (All)**
- **Page**: `/provider/jobs`
- **Endpoint**: `GET /api/provider/jobs`
- **Database Tables**: `bookings`, `customers`
- **Query Params**:
```
?status=accepted|in_progress|completed|cancelled
&date_from=2024-01-01
&date_to=2024-12-31
&sort_by=upcoming|recent|status
&page=1
```
- **Response**: List of bookings with status and details
- **Cache**: 5 minutes

---

### 16. **Get Provider Analytics**
- **Page**: `/provider/analytics`
- **Endpoint**: `GET /api/provider/analytics`
- **Database Tables**: `bookings`, `payments`, `provider_reviews`
- **Query Params**:
```
?period=week|month|year|custom
&start_date=2024-01-01
&end_date=2024-12-31
```
- **Response**:
```json
{
  "total_earnings": 15000,
  "total_bookings": 48,
  "completed_bookings": 45,
  "average_rating": 4.8,
  "earnings_trend": [
    { "date": "2024-01-01", "earnings": 500, "bookings": 2 }
  ],
  "top_services": [...]
}
```
- **Cache**: 30 minutes

---

### 17. **Get Provider Clients**
- **Page**: `/provider/clients`
- **Endpoint**: `GET /api/provider/clients`
- **Database Tables**: `bookings`, `customers`
- **Query Params**:
```
?search=name
&sort_by=recent|frequency
&page=1
```
- **Response**:
```json
{
  "clients": [
    {
      "id": "customer_uuid",
      "name": "Jane Smith",
      "total_bookings": 5,
      "last_booking": "2024-12-20",
      "average_rating_given": 4.9
    }
  ]
}
```
- **Cache**: 15 minutes

---

### 18. **Get Provider Availability Slots**
- **Page**: `/provider/availability`
- **Endpoint**: `GET /api/provider/availability`
- **Database Tables**: `availability`
- **Query Params**:
```
?date_from=2024-12-25
&date_to=2024-12-31
```
- **Response**:
```json
{
  "availability": [
    {
      "date": "2024-12-25",
      "slots": [
        { "time": "09:00", "is_available": true },
        { "time": "10:00", "is_available": true },
        { "time": "11:00", "is_available": false }
      ]
    }
  ]
}
```
- **Cache**: 5 minutes

---

### 19. **Get Provider Invoices**
- **Page**: `/provider/invoices`
- **Endpoint**: `GET /api/provider/invoices`
- **Database Tables**: `invoices`, `bookings`
- **Query Params**:
```
?status=pending|paid|overdue
&sort_by=recent|due_date
&page=1
```
- **Response**:
```json
{
  "invoices": [
    {
      "id": "invoice_uuid",
      "invoice_number": "INV-001",
      "client_name": "Jane Smith",
      "amount": 500,
      "due_date": "2024-12-25",
      "status": "paid"
    }
  ]
}
```
- **Cache**: 10 minutes

---

## Shopkeeper Portal

### 20. **Get Shopkeeper Dashboard**
- **Page**: `/shopkeeper`
- **Endpoint**: `GET /api/shopkeeper/dashboard`
- **Database Tables**: `products`, `orders`, `shop_reviews`
- **Response**:
```json
{
  "total_orders": 150,
  "total_sales": 5000,
  "total_customers": 45,
  "average_rating": 4.7,
  "pending_orders": 5,
  "low_stock_products": 3
}
```
- **Cache**: 5 minutes

---

### 21. **Get Products List**
- **Page**: `/shopkeeper/products`
- **Endpoint**: `GET /api/products`
- **Database Tables**: `products`, `product_categories`
- **Query Params**:
```
?shopkeeper_id=uuid
&status=active|draft|discontinued
&search=keyword
&category_id=uuid
&sort_by=recent|popular|stock
&page=1
&limit=20
```
- **Response**:
```json
{
  "total": 50,
  "products": [
    {
      "id": "product_uuid",
      "name": "Leather Wallet",
      "sku": "LW-001",
      "price": 29.99,
      "stock_quantity": 45,
      "sold": 155,
      "rating": 4.8,
      "status": "active"
    }
  ]
}
```
- **Cache**: 10 minutes

---

### 22. **Get Orders List**
- **Page**: `/shopkeeper/orders`
- **Endpoint**: `GET /api/orders`
- **Database Tables**: `orders`, `order_items`, `customers`
- **Query Params**:
```
?status=pending|confirmed|shipped|delivered|cancelled
&sort_by=recent|total_amount
&date_from=2024-01-01
&date_to=2024-12-31
&page=1
&limit=20
```
- **Response**:
```json
{
  "total": 150,
  "orders": [
    {
      "id": "order_uuid",
      "order_number": "ORD-001",
      "customer_name": "Jane Smith",
      "total_amount": 150.00,
      "status": "shipped",
      "order_date": "2024-12-01",
      "tracking_number": "TRK123456"
    }
  ]
}
```
- **Cache**: 5 minutes

---

### 23. **Get Order Details**
- **Page**: `/shopkeeper/orders` (detail view)
- **Endpoint**: `GET /api/orders/:id`
- **Database Tables**: `orders`, `order_items`, `products`, `customers`
- **Response**:
```json
{
  "order": {
    "id": "order_uuid",
    "order_number": "ORD-001",
    "customer": { "name": "Jane Smith", "email": "jane@example.com" },
    "items": [
      {
        "product_name": "Wallet",
        "quantity": 2,
        "unit_price": 29.99,
        "total": 59.98
      }
    ],
    "total_amount": 150.00,
    "shipping_address": {...},
    "payment_status": "paid",
    "tracking_number": "TRK123456"
  }
}
```
- **Cache**: 2 minutes

---

### 24. **Get Shop Analytics**
- **Page**: `/shopkeeper/analytics`
- **Endpoint**: `GET /api/shopkeeper/analytics`
- **Database Tables**: `orders`, `products`, `shop_reviews`, `promotions`
- **Query Params**:
```
?period=week|month|year|custom
&start_date=2024-01-01
&end_date=2024-12-31
```
- **Response**:
```json
{
  "total_sales": 5000,
  "total_orders": 150,
  "average_order_value": 33.33,
  "total_customers": 45,
  "repeat_customer_rate": 25,
  "sales_trend": [
    { "date": "2024-12-01", "sales": 500, "orders": 15 }
  ],
  "top_products": [...]
}
```
- **Cache**: 30 minutes

---

### 25. **Get Shop Reviews**
- **Page**: `/shopkeeper/reviews`
- **Endpoint**: `GET /api/shopkeeper/reviews`
- **Database Tables**: `shop_reviews`, `customers`
- **Query Params**:
```
?rating=1|2|3|4|5
?sort_by=recent|helpful|rating
&page=1
```
- **Response**:
```json
{
  "total_reviews": 48,
  "average_rating": 4.7,
  "rating_distribution": { "5": 35, "4": 10, "3": 2, "2": 1, "1": 0 },
  "reviews": [
    {
      "author": "Jane Smith",
      "rating": 5,
      "text": "Great quality products!",
      "date": "2024-12-01",
      "responded": false
    }
  ]
}
```
- **Cache**: 15 minutes

---

### 26. **Get Promotions**
- **Page**: `/shopkeeper/promotions`
- **Endpoint**: `GET /api/promotions`
- **Database Tables**: `promotions`
- **Query Params**:
```
?status=active|scheduled|expired|paused
&sort_by=recent|usage
&page=1
```
- **Response**:
```json
{
  "promotions": [
    {
      "id": "promotion_uuid",
      "code": "SUMMER20",
      "discount_type": "percentage",
      "discount_value": 20,
      "current_uses": 45,
      "max_uses": 100,
      "status": "active",
      "end_date": "2024-08-31"
    }
  ]
}
```
- **Cache**: 10 minutes

---

## Agent Portal

### 27. **Get Assigned Disputes**
- **Page**: `/agent/disputes`
- **Endpoint**: `GET /api/disputes`
- **Database Tables**: `disputes`, `bookings`, `orders`
- **Query Params**:
```
?status=open|under_review|resolved|escalated
?assigned_to=agent_uuid
&sort_by=priority|recent|oldest
&page=1
```
- **Response**:
```json
{
  "total": 25,
  "disputes": [
    {
      "id": "dispute_uuid",
      "dispute_number": "DSP-001",
      "complainant": "Jane Smith",
      "respondent": "John's Design Studio",
      "reason": "Service not completed",
      "status": "under_review",
      "priority": "high",
      "created_at": "2024-12-01"
    }
  ]
}
```
- **Cache**: 2 minutes

---

### 28. **Get Dispute Details**
- **Page**: `/agent/disputes` (detail view)
- **Endpoint**: `GET /api/disputes/:id`
- **Database Tables**: `disputes`, `bookings`, `messages`, `dispute_notes`
- **Response**:
```json
{
  "dispute": {
    "id": "dispute_uuid",
    "dispute_number": "DSP-001",
    "complainant": { "name": "Jane Smith", "email": "jane@example.com" },
    "respondent": { "name": "John Doe", "email": "john@example.com" },
    "reason": "Service not completed",
    "description": "...",
    "evidence": ["url1", "url2"],
    "status": "under_review",
    "priority": "high",
    "resolution_options": ["refund", "rework", "credit"],
    "communication_history": [...]
  }
}
```
- **Cache**: 2 minutes

---

### 29. **Get Agent Performance Stats**
- **Page**: `/agent/stats`
- **Endpoint**: `GET /api/agent/stats`
- **Database Tables**: `disputes`, `team_members`
- **Query Params**:
```
?period=week|month|year
&start_date=2024-01-01
&end_date=2024-12-31
```
- **Response**:
```json
{
  "total_cases": 125,
  "resolved_cases": 120,
  "resolution_rate": 96,
  "average_resolution_time_hours": 48,
  "customer_satisfaction": 4.7,
  "cases_trend": [...]
}
```
- **Cache**: 30 minutes

---

### 30. **Get Agent Leaderboard**
- **Page**: `/agent/leaderboard`
- **Endpoint**: `GET /api/leaderboard`
- **Database Tables**: `team_members`, `disputes`
- **Query Params**:
```
?period=week|month|year
&sort_by=resolved_count|satisfaction_score|speed
&page=1
```
- **Response**:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "agent_name": "Jane Smith",
      "resolved_cases": 120,
      "satisfaction_score": 4.9,
      "avg_resolution_time": 45
    }
  ]
}
```
- **Cache**: 1 hour (can be less frequent)

---

### 31. **Get Agent Commissions**
- **Page**: `/agent/commissions`
- **Endpoint**: `GET /api/agent/commissions`
- **Database Tables**: `disputes`, `commission_tiers`, `payments`
- **Query Params**:
```
?period=month|year
&start_date=2024-01-01
&end_date=2024-12-31
```
- **Response**:
```json
{
  "total_commission": 1500,
  "commission_rate": 15,
  "monthly_breakdown": [
    { "month": "December 2024", "commission": 150, "cases": 10 }
  ]
}
```
- **Cache**: 15 minutes

---

## Sub-Admin Portal

### 32. **Get Pending Verifications**
- **Page**: `/sub-admin/verifications`
- **Endpoint**: `GET /api/verifications`
- **Database Tables**: `providers`, `certifications`, `users`
- **Query Params**:
```
?status=pending|approved|rejected
&sort_by=recent|oldest
&page=1
```
- **Response**:
```json
{
  "total": 25,
  "pending": [
    {
      "id": "provider_uuid",
      "name": "John Doe",
      "business_name": "Design Studio",
      "status": "pending",
      "submitted_date": "2024-12-01",
      "documents": ["cert1.pdf", "proof1.jpg"]
    }
  ]
}
```
- **Cache**: 5 minutes

---

### 33. **Get User Reports**
- **Page**: `/sub-admin/reports`
- **Endpoint**: `GET /api/reports`
- **Database Tables**: `reports`, `users`
- **Query Params**:
```
?status=pending|investigating|actioned|dismissed
?report_type=fraud|harassment|spam|inappropriate
&sort_by=recent|priority
&page=1
```
- **Response**:
```json
{
  "total": 50,
  "reports": [
    {
      "id": "report_uuid",
      "report_number": "RPT-001",
      "reported_user": "John Doe",
      "report_type": "fraud",
      "status": "pending",
      "created_at": "2024-12-01"
    }
  ]
}
```
- **Cache**: 5 minutes

---

### 34. **Get Sub-Admin Analytics**
- **Page**: `/sub-admin/analytics`
- **Endpoint**: `GET /api/sub-admin/analytics`
- **Database Tables**: `users`, `disputes`, `reports`
- **Response**:
```json
{
  "total_users": 5000,
  "total_providers": 500,
  "total_shopkeepers": 200,
  "pending_verifications": 15,
  "open_reports": 12,
  "user_growth": [...]
}
```
- **Cache**: 30 minutes

---

## Secretary Portal

### 35. **Get Financial Dashboard**
- **Page**: `/secretary`
- **Endpoint**: `GET /api/secretary/dashboard`
- **Database Tables**: `payments`, `payouts`, `wallets`
- **Response**:
```json
{
  "total_revenue": 50000,
  "total_payouts": 40000,
  "pending_payouts": 5000,
  "account_balance": 5000,
  "transactions_today": 25
}
```
- **Cache**: 5 minutes

---

### 36. **Get Payments List**
- **Page**: `/secretary/payments`
- **Endpoint**: `GET /api/payments`
- **Database Tables**: `payments`, `users`, `bookings`, `orders`
- **Query Params**:
```
?status=pending|success|failed|refunded
&payment_type=booking|product_order|subscription
&date_from=2024-01-01
&date_to=2024-12-31
&sort_by=recent|amount
&page=1
```
- **Response**:
```json
{
  "total": 1500,
  "total_amount": 50000,
  "payments": [
    {
      "id": "payment_uuid",
      "transaction_id": "TXN-001",
      "user": "Jane Smith",
      "amount": 500,
      "status": "success",
      "date": "2024-12-01"
    }
  ]
}
```
- **Cache**: 10 minutes

---

### 37. **Get Payouts List**
- **Page**: `/secretary/payments`
- **Endpoint**: `GET /api/payouts`
- **Database Tables**: `payouts`, `users`, `wallets`
- **Query Params**:
```
?status=pending|processing|completed|failed
&sort_by=recent|amount|user
&page=1
```
- **Response**:
```json
{
  "total": 250,
  "payouts": [
    {
      "id": "payout_uuid",
      "user": "John Doe",
      "amount": 1000,
      "status": "completed",
      "requested_date": "2024-12-01",
      "processed_date": "2024-12-02"
    }
  ]
}
```
- **Cache**: 10 minutes

---

### 38. **Get Financial Analytics**
- **Page**: `/secretary/analytics`
- **Endpoint**: `GET /api/secretary/analytics`
- **Database Tables**: `payments`, `payouts`, `commission_tiers`
- **Query Params**:
```
?period=week|month|year|custom
&start_date=2024-01-01
&end_date=2024-12-31
```
- **Response**:
```json
{
  "total_revenue": 50000,
  "total_commissions": 5000,
  "total_payouts": 45000,
  "daily_breakdown": [
    { "date": "2024-12-01", "revenue": 500, "payouts": 450 }
  ]
}
```
- **Cache**: 1 hour

---

### 39. **Get Invoices List**
- **Page**: `/secretary/invoicing`
- **Endpoint**: `GET /api/invoices`
- **Database Tables**: `invoices`, `users`, `bookings`, `orders`
- **Query Params**:
```
?status=pending|paid|overdue
&sort_by=recent|due_date|amount
&page=1
```
- **Response**:
```json
{
  "total": 500,
  "invoices": [
    {
      "id": "invoice_uuid",
      "invoice_number": "INV-001",
      "client": "John Doe",
      "amount": 500,
      "due_date": "2024-12-25",
      "status": "pending"
    }
  ]
}
```
- **Cache**: 15 minutes

---

## Admin Portal

### 40. **Get Platform Dashboard**
- **Page**: `/admin`
- **Endpoint**: `GET /api/admin/dashboard`
- **Database Tables**: `users`, `bookings`, `payments`, `disputes`
- **Response**:
```json
{
  "total_users": 5000,
  "total_customers": 3000,
  "total_providers": 1000,
  "total_shopkeepers": 500,
  "monthly_revenue": 50000,
  "pending_verifications": 15,
  "open_disputes": 8
}
```
- **Cache**: 5 minutes

---

### 41. **Get Users List** (Admin)
- **Page**: `/admin/users`
- **Endpoint**: `GET /api/admin/users`
- **Database Tables**: `users`, `user_roles`
- **Query Params**:
```
?role=customer|provider|shopkeeper|admin
?status=active|suspended|deleted
?search=keyword
&sort_by=recent|alphabetic
&page=1
&limit=20
```
- **Response**:
```json
{
  "total": 5000,
  "users": [
    {
      "id": "user_uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "customer",
      "status": "active",
      "joined_date": "2024-01-01"
    }
  ]
}
```
- **Cache**: 10 minutes

---

### 42. **Get All Disputes** (Admin)
- **Page**: `/admin/disputes`
- **Endpoint**: `GET /api/admin/disputes`
- **Database Tables**: `disputes`, `users`
- **Query Params**:
```
?status=open|under_review|resolved|escalated
&sort_by=priority|recent
&page=1
```
- **Response**:
```json
{
  "total": 100,
  "disputes": [...]
}
```
- **Cache**: 5 minutes

---

### 43. **Get Commission Tiers**
- **Page**: `/admin/commissions`
- **Endpoint**: `GET /api/commission-tiers`
- **Database Tables**: `commission_tiers`
- **Response**:
```json
{
  "provider_tiers": [...],
  "shopkeeper_tiers": [...],
  "agent_tiers": [...]
}
```
- **Cache**: 1 hour

---

### 44. **Get Audit Logs**
- **Page**: `/admin/audit-log`
- **Endpoint**: `GET /api/audit-logs`
- **Database Tables**: `audit_logs`
- **Query Params**:
```
?action=create|update|delete|suspend
?entity_type=user|booking|payment|dispute
?severity=info|warning|error|critical
?date_from=2024-01-01
&date_to=2024-12-31
&sort_by=recent|severity
&page=1
```
- **Response**:
```json
{
  "total": 5000,
  "logs": [
    {
      "id": "log_uuid",
      "user": "admin@example.com",
      "action": "update",
      "entity": "user",
      "entity_id": "user_uuid",
      "severity": "info",
      "timestamp": "2024-12-01T10:00:00Z"
    }
  ]
}
```
- **Cache**: No cache (audit logs)

---

### 45. **Get Subscribers List**
- **Page**: `/admin/subscribers`
- **Endpoint**: `GET /api/subscribers`
- **Database Tables**: `email_subscribers`
- **Query Params**:
```
?status=active|unsubscribed
?search=email
&sort_by=recent|subscriber_count
&page=1
```
- **Response**:
```json
{
  "total": 1000,
  "active_subscribers": 950,
  "subscribers": [
    {
      "email": "user@example.com",
      "subscribed_at": "2024-01-01",
      "status": "active"
    }
  ]
}
```
- **Cache**: 15 minutes

---

### 46. **Get Announcements**
- **Page**: `/admin/announcements`
- **Endpoint**: `GET /api/announcements`
- **Database Tables**: `announcements`
- **Query Params**:
```
?status=draft|scheduled|published|archived
&sort_by=recent|publish_date
&page=1
```
- **Response**:
```json
{
  "announcements": [
    {
      "id": "announcement_uuid",
      "title": "Maintenance Notice",
      "status": "published",
      "published_date": "2024-12-01",
      "target_roles": ["customer", "provider"]
    }
  ]
}
```
- **Cache**: 30 minutes

---

## Shared Endpoints

### 47. **Get Messages Conversation**
- **Pages**: All messaging pages
- **Endpoint**: `GET /api/messages/:conversation_id`
- **Database Tables**: `messages`
- **Query Params**:
```
?limit=50
&offset=0
&sort=ascending|descending
```
- **Response**:
```json
{
  "messages": [
    {
      "id": "message_uuid",
      "sender_id": "user_uuid",
      "sender_name": "Jane Smith",
      "message_text": "Hello!",
      "timestamp": "2024-12-01T10:00:00Z",
      "is_read": true
    }
  ]
}
```
- **Cache**: No cache (real-time)

---

### 48. **Search Users**
- **Pages**: Admin user management, provider search
- **Endpoint**: `GET /api/search/users`
- **Database Tables**: `users`
- **Query Params**:
```
?q=search_query
?role=customer|provider|shopkeeper
&limit=10
```
- **Response**:
```json
{
  "results": [
    {
      "id": "user_uuid",
      "name": "John Doe",
      "role": "provider",
      "rating": 4.8
    }
  ]
}
```
- **Cache**: 5 minutes

---

### 49. **Get Notifications Count**
- **Pages**: All (for badge)
- **Endpoint**: `GET /api/notifications/unread-count`
- **Database Tables**: `notifications`
- **Response**:
```json
{
  "unread_count": 5,
  "categories": {
    "messages": 2,
    "bookings": 2,
    "payments": 1
  }
}
```
- **Cache**: No cache (real-time)

---

### 50. **Get Help/FAQs**
- **Pages**: `/customer/help`, help sections
- **Endpoint**: `GET /api/help`
- **Database Tables**: `help_articles` (new table)
- **Query Params**:
```
?category=billing|technical|account|policies
&search=keyword
```
- **Response**:
```json
{
  "articles": [
    {
      "id": "article_uuid",
      "title": "How to book a service",
      "content": "Step-by-step guide...",
      "category": "technical"
    }
  ]
}
```
- **Cache**: 1 hour

---

## Caching Strategy Summary

| Type | Cache Duration | Pages |
|------|---|---------|
| User Profile | 5 min | All |
| Services List | 10 min | Browse, Search |
| Bookings | 5 min | Real-time needed |
| Payments | 10 min | Financial pages |
| Analytics | 30 min | Dashboard stats |
| Audit Logs | No cache | Compliance |
| Messages | No cache | Real-time |
| Notifications | No cache | Real-time |

---

## Performance Considerations
- Use pagination (limit 20-50 items per page)
- Add search and filter capabilities to large lists
- Implement lazy loading for images
- Use database indexes on frequently filtered columns
- Consider database views for complex aggregations
- Cache analytics data with 30-minute TTL
- Real-time features (messages, notifications) should not use caching

---

## Notes
- All GET endpoints require authentication (except public listings)
- Return consistent response format
- Include pagination metadata (total, page, limit)
- Use query parameters for filtering and sorting
- Implement proper error handling with meaningful error messages
- Rate limit GET endpoints to prevent abuse
- Use ETags for efficient caching
