const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: [
      'application-status-change',
      'new-application',
      'market-updates',
      'comment-reply',
      'photo-upload',
      'market-reminder',
      'system-notification',
      'promoter-message',
      'promoter-verification',
      'marketing-email',
      'weekly-digest',
      'market-trending',
      'expense-reminder',
      'todo-deadline'
    ]
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [200, 'Title must be less than 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [1000, 'Message must be less than 1000 characters']
  },
  data: {
    // Additional data for the notification (marketId, userId, etc.)
    marketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Market'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserMarketTracking'
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    photoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photo'
    },
    todoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Todo'
    },
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense'
    },
    oldStatus: String,
    newStatus: String,
    customData: mongoose.Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channels: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,
  pushSent: {
    type: Boolean,
    default: false
  },
  pushSentAt: Date,
  expiresAt: Date,
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
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

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date()
})

// Virtual for notification age in hours
notificationSchema.virtual('ageInHours').get(function() {
  const now = new Date()
  const diffTime = now - this.createdAt
  return Math.floor(diffTime / (1000 * 60 * 60))
})

// Virtual for checking if notification is recent (less than 24 hours)
notificationSchema.virtual('isRecent').get(function() {
  return this.ageInHours < 24
})

// Indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, isRead: 1 })
notificationSchema.index({ recipient: 1, type: 1 })
notificationSchema.index({ createdAt: -1 })
notificationSchema.index({ priority: 1, createdAt: -1 })
notificationSchema.index({ expiresAt: 1 })
notificationSchema.index({ isRead: 1, createdAt: -1 })

// Compound index for unread notifications
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 })

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true
    this.readAt = new Date()
    return this.save()
  }
  return Promise.resolve(this)
}

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false
  this.readAt = undefined
  return this.save()
}

// Method to mark as archived
notificationSchema.methods.archive = function() {
  this.isArchived = true
  this.archivedAt = new Date()
  return this.save()
}

// Method to send email notification
notificationSchema.methods.sendEmail = function() {
  this.channels.email = true
  this.emailSent = true
  this.emailSentAt = new Date()
  return this.save()
}

// Method to send push notification
notificationSchema.methods.sendPush = function() {
  this.channels.push = true
  this.pushSent = true
  this.pushSentAt = new Date()
  return this.save()
}

// Method to set expiration
notificationSchema.methods.setExpiration = function(hoursFromNow) {
  const expirationDate = new Date()
  expirationDate.setHours(expirationDate.getHours() + hoursFromNow)
  this.expiresAt = expirationDate
  
  return this.save()
}

// Method to soft delete
notificationSchema.methods.softDelete = function() {
  this.isDeleted = true
  this.deletedAt = new Date()
  
  return this.save()
}

// Static method to get notifications for user
notificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
    type,
    priority,
    isArchived = false
  } = options
  
  const query = {
    recipient: userId,
    isDeleted: false,
    isArchived: isArchived
  }
  
  if (unreadOnly) {
    query.isRead = false
  }
  
  if (type) {
    query.type = type
  }
  
  if (priority) {
    query.priority = priority
  }
  
  return this.find(query)
    .populate('data.marketId', 'name location.city location.state')
    .populate('data.userId', 'username profile.firstName profile.lastName')
    .sort({ priority: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
}

// Static method to get unread notification count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    isDeleted: false,
    isArchived: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gte: new Date() } }
    ]
  })
}

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId, filter = {}) {
  const query = {
    recipient: userId,
    isRead: false,
    isDeleted: false,
    ...filter
  }
  
  return this.updateMany(query, {
    isRead: true,
    readAt: new Date()
  })
}

// Static method to archive old notifications
notificationSchema.statics.archiveOldNotifications = function(userId, daysOld = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)
  
  return this.updateMany(
    {
      recipient: userId,
      isRead: true,
      isArchived: false,
      isDeleted: false,
      createdAt: { $lt: cutoffDate }
    },
    {
      isArchived: true,
      archivedAt: new Date()
    }
  )
}

// Static method to create bulk notifications
notificationSchema.statics.createBulk = function(notifications) {
  return this.insertMany(notifications, { ordered: false })
}

// Static method to get notification statistics
notificationSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    {
      $match: {
        recipient: mongoose.Types.ObjectId(userId),
        isDeleted: false,
        isArchived: false
      }
    },
    {
      $group: {
        _id: '$isRead',
        count: { $sum: 1 },
        byType: {
          $push: '$type'
        },
        byPriority: {
          $push: '$priority'
        }
      }
    }
  ])
}

// Static method to clean up expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
    isDeleted: false
  })
}

module.exports = mongoose.model('Notification', notificationSchema)