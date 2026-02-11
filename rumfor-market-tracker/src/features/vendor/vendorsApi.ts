import { httpClient } from '@/lib/httpClient'
import type { ApiResponse, VendorCardData, VendorPublicProfile, VendorProfileUpdateData } from '@/types'

interface VendorsListResponse {
  success: boolean
  data: {
    vendors: VendorCardData[]
    pagination: {
      current: number
      pages: number
      total: number
      limit: number
    }
  }
}

interface VendorProfileResponse {
  success: boolean
  data: {
    vendor: VendorPublicProfile
  }
}

interface VendorUpdateResponse {
  success: boolean
  data: {
    vendor: VendorCardData
  }
}

export interface VendorFilters {
  search?: string
  category?: string
  sortBy?: 'createdAt' | 'businessName' | 'firstName'
  sortOrder?: 'asc' | 'desc'
}

export const vendorsApi = {
  /**
   * List/search vendors (public)
   */
  getVendors: async (
    filters: VendorFilters = {},
    page = 1,
    limit = 20
  ): Promise<VendorsListResponse> => {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    }

    if (filters.search) params.search = filters.search
    if (filters.category) params.category = filters.category
    if (filters.sortBy) params.sortBy = filters.sortBy
    if (filters.sortOrder) params.sortOrder = filters.sortOrder

    return httpClient.get<VendorsListResponse>('/vendors', params)
  },

  /**
   * Get a single vendor's public profile
   */
  getVendorProfile: async (id: string): Promise<VendorProfileResponse> => {
    return httpClient.get<VendorProfileResponse>(`/vendors/${id}/profile`)
  },

  /**
   * Update vendor profile (authenticated, vendor only)
   */
  updateVendorProfile: async (
    id: string,
    data: VendorProfileUpdateData
  ): Promise<VendorUpdateResponse> => {
    return httpClient.patch<VendorUpdateResponse>(`/vendors/${id}/profile`, data)
  },

  /**
   * Upload vendor avatar (authenticated, vendor only)
   */
  uploadVendorAvatar: async (
    id: string,
    file: File
  ): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData()
    formData.append('avatar', file)
    return httpClient.upload<ApiResponse<{ url: string }>>(`/vendors/${id}/avatar`, formData)
  },
}
