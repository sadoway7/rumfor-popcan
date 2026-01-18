import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

  const queryClient = useQueryClient()
  const [currentFilters, setCurrentFilters] = useState<MarketFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // Use mutations for tracking
  const trackMutation = useTrackMarketMutation()
  const untrackMutation = useUntrackMarketMutation()

  // Query keys
  const MARKETS_QUERY_KEY = (filters: MarketFilters, page: number, limit: number) =>
    ['markets', filters, page, limit]

  const SEARCH_QUERY_KEY = (query: string) =>
    ['markets-search', query]

  // Main markets query
  const marketsQuery = useQuery({
    queryKey: MARKETS_QUERY_KEY(currentFilters, currentPage, limit),
    queryFn: async () => {
      const response = await marketsApi.getMarkets(currentFilters, currentPage, limit)
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages)
        setHasMore(currentPage < response.pagination.totalPages)
      }
      return response.data
    },
    enabled: autoLoad && !searchQuery,
    staleTime: 15 * 60 * 1000, // 15 minutes (optimized cache duration)
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    refetchOnMount: false, // Use cache on mount
    refetchOnReconnect: true, // DO refetch when internet reconnects
    retry: 1 // Only retry once on failure
  })

  // Search query (shorter cache for dynamic search results)
  const searchQueryResult = useQuery({
    queryKey: SEARCH_QUERY_KEY(searchQuery),
    queryFn: () => marketsApi.searchMarkets(searchQuery),
    enabled: !!searchQuery,
    staleTime: 5 * 60 * 1000, // 5 minutes (search results can be cached longer)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1
  })

  // Load markets function
  const loadMarkets = useCallback(async (loadOptions?: {
    filters?: MarketFilters
    page?: number
    limit?: number
  }) => {
    const newFilters = loadOptions?.filters || currentFilters
    const newPage = loadOptions?.page || 1
    const newLimit = loadOptions?.limit || limit

    setCurrentFilters(newFilters)
    setCurrentPage(newPage)
    setSearchQuery('') // Clear search when loading markets

    // Trigger query invalidation/refetch
    await queryClient.invalidateQueries({
      queryKey: MARKETS_QUERY_KEY(newFilters, newPage, newLimit)
    })
  }, [currentFilters, limit, queryClient])

  // Search markets function
  const searchMarkets = useCallback(async (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    setHasMore(false)

    // Trigger search query
    await queryClient.invalidateQueries({
      queryKey: SEARCH_QUERY_KEY(query)
    })
  }, [queryClient])

  // Track market function
  const trackMarket = useCallback(async (marketId: string) => {
    return new Promise<void>((resolve, reject) => {
      trackMutation.mutate(marketId, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error)
      })
    })
  }, [trackMutation])

  // Untrack market function
  const untrackMarket = useCallback(async (marketId: string) => {
    return new Promise<void>((resolve, reject) => {
      untrackMutation.mutate(marketId, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error)
      })
    })
  }, [untrackMutation])

  // Pagination helpers
  const nextPage = useCallback(() => {
    if (hasMore) {
      const nextPageNum = currentPage + 1
      loadMarkets({ page: nextPageNum })
    }
  }, [currentPage, hasMore, loadMarkets])

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      const prevPageNum = currentPage - 1
      loadMarkets({ page: prevPageNum })
    }
  }, [currentPage, loadMarkets])

  // Refresh function
  const refresh = useCallback(async () => {
    if (searchQuery) {
      await queryClient.invalidateQueries({ queryKey: SEARCH_QUERY_KEY(searchQuery) })
    } else {
      await queryClient.invalidateQueries({
        queryKey: MARKETS_QUERY_KEY(currentFilters, currentPage, limit)
      })
    }
  }, [searchQuery, currentFilters, currentPage, limit, queryClient])

  // Set filters function
  const setFilters = useCallback((filters: MarketFilters) => {
    setCurrentFilters(filters)
    setCurrentPage(1)
    setSearchQuery('')
  }, [])

  // Clear filters function
  const clearFilters = useCallback(() => {
    setCurrentFilters({})
    setCurrentPage(1)
    setSearchQuery('')
  }, [])

  // Set current page
  const setCurrentPageDirect = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Get tracked market IDs from tracked markets query
  const { user } = useAuthStore()
  const trackedMarketsQuery = useTrackedMarketsQuery(user?.id)
  const trackedMarketIds = Array.isArray(trackedMarketsQuery.data)
    ? trackedMarketsQuery.data.map((market: Market) => market.id)
    : []

  // Get market by ID helper
  const getMarketById = useCallback((id: string) => {
    const markets = searchQuery ? searchQueryResult.data?.data : marketsQuery.data
    return Array.isArray(markets) ? markets.find(market => market.id === id) : undefined
  }, [searchQuery, searchQueryResult.data, marketsQuery.data])

  // Is market tracked helper
  const isMarketTracked = useCallback((marketId: string) => {
    return trackedMarketIds.includes(marketId)
  }, [trackedMarketIds])

  // Determine current data and loading states
  const isLoading = marketsQuery.isLoading || searchQueryResult.isLoading
  const isSearching = searchQueryResult.isFetching
  const isTracking = trackMutation.isPending || untrackMutation.isPending
  const error = marketsQuery.error?.message || searchQueryResult.error?.message || null
  const markets = searchQuery ? (searchQueryResult.data?.data || []) : (marketsQuery.data || [])

  return {
    // Data
    markets,
    trackedMarketIds,

    // Loading states
    isLoading,
    isSearching,
    isTracking,

    // Pagination
    currentPage,
    totalPages,
    hasMore,

    // Error handling
    error,

    // Filters and search
    filters: currentFilters,
    searchQuery,

    // Actions
    loadMarkets,
    searchMarkets,
    setFilters,
    clearFilters,

    // Market actions
    getMarketById,
    trackMarket,
    untrackMarket,
    isMarketTracked,

    // Pagination
    setCurrentPage: setCurrentPageDirect,
    nextPage,
    previousPage,

    // Utility
    refresh
  }
}

// Hook for getting a single market by ID
export const useMarket = (id: string) => {
  const query = useQuery({
    queryKey: ['market', id],
    queryFn: () => marketsApi.getMarketById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    market: query.data?.data || null,
    isLoading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch
  }
}

// Query key for tracked markets
const TRACKED_MARKETS_QUERY_KEY = (userId?: string) => ['trackedMarkets', userId || '']

// Query for fetching tracked markets
const useTrackedMarketsQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: TRACKED_MARKETS_QUERY_KEY(userId),
    queryFn: async () => {
      if (!userId) {
        throw new Error('No authenticated user found')
      }
      const response = await marketsApi.getUserTrackedMarkets(userId)
      return response.data
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Mutations for track/untrack
const useTrackMarketMutation = () => {
  const queryClient = useQueryClient()
  const userId = useAuthStore(state => state.user?.id)

  return useMutation({
    mutationFn: async (marketId: string) => {
      const response = await marketsApi.trackMarket(marketId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to track market')
      }
      return { marketId, response }
    },
    onSuccess: () => {
      // Invalidate tracked markets query
      if (userId) {
        queryClient.invalidateQueries({ queryKey: TRACKED_MARKETS_QUERY_KEY(userId) })
      }
    },
    onError: (err) => {
      console.error('Failed to track market:', err)
    }
  })
}

const useUntrackMarketMutation = () => {
  const queryClient = useQueryClient()
  const userId = useAuthStore(state => state.user?.id)

  return useMutation({
    mutationFn: async (marketId: string) => {
      const response = await marketsApi.untrackMarket(marketId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to untrack market')
      }
      return { marketId, response }
    },
    onSuccess: () => {
      // Invalidate tracked markets query
      if (userId) {
        queryClient.invalidateQueries({ queryKey: TRACKED_MARKETS_QUERY_KEY(userId) })
      }
    },
    onError: (err) => {
      console.error('Failed to untrack market:', err)
    }
  })
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
  refetch: () => Promise<any>
}

export const useTrackedMarkets = (): UseTrackedMarketsReturn => {
  const userId = useAuthStore(state => state.user?.id)

  // React Query hooks
  const trackedMarketsQuery = useTrackedMarketsQuery(userId)
  const trackMutation = useTrackMarketMutation()
  const untrackMutation = useUntrackMarketMutation()

  const handleTrackMarket = useCallback((marketId: string) => {
    trackMutation.mutate(marketId)
  }, [trackMutation])

  const handleUntrackMarket = useCallback((marketId: string) => {
    untrackMutation.mutate(marketId)
  }, [untrackMutation])

  const trackedMarketIds = Array.isArray(trackedMarketsQuery.data)
    ? trackedMarketsQuery.data.map(market => market.id)
    : []

  const isMarketTracked = useCallback((marketId: string) => {
    return trackedMarketIds.includes(marketId)
  }, [trackedMarketIds])

  return {
    trackedMarkets: trackedMarketsQuery.data || [],
    trackedMarketIds,
    isLoading: trackedMarketsQuery.isLoading || trackMutation.isPending || untrackMutation.isPending,
    error: trackedMarketsQuery.error?.message || null,
    trackMarket: handleTrackMarket,
    untrackMarket: handleUntrackMarket,
    isMarketTracked,
    refetch: trackedMarketsQuery.refetch
  }
}
