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
      const response = await trackingApi.getTodos(marketId)
      return response.data
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Create todo mutation
  const createTodoMutation = useMutation({
    mutationFn: async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) throw new Error('User not authenticated')
      return trackingApi.createTodo(todo)
    },
    onSuccess: () => {
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
      const todo = data?.find(t => t.id === id)
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
