import { Market, MarketFilters, PaginatedResponse, ApiResponse } from '@/types'

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
    images: [
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
    ],
    tags: ['organic', 'local', 'fresh-produce', 'handmade'],
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
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800'
    ],
    tags: ['handmade', 'art', 'crafts', 'local-artists'],
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
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'
    ],
    tags: ['vintage', 'antiques', 'collectibles', 'second-hand'],
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
    applicationFields: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// API simulation delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const marketsApi = {
  // Get all markets with optional filtering
  async getMarkets(filters?: MarketFilters, page = 1, limit = 20): Promise<PaginatedResponse<Market>> {
    await delay(500) // Simulate network delay

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
  },

  // Get market by ID
  async getMarketById(id: string): Promise<ApiResponse<Market>> {
    await delay(300)

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
  },

  // Search markets
  async searchMarkets(query: string): Promise<ApiResponse<Market[]>> {
    await delay(400)

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
  },

  // Get popular markets
  async getPopularMarkets(limit = 10): Promise<ApiResponse<Market[]>> {
    await delay(300)

    // For now, just return first few markets as "popular"
    const popular = mockMarkets.slice(0, limit)

    return {
      success: true,
      data: popular
    }
  },

  // Get markets by category
  async getMarketsByCategory(category: string): Promise<ApiResponse<Market[]>> {
    await delay(300)

    const results = mockMarkets.filter(market => market.category === category)

    return {
      success: true,
      data: results
    }
  },

  // Track/untrack market (mock implementation)
  async trackMarket(_marketId: string): Promise<ApiResponse<{ tracked: boolean }>> {
    await delay(200)

    // In real app, this would make API call
    return {
      success: true,
      data: { tracked: true }
    }
  },

  async untrackMarket(_marketId: string): Promise<ApiResponse<{ tracked: boolean }>> {
    await delay(200)

    return {
      success: true,
      data: { tracked: false }
    }
  }
}
