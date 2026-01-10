const express = require('express')
const router = express.Router()

const {
  getDashboard,
  getAdminStats,
  getUsers,
  updateUser,
  getMarkets,
  updateMarket,
  getModerationQueue,
  moderateContent,
  getSettings,
  updateSettings
} = require('../controllers/adminController')

const { verifyToken, requireAdmin } = require('../middleware/auth')
const { validateMongoId, validatePagination } = require('../middleware/validation')

// Admin routes - all require admin authentication
router.use(verifyToken, requireAdmin)

// Dashboard analytics
router.get('/dashboard', getDashboard)
router.get('/stats', getAdminStats)

// User management
router.get('/users', validatePagination, getUsers)
router.patch('/users/:id', validateMongoId('id'), updateUser)

// Market management
router.get('/markets', validatePagination, getMarkets)
router.patch('/markets/:id', validateMongoId('id'), updateMarket)

// Content moderation
router.get('/moderation', getModerationQueue)
router.post('/moderate/:type/:id', validateMongoId('id'), moderateContent)

// System settings
router.get('/settings', getSettings)
router.patch('/settings', updateSettings)

module.exports = router