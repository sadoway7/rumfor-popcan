const mongoose = require('mongoose')
const { catchAsync, AppError, sendSuccess, sendError } = require('../middleware/errorHandler')
const Market = require('../models/Market')
const UserMarketTracking = require('../models/UserMarketTracking')
const Todo = require('../models/Todo')
const Expense = require('../models/Expense')
const Message = require('../models/Message')
const { validateMarketCreation, validateMarketUpdate, validateMongoId, validatePagination, validateSearch } = require('../middleware/validation')

// Get all markets with filtering and pagination
const getMarkets = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    category,
    location,
    dates,
    search,
    marketType
  } = req.query

  // Build query
  let query = { isActive: true }

  if (category) {
    query.category = category
  }

  if (dates) {
    query['dates.type'] = dates
  }

  if (location) {
    query.$or = [
      { 'location.city': { $regex: location, $options: 'i' } },
      { 'location.state': { $regex: location, $options: 'i' } }
    ]
  }

  if (search) {
    query.$text = { $search: search }
  }

  if (marketType) {
    // Map frontend marketType to createdByType
    const createdByTypeMap = {
      'vendor-created': 'vendor',
      'promoter-managed': { $in: ['promoter', 'admin'] }
    };
    query.createdByType = createdByTypeMap[marketType];
  }

  // Execute query
  const markets = await Market.find(query)
    .populate('promoter', 'username profile.firstName profile.lastName')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)

  // Get total count for pagination
  const total = await Market.countDocuments(query)

  // Get popular categories for sidebar
  const popularCategories = await Market.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ])

  // Get popular marketTypes for sidebar
  const popularMarketTypes = await Market.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: {
          $cond: {
            if: { $eq: ['$createdByType', 'vendor'] },
            then: 'vendor-created',
            else: 'promoter-managed'
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ])

  sendSuccess(res, {
    markets,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    },
    filters: {
      categories: popularCategories,
      marketTypes: popularMarketTypes
    }
  }, 'Markets retrieved successfully')
})

// Get single market by ID
const getMarket = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const market = await Market.findById(id)
    .populate('promoter', 'username profile.firstName profile.lastName profile.business')

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Get tracking status if user is authenticated
  let trackingStatus = null
  if (req.user) {
    const tracking = await UserMarketTracking.findOne({
      user: req.user.id,
      market: id
    })
    trackingStatus = tracking ? tracking.status : null
  }

  // Get recent photos
  const recentPhotos = await market.getPopulated('images.uploadedBy', 'username profile.firstName profile.lastName')

  sendSuccess(res, {
    market,
    trackingStatus,
    recentPhotos: recentPhotos.images?.slice(0, 5) || []
  }, 'Market retrieved successfully')
})

// Create new market
const createMarket = catchAsync(async (req, res, next) => {
  // Determine who created this market
  let createdByType = req.user.role;
  if (req.user.role === 'promoter' || req.user.role === 'admin') {
    createdByType = req.user.role;
  } else if (req.user.role === 'vendor') {
    createdByType = 'vendor';
  }

  // Add promoter and creator type to market data
  const marketData = {
    ...req.body,
    promoter: req.user.id,
    createdByType
  }

  // For vendor-created markets, use generic images
  if (createdByType === 'vendor' && (!marketData.images || marketData.images.length === 0)) {
    // Import the generic images function
    const getGenericMarketImage = require('../utils/genericImages');
    const tempId = Date.now().toString();
    marketData.images = [{
      url: getGenericMarketImage(tempId),
      alt: 'Community market',
      isHero: true,
      uploadedBy: req.user.id
    }];
  }

  const market = await Market.create(marketData)

  const populatedMarket = await Market.findById(market._id)
    .populate('promoter', 'username profile.firstName profile.lastName')

  sendSuccess(res, {
    market: populatedMarket
  }, 'Market created successfully', 201)
})

// Update market
const updateMarket = catchAsync(async (req, res, next) => {
  const { id } = req.params

  // Check if market exists
  const market = await Market.findById(id)

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Check if market is vendor-created (immutable)
  if (market.createdByType === 'vendor') {
    return next(new AppError('Vendor-created markets cannot be modified after creation to ensure data integrity', 403))
  }

  // Check if user owns this market or is admin
  if (market.promoter.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only update markets you created', 403))
  }

  const updatedMarket = await Market.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  ).populate('promoter', 'username profile.firstName profile.lastName')

  sendSuccess(res, {
    market: updatedMarket
  }, 'Market updated successfully')
})

// Delete market
const deleteMarket = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const market = await Market.findById(id)

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Check if market is vendor-created (immutable)
  if (market.createdByType === 'vendor') {
    return next(new AppError('Vendor-created markets cannot be deleted to maintain data integrity and vendor accountability', 403))
  }

  // Check if user owns this market or is admin
  if (market.promoter.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only delete markets you created', 403))
  }

  // Soft delete
  market.isActive = false
  await market.save()

  sendSuccess(res, null, 'Market deleted successfully')
})

// Track/untrack market
const toggleTracking = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { status = 'interested' } = req.body

  // Check if market exists
  const market = await Market.findById(id)

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Find existing tracking
  let tracking = await UserMarketTracking.findOne({
    user: req.user.id,
    market: id
  })

  if (tracking) {
    // Update existing tracking
    tracking.status = status
    await tracking.save()
  } else {
    // Create new tracking
    tracking = await UserMarketTracking.create({
      user: req.user.id,
      market: id,
      status
    })

    // Increment market statistics
    await market.incrementStat('totalTrackers')
  }

  sendSuccess(res, {
    tracking
  }, `Market ${tracking.status === 'interested' ? 'tracked' : 'untracked'} successfully`)
})

// Get user's tracked markets
const getMyMarkets = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query

  // Build query
  let query = { user: req.user.id }

  if (status) {
    query.status = status
  }

  // Get user's tracked markets with market details
  const tracking = await UserMarketTracking.find(query)
    .populate({
      path: 'market',
      match: { isActive: true },
      populate: {
        path: 'promoter',
        select: 'username profile.firstName profile.lastName'
      }
    })
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)

  // Filter out markets that might have been deleted
  const validTracking = tracking.filter(t => t.market)

  // Get total count
  const total = await UserMarketTracking.countDocuments(query)

  // Get status counts
  const statusCounts = await UserMarketTracking.getUserStatusCounts(req.user.id)

  sendSuccess(res, {
    tracking: validTracking,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    },
    statusCounts
  }, 'User markets retrieved successfully')
})

// Search markets
const searchMarkets = catchAsync(async (req, res, next) => {
  const {
    q,
    category,
    location,
    dates,
    marketType,
    page = 1,
    limit = 20,
    sortBy = 'score',
    sortOrder = 'desc'
  } = req.query

  // Build search query
  let query = { isActive: true }

  const searchConditions = []

  if (q) {
    searchConditions.push({
      $text: { $search: q }
    })
  }

  if (category) {
    query.category = category
  }

  if (location) {
    searchConditions.push({
      $or: [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } }
      ]
    })
  }

  if (dates) {
    query['dates.type'] = dates
  }

  if (marketType) {
    // Map frontend marketType to createdByType
    const createdByTypeMap = {
      'vendor-created': 'vendor',
      'promoter-managed': { $in: ['promoter', 'admin'] }
    };
    query.createdByType = createdByTypeMap[marketType];
  }

  if (searchConditions.length > 0) {
    query.$and = searchConditions
  }

  // Build sort
  let sort = {}
  if (sortBy === 'score' && q) {
    sort = { score: { $meta: 'textScore' } }
  } else {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1
  }

  // Execute search
  const markets = await Market.find(query)
    .populate('promoter', 'username profile.firstName profile.lastName')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)

  const total = await Market.countDocuments(query)

  sendSuccess(res, {
    markets,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    },
    searchQuery: q || '',
    filters: {
      category,
      location,
      dates
    }
  }, 'Search completed successfully')
})

// Get popular markets
const getPopularMarkets = catchAsync(async (req, res, next) => {
  const { limit = 10, timeframe = '30d' } = req.query

  let dateFilter = {}
  const now = new Date()

  switch (timeframe) {
    case '7d':
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }
      break
    case '30d':
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }
      break
    case '90d':
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } }
      break
  }

  const popularMarkets = await Market.find({
    isActive: true,
    ...dateFilter
  })
  .populate('promoter', 'username profile.firstName profile.lastName')
  .sort({
    'statistics.totalTrackers': -1,
    'statistics.totalComments': -1,
    createdAt: -1
  })
  .limit(parseInt(limit))

  sendSuccess(res, {
    markets: popularMarkets,
    timeframe
  }, 'Popular markets retrieved successfully')
})

// Get markets by category
const getMarketsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query

  const markets = await Market.find({
    category,
    isActive: true
  })
  .populate('promoter', 'username profile.firstName profile.lastName')
  .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
  .limit(limit * 1)
  .skip((page - 1) * limit)

  const total = await Market.countDocuments({ category, isActive: true })

  sendSuccess(res, {
    markets,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    },
    category
  }, 'Markets by category retrieved successfully')
})

// Get markets by marketType
const getMarketsByType = catchAsync(async (req, res, next) => {
  const { marketType } = req.params
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query

  // Map frontend marketType to createdByType
  const createdByTypeMap = {
    'vendor-created': 'vendor',
    'promoter-managed': { $in: ['promoter', 'admin'] }
  };

  const query = {
    createdByType: createdByTypeMap[marketType],
    isActive: true
  };

  const markets = await Market.find(query)
    .populate('promoter', 'username profile.firstName profile.lastName')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)

  const total = await Market.countDocuments(query)

  sendSuccess(res, {
    markets,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    },
    marketType
  }, 'Markets by type retrieved successfully')
})

// Verify market (admin only)
const verifyMarket = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const market = await Market.findById(id)

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  market.isVerified = true
  await market.save()

  sendSuccess(res, {
    market
  }, 'Market verified successfully')
})

// Get market data tailored for vendor perspective
const getVendorView = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const market = await Market.findById(id)
    .populate('promoter', 'username profile.firstName profile.lastName profile.business contact')

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Get vendor-specific tracking info
  const tracking = await UserMarketTracking.findOne({
    user: req.user.id,
    market: id
  })

  // Get recent photos
  const recentPhotos = await market.getPopulated('images.uploadedBy', 'username profile.firstName profile.lastName')

  // Get market statistics for vendors
  const totalApplicants = await UserMarketTracking.countDocuments({
    market: id,
    status: { $in: ['applied', 'booked', 'completed'] }
  })

  // Get vendor's expense summary for this market
  const expenseSummary = await Expense.getVendorMarketSummary(req.user.id, id)

  sendSuccess(res, {
    market: {
      ...market.toObject(),
      vendorData: {
        tracking: tracking || null,
        expenseSummary: expenseSummary.length > 0 ? expenseSummary[0] : null,
        totalApplicants,
        nextEventDate: market.nextEventDate,
        upcomingEvents: market.upcomingEvents
      }
    },
    recentPhotos: recentPhotos.images?.slice(0, 5) || []
  }, 'Vendor market view retrieved successfully')
})

// Track vendor interactions with market
const trackVendorInteraction = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { action, notes } = req.body

  // Check if market exists
  const market = await Market.findById(id)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Find or create tracking record
  let tracking = await UserMarketTracking.findOne({
    user: req.user.id,
    market: id
  })

  if (!tracking) {
    tracking = await UserMarketTracking.create({
      user: req.user.id,
      market: id,
      status: 'interested'
    })
  }

  // Update tracking with interaction data
  tracking.personalNotes = notes || tracking.personalNotes
  await tracking.save()

  // Log the interaction (you might want to create a separate interaction log)
  sendSuccess(res, {
    tracking,
    market: {
      id: market._id,
      name: market.name
    }
  }, `Market interaction '${action}' recorded successfully`)
})

// Get vendor's past appearances and performance at this market
const getVendorHistory = catchAsync(async (req, res, next) => {
  const { id } = req.params

  // Get all tracking records for this vendor and market
  const history = await UserMarketTracking.find({
    user: req.user.id,
    market: id
  })
  .populate('market', 'name category location.city location.state dates')
  .sort({ createdAt: -1 })

  // Get market details
  const market = await Market.findById(id).select('name category location')

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  sendSuccess(res, {
    market,
    history,
    stats: {
      totalAppearances: history.filter(h => h.status === 'completed').length,
      totalApplications: history.filter(h => ['applied', 'booked', 'completed'].includes(h.status)).length,
      lastAppearance: history.find(h => h.status === 'completed')
    }
  }, 'Vendor market history retrieved successfully')
})

// Get current application status for the authenticated vendor
const getApplicationStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const market = await Market.findById(id)
    .populate('promoter', 'username profile.firstName profile.lastName contact')

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Get current application/tracking status
  const tracking = await UserMarketTracking.findOne({
    user: req.user.id,
    market: id
  }).populate('applicationData.reviewedBy', 'username profile.firstName profile.lastName')

  const applicationStatus = {
    market: {
      id: market._id,
      name: market.name,
      promoter: market.promoter,
      applicationDeadline: market.vendorInfo.applicationDeadline,
      capacity: market.vendorInfo.capacity
    },
    status: tracking || null,
    isOpen: market.vendorInfo.applicationDeadline ?
      new Date() < market.vendorInfo.applicationDeadline : true,
    canApply: !tracking || tracking.status === 'cancelled',
    isBooked: tracking && tracking.status === 'booked'
  }

  sendSuccess(res, applicationStatus, 'Application status retrieved successfully')
})

// Get earnings, attendance trends for the vendor at this market
const getVendorAnalytics = catchAsync(async (req, res, next) => {
  const { id } = req.params

  // Add pagination limits to prevent memory issues with large datasets
  const expenseLimit = 10000 // Maximum 10,000 expense records for performance

  // MongoDB aggregation for efficient analytics calculation
  const analyticsResult = await Expense.aggregate([
    {
      $match: {
        vendor: mongoose.Types.ObjectId(req.user.id),
        market: mongoose.Types.ObjectId(id),
        isDeleted: false
      }
    },
    {
      $limit: expenseLimit
    },
    {
      $match: {
        vendor: mongoose.Types.ObjectId(req.user.id),
        market: mongoose.Types.ObjectId(id),
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
        },
        totalRevenue: {
          $sum: {
            $cond: [{ $eq: ['$category', 'revenue'] }, '$amount', 0]
          }
        },
        expensesByCategory: {
          $push: {
            $cond: [
              { $ne: ['$category', 'revenue'] },
              { category: '$category', amount: '$amount' },
              null
            ]
          }
        },
        revenueByCategory: {
          $push: {
            $cond: [
              { $eq: ['$category', 'revenue'] },
              { category: '$category', amount: '$amount' },
              null
            ]
          }
        },
        totalCount: { $sum: 1 },
        expenseCount: {
          $sum: {
            $cond: [{ $eq: ['$category', 'revenue'] }, 0, 1]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalExpenses: 1,
        totalRevenue: 1,
        profit: { $subtract: ['$totalRevenue', '$totalExpenses'] },
        expensesByCategory: {
          $filter: {
            input: '$expensesByCategory',
            as: 'expense',
            cond: { $ne: ['$expense', null] }
          }
        },
        revenueByCategory: {
          $filter: {
            input: '$revenueByCategory',
            as: 'revenue',
            cond: { $ne: ['$revenue', null] }
          }
        },
        totalTransactions: '$totalCount',
        expenseCount: 1
      }
    }
  ])

  // Process category aggregations
  const analytics = analyticsResult[0] || {
    totalExpenses: 0,
    totalRevenue: 0,
    profit: 0,
    expensesByCategory: [],
    revenueByCategory: [],
    totalTransactions: 0,
    expenseCount: 0
  }

  // Convert arrays to objects for easier client consumption
  const expensesByCategory = analytics.expensesByCategory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount
    return acc
  }, {})

  const revenueByCategory = analytics.revenueByCategory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount
    return acc
  }, {})

  const responseAnalytics = {
    expenses: {
      total: analytics.totalExpenses,
      byCategory: expensesByCategory
    },
    revenue: {
      total: analytics.totalRevenue,
      byCategory: revenueByCategory
    },
    profit: analytics.profit,
    expenseCount: analytics.expenseCount,
    transactionCount: analytics.totalTransactions
  }

  sendSuccess(res, responseAnalytics, 'Vendor analytics retrieved successfully')
})

// How vendor performs at this vs other markets - comparison data
const getVendorComparison = catchAsync(async (req, res, next) => {
  // Get all markets where vendor has participated
  const participations = await UserMarketTracking.find({
    user: req.user.id,
    status: 'completed'
  }).populate('market', 'name category location.city location.state')

  // Single aggregation query for all expense summaries
  const marketIds = participations.map(p => p.market._id)

  const expenseSummaries = await Expense.aggregate([
    {
      $match: {
        vendor: mongoose.Types.ObjectId(req.user.id),
        market: { $in: marketIds },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: { market: '$market', category: '$category' },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        taxDeductible: {
          $sum: { $cond: ['$isTaxDeductible', '$amount', 0] }
        }
      }
    },
    {
      $group: {
        _id: '$_id.market',
        categories: {
          $push: {
            category: '$_id.category',
            totalAmount: '$totalAmount',
            count: '$count',
            taxDeductible: '$taxDeductible'
          }
        },
        totalExpenses: { $sum: { $cond: [{ $eq: ['$_id.category', 'revenue'] }, 0, '$totalAmount'] } },
        totalRevenue: { $sum: { $cond: [{ $eq: ['$_id.category', 'revenue'] }, '$totalAmount', 0] } },
        totalTaxDeductible: { $sum: '$taxDeductible' },
        totalCount: { $sum: '$count' }
      }
    }
  ])

  const comparison = {
    totalMarkets: participations.length,
    markets: participations.map(p => {
      const summary = expenseSummaries.find(s => s._id.equals(p.market._id))
      return {
        market: p.market,
        summary: summary ? {
          totalExpenses: summary.totalExpenses,
          totalRevenue: summary.totalRevenue,
          netProfit: summary.totalRevenue - summary.totalExpenses,
          totalTaxDeductible: summary.totalTaxDeductible,
          totalTransactions: summary.totalCount,
          categories: summary.categories
        } : null
      }
    })
  }

  // Calculate average performance metrics
  if (expenseSummaries.length > 0) {
    const totalProfit = expenseSummaries.reduce((sum, s) => sum + (s.totalRevenue - s.totalExpenses), 0)
    comparison.averageProfit = totalProfit / expenseSummaries.length
    comparison.markets.sort((a, b) => (b.summary?.netProfit || 0) - (a.summary?.netProfit || 0))
  }

  sendSuccess(res, comparison, 'Vendor market comparison retrieved successfully')
})

// Get message history with market promoter
const getPromoterMessages = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { page = 1, limit = 20 } = req.query

  const market = await Market.findById(id)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Only vendors and the market promoter can see messages
  if (req.user.role !== 'admin' &&
      !market.promoter.equals(req.user._id) &&
      req.user.role !== 'vendor') {
    return next(new AppError('Access denied. You can only see messages for markets you own or applied to.', 403))
  }

  const messages = await Message.getUserMarketMessages(req.user.id, id, { page: parseInt(page), limit: parseInt(limit) })

  sendSuccess(res, {
    messages,
    market: {
      id: market._id,
      name: market.name,
      promoter: market.promoter
    }
  }, 'Promoter messages retrieved successfully')
})

// Send message to promoter
const sendPromoterMessage = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { content, recipientId } = req.body

  if (!content || !content.trim()) {
    return next(new AppError('Message content cannot be empty or contain only whitespace', 400))
  }

  const market = await Market.findById(id)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  let recipient
  if (req.user.role === 'vendor') {
    // Vendor can only send to market promoter
    recipient = market.promoter
  } else if (market.promoter.equals(req.user._id)) {
    // Promoter sending to a specific vendor who has applied to their market
    if (!recipientId) {
      return next(new AppError('Promoter-to-vendor messaging requires specifying recipient vendor', 400))
    }

    // Check if vendor has applied to this market
    const vendorApplication = await UserMarketTracking.findOne({
      user: recipientId,
      market: id,
      status: { $in: ['applied', 'booked', 'completed'] }
    })

    if (!vendorApplication) {
      return next(new AppError('Can only send messages to vendors who have applied to your market', 403))
    }

    recipient = recipientId
  } else {
    return next(new AppError('Only vendors and promoters for this market can send messages', 403))
  }

  const message = await Message.create({
    content: content.trim(),
    sender: req.user.id,
    recipient,
    market: id,
    messageType: req.user.role === 'vendor' ? 'vendor-to-promoter' : 'promoter-to-vendor'
  })

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'username profile.firstName profile.lastName')
    .populate('recipient', 'username profile.firstName profile.lastName')

  sendSuccess(res, populatedMessage, 'Message sent successfully', 201)
})

// Get market-specific todo lists
const getVendorTodos = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { status, category, priority } = req.query

  // Verify market exists
  const market = await Market.findById(id)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  const options = {}
  if (status) options.status = status
  if (category) options.category = category
  if (priority) options.priority = priority

  const todos = await Todo.getVendorMarketTodos(req.user.id, id, options)

  sendSuccess(res, {
    todos,
    market: {
      id: market._id,
      name: market.name
    }
  }, 'Vendor todos retrieved successfully')
})

// Get market-specific expense tracking
const getVendorExpenses = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { category, dateFrom, dateTo } = req.query

  // Verify market exists
  const market = await Market.findById(id)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  const options = {}
  if (category) options.category = category
  if (dateFrom) options.dateFrom = dateFrom
  if (dateTo) options.dateTo = dateTo

  const expenses = await Expense.getVendorMarketExpenses(req.user.id, id, options)

  sendSuccess(res, {
    expenses,
    market: {
      id: market._id,
      name: market.name
    }
  }, 'Vendor expenses retrieved successfully')
})

// Get parking, loading, setup information
const getLogistics = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const market = await Market.findById(id)
    .populate('promoter', 'username profile.firstName profile.lastName contact')

  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Extract logistics-related information
  const logistics = {
    market: {
      id: market._id,
      name: market.name,
      address: market.location,
      contact: market.contact,
      promoter: market.promoter
    },
    setupInfo: {
      boothSizes: market.vendorInfo.boothSizes,
      requirements: market.vendorInfo.requirements,
      amenities: market.vendorInfo.amenities,
      setupTimes: market.dates
    },
    accessibility: market.accessibility
  }

  sendSuccess(res, logistics, 'Logistics information retrieved successfully')
})

// Get weather forecast for market dates
const getWeatherForecast = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const market = await Market.findById(id)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // For now, return a mock weather forecast
  // In a real implementation, this would integrate with a weather API
  const mockForecast = {
    market: {
      id: market._id,
      name: market.name,
      location: market.location,
      dates: market.dates
    },
    forecast: [
      {
        date: new Date().toISOString().split('T')[0],
        condition: 'Sunny',
        temperature: { high: 75, low: 55 },
        precipitation: 10
      }
    ],
    note: 'This is mock data. Integrate with a weather service API for real forecasts.'
  }

  sendSuccess(res, mockForecast, 'Weather forecast retrieved successfully')
})

// Get calendar integration data
const getCalendarEvents = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const market = await Market.findById(id)
  if (!market) {
    return next(new AppError('Market not found', 404))
  }

  // Convert market dates to calendar events
  const events = []

  if (market.dates.type === 'one-time') {
    market.dates.events.forEach(event => {
      events.push({
        id: `${market._id}_${event.startDate.getTime()}`,
        title: market.name,
        start: event.startDate,
        end: event.endDate,
        location: `${market.location.address}, ${market.location.city}, ${market.location.state}`,
        description: market.description,
        marketId: market._id
      })
    })
  } else if (market.dates.type === 'recurring') {
    // For recurring markets, generate next few occurrences
    // This would need more complex logic for real implementation
    events.push({
      id: `${market._id}_recurring`,
      title: `${market.name} (Recurring)`,
      start: null, // Would calculate next occurrence
      end: null,
      location: `${market.location.address}, ${market.location.city}, ${market.location.state}`,
      description: market.description,
      marketId: market._id,
      recurring: market.dates.recurring
    })
  }

  sendSuccess(res, {
    events,
    market: {
      id: market._id,
      name: market.name,
      dates: market.dates
    }
  }, 'Calendar events retrieved successfully')
})

module.exports = {
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
  getCalendarEvents
}