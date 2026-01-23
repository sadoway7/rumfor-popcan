import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { presetApi } from '../presetApi'
import { useAuthStore } from '@/features/auth/authStore'

export const useTodoPresets = (category?: string) => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  // Query for presets
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['presets', user?.id, category],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      if (category) {
        const response = await presetApi.getPresetsByCategory(category)
        return response.data
      }
      const response = await presetApi.getPresets()
      return response.data
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Create preset mutation
  const createPresetMutation = useMutation({
    mutationFn: async (data: Parameters<typeof presetApi.createPreset>[0]) => {
      if (!user?.id) throw new Error('User not authenticated')
      return presetApi.createPreset(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] })
    },
    onError: (error: any) => {
      console.error('Failed to create preset:', error)
      throw error
    }
  })

  // Delete preset mutation
  const deletePresetMutation = useMutation({
    mutationFn: async (id: string) => {
      return presetApi.deletePreset(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] })
    },
    onError: (error: any) => {
      console.error('Failed to delete preset:', error)
      throw error
    }
  })

  // Create todo from preset mutation
  const createTodoFromPresetMutation = useMutation({
    mutationFn: async ({ presetId, marketId, customizations }: {
      presetId: string
      marketId: string
      customizations?: any
    }) => {
      return presetApi.createTodoFromPreset(presetId, marketId, customizations)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onError: (error: any) => {
      console.error('Failed to create todo from preset:', error)
      throw error
    }
  })

  return {
    // Data
    presets: data,
    isLoading,
    error: error?.message || null,

    // Mutation states
    isCreating: createPresetMutation.isPending,
    isDeleting: deletePresetMutation.isPending,
    isCreatingTodo: createTodoFromPresetMutation.isPending,

    // Actions
    createPreset: createPresetMutation.mutateAsync,
    deletePreset: deletePresetMutation.mutateAsync,
    createTodoFromPreset: createTodoFromPresetMutation.mutateAsync,
    refresh: refetch,

    // Mutations
    createPresetMutation,
    deletePresetMutation,
    createTodoFromPresetMutation
  }
}
