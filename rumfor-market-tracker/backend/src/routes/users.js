const express = require('express')
const router = express.Router()

const { verifyToken, requireAdmin } = require('../middleware/auth')
const { validateMongoId } = require('../middleware/validation')

// Get user profile (protected)
router.get('/profile', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
    message: 'Profile retrieved successfully'
  })
})

// Update user profile (protected)
router.patch('/profile', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
    message: 'Profile updated successfully'
  })
})

// Get all users (admin only)
router.get('/', verifyToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    data: { users: [] },
    message: 'Users retrieved successfully'
  })
})

// Get user by ID (admin only)
router.get('/:id', verifyToken, requireAdmin, validateMongoId('id'), (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
    message: 'User retrieved successfully'
  })
})

module.exports = router