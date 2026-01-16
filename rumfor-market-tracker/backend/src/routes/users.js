const express = require('express')
const router = express.Router()

const {
  getProfile,
  updateProfile,
  trackMarket,
  untrackMarket,
  getTrackedMarkets,
  getUser,
  getUsers,
  updateUser
} = require('../controllers/usersController')

const { verifyToken, requireAdmin } = require('../middleware/auth')
const { validateMongoId, validatePagination, validateUserUpdate } = require('../middleware/validation')

// Get user profile (protected)
router.get('/profile', verifyToken, getProfile)

// Update user profile (protected)
router.patch('/profile', verifyToken, validateUserUpdate, updateProfile)

// Market tracking (protected)
router.post('/track', verifyToken, trackMarket)
router.post('/untrack', verifyToken, untrackMarket)
router.get('/tracking', verifyToken, getTrackedMarkets)

// Get all users (admin only)
router.get('/', verifyToken, requireAdmin, validatePagination, getUsers)

// Get user by ID (admin only)
router.get('/:id', verifyToken, requireAdmin, validateMongoId('id'), getUser)

// Update user (admin only)
router.patch('/:id', verifyToken, requireAdmin, validateMongoId('id'), updateUser)

module.exports = router
