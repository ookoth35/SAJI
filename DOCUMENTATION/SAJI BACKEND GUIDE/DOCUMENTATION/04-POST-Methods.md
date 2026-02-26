# SAJI Platform - POST Methods Documentation

## Overview
This document lists all pages and features that require POST methods to submit data to the database. Each entry includes the endpoint, payload structure, and validation requirements.

---

## Authentication & User Management

### 1. **User Registration**
- **Page**: `/auth/signup`
- **Endpoint**: `POST /api/auth/register`
- **Database Table**: `users`
- **Payload**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe",
  "phone_number": "+1234567890",
  "role": "customer" // or "provider" | "shopkeeper"
}
```
- **Validation**: Email uniqueness, password strength, phone format
- **Response**: User ID, auth token, redirect URL

---

### 2. **User Login**
- **Page**: `/auth/login`
- **Endpoint**: `POST /api/auth/login`
- **Database Table**: `sessions`
- **Payload**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "device_id": "device_fingerprint",
  "device_type": "mobile"
}
```
- **Validation**: Credentials match, account active
- **Response**: Session token, user data, redirect URL

---

### 3. **Team Member Login**
- **Page**: `/team-login`
- **Endpoint**: `POST /api/auth/team-login`
- **Database Tables**: `team_members`, `sessions`
- **Payload**:
```json
{
  "email": "agent@example.com",
  "password": "securePassword123",
  "team_role": "agent" // or "sub-admin" | "secretary"
}
```
- **Validation**: Team member exists, correct role, active account
- **Response**: Session token, team role, dashboard redirect

---

### 4. **Password Reset Request**
- **Page**: `/auth/forgot-password`
- **Endpoint**: `POST /api/auth/forgot-password`
- **Database Table**: `users`
- **Payload**:
```json
{
  "email": "user@example.com"
}
```
- **Validation**: Email exists
- **Action**: Send password reset email
- **Response**: Success message

---

### 5. **Password Reset Confirmation**
- **Page**: `/auth/reset-password`
- **Endpoint**: `POST /api/auth/reset-password`
- **Database Table**: `users`
- **Payload**:
```json
{
  "token": "reset_token_from_email",
  "new_password": "newSecurePassword123"
}
```
- **Validation**: Token valid, not expired, password strength
- **Response**: Success message

---

## Email & Subscription

### 6. **Email Subscription**
- **Component**: `EmailSubscriptionPopup`
- **Endpoint**: `POST /api/subscribers`
- **Database Table**: `email_subscribers`
- **Payload**:
```json
{
  "email": "user@example.com",
  "device_id": "device_fingerprint"
}
```
- **Validation**: Email format, duplicate check (email + device_id)
- **Response**: Subscription confirmation

---

### 7. **Send Newsletter/Campaign**
- **Page**: `/admin/subscribers`
- **Endpoint**: `POST /api/send-newsletter`
- **Database Tables**: `email_subscribers`, generates email queue
- **Payload**:
```json
{
  "subject": "Newsletter Title",
  "html_content": "<html>...</html>",
  "recipient_type": "all" // or "individual"
  "recipient_emails": ["email1@ex.com", "email2@ex.com"], // if individual
  "schedule_time": "2024-12-25T10:00:00Z" // optional
}
```
- **Validation**: Content not empty, valid HTML
- **Response**: Campaign ID, preview, send confirmation

---

## Customer Portal

### 8. **Create Booking**
- **Page**: `/customer/booking`
- **Endpoint**: `POST /api/bookings`
- **Database Tables**: `bookings`, `payments`
- **Payload**:
```json
{
  "provider_id": "provider_uuid",
  "service_id": "service_uuid",
  "scheduled_date": "2024-12-25",
  "scheduled_time": "10:30",
  "duration_minutes": 60,
  "notes": "Please bring your own tools"
}
```
- **Validation**: Service exists, provider available, date/time valid
- **Response**: Booking ID, confirmation details, payment ID

---

### 9. **Save Address**
- **Page**: `/customer/saved-addresses`
- **Endpoint**: `POST /api/addresses`
- **Database Table**: `saved_addresses`
- **Payload**:
```json
{
  "address_line_1": "123 Main St",
  "address_line_2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "label": "home",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "is_default": true
}
```
- **Validation**: Required fields present, geocoding valid
- **Response**: Address ID

---

### 10. **Add to Favorites**
- **Page**: `/customer/find-specialists` or `/customer/services`
- **Endpoint**: `POST /api/favorites`
- **Database Table**: `favorites`
- **Payload**:
```json
{
  "provider_id": "provider_uuid" // or
  "service_id": "service_uuid"
}
```
- **Validation**: Provider/service exists
- **Response**: Favorite added confirmation

---

### 11. **Submit Review**
- **Page**: `/customer/profile` (after booking completion)
- **Endpoint**: `POST /api/reviews`
- **Database Table**: `provider_reviews`
- **Payload**:
```json
{
  "booking_id": "booking_uuid",
  "provider_id": "provider_uuid",
  "rating": 5,
  "review_text": "Excellent service, very professional",
  "pros": ["punctual", "friendly", "quality"],
  "cons": ["slightly expensive"]
}
```
- **Validation**: Booking exists, completed, user is customer
- **Response**: Review saved confirmation

---

### 12. **Initiate M-Pesa Payment (Kenya)**
- **Page**: `/checkout`, `/customer/wallet`, `/orders/payment`
- **Endpoint**: `POST /api/payments/mpesa/initiate`
- **Database Tables**: `payments`, `orders`
- **Payload**:
```json
{
  "order_id": "order_uuid",
  "amount": 5000.00,
  "currency": "KES",
  "phone_number": "254712345678",
  "payment_method": "mpesa"
}
```
- **Validation**: Amount > 0, valid phone number format (+254), order exists
- **Response**: Checkout request ID, M-Pesa prompt sent, payment pending
- **Note**: Initiates STK Push to customer's phone

---

### 13. **M-Pesa Payment Callback Handler**
- **Page**: Backend webhook endpoint
- **Endpoint**: `POST /api/payments/mpesa/callback`
- **Database Tables**: `payments`, `mpesa_callbacks`, `orders`
- **Payload** (received from Daraja API):
```json
{
  "Body": {
    "stkCallback": {
      "MerchantCheckoutRequestID": "ws_CO_DMZ_xxx",
      "ResultCode": 0,
      "ResultDesc": "The service request has been processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {"Name": "Amount", "Value": 5000},
          {"Name": "MpesaReceiptNumber", "Value": "RFP711V6Z0K1"},
          {"Name": "TransactionDate", "Value": 20240115125959},
          {"Name": "PhoneNumber", "Value": "254712345678"}
        ]
      }
    }
  }
}
```
- **Validation**: Verify signature, ResultCode === 0
- **Action**: Update payment status to completed, update order, send confirmation email
- **Response**: {"ResultCode": 0}

---

### 14. **Initiate Airtel Money Payment (Kenya)**
- **Page**: `/checkout`, `/customer/wallet`, `/orders/payment`
- **Endpoint**: `POST /api/payments/airtel/initiate`
- **Database Tables**: `payments`, `orders`
- **Payload**:
```json
{
  "order_id": "order_uuid",
  "amount": 5000.00,
  "currency": "KES",
  "phone_number": "254712345678",
  "payment_method": "airtel_money"
}
```
- **Validation**: Amount > 0, valid phone number, order exists
- **Response**: Transaction ID, payment initiated
- **Note**: Sends USSD prompt or in-app notification to Airtel Money user

---

### 15. **Airtel Money Callback Handler**
- **Page**: Backend webhook endpoint
- **Endpoint**: `POST /api/payments/airtel/callback`
- **Database Tables**: `payments`, `airtel_callbacks`, `orders`
- **Payload** (received from Airtel API):
```json
{
  "transactionId": "TRANS_20240115_001",
  "status": "completed",
  "amount": 5000,
  "currency": "KES",
  "subscriber": {"phone": "254712345678"},
  "timestamp": 1705318799
}
```
- **Validation**: Verify webhook signature, status === "completed"
- **Action**: Update payment status, update order, send confirmation
- **Response**: {"ResultCode": 0}

---

### 16. **Save Payment Method**
- **Page**: `/customer/payment-settings`, `/checkout`
- **Endpoint**: `POST /api/payment-methods`
- **Database Table**: `payment_methods`
- **Payload**:
```json
{
  "payment_method": "mpesa",
  "phone_number": "254712345678",
  "is_default": true
}
```
- **Validation**: Valid phone format, method supported (mpesa/airtel_money/bank)
- **Response**: Payment method ID, saved successfully

---

### 17. **Create Bank Transfer Request**
- **Page**: `/checkout` (for large amounts)
- **Endpoint**: `POST /api/payments/bank-transfer/request`
- **Database Tables**: `payments`, `invoices`
- **Payload**:
```json
{
  "order_id": "order_uuid",
  "amount": 100000.00,
  "currency": "KES",
  "bank_name": "Equity Bank",
  "account_name": "Recipient Name",
  "account_number": "0123456789"
}
```
- **Validation**: Amount > 50000 KES, valid bank details
- **Response**: Invoice generated, bank details for transfer

---

### 18. **Create Wallet Top-Up (M-Pesa)**
- **Page**: `/customer/wallet`
- **Endpoint**: `POST /api/wallet/topup`
- **Database Tables**: `payments`, `wallets`, `wallet_transactions`
- **Payload**:
```json
{
  "amount": 10000.00,
  "currency": "KES",
  "payment_method": "mpesa",
  "phone_number": "254712345678"
}
```
- **Validation**: Amount > 0, valid phone number
- **Response**: Payment initiated, wallet credit will be added on callback

---

### 19. **Request Provider Payout (M-Pesa)**
- **Page**: `/provider/earnings`
- **Endpoint**: `POST /api/payouts/request`
- **Database Tables**: `payouts`, `wallet_transactions`
- **Payload**:
```json
{
  "amount": 50000.00,
  "currency": "KES",
  "payout_method": "mpesa",
  "phone_number": "254712345678",
  "reason": "earnings_payout"
}
```
- **Validation**: Amount available in earnings, minimum amount (e.g., 100 KES), phone valid
- **Response**: Payout request created, pending admin approval
- **Note**: Admin must approve before funds are sent

---

### 20. **Create Payout (Admin Initiated)**
- **Page**: `/admin/payouts`, `/secretary/payments`
- **Endpoint**: `POST /api/payouts/create`
- **Database Table**: `payouts`
- **Payload**:
```json
{
  "provider_id": "provider_uuid",
  "amount": 50000.00,
  "payout_method": "mpesa",
  "phone_number": "254712345678",
  "reason": "earnings_payout"
}
```
- **Validation**: Provider exists, phone registered with M-Pesa, amount available
- **Response**: Payout initiated, conversion ID returned
- **Note**: Triggers M-Pesa B2C API call to send funds

---

### 21. **Record Payout Completion**
- **Page**: Backend webhook
- **Endpoint**: `POST /api/payouts/callback`
- **Database Table**: `payouts`
- **Payload** (from M-Pesa B2C):
```json
{
  "Result": {
    "ResultCode": 0,
    "ResultDesc": "The service request has been processed successfully.",
    "ConversationID": "AG_20240115_XXXX",
    "OriginatorConversationID": "SAJI-1705318799",
    "TransactionID": "RFP711V6Z0K2"
  }
}
```
- **Validation**: ResultCode === 0
- **Action**: Update payout to completed, update provider wallet
- **Response**: {"ResultCode": 0}

---

## Provider Portal

### 22. **Create Service**
- **Page**: `/provider/services`
- **Endpoint**: `POST /api/services`
- **Database Table**: `services`
- **Payload**:
```json
{
  "name": "Web Design",
  "category_id": "category_uuid",
  "description": "Full website design...",
  "base_price": 500.00,
  "duration_minutes": 480,
  "max_clients_per_session": 1,
  "image_urls": ["url1", "url2"]
}
```
- **Validation**: Required fields, price > 0, images valid
- **Response**: Service ID

---

### 14. **Add Skill**
- **Page**: `/provider/profile/skills`
- **Endpoint**: `POST /api/skills`
- **Database Table**: `provider_skills`
- **Payload**:
```json
{
  "skill_name": "Web Development",
  "proficiency_level": "expert",
  "years_of_experience": 10
}
```
- **Validation**: Skill name not duplicate, valid proficiency level
- **Response**: Skill ID

---

### 15. **Add Certification**
- **Page**: `/provider/profile/certifications`
- **Endpoint**: `POST /api/certifications`
- **Database Table**: `certifications`
- **Payload**:
```json
{
  "certificate_name": "AWS Solutions Architect",
  "issuing_organization": "Amazon Web Services",
  "issue_date": "2023-01-15",
  "expiry_date": "2025-01-15",
  "certificate_number": "ABC123",
  "document_url": "s3://bucket/cert.pdf"
}
```
- **Validation**: Dates valid, document uploaded
- **Response**: Certification ID

---

### 16. **Set Availability**
- **Page**: `/provider/availability`
- **Endpoint**: `POST /api/availability`
- **Database Table**: `availability`
- **Payload**:
```json
{
  "day_of_week": 1, // Monday
  "start_time": "09:00",
  "end_time": "17:00",
  "break_start_time": "12:00",
  "break_end_time": "13:00"
}
```
- **Validation**: Valid times, end > start
- **Response**: Availability slot created

---

### 17. **Accept Booking**
- **Page**: `/provider/jobs`
- **Endpoint**: `POST /api/bookings/:id/accept`
- **Database Table**: `bookings`
- **Payload**:
```json
{
  "booking_id": "booking_uuid",
  "estimated_duration_adjustment": 0 // in minutes
}
```
- **Validation**: Booking exists, pending, available at time
- **Response**: Booking status updated, customer notified

---

### 18. **Complete Booking**
- **Page**: `/provider/jobs`
- **Endpoint**: `POST /api/bookings/:id/complete`
- **Database Table**: `bookings`
- **Payload**:
```json
{
  "booking_id": "booking_uuid",
  "notes": "Job completed successfully",
  "completion_photos": ["url1", "url2"]
}
```
- **Validation**: Booking exists, in_progress
- **Response**: Booking completed, payment processed

---

### 19. **Create Quote**
- **Page**: `/provider/quotes`
- **Endpoint**: `POST /api/quotes`
- **Database Table**: `quotes` (new table needed)
- **Payload**:
```json
{
  "customer_id": "customer_uuid",
  "service_description": "Custom website design",
  "estimated_price": 2000.00,
  "estimated_duration_days": 30,
  "notes": "Includes 3 revision rounds",
  "validity_days": 30
}
```
- **Validation**: Required fields, price > 0
- **Response**: Quote ID, email sent to customer

---

### 20. **Request Withdrawal**
- **Page**: `/provider/wallet`
- **Endpoint**: `POST /api/payouts`
- **Database Table**: `payouts`
- **Payload**:
```json
{
  "amount": 500.00,
  "payout_method": "bank_transfer",
  "bank_account_id": "account_uuid"
}
```
- **Validation**: Amount <= balance, bank account valid
- **Response**: Payout request created, confirmation email

---

## Shopkeeper Portal

### 21. **Create Product**
- **Page**: `/shopkeeper/products`
- **Endpoint**: `POST /api/products`
- **Database Table**: `products`
- **Payload**:
```json
{
  "name": "Leather Wallet",
  "category_id": "category_uuid",
  "description": "Premium leather wallet",
  "sku": "LW-001",
  "price": 29.99,
  "cost_price": 15.00,
  "discount_percentage": 10,
  "stock_quantity": 100,
  "images_url": ["url1", "url2"]
}
```
- **Validation**: SKU unique, prices valid, images exist
- **Response**: Product ID

---

### 22. **Create Promotion**
- **Page**: `/shopkeeper/promotions`
- **Endpoint**: `POST /api/promotions`
- **Database Table**: `promotions`
- **Payload**:
```json
{
  "code": "SUMMER20",
  "discount_type": "percentage",
  "discount_value": 20,
  "min_purchase_amount": 50.00,
  "max_uses": 100,
  "applicable_categories": ["cat1_id", "cat2_id"],
  "start_date": "2024-06-01",
  "end_date": "2024-08-31"
}
```
- **Validation**: Code unique, discount 0-100%, dates valid
- **Response**: Promotion ID

---

### 23. **Create Product Review Response**
- **Page**: `/shopkeeper/reviews`
- **Endpoint**: `POST /api/reviews/:id/response`
- **Database Table**: `shop_reviews` (add response_text, responded_at columns)
- **Payload**:
```json
{
  "review_id": "review_uuid",
  "response_text": "Thank you for your feedback, we appreciate it!"
}
```
- **Validation**: Review exists, shopkeeper owns shop
- **Response**: Response saved confirmation

---

## Agent Portal

### 24. **Resolve Dispute**
- **Page**: `/agent/disputes`
- **Endpoint**: `POST /api/disputes/:id/resolve`
- **Database Table**: `disputes`
- **Payload**:
```json
{
  "dispute_id": "dispute_uuid",
  "resolution_type": "refund", // refund | rework | credit
  "resolution_amount": 100.00,
  "notes": "After investigating both parties..."
}
```
- **Validation**: Dispute exists, agent assigned
- **Response**: Dispute resolved, refund processed if applicable

---

### 25. **Escalate Dispute**
- **Page**: `/agent/disputes`
- **Endpoint**: `POST /api/disputes/:id/escalate`
- **Database Table**: `disputes`
- **Payload**:
```json
{
  "dispute_id": "dispute_uuid",
  "reason": "Complex case requiring admin intervention",
  "escalation_notes": "Additional context for admin"
}
```
- **Validation**: Dispute exists, agent assigned
- **Response**: Escalation logged, admin notified

---

## Sub-Admin Portal

### 26. **Verify Provider**
- **Page**: `/sub-admin/verifications`
- **Endpoint**: `POST /api/verifications/:id/approve`
- **Database Table**: `providers`
- **Payload**:
```json
{
  "provider_id": "provider_uuid",
  "verification_status": "approved", // approved | rejected
  "notes": "All documents verified"
}
```
- **Validation**: Provider exists, not yet verified
- **Response**: Verification status updated, user notified

---

### 27. **Suspend User Account**
- **Page**: `/sub-admin/users`
- **Endpoint**: `POST /api/users/:id/suspend`
- **Database Table**: `users`
- **Payload**:
```json
{
  "user_id": "user_uuid",
  "reason": "Violation of terms of service",
  "suspension_days": 30
}
```
- **Validation**: User exists, not already suspended
- **Response**: Account suspended, user notified

---

### 28. **Action Report**
- **Page**: `/sub-admin/reports`
- **Endpoint**: `POST /api/reports/:id/action`
- **Database Table**: `reports`
- **Payload**:
```json
{
  "report_id": "report_uuid",
  "action_taken": "removed_content", // removed_content | user_suspended | dismissed
  "notes": "Inappropriate content violation"
}
```
- **Validation**: Report exists, pending
- **Response**: Action logged, reporter notified

---

## Admin Portal

### 29. **Create Commission Tier**
- **Page**: `/admin/commissions`
- **Endpoint**: `POST /api/commission-tiers`
- **Database Table**: `commission_tiers`
- **Payload**:
```json
{
  "name": "Gold Tier",
  "role": "provider",
  "commission_percentage": 15,
  "min_monthly_transactions": 5000.00,
  "description": "For providers with high volume"
}
```
- **Validation**: Name unique, commission 0-100%, role valid
- **Response**: Tier created

---

### 30. **Create Announcement**
- **Page**: `/admin/announcements`
- **Endpoint**: `POST /api/announcements`
- **Database Table**: `announcements` (new table needed)
- **Payload**:
```json
{
  "title": "Platform Maintenance Notice",
  "content": "Full announcement text",
  "target_roles": ["customer", "provider"],
  "priority": "high", // low | medium | high
  "publish_date": "2024-12-25T10:00:00Z",
  "send_email": true
}
```
- **Validation**: Required fields, valid roles
- **Response**: Announcement created, scheduled/published

---

### 31. **Add Team Member**
- **Page**: `/admin/team`
- **Endpoint**: `POST /api/team-members`
- **Database Table**: `team_members`, `users`
- **Payload**:
```json
{
  "email": "neagent@example.com",
  "full_name": "Jane Smith",
  "team_role": "agent", // agent | sub-admin | secretary
  "department": "Disputes",
  "manager_id": "manager_uuid"
}
```
- **Validation**: Email unique, role valid, manager exists
- **Response**: Team member created, invitation email sent

---

### 32. **Process Payout to Provider**
- **Page**: `/admin/payments`
- **Endpoint**: `POST /api/process-payout`
- **Database Tables**: `payouts`, `payments`
- **Payload**:
```json
{
  "payout_id": "payout_uuid",
  "stripe_payout_id": "po_xxx", // From Stripe
  "amount_processed": 500.00
}
```
- **Validation**: Payout exists, pending, amount matches
- **Response**: Payout marked complete, user notified

---

## Communication

### 33. **Send Message**
- **Page**: Customer/Provider Messages pages
- **Endpoint**: `POST /api/messages`
- **Database Table**: `messages`
- **Payload**:
```json
{
  "recipient_id": "user_uuid",
  "message_text": "Hello, how is the project coming along?",
  "attachment_url": null
}
```
- **Validation**: Recipient exists, user not blocked
- **Response**: Message ID, timestamp

---

### 34. **Send Chatbot Message**
- **Page**: `/chatbot`
- **Endpoint**: `POST /api/chatbot/messages`
- **Database Table**: `chatbot_messages`
- **Payload**:
```json
{
  "conversation_id": "conversation_uuid",
  "message_text": "I want to talk to a real agent",
  "message_category": "support_request"
}
```
- **Validation**: Conversation exists, not closed
- **Response**: Message ID, AI response, escalation check

---

### 35. **Escalate to Human Agent**
- **Page**: `/chatbot`
- **Endpoint**: `POST /api/chatbot/escalate`
- **Database Table**: `chatbot_conversations`, `support_tickets`
- **Payload**:
```json
{
  "conversation_id": "conversation_uuid",
  "reason": "Customer wants to talk to human"
}
```
- **Validation**: Conversation exists, can escalate
- **Response**: Support ticket created, agent assigned

---

### 36. **Create Support Ticket**
- **Page**: `/customer/help` or help sections
- **Endpoint**: `POST /api/support-tickets`
- **Database Table**: `support_tickets`
- **Payload**:
```json
{
  "subject": "Payment not received",
  "description": "I paid for a booking but haven't received confirmation",
  "category": "billing",
  "priority": "high",
  "attachments": ["url1", "url2"]
}
```
- **Validation**: Required fields, valid category
- **Response**: Ticket created, confirmation email, ticket number

---

## Content & Uploads

### 37. **Upload Profile Picture**
- **Page**: User profile pages
- **Endpoint**: `POST /api/uploads/profile-picture`
- **Database Table**: `users`
- **Payload**: FormData with file
```javascript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('user_id', userId);
```
- **Validation**: File type image, size < 5MB
- **Response**: File URL, profile updated

---

### 38. **Upload Product Images**
- **Page**: `/shopkeeper/products`
- **Endpoint**: `POST /api/uploads/product-images`
- **Database Table**: `products`
- **Payload**: FormData with multiple files
```javascript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('product_id', productId);
```
- **Validation**: File type image, size < 10MB each, max 5 images
- **Response**: Array of file URLs

---

## Summary Table

| Feature | Page | Endpoint | Table | Purpose |
|---------|------|----------|-------|---------|
| Register | /auth/signup | POST /api/auth/register | users | Create user account |
| Login | /auth/login | POST /api/auth/login | sessions | Authenticate user |
| Subscribe Email | Popup | POST /api/subscribers | email_subscribers | Newsletter signup |
| Book Service | /customer/booking | POST /api/bookings | bookings | Create booking |
| Create Service | /provider/services | POST /api/services | services | Offer new service |
| Create Product | /shopkeeper/products | POST /api/products | products | Sell new product |
| Resolve Dispute | /agent/disputes | POST /api/disputes/:id/resolve | disputes | Settle disputes |
| Verify Provider | /sub-admin/verifications | POST /api/verifications/:id/approve | providers | Approve providers |
| Send Message | /messages | POST /api/messages | messages | Chat between users |

---

## Notes
- All POST endpoints require authentication (except registration and login)
- Validate all inputs on both frontend and backend
- Use transactions for multi-table updates
- Log all changes in audit_logs table
- Send confirmation emails after successful submissions
- Rate limit POST endpoints to prevent abuse
- Use idempotency keys for payment operations
