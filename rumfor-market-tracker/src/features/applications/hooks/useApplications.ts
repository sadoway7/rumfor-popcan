import { useCallback, useEffect } from 'react'
import { useApplicationsStore } from '@/features/applications/applicationsStore'
import { applicationsApi } from '@/features/applications/applicationsApi'
import { Application, ApplicationStatus, ApplicationFilters } from '@/types'
import { useAuthStore } from '@/features/auth/authStore'

export const useApplications = () => {
  const {
    applications,
    myApplications,
    application,
    isLoading,
    isSubmitting,
    isUpdating,
    isSearching,
    filters,
    searchQuery,
    currentPage,
    totalPages,
    hasMore,
    error,
    
    // Actions
    setApplications,
    addApplication,
    updateApplication,
    removeApplication,
    setApplication,
    setSearchQuery,
    setFilters,
    clearFilters,
    updateApplicationStatus,
    setCurrentPage,
    setHasMore,
    setLoading,
    setSubmitting,
    setUpdating,
    setSearching,
    setError,
    clearError,
    
    // Utilities
    getApplicationById,
    getFilteredApplications,
    getApplicationsByStatus,
    getApplicationsByMarket,
    getMyApplications,
  } = useApplicationsStore()

  const { user } = useAuthStore()

  // Load all applications
  const loadApplications = useCallback(async (newFilters?: ApplicationFilters) => {
    if (isLoading) return

    setLoading(true)
    clearError()

    try {
      const response = await applicationsApi.getApplications(newFilters || filters)

      if (response.success && response.data) {
        setApplications(response.data.data)
        setHasMore(response.data.pagination.page < response.data.pagination.totalPages)
      } else {
        setError(response.error || 'Failed to load applications')
      }
    } catch (err) {
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }, [filters, isLoading, setApplications, setHasMore, setLoading, clearError, setError])

  // Load my applications
  const loadMyApplications = useCallback(async () => {
    if (!user?.id || isLoading) return
    
    setLoading(true)
    clearError()
    
    try {
      const response = await applicationsApi.getMyApplications(user.id)
      
      if (response.success && response.data) {
        setApplications(response.data)
      } else {
        setError(response.error || 'Failed to load your applications')
      }
    } catch (err) {
      setError('Failed to load your applications')
    } finally {
      setLoading(false)
    }
  }, [user?.id, isLoading, setApplications, setLoading, clearError, setError])

  // Load applications for a specific market
  const loadMarketApplications = useCallback(async (marketId: string) => {
    if (isLoading) return
    
    setLoading(true)
    clearError()
    
    try {
      const response = await applicationsApi.getMarketApplications(marketId)
      
      if (response.success && response.data) {
        setApplications(response.data)
      } else {
        setError(response.error || 'Failed to load market applications')
      }
    } catch (err) {
      setError('Failed to load market applications')
    } finally {
      setLoading(false)
    }
  }, [isLoading, setApplications, setLoading, clearError, setError])

  // Get single application
  const getApplication = useCallback(async (id: string) => {
    if (isLoading || !id) return
    
    setLoading(true)
    clearError()
    
    try {
      const response = await applicationsApi.getApplication(id)
      
      if (response.success && response.data) {
        setApplication(response.data)
        return response.data
      } else {
        setError(response.error || 'Application not found')
        return null
      }
    } catch (err) {
      setError('Failed to load application')
      return null
    } finally {
      setLoading(false)
    }
  }, [isLoading, setApplication, setLoading, clearError, setError])

  // Create new application
  const createApplication = useCallback(async (applicationData: Partial<Application>) => {
    if (isSubmitting || !user?.id) return null
    
    setSubmitting(true)
    clearError()
    
    try {
      const response = await applicationsApi.createApplication({
        ...applicationData,
        vendorId: user.id,
        vendor: user,
        market: applicationData.market!,
      })
      
      if (response.success && response.data) {
        addApplication(response.data)
        return response.data
      } else {
        setError(response.error || 'Failed to create application')
        return null
      }
    } catch (err) {
      setError('Failed to create application')
      return null
    } finally {
      setSubmitting(false)
    }
  }, [isSubmitting, user?.id, user, addApplication, setSubmitting, clearError, setError])

  // Submit application
  const submitApplication = useCallback(async (id: string) => {
    if (isSubmitting) return false
    
    setSubmitting(true)
    clearError()
    
    try {
      const response = await applicationsApi.submitApplication(id)
      
      if (response.success && response.data) {
        updateApplication(id, response.data)
        return true
      } else {
        setError(response.error || 'Failed to submit application')
        return false
      }
    } catch (err) {
      setError('Failed to submit application')
      return false
    } finally {
      setSubmitting(false)
    }
  }, [isSubmitting, updateApplication, setSubmitting, clearError, setError])

  // Update application status
  const updateStatus = useCallback(async (id: string, status: ApplicationStatus, notes?: string) => {
    if (isUpdating) return false
    
    setUpdating(true)
    clearError()
    
    try {
      const response = await applicationsApi.updateApplicationStatus(id, status, notes)
      
      if (response.success && response.data) {
        updateApplication(id, response.data)
        return true
      } else {
        setError(response.error || 'Failed to update application status')
        return false
      }
    } catch (err) {
      setError('Failed to update application status')
      return false
    } finally {
      setUpdating(false)
    }
  }, [isUpdating, updateApplication, setUpdating, clearError, setError])

  // Withdraw application
  const withdrawApplication = useCallback(async (id: string) => {
    if (isUpdating) return false
    
    setUpdating(true)
    clearError()
    
    try {
      const response = await applicationsApi.withdrawApplication(id)
      
      if (response.success && response.data) {
        updateApplication(id, response.data)
        return true
      } else {
        setError(response.error || 'Failed to withdraw application')
        return false
      }
    } catch (err) {
      setError('Failed to withdraw application')
      return false
    } finally {
      setUpdating(false)
    }
  }, [isUpdating, updateApplication, setUpdating, clearError, setError])

  // Update application
  const updateApplicationData = useCallback(async (id: string, updates: Partial<Application>) => {
    if (isUpdating) return false
    
    setUpdating(true)
    clearError()
    
    try {
      const response = await applicationsApi.updateApplication(id, updates)
      
      if (response.success && response.data) {
        updateApplication(id, response.data)
        return true
      } else {
        setError(response.error || 'Failed to update application')
        return false
      }
    } catch (err) {
      setError('Failed to update application')
      return false
    } finally {
      setUpdating(false)
    }
  }, [isUpdating, updateApplication, setUpdating, clearError, setError])

  // Delete application
  const deleteApplication = useCallback(async (id: string) => {
    if (isUpdating) return false
    
    setUpdating(true)
    clearError()
    
    try {
      const response = await applicationsApi.deleteApplication(id)
      
      if (response.success) {
        removeApplication(id)
        return true
      } else {
        setError(response.error || 'Failed to delete application')
        return false
      }
    } catch (err) {
      setError('Failed to delete application')
      return false
    } finally {
      setUpdating(false)
    }
  }, [isUpdating, removeApplication, setUpdating, clearError, setError])

  // Bulk update status
  const bulkUpdateStatus = useCallback(async (ids: string[], status: ApplicationStatus, notes?: string) => {
    if (isUpdating) return false
    
    setUpdating(true)
    clearError()
    
    try {
      const response = await applicationsApi.bulkUpdateStatus(ids, status, notes)
      
      if (response.success && response.data) {
        // Update each application in the store
        response.data.forEach(app => {
          updateApplication(app.id, app)
        })
        return true
      } else {
        setError(response.error || 'Failed to update applications')
        return false
      }
    } catch (err) {
      setError('Failed to update applications')
      return false
    } finally {
      setUpdating(false)
    }
  }, [isUpdating, updateApplication, setUpdating, clearError, setError])

  // Search applications
  const searchApplications = useCallback(async (query: string) => {
    setSearching(true)
    clearError()
    
    try {
      setSearchQuery(query)
      
      // Apply search filter
      const newFilters = { ...filters, search: query }
      await loadApplications(newFilters)
    } catch (err) {
      setError('Failed to search applications')
    } finally {
      setSearching(false)
    }
  }, [filters, setSearchQuery, loadApplications, setSearching, clearError, setError])

  // Apply filters
  const applyFilters = useCallback(async (newFilters: ApplicationFilters) => {
    setLoading(true)
    clearError()
    
    try {
      setFilters(newFilters)
      await loadApplications(newFilters)
    } catch (err) {
      setError('Failed to apply filters')
    } finally {
      setLoading(false)
    }
  }, [filters, setFilters, loadApplications, setLoading, clearError, setError])

  // Clear all filters
  const clearAllFilters = useCallback(async () => {
    clearFilters()
    await loadApplications()
  }, [clearFilters, loadApplications])

  // Utility functions
  const getApplicationsByMarketAndStatus = useCallback((marketId: string, status?: ApplicationStatus) => {
    const marketApps = getApplicationsByMarket(marketId)
    return status ? marketApps.filter(app => app.status === status) : marketApps
  }, [getApplicationsByMarket])

  const getMyApplicationsByStatus = useCallback((status: ApplicationStatus) => {
    if (!user?.id) return []
    return myApplications.filter(app => app.status === status)
  }, [user?.id, myApplications])

  const getApplicationStatusCount = useCallback((status?: ApplicationStatus) => {
    const apps = status ? applications.filter(app => app.status === status) : applications
    return apps.length
  }, [applications])

  const hasApplicationForMarket = useCallback((marketId: string) => {
    if (!user?.id) return false
    return applications.some(app => app.marketId === marketId && app.vendorId === user.id)
  }, [user?.id, applications])

  const getApplicationForMarket = useCallback((marketId: string) => {
    if (!user?.id) return null
    return applications.find(app => app.marketId === marketId && app.vendorId === user.id) || null
  }, [user?.id, applications])

  // Auto-load applications when filters change
  useEffect(() => {
    if (!isLoading && applications.length === 0) {
      loadApplications()
    }
  }, [applications.length, isLoading])

  // Load my applications when user changes
  useEffect(() => {
    if (user?.id) {
      loadMyApplications()
    }
  }, [user?.id])

  return {
    // Data
    applications,
    myApplications,
    application,
    
    // Loading states
    isLoading,
    isSubmitting,
    isUpdating,
    isSearching,
    
    // Filters and search
    filters,
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
    updateApplicationStatus,
    
    // Pagination
    setCurrentPage,
    setHasMore,
    
    // Error handling
    setError,
    clearError,
    
    // Utilities
    getApplicationById,
    getFilteredApplications,
    getApplicationsByStatus,
    getApplicationsByMarket,
    getMyApplications,
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
    return applicationsForReview.filter(app => 
      app.status === 'submitted' || app.status === 'under-review'
    )
  }, [applicationsForReview])
  
  // Get recent applications
  const getRecentApplications = useCallback((days: number = 7) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return applicationsForReview.filter(app => 
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