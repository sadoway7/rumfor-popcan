const mongoose = require('mongoose')

const marketSchema = new mongoose.Schema({
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
    // For recurring markets
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
    // For one-time markets
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for hero image
marketSchema.virtual('heroImage').get(function() {
  const heroImage = this.images.find(img => img.isHero)
  if (heroImage) return heroImage
  
  // If no hero image, return the image with most votes
  const sortedImages = this.images.sort((a, b) => (b.votes.up - b.votes.down) - (a.votes.up - a.votes.down))
  return sortedImages[0] || null
})

// Virtual for upcoming events
marketSchema.virtual('upcomingEvents').get(function() {
  if (this.dates.type === 'one-time') {
    return this.dates.events.filter(event => event.startDate > new Date())
  }
  return []
})

// Virtual for next event date
marketSchema.virtual('nextEventDate').get(function() {
  if (this.dates.type === 'one-time') {
    const upcoming = this.upcomingEvents
    return upcoming.length > 0 ? upcoming[0].startDate : null
  }
  // For recurring markets, calculate next occurrence
  // This would need more complex logic in a real implementation
  return null
})

// Indexes for performance
marketSchema.index({ 'location.coordinates': '2dsphere' }) // Geospatial index
marketSchema.index({ category: 1 })
marketSchema.index({ 'dates.type': 1 })
marketSchema.index({ promoter: 1 })
marketSchema.index({ isActive: 1 })
marketSchema.index({ isVerified: 1 })
marketSchema.index({ createdAt: -1 })
marketSchema.index({ updatedAt: -1 })
marketSchema.index({ 'statistics.totalTrackers': -1 })
marketSchema.index({ 'statistics.totalApplications': -1 })

// Compound indexes for common queries
marketSchema.index({ isActive: 1, category: 1 })
marketSchema.index({ isActive: 1, createdAt: -1 })
marketSchema.index({ promoter: 1, isActive: 1 })
marketSchema.index({ category: 1, 'location.state': 1 })
marketSchema.index({ category: 1, 'location.city': 1 })

// Index for location-based searches
marketSchema.index({ 'location.state': 1, 'location.city': 1 })

// Text search index
marketSchema.index({
  name: 'text',
  description: 'text',
  'location.city': 'text',
  'location.state': 'text'
})

// Method to increment statistics
marketSchema.methods.incrementStat = function(statName, incrementBy = 1) {
  if (this.statistics[statName] !== undefined) {
    this.statistics[statName] += incrementBy
    return this.save()
  }
  return Promise.resolve(this)
}

// Method to update hashtags with voting
marketSchema.methods.updateHashtagVotes = function(hashtagId, userId, voteType) {
  const hashtag = this.hashtags.id(hashtagId)
  if (!hashtag) return null
  
  // Remove any existing vote from this user for this hashtag
  if (!hashtag.voters) hashtag.voters = []
  hashtag.voters = hashtag.voters.filter(voter => !voter.userId.equals(userId))
  
  // Add new vote
  hashtag.voters.push({
    userId,
    vote: voteType,
    timestamp: new Date()
  })
  
  // Recalculate votes
  hashtag.votes.up = hashtag.voters.filter(v => v.vote === 'up').length
  hashtag.votes.down = hashtag.voters.filter(v => v.vote === 'down').length
  
  return this.save()
}

module.exports = mongoose.model('Market', marketSchema)