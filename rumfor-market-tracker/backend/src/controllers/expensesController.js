const { catchAsync, AppError, sendSuccess, sendError } = require('../middleware/errorHandler')
const Expense = require('../models/Expense')
const Market = require('../models/Market')
const { validateExpenseCreation, validateMongoId, validatePagination } = require('../middleware/validation')

// Get expenses for vendor and market
const getExpenses = catchAsync(async (req, res, next) => {
  const { marketId } = req.params
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
  const hasAccess = market.promoter.toString() === req.user.id || 
                   req.user.role === 'admin' ||
                   await Expense.findOne({ vendor: req.user.id, market: marketId })

  if (!hasAccess) {
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

  const expenses = await Expense.getVendorMarketExpenses(req.user.id, marketId, options)

  sendSuccess(res, {
    expenses,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(expenses.length / limit),
      total: expenses.length,
      limit: parseInt(limit)
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
  if (expense.vendor._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  sendSuccess(res, {
    expense
  }, 'Expense retrieved successfully')
})

// Create new expense
const createExpense = catchAsync(async (req, res, next) => {
  const { marketId, ...expenseData } = req.body

  // Verify market exists
  const market = await Market.findById(marketId)

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Verify user has access to this market
  const hasAccess = market.promoter.toString() === req.user.id || 
                   req.user.role === 'admin' ||
                   await Expense.findOne({ vendor: req.user.id, market: marketId })

  if (!hasAccess) {
    return next(new AppError('Access denied to this market', 403))
  }

  const expense = await Expense.create({
    ...expenseData,
    vendor: req.user.id,
    market: marketId
  })

  const populatedExpense = await Expense.findById(expense._id)
    .populate('vendor', 'username profile.firstName profile.lastName')
    .populate('market', 'name location.city location.state')

  sendSuccess(res, {
    expense: populatedExpense
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
  if (expense.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
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

  sendSuccess(res, {
    expense: updatedExpense
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
  if (expense.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied', 403))
  }

  await expense.softDelete()

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
  if (expense.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
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
  if (expense.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
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
  if (expense.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
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
  if (expense.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
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
  if (expense.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
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

  const hasAccess = market.promoter.toString() === req.user.id || 
                   req.user.role === 'admin' ||
                   await Expense.findOne({ vendor: req.user.id, market: marketId })

  if (!hasAccess) {
    return next(new AppError('Access denied to this market', 403))
  }

  const summary = await Expense.getVendorMarketSummary(req.user.id, marketId, dateFrom, dateTo)

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

  const taxExpenses = await Expense.getTaxReport(req.user.id, year)

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
  const recurringExpenses = await Expense.getRecurringExpenses(req.user.id)

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

  const hasAccess = market.promoter.toString() === req.user.id || 
                   req.user.role === 'admin' ||
                   await Expense.findOne({ vendor: req.user.id, market: marketId })

  if (!hasAccess) {
    return next(new AppError('Access denied to this market', 403))
  }

  const expenses = await Expense.getVendorMarketExpenses(req.user.id, marketId, {
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