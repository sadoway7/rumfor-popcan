import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorsApi, type VendorFilters } from '../vendorsApi'
import type { VendorProfileUpdateData } from '@/types'

// Query key factories
const VENDORS_KEYS = {
  all: ['vendors'] as const,
  lists: () => [...VENDORS_KEYS.all, 'list'] as const,
  list: (filters: VendorFilters, page: number, limit: number) =>
    [...VENDORS_KEYS.lists(), filters, page, limit] as const,
  profiles: () => [...VENDORS_KEYS.all, 'profile'] as const,
  profile: (id: string) => [...VENDORS_KEYS.profiles(), id] as const,
}

/**
 * Hook for fetching a paginated list of vendors
 */
export const useVendors = (
  filters: VendorFilters = {},
  page = 1,
  limit = 20
) => {
  const query = useQuery({
    queryKey: VENDORS_KEYS.list(filters, page, limit),
    queryFn: () => vendorsApi.getVendors(filters, page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
  })

  return {
    vendors: query.data?.data?.vendors || [],
    pagination: query.data?.data?.pagination || null,
    isLoading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  }
}

/**
 * Hook for fetching a single vendor's public profile
 */
export const useVendorProfile = (id: string) => {
  const query = useQuery({
    queryKey: VENDORS_KEYS.profile(id),
    queryFn: () => vendorsApi.getVendorProfile(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })

  return {
    vendor: query.data?.data?.vendor || null,
    isLoading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  }
}

/**
 * Mutation hook for updating vendor profile
 */
export const useUpdateVendorProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VendorProfileUpdateData }) =>
      vendorsApi.updateVendorProfile(id, data),
    onSuccess: (_result, variables) => {
      // Invalidate both the vendor profile and the vendor list
      queryClient.invalidateQueries({ queryKey: VENDORS_KEYS.profile(variables.id) })
      queryClient.invalidateQueries({ queryKey: VENDORS_KEYS.lists() })
      // Also invalidate market vendors since vendor card data may have changed
      queryClient.invalidateQueries({ queryKey: ['market-vendors'] })
    },
  })
}

/**
 * Mutation hook for uploading vendor avatar
 */
export const useUploadVendorAvatarMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      vendorsApi.uploadVendorAvatar(id, file),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: VENDORS_KEYS.profile(variables.id) })
      queryClient.invalidateQueries({ queryKey: VENDORS_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ['market-vendors'] })
    },
  })
}
