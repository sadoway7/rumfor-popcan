# Rumfor Market Tracker API Documentation

## Overview

The Rumfor Market Tracker API provides a comprehensive REST interface for market discovery, vendor applications, and community engagement features. This documentation covers all available endpoints, authentication requirements, and data formats.

## Authentication

### JWT Token Authentication

All API endpoints except public routes require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Refresh

Access tokens expire after 24 hours. Use the refresh endpoint to get new tokens:

```
POST /api/auth/refresh-token
{
  "refreshToken": "your-refresh-token-here"
}
```

### User Roles

- **user**: Standard user with basic access
- **vendor**: Can apply to markets and manage applications
- **promoter**: Can create and manage markets
- **admin**: Full system access

## Base URL

For versioned API endpoints:
```
https://api.rumfor-market.com/api/v1
```

For legacy endpoints (deprecated, will be removed in future versions):
```
https://api.rumfor-market.com/api
```

For local development:
- Versioned: `http://localhost:3001/api/v1`
- Legacy: `http://localhost:3001/api`

## API Versioning

The API uses URL path versioning. The current stable version is **v1**.

### Version Headers

All API responses include version information in headers:
- `API-Version`: The version used for the request
- `API-Supported-Versions`: Comma-separated list of supported versions
- `API-Current-Version`: The current stable version

### Supported Versions

- **v1** (current): Full feature set with enhanced security and performance
- Legacy (deprecated): Original endpoints, maintained for backward compatibility

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... }, // only for list endpoints
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ], // validation errors
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "profile": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "preferences": {
    "emailNotifications": true,
    "location": "New York, NY"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token",
      "expiresIn": "24h"
    }
  }
}
```

#### Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Same as register, includes user data and tokens.

#### Get Current User
```
GET /api/auth/me
```

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": { "user": { ... } }
}
```

#### Update Profile
```
PATCH /api/auth/me
```

#### Change Password
```
PATCH /api/auth/change-password
```

### Markets

#### Get All Markets
```
GET /api/markets
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 50)
- `category` (string): Market category filter
- `location` (string): Location search
- `radius` (number): Search radius in miles
- `startDate` (string): Filter by start date
- `endDate` (string): Filter by end date

**Response:**
```json
{
  "success": true,
  "data": {
    "markets": [ ... ],
    "pagination": {
      "current": 1,
      "total": 10,
      "count": 20,
      "hasMore": false
    }
  }
}
```

#### Get Market by ID
```
GET /api/markets/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "market": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Downtown Farmers Market",
      "description": "Fresh local produce and crafts",
      "category": "farmers-market",
      "location": {
        "address": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "coordinates": [-118.2437, 34.0522]
      },
      "dates": {
        "type": "recurring",
        "schedule": "Saturdays 8am-2pm",
        "startDate": "2024-01-06",
        "endDate": "2024-12-31"
      },
      "vendorInfo": {
        "capacity": 50,
        "applicationFee": { "amount": 25, "currency": "USD" },
        "requirements": ["Business license required"]
      },
      "promoter": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Anytown Market Association"
      },
      "photoCount": 15,
      "commentCount": 8,
      "averageRating": 4.2
    }
  }
}
```

#### Create Market
```
POST /api/markets
```
**Role Required:** promoter

#### Update Market
```
PATCH /api/markets/:id
```
**Role Required:** promoter (market owner or admin)

#### Delete Market
```
DELETE /api/markets/:id
```
**Role Required:** promoter (market owner or admin)

### Applications

#### Get User's Applications
```
GET /api/applications
```

**Query Parameters:**
- `status` (string): Filter by status (draft, submitted, approved, rejected)

#### Create Application
```
POST /api/applications
```

**Request Body:**
```json
{
  "marketId": "507f1f77bcf86cd799439011",
  "applicationData": {
    "businessName": "Doe's Artisan Goods",
    "contactDetails": {
      "email": "jane@doegoods.com",
      "phone": "555-0123"
    },
    "businessDescription": "Handcrafted jewelry and accessories",
    "experience": "5+ years",
    "certifications": ["organic", "local"],
    "notes": "Excited to participate!"
  },
  "customFields": {
    "boothSize": "10x10",
    "electricity": true
  }
}
```

#### Update Application
```
PATCH /api/applications/:id
```

#### Submit Application
```
POST /api/applications/:id/submit
```

#### Get Applications (Promoter View)
```
GET /api/promoter/applications
```
**Role Required:** promoter

### Comments

#### Get Comments for Market
```
GET /api/comments/market/:marketId
```

#### Create Comment
```
POST /api/comments
```

**Request Body:**
```json
{
  "content": "This market has the best local produce!",
  "market": "507f1f77bcf86cd799439011",
  "parent": "507f1f77bcf86cd799439013" // optional, for replies
}
```

#### Update Comment
```
PATCH /api/comments/:id
```

#### Delete Comment
```
DELETE /api/comments/:id
```

#### Add Reaction to Comment
```
POST /api/comments/:id/reaction
```

**Request Body:**
```json
{
  "reactionType": "thumbsUp",
  "action": "add" // or "remove"
}
```

### Photos

#### Get Photos for Market
```
GET /api/photos/market/:marketId
```

**Query Parameters:**
- `page`, `limit`
- `sort` (string): "votes" or "recent"

#### Upload Photos
```
POST /api/photos/market/:marketId
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `photos[]`: Multiple image files
- `caption`: Caption text

#### Vote on Photo
```
POST /api/photos/:id/vote
```

**Request Body:**
```json
{
  "vote": 1  // 1=upvote, -1=downvote, 0=remove vote
}
```

#### Delete Photo
```
DELETE /api/photos/:id
```

#### Get Hero Photo
```
GET /api/photos/market/:marketId/hero
```

### Notifications

#### Get Notifications
```
GET /api/notifications
```

**Query Parameters:**
- `unreadOnly` (boolean)
- `type` (string): Filter by notification type
- `page`, `limit`

#### Mark as Read
```
PATCH /api/notifications/:id/read
```

#### Mark All as Read
```
PATCH /api/notifications/read-all
```

#### Delete Notification
```
DELETE /api/notifications/:id
```

#### Update Preferences
```
PATCH /api/notifications/preferences
```

**Request Body:**
```json
{
  "emailNotifications": {
    "applicationStatus": true,
    "marketUpdates": false
  },
  "pushNotifications": {
    "applicationStatus": true
  }
}
```

### Todos

#### Get Todos
```
GET /api/todos
```

**Query Parameters:**
- `market` (string): Filter by market
- `completed` (boolean): Filter by completion status
- `priority` (string): "urgent", "high", "medium", "low"

#### Create Todo
```
POST /api/todos
```

**Request Body:**
```json
{
  "title": "Set up booth at Downtown Market",
  "description": "Complete booth setup 30 minutes before opening",
  "category": "setup",
  "priority": "high",
  "market": "507f1f77bcf86cd799439011",
  "dueDate": "2024-01-06T08:30:00Z",
  "estimatedHours": 2,
  "cost": 50
}
```

#### Update Todo
```
PATCH /api/todos/:id
```

#### Delete Todo
```
DELETE /api/todos/:id
```

#### Mark Complete
```
PATCH /api/todos/:id/complete
```

### Expenses

#### Get Expenses
```
GET /api/expenses
```

**Query Parameters:**
- `market` (string): Filter by market
- `category` (string): Filter by expense category
- `dateFrom`, `dateTo`: Date range filters

#### Create Expense
```
POST /api/expenses
```

**Request Body:**
```json
{
  "title": "Booth Fee - Downtown Market",
  "description": "Weekly booth rental",
  "category": "booth-fee",
  "amount": 50,
  "currency": "USD",
  "date": "2024-01-06",
  "market": "507f1f77bcf86cd799439011",
  "paymentMethod": "cash",
  "isTaxDeductible": true
}
```

#### Update Expense
```
PATCH /api/expenses/:id
```

#### Delete Expense
```
DELETE /api/expenses/:id
```

### Admin (Admin Only)

#### Get Users
```
GET /api/admin/users
```

#### Update User Role
```
PATCH /api/admin/users/:id/role
```

#### Get System Stats
```
GET /api/admin/stats
```

#### Moderate Content
```
PATCH /api/admin/moderate/:type/:id
```

#### Ban/Unban User
```
PATCH /api/admin/users/:id/status
```

## HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no content returned
- **400 Bad Request**: Invalid request data or validation error
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (e.g., duplicate)
- **422 Unprocessable Entity**: Validation failed
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Rate Limiting

API endpoints are rate-limited based on user type:

- **Standard Users**: 100 requests per 15 minutes
- **Promoters/Admins**: 500 requests per 15 minutes
- **Auth Endpoints**: 5 attempts per 15 minutes

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

## Pagination

List endpoints support pagination with cursor-based navigation:

**Request:**
```
GET /api/markets?page=2&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "markets": [ ... ],
    "pagination": {
      "current": 2,
      "total": 5,
      "count": 10,
      "hasMore": true
    }
  }
}
```

## Error Handling

All errors include detailed information:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Data Models

### User
```typescript
interface User {
  _id: string
  username: string
  email: string
  role: 'user' | 'vendor' | 'promoter' | 'admin'
  profile: {
    firstName?: string
    lastName?: string
    bio?: string
    location?: {
      city: string
      state: string
      country?: string
    }
  }
  preferences: {
    emailNotifications: boolean
    location?: string
  }
  isEmailVerified: boolean
  lastLogin: Date
  createdAt: Date
}
```

### Market
```typescript
interface Market {
  _id: string
  name: string
  description: string
  category: string
  location: {
    address: string
    city: string
    state: string
    coordinates: [number, number] // [longitude, latitude]
  }
  dates: {
    type: 'recurring' | 'one-time' | 'seasonal'
    schedule?: string
    startDate: string
    endDate: string
  }
  vendorInfo: {
    capacity: number
    applicationFee?: {
      amount: number
      currency: string
    }
  }
  promoter?: User
  photoCount: number
  commentCount: number
  createdAt: Date
}
```

## Webhooks (Future)

The API supports webhooks for real-time integrations:

- Market application status changes
- New comments on user's markets
- Photo moderation decisions
- User role changes

Webhook endpoints can be configured per application instance.

## Versioning

API version is included in the URL path: `/api/v1/`

Current version: v1

## SDKs & Libraries

### JavaScript/TypeScript Client
```javascript
import { RumforApi } from '@rumfor/api-client'

const client = new RumforApi({
  baseUrl: 'https://api.rumfor-market.com/api',
  apiKey: 'your-api-key'
})

// Example usage
const markets = await client.markets.getMarkets({
  location: 'New York, NY',
  category: 'farmers-market'
})
```

## Support

For API support, please contact developers@rumfor-market.com or create an issue in the project repository.

---

*This documentation is automatically generated and kept in sync with the codebase.*