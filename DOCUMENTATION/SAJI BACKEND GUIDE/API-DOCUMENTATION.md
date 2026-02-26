# SAJI Backend API Documentation

## Overview

This document outlines all available API endpoints for the SAJI platform. Base URL: `http://localhost:3000/api`

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained during login/signup and expire after 7 days.

---

## Authentication Endpoints

### 1. Sign Up

**Endpoint:** `POST /auth/signup`

**Description:** Create a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePassword123!",
  "phone": "+254712345678",
  "role": "client"
}
```

**Role Options:**
- `client` - End service user
- `professional` - Service provider
- `admin` - Platform administrator
- `shopkeeper` - Shop owner

**Response:**
```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "client"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "statusCode": 201
}
```

**Error Responses:**
- `400` - Validation failed
- `409` - Email already registered

---

### 2. Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and get JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "client"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "statusCode": 200
}
```

**Error Responses:**
- `400` - Validation failed
- `401` - Invalid credentials
- `403` - Account suspended/inactive

---

## Payment Endpoints

### 3. Initialize Payment

**Endpoint:** `POST /payments/initialize`

**Description:** Start a payment process via M-Pesa or Airtel Money

**Authentication:** Required

**Request Body:**
```json
{
  "bookingId": 1,
  "phoneNumber": "+254712345678",
  "method": "mpesa",
  "amount": 5000
}
```

**Payment Methods:**
- `mpesa` - Safaricom M-Pesa
- `airtel` - Airtel Money

**Response (M-Pesa):**
```json
{
  "success": true,
  "message": "Payment initiated",
  "data": {
    "paymentId": 1,
    "transactionId": "ws_CO_12345678901234567890",
    "message": "Success. Request accepted for processing"
  },
  "statusCode": 200
}
```

**Response (Airtel):**
```json
{
  "success": true,
  "message": "Payment initiated",
  "data": {
    "paymentId": 2,
    "transactionId": "TXN123456789",
    "message": "Payment request sent to customer"
  },
  "statusCode": 200
}
```

**Error Responses:**
- `400` - Validation failed
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (booking doesn't belong to user)
- `404` - Booking not found
- `500` - Payment provider error

---

### 4. M-Pesa Callback

**Endpoint:** `POST /payments/mpesa/callback`

**Description:** Webhook for M-Pesa payment confirmation (internal use)

**Note:** This endpoint is called by M-Pesa servers, not by clients

**Callback Structure:**
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34620561-1",
      "CheckoutRequestID": "ws_CO_12345678901234567890",
      "ResultCode": 0,
      "ResultDesc": "The service request has been processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {
            "Name": "Amount",
            "Value": 5000
          },
          {
            "Name": "MpesaReceiptNumber",
            "Value": "LK451A5K60EV"
          },
          {
            "Name": "PhoneNumber",
            "Value": 254712345678
          }
        ]
      }
    }
  }
}
```

**Callback Actions:**
- Updates payment status to `completed` or `failed`
- Updates booking status to `confirmed`
- Sends payment confirmation email to customer

---

## Booking Endpoints (Coming Soon)

The following endpoints will be implemented:

### Create Booking
`POST /bookings`
- Create a new service booking

### Get Booking
`GET /bookings/:id`
- Retrieve booking details

### Update Booking
`PUT /bookings/:id`
- Modify booking details

### Cancel Booking
`DELETE /bookings/:id`
- Cancel an existing booking

### List User Bookings
`GET /bookings`
- Get all bookings for authenticated user

---

## Service Endpoints (Coming Soon)

### List Services
`GET /services`
- Browse available services

### Get Service Details
`GET /services/:id`
- Get detailed service information

### Create Service
`POST /services`
- Add new service (professionals only)

### Update Service
`PUT /services/:id`
- Modify service details

---

## Error Handling

All API errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "statusCode": 400
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## Rate Limiting

- **Authentication endpoints:** 5 requests per minute per IP
- **Payment endpoints:** 10 requests per minute per user
- **General endpoints:** 30 requests per minute per user

---

## Testing the APIs

### Using cURL

**Sign Up:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "password": "TestPassword123!",
    "role": "client"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

**Initialize Payment:**
```bash
curl -X POST http://localhost:3000/api/payments/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "bookingId": 1,
    "phoneNumber": "+254712345678",
    "method": "mpesa",
    "amount": 5000
  }'
```

### Using Postman

1. Import the included Postman collection
2. Set up environment variables:
   - `base_url` = http://localhost:3000
   - `token` = (obtained from login response)
3. Run requests from the collection

---

## Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `phone`
- `firstName`
- `lastName`
- `password` (hashed)
- `role` (admin, professional, client, shopkeeper)
- `status` (active, inactive, suspended, deleted)
- `profileImage`
- `bio`
- `isEmailVerified`
- `isPhoneVerified`
- `createdAt`
- `updatedAt`

### Payments Table
- `id` (Primary Key)
- `transactionId` (Unique)
- `bookingId` (Foreign Key)
- `userId` (Foreign Key)
- `amount`
- `method` (mpesa, airtel, card, wallet)
- `status` (pending, processing, completed, failed, refunded)
- `mpesaCode`
- `airtelReference`
- `phoneNumber`
- `failureReason`
- `createdAt`
- `updatedAt`

### Bookings Table
- `id` (Primary Key)
- `bookingCode` (Unique)
- `clientId` (Foreign Key)
- `professionalId` (Foreign Key)
- `serviceId` (Foreign Key)
- `status` (pending, confirmed, in_progress, completed, cancelled)
- `bookingDate`
- `duration`
- `totalAmount`
- `notes`
- `location`
- `createdAt`
- `updatedAt`

---

## Security Notes

1. **Never expose tokens** in logs or error messages
2. **Use HTTPS** in production
3. **Validate all inputs** on both client and server
4. **Hash passwords** with bcrypt
5. **Rotate JWT secrets** periodically
6. **Keep API keys secure** - use environment variables
7. **Implement CORS** properly for your frontend domain

---

## Support

For API issues or questions:
- Email: support@saji.dev
- Documentation: https://saji.dev/docs
- Status Page: https://status.saji.dev
