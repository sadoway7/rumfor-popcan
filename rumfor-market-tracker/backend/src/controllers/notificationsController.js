const { catchAsync, AppError, sendSuccess } = require('../middleware/errorHandler')
const Notification = require('../models/Notification')
const User = require('../models/User')

// Get user notifications
const getNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user.id
  const { page = 1, limit = 20, unreadOnly = false, type } = req.query

  let query = { user: userId }

  // Filter by read status
  if (unreadOnly === 'true') {
    query.read = false
  }

  // Filter by type
  if (type) {
    query.type = type
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec()

  const total = await Notification.countDocuments(query)
  const unreadCount = await Notification.countDocuments({ user: userId, read: false })

  sendSuccess(res, {
    notifications,
    pagination: {
      current: parseInt(page),
      total: Math.ceil(total / limit),
      count: notifications.length
    },
    unreadCount
  }, 'Notifications retrieved successfully')
})

// Mark notification as read
const markAsRead = catchAsync(async (req, res, next) => {
  const { notificationId } = req.params
  const userId = req.user.id

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true, readAt: new Date() },
    { new: true }
  )

  if (!notification) {
    return next(new AppError('Notification not found', 404))
  }

  sendSuccess(res, { notification }, 'Notification marked as read')
})

// Mark all notifications as read
const markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user.id

  const result = await Notification.updateMany(
    { user: userId, read: false },
    { read: true, readAt: new Date() }
  )

  sendSuccess(res, {
    updatedCount: result.modifiedCount
  }, 'All notifications marked as read')
})

// Delete a notification
const deleteNotification = catchAsync(async (req, res, next) => {
  const { notificationId } = req.params
  const userId = req.user.id

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId
  })

  if (!notification) {
    return next(new AppError('Notification not found', 404))
  }

  sendSuccess(res, null, 'Notification deleted')
})

// Delete all read notifications
const deleteReadNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user.id

  const result = await Notification.deleteMany({
    user: userId,
    read: true
  })

  sendSuccess(res, {
    deletedCount: result.deletedCount
  }, 'Read notifications deleted')
})

// Update notification preferences
const updatePreferences = catchAsync(async (req, res, next) => {
  const userId = req.user.id
  const { emailNotifications, pushNotifications, notificationTypes } = req.body

  const updateData = {}

  if (emailNotifications !== undefined) {
    updateData.emailNotifications = emailNotifications
  }

  if (pushNotifications !== undefined) {
    updateData.pushNotifications = pushNotifications
  }

  if (notificationTypes !== undefined) {
    updateData.notificationTypes = notificationTypes
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { preferences: updateData },
    { new: true, runValidators: true }
  )

  sendSuccess(res, {
    preferences: user.preferences
  }, 'Notification preferences updated')
})

// Get notification preferences
const getPreferences = catchAsync(async (req, res, next) => {
  const userId = req.user.id

  const user = await User.findById(userId).select('preferences')

  if (!user) {
    return next(new AppError('User not found', 404))
  }

  sendSuccess(res, {
    preferences: user.preferences || {}
  }, 'Notification preferences retrieved')
})

// Create a notification (internal use, called by other controllers)
const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    // Check user preferences to see if they want this type of notification
    const user = await User.findById(userId).select('preferences')

    // If user has disabled this notification type, skip
    if (user?.preferences?.notificationTypes?.[type] === false) {
      return null
    }

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data
    })

    return notification
  } catch (error) {
    console.error('Failed to create notification:', error)
    return null
  }
}

// Send email notification (if enabled) - placeholder for future implementation
const sendEmailNotification = async (user, notification) => {
  // TODO: Implement email sending when email service is available
  // For now, just log the notification
  console.log(`Email notification would be sent to ${user.email}: ${notification.title}`)
}

// Get notification statistics
const getStats = catchAsync(async (req, res, next) => {
  const userId = req.user.id

  const stats = await Notification.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
        },
        byType: {
          $push: '$type'
        }
      }
    }
  ])

  const typeStats = await Notification.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        unread: {
          $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
        }
      }
    }
  ])

  const result = stats[0] || { totalCount: 0, unreadCount: 0, byType: [] }

  sendSuccess(res, {
    total: result.totalCount,
    unread: result.unreadCount,
    byType: typeStats.reduce((acc, stat) => {
      acc[stat._id] = { total: stat.count, unread: stat.unread }
      return acc
    }, {})
  }, 'Notification statistics retrieved')
})

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  updatePreferences,
  getPreferences,
  createNotification,
  sendEmailNotification,
  getStats
}