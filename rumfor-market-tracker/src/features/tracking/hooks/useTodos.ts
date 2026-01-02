import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trackingApi } from '../trackingApi'
import { useTrackingStore } from '../trackingStore'
import { useAuthStore } from '@/features/auth/authStore'
import { Todo } from '@/types'

export const useTodos = (marketId?: string) => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const {
    todos,
    isLoadingTodos,
    todosError,
    setTodos,
    setLoadingTodos,
    setTodosError,
    addTodo,
    updateTodo,
    removeTodo,
    toggleTodo
  } = useTrackingStore()

  // Query for todos
  const {
    data,
    isLoading: isQueryLoading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['todos', user?.id, marketId],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      const response = await trackingApi.getTodos(user.id, marketId)
      return response.data
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Update store when query data changes
  React.useEffect(() => {
    if (data) {
      setTodos(data)
    }
  }, [data, setTodos])

  // Sync loading states
  React.useEffect(() => {
    setLoadingTodos(isQueryLoading)
  }, [isQueryLoading, setLoadingTodos])

  // Sync error states
  React.useEffect(() => {
    setTodosError(queryError?.message || null)
  }, [queryError, setTodosError])

  // Create todo mutation
  const createTodoMutation = useMutation({
    mutationFn: async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) throw new Error('User not authenticated')
      return trackingApi.createTodo(todo)
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        addTodo(response.data)
        queryClient.invalidateQueries({ queryKey: ['todos'] })
      }
    },
    onError: (error) => {
      console.error('Failed to create todo:', error)
      setTodosError('Failed to create todo')
    }
  })

  // Update todo mutation
  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Todo> }) => {
      return trackingApi.updateTodo(id, updates)
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        updateTodo(response.data.id, response.data)
        queryClient.invalidateQueries({ queryKey: ['todos'] })
      }
    },
    onError: (error) => {
      console.error('Failed to update todo:', error)
      setTodosError('Failed to update todo')
    }
  })

  // Delete todo mutation
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      return trackingApi.deleteTodo(id)
    },
    onSuccess: (response, id) => {
      if (response.success) {
        removeTodo(id)
        queryClient.invalidateQueries({ queryKey: ['todos'] })
      }
    },
    onError: (error) => {
      console.error('Failed to delete todo:', error)
      setTodosError('Failed to delete todo')
    }
  })

  // Toggle todo mutation
  const toggleTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      const todo = todos.find(t => t.id === id)
      if (!todo) throw new Error('Todo not found')
      return trackingApi.updateTodo(id, { completed: !todo.completed })
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        toggleTodo(response.data.id)
        queryClient.invalidateQueries({ queryKey: ['todos'] })
      }
    },
    onError: (error) => {
      console.error('Failed to toggle todo:', error)
      setTodosError('Failed to update todo status')
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

  const refreshTodos = () => {
    refetch()
  }

  return {
    // Data
    todos,
    
    // States
    isLoading: isLoadingTodos,
    error: todosError,
    isCreating: createTodoMutation.isPending,
    isUpdating: updateTodoMutation.isPending || toggleTodoMutation.isPending,
    isDeleting: deleteTodoMutation.isPending,
    
    // Actions
    createTodo,
    updateTodo: updateTodoById,
    deleteTodo: deleteTodoById,
    toggleTodo: toggleTodoById,
    refresh: refreshTodos,
    
    // Mutations
    createTodoMutation,
    updateTodoMutation,
    deleteTodoMutation,
    toggleTodoMutation
  }
}

// Hook for todo templates
export const useTodoTemplates = (category?: string) => {
  const { setTodoTemplates } = useTrackingStore()

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

  React.useEffect(() => {
    if (data) {
      setTodoTemplates(data)
    }
  }, [data, setTodoTemplates])

  return {
    templates: data || [],
    isLoading,
    error: error?.message || null,
    refetch
  }
}