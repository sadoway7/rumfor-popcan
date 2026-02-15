import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trackingApi } from '../trackingApi'
import { useAuthStore } from '@/features/auth/authStore'
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets'
import { Expense, ExpenseCategory } from '@/types'

export const useAllExpenses = () => {
  const { user } = useAuthStore()
  const { trackedMarkets, isLoading: marketsLoading } = useTrackedMarkets()
  const queryClient = useQueryClient()

  const marketIds = trackedMarkets.map(m => m.id)

  const {
    data,
    isLoading: expensesLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['all-expenses', user?.id, marketIds.join(',')],
    queryFn: async () => {
      if (!user?.id) return []
      if (marketIds.length === 0) return []

      const allExpenses: Expense[] = []
      
      await Promise.all(
        marketIds.map(async (marketId) => {
          try {
            const response = await trackingApi.getExpenses(marketId)
            // Backend returns { data: [...expenses], pagination }
            // Handle both old (nested) and new (correct) structure
            let expenses: Expense[] = []
            if (response?.data) {
              if (Array.isArray(response.data)) {
                expenses = response.data
              } else if ((response.data as any).data && Array.isArray((response.data as any).data)) {
                expenses = (response.data as any).data
              }
            }
            allExpenses.push(...expenses)
          } catch (err) {
            console.error(`Failed to fetch expenses for market ${marketId}:`, err)
          }
        })
      )

      return allExpenses
    },
    enabled: !!user?.id && marketIds.length > 0 && !marketsLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const createExpenseMutation = useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) throw new Error('User not authenticated')
      return trackingApi.createExpense(expense)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] })
    },
    onError: (error) => {
      console.error('Failed to create expense:', error)
      throw error
    }
  })

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Expense> }) => {
      return trackingApi.updateExpense(id, updates)
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['all-expenses'] })
      const previousExpenses = queryClient.getQueryData<Expense[]>(['all-expenses', user?.id, marketIds.join(',')])
      if (previousExpenses) {
        queryClient.setQueryData<Expense[]>(
          ['all-expenses', user?.id, marketIds.join(',')],
          previousExpenses.map(exp => exp.id === id ? { ...exp, ...updates } : exp)
        )
      }
      return { previousExpenses }
    },
    onError: (err, { id, updates }, context) => {
      console.error('Failed to update expense:', err)
      if (context?.previousExpenses) {
        queryClient.setQueryData(['all-expenses', user?.id, marketIds.join(',')], context.previousExpenses)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] })
    }
  })

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      return trackingApi.deleteExpense(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] })
    },
    onError: (error) => {
      console.error('Failed to delete expense:', error)
      throw error
    }
  })

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
    expenses: data || [],
    isLoading: marketsLoading || expensesLoading,
    error: error?.message || null,
    isCreating: createExpenseMutation.isPending,
    isUpdating: updateExpenseMutation.isPending,
    isDeleting: deleteExpenseMutation.isPending,
    createExpense,
    updateExpense: updateExpenseById,
    deleteExpense: deleteExpenseById,
    refresh: refetch,
    createExpenseMutation,
    updateExpenseMutation,
    deleteExpenseMutation
  }
}
