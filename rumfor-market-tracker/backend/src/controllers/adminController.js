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

  // Count applications by status for better metrics
  const pendingApplications = await UserMarketTracking.countDocuments({
    status: { $in: ['applied', 'under-review'] }
  })

  // Get recent users count (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
    isActive: true
  })

  // Calculate user growth rate (simplified - compare last 30 days to 30-60 days ago)
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  const usersLastPeriod = await User.countDocuments({
    createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    isActive: true
  })

  const userGrowthRate = usersLastPeriod > 0
    ? ((newUsersThisMonth - usersLastPeriod) / usersLastPeriod) * 100
    : 0

  // Get marketplace activity (applications this month)
  const marketplaceActivity = await UserMarketTracking.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  })

  // Get application success rate
  const approvedApplications = await UserMarketTracking.countDocuments({ status: 'approved' })
  const totalApplicationsProcessed = await UserMarketTracking.countDocuments({
    status: { $in: ['approved', 'rejected'] }
  })

  const applicationSuccessRate = totalApplicationsProcessed > 0
    ? (approvedApplications / totalApplicationsProcessed) * 100
    : 0

  // Get active users (users with activity in last 30 days)
  const activeUsers = await User.countDocuments({
    lastLogin: { $gte: thirtyDaysAgo },
    isActive: true
  })

  // Get reported content count
  const reportedContent = flaggedContent

  // Get system health mock data (in production, this would be real system checks)
  const systemHealth = 95 // Would be calculated from real system metrics

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
    totalUsers,
    totalMarkets,
    totalApplications,
    activeUsers,
    pendingApplications,
    reportedContent,
    userGrowthRate,
    marketplaceActivity,
    applicationSuccessRate,
    systemHealth,
    recentActivity
  }, 'Dashboard data retrieved successfully')
})

// Alias for frontend compatibility
const getAdminStats = getDashboard

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
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } }
    ]
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(limit)

  const total = await User.countDocuments(query)

  // Get user stats by aggregating from UserMarketTracking
  const userIds = users.map(user => user._id)
  const userStats = await UserMarketTracking.aggregate([
    { $match: { userId: { $in: userIds } } },
    {
      $group: {
        _id: '$userId',
        totalApplications: { $sum: 1 },
        approvedApplications: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        rejectedApplications: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        }
      }
    }
  ])

  // Create a map for quick lookup
  const statsMap = new Map()
  userStats.forEach(stat => {
    statsMap.set(stat._id.toString(), stat)
  })

  // Enhance users with stats and transform field names
  const enhancedUsers = users.map(user => {
    const stats = statsMap.get(user._id.toString()) || {
      totalApplications: 0,
      approvedApplications: 0,
      rejectedApplications: 0
    }

    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.profileImage, // Map profileImage to avatar
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      totalApplications: stats.totalApplications,
      approvedApplications: stats.approvedApplications,
      rejectedApplications: stats.rejectedApplications,
      lastActiveAt: user.lastLogin || user.updatedAt, // Use lastLogin or fallback to updatedAt
      isVerified: user.isEmailVerified, // Map isEmailVerified to isVerified
      reportedContent: 0 // TODO: Implement reported content count
    }
  })

  sendSuccess(res, {
    users: enhancedUsers,
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
  if (verifiedPromoter !== undefined) updateData.isEmailVerified = verifiedPromoter

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

  // Transform the response to match frontend expectations
  const transformedUser = {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    avatar: user.profileImage,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive
  }

  sendSuccess(res, { user: transformedUser }, 'User updated successfully')
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