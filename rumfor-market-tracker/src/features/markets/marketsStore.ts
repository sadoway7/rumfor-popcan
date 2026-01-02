import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Market, MarketFilters } from '@/types'

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
  
  // Error handling
  error: string | null
  
  // Actions
  setMarkets: (markets: Market[]) => void
  addMarket: (market: Market) => void
  updateMarket: (id: string, updates: Partial<Market>) => void
  removeMarket: (id: string) => void
  
  // Search and filter actions
  setSearchQuery: (query: string) => void
  setFilters: (filters: MarketFilters) => void
  clearFilters: () => void
  applyFilters: () => Market[]
  
  // Tracking actions
  trackMarket: (marketId: string) => void
  untrackMarket: (marketId: string) => void
  isMarketTracked: (marketId: string) => boolean
  
  // Pagination actions
  setCurrentPage: (page: number) => void
  setHasMore: (hasMore: boolean) => void
  
  // Loading and error actions
  setLoading: (loading: boolean) => void
  setSearching: (searching: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Utility actions
  getMarketById: (id: string) => Market | undefined
  getFilteredMarkets: () => Market[]
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
      hasMore: false,
      error: null,

      // Market actions
      setMarkets: (markets) => set({ markets }),
      
      addMarket: (market) => set((state) => ({
        markets: [market, ...state.markets]
      })),
      
      updateMarket: (id, updates) => set((state) => ({
        markets: state.markets.map(market => 
          market.id === id ? { ...market, ...updates } : market
        )
      })),
      
      removeMarket: (id) => set((state) => ({
        markets: state.markets.filter(market => market.id !== id)
      })),

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
      trackMarket: (marketId) => set((state) => ({
        trackedMarketIds: [...state.trackedMarketIds, marketId]
      })),
      
      untrackMarket: (marketId) => set((state) => ({
        trackedMarketIds: state.trackedMarketIds.filter(id => id !== marketId)
      })),
      
      isMarketTracked: (marketId) => {
        const { trackedMarketIds } = get()
        return trackedMarketIds.includes(marketId)
      },

      // Pagination actions
      setCurrentPage: (page) => set({ currentPage: page }),
      setHasMore: (hasMore) => set({ hasMore }),

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
        return get().applyFilters()
      }
    }),
    {
      name: 'markets-store'
    }
  )
)
