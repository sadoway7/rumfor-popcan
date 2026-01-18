import { Notification, NotificationType, ApiResponse, PaginatedResponse } from '@/types'
import { httpClient } from '@/lib/httpClient'

export const notificationsApi = {
  // Get notifications for user
  async getNotifications(page = 1, limit = 20): Promise<PaginatedResponse<Notification>> {
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('limit', limit.toString())

    const response = await httpClient.get<ApiResponse<PaginatedResponse<Notification>>>(`/notifications?${queryParams}`)
    if (!response.success) throw new Error(response.error || 'Failed to fetch notifications')
    return response.data!
  },

  // Get unread count
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const response = await httpClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count')
    if (!response.success) throw new Error(response.error || 'Failed to get unread count')
    return response
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    const response = await httpClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`, {})
    if (!response.success) throw new Error(response.error || 'Failed to mark notification as read')
    return response
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<ApiResponse<{ markedCount: number }>> {
    const response = await httpClient.patch<ApiResponse<{ markedCount: number }>>('/notifications/read-all', {})
    if (!response.success) throw new Error(response.error || 'Failed to mark all notifications as read')
    return response
  },

  // Delete notification
  async deleteNotification(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await httpClient.delete<ApiResponse<{ deleted: boolean }>>(`/notifications/${id}`)
    if (!response.success) throw new Error(response.error || 'Failed to delete notification')
    return response
  },

  // Get notifications by type
  async getNotificationsByType(type: NotificationType): Promise<ApiResponse<Notification[]>> {
    const response = await httpClient.get<ApiResponse<Notification[]>>(`/notifications/type/${type}`)
    if (!response.success) throw new Error(response.error || 'Failed to fetch notifications by type')
    return response
  },

  // Get recent notifications (last 24 hours)
  async getRecentNotifications(hours = 24): Promise<ApiResponse<Notification[]>> {
    const response = await httpClient.get<ApiResponse<Notification[]>>(`/notifications/recent?hours=${hours}`)
    if (!response.success) throw new Error(response.error || 'Failed to fetch recent notifications')
    return response
  }
}

export default notificationsApi
