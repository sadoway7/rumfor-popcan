import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trackingApi } from '../trackingApi'
import { useAuthStore } from '@/features/auth/authStore'
import { Todo } from '@/types'

export const useTodos = (marketId?: string) => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  // Query for todos using TanStack Query for server state
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['todos', user?.id, marketId],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      console.log('[DEBUG] Fetching todos for marketId:', marketId, 'user:', user.id)
      try {
        const response = await trackingApi.getTodos(marketId)
        console.log('[DEBUG] Fetched todos count:', response?.length || 0)
        return response || []
      } catch (err) {
        console.error('Failed to fetch todos:', err)
        return []
      }
    },
    enabled: !!user?.id,
    staleTime: 0, // Disable stale time to ensure fresh data
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  // Create todo mutation
  const createTodoMutation = useMutation({
    mutationFn: async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) throw new Error('User not authenticated')
      // Backend expects 'market' field, not 'marketId'
      const todoWithMarket = { ...todo, market: marketId }
      console.log('[DEBUG] Creating todo:', JSON.stringify(todoWithMarket, null, 2))
      return trackingApi.createTodo(todoWithMarket as any)
    },
    onSuccess: () => {
      console.log('[DEBUG] Todo created successfully, invalidating queries')
      // Invalidate all todo queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onError: (error) => {
      console.error('Failed to create todo:', error)
      throw error
    }
  })

  // Update todo mutation
  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Todo> }) => {
      return trackingApi.updateTodo(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onError: (error) => {
      console.error('Failed to update todo:', error)
      throw error
    }
  })

  // Delete todo mutation
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      return trackingApi.deleteTodo(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onError: (error) => {
      console.error('Failed to delete todo:', error)
      throw error
    }
  })

  // Toggle todo mutation
  const toggleTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      const todos = queryClient.getQueryData<Todo[]>(['todos', user?.id, marketId]) || []
      const todo = todos.find(t => t.id === id)
      if (!todo) throw new Error('Todo not found')
      return trackingApi.updateTodo(id, { completed: !todo.completed })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onError: (error) => {
      console.error('Failed to toggle todo:', error)
      throw error
    }
  })

  // Helper functions
  const createTodo = (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    createTodoMutation.mutate(todoData)
  }

  const updateTodoById = (id: string, updates: Partial<Todo>) => {
    updateTodoMutation.mutate({ id, updates })
  }

  const deleteTodoById = (id: string) => {
    deleteTodoMutation.mutate(id)
  }

  const toggleTodoById = (id: string) => {
    toggleTodoMutation.mutate(id)
  }

  return {
    // Data from TanStack Query
    todos: data || [],
    
    // States from TanStack Query
    isLoading,
    error: error?.message || null,
    
    // Mutation states
    isCreating: createTodoMutation.isPending,
    isUpdating: updateTodoMutation.isPending || toggleTodoMutation.isPending,
    isDeleting: deleteTodoMutation.isPending,
    
    // Actions
    createTodo,
    updateTodo: updateTodoById,
    deleteTodo: deleteTodoById,
    toggleTodo: toggleTodoById,
    refresh: refetch,
    
    // Mutations
    createTodoMutation,
    updateTodoMutation,
    deleteTodoMutation,
    toggleTodoMutation
  }
}

// Hook for todo templates - server state only
export const useTodoTemplates = (category?: string) => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['todo-templates', category],
    queryFn: async () => {
      const response = await trackingApi.getTodoTemplates(category)
      return response.data || []
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })

  return {
    templates: data || [],
    isLoading,
    error: error?.message || null,
    refetch
  }
}
