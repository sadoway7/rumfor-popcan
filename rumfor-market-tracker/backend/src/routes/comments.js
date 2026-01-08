const express = require('express')
const router = express.Router()
const { catchAsync, sendSuccess, sendError } = require('../middleware/errorHandler')

const { verifyToken } = require('../middleware/auth')
const { validateMongoId } = require('../middleware/validation')
const Comment = require('../models/Comment')

// Protected routes
router.use(verifyToken)

// Get comments for a market
router.get('/market/:marketId', validateMongoId('marketId'), catchAsync(async (req, res, next) => {
  const { marketId } = req.params
  const { page = 1, limit = 10 } = req.query

  const comments = await Comment.getMarketComments(marketId, { page: parseInt(page), limit: parseInt(limit) })
  const total = await Comment.countDocuments({ market: marketId, isDeleted: false, isModerated: false, parent: null })

  sendSuccess(res, {
    comments,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    }
  }, 'Comments retrieved successfully')
}))

// Get replies for a comment
router.get('/:id/replies', validateMongoId('id'), catchAsync(async (req, res, next) => {
  const { id } = req.params

  const replies = await Comment.getCommentReplies(id)

  sendSuccess(res, {
    replies
  }, 'Comment replies retrieved successfully')
}))

// Create new comment
router.post('/', catchAsync(async (req, res, next) => {
  const { content, market, parent = null } = req.body

  // Validate required fields
  if (!content) {
    return sendError(res, 'Comment content is required', 400)
  }

  if (!market) {
    return sendError(res, 'Market ID is required', 400)
  }

  const comment = await Comment.create({
    content,
    author: req.user.id,
    market,
    parent
  })

  // Populate author info
  await comment.populate('author', 'username profile.firstName profile.lastName')

  // If this is a reply, add it to parent's replies array
  if (parent) {
    const parentComment = await Comment.findById(parent)
    if (parentComment) {
      await parentComment.addReply(comment._id)
    }
  }

  sendSuccess(res, { comment }, 'Comment created successfully', 201)
}))

// Update comment
router.patch('/:id', validateMongoId('id'), catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { content } = req.body

  if (!content) {
    return sendError(res, 'Comment content is required', 400)
  }

  const comment = await Comment.findById(id)

  if (!comment) {
    return sendError(res, 'Comment not found', 404)
  }

  // Check if user owns this comment
  if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'You can only edit your own comments', 403)
  }

  // Edit the comment
  await comment.editContent(content)

  // Populate author info
  await comment.populate('author', 'username profile.firstName profile.lastName')

  sendSuccess(res, { comment }, 'Comment updated successfully')
}))

// Delete comment
router.delete('/:id', validateMongoId('id'), catchAsync(async (req, res, next) => {
  const { id } = req.params

  const comment = await Comment.findById(id)

  if (!comment) {
    return sendError(res, 'Comment not found', 404)
  }

  // Check if user owns this comment or is admin
  if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'You can only delete your own comments', 403)
  }

  await comment.softDelete()

  sendSuccess(res, null, 'Comment deleted successfully')
}))

// Flag comment
router.post('/:id/flag', validateMongoId('id'), catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { reason, description } = req.body

  if (!reason) {
    return sendError(res, 'Flag reason is required', 400)
  }

  const comment = await Comment.findById(id)

  if (!comment) {
    return sendError(res, 'Comment not found', 404)
  }

  await comment.flag(req.user.id, reason, description)

  sendSuccess(res, null, 'Comment flagged successfully')
}))

// Moderate comment (admin only)
router.post('/:id/moderate', validateMongoId('id'), catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { action, reason } = req.body

  if (req.user.role !== 'admin') {
    return sendError(res, 'Admin access required', 403)
  }

  if (!action || !['delete', 'moderate'].includes(action)) {
    return sendError(res, 'Valid action is required (delete or moderate)', 400)
  }

  const comment = await Comment.findById(id)

  if (!comment) {
    return sendError(res, 'Comment not found', 404)
  }

  if (action === 'delete') {
    await comment.softDelete()
  } else if (action === 'moderate') {
    await comment.moderate(req.user.id, reason || '')
  }

  sendSuccess(res, null, `Comment ${action}d successfully`)
}))

// Add reaction to comment
router.post('/:id/reaction', validateMongoId('id'), catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { reactionType, action } = req.body

  if (!reactionType || !['thumbsUp', 'heart', 'smile', 'sad', 'angry', 'thinking'].includes(reactionType)) {
    return sendError(res, 'Valid reaction type is required', 400)
  }

  if (!action || !['add', 'remove'].includes(action)) {
    return sendError(res, 'Valid action is required (add or remove)', 400)
  }

  const comment = await Comment.findById(id)

  if (!comment) {
    return sendError(res, 'Comment not found', 404)
  }

  if (action === 'add') {
    await comment.addReaction(req.user.id, reactionType)
  } else {
    await comment.removeReaction(req.user.id, reactionType)
  }

  // Populate author info
  await comment.populate('author', 'username profile.firstName profile.lastName')

  sendSuccess(res, { comment }, 'Reaction updated successfully')
}))

module.exports = router