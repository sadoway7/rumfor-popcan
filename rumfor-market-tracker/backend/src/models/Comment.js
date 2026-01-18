const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [2000, 'Comment must be less than 2000 characters'],
    minlength: [1, 'Comment cannot be empty']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['like', 'dislike', 'love', 'laugh', 'angry', 'sad'],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  isModerated: {
    type: Boolean,
    default: false
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  moderationReason: String,
  reported: {
    type: Boolean,
    default: false
  },
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    details: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies ? this.replies.length : 0
})

// Virtual for total reaction count
commentSchema.virtual('totalReactions').get(function() {
  return this.reactions ? this.reactions.length : 0
})

// Virtual for checking if comment is a reply
commentSchema.virtual('isReply').get(function() {
  return !!this.parentId
})

// Indexes for performance
commentSchema.index({ market: 1, createdAt: -1 })
commentSchema.index({ author: 1 })
commentSchema.index({ parentId: 1 })
commentSchema.index({ isDeleted: 1, isModerated: 1 })
commentSchema.index({ market: 1, parentId: 1, createdAt: 1 })

// Method to check if user reacted
commentSchema.methods.hasUserReacted = function(userId, reactionType) {
  return this.reactions.some(r => r.user.toString() === userId.toString() && r.type === reactionType)
}

// Method to get reaction count by type
commentSchema.methods.getReactionCount = function(reactionType) {
  return this.reactions.filter(r => r.type === reactionType).length
}

// Method to get total reaction count
commentSchema.methods.getTotalReactions = function() {
  return this.reactions.length
}

// Static method to get comments for a market with pagination
commentSchema.statics.getMarketComments = function(marketId, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options

  return this.find({
    market: marketId,
    isDeleted: false,
    isModerated: false,
    parentId: null // Only top-level comments
  })
  .populate('author', 'username firstName lastName')
  .populate('replies.author', 'username firstName lastName')
  .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
  .skip((page - 1) * limit)
  .limit(limit)
}

// Static method to get replies for a comment
commentSchema.statics.getCommentReplies = function(commentId) {
  return this.find({
    parentId: commentId,
    isDeleted: false,
    isModerated: false
  })
  .populate('author', 'username firstName lastName')
  .sort({ createdAt: 1 })
}

module.exports = mongoose.model('Comment', commentSchema)