const express = require('express')
const router = express.Router()

const {
  getMarkets,
  getMarket,
  createMarket,
  updateMarket,
  deleteMarket,
  toggleTracking,
  untrackMarket,
  getMyMarkets,
  searchMarkets,
  getPopularMarkets,
  getMarketsByCategory,
  getMarketsByType,
  verifyMarket,
  getVendorView,
  trackVendorInteraction,
  getVendorHistory,
  getApplicationStatus,
  getVendorAnalytics,
  getVendorComparison,
  getPromoterMessages,
  sendPromoterMessage,
  getVendorTodos,
  getVendorExpenses,
  getLogistics,
  getWeatherForecast,
  getCalendarEvents,
  getMarketVendors
} = require('../controllers/marketsController')

const { verifyToken, optionalAuth, requireVerifiedPromoter, requireAdmin, requireVendor, requireVendorOwnershipOrAdmin } = require('../middleware/auth')
const { validateMarketCreation, validateMarketUpdate, validateMongoId, validatePagination, validateSearch, validateMessageCreation, validateMarketTypeParam } = require('../middleware/validation')

// Public routes
router.get('/', validatePagination, validateSearch, getMarkets)
router.get('/search', validateSearch, validatePagination, searchMarkets)
router.get('/popular', validatePagination, getPopularMarkets)
router.get('/category/:category', validatePagination, getMarketsByCategory)
router.get('/type/:marketType', validateMarketTypeParam, validatePagination, getMarketsByType)
router.get('/:id', validateMongoId('id'), getMarket)
router.get('/:id/vendors', validateMongoId('id'), getMarketVendors)

// Protected routes
router.use(verifyToken)

router.get('/my/markets', validatePagination, getMyMarkets)
router.post('/', requireVerifiedPromoter, validateMarketCreation, createMarket)
router.patch('/:id', validateMongoId('id'), validateMarketUpdate, updateMarket)
router.delete('/:id', validateMongoId('id'), deleteMarket)
router.post('/:id/track', validateMongoId('id'), toggleTracking)
router.delete('/:id/track', validateMongoId('id'), untrackMarket)

// Admin routes
router.patch('/:id/verify', validateMongoId('id'), requireAdmin, verifyMarket)

// Vendor-specific routes
router.get('/:id/vendor-view', validateMongoId('id'), requireVendor, getVendorView)
router.post('/:id/vendor-tracking', validateMongoId('id'), requireVendor, trackVendorInteraction)
router.get('/:id/vendor-history', validateMongoId('id'), requireVendor, getVendorHistory)
router.get('/:id/application-status', validateMongoId('id'), requireVendor, getApplicationStatus)
router.get('/:id/vendor-analytics', validateMongoId('id'), requireVendor, getVendorAnalytics)
router.get('/:id/vendor-comparison', validateMongoId('id'), requireVendor, getVendorComparison)
router.get('/:id/promoter-messages', validateMongoId('id'), requireVendor, getPromoterMessages)
router.post('/:id/promoter-messages', validateMongoId('id'), validateMessageCreation, requireVendor, sendPromoterMessage)
router.get('/:id/vendor-todos', validateMongoId('id'), requireVendor, getVendorTodos)
router.get('/:id/vendor-expenses', validateMongoId('id'), requireVendor, getVendorExpenses)
router.get('/:id/logistics', validateMongoId('id'), requireVendor, getLogistics)
router.get('/:id/weather-forecast', validateMongoId('id'), requireVendor, getWeatherForecast)
router.get('/:id/calendar-events', validateMongoId('id'), requireVendor, getCalendarEvents)

module.exports = router