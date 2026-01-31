const { catchAsync, AppError, sendSuccess, sendError } = require('../middleware/errorHandler')
const Expense = require('../models/Expense')
const Market = require('../models/Market')
const UserMarketTracking = require('../models/UserMarketTracking')
const { validateExpenseCreation, validateMongoId, validatePagination } = require('../middleware/validation')
const { body, query } = require('express-validator')

// Helper function to update totalExpenses in UserMarketTracking
async function updateTrackingExpenses(vendorId, marketId) {
  try {
    const result = await Expense.aggregate([
      {
        $match: {
          vendor: vendorId,
          market: marketId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$category', 'revenue'] }, 0, '$amount']
            }
          }
        }
      }
    ])

    const totalExpenses = result.length > 0 ? result[0].totalExpenses : 0

    await UserMarketTracking.findOneAndUpdate(
      { user: vendorId, market: marketId },
      { totalExpenses },
      { new: true }
    )
  } catch (error) {
    console.error('Error updating tracking expenses:', error)
    // Don't throw - this is a non-critical background update
  }
}

// Get expenses for vendor and market
const getExpenses = catchAsync(async (req, res, next) => {
  const { marketId } = req.query
  
  // DIAGNOSTIC LOGGING
  console.log('[EXPENSES DEBUG] getExpenses - Query marketId:', marketId)
  console.log('[EXPENSES DEBUG] getExpenses - Current user ID:', req.user._id)
  console.log('[EXPENSES DEBUG] getExpenses - Market query param:', req.query.marketId)
  
  // Validate marketId from query parameter
  if (!marketId) {
    return next(new AppError('Market ID is required', 400))
  }
  
  // Verify it's a valid MongoDB ID
  if (!require('mongoose').Types.ObjectId.isValid(marketId)) {
    return next(new AppError('Invalid market ID format', 400))
  }
  
  const {
    page = 1,
    limit = 20,
    category,
    dateFrom,
    dateTo,
    isTaxReport,
    sortBy = 'date',
    sortOrder = 'desc'
  } = req.query

  // Verify market exists
  const market = await Market.findById(marketId)

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Verify user has access to this market (either owns it or is tracking it)
  const isPromoter = market.promoter && market.promoter.toString() === req.user._id
  const isAdmin = req.user.role === 'admin'
  const isTracking = await UserMarketTracking.findOne({ user: req.user._id, market: marketId })

  // For GET operations: also require hasExpense, but for CREATE operations this would block first item
  const hasExpense = await Expense.findOne({ vendor: req.user._id, market: marketId })

  // For GET: allow if tracking or has expense or owns market or is admin
  // For CREATE: allow if tracking or owns market or is admin (not hasExpense - that would block first item)
  const hasAccess = isPromoter || isAdmin || isTracking || hasExpense

  console.log('[EXPENSES DEBUG] getExpenses - Market lookup:', {
    marketId,
    marketExists: !!market,
    promoterId: market.promoter?.toString(),
    userId: req.user._id,
    userRole: req.user.role,
    isPromoter,
    isAdmin,
    isTracking: !!isTracking,
    hasExpense: !!hasExpense,
    hasAccess
  })

  if (!hasAccess) {
    console.log('[EXPENSES DEBUG] Access denied for user:', req.user._id, 'market:', marketId, 'isPromoter:', isPromoter, 'isAdmin:', isAdmin, 'isTracking:', !!isTracking, 'hasExpense:', !!hasExpense)
    return next(new AppError('Access denied to this market', 403))
  }

  const options = {
    category,
    dateFrom,
    dateTo,
    isTaxReport,
    sortBy,
    sortOrder
  }

  const expenses = await Expense.getVendorMarketExpenses(req.user._id, marketId, options)

  // Transform expenses to match frontend types
  const transformedExpenses = expenses.map(expense => ({
    id: expense._id.toString(),
    vendorId: expense.vendor?._id?.toString() || expense.vendor?.toString(),
    marketId: expense.market?._id?.toString() || expense.market?.toString(),
    title: expense.title,
    description: expense.description || '',
    amount: expense.amount,
    actualAmount: expense.actualAmount, // Keep undefined if not set
    category: expense.category,
    date: expense.date,
    receipt: expense.receipt?.url,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt
  }))

  // Wrap properly - sendSuccess will spread this object, so we need an extra nesting level
  sendSuccess(res, {
    data: {
      data: transformedExpenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: transformedExpenses.length,
        totalPages: Math.ceil(transformedExpenses.length / limit)
      }
    }
  }, 'Expenses retrieved successfully')
})

// Get single expense
const getExpense = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const expense = await Expense.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  if (!expense) {
    return next(new AppError('Expense not found', 404))
  }

  // Check access
  if (expense.vendor._id.toString() !== req.user._id && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  sendSuccess(res, {
    expense
  }, 'Expense retrieved successfully')
})

// Create new expense
const createExpense = catchAsync(async (req, res, next) => {
  // Destructure vendorId from frontend - we use authenticated user instead
  const { marketId, vendorId, ...expenseData } = req.body

  // DIAGNOSTIC LOGGING
  console.log('[EXPENSES DEBUG] createExpense - Request body:', JSON.stringify(req.body, null, 2))
  console.log('[EXPENSES DEBUG] createExpense - Extracted marketId:', marketId)
  console.log('[EXPENSES DEBUG] createExpense - Current user ID:', req.user._id)

  // Verify market exists
  const market = await Market.findById(marketId)

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Verify user has access to this market
  const isPromoter = market.promoter && market.promoter.toString() === req.user._id
  const isAdmin = req.user.role === 'admin'
  const isTracking = await UserMarketTracking.findOne({ user: req.user._id, market: marketId })

  // For CREATE: allow if tracking or owns market or is admin (NOT hasExpense - that would block first item)
  const hasAccess = isPromoter || isAdmin || isTracking

  if (!hasAccess) {
    return next(new AppError('Access denied to this market', 403))
  }

  const expense = await Expense.create({
    ...expenseData,
    vendor: req.user._id,
    market: marketId
  })

  // Update totalExpenses in UserMarketTracking
  await updateTrackingExpenses(req.user._id, marketId)

  const populatedExpense = await Expense.findById(expense._id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  // Transform expense to match frontend types
  const transformedExpense = {
    id: populatedExpense._id.toString(),
    vendorId: populatedExpense.vendor?._id?.toString() || populatedExpense.vendor?.toString(),
    marketId: populatedExpense.market?._id?.toString() || populatedExpense.market?.toString(),
    title: populatedExpense.title,
    description: populatedExpense.description || '',
    amount: populatedExpense.amount,
    actualAmount: populatedExpense.actualAmount, // Keep undefined if not set
    category: populatedExpense.category,
    date: populatedExpense.date,
    receipt: populatedExpense.receipt?.url,
    createdAt: populatedExpense.createdAt,
    updatedAt: populatedExpense.updatedAt
  }

  sendSuccess(res, {
    expense: transformedExpense
  }, 'Expense created successfully', 201)
})

// Update expense
const updateExpense = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const expense = await Expense.findById(id)

  if (!expense) {
    return next(new AppError('Expense not found', 404))
  }

  // Check access
  if (expense.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  // Cannot update deleted expenses
  if (expense.isDeleted) {
    return next(new AppError('Cannot update deleted expense', 400))
  }

  const updatedExpense = await Expense.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  )
  .populate('vendor', 'username profile.firstName profile.lastName')
  .populate('market', 'name location.city location.state')

  // Update totalExpenses in UserMarketTracking
  await updateTrackingExpenses(expense.vendor.toString(), expense.market.toString())

  // Transform expense to match frontend types
  const transformedExpense = {
    id: updatedExpense._id.toString(),
    vendorId: updatedExpense.vendor?._id?.toString() || updatedExpense.vendor?.toString(),
    marketId: updatedExpense.market?._id?.toString() || updatedExpense.market?.toString(),
    title: updatedExpense.title,
    description: updatedExpense.description || '',
    amount: updatedExpense.amount,
    actualAmount: updatedExpense.actualAmount, // Keep undefined if not set
    category: updatedExpense.category,
    date: updatedExpense.date,
    receipt: updatedExpense.receipt?.url,
    createdAt: updatedExpense.createdAt,
    updatedAt: updatedExpense.updatedAt
  }

  sendSuccess(res, {
    expense: transformedExpense
  }, 'Expense updated successfully')
})

// Delete expense (soft delete)
const deleteExpense = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const expense = await Expense.findById(id)

  if (!expense) {
    return next(new AppError('Expense not found', 404))
  }

  // Check access
  if (expense.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await expense.softDelete()

  // Update totalExpenses in UserMarketTracking
  await updateTrackingExpenses(expense.vendor.toString(), expense.market.toString())

  sendSuccess(res, null, 'Expense deleted successfully')
})

// Update mileage for expense
const updateMileage = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { distance, rate } = req.body

  if (distance === undefined || rate === undefined) {
    return next(new AppError('Distance and rate are required', 400))
  }

  const expense = await Expense.findById(id)

  if (!expense) {
    return next(new AppError('Expense not found', 404))
  }

  // Check access
  if (expense.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await expense.updateMileage(distance, rate)

  const updatedExpense = await Expense.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  sendSuccess(res, {
    expense: updatedExpense
  }, 'Mileage updated successfully')
})

// Mark expense as tax deductible
const markAsTaxDeductible = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { taxCategory } = req.body

  if (!taxCategory) {
    return next(new AppError('Tax category is required', 400))
  }

  const expense = await Expense.findById(id)

  if (!expense) {
    return next(new AppError('Expense not found', 404))
  }

  // Check access
  if (expense.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await expense.markAsTaxDeductible(taxCategory)

  const updatedExpense = await Expense.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  sendSuccess(res, {
    expense: updatedExpense
  }, 'Expense marked as tax deductible')
})

// Add receipt to expense
const addReceipt = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { url, publicId, filename } = req.body

  if (!url || !publicId) {
    return next(new AppError('Receipt URL and public ID are required', 400))
  }

  const expense = await Expense.findById(id)

  if (!expense) {
    return next(new AppError('Expense not found', 404))
  }

  // Check access
  if (expense.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await expense.addReceipt({ url, publicId, filename })

  const updatedExpense = await Expense.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  sendSuccess(res, {
    expense: updatedExpense
  }, 'Receipt added successfully')
})

// Set tax year for expense
const setTaxYear = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { year } = req.body

  if (!year || year < 2000 || year > 2100) {
    return next(new AppError('Valid tax year is required', 400))
  }

  const expense = await Expense.findById(id)

  if (!expense) {
    return next(new AppError('Expense not found', 404))
  }

  // Check access
  if (expense.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await expense.setTaxYear(year)

  const updatedExpense = await Expense.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  sendSuccess(res, {
    expense: updatedExpense
  }, 'Tax year set successfully')
})

// Create recurring expense
const createRecurring = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { frequency, interval = 1, endDate = null } = req.body

  if (!frequency || !['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(frequency)) {
    return next(new AppError('Valid frequency is required', 400))
  }

  const expense = await Expense.findById(id)

  if (!expense) {
    return next(new AppError('Expense not found', 404))
  }

  // Check access
  if (expense.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await expense.createRecurring(frequency, interval, endDate ? new Date(endDate) : null)

  const updatedExpense = await Expense.findById(id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  sendSuccess(res, {
    expense: updatedExpense
  }, 'Recurring expense created successfully')
})

// Get expense summary
const getExpenseSummary = catchAsync(async (req, res, next) => {
  const { marketId } = req.params
  const { dateFrom, dateTo } = req.query

  // Verify market exists and user has access
  const market = await Market.findById(marketId)

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  const isPromoter = market.promoter && market.promoter.toString() === req.user._id
  const isAdmin = req.user.role === 'admin'
  const isTracking = await UserMarketTracking.findOne({ user: req.user._id, market: marketId })

  // For GET operations: allow if tracking or has expense or owns market or is admin
  const hasExpense = await Expense.findOne({ vendor: req.user._id, market: marketId })
  const hasAccess = isPromoter || isAdmin || isTracking || hasExpense

  if (!hasAccess) {
    return next(new AppError('Access denied to this market', 403))
  }

  const summary = await Expense.getVendorMarketSummary(req.user._id, marketId, dateFrom, dateTo)

  sendSuccess(res, {
    marketId,
    summary: summary[0] || {
      categories: [],
      totalExpenses: 0,
      totalTaxDeductible: 0,
      totalCount: 0
    },
    dateRange: {
      from: dateFrom,
      to: dateTo
    }
  }, 'Expense summary retrieved successfully')
})

// Get tax report
const getTaxReport = catchAsync(async (req, res, next) => {
  const { year } = req.params

  if (!year || year < 2000 || year > 2100) {
    return next(new AppError('Valid tax year is required', 400))
  }

  const taxExpenses = await Expense.getTaxReport(req.user._id, year)

  // Calculate totals
  const totals = taxExpenses.reduce((acc, expense) => {
    acc.totalAmount += expense.amount
    acc.totalMileage += expense.mileageCost
    acc.totalTaxDeductible += expense.isTaxDeductible ? expense.amount : 0
    return acc
  }, {
    totalAmount: 0,
    totalMileage: 0,
    totalTaxDeductible: 0,
    totalCount: taxExpenses.length
  })

  sendSuccess(res, {
    year: parseInt(year),
    expenses: taxExpenses,
    totals
  }, 'Tax report retrieved successfully')
})

// Get recurring expenses
const getRecurringExpenses = catchAsync(async (req, res, next) => {
  const recurringExpenses = await Expense.getRecurringExpenses(req.user._id)

  sendSuccess(res, {
    expenses: recurringExpenses
  }, 'Recurring expenses retrieved successfully')
})

// Export expenses (CSV format)
const exportExpenses = catchAsync(async (req, res, next) => {
  const { marketId } = req.params
  const { dateFrom, dateTo, format = 'json' } = req.query

  // Verify market exists and user has access
  const market = await Market.findById(marketId)

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  const isPromoter = market.promoter && market.promoter.toString() === req.user._id
  const isAdmin = req.user.role === 'admin'
  const isTracking = await UserMarketTracking.findOne({ user: req.user._id, market: marketId })

  // For GET operations: allow if tracking or has expense or owns market or is admin
  const hasExpense = await Expense.findOne({ vendor: req.user._id, market: marketId })
  const hasAccess = isPromoter || isAdmin || isTracking || hasExpense

  if (!hasAccess) {
    return next(new AppError('Access denied to this market', 403))
  }

  const expenses = await Expense.getVendorMarketExpenses(req.user._id, marketId, {
    dateFrom,
    dateTo,
    sortBy: 'date',
    sortOrder: 'asc'
  })

  if (format === 'csv') {
    // Generate CSV content
    const headers = ['Date', 'Title', 'Category', 'Amount', 'Mileage Cost', 'Total Cost', 'Tax Deductible', 'Payment Method', 'Vendor']
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => [
        expense.date.toISOString().split('T')[0],
        `"${expense.title.replace(/"/g, '""')}"`,
        expense.category,
        expense.amount,
        expense.mileageCost,
        expense.totalCost,
        expense.isTaxDeductible ? 'Yes' : 'No',
        expense.paymentMethod,
        `"${expense.vendor?.name || ''}"`
      ].join(','))
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="expenses-${market.name.replace(/[^a-zA-Z0-9]/g, '-')}.csv"`)
    return res.send(csvContent)
  }

  sendSuccess(res, {
    market: {
      name: market.name,
      location: `${market.location.city}, ${market.location.state}`
    },
    expenses,
    dateRange: {
      from: dateFrom,
      to: dateTo
    },
    totalCount: expenses.length
  }, 'Expenses exported successfully')
})

module.exports = {
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
}