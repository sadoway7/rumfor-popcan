const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema({
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
  // Vendor Business Information
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
  // Products and Services
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
  // Booth Requirements
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
  // Insurance and Permits
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
  // Documents and Files
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
  // Financial Information
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
  // Marketing and Social Media
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
  // Internal Notes and Review
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
  // Review and Approval Workflow
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
  // Communication and Timeline
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
  // Metadata
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for checking if application is complete
applicationSchema.virtual('isComplete').get(function() {
  // Basic completeness check
  return !!(
    this.businessInfo.businessName &&
    this.businessInfo.businessType &&
    this.businessInfo.description &&
    this.businessInfo.phone &&
    this.businessInfo.email &&
    this.products.length > 0 &&
    this.boothRequirements.spaceNeeded
  )
})

// Virtual for days since submission
applicationSchema.virtual('daysSinceSubmission').get(function() {
  if (!this.submittedAt) return null
  const now = new Date()
  const diffTime = now - this.submittedAt
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for current status age
applicationSchema.virtual('statusAge').get(function() {
  if (!this.statusHistory || this.statusHistory.length === 0) return null
  const latestStatus = this.statusHistory[this.statusHistory.length - 1]
  if (!latestStatus.changedAt) return null
  const now = new Date()
  const diffTime = now - latestStatus.changedAt
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
})

// Indexes for performance
applicationSchema.index({ vendor: 1, market: 1 }, { unique: true })
applicationSchema.index({ vendor: 1, status: 1 })
applicationSchema.index({ market: 1, status: 1 })
applicationSchema.index({ status: 1, submittedAt: -1 })
applicationSchema.index({ 'review.assignedReviewer': 1 })
applicationSchema.index({ createdAt: -1 })
applicationSchema.index({ updatedAt: -1 })
applicationSchema.index({ isDeleted: 1 })
applicationSchema.index({ submittedAt: -1 })

// Date range indexes for better query performance
applicationSchema.index({ submittedAt: 1, status: 1 })
applicationSchema.index({ createdAt: 1, status: 1 })

// Compound indexes for common filtering patterns
applicationSchema.index({ status: 1, 'review.assignedReviewer': 1 })
applicationSchema.index({ vendor: 1, isDeleted: 1 })
applicationSchema.index({ market: 1, isDeleted: 1 })
applicationSchema.index({ status: 1, 'statusHistory.changedAt': -1 })

// Method to submit application
applicationSchema.methods.submit = function() {
  if (this.status !== 'draft') {
    throw new Error('Only draft applications can be submitted')
  }

  if (!this.isComplete) {
    throw new Error('Application must be complete before submission')
  }

  this.status = 'submitted'
  this.submittedAt = new Date()
  this.statusHistory.push({
    status: 'submitted',
    changedBy: this.vendor,
    changedAt: new Date(),
    notes: 'Application submitted'
  })

  return this.save()
}

// Method to update status
applicationSchema.methods.updateStatus = function(newStatus, changedBy, notes = '') {
  const validStatuses = ['draft', 'submitted', 'under-review', 'approved', 'rejected', 'withdrawn']

  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid status')
  }

  this.status = newStatus
  this.statusHistory.push({
    status: newStatus,
    changedBy,
    changedAt: new Date(),
    notes
  })

  // Update review information for certain status changes
  if (newStatus === 'under-review') {
    this.review.reviewedAt = new Date()
    this.review.assignedReviewer = changedBy
  } else if (newStatus === 'approved' || newStatus === 'rejected') {
    this.review.reviewedAt = new Date()
    if (newStatus === 'approved') {
      this.review.approvalNotes = notes
    } else {
      this.review.rejectionReason = notes
    }
  }

  return this.save()
}

// Method to add internal note
applicationSchema.methods.addInternalNote = function(note, author, isPublic = false) {
  this.internalNotes.push({
    note,
    author,
    createdAt: new Date(),
    isPublic
  })

  return this.save()
}

// Method to withdraw application
applicationSchema.methods.withdraw = function(reason = '') {
  if (this.status === 'approved') {
    throw new Error('Approved applications cannot be withdrawn')
  }

  this.status = 'withdrawn'
  this.statusHistory.push({
    status: 'withdrawn',
    changedBy: this.vendor,
    changedAt: new Date(),
    notes: reason || 'Application withdrawn by vendor'
  })

  return this.save()
}

// Method to soft delete
applicationSchema.methods.softDelete = function() {
  this.isDeleted = true
  this.deletedAt = new Date()

  return this.save()
}

// Static method to get applications for vendor
applicationSchema.statics.getVendorApplications = function(vendorId, options = {}) {
  const {
    status,
    marketId,
    sortBy = 'submittedAt',
    sortOrder = 'desc'
  } = options

  const query = {
    vendor: vendorId,
    isDeleted: false
  }

  if (status) query.status = status
  if (marketId) query.market = marketId

  const sortOptions = {}
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

  return this.find(query)
    .populate('market', 'name location.city location.state dates')
    .sort(sortOptions)
}

// Static method to get applications for market
applicationSchema.statics.getMarketApplications = function(marketId, options = {}) {
  const {
    status,
    sortBy = 'submittedAt',
    sortOrder = 'desc'
  } = options

  const query = {
    market: marketId,
    isDeleted: false
  }

  if (status) query.status = status

  const sortOptions = {}
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

  return this.find(query)
    .populate('vendor', 'username profile.firstName profile.lastName businessInfo.businessName')
    .sort(sortOptions)
}

// Static method to get applications for reviewer
applicationSchema.statics.getAssignedApplications = function(reviewerId, options = {}) {
  const {
    status = 'under-review',
    sortBy = 'submittedAt',
    sortOrder = 'asc'
  } = options

  const query = {
    'review.assignedReviewer': reviewerId,
    status,
    isDeleted: false
  }

  const sortOptions = {}
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

  return this.find(query)
    .populate('vendor', 'username profile.firstName profile.lastName businessInfo.businessName')
    .populate('market', 'name location.city location.state')
    .sort(sortOptions)
}

module.exports = mongoose.model('Application', applicationSchema)