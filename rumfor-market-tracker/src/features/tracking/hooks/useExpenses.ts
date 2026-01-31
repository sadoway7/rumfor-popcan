import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trackingApi } from '../trackingApi'
import { useAuthStore } from '@/features/auth/authStore'
import { Expense, PaginatedResponse } from '@/types'

export const useExpenses = (marketId?: string) => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  // Query for expenses using TanStack Query for server state
  const queryResult = useQuery({
    queryKey: ['expenses', user?.id, marketId],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      try {
        const response = await trackingApi.getExpenses(marketId)
        return response.data || { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
      } catch (err) {
        console.error('Failed to fetch expenses:', err)
        // Return empty paginated response on error (e.g., access denied when not tracking market yet)
        return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  const paginatedData = queryResult.data as PaginatedResponse<Expense> | undefined

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) throw new Error('User not authenticated')
      return trackingApi.createExpense(expense)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] })
    },
    onError: (error) => {
      console.error('Failed to create expense:', error)
      throw error
    }
  })

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Expense> }) => {
      return trackingApi.updateExpense(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] })
    },
    onError: (error) => {
      console.error('Failed to update expense:', error)
      throw error
    }
  })

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      return trackingApi.deleteExpense(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] })
    },
    onError: (error) => {
      console.error('Failed to delete expense:', error)
      throw error
    }
  })

  // Helper functions
  const createExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    createExpenseMutation.mutate(expenseData)
  }

  const updateExpenseById = (id: string, updates: Partial<Expense>) => {
    updateExpenseMutation.mutate({ id, updates })
  }

  const deleteExpenseById = (id: string) => {
    deleteExpenseMutation.mutate(id)
  }

  return {
    // Data from TanStack Query
    expenses: paginatedData?.data || [],

    // States from TanStack Query
    isLoading: queryResult.isLoading,
    error: queryResult.error?.message || null,

    // Mutation states
    isCreating: createExpenseMutation.isPending,
    isUpdating: updateExpenseMutation.isPending,
    isDeleting: deleteExpenseMutation.isPending,

    // Actions
    createExpense,
    updateExpense: updateExpenseById,
    deleteExpense: deleteExpenseById,
    refresh: () => queryResult.refetch(),

    // Mutations
    createExpenseMutation,
    updateExpenseMutation,
    deleteExpenseMutation
  }
}

// Hook for expense summary - server state only with cache invalidation
export const useExpenseSummary = (marketId?: string) => {
  const { user } = useAuthStore()

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['expense-summary', user?.id, marketId],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      const response = await trackingApi.getExpenseSummary(marketId)
      return response.data || null
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes,
  })

  return {
    summary: data,
    isLoading,
    error: error?.message || null,
    refetch
  }
}
