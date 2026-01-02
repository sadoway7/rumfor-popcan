import { Notification, NotificationType, ApiResponse, PaginatedResponse } from '@/types'

// Mock data for development
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: 'vendor-1',
    type: 'application-approved',
    title: 'Application Approved!',
    message: 'Your application for Downtown Farmers Market has been approved.',
    data: { marketId: '1', applicationId: 'app-1' },
    read: false,
    createdAt: '2024-01-10T10:30:00Z'
  },
  {
    id: '2',
    userId: 'vendor-1',
    type: 'reminder',
    title: 'Market Day Reminder',
    message: 'Your market day is tomorrow! Don\'t forget to prepare your booth.',
    data: { marketId: '1' },
    read: false,
    createdAt: '2024-01-11T08:00:00Z'
  },
  {
    id: '3',
    userId: 'vendor-1',
    type: 'new-comment',
    title: 'New Comment',
    message: 'Sarah Johnson commented on your market discussion.',
    data: { marketId: '1', commentId: 'comment-1' },
    read: true,
    createdAt: '2024-01-12T14:20:00Z'
  },
  {
    id: '4',
    userId: 'vendor-1',
    type: 'market-updated',
    title: 'Market Information Updated',
    message: 'The schedule for Downtown Farmers Market has been updated.',
    data: { marketId: '1' },
    read: true,
    createdAt: '2024-01-13T09:15:00Z'
  },
  {
    id: '5',
    userId: 'vendor-1',
    type: 'announcement',
    title: 'New Market Available',
    message: 'A new farmers market has been added in your area.',
    data: { marketId: 'new-market-1' },
    read: true,
    createdAt: '2024-01-14T16:45:00Z'
  }
]

// API simulation delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const notificationsApi = {
  // Get notifications for user
  async getNotifications(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<Notification>> {
    await delay(300)
    
    let notifications = mockNotifications.filter(notification => notification.userId === userId)
    
    // Sort by createdAt descending (newest first)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedNotifications = notifications.slice(startIndex, endIndex)
    
    return {
      data: paginatedNotifications,
      pagination: {
        page,
        limit,
        total: notifications.length,
        totalPages: Math.ceil(notifications.length / limit)
      }
    }
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    await delay(200)
    
    const notification = mockNotifications.find(n => n.id === id)
    if (!notification) {
      return {
        success: false,
        error: 'Notification not found'
      }
    }
    
    notification.read = true
    
    return {
      success: true,
      data: notification
    }
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<ApiResponse<{ markedCount: number }>> {
    await delay(300)
    
    let markedCount = 0
    mockNotifications.forEach(notification => {
      if (notification.userId === userId && !notification.read) {
        notification.read = true
        markedCount++
      }
    })
    
    return {
      success: true,
      data: { markedCount }
    }
  },

  // Delete notification
  async deleteNotification(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    await delay(200)
    
    const notificationIndex = mockNotifications.findIndex(n => n.id === id)
    if (notificationIndex === -1) {
      return {
        success: false,
        error: 'Notification not found'
      }
    }
    
    mockNotifications.splice(notificationIndex, 1)
    
    return {
      success: true,
      data: { deleted: true }
    }
  },

  // Get unread count
  async getUnreadCount(userId: string): Promise<ApiResponse<{ count: number }>> {
    await delay(200)
    
    const unreadCount = mockNotifications.filter(
      notification => notification.userId === userId && !notification.read
    ).length
    
    return {
      success: true,
      data: { count: unreadCount }
    }
  },

  // Create notification (for internal use)
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<ApiResponse<Notification>> {
    await delay(200)
    
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    
    mockNotifications.push(newNotification)
    
    return {
      success: true,
      data: newNotification
    }
  },

  // Get notifications by type
  async getNotificationsByType(userId: string, type: NotificationType): Promise<ApiResponse<Notification[]>> {
    await delay(250)
    
    const notifications = mockNotifications
      .filter(notification => notification.userId === userId && notification.type === type)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return {
      success: true,
      data: notifications
    }
  },

  // Get recent notifications (last 24 hours)
  async getRecentNotifications(userId: string, hours = 24): Promise<ApiResponse<Notification[]>> {
    await delay(250)
    
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)
    const notifications = mockNotifications
      .filter(notification => 
        notification.userId === userId && 
        new Date(notification.createdAt) >= cutoffTime
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return {
      success: true,
      data: notifications
    }
  }
}