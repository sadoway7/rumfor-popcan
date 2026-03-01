import { useEffect, useCallback, useState, useRef } from 'react'
import { useAdminStore } from '../adminStore'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AdminFilters, EmailConfig } from '@/types'
import { adminApi } from '../adminApi'

// Main admin hook
export function useAdmin() {
  const { isAuthenticated, isAdmin } = useAuth()
  const {
    stats,
    isLoadingStats,
    fetchAdminStats,
    recentActivities,
    isLoadingActivities,
    fetchRecentActivities,
    users,
    isLoadingUsers,
    fetchUsers,
    moderationItems,
    isLoadingModeration,
    fetchModerationQueue,
    promoterVerifications,
    isLoadingVerifications,
    fetchPromoterVerifications,
    systemSettings,
    isLoadingSettings,
    fetchSystemSettings,
    bulkOperations,
    bulkOperationProgress,
    addBulkOperation,
    updateBulkOperationProgress,
    fetchUserAnalytics,
    fetchMarketAnalytics
  } = useAdminStore()

  // Initialize admin data only when user is authenticated as admin
  // Only run once on mount when user is admin
  const hasInitialized = useRef(false)
  
  useEffect(() => {
    if (!isAuthenticated || hasInitialized.current) return
    
    // Check if user is admin - only run if true
    if (!isAdmin()) return

    const timer = setTimeout(() => {
      fetchAdminStats()
      fetchRecentActivities()
      fetchModerationQueue()
      fetchPromoterVerifications()
      fetchSystemSettings()
      hasInitialized.current = true
      // Note: fetchUsers() is called in AdminUsersPage component
    }, 100)

    return () => clearTimeout(timer)
  }, [isAuthenticated, isAdmin]) // Re-run if auth state or admin status changes

  return {
    stats,
    isLoadingStats,
    recentActivities,
    isLoadingActivities,
    users,
    isLoadingUsers,
    moderationItems,
    isLoadingModeration,
    promoterVerifications,
    isLoadingVerifications,
    systemSettings,
    isLoadingSettings,
    bulkOperations,
    bulkOperationProgress,
    fetchAdminStats,
    fetchRecentActivities,
    fetchUsers,
    fetchModerationQueue,
    fetchPromoterVerifications,
    fetchSystemSettings,
    fetchUserAnalytics,
    fetchMarketAnalytics,
    addBulkOperation,
    updateBulkOperationProgress
  }
}

// Users management hook
export function useAdminUsers() {
  const {
    users,
    usersPagination,
    isLoadingUsers,
    selectedUsers,
    userFilters,
    fetchUsers,
    updateUserRole,
    deleteUser,
    suspendUser,
    verifyUser,
    resendVerificationEmail,
    setUsersPage,
    bulkUpdateUsers,
    setUserFilters,
    selectUser,
    selectUsers,
    clearUserSelection
  } = useAdminStore()

  const refreshUsers = useCallback((filters?: AdminFilters['userFilters']) => {
    fetchUsers(filters)
  }, [fetchUsers])

  const handleRoleChange = useCallback(async (userId: string, role: any) => {
    await updateUserRole(userId, role)
  }, [updateUserRole])

  const handleDeleteUser = useCallback(async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return await deleteUser(userId)
    }
    return { success: false }
  }, [deleteUser])

  const handleSuspendUser = useCallback(async (userId: string, suspended: boolean) => {
    await suspendUser(userId, suspended)
  }, [suspendUser])

  const handleVerifyUser = useCallback(async (userId: string, verified: boolean) => {
    await verifyUser(userId, verified)
  }, [verifyUser])

  const handleResendVerification = useCallback(async (userId: string) => {
    return await resendVerificationEmail(userId)
  }, [resendVerificationEmail])

  const handlePageChange = useCallback(async (page: number) => {
    await setUsersPage(page)
  }, [setUsersPage])

  const handleBulkUpdate = useCallback(async (
    userIds: string[], 
    operation: 'role' | 'suspend' | 'verify', 
    value: any
  ) => {
    await bulkUpdateUsers(userIds, operation, value)
  }, [bulkUpdateUsers])

  const handleFilterChange = useCallback((filters: AdminFilters['userFilters']) => {
    setUserFilters(filters)
    fetchUsers(filters)
  }, [setUserFilters, fetchUsers])

  return {
    users,
    usersPagination,
    isLoadingUsers,
    selectedUsers,
    userFilters,
    refreshUsers,
    handleRoleChange,
    handleDeleteUser,
    handleSuspendUser,
    handleVerifyUser,
    handleResendVerification,
    handlePageChange,
    handleBulkUpdate,
    handleFilterChange,
    selectUser,
    selectUsers,
    clearUserSelection
  }
}

// Moderation hook
export function useAdminModeration() {
  const {
    moderationItems,
    moderationPagination,
    isLoadingModeration,
    selectedModerationItems,
    moderationFilters,
    fetchModerationQueue,
    moderateContent,
    assignModerationItem,
    setModerationFilters,
    selectModerationItem,
    selectModerationItems,
    clearModerationSelection
  } = useAdminStore()

  const refreshModerationQueue = useCallback((filters?: AdminFilters['moderationFilters']) => {
    fetchModerationQueue(filters)
  }, [fetchModerationQueue])

  const handleModerateContent = useCallback(async (
    itemId: string, 
    action: 'approve' | 'reject' | 'resolve', 
    reason?: string
  ) => {
    await moderateContent(itemId, action, reason)
  }, [moderateContent])

  const handleAssignItem = useCallback(async (itemId: string, assignedTo: string) => {
    await assignModerationItem(itemId, assignedTo)
  }, [assignModerationItem])

  const handleFilterChange = useCallback((filters: AdminFilters['moderationFilters']) => {
    setModerationFilters(filters)
    fetchModerationQueue(filters)
  }, [setModerationFilters, fetchModerationQueue])

  return {
    moderationItems,
    moderationPagination,
    isLoadingModeration,
    selectedModerationItems,
    moderationFilters,
    refreshModerationQueue,
    handleModerateContent,
    handleAssignItem,
    handleFilterChange,
    selectModerationItem,
    selectModerationItems,
    clearModerationSelection
  }
}

// Promoter verification hook
export function useAdminPromoterVerification() {
  const {
    promoterVerifications,
    isLoadingVerifications,
    fetchPromoterVerifications,
    reviewPromoterVerification
  } = useAdminStore()

  const refreshVerifications = useCallback(() => {
    fetchPromoterVerifications()
  }, [fetchPromoterVerifications])

  const handleReviewVerification = useCallback(async (
    verificationId: string, 
    status: 'verified' | 'rejected', 
    notes?: string
  ) => {
    await reviewPromoterVerification(verificationId, status, notes)
  }, [reviewPromoterVerification])

  return {
    promoterVerifications,
    isLoadingVerifications,
    refreshVerifications,
    handleReviewVerification
  }
}

// Analytics hook
export function useAdminAnalytics() {
  const { fetchUserAnalytics, fetchMarketAnalytics } = useAdminStore()

  const loadUserAnalytics = useCallback(async (dateRange: { start: string; end: string }) => {
    return await fetchUserAnalytics(dateRange)
  }, [fetchUserAnalytics])

  const loadMarketAnalytics = useCallback(async (dateRange: { start: string; end: string }) => {
    return await fetchMarketAnalytics(dateRange)
  }, [fetchMarketAnalytics])

  return {
    loadUserAnalytics,
    loadMarketAnalytics
  }
}

// System settings hook
export function useAdminSystemSettings() {
  const {
    systemSettings,
    isLoadingSettings,
    fetchSystemSettings,
    updateSystemSetting
  } = useAdminStore()

  const refreshSettings = useCallback(() => {
    fetchSystemSettings()
  }, [fetchSystemSettings])

  const handleUpdateSetting = useCallback(async (key: string, value: string) => {
    await updateSystemSetting(key, value)
  }, [updateSystemSetting])

  return {
    systemSettings,
    isLoadingSettings,
    refreshSettings,
    handleUpdateSetting
  }
}

// Bulk operations hook
export function useAdminBulkOperations() {
  const { bulkOperations, bulkOperationProgress, addBulkOperation, updateBulkOperationProgress } = useAdminStore()

  const getOperationProgress = useCallback((operationId: string) => {
    return bulkOperationProgress[operationId] || 0
  }, [bulkOperationProgress])

  const getOperationStatus = useCallback((operation: any) => {
    const progress = getOperationProgress(operation.id)
    if (progress >= 100) return 'completed'
    if (progress > 0) return 'processing'
    return 'pending'
  }, [getOperationProgress])

  return {
    bulkOperations,
    bulkOperationProgress,
    addBulkOperation,
    updateBulkOperationProgress,
    getOperationProgress,
    getOperationStatus
  }
}

// Email templates hook
export function useAdminEmailTemplates() {
  const {
    emailTemplates,
    isLoadingTemplates,
    fetchEmailTemplates
  } = useAdminStore()

  const refreshTemplates = useCallback(() => {
    fetchEmailTemplates()
  }, [fetchEmailTemplates])

  return {
    emailTemplates,
    isLoadingTemplates,
    refreshTemplates
  }
}

// Email configuration hook
export function useAdminEmailConfig() {
  const {
    emailConfig,
    isLoadingEmailConfig,
    isTestingEmailConnection,
    isSendingTestEmail,
    fetchEmailConfig,
    updateEmailConfig,
    testEmailConnection,
    sendTestEmail
  } = useAdminStore()

  const refreshEmailConfig = useCallback(() => {
    fetchEmailConfig()
  }, [fetchEmailConfig])

  const handleUpdateEmailConfig = useCallback(async (config: Partial<EmailConfig>) => {
    await updateEmailConfig(config)
  }, [updateEmailConfig])

  const handleTestConnection = useCallback(async () => {
    return await testEmailConnection()
  }, [testEmailConnection])

  const handleSendTestEmail = useCallback(async (to: string, testConfig?: Partial<EmailConfig>) => {
    return await sendTestEmail(to, testConfig)
  }, [sendTestEmail])

  return {
    emailConfig,
    isLoadingEmailConfig,
    isTestingEmailConnection,
    isSendingTestEmail,
    refreshEmailConfig,
    handleUpdateEmailConfig,
    handleTestConnection,
    handleSendTestEmail
  }
}

// Audit logs hook
export function useAdminAuditLogs() {
  const {
    auditLogs,
    auditPagination,
    isLoadingAudit,
    fetchAuditLogs
  } = useAdminStore()

  const refreshAuditLogs = useCallback((filters?: any) => {
    fetchAuditLogs(filters)
  }, [fetchAuditLogs])

  return {
    auditLogs,
    auditPagination,
    isLoadingAudit,
    refreshAuditLogs
  }
}

// Bug Reports hook
export function useAdminBugReports() {
  const [bugReports, setBugReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 })

  const fetchBugReports = useCallback(async (params?: { status?: string; severity?: string; page?: number }) => {
    setIsLoading(true)
    try {
      const response = await adminApi.getBugReports(params)
      if (response.success) {
        setBugReports(response.data)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to fetch bug reports:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateBugReport = useCallback(async (id: string, data: { status?: string; resolution?: string }) => {
    try {
      const response = await adminApi.updateBugReport(id, data)
      return response
    } catch (error) {
      console.error('Failed to update bug report:', error)
      throw error
    }
  }, [])

  const deleteBugReport = useCallback(async (id: string) => {
    try {
      const response = await adminApi.deleteBugReport(id)
      return response
    } catch (error) {
      console.error('Failed to delete bug report:', error)
      throw error
    }
  }, [])

  return {
    bugReports,
    isLoading,
    pagination,
    fetchBugReports,
    updateBugReport,
    deleteBugReport
  }
}

// Markets management hook
export function useAdminMarkets() {
  const [markets, setMarkets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
  const [filters, setFilters] = useState<{
    status?: string
    category?: string
    search?: string
  }>({})

  const fetchMarkets = useCallback(async (newFilters?: typeof filters) => {
    setIsLoading(true)
    try {
      const activeFilters = newFilters || filters
      const response = await adminApi.getAdminMarkets({
        ...activeFilters,
        page: pagination.page,
        limit: pagination.limit
      })
      setMarkets(response.data)
      setPagination(prev => ({ ...prev, ...response.pagination }))
    } catch (error) {
      console.error('Failed to fetch markets:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  const refreshMarkets = useCallback(() => {
    fetchMarkets()
  }, [fetchMarkets])

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchMarkets(newFilters)
  }, [fetchMarkets])

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  const handleToggleStatus = useCallback(async (marketId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    try {
      await adminApi.updateAdminMarket(marketId, { status: newStatus })
      setMarkets(prev => prev.map(m => m.id === marketId ? { ...m, status: newStatus } : m))
    } catch (error) {
      console.error('Failed to toggle market status:', error)
      throw error
    }
  }, [])

  const handleToggleApplications = useCallback(async (marketId: string, currentValue: boolean) => {
    try {
      await adminApi.updateAdminMarket(marketId, { applicationsEnabled: !currentValue })
      setMarkets(prev => prev.map(m => m.id === marketId ? { ...m, applicationsEnabled: !currentValue } : m))
    } catch (error) {
      console.error('Failed to toggle applications:', error)
      throw error
    }
  }, [])

  const handleDeleteMarket = useCallback(async (marketId: string) => {
    if (confirm('Are you sure you want to delete this market? This action cannot be undone.')) {
      try {
        await adminApi.deleteAdminMarket(marketId, 'Deleted by admin')
        setMarkets(prev => prev.filter(m => m.id !== marketId))
        return { success: true }
      } catch (error) {
        console.error('Failed to delete market:', error)
        throw error
      }
    }
    return { success: false }
  }, [])

  const selectMarket = useCallback((marketId: string) => {
    setSelectedMarkets(prev => 
      prev.includes(marketId) ? prev.filter(id => id !== marketId) : [...prev, marketId]
    )
  }, [])

  const selectMarkets = useCallback((marketIds: string[]) => {
    setSelectedMarkets(marketIds)
  }, [])

  const clearMarketSelection = useCallback(() => {
    setSelectedMarkets([])
  }, [])

  return {
    markets,
    isLoading,
    pagination,
    selectedMarkets,
    filters,
    fetchMarkets,
    refreshMarkets,
    handleFilterChange,
    handlePageChange,
    handleToggleStatus,
    handleToggleApplications,
    handleDeleteMarket,
    selectMarket,
    selectMarkets,
    clearMarketSelection
  }
}