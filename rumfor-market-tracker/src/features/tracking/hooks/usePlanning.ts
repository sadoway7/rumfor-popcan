import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { trackingApi } from '../trackingApi'
import { useAuthStore } from '@/features/auth/authStore'
import { Todo, Expense, PlanningItem, PaginatedResponse } from '@/types'

const extractExpensesArray = (data: unknown): Expense[] => {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (typeof data === 'object' && data !== null && 'data' in data) {
    const paginated = data as PaginatedResponse<Expense>
    return Array.isArray(paginated.data) ? paginated.data : []
  }
  return []
}

export const usePlanning = (marketId?: string) => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const {
    data: todos,
    isLoading: todosLoading,
    error: todosError
  } = useQuery({
    queryKey: ['todos', user?.id, marketId],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      try {
        const response = await trackingApi.getTodos(marketId)
        return response || []
      } catch (err) {
        console.error('Failed to fetch todos:', err)
        return []
      }
    },
    enabled: !!user?.id,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  })

  const {
    data: expensesData,
    isLoading: expensesLoading,
    error: expensesError
  } = useQuery({
    queryKey: ['expenses', user?.id, marketId],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      try {
        const response = await trackingApi.getExpenses(marketId)
        return response || { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
      } catch (err) {
        console.error('Failed to fetch expenses:', err)
        return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
      }
    },
    enabled: !!user?.id,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  })

  const expensesArray = useMemo(() => extractExpensesArray(expensesData), [expensesData])
  const todosArray = useMemo(() => (Array.isArray(todos) ? todos : []), [todos])

  const planningItems: PlanningItem[] = useMemo(() => {
    return [
      ...todosArray.map((todo: Todo) => ({
        id: `todo-${todo.id}`,
        type: 'todo' as const,
        data: todo,
        sortOrder: todo.sortOrder ?? 0
      })),
      ...expensesArray.map((expense: Expense) => ({
        id: `expense-${expense.id}`,
        type: 'expense' as const,
        data: expense,
        sortOrder: expense.sortOrder ?? 0
      }))
    ].sort((a, b) => a.sortOrder - b.sortOrder)
  }, [todosArray, expensesArray])

  const updateOrderMutation = useMutation({
    mutationFn: async (items: { id: string; type: 'todo' | 'expense'; sortOrder: number }[]) => {
      const updates = items.map(item => {
        const realId = item.id.replace(/^(todo-|expense-)/, '')
        if (item.type === 'todo') {
          return trackingApi.updateTodo(realId, { sortOrder: item.sortOrder })
        } else {
          return trackingApi.updateExpense(realId, { sortOrder: item.sortOrder })
        }
      })
      await Promise.all(updates)
      return { success: true }
    },
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id, marketId] })
      await queryClient.cancelQueries({ queryKey: ['expenses', user?.id, marketId] })
      
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', user?.id, marketId])
      const previousExpenses = queryClient.getQueryData<PaginatedResponse<Expense>>(['expenses', user?.id, marketId])

      newOrder.forEach(item => {
        if (item.type === 'todo') {
          const realId = item.id.replace('todo-', '')
          queryClient.setQueryData<Todo[]>(['todos', user?.id, marketId], 
            (old) => old?.map(t => t.id === realId ? { ...t, sortOrder: item.sortOrder } : t) || []
          )
        } else {
          const realId = item.id.replace('expense-', '')
          queryClient.setQueryData<PaginatedResponse<Expense>>(['expenses', user?.id, marketId],
            (old) => {
              if (!old) return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
              return {
                ...old,
                data: old.data.map(e => e.id === realId ? { ...e, sortOrder: item.sortOrder } : e)
              }
            }
          )
        }
      })

      return { previousTodos, previousExpenses }
    },
    onError: (err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', user?.id, marketId], context.previousTodos)
      }
      if (context?.previousExpenses) {
        queryClient.setQueryData(['expenses', user?.id, marketId], context.previousExpenses)
      }
    }
  })

  const updateOrder = (items: { id: string; type: 'todo' | 'expense'; sortOrder: number }[]) => {
    updateOrderMutation.mutate(items)
  }

  return {
    planningItems,
    todos: todosArray,
    expenses: expensesArray,
    isLoading: todosLoading || expensesLoading,
    error: todosError?.message || expensesError?.message || null,
    updateOrder,
    isUpdatingOrder: updateOrderMutation.isPending
  }
}
