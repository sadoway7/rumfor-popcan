const express = require('express')
const router = express.Router()

const { verifyToken } = require('../middleware/auth')

// Protected routes
router.use(verifyToken)

// Get comments for a market
router.get('/market/:marketId', (req, res) => {
  res.json({
    success: true,
    data: { comments: [] },
    message: 'Comments retrieved successfully'
  })
})

// Create new comment
router.post('/', (req, res) => {
  res.json({
    success: true,
    data: { comment: {} },
    message: 'Comment created successfully'
  })
})

// Update comment
router.patch('/:id', (req, res) => {
  res.json({
    success: true,
    data: { comment: {} },
    message: 'Comment updated successfully'
  })
})

// Delete comment
router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'Comment deleted successfully'
  })
})

// Add reaction to comment
router.post('/:id/reaction', (req, res) => {
  res.json({
    success: true,
    data: { comment: {} },
    message: 'Reaction added successfully'
  })
})

module.exports = router