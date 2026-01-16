const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message must be less than 1000 characters'],
    minlength: [1, 'Message cannot be empty']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    required: true
  },
  messageType: {
    type: String,
    enum: ['vendor-to-promoter', 'promoter-to-vendor', 'system'],
    default: 'vendor-to-promoter'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Virtual for message age
messageSchema.virtual('hoursAgo').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60))
})

// Indexes for performance
messageSchema.index({ market: 1, createdAt: -1 })
messageSchema.index({ sender: 1, recipient: 1, market: 1 })
messageSchema.index({ sender: 1, createdAt: -1 })
messageSchema.index({ recipient: 1, createdAt: -1 })
messageSchema.index({ isRead: 1 })

// Method to mark as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true
  this.readAt = new Date()
  return this.save()
}

// Method to archive message
messageSchema.methods.archive = function(archivedBy) {
  this.isArchived = true
  this.archivedAt = new Date()
  this.archivedBy = archivedBy
  return this.save()
}

// Static method to get conversation between two users for a market
messageSchema.statics.getConversation = function(user1, user2, marketId, options = {}) {
  const {
    page = 1,
    limit = 20
  } = options

  return this.find({
    market: marketId,
    $or: [
      { sender: user1, recipient: user2 },
      { sender: user2, recipient: user1 }
    ],
    isArchived: false
  })
  .populate('sender', 'username profile.firstName profile.lastName')
  .populate('recipient', 'username profile.firstName profile.lastName')
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
}

// Static method to get unread message count for user
messageSchema.statics.getUnreadCount = function(userId, marketId = null) {
  const query = {
    recipient: userId,
    isRead: false,
    isArchived: false
  }

  if (marketId) {
    query.market = marketId
  }

  return this.countDocuments(query)
}

// Static method to get all messages for a user in a market
messageSchema.statics.getUserMarketMessages = function(userId, marketId, options = {}) {
  const {
    page = 1,
    limit = 20,
    includeArchived = false
  } = options

  const query = {
    market: marketId,
    $or: [
      { sender: userId },
      { recipient: userId }
    ]
  }

  if (!includeArchived) {
    query.isArchived = false
  }

  return this.find(query)
    .populate('sender', 'username profile.firstName profile.lastName')
    .populate('recipient', 'username profile.firstName profile.lastName')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
}

module.exports = mongoose.model('Message', messageSchema)