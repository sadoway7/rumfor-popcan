const express = require('express')
const router = express.Router()
const {
  submitBugReport,
  getBugReports,
  getBugReport,
  updateBugReport,
  deleteBugReport,
  getBugReportStats
} = require('../controllers/bugReportController')
const { verifyToken, requireAdmin } = require('../middleware/auth')
const { validatePagination } = require('../middleware/validation')

router.post('/', verifyToken, submitBugReport)

router.get('/stats', verifyToken, requireAdmin, getBugReportStats)
router.get('/', verifyToken, requireAdmin, validatePagination, getBugReports)
router.get('/:id', verifyToken, requireAdmin, getBugReport)
router.put('/:id', verifyToken, requireAdmin, updateBugReport)
router.delete('/:id', verifyToken, requireAdmin, deleteBugReport)

module.exports = router
