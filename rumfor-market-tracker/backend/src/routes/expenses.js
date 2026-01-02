const express = require('express')
const router = express.Router()

const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  updateMileage,
  markAsTaxDeductible,
  addReceipt,
  setTaxYear,
  createRecurring,
  getExpenseSummary,
  getTaxReport,
  getRecurringExpenses,
  exportExpenses
} = require('../controllers/expensesController')

const { verifyToken } = require('../middleware/auth')
const { validateExpenseCreation, validateMongoId, validatePagination } = require('../middleware/validation')

// Protected routes
router.use(verifyToken)

router.get('/', validatePagination, getExpenses)
router.get('/recurring', getRecurringExpenses)
router.get('/tax-report/:year', validateMongoId('year'), getTaxReport)
router.post('/', validateExpenseCreation, createExpense)
router.get('/:id', validateMongoId('id'), getExpense)
router.patch('/:id', validateMongoId('id'), updateExpense)
router.delete('/:id', validateMongoId('id'), deleteExpense)
router.patch('/:id/mileage', validateMongoId('id'), updateMileage)
router.patch('/:id/tax-deductible', validateMongoId('id'), markAsTaxDeductible)
router.patch('/:id/receipt', validateMongoId('id'), addReceipt)
router.patch('/:id/tax-year', validateMongoId('id'), setTaxYear)
router.patch('/:id/recurring', validateMongoId('id'), createRecurring)
router.get('/market/:marketId/summary', validateMongoId('marketId'), getExpenseSummary)
router.get('/market/:marketId/export', validateMongoId('marketId'), exportExpenses)

module.exports = router