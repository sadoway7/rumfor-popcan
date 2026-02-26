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

  // Create todo mutation with optimistic update
  const createTodoMutation = useMutation({
    mutationFn: async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) throw new Error('User not authenticated')
      const todoWithMarket = { ...todo, market: marketId }
      return trackingApi.createTodo(todoWithMarket as any)
    },
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id, marketId] })
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', user?.id, marketId]) || []
      const optimisticTodo: Todo = {
        ...newTodo,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        market: marketId || ''
      } as Todo
      queryClient.setQueryData<Todo[]>(['todos', user?.id, marketId], [...previousTodos, optimisticTodo])
      return { previousTodos }
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos', user?.id, marketId], context?.previousTodos)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  // Update todo mutation with optimistic update
  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Todo> }) => {
      return trackingApi.updateTodo(id, updates)
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id, marketId] })
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', user?.id, marketId]) || []
      queryClient.setQueryData<Todo[]>(['todos', user?.id, marketId], 
        previousTodos.map(todo => todo.id === id ? { ...todo, ...updates } : todo)
      )
      return { previousTodos }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['todos', user?.id, marketId], context?.previousTodos)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  // Delete todo mutation with optimistic update
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      return trackingApi.deleteTodo(id)
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id, marketId] })
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', user?.id, marketId]) || []
      queryClient.setQueryData<Todo[]>(['todos', user?.id, marketId], 
        previousTodos.filter(todo => todo.id !== id)
      )
      return { previousTodos }
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['todos', user?.id, marketId], context?.previousTodos)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  // Toggle todo mutation with optimistic update
  const toggleTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      const todos = queryClient.getQueryData<Todo[]>(['todos', user?.id, marketId]) || []
      const todo = todos.find(t => t.id === id)
      if (!todo) throw new Error('Todo not found')
      return trackingApi.updateTodo(id, { completed: !todo.completed })
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id, marketId] })
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', user?.id, marketId]) || []
      queryClient.setQueryData<Todo[]>(['todos', user?.id, marketId], 
        previousTodos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo)
      )
      return { previousTodos }
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['todos', user?.id, marketId], context?.previousTodos)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
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
