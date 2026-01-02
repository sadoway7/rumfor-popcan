const mongoose = require('mongoose')

const todoSchema = new mongoose.Schema({
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
    required: [true, 'Todo title is required'],
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
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  dueDate: Date,
  completedAt: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative']
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  notes: [{
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Note content must be less than 1000 characters']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  dependencies: [{
    todo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Todo'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked-by', 'related'],
      default: 'related'
    }
  }],
  tags: [{
    type: String,
    maxlength: [30, 'Tag must be less than 30 characters']
  }],
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: {
    type: String,
    maxlength: [100, 'Template name must be less than 100 characters']
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

// Virtual for checking if overdue
todoSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed'
})

// Virtual for days until due
todoSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null
  const now = new Date()
  const diffTime = this.dueDate - now
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for completion percentage (for parent todos with dependencies)
todoSchema.virtual('completionPercentage').get(function() {
  if (!this.dependencies || this.dependencies.length === 0) {
    return this.status === 'completed' ? 100 : 0
  }
  
  const blockingDeps = this.dependencies.filter(dep => dep.type === 'blocks')
  if (blockingDeps.length === 0) {
    return this.status === 'completed' ? 100 : 0
  }
  
  // Calculate completion based on blocking dependencies
  const completedBlocking = blockingDeps.filter(dep => dep.todo && dep.todo.status === 'completed')
  return Math.round((completedBlocking.length / blockingDeps.length) * 100)
})

// Virtual for urgency based on priority and due date
todoSchema.virtual('urgency').get(function() {
  if (this.status === 'completed') return 'completed'
  
  const daysUntil = this.daysUntilDue
  
  if (daysUntil === null) {
    // No due date, use priority
    switch (this.priority) {
      case 'urgent': return 'high'
      case 'high': return 'medium'
      default: return 'low'
    }
  }
  
  if (daysUntil < 0) return 'overdue'
  if (daysUntil === 0) return 'today'
  if (daysUntil === 1) return 'tomorrow'
  if (daysUntil <= 3) return 'this-week'
  if (daysUntil <= 7) return 'next-week'
  
  return 'future'
})

// Indexes for performance
todoSchema.index({ vendor: 1, market: 1 })
todoSchema.index({ vendor: 1, status: 1 })
todoSchema.index({ market: 1, status: 1 })
todoSchema.index({ dueDate: 1 })
todoSchema.index({ priority: 1 })
todoSchema.index({ category: 1 })
todoSchema.index({ isTemplate: 1 })
todoSchema.index({ createdAt: -1 })

// Method to mark as completed
todoSchema.methods.complete = function(completedBy) {
  this.status = 'completed'
  this.completedAt = new Date()
  this.completedBy = completedBy
  
  // If actual hours not set, use estimated hours
  if (!this.actualHours && this.estimatedHours) {
    this.actualHours = this.estimatedHours
  }
  
  return this.save()
}

// Method to mark as in progress
todoSchema.methods.start = function() {
  if (this.status === 'completed') {
    throw new Error('Cannot start a completed todo')
  }
  
  this.status = 'in-progress'
  return this.save()
}

// Method to add note
todoSchema.methods.addNote = function(content, createdBy) {
  this.notes.push({
    content,
    createdBy,
    createdAt: new Date()
  })
  
  return this.save()
}

// Method to update actual hours
todoSchema.methods.updateHours = function(actualHours) {
  if (actualHours < 0) {
    throw new Error('Actual hours cannot be negative')
  }
  
  this.actualHours = actualHours
  return this.save()
}

// Method to update cost
todoSchema.methods.updateCost = function(cost) {
  if (cost < 0) {
    throw new Error('Cost cannot be negative')
  }
  
  this.cost = cost
  return this.save()
}

// Method to soft delete
todoSchema.methods.softDelete = function() {
  this.isDeleted = true
  this.deletedAt = new Date()
  
  return this.save()
}

// Static method to get todos for vendor and market
todoSchema.statics.getVendorMarketTodos = function(vendorId, marketId, options = {}) {
  const {
    status,
    category,
    priority,
    sortBy = 'dueDate',
    sortOrder = 'asc'
  } = options
  
  const query = {
    vendor: vendorId,
    market: marketId,
    isDeleted: false
  }
  
  if (status) query.status = status
  if (category) query.category = category
  if (priority) query.priority = priority
  
  const sortOptions = {}
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1
  
  return this.find(query)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name')
    .sort(sortOptions)
}

// Static method to get todo statistics for vendor and market
todoSchema.statics.getVendorMarketStats = function(vendorId, marketId) {
  return this.aggregate([
    {
      $match: {
        vendor: mongoose.Types.ObjectId(vendorId),
        market: mongoose.Types.ObjectId(marketId),
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalCost: { $sum: '$cost' },
        totalEstimatedHours: { $sum: '$estimatedHours' },
        totalActualHours: { $sum: '$actualHours' }
      }
    }
  ])
}

// Static method to get overdue todos
todoSchema.statics.getOverdueTodos = function(vendorId) {
  return this.find({
    vendor: vendorId,
    isDeleted: false,
    status: { $ne: 'completed' },
    dueDate: { $lt: new Date() }
  })
  .populate('market', 'name location.city location.state')
  .sort({ dueDate: 1 })
}

// Static method to get todo templates
todoSchema.statics.getTemplates = function(category) {
  const query = { isTemplate: true, isDeleted: false }
  if (category) query.category = category
  
  return this.find(query)
    .sort({ category: 1, priority: 1, title: 1 })
}

// Static method to create todo from template
todoSchema.statics.createFromTemplate = function(templateId, vendorId, marketId, customizations = {}) {
  return this.findOne({ _id: templateId, isTemplate: true })
    .then(template => {
      if (!template) {
        throw new Error('Template not found')
      }
      
      const newTodo = new this({
        vendor: vendorId,
        market: marketId,
        title: customizations.title || template.title,
        description: customizations.description || template.description,
        category: customizations.category || template.category,
        priority: customizations.priority || template.priority,
        estimatedHours: customizations.estimatedHours || template.estimatedHours,
        dueDate: customizations.dueDate || template.dueDate,
        tags: customizations.tags || template.tags
      })
      
      return newTodo.save()
    })
}

module.exports = mongoose.model('Todo', todoSchema)