import { Market, MarketFilters, PaginatedResponse, ApiResponse } from '@/types'
import { httpClient } from '@/lib/httpClient'

// Environment configuration
const isDevelopment = import.meta.env.DEV
const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true'

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
        endDate: '2024-12-31',
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
      petFriendly: true
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
        endDate: '2024-12-31',
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
      petFriendly: false
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
        endDate: '2024-12-31',
        isRecurring: true
      },
      {
        id: '4',
        dayOfWeek: 0,
        startTime: '06:00',
        endTime: '16:00',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
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
      petFriendly: true
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

      return {
        data: paginatedMarkets,
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
      if (filters) {
        if (filters.search) queryParams.append('search', filters.search)
        if (filters.status?.length) queryParams.append('status', filters.status[0]) // Backend expects single status
        if (filters.category?.length) queryParams.append('category', filters.category[0]) // Backend expects single category
        // Combine city and state for location parameter
        if (filters.location?.city || filters.location?.state) {
          const locationParts = []
          if (filters.location.city) locationParts.push(filters.location.city)
          if (filters.location.state) locationParts.push(filters.location.state)
          queryParams.append('location', locationParts.join(' '))
        }
      }
      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())

      const response = await httpClient.get<ApiResponse<any>>(`/markets?${queryParams}`)
      if (!response.success) throw new Error(response.error || 'Failed to fetch markets')

      // Backend serializer now handles transformation
      return {
        data: response.data!.markets as Market[],
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
        data: market
      }
    } else {
      const response = await httpClient.get<ApiResponse<any>>(`/markets/${id}`)
      if (!response.success) throw new Error(response.error || 'Failed to fetch market')
      
      // Backend serializer now handles transformation
      return {
        success: true,
        data: response.data.market as Market
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
        updatedAt: new Date().toISOString()
      }

      // Simulate market creation with ID generation
      return {
        success: true,
        data: newMarket
      }
    } else {
      const response = await httpClient.post<ApiResponse<Market>>('/markets', marketData)
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
  async trackMarket(marketId: string, status?: string): Promise<ApiResponse<{ tracked: boolean }>> {
    if (isDevelopment && isMockMode) {
      await delay(100)

      console.log('Tracking market:', marketId, 'with status:', status || 'interested')
      // Simulate tracking action
      return {
        success: true,
        data: { tracked: true }
      }
    } else {
      const body = status ? { status } : {}
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
      console.log('[TRACKED MARKETS API] Tracking array:', backendData.tracking)

      return backendData.tracking
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
