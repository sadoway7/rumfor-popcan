const mongoose = require('mongoose')

const photoSchema = new mongoose.Schema({
  title: {
    type: String,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  caption: {
    type: String,
    maxlength: [500, 'Caption must be less than 500 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  imagePublicId: {
    type: String, // For Cloudinary
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    required: true
  },
  votes: {
    up: {
      type: Number,
      default: 0
    },
    down: {
      type: Number,
      default: 0
    }
  },
  voters: {
    up: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    down: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  metadata: {
    size: Number, // File size in bytes
    format: String, // jpg, png, gif, etc.
    width: Number,
    height: Number,
    originalName: String
  },
  moderation: {
    isPending: {
      type: Boolean,
      default: true
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    isRejected: {
      type: Boolean,
      default: false
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    moderationNotes: String,
    isFlagged: {
      type: Boolean,
      default: false
    },
    flags: [{
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      reason: {
        type: String,
        enum: ['spam', 'inappropriate', 'copyright', 'off-topic', 'other'],
        required: true
      },
      description: String,
      reportedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  tags: [{
    type: String,
    maxlength: [30, 'Tag must be less than 30 characters']
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
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

// Virtual for vote score
photoSchema.virtual('voteScore').get(function() {
  return this.votes.up - this.votes.down
})

// Virtual for vote percentage
photoSchema.virtual('votePercentage').get(function() {
  const total = this.votes.up + this.votes.down
  if (total === 0) return 0
  return Math.round((this.votes.up / total) * 100)
})

// Virtual for checking if photo is approved
photoSchema.virtual('isApproved').get(function() {
  return !this.moderation.isPending && this.moderation.isApproved && !this.isDeleted
})

// Virtual for checking if photo is featured (hero image)
photoSchema.virtual('isFeatured').get(function() {
  return this.isApproved && this.voteScore > 5 // Featured if high score
})

// Indexes for performance
photoSchema.index({ market: 1, createdAt: -1 })
photoSchema.index({ uploadedBy: 1 })
photoSchema.index({ 'moderation.isPending': 1, 'moderation.isApproved': 1 })
photoSchema.index({ isDeleted: 1 })
photoSchema.index({ 'votes.up': -1 })
photoSchema.index({ createdAt: -1 })

// Text search index
photoSchema.index({
  title: 'text',
  caption: 'text',
  tags: 'text'
})

// Method to add vote
photoSchema.methods.addVote = function(userId, voteType) {
  if (voteType !== 'up' && voteType !== 'down') {
    throw new Error('Vote type must be "up" or "down"')
  }
  
  // Check if user already voted
  const existingUpVote = this.voters.up.find(vote => vote.user.equals(userId))
  const existingDownVote = this.voters.down.find(vote => vote.user.equals(userId))
  
  // Remove existing votes
  if (existingUpVote) {
    this.voters.up = this.voters.up.filter(vote => !vote.user.equals(userId))
    this.votes.up--
  }
  if (existingDownVote) {
    this.voters.down = this.voters.down.filter(vote => !vote.user.equals(userId))
    this.votes.down--
  }
  
  // Add new vote if different from existing
  if (voteType === 'up' && !existingUpVote) {
    this.voters.up.push({ user: userId, timestamp: new Date() })
    this.votes.up++
  } else if (voteType === 'down' && !existingDownVote) {
    this.voters.down.push({ user: userId, timestamp: new Date() })
    this.votes.down++
  }
  
  return this.save()
}

// Method to remove vote
photoSchema.methods.removeVote = function(userId) {
  // Remove from up votes
  this.voters.up = this.voters.up.filter(vote => !vote.user.equals(userId))
  this.votes.up = this.voters.up.length
  
  // Remove from down votes
  this.voters.down = this.voters.down.filter(vote => !vote.user.equals(userId))
  this.votes.down = this.voters.down.length
  
  return this.save()
}

// Method to approve photo
photoSchema.methods.approve = function(moderatedBy, notes = '') {
  this.moderation.isPending = false
  this.moderation.isApproved = true
  this.moderation.isRejected = false
  this.moderation.moderatedBy = moderatedBy
  this.moderation.moderatedAt = new Date()
  this.moderation.moderationNotes = notes
  
  return this.save()
}

// Method to reject photo
photoSchema.methods.reject = function(moderatedBy, notes = '') {
  this.moderation.isPending = false
  this.moderation.isApproved = false
  this.moderation.isRejected = true
  this.moderation.moderatedBy = moderatedBy
  this.moderation.moderatedAt = new Date()
  this.moderation.moderationNotes = notes
  
  return this.save()
}

// Method to flag photo
photoSchema.methods.flag = function(reportedBy, reason, description = '') {
  this.moderation.isFlagged = true
  this.moderation.flags.push({
    reportedBy,
    reason,
    description,
    reportedAt: new Date()
  })
  
  return this.save()
}

// Method to soft delete photo
photoSchema.methods.softDelete = function() {
  this.isDeleted = true
  this.deletedAt = new Date()
  
  return this.save()
}

// Static method to get photos for a market with voting
photoSchema.statics.getMarketPhotos = function(marketId, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    includePending = false
  } = options
  
  const query = {
    market: marketId,
    isDeleted: false
  }
  
  // Only include approved photos unless explicitly requested
  if (!includePending) {
    query['moderation.isApproved'] = true
    query['moderation.isPending'] = false
    query['moderation.isRejected'] = false
  }
  
  const sortOptions = {}
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1
  
  return this.find(query)
    .populate('uploadedBy', 'username profile.firstName profile.lastName')
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
}

// Static method to get featured photos for a market
photoSchema.statics.getFeaturedPhotos = function(marketId, limit = 10) {
  return this.find({
    market: marketId,
    isDeleted: false,
    'moderation.isApproved': true,
    'moderation.isPending': false,
    'moderation.isRejected': false
  })
  .populate('uploadedBy', 'username profile.firstName profile.lastName')
  .sort({ 'votes.up': -1, createdAt: -1 })
  .limit(limit)
}

// Static method to get photo statistics for a market
photoSchema.statics.getMarketPhotoStats = function(marketId) {
  return this.aggregate([
    { $match: { market: mongoose.Types.ObjectId(marketId), isDeleted: false } },
    {
      $group: {
        _id: null,
        totalPhotos: { $sum: 1 },
        totalVotes: { $sum: { $add: ['$votes.up', '$votes.down'] } },
        totalUpVotes: { $sum: '$votes.up' },
        totalDownVotes: { $sum: '$votes.down' },
        pendingPhotos: {
          $sum: { $cond: ['$moderation.isPending', 1, 0] }
        },
        approvedPhotos: {
          $sum: { $cond: ['$moderation.isApproved', 1, 0] }
        }
      }
    }
  ])
}

module.exports = mongoose.model('Photo', photoSchema)