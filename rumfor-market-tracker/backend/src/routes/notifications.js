const express = require('express')
const router = express.Router()

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  updatePreferences,
  getPreferences,
  getStats
} = require('../controllers/notificationsController')

const { verifyToken } = require('../middleware/auth')
const { validateMongoId } = require('../middleware/validation')

// User notification preferences schema (for embedding in User model)
const notificationPreferencesSchema = {
  email: {
    applicationStatus: { type: Boolean, default: true },
    marketUpdates: { type: Boolean, default: true },
    comments: { type: Boolean, default: false },
    weeklyDigest: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false }
  },
  push: {
    applicationStatus: { type: Boolean, default: true },
    marketUpdates: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true }
  },
  inApp: {
    applicationStatus: { type: Boolean, default: true },
    marketUpdates: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  }
}

// Controller functions for notifications
const notificationController = {
  // Get user notifications (paginated)
  getUserNotifications: async (req, res) => {
    try {
      const userId = req.user.id
      const { 
        page = 1, 
        limit = 20, 
        unreadOnly = false,
        type,
        priority,
        isArchived = false
      } = req.query

      const notifications = await Notification.getUserNotifications(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        unreadOnly: unreadOnly === 'true',
        type,
        priority,
        isArchived: isArchived === 'true'
      })

      const total = await Notification.countDocuments({
        recipient: userId,
        isDeleted: false,
        isArchived: isArchived === 'true',
        ...(unreadOnly === 'true' && { isRead: false }),
        ...(type && { type }),
        ...(priority && { priority })
      })

      // Get unread count
      const unreadCount = await Notification.getUnreadCount(userId)

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          },
          unreadCount
        },
        message: 'Notifications retrieved successfully'
      })
    } catch (error) {
      console.error('Error getting notifications:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notifications',
        error: error.message
      })
    }
  },

  // Get single notification
  getNotification: async (req, res) => {
    try {
      const { id } = req.params
      const userId = req.user.id

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid notification ID'
        })
      }

      const notification = await Notification.findOne({
        _id: id,
        recipient: userId,
        isDeleted: false
      })
        .populate('data.marketId', 'name location.city location.state')
        .populate('data.userId', 'username profile.firstName profile.lastName')

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        })
      }

      res.json({
        success: true,
        data: { notification },
        message: 'Notification retrieved successfully'
      })
    } catch (error) {
      console.error('Error getting notification:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notification',
        error: error.message
      })
    }
  },

  // Mark single notification as read
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params
      const userId = req.user.id

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid notification ID'
        })
      }

      const notification = await Notification.findOne({
        _id: id,
        recipient: userId,
        isDeleted: false
      })

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        })
      }

      await notification.markAsRead()

      res.json({
        success: true,
        data: { notification },
        message: 'Notification marked as read'
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      })
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.id
      const { type, priority } = req.query

      const filter = {
        recipient: userId,
        isRead: false,
        isDeleted: false
      }

      if (type) filter.type = type
      if (priority) filter.priority = priority

      const result = await Notification.updateMany(filter, {
        isRead: true,
        readAt: new Date()
      })

      res.json({
        success: true,
        data: { modifiedCount: result.modifiedCount },
        message: 'All notifications marked as read'
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message
      })
    }
  },

  // Mark multiple notifications as read
  markMultipleAsRead: async (req, res) => {
    try {
      const userId = req.user.id
      const { ids } = req.body

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Notification IDs are required'
        })
      }

      // Validate all IDs
      const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id))
      if (validIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid notification IDs provided'
        })
      }

      const result = await Notification.updateMany(
        {
          _id: { $in: validIds },
          recipient: userId,
          isRead: false,
          isDeleted: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      )

      res.json({
        success: true,
        data: { modifiedCount: result.modifiedCount },
        message: 'Notifications marked as read'
      })
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read',
        error: error.message
      })
    }
  },

  // Delete notification
  deleteNotification: async (req, res) => {
    try {
      const { id } = req.params
      const userId = req.user.id

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid notification ID'
        })
      }

      const notification = await Notification.findOne({
        _id: id,
        recipient: userId,
        isDeleted: false
      })

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        })
      }

      await notification.softDelete()

      res.json({
        success: true,
        data: null,
        message: 'Notification deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting notification:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: error.message
      })
    }
  },

  // Get unread count
  getUnreadCount: async (req, res) => {
    try {
      const userId = req.user.id

      const count = await Notification.getUnreadCount(userId)

      res.json({
        success: true,
        data: { count },
        message: 'Unread count retrieved successfully'
      })
    } catch (error) {
      console.error('Error getting unread count:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve unread count',
        error: error.message
      })
    }
  },

  // Update notification preferences
  updatePreferences: async (req, res) => {
    try {
      const userId = req.user.id
      const User = require('../models/User')
      const { preferences } = req.body

      if (!preferences) {
        return res.status(400).json({
          success: false,
          message: 'Preferences object is required'
        })
      }

      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Initialize preferences if not exists
      if (!user.notificationPreferences) {
        user.notificationPreferences = notificationPreferencesSchema
      }

      // Merge preferences
      if (preferences.email) {
        user.notificationPreferences.email = {
          ...user.notificationPreferences.email,
          ...preferences.email
        }
      }
      if (preferences.push) {
        user.notificationPreferences.push = {
          ...user.notificationPreferences.push,
          ...preferences.push
        }
      }
      if (preferences.inApp) {
        user.notificationPreferences.inApp = {
          ...user.notificationPreferences.inApp,
          ...preferences.inApp
        }
      }

      await user.save()

      res.json({
        success: true,
        data: { preferences: user.notificationPreferences },
        message: 'Notification preferences updated successfully'
      })
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences',
        error: error.message
      })
    }
  },

  // Get notification preferences
  getPreferences: async (req, res) => {
    try {
      const userId = req.user.id
      const User = require('../models/User')

      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      const preferences = user.notificationPreferences || notificationPreferencesSchema

      res.json({
        success: true,
        data: { preferences },
        message: 'Notification preferences retrieved successfully'
      })
    } catch (error) {
      console.error('Error getting notification preferences:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notification preferences',
        error: error.message
      })
    }
  },

  // Archive notification
  archiveNotification: async (req, res) => {
    try {
      const { id } = req.params
      const userId = req.user.id

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid notification ID'
        })
      }

      const notification = await Notification.findOne({
        _id: id,
        recipient: userId,
        isDeleted: false,
        isArchived: false
      })

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        })
      }

      await notification.archive()

      res.json({
        success: true,
        data: null,
        message: 'Notification archived successfully'
      })
    } catch (error) {
      console.error('Error archiving notification:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to archive notification',
        error: error.message
      })
    }
  },

  // Archive all read notifications
  archiveAllRead: async (req, res) => {
    try {
      const userId = req.user.id

      const result = await Notification.updateMany(
        {
          recipient: userId,
          isRead: true,
          isArchived: false,
          isDeleted: false
        },
        {
          isArchived: true,
          archivedAt: new Date()
        }
      )

      res.json({
        success: true,
        data: { modifiedCount: result.modifiedCount },
        message: 'All read notifications archived'
      })
    } catch (error) {
      console.error('Error archiving read notifications:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to archive read notifications',
        error: error.message
      })
    }
  },

  // Get notification statistics
  getStats: async (req, res) => {
    try {
      const userId = req.user.id

      const stats = await Notification.getUserStats(userId)

      // Process stats
      const statsMap = {
        unread: 0,
        read: 0
      }

      stats.forEach(s => {
        const key = s._id ? 'read' : 'unread'
        statsMap[key] = s.count
      })

      // Get count by type
      const byType = await Notification.aggregate([
        {
          $match: {
            recipient: mongoose.Types.ObjectId(userId),
            isDeleted: false,
            isArchived: false
          }
        },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            unread: { $sum: { $cond: ['$isRead', 0, 1] } }
          }
        }
      ])

      res.json({
        success: true,
        data: {
          total: statsMap.unread + statsMap.read,
          unread: statsMap.unread,
          read: statsMap.read,
          byType
        },
        message: 'Notification statistics retrieved successfully'
      })
    } catch (error) {
      console.error('Error getting notification stats:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notification statistics',
        error: error.message
      })
    }
  }
}

// Protected routes
router.use(verifyToken)

// Get user notifications
router.get('/', getNotifications)

// Mark notification as read
router.patch('/:notificationId/read', validateMongoId('notificationId'), markAsRead)

// Mark all notifications as read
router.patch('/read-all', markAllAsRead)

// Delete notification
router.delete('/:notificationId', validateMongoId('notificationId'), deleteNotification)

// Delete all read notifications
router.delete('/read', deleteReadNotifications)

// Update notification preferences
router.patch('/preferences', updatePreferences)

// Get notification preferences
router.get('/preferences', getPreferences)

// Get notification statistics
router.get('/stats', getStats)

module.exports = router
