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
        // Handle both old (nested) and new (correct) structure
        if (Array.isArray(response?.data)) {
          return { data: response.data, pagination: response.pagination || { page: 1, limit: 20, total: response.data.length, totalPages: 1 } }
        }
        return response || { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
      } catch (err) {
        console.error('Failed to fetch expenses:', err)
        return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const paginatedData = queryResult.data as PaginatedResponse<Expense> | undefined

  // Create expense mutation with optimistic update
  const createExpenseMutation = useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) throw new Error('User not authenticated')
      return trackingApi.createExpense(expense)
    },
    onMutate: async (newExpense) => {
      await queryClient.cancelQueries({ queryKey: ['expenses', user?.id, marketId] })
      const previous = queryClient.getQueryData<PaginatedResponse<Expense>>(['expenses', user?.id, marketId])
      const optimisticExpense: Expense = {
        ...newExpense,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Expense
      if (previous) {
        queryClient.setQueryData<PaginatedResponse<Expense>>(['expenses', user?.id, marketId], {
          ...previous,
          data: [...previous.data, optimisticExpense],
          pagination: { ...previous.pagination, total: previous.pagination.total + 1 }
        })
      }
      return { previous }
    },
    onError: (err, newExpense, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['expenses', user?.id, marketId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] })
    }
  })

  // Update expense mutation with optimistic update
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Expense> }) => {
      return trackingApi.updateExpense(id, updates)
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['expenses', user?.id, marketId] })
      const previous = queryClient.getQueryData<PaginatedResponse<Expense>>(['expenses', user?.id, marketId])
      if (previous) {
        queryClient.setQueryData<PaginatedResponse<Expense>>(['expenses', user?.id, marketId], {
          ...previous,
          data: previous.data.map(exp => exp.id === id ? { ...exp, ...updates } : exp)
        })
      }
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['expenses', user?.id, marketId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] })
    }
  })

  // Delete expense mutation with optimistic update
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      return trackingApi.deleteExpense(id)
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['expenses', user?.id, marketId] })
      const previous = queryClient.getQueryData<PaginatedResponse<Expense>>(['expenses', user?.id, marketId])
      if (previous) {
        queryClient.setQueryData<PaginatedResponse<Expense>>(['expenses', user?.id, marketId], {
          ...previous,
          data: previous.data.filter(exp => exp.id !== id),
          pagination: { ...previous.pagination, total: Math.max(0, previous.pagination.total - 1) }
        })
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['expenses', user?.id, marketId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] })
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
