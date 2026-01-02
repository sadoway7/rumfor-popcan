import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trackingApi } from '../trackingApi'
import { useTrackingStore } from '../trackingStore'
import { useAuthStore } from '@/features/auth/authStore'
import { Expense } from '@/types'

export const useExpenses = (marketId?: string) => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const {
    expenses,
    isLoadingExpenses,
    expensesError,
    setExpenses,
    setLoadingExpenses,
    setExpensesError,
    addExpense,
    updateExpense,
    removeExpense
  } = useTrackingStore()

  // Query for expenses
  const {
    data,
    isLoading: isQueryLoading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['expenses', user?.id, marketId],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      const response = await trackingApi.getExpenses(user.id, marketId)
      return response.data
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Update store when query data changes
  React.useEffect(() => {
    if (data) {
      setExpenses(data)
    }
  }, [data, setExpenses])

  // Sync loading states
  React.useEffect(() => {
    setLoadingExpenses(isQueryLoading)
  }, [isQueryLoading, setLoadingExpenses])

  // Sync error states
  React.useEffect(() => {
    setExpensesError(queryError?.message || null)
  }, [queryError, setExpensesError])

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) throw new Error('User not authenticated')
      return trackingApi.createExpense(expense)
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        addExpense(response.data)
        queryClient.invalidateQueries({ queryKey: ['expenses'] })
        queryClient.invalidateQueries({ queryKey: ['expense-summary'] })
      }
    },
    onError: (error) => {
      console.error('Failed to create expense:', error)
      setExpensesError('Failed to create expense')
    }
  })

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Expense> }) => {
      return trackingApi.updateExpense(id, updates)
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        updateExpense(response.data.id, response.data)
        queryClient.invalidateQueries({ queryKey: ['expenses'] })
        queryClient.invalidateQueries({ queryKey: ['expense-summary'] })
      }
    },
    onError: (error) => {
      console.error('Failed to update expense:', error)
      setExpensesError('Failed to update expense')
    }
  })

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      return trackingApi.deleteExpense(id)
    },
    onSuccess: (response, id) => {
      if (response.success) {
        removeExpense(id)
        queryClient.invalidateQueries({ queryKey: ['expenses'] })
        queryClient.invalidateQueries({ queryKey: ['expense-summary'] })
      }
    },
    onError: (error) => {
      console.error('Failed to delete expense:', error)
      setExpensesError('Failed to delete expense')
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

  const refreshExpenses = () => {
    refetch()
  }

  return {
    // Data
    expenses,
    
    // States
    isLoading: isLoadingExpenses,
    error: expensesError,
    isCreating: createExpenseMutation.isPending,
    isUpdating: updateExpenseMutation.isPending,
    isDeleting: deleteExpenseMutation.isPending,
    
    // Actions
    createExpense,
    updateExpense: updateExpenseById,
    deleteExpense: deleteExpenseById,
    refresh: refreshExpenses,
    
    // Mutations
    createExpenseMutation,
    updateExpenseMutation,
    deleteExpenseMutation
  }
}

// Hook for expense summary
export const useExpenseSummary = (marketId?: string) => {
  const { user } = useAuthStore()
  const { setExpenseSummary } = useTrackingStore()

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['expense-summary', user?.id, marketId],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      const response = await trackingApi.getExpenseSummary(user.id, marketId)
      return response.data
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  React.useEffect(() => {
    if (data) {
      setExpenseSummary(data)
    }
  }, [data, setExpenseSummary])

  return {
    summary: data,
    isLoading,
    error: error?.message || null,
    refetch
  }
}