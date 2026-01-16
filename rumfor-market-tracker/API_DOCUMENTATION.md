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

### Vendor Analytics

#### Get Vendor Analytics for Market
```
GET /api/markets/:id/vendor-analytics
```

**Role Required:** vendor

**Description:** Retrieves earnings, attendance trends, and performance analytics for the authenticated vendor at a specific market.

**Response:**
```json
{
  "success": true,
  "data": {
    "expenses": {
      "total": 450.00,
      "byCategory": {
        "booth-fee": 150.00,
        "supplies": 200.00,
        "transportation": 100.00
      }
    },
    "revenue": {
      "total": 800.00,
      "byCategory": {
        "sales": 800.00
      }
    },
    "profit": 350.00,
    "expenseCount": 3,
    "transactionCount": 4
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Promoter Communications

#### Get Messages with Promoter/Vendor
```
GET /api/markets/:id/promoter-messages
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 50)

**Role Required:** vendor or promoter

**Description:** Retrieves message history between vendors and market promoters for communication about applications and requirements.

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "content": "Can I bring my own canopy for the booth?",
        "sender": {
          "_id": "507f1f77bcf86cd799439012",
          "username": "johndoe",
          "profile": {
            "firstName": "John",
            "lastName": "Doe"
          }
        },
        "recipient": {
          "_id": "507f1f77bcf86cd799439013",
          "username": "marketadmin",
          "profile": {
            "firstName": "Market",
            "lastName": "Admin"
          }
        },
        "market": "507f1f77bcf86cd799439014",
        "messageType": "vendor-to-promoter",
        "createdAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "market": {
      "id": "507f1f77bcf86cd799439014",
      "name": "Downtown Farmers Market",
      "promoter": "507f1f77bcf86cd799439015"
    },
    "pagination": {
      "current": 1,
      "total": 2,
      "count": 20,
      "hasMore": false
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Send Message to Promoter/Vendor
```
POST /api/markets/:id/promoter-messages
```

**Role Required:** vendor or promoter

**Request Body:**
```json
{
  "content": "Question about booth setup requirements",
  "recipientId": "507f1f77bcf86cd799439011" // Optional: for promoter-to-vendor messages
}
```

**Description:** Sends a message from a vendor to the market promoter, or from the promoter to a specific vendor who has applied.

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "content": "Question about booth setup requirements",
    "sender": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "johndoe"
    },
    "recipient": {
      "_id": "507f1f77bcf86cd799439013",
      "username": "marketadmin"
    },
    "market": "507f1f77bcf86cd799439014",
    "messageType": "vendor-to-promoter",
    "createdAt": "2024-01-01T10:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Notes:**
- Vendors can only send messages to the promoter of markets they have or want to apply to
- Promoters can send messages to any vendor who has applied to their markets
- Messages are threaded by market and participant

### Comments

#### Get Comments for Market
```
GET /api/comments/market/:marketId
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 50)
- `sort` (string): Sort by "newest", "oldest", "popular" (default: "newest")

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [{
      "_id": "507f1f77bcf86cd799439011",
      "market": "507f1f77bcf86cd799439012",
      "user": {
        "_id": "507f1f77bcf86cd799439013",
        "username": "johndoe",
        "profile": {
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      "content": "This market has the best local produce!",
      "parent": null,
      "replies": [],
      "reactions": {
        "like": 5,
        "dislike": 0,
        "love": 2
      },
      "isApproved": true,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }],
    "pagination": {
      "current": 1,
      "total": 5,
      "count": 20,
      "hasMore": false
    }
  }
}
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

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

#### Delete Comment
```
DELETE /api/comments/:id
```
**Role Required:** comment author or admin

#### Add/Remove Reaction to Comment
```
POST /api/comments/:id/reaction
```

**Request Body:**
```json
{
  "reactionType": "like",
  "action": "add" // "add" or "remove"
}
```

#### Report Comment
```
POST /api/comments/:id/report
```

**Request Body:**
```json
{
  "reason": "spam",
  "description": "Optional additional details"
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
**Role Required:** photo uploader or admin

#### Get Hero Photo
```
GET /api/photos/market/:marketId/hero
```

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

#### Report Photo
```
POST /api/photos/:id/report
```

**Request Body:**
```json
{
  "reason": "inappropriate",
  "description": "Optional additional details"
}
```

### Hashtags

#### Get Hashtags for Market
```
GET /api/hashtags/market/:marketId
```

#### Suggest Hashtag
```
POST /api/hashtags/market/:marketId
```

**Request Body:**
```json
{
  "text": "#localproduce"
}
```

#### Vote on Hashtag
```
POST /api/hashtags/:id/vote
```

**Request Body:**
```json
{
  "vote": 1  // 1=upvote, -1=downvote, 0=remove vote
}
```

#### Delete Hashtag
```
DELETE /api/hashtags/:id
```
**Role Required:** admin or moderator

### Notifications

#### Get Notifications
```
GET /api/notifications
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `unreadOnly` (boolean): Show only unread notifications
- `type` (string): Filter by notification type
- `startDate` (string): Filter from date
- `endDate` (string): Filter to date

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [{
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "type": "application-approved",
      "title": "Application Approved",
      "message": "Your application to Downtown Market has been approved!",
      "data": {
        "applicationId": "507f1f77bcf86cd799439013",
        "marketId": "507f1f77bcf86cd799439014"
      },
      "read": false,
      "createdAt": "2024-01-01T10:00:00.000Z"
    }],
    "pagination": {
      "current": 1,
      "total": 5,
      "count": 20,
      "hasMore": false
    }
  }
}
```

#### Get Notification Count
```
GET /api/notifications/count
```

**Query Parameters:**
- `unreadOnly` (boolean): Count only unread notifications

#### Mark as Read
```
PATCH /api/notifications/:id/read
```

#### Mark Multiple as Read
```
PATCH /api/notifications/read
```

**Request Body:**
```json
{
  "notificationIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

#### Mark All as Read
```
PATCH /api/notifications/read-all
```

#### Delete Notification
```
DELETE /api/notifications/:id
```

#### Delete Multiple Notifications
```
DELETE /api/notifications
```

**Request Body:**
```json
{
  "notificationIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
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
    "marketUpdates": false,
    "comments": true,
    "photos": false
  },
  "pushNotifications": {
    "applicationStatus": true,
    "reminders": true,
    "announcements": false
  },
  "smsNotifications": {
    "emergency": true,
    "importantReminders": false
  }
}
```

### User Market Tracking

#### Get User Tracked Markets
```
GET /api/users/tracked-markets
```

#### Track Market
```
POST /api/markets/:id/track
```

#### Untrack Market
```
DELETE /api/markets/:id/track
```

#### Update Tracking Status
```
PATCH /api/markets/:id/tracking
```

**Request Body:**
```json
{
  "status": "interested",
  "notes": "Planning to apply for spring season"
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

### Todos

#### Get Todos
```
GET /api/todos
```

**Query Parameters:**
- `market` (string): Filter by market ID
- `completed` (boolean): Filter by completion status
- `priority` (string): Filter by priority ("low", "medium", "high", "urgent")
- `dueDateFrom` (string): Filter todos due after this date
- `dueDateTo` (string): Filter todos due before this date
- `sortBy` (string): Sort field ("createdAt", "dueDate", "priority")
- `sortOrder` (string): Sort order ("asc", "desc")

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
  "cost": 0
}
```

#### Update Todo
```
PATCH /api/todos/:id
```

**Request Body:**
```json
{
  "title": "Updated title",
  "completed": true
}
```

#### Delete Todo
```
DELETE /api/todos/:id
```

#### Mark Todo Complete
```
PATCH /api/todos/:id/complete
```

**Request Body:**
```json
{
  "completed": true
}
```

#### Get Todo Templates
```
GET /api/todos/templates/:marketType
```

Returns predefined todo templates for different market types.

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

API endpoints are rate-limited based on user type and endpoint category:

### Rate Limits by User Role

- **Standard Users**: 100 requests per 15 minutes
- **Vendors**: 200 requests per 15 minutes (includes vendor-specific endpoints)
- **Promoters**: 400 requests per 15 minutes (includes management endpoints)
- **Admins**: 500 requests per 15 minutes
- **Auth Endpoints**: 5 attempts per 15 minutes

### Rate Limits by Endpoint Category

- **Vendor Analytics Endpoints** (`/api/markets/*/vendor-analytics`, `/api/markets/*/promoter-messages`): 50 requests per 15 minutes
- **Vendor Dashboard Endpoints** (`/api/todos`, `/api/expenses`): 100 requests per 15 minutes
- **Promoter Management Endpoints** (`/api/promoter/*`): 150 requests per 15 minutes
- **Admin Operations** (`/api/admin/*`): 200 requests per 15 minutes
- **Media Uploads** (`/api/photos`, `/api/documents`): 20 requests per 15 minutes
- **Search Endpoints** (`/api/markets/search`, `/api/users/search`): 60 requests per 15 minutes

### Rate Limit Headers

All responses include rate limit headers:
- `X-RateLimit-Limit`: Maximum requests allowed in the current window
- `X-RateLimit-Remaining`: Remaining requests in the current window
- `X-RateLimit-Reset`: Time when the rate limit window resets (Unix timestamp)
- `X-RateLimit-Retry-After`: Seconds until you can make another request (only sent when limit exceeded)

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "message": "Too many requests",
  "error": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 900,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Burst Protection

Endpoints with file uploads have additional burst protection to prevent abuse:
- Maximum 5 concurrent uploads per user
- Automatic retry with exponential backoff recommended

### Special Considerations

- **Vendor Market Detail**: Heavy usage scenarios (analytics dashboard, message threads) may consume rate limits quickly
- **Batch Operations**: Use bulk endpoints where available to reduce request counts
- **Caching**: Implement client-side caching to minimize repeated requests

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
    country: string
    zipCode?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  dates: {
    type: 'recurring' | 'one-time' | 'seasonal'
    recurring?: {
      frequency: 'weekly' | 'monthly' | 'bi-weekly' | 'quarterly'
      daysOfWeek: number[]
      timeOfDay: {
        start: string
        end: string
      }
    }
    events?: Array<{
      startDate: string
      endDate: string
      time: {
        start: string
        end: string
      }
    }>
  }
  vendorInfo: {
    capacity: number
    boothSizes?: Array<{
      size: string
      price: number
      description: string
    }>
    requirements: string[]
    amenities: string[]
  }
  promoter: string // User ID reference
  isActive: boolean
  isVerified: boolean
  images: Array<{
    url: string
    caption: string
    isHero: boolean
    uploadedBy: string
    votes: {
      up: number
      down: number
    }
  }>
  hashtags: Array<{
    text: string
    votes: {
      up: number
      down: number
    }
    suggestedBy: string
  }>
  statistics: {
    totalTrackers: number
    totalApplications: number
    totalPhotos: number
    totalComments: number
  }
  contact: {
    email?: string
    phone?: string
    website?: string
    socialMedia?: {
      facebook?: string
      instagram?: string
      twitter?: string
    }
  }
  accessibility: {
    wheelchairAccessible: boolean
    parkingAvailable: boolean
    publicTransport: boolean
    restrooms: boolean
  }
  createdAt: Date
  updatedAt: Date
}
```

### Comment
```typescript
interface Comment {
  _id: string
  market: string // Market ID reference
  user: string // User ID reference
  content: string
  parent?: string // Parent comment ID for replies
  isApproved: boolean
  isDeleted: boolean
  deletedAt?: Date
  editedAt?: Date
  editHistory?: Array<{
    oldContent: string
    editedAt: Date
    editedBy: string
  }>
  reactions: Array<{
    user: string
    reactionType: 'like' | 'dislike' | 'love' | 'laugh' | 'angry' | 'sad'
    createdAt: Date
  }>
  reports?: Array<{
    reportedBy: string
    reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other'
    description?: string
    status: 'pending' | 'resolved' | 'dismissed'
    resolvedAt?: Date
    resolvedBy?: string
    createdAt: Date
  }>
  createdAt: Date
  updatedAt: Date
}
```

### Photo
```typescript
interface Photo {
  _id: string
  market: string // Market ID reference
  user: string // User ID reference
  url: string
  thumbnailUrl: string
  caption?: string
  tags: string[]
  isApproved: boolean
  votes: {
    up: number
    down: number
  }
  takenAt?: Date
  isDeleted: boolean
  deletedAt?: Date
  createdAt: Date
}
```

### Todo
```typescript
interface Todo {
  _id: string
  vendor: string // User ID reference
  market: string // Market ID reference
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  dueDate?: Date
  estimatedHours?: number
  cost?: number
  createdAt: Date
  updatedAt: Date
}
```

### Expense
```typescript
interface Expense {
  _id: string
  vendor: string // User ID reference
  market: string // Market ID reference
  title: string
  description?: string
  amount: number
  category: 'booth-fee' | 'transportation' | 'accommodation' | 'supplies' | 'equipment' | 'marketing' | 'food' | 'fuel' | 'insurance' | 'other'
  date: Date
  paymentMethod?: string
  receipt?: string
  isTaxDeductible: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Notification
```typescript
interface Notification {
  _id: string
  userId: string // User ID reference
  type: 'application-approved' | 'application-rejected' | 'market-updated' | 'new-comment' | 'new-photo' | 'reminder' | 'announcement'
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
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