import { useState, useEffect, useCallback } from 'react'
import { useMarketsStore } from '../marketsStore'
import { useAuthStore } from '@/features/auth/authStore'
import { marketsApi } from '../marketsApi'
import { Market, MarketFilters } from '@/types'

interface UseMarketsOptions {
  autoLoad?: boolean
  limit?: number
}

interface UseMarketsReturn {
  // Data
  markets: Market[]
  trackedMarketIds: string[]
  
  // Loading states
  isLoading: boolean
  isSearching: boolean
  isTracking: boolean
  
  // Pagination
  currentPage: number
  totalPages: number
  hasMore: boolean
  
  // Error handling
  error: string | null
  
  // Filters and search
  filters: MarketFilters
  searchQuery: string
  
  // Actions
  loadMarkets: (options?: { filters?: MarketFilters; page?: number; limit?: number }) => Promise<void>
  searchMarkets: (query: string) => Promise<void>
  setFilters: (filters: MarketFilters) => void
  clearFilters: () => void
  
  // Market actions
  getMarketById: (id: string) => Market | undefined
  trackMarket: (marketId: string) => Promise<void>
  untrackMarket: (marketId: string) => Promise<void>
  isMarketTracked: (marketId: string) => boolean
  
  // Pagination
  setCurrentPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  
  // Utility
  refresh: () => Promise<void>
}

export const useMarkets = (options?: UseMarketsOptions): UseMarketsReturn => {
  const {
    autoLoad = true,
    limit = 20
  } = options || {}

  const store = useMarketsStore()
  const [isTracking, setIsTracking] = useState(false)

  // Load markets function - fixed dependencies
  const loadMarkets = useCallback(async (loadOptions?: {
    filters?: MarketFilters
    page?: number
    limit?: number
  }) => {
    try {
      store.setLoading(true)
      store.clearError()

      // Get current values directly from store
      const currentFilters = loadOptions?.filters || store.filters
      const page = loadOptions?.page || store.currentPage
      const actualLimit = loadOptions?.limit || limit

      const response = await marketsApi.getMarkets(currentFilters, page, actualLimit)

      if (response.pagination) {
        store.setMarkets(response.data)
        store.setCurrentPage(page)
        store.setHasMore(page < response.pagination.totalPages)
      } else {
        // For search results, just replace markets
        store.setMarkets(response.data)
        store.setCurrentPage(1)
        store.setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to load markets:', error)
      store.setError(error instanceof Error ? error.message : 'Failed to load markets')
    } finally {
      store.setLoading(false)
    }
  }, [store, limit])

  // Search markets function - fixed dependencies
  const searchMarkets = useCallback(async (query: string) => {
    try {
      store.setSearching(true)
      store.clearError()
      store.setSearchQuery(query)

      const response = await marketsApi.searchMarkets(query)

      if (response.success && response.data) {
        store.setMarkets(response.data)
        store.setCurrentPage(1)
        store.setHasMore(false)
      } else {
        store.setError(response.error || 'Search failed')
      }
    } catch (error) {
      console.error('Search failed:', error)
      store.setError(error instanceof Error ? error.message : 'Search failed')
    } finally {
      store.setSearching(false)
    }
  }, [store])

  // Track market function - fixed dependencies
  const trackMarket = useCallback(async (marketId: string) => {
    try {
      setIsTracking(true)

      const response = await marketsApi.trackMarket(marketId)

      if (response.success) {
        store.trackMarket(marketId)
      } else {
        store.setError(response.error || 'Failed to track market')
      }
    } catch (error) {
      console.error('Failed to track market:', error)
      store.setError(error instanceof Error ? error.message : 'Failed to track market')
    } finally {
      setIsTracking(false)
    }
  }, [store])

  // Untrack market function - fixed dependencies
  const untrackMarket = useCallback(async (marketId: string) => {
    try {
      setIsTracking(true)

      const response = await marketsApi.untrackMarket(marketId)

      if (response.success) {
        store.untrackMarket(marketId)
      } else {
        store.setError(response.error || 'Failed to untrack market')
      }
    } catch (error) {
      console.error('Failed to untrack market:', error)
      store.setError(error instanceof Error ? error.message : 'Failed to untrack market')
    } finally {
      setIsTracking(false)
    }
  }, [store])

  // Pagination helpers - fixed dependencies
  const nextPage = useCallback(() => {
    const currentPage = store.currentPage
    if (store.hasMore) {
      const nextPageNum = currentPage + 1
      loadMarkets({ page: nextPageNum })
    }
  }, [store.currentPage, store.hasMore, loadMarkets])

  const previousPage = useCallback(() => {
    const currentPage = store.currentPage
    if (currentPage > 1) {
      const prevPageNum = currentPage - 1
      loadMarkets({ page: prevPageNum })
    }
  }, [store.currentPage, loadMarkets])

  // Refresh function - fixed dependencies
  const refresh = useCallback(async () => {
    loadMarkets()
  }, [loadMarkets])

  // Auto-load markets on mount if enabled - only runs once
  useEffect(() => {
    if (autoLoad) {
      loadMarkets()
    }
  }, [autoLoad]) // Only depends on autoLoad, not loadMarkets

  // Remove automatic filter initialization to prevent infinite loop
  // Filters should be set manually by components, not automatically

  return {
    // Data
    markets: store.markets,
    trackedMarketIds: store.trackedMarketIds,
    
    // Loading states
    isLoading: store.isLoading,
    isSearching: store.isSearching,
    isTracking,
    
    // Pagination
    currentPage: store.currentPage,
    totalPages: store.totalPages,
    hasMore: store.hasMore,
    
    // Error handling
    error: store.error,
    
    // Filters and search
    filters: store.filters,
    searchQuery: store.searchQuery,
    
    // Actions
    loadMarkets,
    searchMarkets,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,
    
    // Market actions
    getMarketById: store.getMarketById,
    trackMarket,
    untrackMarket,
    isMarketTracked: store.isMarketTracked,
    
    // Pagination
    setCurrentPage: store.setCurrentPage,
    nextPage,
    previousPage,
    
    // Utility
    refresh
  }
}

// Hook for getting a single market by ID
export const useMarket = (id: string) => {
  const store = useMarketsStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMarket = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // First try to get from store
      const existingMarket = store.getMarketById(id)
      if (existingMarket) {
        setIsLoading(false)
        return existingMarket
      }

      // If not in store, fetch from API
      const response = await marketsApi.getMarketById(id)
      
      if (response.success && response.data) {
        store.addMarket(response.data)
        setIsLoading(false)
        return response.data
      } else {
        setError(response.error || 'Market not found')
        setIsLoading(false)
        return null
      }
    } catch (err) {
      console.error('Failed to load market:', err)
      setError(err instanceof Error ? err.message : 'Failed to load market')
      setIsLoading(false)
      return null
    }
  }, [id]) // Only depend on id, not store

  useEffect(() => {
    if (id) {
      loadMarket()
    }
  }, [id, loadMarket])

  return {
    market: store.getMarketById(id),
    isLoading,
    error,
    refetch: loadMarket
  }
}

// Hook for tracked markets
interface UseTrackedMarketsReturn {
  trackedMarkets: Market[]
  trackedMarketIds: string[]
  isLoading: boolean
  error: string | null
  trackMarket: (marketId: string) => void
  untrackMarket: (marketId: string) => void
  isMarketTracked: (marketId: string) => boolean
  refreshTracked: () => Promise<void>
}

export const useTrackedMarkets = (): UseTrackedMarketsReturn => {
  const store = useMarketsStore()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trackedMarkets, setTrackedMarkets] = useState<Market[]>([])

  const refreshTracked = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get user ID from auth store
      const userId = user?.id
      if (!userId) {
        setTrackedMarkets([])
        store.setTrackedMarketIds([])
        setError('No authenticated user found')
        return
      }

      const response = await marketsApi.getUserTrackedMarkets(userId)

      // PaginatedResponse returns data directly
      setTrackedMarkets(response.data)
      // Update trackedMarketIds in store for consistency
      store.setTrackedMarketIds(response.data.map(market => market.id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tracked markets'
      console.error('Failed to load tracked markets:', err)
      setError(errorMessage)
      store.setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, store])

  // Load tracked markets on mount and cleanup on unmount
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (isMounted) {
        await refreshTracked()
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [refreshTracked])

  return {
    trackedMarkets,
    trackedMarketIds: store.trackedMarketIds,
    isLoading,
    error,
    trackMarket: store.trackMarket,
    untrackMarket: store.untrackMarket,
    isMarketTracked: store.isMarketTracked,
    refreshTracked
  }
}
