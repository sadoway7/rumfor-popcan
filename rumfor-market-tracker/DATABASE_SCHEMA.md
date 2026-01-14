# Rumfor Market Tracker Database Schema

## Overview

The Rumfor Market Tracker uses MongoDB with Mongoose ODM for data modeling. This document describes all database collections, their schemas, relationships, and indexes.

## Database Configuration

- **Database Name**: `rumfor-market-tracker`
- **Connection**: MongoDB Atlas (Cloud) or local MongoDB instance
- **ODM**: Mongoose 8.x
- **Validation**: Schema-level validation with custom validators

## Collections

### 1. Users Collection

**Collection Name**: `users`

#### Schema Definition
```javascript
{
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username must be less than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  role: {
    type: String,
    enum: ['visitor', 'vendor', 'promoter', 'admin'],
    default: 'visitor'
  },
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    bio: { type: String, maxlength: [500, 'Bio must be less than 500 characters'] },
    location: {
      city: String,
      state: String,
      country: String
    },
    business: {
      name: String,
      description: String,
      website: String
    }
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: false },
    publicProfile: { type: Boolean, default: true }
  },
  isEmailVerified: {
    type: Boolean,
    default: true  // Auto-verify for development
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

#### Indexes
```javascript
// Single field indexes
db.users.createIndex({ email: 1 })
db.users.createIndex({ username: 1 })
db.users.createIndex({ role: 1 })
db.users.createIndex({ twoFactorEnabled: 1 })
db.users.createIndex({ isEmailVerified: 1 })
db.users.createIndex({ lastLogin: -1 })
db.users.createIndex({ createdAt: -1 })

// Compound indexes
db.users.createIndex({ role: 1, isEmailVerified: 1 })
db.users.createIndex({ role: 1, lastLogin: -1 })
```

#### Virtual Fields
- `fullName`: Returns `firstName + lastName` or `username`
- `isLocked`: Returns boolean indicating if account is currently locked

#### Methods
- `comparePassword(candidatePassword)`: Compare password with hash
- `incLoginAttempts()`: Increment login attempts and lock if threshold reached
- `resetLoginAttempts()`: Reset login attempts after successful login

### 2. Markets Collection

**Collection Name**: `markets`

#### Schema Definition
```javascript
{
  name: {
    type: String,
    required: [true, 'Market name is required'],
    trim: true,
    maxlength: [100, 'Market name must be less than 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description must be less than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'farmers-market',
      'arts-crafts',
      'flea-market',
      'food-festival',
      'craft-fair',
      'antique-market',
      'seasonal-event',
      'community-event',
      'holiday-market',
      'other'
    ]
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'USA'
    },
    zipCode: String,
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  dates: {
    type: {
      type: String,
      enum: ['recurring', 'one-time', 'seasonal'],
      required: true
    },
    recurring: {
      frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'bi-weekly', 'quarterly']
      },
      daysOfWeek: [{
        type: Number,
        min: 0,
        max: 6 // 0 = Sunday, 6 = Saturday
      }],
      timeOfDay: {
        start: String, // "9:00 AM"
        end: String    // "5:00 PM"
      }
    },
    events: [{
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      },
      time: {
        start: String,
        end: String
      }
    }]
  },
  vendorInfo: {
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1']
    },
    boothSizes: [{
      size: String,
      price: Number,
      description: String
    }],
    requirements: [String],
    applicationDeadline: Date,
    applicationFee: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    amenities: [String]
  },
  promoter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  images: [{
    url: String,
    caption: String,
    isHero: {
      type: Boolean,
      default: false
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votes: {
      up: { type: Number, default: 0 },
      down: { type: Number, default: 0 }
    }
  }],
  hashtags: [{
    text: {
      type: String,
      required: true,
      maxlength: [30, 'Hashtag must be less than 30 characters']
    },
    votes: {
      up: { type: Number, default: 0 },
      down: { type: Number, default: 0 }
    },
    suggestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  statistics: {
    totalTrackers: {
      type: Number,
      default: 0
    },
    totalApplications: {
      type: Number,
      default: 0
    },
    totalPhotos: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    }
  },
  contact: {
    email: String,
    phone: String,
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  accessibility: {
    wheelchairAccessible: {
      type: Boolean,
      default: false
    },
    parkingAvailable: {
      type: Boolean,
      default: false
    },
    publicTransport: {
      type: Boolean,
      default: false
    },
    restrooms: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

#### Indexes
```javascript
// Geospatial index
db.markets.createIndex({ 'location.coordinates': '2dsphere' })

// Category indexes
db.markets.createIndex({ category: 1 })
db.markets.createIndex({ 'dates.type': 1 })
db.markets.createIndex({ promoter: 1 })
db.markets.createIndex({ isActive: 1 })
db.markets.createIndex({ isVerified: 1 })
db.markets.createIndex({ createdAt: -1 })
db.markets.createIndex({ updatedAt: -1 })

// Statistics indexes
db.markets.createIndex({ 'statistics.totalTrackers': -1 })
db.markets.createIndex({ 'statistics.totalApplications': -1 })

// Compound indexes
db.markets.createIndex({ isActive: 1, category: 1 })
db.markets.createIndex({ isActive: 1, createdAt: -1 })
db.markets.createIndex({ promoter: 1, isActive: 1 })
db.markets.createIndex({ category: 1, 'location.state': 1 })
db.markets.createIndex({ category: 1, 'location.city': 1 })

// Location-based search indexes
db.markets.createIndex({ 'location.state': 1, 'location.city': 1 })

// Full-text search index
db.markets.createIndex({
  name: 'text',
  description: 'text',
  'location.city': 'text',
  'location.state': 'text'
})
```

#### Virtual Fields
- `heroImage`: Returns the hero image or the most voted image
- `upcomingEvents`: Returns future events for one-time markets
- `nextEventDate`: Returns the next event date

#### Methods
- `incrementStat(statName, incrementBy)`: Increment statistics counters
- `updateHashtagVotes(hashtagId, userId, voteType)`: Update hashtag voting

### 3. Applications Collection

**Collection Name**: `applications`

#### Schema Definition
```javascript
{
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under-review', 'approved', 'rejected', 'withdrawn'],
    default: 'draft'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under-review', 'approved', 'rejected', 'withdrawn'],
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  businessInfo: {
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [100, 'Business name must be less than 100 characters']
    },
    businessType: {
      type: String,
      enum: ['individual', 'partnership', 'llc', 'corporation'],
      required: [true, 'Business type is required']
    },
    description: {
      type: String,
      required: [true, 'Business description is required'],
      maxlength: [500, 'Description must be less than 500 characters']
    },
    yearsInBusiness: {
      type: Number,
      min: [0, 'Years in business cannot be negative']
    },
    website: String,
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  products: [{
    name: {
      type: String,
      required: true,
      maxlength: [100, 'Product name must be less than 100 characters']
    },
    category: {
      type: String,
      required: true,
      enum: ['produce', 'bakery', 'dairy', 'meat', 'crafts', 'jewelry', 'clothing', 'art', 'other']
    },
    description: {
      type: String,
      maxlength: [300, 'Product description must be less than 300 characters']
    },
    priceRange: {
      min: Number,
      max: Number
    },
    isLocal: {
      type: Boolean,
      default: true
    },
    isOrganic: Boolean,
    certifications: [String]
  }],
  boothRequirements: {
    spaceNeeded: {
      type: String,
      enum: ['small', 'medium', 'large', 'extra-large'],
      required: [true, 'Space size is required']
    },
    electricity: {
      type: Boolean,
      default: false
    },
    water: {
      type: Boolean,
      default: false
    },
    tent: {
      type: Boolean,
      default: false
    },
    tables: {
      type: Number,
      default: 0
    },
    chairs: {
      type: Number,
      default: 0
    },
    specialRequirements: String
  },
  insurance: {
    generalLiability: {
      hasInsurance: {
        type: Boolean,
        default: false
      },
      coverage: Number,
      provider: String,
      policyNumber: String,
      expirationDate: Date
    },
    foodHandlersPermit: {
      hasPermit: {
        type: Boolean,
        default: false
      },
      permitNumber: String,
      expirationDate: Date
    },
    businessLicense: {
      hasLicense: {
        type: Boolean,
        default: false
      },
      licenseNumber: String,
      expirationDate: Date
    }
  },
  documents: {
    businessLicense: [{
      url: String,
      filename: String,
      uploadedAt: Date
    }],
    insuranceCertificate: [{
      url: String,
      filename: String,
      uploadedAt: Date
    }],
    permits: [{
      type: String,
      url: String,
      filename: String,
      uploadedAt: Date
    }],
    photos: [{
      url: String,
      filename: String,
      caption: String,
      uploadedAt: Date
    }]
  },
  fees: {
    applicationFee: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      paid: {
        type: Boolean,
        default: false
      },
      paidAt: Date,
      transactionId: String
    },
    boothFee: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    }
  },
  marketing: {
    socialMediaLinks: {
      facebook: String,
      instagram: String,
      twitter: String
    },
    marketingMaterials: String,
    previousMarkets: [String],
    awards: [String]
  },
  internalNotes: [{
    note: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  }],
  review: {
    assignedReviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    approvalNotes: String,
    rejectionReason: String,
    waitlistPosition: Number
  },
  communication: {
    preferredContact: {
      type: String,
      enum: ['email', 'phone', 'both'],
      default: 'email'
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  },
  submittedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  version: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

#### Indexes
```javascript
// Unique compound index
db.applications.createIndex({ vendor: 1, market: 1 }, { unique: true })

// Status-based indexes
db.applications.createIndex({ vendor: 1, status: 1 })
db.applications.createIndex({ market: 1, status: 1 })
db.applications.createIndex({ status: 1, submittedAt: -1 })
db.applications.createIndex({ 'review.assignedReviewer': 1 })

// Date indexes
db.applications.createIndex({ createdAt: -1 })
db.applications.createIndex({ updatedAt: -1 })
db.applications.createIndex({ submittedAt: -1 })

// Soft delete indexes
db.applications.createIndex({ isDeleted: 1 })
db.applications.createIndex({ submittedAt: 1, status: 1 })

// Compound date range indexes
db.applications.createIndex({ submittedAt: 1, status: 1 })
db.applications.createIndex({ createdAt: 1, status: 1 })

// Filtering compound indexes
db.applications.createIndex({ status: 1, 'review.assignedReviewer': 1 })
db.applications.createIndex({ vendor: 1, isDeleted: 1 })
db.applications.createIndex({ market: 1, isDeleted: 1 })
db.applications.createIndex({ status: 1, 'statusHistory.changedAt': -1 })
```

#### Virtual Fields
- `isComplete`: Returns boolean indicating if application is ready for submission
- `daysSinceSubmission`: Returns days since application was submitted
- `statusAge`: Returns days since last status change

#### Methods
- `submit()`: Submit the application for review
- `updateStatus(newStatus, changedBy, notes)`: Update application status
- `addInternalNote(note, author, isPublic)`: Add internal note
- `withdraw(reason)`: Withdraw application
- `softDelete()`: Soft delete application

#### Static Methods
- `getVendorApplications(vendorId, options)`: Get applications for vendor
- `getMarketApplications(marketId, options)`: Get applications for market
- `getAssignedApplications(reviewerId, options)`: Get applications for reviewer

### 4. Comments Collection

**Collection Name**: `comments`

#### Schema Definition
```javascript
{
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [1000, 'Comment must be less than 1000 characters']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  editedAt: Date,
  editHistory: [{
    oldContent: String,
    editedAt: Date,
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reactionType: {
      type: String,
      enum: ['like', 'dislike', 'love', 'laugh', 'angry', 'sad']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'inappropriate', 'misinformation', 'other']
    },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending'
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

## Relationships Overview

### Entity Relationships
1. **User → Markets**: One-to-many (promoter can create multiple markets)
2. **User → Applications**: One-to-many (vendor can submit multiple applications)
3. **User → Comments**: One-to-many (user can post multiple comments)
4. **Market → Applications**: One-to-many (market can have multiple applications)
5. **Market → Comments**: One-to-many (market can have multiple comments)
6. **Market → Photos**: One-to-many (market can have multiple photos)
7. **Application → User**: Many-to-one (applications belong to vendors)
8. **Application → Market**: Many-to-one (applications belong to markets)
9. **Comment → Comment**: Self-referencing (replies to comments)

### Collection Relationships Table

| Collection | Related To | Relationship Type | Foreign Key(s) |
|------------|------------|-------------------|----------------|
| users | markets | 1:N (promoter) | markets.promoter |
| users | applications | 1:N (vendor) | applications.vendor |
| users | comments | 1:N (author) | comments.user |
| users | photos | 1:N (uploader) | photos.user |
| users | todos | 1:N (owner) | todos.vendor |
| users | expenses | 1:N (owner) | expenses.vendor |
| users | notifications | 1:N (recipient) | notifications.user |
| markets | applications | 1:N (host) | applications.market |
| markets | comments | 1:N (subject) | comments.market |
| markets | photos | 1:N (subject) | photos.market |
| markets | todos | 1:N (context) | todos.market |
| markets | expenses | 1:N (context) | expenses.market |
| applications | users | N:1 (vendors) | vendor, statusHistory.changedBy |
| applications | markets | N:1 (hosts) | market |
| comments | users | N:1 (authors) | user, deletedBy, editedBy.user |
| comments | markets | N:1 (subjects) | market |
| comments | comments | N:1 (parents) | parent |
| photos | users | N:1 (uploaders) | user |
| photos | markets | N:1 (subjects) | market |
| todos | users | N:1 (owners) | vendor |
| todos | markets | N:1 (contexts) | market |
| expenses | users | N:1 (owners) | vendor |
| expenses | markets | N:1 (contexts) | market |
| notifications | users | N:1 (recipients) | user |

## Data Integrity and Validation

### Pre-save Middleware
- **Users**: Password hashing, validation
- **Applications**: Status transition validation
- **Comments**: Content moderation checks

### Virtual Fields
- Computed properties that don't persist to database
- Used for convenient data access patterns

### Instance Methods
- Business logic operations on individual documents
- Password comparison, status updates, etc.

### Static Methods
- Collection-level query helpers
- Commonly used query patterns

## Performance Considerations

### Indexing Strategy
- Single field indexes for frequently queried fields
- Compound indexes for multi-field queries
- Geospatial indexes for location-based searches
- Full-text indexes for search functionality
- Covered queries where possible

### Query Optimization
- Pagination for large result sets
- Selective field projection
- Aggregation pipelines for complex queries
- Caching strategies for frequently accessed data

### Scalability
- Horizontal scaling with MongoDB sharding
- Read replicas for high-traffic queries
- Connection pooling and optimization

---

*This database schema documentation is automatically kept in sync with the Mongoose models in the codebase.*