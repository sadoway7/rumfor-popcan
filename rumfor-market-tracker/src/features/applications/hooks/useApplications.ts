import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsApi } from '@/features/applications/applicationsApi'
import { Application, ApplicationStatus, ApplicationFilters } from '@/types'
import { useAuthStore } from '@/features/auth/authStore'


// Query keys
const APPLICATIONS_QUERY_KEY = (filters?: ApplicationFilters, page?: number, limit?: number) =>
  ['applications', filters, page, limit]

const MY_APPLICATIONS_QUERY_KEY = (userId: string) =>
  ['my-applications', userId]

const APPLICATION_QUERY_KEY = (id: string) =>
  ['application', id]

const MARKET_APPLICATIONS_QUERY_KEY = (marketId: string) =>
  ['market-applications', marketId]

export const useApplications = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  // Local state for filters and pagination
  const [currentFilters, setCurrentFilters] = useState<ApplicationFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // Applications query
  const applicationsQuery = useQuery({
    queryKey: APPLICATIONS_QUERY_KEY(currentFilters, currentPage, 20),
    queryFn: async () => {
      const response = await applicationsApi.getApplications(currentFilters, currentPage, 20)
      if (response.success && response.data) {
        setTotalPages(response.data.pagination?.totalPages || 1)
        setHasMore(currentPage < (response.data.pagination?.totalPages || 1))
        return response.data.data
      }
      return []
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // My applications query
  const myApplicationsQuery = useQuery({
    queryKey: MY_APPLICATIONS_QUERY_KEY(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return []
      const response = await applicationsApi.getMyApplications(user.id)
      return response.success ? response.data : []
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Combined data
  const applications = applicationsQuery.data || []
  const myApplications = myApplicationsQuery.data || []

  // Combined loading states
  const isLoading = applicationsQuery.isLoading || myApplicationsQuery.isLoading

  // Combined error
  const error = applicationsQuery.error?.message || myApplicationsQuery.error?.message || null

  // Mutations
  const createMutation = useMutation({
    mutationFn: applicationsApi.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY() })
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_QUERY_KEY(user.id) })
      }
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Application> }) =>
      applicationsApi.updateApplication(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY() })
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_QUERY_KEY(user.id) })
      }
    }
  })

  const submitMutation = useMutation({
    mutationFn: applicationsApi.submitApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY() })
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_QUERY_KEY(user.id) })
      }
    }
  })

  const withdrawMutation = useMutation({
    mutationFn: applicationsApi.withdrawApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY() })
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_QUERY_KEY(user.id) })
      }
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string, status: ApplicationStatus, notes?: string }) =>
      applicationsApi.updateApplicationStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY() })
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_QUERY_KEY(user.id) })
      }
    }
  })

  const deleteMutation = useMutation({
    mutationFn: applicationsApi.deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY() })
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_QUERY_KEY(user.id) })
      }
    }
  })

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, status, notes }: { ids: string[], status: ApplicationStatus, notes?: string }) =>
      applicationsApi.bulkUpdateStatus(ids, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY() })
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_QUERY_KEY(user.id) })
      }
    }
  })

  // Actions
  const loadApplications = useCallback(async (filters?: ApplicationFilters, page?: number) => {
    if (filters) setCurrentFilters(filters)
    if (page) setCurrentPage(page)
    await queryClient.invalidateQueries({
      queryKey: APPLICATIONS_QUERY_KEY(filters || currentFilters, page || currentPage, 20)
    })
  }, [currentFilters, currentPage, queryClient])

  const loadMyApplications = useCallback(async () => {
    if (user?.id) {
      await queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_QUERY_KEY(user.id) })
    }
  }, [user?.id, queryClient])

  const loadMarketApplications = useCallback(async (marketId: string) => {
    await queryClient.invalidateQueries({ queryKey: MARKET_APPLICATIONS_QUERY_KEY(marketId) })
  }, [queryClient])

  const getApplication = useCallback(async (id: string): Promise<Application | null> => {
    const query = useQuery({
      queryKey: APPLICATION_QUERY_KEY(id),
      queryFn: () => applicationsApi.getApplication(id),
      enabled: false,
    })
    await query.refetch()
    return query.data?.success ? (query.data.data || null) : null
  }, [])

  const createApplication = useCallback(async (applicationData: Partial<Application>) => {
    const result = await createMutation.mutateAsync(applicationData)
    return result.success ? (result.data || null) : null
  }, [createMutation])

  const submitApplication = useCallback(async (id: string) => {
    const result = await submitMutation.mutateAsync(id)
    return result.success
  }, [submitMutation])

  const updateStatus = useCallback(async (id: string, status: ApplicationStatus, notes?: string) => {
    const result = await updateStatusMutation.mutateAsync({ id, status, notes })
    return result.success
  }, [updateStatusMutation])

  const withdrawApplication = useCallback(async (id: string) => {
    const result = await withdrawMutation.mutateAsync(id)
    return result.success
  }, [withdrawMutation])

  const updateApplicationData = useCallback(async (id: string, updates: Partial<Application>) => {
    const result = await updateMutation.mutateAsync({ id, updates })
    return result.success
  }, [updateMutation])

  const deleteApplication = useCallback(async (id: string) => {
    const result = await deleteMutation.mutateAsync(id)
    return result.success
  }, [deleteMutation])

  const bulkUpdateStatus = useCallback(async (ids: string[], status: ApplicationStatus, notes?: string) => {
    const result = await bulkUpdateMutation.mutateAsync({ ids, status, notes })
    return result.success
  }, [bulkUpdateMutation])

  const searchApplications = useCallback(async (query: string) => {
    setSearchQuery(query)
    const newFilters = { ...currentFilters, search: query }
    setCurrentFilters(newFilters)
    setCurrentPage(1)
    await queryClient.invalidateQueries({
      queryKey: APPLICATIONS_QUERY_KEY(newFilters, 1, 20)
    })
  }, [currentFilters, queryClient])

  const applyFilters = useCallback(async (newFilters: ApplicationFilters) => {
    setCurrentFilters(newFilters)
    setCurrentPage(1)
    await queryClient.invalidateQueries({
      queryKey: APPLICATIONS_QUERY_KEY(newFilters, 1, 20)
    })
  }, [queryClient])

  const clearAllFilters = useCallback(async () => {
    const emptyFilters = {}
    setCurrentFilters(emptyFilters)
    setCurrentPage(1)
    setSearchQuery('')
    await queryClient.invalidateQueries({
      queryKey: APPLICATIONS_QUERY_KEY(emptyFilters, 1, 20)
    })
  }, [queryClient])

  // Utility functions
  const getApplicationById = useCallback((id: string) => {
    return applications.find((app: Application) => app.id === id)
  }, [applications])

  const getFilteredApplications = useCallback((filters?: ApplicationFilters) => {
    if (!filters) return applications
    return applications.filter((app: Application) => {
      if (filters.status?.length && !filters.status.includes(app.status)) return false
      if (filters.marketId && app.marketId !== filters.marketId) return false
      if (filters.vendorId && app.vendorId !== filters.vendorId) return false
      return true
    })
  }, [applications])

  const getApplicationsByStatus = useCallback((status: ApplicationStatus) => {
    return applications.filter((app: Application) => app.status === status)
  }, [applications])

  const getApplicationsByMarket = useCallback((marketId: string) => {
    return applications.filter((app: Application) => app.marketId === marketId)
  }, [applications])

  const getMyApplicationsFiltered = useCallback((userId?: string) => {
    if (!userId) return []
    return myApplications.filter((app: Application) => app.vendorId === userId)
  }, [myApplications])

  const getApplicationsByMarketAndStatus = useCallback((marketId: string, status?: ApplicationStatus) => {
    const marketApps = getApplicationsByMarket(marketId)
    return status ? marketApps.filter((app: Application) => app.status === status) : marketApps
  }, [getApplicationsByMarket])

  const getMyApplicationsByStatus = useCallback((status: ApplicationStatus) => {
    if (!user?.id) return []
    return myApplications.filter((app: Application) => app.status === status)
  }, [user?.id, myApplications])

  const getApplicationStatusCount = useCallback((status?: ApplicationStatus) => {
    const apps = status ? applications.filter((app: Application) => app.status === status) : applications
    return apps.length
  }, [applications])

  const hasApplicationForMarket = useCallback((marketId: string) => {
    if (!user?.id) return false
    return applications.some((app: Application) => app.marketId === marketId && app.vendorId === user.id)
  }, [user?.id, applications])

  const getApplicationForMarket = useCallback((marketId: string) => {
    if (!user?.id) return null
    return applications.find((app: Application) => app.marketId === marketId && app.vendorId === user.id) || null
  }, [user?.id, applications])

  return {
    // Data
    applications,
    myApplications: getMyApplicationsFiltered(user?.id),
    application: null, // Single application not used in this pattern

    // Loading states
    isLoading,
    isSubmitting: createMutation.isPending || submitMutation.isPending,
    isUpdating: updateMutation.isPending || updateStatusMutation.isPending || withdrawMutation.isPending || deleteMutation.isPending || bulkUpdateMutation.isPending,
    isSearching: false,

    // Filters and search
    filters: currentFilters,
    searchQuery,
    currentPage,
    totalPages,
    hasMore,

    // Error
    error,

    // Actions
    loadApplications,
    loadMyApplications,
    loadMarketApplications,
    getApplication,
    createApplication,
    submitApplication,
    updateStatus,
    withdrawApplication,
    updateApplication: updateApplicationData,
    deleteApplication,
    bulkUpdateStatus,
    searchApplications,
    applyFilters,
    clearAllFilters,

    // Status management
    updateApplicationStatus: () => {}, // Not used in new pattern

    // Pagination
    setCurrentPage,
    setHasMore,

    // Error handling
    setError: () => {},
    clearError: () => {},

    // Utilities
    getApplicationById,
    getFilteredApplications,
    getApplicationsByStatus,
    getApplicationsByMarket,
    getMyApplications: getMyApplicationsFiltered,
    getApplicationsByMarketAndStatus,
    getMyApplicationsByStatus,
    getApplicationStatusCount,
    hasApplicationForMarket,
    getApplicationForMarket,
  }
}

// Hook for vendor-specific application operations
export const useVendorApplications = () => {
  const apps = useApplications()

  const myApplications = apps.myApplications
  const isLoading = apps.isLoading
  const isSubmitting = apps.isSubmitting
  const error = apps.error

  const submitApplication = apps.submitApplication
  const withdrawApplication = apps.withdrawApplication
  const updateApplication = apps.updateApplication
  const createApplication = apps.createApplication
  const getApplication = apps.getApplication
  const loadMyApplications = apps.loadMyApplications

  const hasApplicationForMarket = apps.hasApplicationForMarket
  const getApplicationForMarket = apps.getApplicationForMarket
  const getMyApplicationsByStatus = apps.getMyApplicationsByStatus

  // Get applications by status for current user
  const getMyDraftApplications = useCallback(() => {
    return getMyApplicationsByStatus('draft')
  }, [getMyApplicationsByStatus])

  const getMySubmittedApplications = useCallback(() => {
    return getMyApplicationsByStatus('submitted')
  }, [getMyApplicationsByStatus])

  const getMyApprovedApplications = useCallback(() => {
    return getMyApplicationsByStatus('approved')
  }, [getMyApplicationsByStatus])

  const getMyRejectedApplications = useCallback(() => {
    return getMyApplicationsByStatus('rejected')
  }, [getMyApplicationsByStatus])

  const getMyWithdrawnApplications = useCallback(() => {
    return getMyApplicationsByStatus('withdrawn')
  }, [getMyApplicationsByStatus])

  // Check if user can apply to a market
  const canApplyToMarket = useCallback((marketId: string) => {
    const existingApp = getApplicationForMarket(marketId)
    return !existingApp || existingApp.status === 'withdrawn' || existingApp.status === 'rejected'
  }, [getApplicationForMarket])

  // Get application statistics
  const getApplicationStats = useCallback(() => {
    return {
      total: myApplications.length,
      draft: getMyApplicationsByStatus('draft').length,
      submitted: getMyApplicationsByStatus('submitted').length,
      underReview: getMyApplicationsByStatus('under-review').length,
      approved: getMyApplicationsByStatus('approved').length,
      rejected: getMyApplicationsByStatus('rejected').length,
      withdrawn: getMyApplicationsByStatus('withdrawn').length,
    }
  }, [myApplications, getMyApplicationsByStatus])

  return {
    // Data
    myApplications,

    // Loading states
    isLoading,
    isSubmitting,

    // Error
    error,

    // Actions
    submitApplication,
    withdrawApplication,
    updateApplication,
    createApplication,
    getApplication,
    loadMyApplications,

    // Market application checks
    hasApplicationForMarket,
    getApplicationForMarket,
    canApplyToMarket,

    // Filtered applications
    getMyDraftApplications,
    getMySubmittedApplications,
    getMyApprovedApplications,
    getMyRejectedApplications,
    getMyWithdrawnApplications,

    // Statistics
    getApplicationStats,
  }
}

// Hook for promoter-specific application operations
export const usePromoterApplications = () => {
  const apps = useApplications()

  const applicationsForReview = apps.applications
  const isLoading = apps.isLoading
  const isUpdating = apps.isUpdating
  const error = apps.error

  const updateStatus = apps.updateStatus
  const bulkUpdateStatus = apps.bulkUpdateStatus
  const getApplication = apps.getApplication
  const loadMarketApplications = apps.loadMarketApplications

  const getApplicationsByMarket = apps.getApplicationsByMarket
  const getApplicationsByStatus = apps.getApplicationsByStatus
  const getApplicationStatusCount = apps.getApplicationStatusCount

  // Get applications that need review
  const getPendingApplications = useCallback(() => {
    return applicationsForReview.filter((app: Application) =>
      app.status === 'submitted' || app.status === 'under-review'
    )
  }, [applicationsForReview])

  // Get recent applications
  const getRecentApplications = useCallback((days: number = 7) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return applicationsForReview.filter((app: Application) =>
      new Date(app.createdAt) >= cutoffDate
    )
  }, [applicationsForReview])

  // Get application statistics for promoter dashboard
  const getPromoterStats = useCallback(() => {
    return {
      total: applicationsForReview.length,
      pending: getApplicationStatusCount('submitted') + getApplicationStatusCount('under-review'),
      approved: getApplicationStatusCount('approved'),
      rejected: getApplicationStatusCount('rejected'),
      thisWeek: getRecentApplications(7).length,
      thisMonth: getRecentApplications(30).length,
    }
  }, [applicationsForReview, getApplicationStatusCount, getRecentApplications])

  // Bulk approve applications
  const bulkApprove = useCallback(async (ids: string[], notes?: string) => {
    return bulkUpdateStatus(ids, 'approved', notes)
  }, [bulkUpdateStatus])

  // Bulk reject applications
  const bulkReject = useCallback(async (ids: string[], notes?: string) => {
    return bulkUpdateStatus(ids, 'rejected', notes)
  }, [bulkUpdateStatus])

  // Mark applications as under review
  const markUnderReview = useCallback(async (ids: string[], notes?: string) => {
    return bulkUpdateStatus(ids, 'under-review', notes)
  }, [bulkUpdateStatus])

  return {
    // Data
    applicationsForReview,

    // Loading states
    isLoading,
    isUpdating,

    // Error
    error,

    // Actions
    updateStatus,
    bulkUpdateStatus,
    getApplication,
    loadMarketApplications,

    // Bulk actions
    bulkApprove,
    bulkReject,
    markUnderReview,

    // Filtered data
    getPendingApplications,
    getRecentApplications,

    // Statistics
    getPromoterStats,

    // Utilities
    getApplicationsByMarket,
    getApplicationsByStatus,
    getApplicationStatusCount,
  }
}
