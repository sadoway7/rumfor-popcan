import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Notification, NotificationType } from '@/types'

interface NotificationsState {
  // Data
  notifications: Notification[]
  unreadCount: number
  
  // Loading states
  isLoading: boolean
  isMarkingRead: boolean
  isDeleting: boolean
  
  // Error states
  error: string | null
  
  // Actions
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  updateNotification: (id: string, updates: Partial<Notification>) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  setUnreadCount: (count: number) => void
  
  // Actions - Loading
  setLoading: (loading: boolean) => void
  setMarkingRead: (loading: boolean) => void
  setDeleting: (loading: boolean) => void
  
  // Actions - Errors
  setError: (error: string | null) => void
  
  // Getters
  getNotificationsByType: (type: NotificationType) => Notification[]
  getRecentNotifications: (hours?: number) => Notification[]
  getUnreadNotifications: () => Notification[]
  getReadNotifications: () => Notification[]
  
  // Utility
  clearAll: () => void
}

export const useNotificationsStore = create<NotificationsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      isMarkingRead: false,
      isDeleting: false,
      error: null,

      // Data actions
      setNotifications: (notifications) => set({ 
        notifications,
        unreadCount: notifications.filter(n => !n.read).length
      }),
      
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1
      })),
      
      updateNotification: (id, updates) => set((state) => {
        const notification = state.notifications.find(n => n.id === id)
        const oldReadStatus = notification?.read || false
        const newReadStatus = updates.read !== undefined ? updates.read : oldReadStatus
        
        return {
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, ...updates } : n
          ),
          unreadCount: oldReadStatus === newReadStatus 
            ? state.unreadCount 
            : newReadStatus 
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount + 1
        }
      }),
      
      removeNotification: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id)
        const wasUnread = notification && !notification.read
        
        return {
          notifications: state.notifications.filter(n => n.id !== id),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        }
      }),
      
      markAsRead: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id)
        const wasUnread = notification && !notification.read
        
        return {
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        }
      }),
      
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      })),
      
      setUnreadCount: (count) => set({ unreadCount: count }),

      // Loading actions
      setLoading: (loading) => set({ isLoading: loading }),
      setMarkingRead: (loading) => set({ isMarkingRead: loading }),
      setDeleting: (loading) => set({ isDeleting: loading }),

      // Error actions
      setError: (error) => set({ error }),

      // Getters
      getNotificationsByType: (type) => {
        const { notifications } = get()
        return notifications.filter(notification => notification.type === type)
      },
      
      getRecentNotifications: (hours = 24) => {
        const { notifications } = get()
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)
        return notifications.filter(notification => 
          new Date(notification.createdAt) >= cutoffTime
        )
      },
      
      getUnreadNotifications: () => {
        const { notifications } = get()
        return notifications.filter(notification => !notification.read)
      },
      
      getReadNotifications: () => {
        const { notifications } = get()
        return notifications.filter(notification => notification.read)
      },

      // Utility
      clearAll: () => set({ 
        notifications: [],
        unreadCount: 0,
        error: null 
      })
    }),
    {
      name: 'notifications-store'
    }
  )
)