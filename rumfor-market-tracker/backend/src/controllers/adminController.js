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
    isEmailVerified,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query

  let query = {}

  if (role) query.role = role
  if (status === 'active') query.isActive = true
  if (status === 'inactive') query.isActive = false
  if (isEmailVerified !== undefined) query.isEmailVerified = isEmailVerified === 'true'

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

  // Get user stats by aggregating from UserMarketTracking (only for markets that accept vendors)
  const userIds = users.map(user => user._id)
  const userStats = await UserMarketTracking.aggregate([
    { $match: { userId: { $in: userIds } } },
    {
      $lookup: {
        from: 'markets',
        localField: 'market',
        foreignField: '_id',
        as: 'marketInfo'
      }
    },
    { $unwind: { path: '$marketInfo', preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $or: [
          { 'marketInfo.applicationsEnabled': true },
          { marketInfo: { $exists: false } }
        ]
      }
    },
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
      totalPages: Math.ceil(total / limit)
    }
  }, 'Users retrieved successfully')
})

const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { role, isActive, isEmailVerified } = req.body

  const updateData = { updatedAt: new Date() }
  if (role !== undefined) updateData.role = role
  if (isActive !== undefined) updateData.isActive = isActive
  if (isEmailVerified !== undefined) updateData.isEmailVerified = isEmailVerified

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

  sendSuccess(res, { user: {
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
  } }, 'User updated successfully')
})

// Delete user (for re-registration scenarios)
const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params
  
  // Prevent admin from deleting themselves (req.user.userId is the correct property)
  const currentUserId = req.user?.userId?.toString()
  if (currentUserId && id === currentUserId) {
    return sendError(res, 'Cannot delete your own account', 400)
  }
  
  const user = await User.findById(id)
  if (!user) {
    return sendError(res, 'User not found', 404)
  }
  
  // Delete user's applications/tracking records
  await UserMarketTracking.deleteMany({ user: id })
  
  // Delete user's notifications
  const Notification = require('../models/Notification')
  await Notification.deleteMany({ recipient: id })
  
  // Delete the user
  await User.findByIdAndDelete(id)
  
  sendSuccess(res, null, 'User deleted successfully')
})

// Get single user with full profile
const getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params
  
  const user = await User.findById(id).select('-password')
  if (!user) {
    return sendError(res, 'User not found', 404)
  }
  
  // Get user stats - only count applications for markets with applicationsEnabled
  const stats = await UserMarketTracking.aggregate([
    {
      $match: {
        user: user._id,
        // Only include tracking records for markets with applicationsEnabled
      }
    },
    {
      $lookup: {
        from: 'markets',
        localField: 'market',
        foreignField: '_id',
        as: 'marketInfo'
      }
    },
    {
      $unwind: { path: '$marketInfo', preserveNullAndEmptyArrays: true }
    },
    {
      $match: {
        // Only count if market doesn't exist (legacy data) OR applications are enabled
        $or: [
          { 'marketInfo.applicationsEnabled': true },
          { marketInfo: { $exists: false } }
        ]
      }
    },
    {
      $group: {
        _id: null,
        totalApplications: { $sum: 1 },
        approvedApplications: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        rejectedApplications: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        pendingApplications: { $sum: { $cond: [{ $in: ['$status', ['applied', 'under-review']] }, 1, 0] } }
      }
    }
  ])
  
  const userStats = stats[0] || { totalApplications: 0, approvedApplications: 0, rejectedApplications: 0, pendingApplications: 0 }
  
  // Get total tracking count (only for markets that accept vendors)
  const trackingWithApplications = await UserMarketTracking.aggregate([
    { $match: { user: user._id } },
    {
      $lookup: {
        from: 'markets',
        localField: 'market',
        foreignField: '_id',
        as: 'marketInfo'
      }
    },
    {
      $unwind: { path: '$marketInfo', preserveNullAndEmptyArrays: true }
    },
    {
      $match: {
        $or: [
          { 'marketInfo.applicationsEnabled': true },
          { marketInfo: { $exists: false } }
        ]
      }
    },
    { $count: 'total' }
  ])
  
  const followingCount = trackingWithApplications[0]?.total || 0
  
  sendSuccess(res, {
    user: {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      avatar: user.profileImage,
      bio: user.bio,
      phone: user.phone,
      businessName: user.businessName,
      businessDescription: user.businessDescription,
      businessLicense: user.businessLicense,
      insuranceCertificate: user.insuranceCertificate,
      taxId: user.taxId,
      organizationName: user.organizationName,
      organizationDescription: user.organizationDescription,
      preferences: user.preferences,
      twoFactorEnabled: user.twoFactorEnabled,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      totalApplications: userStats.totalApplications,
      approvedApplications: userStats.approvedApplications,
      rejectedApplications: userStats.rejectedApplications,
      pendingApplications: userStats.pendingApplications,
      followingCount,
      lastActiveAt: user.lastLogin || user.updatedAt
    }
  }, 'User retrieved successfully')
})

// Get user activity
const getUserActivity = catchAsync(async (req, res, next) => {
  const { id } = req.params
  
  // Check if user exists
  const user = await User.findById(id).select('username email firstName lastName')
  if (!user) {
    return sendError(res, 'User not found', 404)
  }
  
  // Get user's applications with market info (only for markets that accept vendors)
  const applications = await UserMarketTracking.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'markets',
        localField: 'market',
        foreignField: '_id',
        as: 'marketInfo'
      }
    },
    { $unwind: { path: '$marketInfo', preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $or: [
          { 'marketInfo.applicationsEnabled': true },
          { marketInfo: { $exists: false } }
        ]
      }
    },
    { $sort: { createdAt: -1 } }
  ])
  
  // Transform applications to include market name
  const transformedApplications = applications.map(app => ({
    id: app._id.toString(),
    marketId: app.market?._id?.toString(),
    marketName: app.marketInfo?.name || 'Unknown Market',
    marketCategory: app.marketInfo?.category,
    status: app.status,
    createdAt: app.createdAt
  }))
  
  // Get user's comments
  const comments = await Comment.find({ author: id, isDeleted: false })
    .populate('market', 'name')
    .sort({ createdAt: -1 })
    .lean()
  
  // Get user's photos
  const photos = await Photo.find({ userId: id, isDeleted: false })
    .populate('market', 'name')
    .sort({ createdAt: -1 })
    .lean()
  
  // Get markets user is tracking (only for markets that accept vendors)
  const tracking = await UserMarketTracking.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'markets',
        localField: 'market',
        foreignField: '_id',
        as: 'marketInfo'
      }
    },
    { $unwind: { path: '$marketInfo', preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $or: [
          { 'marketInfo.applicationsEnabled': true },
          { marketInfo: { $exists: false } }
        ]
      }
    },
    { $sort: { updatedAt: -1 } }
  ])
  
  // Transform tracking to include market info
  const transformedTracking = tracking.map(t => ({
    id: t._id.toString(),
    marketId: t.market?._id?.toString(),
    marketName: t.marketInfo?.name || 'Unknown Market',
    marketCategory: t.marketInfo?.category,
    marketStatus: t.marketInfo?.status,
    status: t.status,
    updatedAt: t.updatedAt
  }))
  
  sendSuccess(res, {
    applications: transformedApplications,
    comments: comments.map(c => ({
      id: c._id.toString(),
      marketId: c.market?._id?.toString(),
      marketName: c.market?.name || 'Unknown Market',
      content: c.content,
      createdAt: c.createdAt
    })),
    photos: photos.map(p => ({
      id: p._id.toString(),
      marketId: p.market?._id?.toString(),
      marketName: p.market?.name || 'Unknown Market',
      url: p.url,
      createdAt: p.createdAt
    })),
    tracking: transformedTracking
  }, 'User activity retrieved successfully')
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
  const { 
    isActive, 
    category, 
    vendorInfo, 
    schedule, 
    name, 
    description, 
    applicationsEnabled, 
    status, 
    images, 
    heroImage,
    // Location fields
    address,
    city,
    state,
    zipCode,
    country
  } = req.body

  const updateData = { updatedAt: new Date() }
  if (isActive !== undefined) updateData.isActive = isActive
  if (category) updateData.category = category
  if (vendorInfo) updateData.vendorInfo = vendorInfo
  if (name) updateData.name = name
  if (description) updateData.description = description
  if (applicationsEnabled !== undefined) updateData.applicationsEnabled = applicationsEnabled
  if (status) updateData.status = status

  // Handle location updates
  if (address || city || state || zipCode || country) {
    updateData.location = {
      address: {
        street: address || '',
        city: city || '',
        state: state || '',
        zipCode: zipCode || '',
        country: country || 'USA'
      },
      // Preserve existing coordinates if not being updated
    }
  }

  // Handle images
  if (images && Array.isArray(images)) {
    updateData.images = images.map((url, index) => ({
      url,
      isHero: url === heroImage || index === 0,
      uploadedAt: new Date()
    }))
  }

  // Handle schedule updates
  if (schedule && Array.isArray(schedule) && schedule.length > 0) {
    // Convert frontend schedule format to backend format
    const recurringSchedules = schedule.filter(s => s.isRecurring)
    const specialDates = schedule.filter(s => !s.isRecurring)

    updateData.schedule = {
      recurring: recurringSchedules.length > 0,
      daysOfWeek: recurringSchedules.length > 0 ? recurringSchedules.map(s => {
        const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        return dayMap[s.dayOfWeek]
      }).filter(Boolean) : [],
      startTime: recurringSchedules.length > 0 ? recurringSchedules[0].startTime : '08:00',
      endTime: recurringSchedules.length > 0 ? recurringSchedules[0].endTime : '16:00',
      seasonStart: recurringSchedules.length > 0 ? new Date(recurringSchedules[0].startDate) : new Date(),
      seasonEnd: recurringSchedules.length > 0 ? new Date(recurringSchedules[0].endDate) : new Date(),
      specialDates: specialDates.map(s => ({
        date: new Date(s.startDate),
        startTime: s.startTime,
        endTime: s.endTime,
        notes: ''
      }))
    }
  } else if (schedule && Array.isArray(schedule) && schedule.length === 0) {
    // Clear schedule if empty array sent
    updateData.schedule = {
      recurring: false,
      daysOfWeek: [],
      startTime: '08:00',
      endTime: '16:00',
      seasonStart: new Date(),
      seasonEnd: new Date(),
      specialDates: []
    }
  }

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

const deleteMarket = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { reason } = req.query

  const market = await Market.findById(id)
  if (!market) {
    return sendError(res, 'Market not found', 404)
  }

  // Soft delete: set isActive to false and status to cancelled
  market.isActive = false
  market.status = 'cancelled'
  market.updatedAt = new Date()
  await market.save()

  // Notify promoter if market was deleted
  if (market.promoter) {
    await Notification.create({
      recipient: market.promoter,
      type: 'admin-action',
      title: 'Market Deleted',
      message: `Your market "${market.name}" has been deleted by an administrator${reason ? ` (Reason: ${reason})` : ''}`,
      data: { marketId: market._id, reason, deletedBy: req.user.id },
      priority: 'high'
    })
  }

  sendSuccess(res, { id: market._id.toString(), deleted: true }, 'Market deleted successfully')
})

// Get single market for admin
const getMarket = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const market = await Market.findById(id)
    .populate('promoter', 'username email profile.firstName profile.lastName profile.businessName')
    .populate('createdBy', 'username email')

  if (!market) {
    return sendError(res, 'Market not found', 404)
  }

  // Flatten location for frontend compatibility
  const flatLocation = {
    address: market.location?.address?.street || '',
    city: market.location?.address?.city || '',
    state: market.location?.address?.state || '',
    zipCode: market.location?.address?.zipCode || '',
    country: market.location?.address?.country || 'USA',
    latitude: market.location?.coordinates?.[1],
    longitude: market.location?.coordinates?.[0]
  }

  // Get additional stats
  const [trackingCount, applicationCount, approvedCount, rejectedCount, pendingCount, commentCount, photoCount] = await Promise.all([
    require('../models/UserMarketTracking').countDocuments({ market: id }),
    require('../models/UserMarketTracking').countDocuments({ market: id, status: 'applied' }),
    require('../models/UserMarketTracking').countDocuments({ market: id, status: 'approved' }),
    require('../models/UserMarketTracking').countDocuments({ market: id, status: 'rejected' }),
    require('../models/UserMarketTracking').countDocuments({ market: id, status: { $in: ['applied', 'under-review'] } }),
    require('../models/Comment').countDocuments({ market: id, isDeleted: false }),
    require('../models/Photo').countDocuments({ market: id, isDeleted: false })
  ])

  // Build marketType from createdByType
  const marketType = market.createdByType === 'vendor' ? 'vendor-created' : 'promoter-managed'

  // Flatten schedule for frontend
  const schedules = []
  if (market.schedule && (market.schedule.recurring || market.schedule.specialDates)) {
    if (market.schedule.recurring && market.schedule.daysOfWeek && market.schedule.daysOfWeek.length > 0) {
      const dayMap = { 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 0 }
      market.schedule.daysOfWeek.forEach(day => {
        const dayOfWeek = dayMap[day.toLowerCase()]
        if (dayOfWeek !== undefined) {
          schedules.push({
            id: `${market._id}_${day}`,
            dayOfWeek,
            startTime: market.schedule.startTime,
            endTime: market.schedule.endTime,
            startDate: market.schedule.seasonStart?.toISOString() || new Date().toISOString(),
            endDate: market.schedule.seasonEnd?.toISOString() || new Date().toISOString(),
            isRecurring: true
          })
        }
      })
    } else if (market.schedule.specialDates && market.schedule.specialDates.length > 0) {
      market.schedule.specialDates.forEach(date => {
        schedules.push({
          id: `${market._id}_${date.date.getTime()}`,
          dayOfWeek: date.date.getDay(),
          startTime: date.startTime || market.schedule.startTime,
          endTime: date.endTime || market.schedule.endTime,
          startDate: date.date.toISOString(),
          endDate: date.date.toISOString(),
          isRecurring: false
        })
      })
    }
  }

  // Flatten images
  const images = (market.images || []).map(img => img.url)

  // Flatten amenities to accessibility
  const accessibility = {
    wheelchairAccessible: (market.amenities || []).includes('accessible') || (market.amenities || []).includes('covered_area'),
    parkingAvailable: (market.amenities || []).includes('parking'),
    restroomsAvailable: (market.amenities || []).includes('restrooms'),
    familyFriendly: (market.amenities || []).includes('playground'),
    petFriendly: (market.amenities || []).includes('pet_friendly')
  }

  sendSuccess(res, {
    market: {
      id: market._id.toString(),
      name: market.name,
      description: market.description,
      category: market.category,
      marketType,
      createdByType: market.createdByType,
      location: flatLocation,
      schedule: schedules,
      status: market.status,
      isActive: market.isActive !== false,
      applicationsEnabled: market.applicationsEnabled || false,
      images,
      tags: market.tags || [],
      accessibility,
      contact: {
        phone: market.contact?.phone,
        email: market.contact?.email,
        website: market.contact?.website,
        socialMedia: market.contact?.socialMedia
      },
      stats: {
        viewCount: market.stats?.viewCount || 0,
        favoriteCount: market.stats?.favoriteCount || 0,
        applicationCount: market.stats?.applicationCount || 0,
        commentCount: market.stats?.commentCount || 0,
        rating: market.stats?.rating || 0,
        reviewCount: market.stats?.reviewCount || 0
      },
      createdAt: market.createdAt,
      updatedAt: market.updatedAt
    },
    stats: {
      totalTracking: trackingCount,
      totalApplications: applicationCount,
      approvedApplications: approvedCount,
      rejectedApplications: rejectedCount,
      pendingApplications: pendingCount,
      totalComments: commentCount,
      totalPhotos: photoCount
    }
  }, 'Market retrieved successfully')
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
  deleteUser,
  getUser,
  getUserActivity,
  getMarkets,
  getMarket,
  updateMarket,
  deleteMarket,
  getModerationQueue,
  moderateContent,
  getSettings,
  updateSettings
}