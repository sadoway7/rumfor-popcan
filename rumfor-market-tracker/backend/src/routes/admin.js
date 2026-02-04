const express = require('express')
const router = express.Router()

const {
  getDashboard,
  getAdminStats,
  getUsers,
  updateUser,
  getUser,
  getUserActivity,
  getMarkets,
  getMarket,
  updateMarket,
  deleteMarket,
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
router.get('/users/:id', validateMongoId('id'), getUser)
router.patch('/users/:id', validateMongoId('id'), updateUser)
router.get('/users/:id/activity', validateMongoId('id'), getUserActivity)

// Market management
router.get('/markets', validatePagination, getMarkets)
router.get('/markets/:id', validateMongoId('id'), getMarket)
router.patch('/markets/:id', validateMongoId('id'), updateMarket)
router.delete('/markets/:id', validateMongoId('id'), deleteMarket)

// Content moderation
router.get('/moderation', getModerationQueue)
router.post('/moderate/:type/:id', validateMongoId('id'), moderateContent)

// System settings
router.get('/settings', getSettings)
router.patch('/settings', updateSettings)

module.exports = router