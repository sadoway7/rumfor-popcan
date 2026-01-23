const mongoose = require('mongoose')

const todoPresetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Preset title is required'],
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description must be less than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'custom',
      'setup',
      'products',
      'marketing',
      'logistics',
      'post-event',
      'financial',
      'travel',
      'equipment',
      'permits',
      'other'
    ]
  },
  priority: {
    type: String,
    enum: ['urgent', 'high', 'medium', 'low'],
    default: 'medium'
  },
  usageCount: {
    type: Number,
    default: 0
  },
  isSystem: {
    type: Boolean,
    default: false
  },
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

// Indexes for performance
todoPresetSchema.index({ user: 1, category: 1 })
todoPresetSchema.index({ user: 1, isDeleted: 1 })
todoPresetSchema.index({ user: 1, usageCount: -1 })
todoPresetSchema.index({ isSystem: 1, category: 1 })

// Virtual for formatted category
todoPresetSchema.virtual('categoryLabel').get(function() {
  const labels = {
    custom: 'Custom',
    setup: 'Setup',
    products: 'Products',
    marketing: 'Marketing',
    logistics: 'Logistics',
    'post-event': 'Post Event',
    financial: 'Financial',
    travel: 'Travel',
    equipment: 'Equipment',
    permits: 'Permits',
    other: 'Other'
  }
  return labels[this.category] || this.category
})

// Method to increment usage count
todoPresetSchema.methods.incrementUsage = function() {
  this.usageCount += 1
  return this.save()
}

// Method to soft delete
todoPresetSchema.methods.softDelete = function() {
  this.isDeleted = true
  this.deletedAt = new Date()
  return this.save()
}

// Static method to get user's presets
todoPresetSchema.statics.getUserPresets = function(userId, options = {}) {
  const {
    category,
    sortBy = 'usageCount',
    sortOrder = 'desc'
  } = options

  const query = {
    user: userId,
    isDeleted: false,
    isSystem: false // Only get user presets, not system presets
  }

  if (category) query.category = category

  const sortOptions = {}
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

  return this.find(query)
    .sort(sortOptions)
}

// Static method to get system presets
todoPresetSchema.statics.getSystemPresets = function(category) {
  const query = {
    isSystem: true,
    isDeleted: false
  }

  if (category) query.category = category

  return this.find(query)
    .sort({ category: 1, title: 1 })
}

// Static method to get all presets (user + system) for a category
todoPresetSchema.statics.getPresetsForCategory = function(userId, category) {
  return Promise.all([
    this.getSystemPresets(category),
    this.getUserPresets(userId, { category })
  ]).then(([systemPresets, userPresets]) => ({
    system: systemPresets,
    user: userPresets
  }))
}

module.exports = mongoose.model('TodoPreset', todoPresetSchema)
