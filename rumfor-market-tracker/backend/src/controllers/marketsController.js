const { catchAsync, AppError, sendSuccess, sendError } = require('../middleware/errorHandler')
const Market = require('../models/Market')
const UserMarketTracking = require('../models/UserMarketTracking')
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
    search
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

  sendSuccess(res, {
    markets,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    },
    filters: {
      categories: popularCategories
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
  // Add promoter to market data
  const marketData = {
    ...req.body,
    promoter: req.user.id
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

  // Check if user owns this market or is admin
  if (market.promoter.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only update markets you own', 403))
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

  // Check if user owns this market or is admin
  if (market.promoter.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only delete markets you own', 403))
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
  verifyMarket
}