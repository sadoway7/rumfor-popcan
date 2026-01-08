const { catchAsync, sendSuccess, sendError } = require('../middleware/errorHandler')
const User = require('../models/User')
const UserMarketTracking = require('../models/UserMarketTracking')
const Market = require('../models/Market')
const { validateMongoId } = require('../middleware/validation')

// Get user profile with tracking data
const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select('-password')
    .populate('verifiedPromoter', 'verificationDate verifiedBy')

  if (!user) {
    return sendError(res, 'User not found', 404)
  }

  // Get user's market tracking data
  const tracking = await UserMarketTracking.find({ user: req.user.id })
    .populate('market', 'name location dates category isActive')
    .sort({ createdAt: -1 })

  const profileData = {
    ...user.toObject(),
    tracking: tracking.map(t => ({
      market: t.market,
      status: t.status,
      applicationData: t.applicationData,
      personalNotes: t.personalNotes,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }))
  }

  sendSuccess(res, { user: profileData }, 'Profile retrieved successfully')
})

// Update user profile
const updateProfile = catchAsync(async (req, res, next) => {
  const { profile, preferences } = req.body

  const updateData = {}

  if (profile) {
    updateData.profile = profile
  }

  if (preferences) {
    updateData.preferences = preferences
    updateData.updatedAt = new Date()
  }

  const user = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true
  }).select('-password')

  if (!user) {
    return sendError(res, 'User not found', 404)
  }

  sendSuccess(res, { user }, 'Profile updated successfully')
})

// Track a market (create or update tracking status)
const trackMarket = catchAsync(async (req, res, next) => {
  const { marketId, status = 'interested' } = req.body

  if (!marketId) {
    return sendError(res, 'Market ID is required', 400)
  }

  // Verify market exists
  const market = await Market.findById(marketId)
  if (!market) {
    return sendError(res, 'Market not found', 404)
  }

  // Find or create tracking relationship
  let tracking = await UserMarketTracking.findOne({
    user: req.user.id,
    market: marketId
  })

  if (!tracking) {
    tracking = await UserMarketTracking.create({
      user: req.user.id,
      market: marketId,
      status
    })
  } else {
    await tracking.updateStatus(status)
  }

  const populatedTracking = await UserMarketTracking.findById(tracking._id)
    .populate('market', 'name location dates category isActive')

  sendSuccess(res, {
    tracking: {
      market: populatedTracking.market,
      status: populatedTracking.status,
      createdAt: populatedTracking.createdAt,
      updatedAt: populatedTracking.updatedAt
    }
  }, 'Market tracked successfully')
})

// Untrack a market
const untrackMarket = catchAsync(async (req, res, next) => {
  const { marketId } = req.body

  if (!marketId) {
    return sendError(res, 'Market ID is required', 400)
  }

  const tracking = await UserMarketTracking.findOne({
    user: req.user.id,
    market: marketId
  })

  if (!tracking) {
    return sendError(res, 'Tracking relationship not found', 404)
  }

  await UserMarketTracking.deleteOne({ _id: tracking._id })

  sendSuccess(res, null, 'Market untracked successfully')
})

// Get user's tracked markets
const getTrackedMarkets = catchAsync(async (req, res, next) => {
  const { status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

  const query = { user: req.user.id }
  if (status) {
    query.status = status
  }

  const tracking = await UserMarketTracking.find(query)
    .populate('market', 'name location dates category promoter isActive')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })

  // Filter out markets that no longer exist
  const validTracking = tracking.filter(t => t.market)

  sendSuccess(res, {
    tracking: validTracking,
    count: validTracking.length
  }, 'Tracked markets retrieved successfully')
})

// Get user by ID (admin only)
const getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const user = await User.findById(id)
    .select('-password')
    .populate('verifiedPromoter', 'verificationDate verifiedBy')

  if (!user) {
    return sendError(res, 'User not found', 404)
  }

  // Get user's tracking stats
  const trackingStats = await UserMarketTracking.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ])

  const userData = {
    ...user.toObject(),
    trackingStats: trackingStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count
      return acc
    }, {})
  }

  sendSuccess(res, { user: userData }, 'User retrieved successfully')
})

// Get all users (admin only)
const getUsers = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    role,
    status,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query

  let query = {}

  if (role) {
    query.role = role
  }

  if (status) {
    if (status === 'active') {
      query.isActive = true
    } else if (status === 'inactive') {
      query.isActive = false
    }
  }

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { 'profile.firstName': { $regex: search, $options: 'i' } },
      { 'profile.lastName': { $regex: search, $options: 'i' } },
      { 'profile.business': { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  }

  const users = await User.find(query)
    .select('-password')
    .populate('verifiedPromoter', 'verificationDate verifiedBy')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(limit)

  const total = await User.countDocuments(query)

  sendSuccess(res, {
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }, 'Users retrieved successfully')
})

// Update user (admin only)
const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { role, isActive, profile, verifiedPromoter } = req.body

  const updateData = { updatedAt: new Date() }

  if (role !== undefined) updateData.role = role
  if (isActive !== undefined) updateData.isActive = isActive
  if (profile) updateData.profile = profile
  if (verifiedPromoter) updateData.verifiedPromoter = verifiedPromoter

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).select('-password')

  if (!user) {
    return sendError(res, 'User not found', 404)
  }

  sendSuccess(res, { user }, 'User updated successfully')
})

module.exports = {
  getProfile,
  updateProfile,
  trackMarket,
  untrackMarket,
  getTrackedMarkets,
  getUser,
  getUsers,
  updateUser
}