import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../notificationsApi'
import { NotificationType } from '@/types'
import { useAuthStore } from '@/features/auth/authStore'

// Query keys
const NOTIFICATIONS_QUERY_KEY = (page: number, limit: number) =>
  ['notifications', page, limit]

const UNREAD_COUNT_QUERY_KEY = () => ['notifications-unread-count']



export const useNotifications = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  // Local state for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // Notifications query
  const notificationsQuery = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY(currentPage, 20),
    queryFn: async () => {
      const response = await notificationsApi.getNotifications(currentPage, 20)
      setTotalPages(response.pagination?.totalPages || 1)
      setHasMore(currentPage < (response.pagination?.totalPages || 1))
      return response.data
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  })

  // Unread count query
  const unreadCountQuery = useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY(),
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled: !!user,
    staleTime: 10 * 1000, // 10 seconds
  })

  // Combined loading states
  const isLoading = notificationsQuery.isLoading

  // Combined error
  const error = notificationsQuery.error?.message || unreadCountQuery.error?.message || null

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY(currentPage, 20) })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY() })
    }
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY() })
    }
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY(currentPage, 20) })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY() })
    }
  })

  // Actions
  const loadNotifications = useCallback(async (page?: number) => {
    if (page) setCurrentPage(page)
    await queryClient.invalidateQueries({
      queryKey: NOTIFICATIONS_QUERY_KEY(page || currentPage, 20)
    })
  }, [currentPage, queryClient])

  const markAsRead = useCallback(async (id: string) => {
    const result = await markAsReadMutation.mutateAsync(id)
    return result.success
  }, [markAsReadMutation])

  const markAllAsRead = useCallback(async () => {
    const result = await markAllAsReadMutation.mutateAsync()
    return result.success
  }, [markAllAsReadMutation])

  const deleteNotification = useCallback(async (id: string) => {
    const result = await deleteNotificationMutation.mutateAsync(id)
    return result.success
  }, [deleteNotificationMutation])

  const getNotificationsByType = useCallback(async (type: NotificationType) => {
    const result = await notificationsApi.getNotificationsByType(type)
    return result.success ? result.data : []
  }, [])

  const getRecentNotifications = useCallback(async (hours = 24) => {
    const result = await notificationsApi.getRecentNotifications(hours)
    return result.success ? result.data : []
  }, [])

  // Computed values
  const notifications = notificationsQuery.data || []
  const unreadCount = unreadCountQuery.data?.success ? unreadCountQuery.data.data?.count || 0 : 0

  return {
    // Data
    notifications,
    unreadCount,

    // Loading states
    isLoading,
    isMarkingRead: markAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,

    // Pagination
    currentPage,
    totalPages,
    hasMore,

    // Error
    error,

    // Actions
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationsByType,
    getRecentNotifications,

    // Pagination
    setCurrentPage,
  }
}