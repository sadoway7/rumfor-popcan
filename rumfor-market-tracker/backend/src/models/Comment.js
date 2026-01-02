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
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  reactions: {
    // Emoji reactions: 👍 ❤️ 😍 😢 😡 🤔
    thumbsUp: { type: Number, default: 0 },
    heart: { type: Number, default: 0 },
    smile: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
    thinking: { type: Number, default: 0 }
  },
  reactionUsers: {
    // Track which users reacted to prevent duplicate reactions
    thumbsUp: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    heart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    smile: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sad: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    angry: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    thinking: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
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
  isFlagged: {
    type: Boolean,
    default: false
  },
  flags: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'off-topic', 'other'],
      required: true
    },
    description: String,
    reportedAt: {
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
  const reactions = this.reactions || {}
  return Object.values(reactions).reduce((sum, count) => sum + count, 0)
})

// Virtual for checking if comment is a reply
commentSchema.virtual('isReply').get(function() {
  return !!this.parent
})

// Indexes for performance
commentSchema.index({ market: 1, createdAt: -1 })
commentSchema.index({ author: 1 })
commentSchema.index({ parent: 1 })
commentSchema.index({ isDeleted: 1, isModerated: 1 })
commentSchema.index({ market: 1, parent: 1, createdAt: 1 })

// Method to add reaction
commentSchema.methods.addReaction = function(userId, reactionType) {
  const validReactions = ['thumbsUp', 'heart', 'smile', 'sad', 'angry', 'thinking']
  
  if (!validReactions.includes(reactionType)) {
    throw new Error('Invalid reaction type')
  }
  
  // Remove existing reaction from this user for this type
  this.reactionUsers[reactionType] = this.reactionUsers[reactionType].filter(
    user => !user.equals(userId)
  )
  
  // Add new reaction
  this.reactionUsers[reactionType].push(userId)
  
  // Update count
  this.reactions[reactionType] = this.reactionUsers[reactionType].length
  
  return this.save()
}

// Method to remove reaction
commentSchema.methods.removeReaction = function(userId, reactionType) {
  const validReactions = ['thumbsUp', 'heart', 'smile', 'sad', 'angry', 'thinking']
  
  if (!validReactions.includes(reactionType)) {
    throw new Error('Invalid reaction type')
  }
  
  // Remove user from reaction array
  this.reactionUsers[reactionType] = this.reactionUsers[reactionType].filter(
    user => !user.equals(userId)
  )
  
  // Update count
  this.reactions[reactionType] = this.reactionUsers[reactionType].length
  
  return this.save()
}

// Method to add reply
commentSchema.methods.addReply = function(replyId) {
  if (!this.replies.includes(replyId)) {
    this.replies.push(replyId)
    return this.save()
  }
  return Promise.resolve(this)
}

// Method to edit comment
commentSchema.methods.editContent = function(newContent) {
  if (this.isDeleted || this.isModerated) {
    throw new Error('Cannot edit deleted or moderated comment')
  }
  
  this.content = newContent
  this.isEdited = true
  this.editedAt = new Date()
  
  return this.save()
}

// Method to delete comment (soft delete)
commentSchema.methods.softDelete = function() {
  this.isDeleted = true
  this.deletedAt = new Date()
  this.content = '[deleted]'
  
  return this.save()
}

// Method to moderate comment
commentSchema.methods.moderate = function(moderatedBy, reason) {
  this.isModerated = true
  this.moderatedBy = moderatedBy
  this.moderatedAt = new Date()
  this.moderationReason = reason
  this.content = '[moderated]'
  
  return this.save()
}

// Method to flag comment
commentSchema.methods.flag = function(reportedBy, reason, description = '') {
  this.isFlagged = true
  this.flags.push({
    reportedBy,
    reason,
    description,
    reportedAt: new Date()
  })
  
  return this.save()
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
    parent: null // Only top-level comments
  })
  .populate('author', 'username profile.firstName profile.lastName')
  .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
  .skip((page - 1) * limit)
  .limit(limit)
}

// Static method to get replies for a comment
commentSchema.statics.getCommentReplies = function(commentId) {
  return this.find({
    parent: commentId,
    isDeleted: false,
    isModerated: false
  })
  .populate('author', 'username profile.firstName profile.lastName')
  .sort({ createdAt: 1 })
}

module.exports = mongoose.model('Comment', commentSchema)