import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Market, MarketFilters } from '@/types'
import { marketsApi } from './marketsApi'

interface MarketsState {
  // Data
  markets: Market[]
  trackedMarketIds: string[]
  
  // Loading states
  isLoading: boolean
  isSearching: boolean
  
  // Filters and search
  filters: MarketFilters
  searchQuery: string
  
  // Pagination
  currentPage: number
  totalPages: number
  hasMore: boolean
  totalMarkets: number
  
  // Error handling
  error: string | null
  
  // Sync actions (for hook compatibility)
  setMarkets: (markets: Market[]) => void
  addMarket: (market: Market) => void
  
  // Async actions (API integration)
  fetchMarkets: (filters?: MarketFilters, page?: number) => Promise<void>
  fetchMarketById: (id: string) => Promise<Market | null>
  searchMarkets: (query: string) => Promise<Market[]>
  createMarket: (marketData: Omit<Market, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Market | null>
  updateMarket: (id: string, updates: Partial<Market>) => Promise<void>
  removeMarket: (id: string) => Promise<void>
  
  // Search and filter actions
  setSearchQuery: (query: string) => void
  setFilters: (filters: MarketFilters) => void
  clearFilters: () => void
  
  // Tracking actions
  trackMarket: (marketId: string) => Promise<void>
  untrackMarket: (marketId: string) => Promise<void>
  setTrackedMarketIds: (marketIds: string[]) => void
  fetchTrackedMarkets: () => Promise<void>
  isMarketTracked: (marketId: string) => boolean
  
  // Pagination actions
  setCurrentPage: (page: number) => void
  setHasMore: (hasMore: boolean) => void
  setTotalPages: (totalPages: number) => void
  setTotalMarkets: (totalMarkets: number) => void
  
  // Loading and error actions
  setLoading: (loading: boolean) => void
  setSearching: (searching: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Utility actions
  getMarketById: (id: string) => Market | undefined
  getFilteredMarkets: () => Market[]
  resetStore: () => void
}

const initialFilters: MarketFilters = {
  category: [],
  location: {},
  dateRange: undefined,
  status: ['active'],
  search: '',
  tags: [],
  accessibility: {}
}

export const useMarketsStore = create<MarketsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      markets: [],
      trackedMarketIds: [],
      isLoading: false,
      isSearching: false,
      filters: initialFilters,
      searchQuery: '',
      currentPage: 1,
      totalPages: 0,
      totalMarkets: 0,
      hasMore: false,
      error: null,

      // Sync actions (for hook compatibility)
      setMarkets: (markets) => set({ markets }),
      addMarket: (market) => set((state) => ({
        markets: [market, ...state.markets]
      })),

      // Async actions (API integration)
      fetchMarkets: async (filters, page = 1) => {
        set({ isLoading: true, error: null })
        try {
          const response = await marketsApi.getMarkets(filters, page)
          set({
            markets: response.data,
            currentPage: response.pagination.page,
            totalPages: response.pagination.totalPages,
            totalMarkets: response.pagination.total,
            hasMore: response.pagination.page < response.pagination.totalPages,
            isLoading: false
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch markets'
          })
        }
      },
      
      fetchMarketById: async (id) => {
        set({ isLoading: true, error: null })
        try {
          const response = await marketsApi.getMarketById(id)
          if (response.success && response.data) {
            set({ isLoading: false })
            return response.data
          }
          set({ error: response.error || 'Market not found', isLoading: false })
          return null
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch market'
          })
          return null
        }
      },
      
      searchMarkets: async (query) => {
        set({ isSearching: true, error: null })
        try {
          const response = await marketsApi.searchMarkets(query)
          if (response.success && response.data) {
            set({ isSearching: false })
            return response.data
          }
          set({ isSearching: false })
          return []
        } catch (error) {
          set({
            isSearching: false,
            error: error instanceof Error ? error.message : 'Search failed'
          })
          return []
        }
      },
      
      createMarket: async (marketData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await marketsApi.createMarket(marketData)
          if (response.success && response.data) {
            set((state) => ({
              markets: [response.data!, ...state.markets],
              isLoading: false
            }))
            return response.data
          }
          set({ error: response.error || 'Failed to create market', isLoading: false })
          return null
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to create market'
          })
          return null
        }
      },
      
      updateMarket: async (id, updates) => {
        set({ isLoading: true, error: null })
        try {
          // Optimistic update
          set((state) => ({
            markets: state.markets.map(market =>
              market.id === id ? { ...market, ...updates } : market
            )
          }))
          set({ isLoading: false })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to update market'
          })
        }
      },
      
      removeMarket: async (id) => {
        set({ isLoading: true, error: null })
        try {
          // Optimistic update
          set((state) => ({
            markets: state.markets.filter(market => market.id !== id),
            isLoading: false
          }))
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to remove market'
          })
        }
      },

      // Search and filter actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setFilters: (filters) => set({ filters }),
      
      clearFilters: () => set({ 
        filters: initialFilters, 
        searchQuery: '' 
      }),
      
      applyFilters: () => {
        const { markets, filters, searchQuery } = get()
        let filteredMarkets = [...markets]

        // Apply search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase()
          filteredMarkets = filteredMarkets.filter(market =>
            market.name.toLowerCase().includes(query) ||
            market.description.toLowerCase().includes(query) ||
            market.location.city.toLowerCase().includes(query) ||
            market.location.state.toLowerCase() ||
            market.tags.some(tag => tag.toLowerCase().includes(query))
          )
        }

        // Apply category filter
        if (filters.category && filters.category.length > 0) {
          filteredMarkets = filteredMarkets.filter(market =>
            filters.category!.includes(market.category)
          )
        }

        // Apply status filter
        if (filters.status && filters.status.length > 0) {
          filteredMarkets = filteredMarkets.filter(market =>
            filters.status!.includes(market.status)
          )
        }

        // Apply location filter
        if (filters.location?.city) {
          filteredMarkets = filteredMarkets.filter(market =>
            market.location.city.toLowerCase().includes(
              filters.location!.city!.toLowerCase()
            )
          )
        }

        if (filters.location?.state) {
          filteredMarkets = filteredMarkets.filter(market =>
            market.location.state.toLowerCase().includes(
              filters.location!.state!.toLowerCase()
            )
          )
        }

        // Apply accessibility filters
        if (filters.accessibility?.wheelchairAccessible) {
          filteredMarkets = filteredMarkets.filter(market =>
            market.accessibility.wheelchairAccessible
          )
        }

        if (filters.accessibility?.parkingAvailable) {
          filteredMarkets = filteredMarkets.filter(market =>
            market.accessibility.parkingAvailable
          )
        }

        if (filters.accessibility?.restroomsAvailable) {
          filteredMarkets = filteredMarkets.filter(market =>
            market.accessibility.restroomsAvailable
          )
        }

        // Apply tags filter
        if (filters.tags && filters.tags.length > 0) {
          filteredMarkets = filteredMarkets.filter(market =>
            filters.tags!.some(tag => market.tags.includes(tag))
          )
        }

        return filteredMarkets
      },

      // Tracking actions
      trackMarket: async (marketId) => {
        try {
          await marketsApi.trackMarket(marketId)
          set((state) => ({
            trackedMarketIds: [...state.trackedMarketIds, marketId]
          }))
        } catch (error) {
          console.error('Failed to track market:', error)
        }
      },
      
      untrackMarket: async (marketId) => {
        try {
          await marketsApi.untrackMarket(marketId)
          set((state) => ({
            trackedMarketIds: state.trackedMarketIds.filter(id => id !== marketId)
          }))
        } catch (error) {
          console.error('Failed to untrack market:', error)
        }
      },
      
      setTrackedMarketIds: (marketIds) => set({ trackedMarketIds: marketIds }),
      
      fetchTrackedMarkets: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await marketsApi.getUserTrackedMarkets('current-user-id')
          set({
            trackedMarketIds: response.data.map(m => m.id),
            isLoading: false
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch tracked markets'
          })
        }
      },
      
      isMarketTracked: (marketId) => {
        const { trackedMarketIds } = get()
        return trackedMarketIds.includes(marketId)
      },

      // Pagination actions
      setCurrentPage: (page) => set({ currentPage: page }),
      setHasMore: (hasMore) => set({ hasMore }),
      setTotalPages: (totalPages: number) => set({ totalPages }),
      setTotalMarkets: (totalMarkets: number) => set({ totalMarkets }),

      // Loading and error actions
      setLoading: (loading) => set({ isLoading: loading }),
      setSearching: (searching) => set({ isSearching: searching }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Utility actions
      getMarketById: (id) => {
        const { markets } = get()
        return markets.find(market => market.id === id)
      },
      
      getFilteredMarkets: () => {
        const { markets, filters, searchQuery } = get()
        let filteredMarkets = [...markets]

        // Apply search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase()
          filteredMarkets = filteredMarkets.filter(market =>
            market.name.toLowerCase().includes(query) ||
            market.description.toLowerCase().includes(query) ||
            market.location.city.toLowerCase().includes(query) ||
            market.location.state.toLowerCase() ||
            market.tags.some(tag => tag.toLowerCase().includes(query))
          )
        }

        // Apply category filter
        if (filters.category && filters.category.length > 0) {
          filteredMarkets = filteredMarkets.filter(market =>
            filters.category!.includes(market.category)
          )
        }

        // Apply status filter
        if (filters.status && filters.status.length > 0) {
          filteredMarkets = filteredMarkets.filter(market =>
            filters.status!.includes(market.status)
          )
        }

        // Apply location filter
        if (filters.location?.city) {
          filteredMarkets = filteredMarkets.filter(market =>
            market.location.city.toLowerCase().includes(
              filters.location!.city!.toLowerCase()
            )
          )
        }

        if (filters.location?.state) {
          filteredMarkets = filteredMarkets.filter(market =>
            market.location.state.toLowerCase().includes(
              filters.location!.state!.toLowerCase()
            )
          )
        }

        // Apply accessibility filters
        if (filters.accessibility?.wheelchairAccessible) {
          filteredMarkets = filteredMarkets.filter(market =>
            market.accessibility.wheelchairAccessible
          )
        }

        if (filters.accessibility?.parkingAvailable) {
          filteredMarkets = filteredMarkets.filter(market =>
            market.accessibility.parkingAvailable
          )
        }

        if (filters.accessibility?.restroomsAvailable) {
          filteredMarkets = filteredMarkets.filter(market =>
            market.accessibility.restroomsAvailable
          )
        }

        // Apply tags filter
        if (filters.tags && filters.tags.length > 0) {
          filteredMarkets = filteredMarkets.filter(market =>
            filters.tags!.some(tag => market.tags.includes(tag))
          )
        }

        return filteredMarkets
      },

      resetStore: () => {
        set({
          markets: [],
          trackedMarketIds: [],
          isLoading: false,
          isSearching: false,
          filters: initialFilters,
          searchQuery: '',
          currentPage: 1,
          totalPages: 0,
          totalMarkets: 0,
          hasMore: false,
          error: null
        })
      }
    }),
    {
      name: 'markets-store'
    }
  )
)
