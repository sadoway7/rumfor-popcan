const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: [true, 'Expense title is required'],
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
      'booth-fee',
      'supplies',
      'equipment',
      'transportation',
      'accommodation',
      'food-meals',
      'marketing',
      'insurance',
      'permits-licenses',
      'gasoline',
      'parking',
      'storage',
      'shipping',
      'utilities',
      'miscellaneous',
      'revenue' // For income tracking
    ]
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  actualAmount: {
    type: Number,
    default: undefined, // No default - let user set it when they actually spend
    min: [0, 'Actual amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  receipt: {
    url: String,
    publicId: String, // For Cloudinary
    filename: String,
    uploadedAt: Date
  },
  vendorContact: {  // Renamed from 'vendor' to avoid conflict with vendor ObjectId ref
    name: String,
    address: String,
    phone: String,
    email: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit-card', 'debit-card', 'check', 'bank-transfer', 'paypal', 'other'],
    default: 'other'
  },
  isTaxDeductible: {
    type: Boolean,
    default: false
  },
  taxCategory: {
    type: String,
    enum: ['office-expenses', 'travel', 'meals', 'transportation', 'equipment', 'supplies', 'other']
  },
  tags: [{
    type: String,
    maxlength: [30, 'Tag must be less than 30 characters']
  }],
  marketEvent: {
    eventName: String,
    startDate: Date,
    endDate: Date
  },
  mileage: {
    distance: {
      type: Number,
      min: [0, 'Distance cannot be negative']
    },
    rate: {
      type: Number,
      min: [0, 'Mileage rate cannot be negative']
    }
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
    },
    interval: {
      type: Number,
      min: 1,
      default: 1
    },
    endDate: Date,
    nextOccurrence: Date
  },
  isTaxReport: {
    type: Boolean,
    default: false
  },
  taxYear: {
    type: Number,
    min: 2000,
    max: 2100
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

// Virtual for calculated mileage cost
expenseSchema.virtual('mileageCost').get(function() {
  if (this.mileage.distance && this.mileage.rate) {
    return this.mileage.distance * this.mileage.rate
  }
  return 0
})

// Virtual for total cost (amount + mileage if applicable)
expenseSchema.virtual('totalCost').get(function() {
  return this.amount + this.mileageCost
})

// Virtual for expense type (income vs expense)
expenseSchema.virtual('type').get(function() {
  return this.category === 'revenue' ? 'income' : 'expense'
})

// Virtual for days since expense
expenseSchema.virtual('daysAgo').get(function() {
  const now = new Date()
  const diffTime = now - this.date
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
})

// Indexes for performance
expenseSchema.index({ vendor: 1, market: 1 })
expenseSchema.index({ vendor: 1, date: -1 })
expenseSchema.index({ market: 1, date: -1 })
expenseSchema.index({ category: 1 })
expenseSchema.index({ date: -1 })
expenseSchema.index({ isTaxDeductible: 1 })
expenseSchema.index({ taxYear: 1 })
expenseSchema.index({ isRecurring: 1 })

// Text search index
expenseSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
})

// Method to update mileage
expenseSchema.methods.updateMileage = function(distance, rate) {
  if (distance < 0 || rate < 0) {
    throw new Error('Distance and rate cannot be negative')
  }
  
  this.mileage.distance = distance
  this.mileage.rate = rate
  
  return this.save()
}

// Method to mark as tax deductible
expenseSchema.methods.markAsTaxDeductible = function(taxCategory) {
  this.isTaxDeductible = true
  this.taxCategory = taxCategory
  this.isTaxReport = true
  this.taxYear = new Date().getFullYear()
  
  return this.save()
}

// Method to add receipt
expenseSchema.methods.addReceipt = function(receiptData) {
  this.receipt = {
    url: receiptData.url,
    publicId: receiptData.publicId,
    filename: receiptData.filename,
    uploadedAt: new Date()
  }
  
  return this.save()
}

// Method to set tax year
expenseSchema.methods.setTaxYear = function(year) {
  this.taxYear = year
  this.isTaxReport = true
  
  return this.save()
}

// Method to create recurring expense
expenseSchema.methods.createRecurring = function(frequency, interval = 1, endDate = null) {
  this.isRecurring = true
  this.recurringPattern = {
    frequency,
    interval,
    endDate
  }
  
  // Calculate next occurrence
  const now = new Date()
  let nextDate = new Date(now)
  
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval)
      break
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (7 * interval))
      break
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval)
      break
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + (3 * interval))
      break
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + interval)
      break
  }
  
  this.recurringPattern.nextOccurrence = nextDate
  
  return this.save()
}

// Method to soft delete
expenseSchema.methods.softDelete = function() {
  this.isDeleted = true
  this.deletedAt = new Date()
  
  return this.save()
}

// Static method to get expenses for vendor and market
expenseSchema.statics.getVendorMarketExpenses = function(vendorId, marketId, options = {}) {
  const {
    category,
    dateFrom,
    dateTo,
    isTaxReport,
    sortBy = 'date',
    sortOrder = 'desc'
  } = options
  
  const query = {
    vendor: vendorId,
    market: marketId,
    isDeleted: false
  }
  
  if (category) query.category = category
  if (isTaxReport !== undefined) query.isTaxReport = isTaxReport
  if (dateFrom || dateTo) {
    query.date = {}
    if (dateFrom) query.date.$gte = new Date(dateFrom)
    if (dateTo) query.date.$lte = new Date(dateTo)
  }
  
  const sortOptions = {}
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1
  
  return this.find(query)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')
    .sort(sortOptions)
}

// Static method to get expense summary for vendor and market
expenseSchema.statics.getVendorMarketSummary = function(vendorId, marketId, dateFrom = null, dateTo = null) {
  const matchStage = {
    vendor: mongoose.Types.ObjectId(vendorId),
    market: mongoose.Types.ObjectId(marketId),
    isDeleted: false
  }
  
  if (dateFrom || dateTo) {
    matchStage.date = {}
    if (dateFrom) matchStage.date.$gte = new Date(dateFrom)
    if (dateTo) matchStage.date.$lte = new Date(dateTo)
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        totalMileage: { $sum: '$mileageCost' },
        count: { $sum: 1 },
        taxDeductible: {
          $sum: { $cond: ['$isTaxDeductible', '$amount', 0] }
        }
      }
    },
    {
      $group: {
        _id: null,
        categories: {
          $push: {
            category: '$_id',
            totalAmount: '$totalAmount',
            totalMileage: '$totalMileage',
            count: '$count',
            taxDeductible: '$taxDeductible'
          }
        },
        totalExpenses: { $sum: { $add: ['$totalAmount', '$totalMileage'] } },
        totalTaxDeductible: { $sum: '$taxDeductible' },
        totalCount: { $sum: '$count' }
      }
    }
  ])
}

// Static method to get tax report data
expenseSchema.statics.getTaxReport = function(vendorId, year) {
  return this.find({
    vendor: vendorId,
    isDeleted: false,
    isTaxReport: true,
    taxYear: year
  })
  .populate('market', 'name location.city location.state')
  .sort({ date: -1 })
}

// Static method to get recurring expenses
expenseSchema.statics.getRecurringExpenses = function(vendorId) {
  return this.find({
    vendor: vendorId,
    isDeleted: false,
    isRecurring: true,
    'recurringPattern.nextOccurrence': { $lte: new Date() }
  })
  .populate('market', 'name location.city location.state')
  .sort({ 'recurringPattern.nextOccurrence': 1 })
}

module.exports = mongoose.model('Expense', expenseSchema)