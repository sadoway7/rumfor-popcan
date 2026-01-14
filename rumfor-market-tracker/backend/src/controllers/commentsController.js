const { catchAsync, AppError, sendSuccess } = require('../middleware/errorHandler')
const Comment = require('../models/Comment')
const Market = require('../models/Market')
const User = require('../models/User')

// Get all comments for a market
const getComments = catchAsync(async (req, res, next) => {
  const { marketId } = req.params
  const { page = 1, limit = 20 } = req.query

  // Verify market exists
  const market = await Market.findById(marketId)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  const comments = await Comment.find({ market: marketId })
    .populate('author', 'username profile.firstName profile.lastName')
    .populate('replies.author', 'username profile.firstName profile.lastName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec()

  const total = await Comment.countDocuments({ market: marketId })

  sendSuccess(res, {
    comments,
    pagination: {
      current: parseInt(page),
      total: Math.ceil(total / limit),
      count: comments.length
    }
  }, 'Comments retrieved successfully')
})

// Create a new comment
const createComment = catchAsync(async (req, res, next) => {
  const { marketId } = req.params
  const { content, parentId } = req.body
  const userId = req.user.id

  // Verify market exists
  const market = await Market.findById(marketId)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Validate input
  if (!content || content.trim().length === 0) {
    return next(new AppError('Comment content is required', 400))
  }

  if (content.length > 2000) {
    return next(new AppError('Comment content must be less than 2000 characters', 400))
  }

  const commentData = {
    content: content.trim(),
    author: userId,
    market: marketId
  }

  // If it's a reply, validate parent comment exists
  if (parentId) {
    const parentComment = await Comment.findById(parentId)
    if (!parentComment) {
      return next(new AppError('Parent comment not found', 404))
    }

    // Check if nesting level is acceptable (max 3 levels)
    let depth = 0
    let current = parentComment
    while (current.parentId) {
      depth++
      current = await Comment.findById(current.parentId)
      if (!current) break
      if (depth >= 2) { // Allow 3 total levels (0, 1, 2)
        return next(new AppError('Maximum reply nesting level reached', 400))
      }
    }

    commentData.parentId = parentId
  }

  const comment = await Comment.create(commentData)

  // Populate author info
  await comment.populate('author', 'username profile.firstName profile.lastName')

  // Update market comment count (simple increment)
  await Market.findByIdAndUpdate(marketId, { $inc: { commentCount: 1 } })

  // If it's a reply, add to parent comment's replies array
  if (parentId) {
    await Comment.findByIdAndUpdate(parentId, {
      $push: { replies: { _id: comment._id, author: comment.author, content: comment.content, createdAt: comment.createdAt } }
    })
  }

  sendSuccess(res, { comment }, 'Comment created successfully', 201)
})

// Update a comment
const updateComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params
  const { content } = req.body
  const userId = req.user.id

  if (!content || content.trim().length === 0) {
    return next(new AppError('Comment content is required', 400))
  }

  if (content.length > 2000) {
    return next(new AppError('Comment content must be less than 2000 characters', 400))
  }

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, author: userId },
    { content: content.trim(), updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate('author', 'username profile.firstName profile.lastName')

  if (!comment) {
    return next(new AppError('Comment not found or you do not have permission to edit it', 404))
  }

  // If it's a reply, update the parent's replies array
  if (comment.parentId) {
    await Comment.findByIdAndUpdate(comment.parentId, {
      $set: {
        "replies.$[elem]._id": comment._id,
        "replies.$[elem].content": comment.content,
        "replies.$[elem].updatedAt": comment.updatedAt
      }
    }, {
      arrayFilters: [{ "elem._id": comment._id }]
    })
  }

  sendSuccess(res, { comment }, 'Comment updated successfully')
})

// Delete a comment
const deleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params
  const userId = req.user.id
  const userRole = req.user.role

  const comment = await Comment.findById(commentId)
  if (!comment) {
    return next(new AppError('Comment not found', 404))
  }

  // Allow deletion if user is author or admin
  if (comment.author.toString() !== userId && userRole !== 'admin') {
    return next(new AppError('You do not have permission to delete this comment', 403))
  }

  // Delete the comment
  await Comment.findByIdAndDelete(commentId)

  // If it's a reply, remove it from parent's replies array
  if (comment.parentId) {
    await Comment.findByIdAndUpdate(comment.parentId, {
      $pull: { replies: { _id: comment._id } }
    })
  }

  // Update market comment count
  await Market.findByIdAndUpdate(comment.market, { $inc: { commentCount: -1 } })

  // Delete all replies to this comment
  const replyIds = await Comment.find({ parentId: commentId }).distinct('_id')
  if (replyIds.length > 0) {
    await Comment.deleteMany({ parentId: commentId })
    // Update market comment count for all deleted replies
    await Market.findByIdAndUpdate(comment.market, { $inc: { commentCount: -replyIds.length } })
  }

  sendSuccess(res, null, 'Comment deleted successfully')
})

// Add reaction to comment
const addReaction = catchAsync(async (req, res, next) => {
  const { commentId } = req.params
  const { type } = req.body
  const userId = req.user.id

  if (!type || !['like', 'love', 'laugh', 'angry', 'sad'].includes(type)) {
    return next(new AppError('Valid reaction type is required', 400))
  }

  const reaction = `${type}_${userId}`

  // Check if user already reacted
  const comment = await Comment.findById(commentId)
  if (!comment) {
    return next(new AppError('Comment not found', 404))
  }

  const existingReaction = comment.reactions.find(r => r.user.toString() === userId)

  if (existingReaction) {
    // If same reaction type, remove it (toggle)
    if (existingReaction.type === type) {
      await Comment.findByIdAndUpdate(commentId, {
        $pull: { reactions: { user: userId } }
      })
      sendSuccess(res, null, 'Reaction removed successfully')
    } else {
      // Update reaction type
      await Comment.findByIdAndUpdate(commentId, {
        $set: { "reactions.$[elem].type": type }
      }, {
        arrayFilters: [{ "elem.user": userId }]
      })
      sendSuccess(res, null, 'Reaction updated successfully')
    }
  } else {
    // Add new reaction
    await Comment.findByIdAndUpdate(commentId, {
      $push: { reactions: { user: userId, type, createdAt: new Date() } }
    })
    sendSuccess(res, null, 'Reaction added successfully')
  }
})

// Report a comment
const reportComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params
  const { reason, details } = req.body
  const userId = req.user.id

  if (!reason) {
    return next(new AppError('Report reason is required', 400))
  }

  const comment = await Comment.findById(commentId)
  if (!comment) {
    return next(new AppError('Comment not found', 404))
  }

  // Check if user already reported this comment
  const existingReport = comment.reports.find(r => r.user.toString() === userId)
  if (existingReport) {
    return next(new AppError('You have already reported this comment', 400))
  }

  // Add report
  await Comment.findByIdAndUpdate(commentId, {
    $push: {
      reports: {
        user: userId,
        reason,
        details: details || '',
        createdAt: new Date()
      }
    }
  })

  // If comment has multiple reports, mark as reported for moderator review
  const updatedComment = await Comment.findById(commentId)
  if (updatedComment.reports.length >= 3) {
    await Comment.findByIdAndUpdate(commentId, { reported: true })
  }

  sendSuccess(res, null, 'Comment reported successfully')
})

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  addReaction,
  reportComment
}