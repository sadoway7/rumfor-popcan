const mongoose = require('mongoose')

const userMarketTrackingSchema = new mongoose.Schema({
  user: {
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
    enum: ['interested', 'applied', 'approved', 'attending', 'declined', 'cancelled', 'completed', 'archived'],
    default: 'interested'
  },
  applicationData: {
    // Custom fields defined by promoter
    fields: [{
      name: String,
      value: mongoose.Schema.Types.Mixed
    }],
    notes: String,
    submittedAt: Date,
    reviewedAt: Date,
    reviewNotes: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  personalNotes: String,
  isArchived: {
    type: Boolean,
    default: false
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  // Vendor tracking statistics
  todoCount: {
    type: Number,
    default: 0
  },
  todoProgress: {
    type: Number,
    default: 0
  },
  totalExpenses: {
    type: Number,
    default: 0
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

// Compound indexes for performance and data integrity
userMarketTrackingSchema.index({ user: 1, market: 1 }, { unique: true })
userMarketTrackingSchema.index({ user: 1, status: 1 })
userMarketTrackingSchema.index({ market: 1, status: 1 })
userMarketTrackingSchema.index({ user: 1, createdAt: -1 })
userMarketTrackingSchema.index({ market: 1, createdAt: -1 })

// Virtual for days since tracking
userMarketTrackingSchema.virtual('daysSinceTracking').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24))
})

// Method to update status with validation
userMarketTrackingSchema.methods.updateStatus = function(newStatus, options = {}) {
  const { isValidApplicationStatusTransition } = require('../utils/marketLogic')

  // Use the centralized business logic for status transitions
  if (!isValidApplicationStatusTransition(this.status, newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`)
  }

  this.status = newStatus

  if (options.notes) {
    this.personalNotes = options.notes
  }

  return this.save()
}

// Method to submit application
userMarketTrackingSchema.methods.submitApplication = function(applicationData) {
  if (this.status !== 'interested') {
    throw new Error('Can only submit application from interested status')
  }
  
  this.applicationData = {
    fields: applicationData.fields || [],
    notes: applicationData.notes || '',
    submittedAt: new Date()
  }
  
  this.status = 'applied'
  
  return this.save()
}

// Method to review application (for promoters)
userMarketTrackingSchema.methods.reviewApplication = function(decision, reviewedBy, notes = '') {
  if (this.status !== 'applied') {
    throw new Error('Can only review applications in applied status')
  }
  
  this.applicationData.reviewedAt = new Date()
  this.applicationData.reviewedBy = reviewedBy
  this.applicationData.reviewNotes = notes
  
  if (decision === 'approve') {
    this.status = 'approved'
  } else if (decision === 'reject') {
    this.status = 'declined'
  }
  
  return this.save()
}

// Static method to get user's market counts by status
userMarketTrackingSchema.statics.getUserStatusCounts = function(userId) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), isArchived: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ])
}

// Static method to get market's application statistics
userMarketTrackingSchema.statics.getMarketApplicationStats = function(marketId) {
  return this.aggregate([
    { $match: { market: new mongoose.Types.ObjectId(marketId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalApplications: {
          $sum: { $cond: [{ $in: ['$status', ['applied', 'approved', 'completed']] }, 1, 0] }
        }
      }
    }
  ])
}

module.exports = mongoose.model('UserMarketTracking', userMarketTrackingSchema)