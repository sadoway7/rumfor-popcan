const express = require('express')
const router = express.Router()

const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  addReaction,
  removeReaction,
  reportComment
} = require('../controllers/commentsController')

const { verifyToken } = require('../middleware/auth')
const { validateMongoId } = require('../middleware/validation')

// Public routes
router.get('/market/:marketId', validateMongoId('marketId'), getComments)

// Protected routes
router.use(verifyToken)

// Create a new comment
router.post('/', createComment)

// Update a comment
router.patch('/:commentId', validateMongoId('commentId'), updateComment)

// Delete a comment
router.delete('/:commentId', validateMongoId('commentId'), deleteComment)

// Add reaction to comment
router.post('/:commentId/reaction', validateMongoId('commentId'), addReaction)

// Remove reaction from comment
router.delete('/:commentId/reaction', validateMongoId('commentId'), removeReaction)

// Report a comment
router.post('/:commentId/report', validateMongoId('commentId'), reportComment)

module.exports = router
