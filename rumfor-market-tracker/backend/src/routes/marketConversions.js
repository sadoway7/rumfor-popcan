const express = require('express')
const router = express.Router()

const {
  requestConversion,
  getMyRequests,
  getPendingRequests,
  reviewConversion,
  cancelConversion,
  getConversion
} = require('../controllers/marketConversionsController')

const { verifyToken, requireAdmin, requireVendor, requirePromoter } = require('../middleware/auth')
const { validateMarketConversionRequest, validateConversionReview, validateMongoId } = require('../middleware/validation')

// All routes require authentication
router.use(verifyToken)

// User routes for managing their own conversion requests
router.get('/my-requests', getMyRequests)
router.post('/:marketId/request', validateMongoId('marketId'), validateMarketConversionRequest, requestConversion)
router.patch('/:id/cancel', validateMongoId('id'), cancelConversion)
router.get('/:id', validateMongoId('id'), getConversion)

// Admin routes for reviewing conversion requests
router.get('/admin/pending', requireAdmin, getPendingRequests)
router.patch('/:id/review', validateMongoId('id'), requireAdmin, validateConversionReview, reviewConversion)

module.exports = router