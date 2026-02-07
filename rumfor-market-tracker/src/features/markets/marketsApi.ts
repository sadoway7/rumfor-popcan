import { Market, MarketFilters, PaginatedResponse, ApiResponse } from '@/types'
import { httpClient } from '@/lib/httpClient'
import { parseLocalDate } from '@/utils/formatDate'

// Environment configuration
const isDevelopment = import.meta.env.DEV
const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true'

function transformScheduleToArray(schedule: any): any[] {
  if (!schedule) return []
  if (Array.isArray(schedule)) return schedule
  
  // First, check if there are specialDates and use those
  if (schedule.specialDates && Array.isArray(schedule.specialDates) && schedule.specialDates.length > 0) {
    return schedule.specialDates.map((s: any, index: number) => ({
      id: `schedule-${index}`,
      dayOfWeek: new Date(s.date).getDay(),
      startTime: s.startTime || schedule.startTime || '08:00',
      endTime: s.endTime || schedule.endTime || '14:00',
      startDate: s.date,
      endDate: s.date,
      isRecurring: false
    }))
  }
  
  // Convert from BackendScheduleFormat to array format
  // For vendor-created markets with multiple dates, expand the season to individual dates
  if (schedule.seasonStart && schedule.seasonEnd) {
    const start = parseLocalDate(schedule.seasonStart)
    const end = parseLocalDate(schedule.seasonEnd)
    const dates: any[] = []
    let current = new Date(start)
    
    // Map dayOfWeek from daysOfWeek array
    const dayOfWeekMap: { [key: string]: number } = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    }
    const targetDays = schedule.daysOfWeek?.map((d: string) => dayOfWeekMap[d.toLowerCase()]) || [6]
    
    // Generate a schedule entry for each day in the season
    while (current <= end) {
      if (targetDays.includes(current.getDay())) {
        dates.push({
          id: `schedule-${current.toISOString().split('T')[0]}`,
          dayOfWeek: current.getDay(),
          startTime: schedule.startTime || '08:00',
          endTime: schedule.endTime || '14:00',
          startDate: current.toISOString().split('T')[0],
          endDate: current.toISOString().split('T')[0],
          isRecurring: schedule.recurring || false
        })
      }
      current.setDate(current.getDate() + 1)
    }
    
    return dates.length > 0 ? dates : [{
      id: 'schedule-default',
      dayOfWeek: 6,
      startTime: schedule.startTime || '08:00',
      endTime: schedule.endTime || '14:00',
      startDate: schedule.seasonStart,
      endDate: schedule.seasonEnd,
      isRecurring: schedule.recurring || false
    }]
  }
  
  return [{
    id: 'schedule-default',
    dayOfWeek: 6,
    startTime: schedule.startTime || '08:00',
    endTime: schedule.endTime || '14:00',
    startDate: schedule.seasonStart || new Date().toISOString().split('T')[0],
    endDate: schedule.seasonEnd || new Date().toISOString().split('T')[0],
    isRecurring: schedule.recurring || false
  }]
}

// Mock data for development
const mockMarkets: Market[] = [
  {
    id: '1',
    name: 'Downtown Farmers Market',
    description: 'Fresh local produce, artisanal foods, and handmade crafts from local vendors.',
    category: 'farmers-market',
    promoterId: 'promoter-1',
    promoter: {
      id: 'promoter-1',
      email: 'sarah@market.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'promoter',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isEmailVerified: true,
      isActive: true
    },
    location: {
      address: '123 Main St',
      city: 'Downtown',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
      latitude: 34.0522,
      longitude: -118.2437
    },
    schedule: [
      {
        id: '1',
        dayOfWeek: 6,
        startTime: '08:00',
        endTime: '14:00',
        startDate: '2024-01-01',
        endDate: '2026-12-31',
        isRecurring: true
      }
    ],
    status: 'active',
    marketType: 'promoter-managed',
    images: [
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
    ],
    tags: ['local-produce', 'fresh-produce', 'organic', 'handmade'],
    accessibility: {
      wheelchairAccessible: true,
      parkingAvailable: true,
      restroomsAvailable: true,
      familyFriendly: true,
      petFriendly: true,
      covered: false,
      indoor: false,
      outdoorSeating: true,
      wifi: false,
      atm: false,
      foodCourt: false,
      liveMusic: false,
      handicapParking: false,
      alcoholAvailable: false
    },
    contact: {
      phone: '(555) 123-4567',
      email: 'info@downtownmarket.com',
      website: 'https://downtownmarket.com',
      socialMedia: {
        facebook: 'https://facebook.com/downtownmarket',
        instagram: 'https://instagram.com/downtownmarket'
      }
    },
    applicationFields: [],
    applicationsEnabled: false,
    stats: {
      viewCount: 1000,
      favoriteCount: 150,
      applicationCount: 30,
      commentCount: 20,
      rating: 4.6,
      reviewCount: 12
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Artisan Craft Fair',
    description: 'Local artisans showcasing handmade jewelry, pottery, textiles, and fine art.',
    category: 'arts-crafts',
    promoterId: 'promoter-2',
    promoter: {
      id: 'promoter-2',
      email: 'mike@crafts.com',
      firstName: 'Mike',
      lastName: 'Chen',
      role: 'promoter',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isEmailVerified: true,
      isActive: true
    },
    location: {
      address: '456 Art District Ave',
      city: 'Art District',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      latitude: 40.7128,
      longitude: -74.0060
    },
    schedule: [
      {
        id: '2',
        dayOfWeek: 0,
        startTime: '10:00',
        endTime: '18:00',
        startDate: '2024-01-01',
        endDate: '2026-12-31',
        isRecurring: true
      }
    ],
    status: 'active',
    marketType: 'promoter-managed',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800'
    ],
    tags: ['handmade', 'local-artisans', 'crafts', 'fine-art'],
    accessibility: {
      wheelchairAccessible: true,
      parkingAvailable: false,
      restroomsAvailable: true,
      familyFriendly: true,
      petFriendly: false,
      covered: true,
      indoor: true,
      outdoorSeating: false,
      wifi: false,
      atm: true,
      foodCourt: false,
      liveMusic: false,
      handicapParking: false,
      alcoholAvailable: false
    },
    contact: {
      phone: '(555) 987-6543',
      email: 'info@artisanfair.com',
      socialMedia: {
        instagram: 'https://instagram.com/artisanfair'
      }
    },
    applicationsEnabled: true,
    stats: {
      viewCount: 1500,
      favoriteCount: 250,
      applicationCount: 45,
      commentCount: 32,
      rating: 4.7,
      reviewCount: 18
    },
    applicationFields: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Weekend Flea Market',
    description: 'Vintage treasures, antiques, collectibles, and unique finds from local sellers.',
    category: 'flea-market',
    promoterId: 'promoter-3',
    promoter: {
      id: 'promoter-3',
      email: 'lisa@fleamarket.com',
      firstName: 'Lisa',
      lastName: 'Williams',
      role: 'promoter',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isEmailVerified: true,
      isActive: true
    },
    location: {
      address: '789 Weekend Plaza',
      city: 'Marketville',
      state: 'TX',
      zipCode: '75001',
      country: 'USA',
      latitude: 32.7767,
      longitude: -96.7970
    },
    schedule: [
      {
        id: '3',
        dayOfWeek: 6,
        startTime: '06:00',
        endTime: '16:00',
        startDate: '2024-01-01',
        endDate: '2026-12-31',
        isRecurring: true
      },
      {
        id: '4',
        dayOfWeek: 0,
        startTime: '06:00',
        endTime: '16:00',
        startDate: '2024-01-01',
        endDate: '2026-12-31',
        isRecurring: true
      }
    ],
    status: 'active',
    marketType: 'promoter-managed',
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'
    ],
    tags: ['vintage', 'antiques', 'collectibles', 'secondhand'],
    accessibility: {
      wheelchairAccessible: false,
      parkingAvailable: true,
      restroomsAvailable: true,
      familyFriendly: true,
      petFriendly: true,
      covered: true,
      indoor: false,
      outdoorSeating: false,
      wifi: false,
      atm: true,
      foodCourt: true,
      liveMusic: false,
      handicapParking: false,
      alcoholAvailable: false
    },
    contact: {
      phone: '(555) 456-7890',
      email: 'info@weekendflea.com'
    },
    applicationsEnabled: false,
    stats: {
      viewCount: 420,
      favoriteCount: 65,
      applicationCount: 12,
      commentCount: 8,
      rating: 4.2,
      reviewCount: 4
    },
    applicationFields: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// API simulation delay (reduced for better UX)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))



export const marketsApi = {
  // Get all markets with optional filtering
  async getMarkets(filters?: MarketFilters, page = 1, limit = 20): Promise<PaginatedResponse<Market>> {
    if (isDevelopment && isMockMode) {
      await delay(100) // Reduced delay for better UX

      let filteredMarkets = [...mockMarkets]

      // Apply filters (same logic as store)
      if (filters) {
        if (filters.category && filters.category.length > 0) {
          filteredMarkets = filteredMarkets.filter(market =>
            filters.category!.includes(market.category)
          )
        }

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

        if (filters.status && filters.status.length > 0) {
          filteredMarkets = filteredMarkets.filter(market =>
            filters.status!.includes(market.status)
          )
        }

        if (filters.accessibility?.wheelchairAccessible) {
          filteredMarkets = filteredMarkets.filter(market =>
            market.accessibility.wheelchairAccessible
          )
        }

        if (filters.search) {
          const query = filters.search.toLowerCase()
          filteredMarkets = filteredMarkets.filter(market =>
            market.name.toLowerCase().includes(query) ||
            market.description.toLowerCase().includes(query) ||
            market.location.city.toLowerCase().includes(query) ||
            market.tags.some(tag => tag.toLowerCase().includes(query))
          )
        }
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedMarkets = filteredMarkets.slice(startIndex, endIndex)
      
      // Transform schedule format for each market
      const transformedMarkets = paginatedMarkets.map(market => ({
        ...market,
        schedule: transformScheduleToArray(market.schedule)
      }))

      return {
        data: transformedMarkets,
        pagination: {
          page,
          limit,
          total: filteredMarkets.length,
          totalPages: Math.ceil(filteredMarkets.length / limit)
        }
      }
    } else {
      // Real API with mapping from backend to frontend format
      const queryParams = new URLSearchParams()
      // When sorting, fetch more results for client-side sorting
      const effectiveLimit = (filters?.sortBy) ? 500 : limit
      if (filters) {
        if (filters.search) queryParams.append('search', filters.search)
        if (filters.status?.length) queryParams.append('status', filters.status[0])
        if (filters.category?.length) queryParams.append('category', filters.category[0])
        if (filters.location?.city || filters.location?.state) {
          const locationParts = []
          if (filters.location.city) locationParts.push(filters.location.city)
          if (filters.location.state) locationParts.push(filters.location.state)
          queryParams.append('location', locationParts.join(' '))
        }
        // When sorting is enabled, don't send sort params to API - fetch unsorted data
        // and let client-side sorting handle it (we fetch 500 records for this purpose)
        if (filters.sortBy) {
          // Fetch more results for client-side sorting, but don't send sort params to backend
          // The client-side sorting in useMarkets.ts handles the actual sorting
        } else {
          // Map frontend sortBy to backend field names for server-side sorting (only when not using client-side sorting)
          const sortByMap: Record<string, string> = {
            'date-newest': 'createdAt',
            'date-oldest': 'createdAt',
            'name-asc': 'name',
            'name-desc': 'name',
            popularity: 'stats.viewCount'
          }
          if (filters.sortBy) queryParams.append('sortBy', sortByMap[filters.sortBy] || filters.sortBy)
          if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder)
        }
      }
      queryParams.append('page', '1')
      queryParams.append('limit', effectiveLimit.toString())

      const response = await httpClient.get<ApiResponse<any>>(`/markets?${queryParams}`)
      console.log('[getMarkets] Backend response:', response)
      if (!response.success) throw new Error(response.error || 'Failed to fetch markets')

      // Backend serializer now handles transformation
      console.log('[getMarkets] markets from backend:', response.data!.markets)
      
      // Transform schedule format for each market
      const transformedMarkets = (response.data!.markets as any[]).map(market => ({
        ...market,
        schedule: transformScheduleToArray(market.schedule)
      }))
      
      return {
        data: transformedMarkets,
        pagination: response.data!.pagination
      }
    }
  },

  // Get market by ID
  async getMarketById(id: string): Promise<ApiResponse<Market>> {
    if (isDevelopment && isMockMode) {
      await delay(80)

      const market = mockMarkets.find(m => m.id === id)

      if (!market) {
        return {
          success: false,
          error: 'Market not found'
        }
      }

      return {
        success: true,
        data: {
          ...market,
          schedule: transformScheduleToArray(market.schedule)
        }
      }
    } else {
      const response = await httpClient.get<ApiResponse<any>>(`/markets/${id}`)
      if (!response.success) throw new Error(response.error || 'Failed to fetch market')
      
      // Transform schedule format
      const transformedMarket = {
        ...response.data.market,
        schedule: transformScheduleToArray(response.data.market.schedule)
      }
      
      return {
        success: true,
        data: transformedMarket as Market
      }
    }
  },

  // Search markets
  async searchMarkets(query: string): Promise<ApiResponse<Market[]>> {
    if (isDevelopment && isMockMode) {
      await delay(150)

      if (!query.trim()) {
        return {
          success: true,
          data: []
        }
      }

      const searchTerm = query.toLowerCase()
      const results = mockMarkets.filter(market =>
        market.name.toLowerCase().includes(searchTerm) ||
        market.description.toLowerCase().includes(searchTerm) ||
        market.location.city.toLowerCase().includes(searchTerm) ||
        market.location.state.toLowerCase().includes(searchTerm) ||
        market.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )

      return {
        success: true,
        data: results
      }
    } else {
      const response = await httpClient.get<ApiResponse<Market[]>>(`/markets/search?q=${encodeURIComponent(query)}`)
      if (!response.success) throw new Error(response.error || 'Failed to search markets')
      return response
    }
  },

  // Search markets for name suggestions (future markets only)
  async searchMarketSuggestions(query: string): Promise<ApiResponse<Market[]>> {
    if (isDevelopment && isMockMode) {
      await delay(150)

      if (!query.trim()) {
        return { success: true, data: [] }
      }

      const searchTerm = query.toLowerCase()
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0] // "2026-02-07"
      
      const results = mockMarkets.filter(market => {
        const matchesName = market.name.toLowerCase().includes(searchTerm)
        
        // Filter for future markets - show if ANY date is >= today
        let hasFutureDate = false
        
        if (market.schedule) {
          // Check seasonEnd
          if (typeof market.schedule === 'object' && 'seasonEnd' in market.schedule) {
            const seasonEnd = (market.schedule as any).seasonEnd
            if (seasonEnd && seasonEnd >= todayStr) {
              hasFutureDate = true
            }
          }
          
          // Check specialDates array
          if (typeof market.schedule === 'object' && 'specialDates' in market.schedule) {
            const specialDates = (market.schedule as any).specialDates
            if (Array.isArray(specialDates) && specialDates.length > 0) {
              const hasFutureSpecialDate = specialDates.some((sd: any) => {
                const date = sd.date || sd.startDate
                return date >= todayStr
              })
              if (hasFutureSpecialDate) {
                hasFutureDate = true
              }
            }
          }
          
          // Legacy array format - check each schedule item
          if (Array.isArray(market.schedule) && market.schedule.length > 0) {
            const hasFutureSchedule = market.schedule.some((s: any) => {
              const date = s.endDate || s.startDate
              return date >= todayStr
            })
            if (hasFutureSchedule) {
              hasFutureDate = true
            }
          }
        }
        
        return matchesName && hasFutureDate
      }).slice(0, 10)

      return { success: true, data: results }
    } else {
      const response = await httpClient.get<any>(
        `/markets/search?q=${encodeURIComponent(query)}&futureOnly=true&limit=10&sortBy=name&sortOrder=asc`
      )
      if (!response.success) throw new Error(response.error || 'Failed to search markets')
      // Real API returns {markets: [...], pagination: {...}} so extract markets
      return { success: true, data: response.data?.markets || [] }
    }
  },

  // Get popular markets
  async getPopularMarkets(limit = 10): Promise<ApiResponse<Market[]>> {
    if (isDevelopment && isMockMode) {
      await delay(80)

      // For now, just return first few markets as "popular"
      const popular = mockMarkets.slice(0, limit)

      return {
        success: true,
        data: popular
      }
    } else {
      const response = await httpClient.get<ApiResponse<Market[]>>(`/markets/popular?limit=${limit}`)
      if (!response.success) throw new Error(response.error || 'Failed to fetch popular markets')
      return response
    }
  },

  // Get markets by category
  async getMarketsByCategory(category: string): Promise<ApiResponse<Market[]>> {
    if (isDevelopment && isMockMode) {
      await delay(80)

      const results = mockMarkets.filter(market => market.category === category)

      return {
        success: true,
        data: results
      }
    } else {
      const response = await httpClient.get<ApiResponse<Market[]>>(`/markets/category/${category}`)
      if (!response.success) throw new Error(response.error || 'Failed to fetch markets by category')
      return response
    }
  },

// Create new market
  async createMarket(marketData: Omit<Market, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Market>> {
    if (isDevelopment && isMockMode) {
      await delay(800)

      const newMarket: Market = {
        ...marketData,
        id: `market-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        schedule: transformScheduleToArray(marketData.schedule)
      }

      console.log('[createMarket] Mock created market:', newMarket)

      // Add to mockMarkets so it shows up in listings
      mockMarkets.unshift(newMarket)

      return {
        success: true,
        data: newMarket
      }
    } else {
      console.log('[createMarket] Sending to backend:', marketData)
      const response = await httpClient.post<ApiResponse<Market>>('/markets', marketData)
      console.log('[createMarket] Backend response:', response)
      if (!response.success) throw new Error(response.error || 'Failed to create market')
      return response
    }
  },

  // Update existing market
  async updateMarket(marketId: string, marketData: Partial<Omit<Market, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<Market>> {
    if (isDevelopment && isMockMode) {
      await delay(800)

      // Simulate market update
      return {
        success: true,
        data: {
          id: marketId,
          ...marketData,
          updatedAt: new Date().toISOString()
        } as Market
      }
    } else {
      const response = await httpClient.put<ApiResponse<Market>>(`/markets/${marketId}`, marketData)
      if (!response.success) throw new Error(response.error || 'Failed to update market')
      return response
    }
  },

// Track/untrack market (mock implementation)
  async trackMarket(marketId: string, status?: string, attendingDates?: string[]): Promise<ApiResponse<{ tracked: boolean }>> {
    if (isDevelopment && isMockMode) {
      await delay(100)

      console.log('Tracking market:', marketId, 'with status:', status || 'interested', 'attendingDates:', attendingDates)
      // Simulate tracking action
      return {
        success: true,
        data: { tracked: true }
      }
    } else {
      const body: any = status ? { status } : {}
      if (attendingDates && attendingDates.length > 0) {
        body.attendingDates = attendingDates
      }
      const response = await httpClient.post<ApiResponse<{ tracked: boolean }>>(`/markets/${marketId}/track`, body)
      if (!response.success) throw new Error(response.error || 'Failed to track market')
      return response
    }
  },

  async untrackMarket(marketId: string): Promise<ApiResponse<{ tracked: boolean }>> {
    if (isDevelopment && isMockMode) {
      await delay(100)

      console.log('Untracking market:', marketId)
      return {
        success: true,
        data: { tracked: false }
      }
    } else {
      const response = await httpClient.delete<ApiResponse<{ tracked: boolean }>>(`/markets/${marketId}/track`)
      if (!response.success) throw new Error(response.error || 'Failed to untrack market')
      return response
    }
  },

  // Get user's tracked markets
  async getUserTrackedMarkets(userId: string): Promise<any> {
    if (isDevelopment && isMockMode) {
      await delay(300)

      // Simulate user-specific tracked markets based on user ID patterns
      const trackedMarkets = mockMarkets.filter(market => {
        // Mock: simulate user tracking certain markets based on user ID
        // Different user IDs will track different markets for demo purposes
        if (userId === 'current-user-id' || userId === 'user-1') {
          return market.id === '1' || market.id === '2'
        }
        // Default behavior for other users
        return market.id === '1'
      })

      // Return tracking objects, not just markets
      return trackedMarkets.map(market => ({
        _id: 'tracking-' + market.id,
        user: userId,
        market: market,
        status: 'interested',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    } else {
      const response = await httpClient.get<ApiResponse<any>>(`/markets/my/markets`)
      console.log('[TRACKED MARKETS API] Response:', response)
      if (!response.success) throw new Error(response.error || 'Failed to fetch tracked markets')

      // Return the tracking array directly - it contains both tracking and market data
      const backendData = response.data!
      console.log('[TRACKED MARKETS API] Backend data:', backendData)
      console.log('[TRACKED MARKETS API] Tracking array:', backendData.markets)

      return backendData.markets
    }
  },

  // Get approved/attending vendors for a market
  async getMarketVendors(marketId: string): Promise<ApiResponse<{ vendors: any[]; market: { id: string; name: string } }>> {
    if (isDevelopment && isMockMode) {
      await delay(100)

      // Mock vendors
      const vendors = [
        {
          user: {
            id: 'user-1',
            username: 'johnvendor',
            firstName: 'John',
            lastName: 'Smith',
            role: 'vendor'
          },
          status: 'approved',
          joinedAt: '2024-01-01T00:00:00Z'
        }
      ]

      return {
        success: true,
        data: {
          vendors,
          market: { id: marketId, name: 'Mock Market' }
        }
      }
    } else {
      const response = await httpClient.get<ApiResponse<{ vendors: any[]; market: { id: string; name: string } }>>(`/markets/${marketId}/vendors`)
      if (!response.success) throw new Error(response.error || 'Failed to fetch market vendors')
      return response
    }
  }
}
