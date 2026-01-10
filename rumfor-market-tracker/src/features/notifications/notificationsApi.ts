import { Notification, NotificationType, ApiResponse, PaginatedResponse } from '@/types'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// HTTP client with interceptors
class HttpClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // Add auth token if available
    const token = localStorage.getItem('auth-storage')
      ? JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token
      : null

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || 'Request failed'
        )
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

const httpClient = new HttpClient(API_BASE_URL)

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
