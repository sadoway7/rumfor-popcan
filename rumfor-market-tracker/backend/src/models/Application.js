const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Relationships
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  promoter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market'
  },

  // Application status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn'],
    default: 'draft'
  },

  // Step-by-step application data
  // Step 1: Business Information
  businessInfo: {
    businessName: { type: String, required: true },
    businessType: {
      type: String,
      enum: ['individual', 'llc', 'corporation', 'partnership', 'nonprofit'],
      required: true
    },
    taxId: String,
    businessLicense: String,
    yearsInOperation: Number,
    website: String,
    description: {
      type: String,
      maxlength: 1000
    },
    category: {
      type: String,
      enum: ['produce', 'baked_goods', 'meat', 'dairy', 'crafts', 'art', 'jewelry', 'clothing', 'books', 'antiques', 'food_trucks', 'plants', 'specialty', 'mixed'],
      required: true
    },
    specialRequirements: [String]
  },

  // Step 2: Products & Services
  products: [{
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    priceRange: {
      min: Number,
      max: Number
    },
    isOrganic: { type: Boolean, default: false },
    isLocallySourced: { type: Boolean, default: true },
    certifications: [String]
  }],

  // Step 3: Booth & Space Requirements
  spaceRequirements: {
    boothSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'extra_large'],
      default: 'medium'
    },
    specialEquipment: [String],
    electricity: {
      type: String,
      enum: ['none', 'basic', 'heavy'],
      default: 'none'
    },
    waterAccess: { type: Boolean, default: false },
    tentRequired: { type: Boolean, default: true },
    additionalNotes: String
  },

  // Step 4: Insurance & Compliance
  compliance: {
    liabilityInsurance: {
      provider: String,
      policyNumber: String,
      coverageAmount: Number,
      expirationDate: Date,
      certificateUrl: String
    },
    healthPermit: {
      type: {
        type: String,
        enum: ['food', 'health', 'alcohol', 'none']
      },
      number: String,
      expirationDate: Date,
      certificateUrl: String
    },
    businessLicense: {
      number: String,
      expirationDate: Date,
      certificateUrl: String
    },
    foodHandlerPermit: {
      type: String,
      enum: ['serve_safe', 'haccp', 'other', 'none'],
      number: String,
      expirationDate: Date,
      certificateUrl: String
    },
    agreementAccepted: { type: Boolean, default: false },
    agreementAcceptedAt: Date
  },

  // Step 5: Contact & Emergency Information
  contacts: [{
    type: {
      type: String,
      enum: ['primary', 'emergency', 'alternate'],
      default: 'primary'
    },
    name: { type: String, required: true },
    relationship: String,
    phone: { type: String, required: true },
    email: String
  }],

  // Application workflow
  submittedAt: Date,
  reviewedAt: Date,
  approvedAt: Date,
  rejectedAt: Date,

  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  reviewNotes: String,
  rejectionReason: String,

  // Booth assignment (once approved)
  boothAssignment: {
    boothNumber: String,
    location: String,
    size: String,
    assignedAt: Date,
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },

  // Fees and payments
  fees: {
    applicationFee: { type: Number, default: 0 },
    boothFee: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paid: { type: Boolean, default: false },
    paidAt: Date,
    paymentMethod: String,
    transactionId: String
  },

  // Communication and updates
  communicationHistory: [{
    type: {
      type: String,
      enum: ['note', 'email', 'phone', 'meeting']
    },
    direction: {
      type: String,
      enum: ['to_vendor', 'from_vendor', 'internal']
    },
    subject: String,
    message: { type: String, required: true },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentAt: { type: Date, default: Date.now },
    attachments: [String]
  }],

  // Audit and tracking
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Internal flags
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  followUpRequired: { type: Boolean, default: false },
  followUpDate: Date,

  // Market-specific metadata
  metadata: {
    previousApplications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    marketExperience: String,
    specialRequests: String,
    notes: String
  }
}, {
  timestamps: true
});

// Indexes
applicationSchema.index({ market: 1, status: 1 });
applicationSchema.index({ vendor: 1, market: 1 });
applicationSchema.index({ promoter: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ submittedAt: -1 });
applicationSchema.index({ 'businessInfo.businessName': 1 });
applicationSchema.index({ priority: 1 });
applicationSchema.index({ followUpRequired: 1 });

// Virtual for application completeness
applicationSchema.virtual('isComplete').get(function() {
  return this.businessInfo &&
         this.products.length > 0 &&
         this.compliance.agreementAccepted;
});

// Virtual for days since submission
applicationSchema.virtual('daysSinceSubmission').get(function() {
  if (!this.submittedAt) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.submittedAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Instance methods
applicationSchema.methods.submit = function() {
  if (this.status === 'draft' && this.isComplete) {
    this.status = 'submitted';
    this.submittedAt = new Date();
    return this.save();
  }
  throw new Error('Application is not ready for submission');
};

applicationSchema.methods.approve = function(reviewerId, boothAssignment = null) {
  this.status = 'approved';
  this.approvedAt = new Date();
  this.approvedBy = reviewerId;

  if (boothAssignment) {
    this.boothAssignment = {
      ...boothAssignment,
      assignedAt: new Date(),
      assignedBy: reviewerId
    };
  }

  return this.save();
};

applicationSchema.methods.reject = function(reviewerId, reason) {
  this.status = 'rejected';
  this.rejectedAt = new Date();
  this.reviewedBy = reviewerId;
  this.rejectionReason = reason;

  return this.save();
};

applicationSchema.methods.withdraw = function() {
  if (['draft', 'submitted', 'under_review'].includes(this.status)) {
    this.status = 'withdrawn';
    return this.save();
  }
  throw new Error('Cannot withdraw application in current status');
};

applicationSchema.methods.addCommunication = function(communication) {
  this.communicationHistory.push({
    ...communication,
    sentAt: new Date()
  });

  return this.save();
};

// Static methods
applicationSchema.statics.getApplicationStats = async function(marketId) {
  return this.aggregate([
    { $match: { market: marketId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

applicationSchema.statics.getPendingApplications = function(marketId) {
  return this.find({
    market: marketId,
    status: { $in: ['submitted', 'under_review'] }
  })
  .populate('vendor', 'firstName lastName businessName email')
  .sort({ submittedAt: 1 });
};

applicationSchema.statics.getVendorApplications = function(vendorId, marketId = null) {
  const query = { vendor: vendorId };
  if (marketId) query.market = marketId;

  return this.find(query)
    .populate('market', 'name location schedule')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Application', applicationSchema);