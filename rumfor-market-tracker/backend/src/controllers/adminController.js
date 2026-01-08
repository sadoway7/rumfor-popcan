const { catchAsync, sendSuccess, sendError } = require('../middleware/errorHandler')
const User = require('../models/User')
const Market = require('../models/Market')
const Comment = require('../models/Comment')
const Photo = require('../models/Photo')
const UserMarketTracking = require('../models/UserMarketTracking')
const Notification = require('../models/Notification')

// Dashboard analytics
const getDashboard = catchAsync(async (req, res, next) => {
  // Get total counts
  const [
    totalUsers,
    totalMarkets,
    totalApplications,
    totalComments,
    totalPhotos,
    recentUsers,
    recentMarkets,
    recentApplications,
    flaggedContent
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Market.countDocuments({ isActive: true }),
    UserMarketTracking.countDocuments({ status: 'applied' }),
    Comment.countDocuments({ isDeleted: false }),
    Photo.countDocuments({ isDeleted: false }),
    User.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('username email createdAt'),
    Market.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('name promoter createdAt'),
    UserMarketTracking.find().populate('user', 'username').populate('market', 'name').sort({ createdAt: -1 }).limit(5),
    Comment.countDocuments({ isFlagged: true, isDeleted: false })
  ])

  // Get applications by status
  const applicationsByStatus = await UserMarketTracking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ])

  // Get markets by category
  const marketsByCategory = await Market.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ])

  // Recent activity
  const recentActivity = [
    ...recentUsers.map(u => ({
      type: 'user_registration',
      description: `${u.username} registered`,
      timestamp: u.createdAt
    })),
    ...recentMarkets.map(m => ({
      type: 'market_created',
      description: `Market "${m.name}" created`,
      timestamp: m.createdAt
    })),
    ...recentApplications.slice(0, 3).map(a => ({
      type: 'application_submitted',
      description: `${a.user.username} applied to ${a.market.name}`,
      timestamp: a.createdAt
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10)

  sendSuccess(res, {
    analytics: {
      totalUsers,
      totalMarkets,
      totalApplications,
      totalComments,
      totalPhotos,
      flaggedContent,
      applicationsByStatus,
      marketsByCategory,
      recentActivity
    }
  }, 'Dashboard data retrieved successfully')
})

// User management
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

  if (role) query.role = role
  if (status === 'active') query.isActive = true
  if (status === 'inactive') query.isActive = false

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { 'profile.firstName': { $regex: search, $options: 'i' } },
      { 'profile.lastName': { $regex: search, $options: 'i' } }
    ]
  }

  const users = await User.find(query)
    .select('-password')
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

const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { role, isActive, verifiedPromoter } = req.body

  const updateData = { updatedAt: new Date() }
  if (role !== undefined) updateData.role = role
  if (isActive !== undefined) updateData.isActive = isActive
  if (verifiedPromoter !== undefined) updateData.verifiedPromoter = verifiedPromoter

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).select('-password')

  if (!user) {
    return sendError(res, 'User not found', 404)
  }

  // Create notification
  await Notification.create({
    recipient: user._id,
    type: 'admin-action',
    title: 'Account Updated',
    message: 'Your account has been updated by an administrator',
    data: { updatedBy: req.user.id },
    priority: 'medium'
  })

  sendSuccess(res, { user }, 'User updated successfully')
})

// Market management
const getMarkets = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    category,
    status,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query

  let query = {}

  if (category) query.category = category
  if (status === 'active') query.isActive = true
  if (status === 'inactive') query.isActive = false

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { promoter: { $regex: search, $options: 'i' } }
    ]
  }

  const markets = await Market.find(query)
    .populate('promoter', 'username profile.firstName profile.lastName')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(limit)

  const total = await Market.countDocuments(query)

  sendSuccess(res, {
    markets,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }, 'Markets retrieved successfully')
})

const updateMarket = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { isActive, category, vendorInfo } = req.body

  const updateData = { updatedAt: new Date() }
  if (isActive !== undefined) updateData.isActive = isActive
  if (category) updateData.category = category
  if (vendorInfo) updateData.vendorInfo = vendorInfo

  const market = await Market.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).populate('promoter', 'username profile.firstName profile.lastName')

  if (!market) {
    return sendError(res, 'Market not found', 404)
  }

  // Notify promoter if market was deactivated
  if (isActive === false) {
    await Notification.create({
      recipient: market.promoter._id,
      type: 'admin-action',
      title: 'Market Deactivated',
      message: `Your market "${market.name}" has been deactivated by an administrator`,
      data: { marketId: market._id, updatedBy: req.user.id },
      priority: 'high'
    })
  }

  sendSuccess(res, { market }, 'Market updated successfully')
})

// Content moderation
const getModerationQueue = catchAsync(async (req, res, next) => {
  const [
    flaggedComments,
    flaggedPhotos,
    pendingApplications
  ] = await Promise.all([
    Comment.find({ isFlagged: true, isDeleted: false })
      .populate('author', 'username')
      .populate('market', 'name')
      .sort({ createdAt: -1 })
      .limit(20),
    Photo.find({ isFlagged: true, isDeleted: false })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(20),
    UserMarketTracking.find({ status: 'applied' })
      .populate('user', 'username profile')
      .populate('market', 'name')
      .sort({ createdAt: -1 })
      .limit(20)
  ])

  sendSuccess(res, {
    flaggedComments,
    flaggedPhotos,
    pendingApplications
  }, 'Moderation queue retrieved successfully')
})

const moderateContent = catchAsync(async (req, res, next) => {
  const { type, id } = req.params
  const { action, reason } = req.body

  let Model, content

  switch (type) {
    case 'comment':
      Model = Comment
      break
    case 'photo':
      Model = Photo
      break
    default:
      return sendError(res, 'Invalid content type', 400)
  }

  content = await Model.findById(id)
  if (!content) {
    return sendError(res, `${type} not found`, 404)
  }

  if (action === 'delete') {
    content.isDeleted = true
    content.deletedAt = new Date()
  } else if (action === 'moderate') {
    content.isModerated = true
    content.moderatedAt = new Date()
    content.moderatedBy = req.user.id
    content.moderationReason = reason
    content.isDeleted = true
  } else {
    return sendError(res, 'Invalid action', 400)
  }

  await content.save()

  // Create notification for content author
  if (content.author) {
    await Notification.create({
      recipient: content.author,
      type: 'content-moderated',
      title: 'Content Moderated',
      message: `Your ${type} has been ${action}d by an administrator`,
      data: { contentId: id, action, reason, moderatedBy: req.user.id },
      priority: 'medium'
    })
  }

  sendSuccess(res, { content }, `${type} moderated successfully`)
})

// System settings (simplified - in a real app this would be a settings collection)
const getSettings = catchAsync(async (req, res, next) => {
  // For now, return basic settings structure
  // In production, this would come from a settings collection
  const settings = {
    system: {
      maintenanceMode: false,
      registrationEnabled: true,
      maxUploadSize: 10 * 1024 * 1024, // 10MB
      rateLimitWindowMs: 15 * 60 * 1000,
      rateLimitMaxRequests: 100
    },
    notifications: {
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: false
    },
    content: {
      maxCommentLength: 2000,
      imageModerationEnabled: true,
      profanityFilterEnabled: true
    }
  }

  sendSuccess(res, { settings }, 'Settings retrieved successfully')
})

const updateSettings = catchAsync(async (req, res, next) => {
  // In a real implementation, this would update a settings collection
  // For now, just return success
  const { settings } = req.body

  // Here you would validate and save settings to database
  // For demo purposes, we'll just acknowledge the update

  sendSuccess(res, { settings }, 'Settings updated successfully')
})

module.exports = {
  getDashboard,
  getAdminStats,
  getUsers,
  updateUser,
  getMarkets,
  updateMarket,
  getModerationQueue,
  moderateContent,
  getSettings,
  updateSettings
}