const express = require('express')
const router = express.Router()

const {
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStatus,
  getMyApplications,
  updateApplication,
  withdrawApplication,
  bulkUpdateStatus,
  getApplicationStats
} = require('../controllers/applicationsController')

const { verifyToken, requireVerifiedPromoter, requireAdmin } = require('../middleware/auth')
const { validateApplicationCreation, validateMongoId, validatePagination } = require('../middleware/validation')

// Protected routes
router.use(verifyToken)

router.get('/', validatePagination, getApplications)
router.get('/my', validatePagination, getMyApplications)
router.post('/', validateApplicationCreation, createApplication)
router.get('/:id', validateMongoId('id'), getApplication)
router.patch('/:id', validateMongoId('id'), updateApplication)
router.delete('/:id', validateMongoId('id'), withdrawApplication)

// Promoter routes (for managing applications to their markets)
router.patch('/:id/status', validateMongoId('id'), requireVerifiedPromoter, updateApplicationStatus)
router.patch('/bulk/status', requireVerifiedPromoter, bulkUpdateStatus)
router.get('/market/:marketId/stats', validateMongoId('marketId'), requireVerifiedPromoter, getApplicationStats)

module.exports = router