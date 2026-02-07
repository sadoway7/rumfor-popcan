import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/authStore'
import { marketsApi } from '../marketsApi'
import { Market, MarketFilters, MarketCategory, MarketStatus, MarketScheduleItem, AccessibilityFeatures, CustomField, ContactInfo } from '@/types'

interface UseMarketsOptions {
  autoLoad?: boolean
  limit?: number
  infiniteScroll?: boolean
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
  hasNextPage: boolean
  fetchNextPage: () => void

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
  trackMarket: (marketId: string, status?: string, attendingDates?: string[]) => Promise<void>
  untrackMarket: (marketId: string) => Promise<void>
  isMarketTracked: (marketId: string) => boolean

  // Pagination
  setCurrentPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void

  // Utility
  refresh: () => Promise<any>
}

export const useMarkets = (options?: UseMarketsOptions): UseMarketsReturn => {
  const {
    autoLoad = true,
    limit = 20,
    infiniteScroll = false
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

  // Main markets query (used when NOT using infinite scroll or when sorting - fetches more data at once)
  const marketsQuery = useQuery({
    queryKey: MARKETS_QUERY_KEY(currentFilters, currentPage, limit),
    queryFn: async () => {
      const response = await marketsApi.getMarkets(currentFilters, currentPage, limit)
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || Math.ceil(response.pagination.total / limit))
        setHasMore(currentPage < (response.pagination.totalPages || Math.ceil(response.pagination.total / limit)))
      }
      return response.data
    },
    enabled: autoLoad && !searchQuery && (!infiniteScroll || Boolean(currentFilters.sortBy)),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: 1
  })

  // Infinite scroll markets query (only used when NOT sorting)
  const infiniteMarketsQuery = useInfiniteQuery({
    queryKey: ['markets-infinite', currentFilters, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await marketsApi.getMarkets(currentFilters, pageParam as number, limit)
      const totalPages = response.pagination?.totalPages || Math.ceil(response.pagination?.total / limit) || 0
      return {
        data: response.data,
        nextPage: (pageParam as number) + 1,
        hasMore: (pageParam as number) < totalPages
      }
    },
    initialPageParam: 1,
    enabled: autoLoad && !searchQuery && infiniteScroll && !currentFilters.sortBy,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: 1,
    getNextPageParam: (lastPage: any) => (lastPage as any).hasMore ? (lastPage as any).nextPage : undefined
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
  const trackMarket = useCallback(async (marketId: string, status?: string, attendingDates?: string[]) => {
    return new Promise<void>((resolve, reject) => {
      trackMutation.mutate({ marketId, status, attendingDates } as { marketId: string; status?: string; attendingDates?: string[] }, {
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
      await queryClient.refetchQueries({ queryKey: SEARCH_QUERY_KEY(searchQuery), type: 'active' })
    } else if (infiniteScroll) {
      await queryClient.refetchQueries({ queryKey: ['markets-infinite', currentFilters, limit], type: 'active' })
    } else {
      await queryClient.refetchQueries({ queryKey: MARKETS_QUERY_KEY(currentFilters, currentPage, limit), type: 'active' })
    }
  }, [searchQuery, currentFilters, currentPage, limit, queryClient, infiniteScroll])

  // Set filters function
  const setFilters = useCallback((filters: MarketFilters) => {
    setCurrentFilters(filters)
    setCurrentPage(1)
    setSearchQuery('')
    // Invalidate markets queries to refetch with new filters
    queryClient.invalidateQueries({ queryKey: ['markets-infinite'] })
    queryClient.invalidateQueries({ queryKey: ['markets'] })
  }, [queryClient])

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
    ? trackedMarketsQuery.data
        .filter((t: any) => t.market) // Only markets that exist
        .map((t: any) => t.market.id)
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
  // Only show loading from the active query
  const isLoading = (currentFilters.sortBy ? marketsQuery.isLoading : infiniteMarketsQuery.isLoading) || searchQueryResult.isLoading
  const isSearching = searchQueryResult.isFetching || (currentFilters.sortBy ? marketsQuery.isFetching : infiniteMarketsQuery.isFetching)
  const isTracking = trackMutation.isPending || untrackMutation.isPending
  const error = marketsQuery.error?.message || searchQueryResult.error?.message || infiniteMarketsQuery.error?.message || null

  // Get raw markets data from the appropriate query
  const rawMarkets: Market[] = searchQuery
    ? (searchQueryResult.data?.data || [])
    : currentFilters.sortBy
      ? (marketsQuery.data || [])
      : (infiniteMarketsQuery.data?.pages.flatMap((page: any) => page.data) || [])

  // Apply client-side sorting when sortBy is present
  const sortedMarkets = useMemo<Market[]>(() => {
    if (!currentFilters.sortBy || !rawMarkets || !Array.isArray(rawMarkets)) {
      return rawMarkets || []
    }

    const sorted = [...rawMarkets]
    const { sortBy } = currentFilters

    // Helper to get the earliest market date from schedule
    const getMarketDate = (market: Market): number => {
      if (!market.schedule || !Array.isArray(market.schedule) || market.schedule.length === 0) {
        return 0
      }
      const firstEvent = market.schedule[0]
      if (firstEvent.startDate) {
        return new Date(firstEvent.startDate).getTime()
      }
      return 0
    }

    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name?.localeCompare(b.name || '') || 0)
      case 'name-desc':
        return sorted.sort((a, b) => b.name?.localeCompare(a.name || '') || 0)
      case 'date-newest':
        return sorted.sort((a, b) => getMarketDate(b) - getMarketDate(a))
      case 'date-oldest':
        return sorted.sort((a, b) => getMarketDate(a) - getMarketDate(b))
      default:
        return sorted
    }
  }, [rawMarkets, currentFilters.sortBy])

  // Use sorted markets when sorting, otherwise use infinite scroll or regular markets
  const markets = currentFilters.sortBy ? sortedMarkets : rawMarkets

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
    // Pagination - disable infinite scroll when sorting (all data loaded at once)
    hasNextPage: currentFilters.sortBy ? false : (infiniteScroll ? infiniteMarketsQuery.hasNextPage : currentPage < totalPages),
    fetchNextPage: infiniteScroll && !currentFilters.sortBy ? infiniteMarketsQuery.fetchNextPage : nextPage,

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
      // getUserTrackedMarkets now returns the tracking array directly
      const trackingArray = await marketsApi.getUserTrackedMarkets(userId)
      console.log('[useTrackedMarketsQuery] Received tracking array:', trackingArray)
      return trackingArray
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
    mutationFn: async ({ marketId, status, attendingDates }: { marketId: string; status?: string; attendingDates?: string[] }) => {
      const response = await marketsApi.trackMarket(marketId, status, attendingDates)
      if (!response.success) {
        throw new Error(response.error || 'Failed to track market')
      }
      return { marketId, response }
    },
    onMutate: async ({ marketId, status }) => {
      // Optimistic update - add market to tracked list immediately
      const queryKey = TRACKED_MARKETS_QUERY_KEY(userId)
      await queryClient.cancelQueries({ queryKey })
      
      const previousData = queryClient.getQueryData(queryKey)
      
      // Optimistically add the market to tracked list
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old || !Array.isArray(old)) {
          // If no data, create new array with this market
          return [{
            _id: `temp-${marketId}`,
            user: userId,
            market: { id: marketId },
            marketId,
            status: status || 'interested',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }]
        }
        
        // Check if market is already tracked
        const hasMarket = old.some((m: any) => 
          (m.market?.id === marketId) || (m.marketId === marketId)
        )
        
        if (hasMarket) {
          // Update existing tracking entry
          return old.map((m: any) => {
            if ((m.market?.id === marketId) || (m.marketId === marketId)) {
              return { ...m, status: status || 'interested', updatedAt: new Date().toISOString() }
            }
            return m
          })
        } else {
          // Add new tracking entry
          return [...old, {
            _id: `temp-${marketId}`,
            user: userId,
            market: { id: marketId },
            marketId,
            status: status || 'interested',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }]
        }
      })
      
      return { previousData }
    },
    onSuccess: () => {
      // Refetch to get complete data from server
      if (userId) {
        queryClient.invalidateQueries({ queryKey: TRACKED_MARKETS_QUERY_KEY(userId) })
      }
    },
    onError: (err, _variables, context: any) => {
      // Rollback optimistic update on error
      if (context?.previousData !== undefined && userId) {
        queryClient.setQueryData(TRACKED_MARKETS_QUERY_KEY(userId), context.previousData)
      }
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
    onMutate: async (marketId) => {
      // Optimistic update - remove market from tracked list immediately
      const queryKey = TRACKED_MARKETS_QUERY_KEY(userId)
      await queryClient.cancelQueries({ queryKey })
      
      const previousData = queryClient.getQueryData(queryKey)
      
      // Optimistically remove the market from tracked list
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old || !Array.isArray(old)) return old
        
        // Filter out the market being untracked
        return old.filter((m: any) => 
          (m.market?.id !== marketId) && (m.marketId !== marketId)
        )
      })
      
      return { previousData }
    },
    onSuccess: () => {
      // Refetch to ensure consistency with server
      if (userId) {
        queryClient.invalidateQueries({ queryKey: TRACKED_MARKETS_QUERY_KEY(userId) })
      }
    },
    onError: (err, _variables, context: any) => {
      // Rollback optimistic update on error
      if (context?.previousData !== undefined && userId) {
        queryClient.setQueryData(TRACKED_MARKETS_QUERY_KEY(userId), context.previousData)
      }
      console.error('Failed to untrack market:', err)
    }
  })
}

// Interface for creating a market
export interface CreateMarketData {
  name: string
  category: MarketCategory
  description: string
  comments?: string
  location: {
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    latitude?: number
    longitude?: number
  }
  dates: {
    type: 'one-time'
    events: Array<{
      startDate: string
      endDate: string
      time: {
        start: string
        end: string
      }
    }>
  }
  contact: ContactInfo
  images: string[]
  vendorAttendance: string
  marketType: 'vendor-created'
  status: MarketStatus
  editableUntil: string
  // Add missing fields from Market type
  tags: string[]
  schedule: MarketScheduleItem[]
  applicationsEnabled: boolean
  stats: {
    viewCount: number
    favoriteCount: number
    applicationCount: number
    commentCount: number
    rating: number
    reviewCount: number
  }
  accessibility: AccessibilityFeatures
  applicationFields: CustomField[]
}

// Mutation hook for creating markets
export const useCreateMarketMutation = () => {
  const queryClient = useQueryClient()
  const userId = useAuthStore(state => state.user?.id)

  return useMutation({
    mutationFn: async (marketData: CreateMarketData) => {
      const response = await marketsApi.createMarket(marketData)
      if (!response.success) {
        throw new Error(response.error || 'Failed to create market')
      }
      return response.data
    },
    onSuccess: (newMarket) => {
      // Invalidate markets list to show the new market
      queryClient.invalidateQueries({ queryKey: ['markets'] })
      
      // Auto-track the market for the creating vendor
      if (userId && newMarket?.id) {
        marketsApi.trackMarket(newMarket.id, 'attending')
        queryClient.invalidateQueries({ queryKey: ['trackedMarkets', userId] })
      }
    },
    onError: (err) => {
      console.error('Failed to create market:', err)
    }
  })
}

// Tracking data interface
interface TrackingData {
  id: string
  userId: string
  marketId: string
  status: 'interested' | 'applied' | 'approved' | 'attending' | 'declined' | 'cancelled' | 'completed' | 'archived'
  notes?: string
  attendingDates?: string[]
  todoCount: number
  todoProgress: number
  totalExpenses: number
  createdAt: string
  updatedAt: string
}

// Hook for market vendors
export const useMarketVendors = (marketId: string) => {
  const query = useQuery({
    queryKey: ['market-vendors', marketId],
    queryFn: () => marketsApi.getMarketVendors(marketId),
    enabled: !!marketId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    vendors: query.data?.data?.vendors || [],
    isLoading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch
  }
}

// Hook for tracked markets
interface UseTrackedMarketsReturn {
  trackedMarkets: Market[]
  trackedMarketIds: string[]
  trackingData: TrackingData[]
  isLoading: boolean
  error: string | null
  trackMarket: (marketId: string, status?: string, attendingDates?: string[]) => void
  untrackMarket: (marketId: string) => void
  isMarketTracked: (marketId: string) => boolean
  getTrackingStatus: (marketId: string) => TrackingData | undefined
  refetch: () => Promise<any>
}

export const useTrackedMarkets = (): UseTrackedMarketsReturn => {
  const userId = useAuthStore(state => state.user?.id)

  // React Query hooks
  const trackedMarketsQuery = useTrackedMarketsQuery(userId)
  const trackMutation = useTrackMarketMutation()
  const untrackMutation = useUntrackMarketMutation()

const handleTrackMarket = useCallback((marketId: string, status?: string, attendingDates?: string[]) => {
    trackMutation.mutate({ marketId, status, attendingDates } as { marketId: string; status?: string; attendingDates?: string[] })
  }, [trackMutation])

  const handleUntrackMarket = useCallback((marketId: string) => {
    untrackMutation.mutate(marketId)
  }, [untrackMutation])

const trackingData = Array.isArray(trackedMarketsQuery.data)
    ? trackedMarketsQuery.data.map((t: any) => ({
        id: t._id || t.id,
        userId: t.user,
        marketId: t.market?.id || t.marketId,
        status: t.status as 'interested' | 'applied' | 'approved' | 'attending' | 'declined' | 'cancelled' | 'completed' | 'archived',
        notes: t.personalNotes,
        attendingDates: t.attendingDates || [],
        todoCount: t.todoCount || 0,
        todoProgress: t.todoProgress || 0,
        totalExpenses: t.totalExpenses || 0,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }))
    : []

  const trackedMarkets = Array.isArray(trackedMarketsQuery.data)
    ? trackedMarketsQuery.data
        .filter((t: any) => t.market) // Only include valid tracking with market data
        .map((t: any) => t.market)
    : []

  const trackedMarketIds = trackedMarkets.map(market => market.id)

  const isMarketTracked = useCallback((marketId: string) => {
    return trackedMarketIds.includes(marketId)
  }, [trackedMarketIds])

  const getTrackingStatus = useCallback((marketId: string) => {
    return trackingData.find(t => t.marketId === marketId)
  }, [trackingData])

  return {
    trackedMarkets,
    trackedMarketIds,
    trackingData,
    isLoading: trackedMarketsQuery.isLoading || trackMutation.isPending || untrackMutation.isPending,
    error: trackedMarketsQuery.error?.message || null,
    trackMarket: handleTrackMarket,
    untrackMarket: handleUntrackMarket,
    isMarketTracked,
    getTrackingStatus,
    refetch: trackedMarketsQuery.refetch
  }
}
