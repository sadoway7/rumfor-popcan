import { Application, ApplicationStatus, ApplicationFilters, ApiResponse, PaginatedResponse } from '@/types'

// Environment configuration
const isDevelopment = typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : true
const isMockMode = typeof process !== 'undefined' ? process.env.VITE_USE_MOCK_API === 'true' : true

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api'

// API simulation delay (reduced for better UX)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// HTTP client with interceptors
class HttpClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // Add auth token if available
    const token = localStorage.getItem('auth-storage')
      ? JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token
      : null

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || 'Request failed'
        )
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

const httpClient = new HttpClient(API_BASE_URL)

// Mock data for development
const mockApplications: Application[] = [
  {
    id: '1',
    marketId: '1',
    vendorId: 'user1',
    vendor: {
      id: 'user1',
      email: 'vendor1@example.com',
      firstName: 'John',
      lastName: 'Smith',
      role: 'vendor',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      isEmailVerified: true,
      isActive: true
    },
    market: {
      id: '1',
      name: 'Downtown Farmers Market',
      description: 'A vibrant weekly farmers market featuring local produce, artisanal goods, and handmade crafts.',
      category: 'farmers-market',
      promoterId: 'promoter1',
      promoter: {
        id: 'promoter1',
        email: 'promoter1@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'promoter',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        isEmailVerified: true,
        isActive: true
      },
      location: {
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'USA'
      },
      schedule: [
        {
          id: '1',
          dayOfWeek: 6, // Saturday
          startTime: '08:00',
          endTime: '14:00',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          isRecurring: true
        }
      ],
      marketType: 'promoter-managed',
      status: 'active',
      images: ['https://picsum.photos/800/600?random=1'],
      tags: ['organic', 'local', 'fresh-produce'],
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
        website: 'https://downtownmarket.com'
      },
      applicationFields: [
        {
          id: '1',
          name: 'businessDescription',
          type: 'textarea',
          required: true,
          validation: {
            minLength: 50,
            maxLength: 500
          }
        },
        {
          id: '2',
          name: 'productCategories',
          type: 'select',
          required: true,
          options: ['produce', 'meat', 'dairy', 'bakery', 'crafts', 'art', 'other']
        }
      ],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    status: 'submitted',
    submittedData: {
      businessName: 'Smith Organic Farm',
      businessDescription: 'Family-owned organic farm specializing in heirloom tomatoes, seasonal vegetables, and fresh herbs.',
      productCategories: ['produce'],
      experience: '5+ years',
      certifications: ['Organic Certified']
    },
    customFields: {
      businessDescription: 'Family-owned organic farm specializing in heirloom tomatoes, seasonal vegetables, and fresh herbs.',
      productCategories: ['produce']
    },
    documents: [],
    notes: 'Application submitted successfully',
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    marketId: '2',
    vendorId: 'user1',
    vendor: {
      id: 'user1',
      email: 'vendor1@example.com',
      firstName: 'John',
      lastName: 'Smith',
      role: 'vendor',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      isEmailVerified: true,
      isActive: true
    },
    market: {
      id: '2',
      name: 'Artisan Craft Fair',
      description: 'Monthly craft fair featuring local artisans and their handmade creations.',
      category: 'arts-crafts',
      promoterId: 'promoter2',
      promoter: {
        id: 'promoter2',
        email: 'promoter2@example.com',
        firstName: 'Mike',
        lastName: 'Davis',
        role: 'promoter',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        isEmailVerified: true,
        isActive: true
      },
      location: {
        address: '456 Oak Ave',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        country: 'USA'
      },
      schedule: [
        {
          id: '2',
          dayOfWeek: 0, // Sunday
          startTime: '10:00',
          endTime: '16:00',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          isRecurring: true
        }
      ],
      marketType: 'promoter-managed',
      status: 'active',
      images: ['https://picsum.photos/800/600?random=2'],
      tags: ['handmade', 'local-artisans', 'crafts'],
      accessibility: {
        wheelchairAccessible: true,
        parkingAvailable: true,
        restroomsAvailable: true,
        familyFriendly: true,
        petFriendly: false
      },
      contact: {
        phone: '(555) 987-6543',
        email: 'craftfair@example.com'
      },
      applicationFields: [
        {
          id: '3',
          name: 'craftType',
          type: 'select',
          required: true,
          options: ['jewelry', 'pottery', 'woodworking', 'textiles', 'painting', 'sculpture', 'other']
        },
        {
          id: '4',
          name: 'portfolio',
          type: 'file',
          required: true
        }
      ],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    status: 'approved',
    submittedData: {
      businessName: 'Smith Organic Farm',
      businessDescription: 'Handcrafted wooden furniture and home decor made from reclaimed materials.',
      productCategories: ['woodworking'],
      experience: '3+ years',
      portfolio: ['portfolio.pdf']
    },
    customFields: {
      craftType: 'woodworking',
      portfolio: ['portfolio.pdf']
    },
    documents: [
      {
        id: 'doc1',
        name: 'portfolio.pdf',
        type: 'application/pdf',
        url: '/uploads/portfolio.pdf',
        size: 2048000,
        uploadedAt: '2025-01-10T14:20:00Z'
      }
    ],
    notes: 'Application approved - Welcome to the craft fair!',
    reviewedBy: 'promoter2',
    reviewedAt: '2025-01-12T16:45:00Z',
    createdAt: '2025-01-10T14:20:00Z',
    updatedAt: '2025-01-12T16:45:00Z'
  }
]

export const applicationsApi = {
  // Get all applications (with filters)
  async getApplications(filters?: ApplicationFilters, page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Application>>> {
    if (isDevelopment && isMockMode) {
      await delay(100) // Reduced delay for better UX

      let filteredApplications = [...mockApplications]

      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        filteredApplications = filteredApplications.filter(app =>
          filters.status!.includes(app.status)
        )
      }

      if (filters?.marketId) {
        filteredApplications = filteredApplications.filter(app =>
          app.marketId === filters.marketId
        )
      }

      if (filters?.vendorId) {
        filteredApplications = filteredApplications.filter(app =>
          app.vendorId === filters.vendorId
        )
      }

      if (filters?.search) {
        const query = filters.search.toLowerCase()
        filteredApplications = filteredApplications.filter(app =>
          app.market.name.toLowerCase().includes(query) ||
          app.vendor.firstName.toLowerCase().includes(query) ||
          app.vendor.lastName.toLowerCase().includes(query)
        )
      }

      // Apply date range filter
      if (filters?.dateRange) {
        const { start, end } = filters.dateRange
        filteredApplications = filteredApplications.filter(app => {
          const appDate = new Date(app.createdAt)
          return appDate >= new Date(start) && appDate <= new Date(end)
        })
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedApplications = filteredApplications.slice(startIndex, endIndex)

      return {
        success: true,
        data: {
          data: paginatedApplications,
          pagination: {
            page,
            limit,
            total: filteredApplications.length,
            totalPages: Math.ceil(filteredApplications.length / limit)
          }
        }
      }
    } else {
      // Real API
      const queryParams = new URLSearchParams()
      if (filters) {
        if (filters.search) queryParams.append('search', filters.search)
        if (filters.status?.length) queryParams.append('status', filters.status.join(','))
        if (filters.marketId) queryParams.append('marketId', filters.marketId)
        if (filters.vendorId) queryParams.append('vendorId', filters.vendorId)
        if (filters.dateRange?.start) queryParams.append('startDate', filters.dateRange.start)
        if (filters.dateRange?.end) queryParams.append('endDate', filters.dateRange.end)
      }
      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())

      const response = await httpClient.get<ApiResponse<PaginatedResponse<Application>>>(`/applications?${queryParams}`)
      return response
    }
  },

  // Get applications for a specific vendor
  async getMyApplications(vendorId: string): Promise<ApiResponse<Application[]>> {
    if (isDevelopment && isMockMode) {
      await delay(80)

      const myApplications = mockApplications.filter(app => app.vendorId === vendorId)

      return {
        success: true,
        data: myApplications
      }
    } else {
      const response = await httpClient.get<ApiResponse<Application[]>>(`/applications/vendor/${vendorId}`)
      return response
    }
  },

  // Get applications for a specific market (for promoters)
  async getMarketApplications(marketId: string): Promise<ApiResponse<Application[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const marketApplications = mockApplications.filter(app => app.marketId === marketId)
      
      return {
        success: true,
        data: marketApplications
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch market applications'
      }
    }
  },

  // Get single application by ID
  async getApplication(id: string): Promise<ApiResponse<Application>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const application = mockApplications.find(app => app.id === id)
      
      if (!application) {
        return {
          success: false,
          error: 'Application not found'
        }
      }
      
      return {
        success: true,
        data: application
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch application'
      }
    }
  },

  // Create new application
  async createApplication(applicationData: Partial<Application>): Promise<ApiResponse<Application>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const newApplication: Application = {
        id: Math.random().toString(36).substr(2, 9),
        marketId: applicationData.marketId!,
        vendorId: applicationData.vendorId!,
        vendor: applicationData.vendor!,
        market: applicationData.market!,
        status: 'draft',
        submittedData: applicationData.submittedData || {},
        customFields: applicationData.customFields || {},
        documents: [],
        notes: applicationData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Add to mock data
      mockApplications.push(newApplication)
      
      return {
        success: true,
        data: newApplication,
        message: 'Application created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create application'
      }
    }
  },

  // Submit application
  async submitApplication(id: string): Promise<ApiResponse<Application>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const applicationIndex = mockApplications.findIndex(app => app.id === id)
      
      if (applicationIndex === -1) {
        return {
          success: false,
          error: 'Application not found'
        }
      }
      
      mockApplications[applicationIndex].status = 'submitted'
      mockApplications[applicationIndex].updatedAt = new Date().toISOString()
      
      return {
        success: true,
        data: mockApplications[applicationIndex],
        message: 'Application submitted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to submit application'
      }
    }
  },

  // Update application status (for promoters)
  async updateApplicationStatus(id: string, status: ApplicationStatus, notes?: string): Promise<ApiResponse<Application>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const applicationIndex = mockApplications.findIndex(app => app.id === id)
      
      if (applicationIndex === -1) {
        return {
          success: false,
          error: 'Application not found'
        }
      }
      
      mockApplications[applicationIndex].status = status
      mockApplications[applicationIndex].notes = notes
      mockApplications[applicationIndex].reviewedAt = new Date().toISOString()
      mockApplications[applicationIndex].updatedAt = new Date().toISOString()
      
      return {
        success: true,
        data: mockApplications[applicationIndex],
        message: `Application ${status} successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update application status'
      }
    }
  },

  // Withdraw application (for vendors)
  async withdrawApplication(id: string): Promise<ApiResponse<Application>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const applicationIndex = mockApplications.findIndex(app => app.id === id)
      
      if (applicationIndex === -1) {
        return {
          success: false,
          error: 'Application not found'
        }
      }
      
      if (mockApplications[applicationIndex].status === 'approved') {
        return {
          success: false,
          error: 'Cannot withdraw an approved application'
        }
      }
      
      mockApplications[applicationIndex].status = 'withdrawn'
      mockApplications[applicationIndex].updatedAt = new Date().toISOString()
      
      return {
        success: true,
        data: mockApplications[applicationIndex],
        message: 'Application withdrawn successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to withdraw application'
      }
    }
  },

  // Update application
  async updateApplication(id: string, updates: Partial<Application>): Promise<ApiResponse<Application>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const applicationIndex = mockApplications.findIndex(app => app.id === id)
      
      if (applicationIndex === -1) {
        return {
          success: false,
          error: 'Application not found'
        }
      }
      
      mockApplications[applicationIndex] = {
        ...mockApplications[applicationIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      return {
        success: true,
        data: mockApplications[applicationIndex],
        message: 'Application updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update application'
      }
    }
  },

  // Delete application
  async deleteApplication(id: string): Promise<ApiResponse<void>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const applicationIndex = mockApplications.findIndex(app => app.id === id)
      
      if (applicationIndex === -1) {
        return {
          success: false,
          error: 'Application not found'
        }
      }
      
      mockApplications.splice(applicationIndex, 1)
      
      return {
        success: true,
        message: 'Application deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete application'
      }
    }
  },

  // Bulk update application status (for promoters)
  async bulkUpdateStatus(ids: string[], status: ApplicationStatus, notes?: string): Promise<ApiResponse<Application[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedApplications: Application[] = []
      
      for (const id of ids) {
        const applicationIndex = mockApplications.findIndex(app => app.id === id)
        
        if (applicationIndex !== -1) {
          mockApplications[applicationIndex].status = status
          mockApplications[applicationIndex].notes = notes
          mockApplications[applicationIndex].reviewedAt = new Date().toISOString()
          mockApplications[applicationIndex].updatedAt = new Date().toISOString()
          
          updatedApplications.push(mockApplications[applicationIndex])
        }
      }
      
      return {
        success: true,
        data: updatedApplications,
        message: `${updatedApplications.length} applications ${status} successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update applications'
      }
    }
  }
}