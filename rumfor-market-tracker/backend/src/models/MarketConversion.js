const mongoose = require('mongoose');

const marketConversionSchema = new mongoose.Schema({
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    required: true
  },

  // Who requested the conversion
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Current and target market types
  fromType: {
    type: String,
    enum: ['vendor', 'promoter', 'admin'],
    required: true
  },
  toType: {
    type: String,
    enum: ['vendor', 'promoter', 'admin'],
    required: true
  },

  // Conversion reason and details
  reason: {
    type: String,
    required: true,
    maxlength: 1000
  },
  details: {
    type: String,
    maxlength: 2000
  },

  // Required information for conversion
  conversionData: {
    // For vendor-to-promoter conversion
    businessLicense: String,
    insuranceCertificate: String,
    liabilityInsurance: String,
    contactEmail: String,
    contactPhone: String,

    // Additional requirements
    customFields: mongoose.Schema.Types.Mixed
  },

  // Review status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },

  // Review details
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,

  // Rejection reason
  rejectionReason: String,

  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
marketConversionSchema.index({ market: 1, status: 1 });
marketConversionSchema.index({ requestedBy: 1, status: 1 });
marketConversionSchema.index({ status: 1, createdAt: -1 });
marketConversionSchema.index({ reviewedBy: 1 });

// Virtual for days pending
marketConversionSchema.virtual('daysPending').get(function() {
  if (this.status !== 'pending') return null;

  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Instance method to approve conversion
marketConversionSchema.methods.approve = function(adminId, notes = '') {
  this.status = 'approved';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  return this.save();
};

// Instance method to reject conversion
marketConversionSchema.methods.reject = function(adminId, reason, notes = '') {
  this.status = 'rejected';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.rejectionReason = reason;
  this.reviewNotes = notes;
  return this.save();
};

module.exports = mongoose.model('MarketConversion', marketConversionSchema);