const express = require('express')
const router = express.Router()

const {
  getMarkets,
  getMarket,
  createMarket,
  updateMarket,
  deleteMarket,
  toggleTracking,
  getMyMarkets,
  searchMarkets,
  getPopularMarkets,
  getMarketsByCategory,
  verifyMarket
} = require('../controllers/marketsController')

const { verifyToken, optionalAuth, requireVerifiedPromoter, requireAdmin } = require('../middleware/auth')
const { validateMarketCreation, validateMarketUpdate, validateMongoId, validatePagination, validateSearch } = require('../middleware/validation')

// Public routes
router.get('/', validatePagination, validateSearch, getMarkets)
router.get('/search', validateSearch, validatePagination, searchMarkets)
router.get('/popular', validatePagination, getPopularMarkets)
router.get('/category/:category', validatePagination, getMarketsByCategory)
router.get('/:id', validateMongoId('id'), getMarket)

// Protected routes
router.use(verifyToken)

router.get('/my/markets', validatePagination, getMyMarkets)
router.post('/', requireVerifiedPromoter, validateMarketCreation, createMarket)
router.patch('/:id', validateMongoId('id'), validateMarketUpdate, updateMarket)
router.delete('/:id', validateMongoId('id'), deleteMarket)
router.post('/:id/track', validateMongoId('id'), toggleTracking)

// Admin routes
router.patch('/:id/verify', validateMongoId('id'), requireAdmin, verifyMarket)

module.exports = router