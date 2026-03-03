import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foldersApi } from '../foldersApi'
import { useAuthStore } from '@/features/auth/authStore'
import { PlanningFolder, CreateFolderData, UpdateFolderData } from '@/types'

export const useFolders = (marketId?: string) => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: folders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['folders', user?.id, marketId],
    queryFn: async () => {
      if (!user?.id || !marketId) return []
      return foldersApi.getFolders(marketId)
    },
    enabled: !!user?.id && !!marketId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  })

  const createFolderMutation = useMutation({
    mutationFn: (data: CreateFolderData) => foldersApi.createFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
    }
  })

  const updateFolderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFolderData }) => 
      foldersApi.updateFolder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
    }
  })

  const deleteFolderMutation = useMutation({
    mutationFn: ({ id, moveItemsTo }: { id: string; moveItemsTo?: string | null }) =>
      foldersApi.deleteFolder(id, moveItemsTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    }
  })

  const reorderFoldersMutation = useMutation({
    mutationFn: ({ folderIds }: { folderIds: string[] }) =>
      foldersApi.reorderFolders(marketId!, folderIds),
    onMutate: async ({ folderIds }) => {
      await queryClient.cancelQueries({ queryKey: ['folders', user?.id, marketId] })
      const previousFolders = queryClient.getQueryData<PlanningFolder[]>(['folders', user?.id, marketId])
      
      if (previousFolders) {
        const reordered = folderIds.map((id, index) => {
          const folder = previousFolders.find(f => f.id === id)
          return folder ? { ...folder, sortOrder: index } : null
        }).filter(Boolean) as PlanningFolder[]
        
        queryClient.setQueryData<PlanningFolder[]>(['folders', user?.id, marketId], reordered)
      }
      
      return { previousFolders }
    },
    onError: (err, variables, context) => {
      if (context?.previousFolders) {
        queryClient.setQueryData(['folders', user?.id, marketId], context.previousFolders)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
    }
  })

  const moveItemMutation = useMutation({
    mutationFn: ({ itemId, itemType, folderId }: { 
      itemId: string; 
      itemType: 'todo' | 'expense'; 
      folderId: string | null 
    }) => foldersApi.moveItemToFolder(itemId, itemType, folderId),
    onMutate: async ({ itemId, itemType, folderId }) => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id, marketId] })
      await queryClient.cancelQueries({ queryKey: ['expenses', user?.id, marketId] })
      
      const previousTodos = queryClient.getQueryData(['todos', user?.id, marketId])
      const previousExpenses = queryClient.getQueryData(['expenses', user?.id, marketId])
      
      if (itemType === 'todo') {
        queryClient.setQueryData(['todos', user?.id, marketId], (old: any) => {
          if (!old) return old
          const todos = Array.isArray(old) ? old : old.data
          const updated = todos.map((t: any) => 
            t.id === itemId ? { ...t, folderId } : t
          )
          return Array.isArray(old) ? updated : { ...old, data: updated }
        })
      } else {
        queryClient.setQueryData(['expenses', user?.id, marketId], (old: any) => {
          if (!old) return old
          const expenses = Array.isArray(old) ? old : old.data
          const updated = expenses.map((e: any) => 
            e.id === itemId ? { ...e, folderId } : e
          )
          return Array.isArray(old) ? updated : { ...old, data: updated }
        })
      }
      
      return { previousTodos, previousExpenses }
    },
    onError: (err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', user?.id, marketId], context.previousTodos)
      }
      if (context?.previousExpenses) {
        queryClient.setQueryData(['expenses', user?.id, marketId], context.previousExpenses)
      }
      // Only refetch on error to get correct server state
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
    onSuccess: () => {
      // Don't invalidate on success - trust the optimistic update
      // The cache already has the correct data
    }
  })

  return {
    folders,
    isLoading,
    error: error?.message || null,
    createFolder: (data: CreateFolderData) => createFolderMutation.mutate(data),
    updateFolder: (id: string, data: UpdateFolderData) => updateFolderMutation.mutate({ id, data }),
    deleteFolder: (id: string, moveItemsTo?: string | null) => deleteFolderMutation.mutate({ id, moveItemsTo }),
    reorderFolders: (folderIds: string[]) => reorderFoldersMutation.mutate({ folderIds }),
    moveItemToFolder: (itemId: string, itemType: 'todo' | 'expense', folderId: string | null) =>
      moveItemMutation.mutate({ itemId, itemType, folderId }),
    isCreating: createFolderMutation.isPending,
    isUpdating: updateFolderMutation.isPending,
    isDeleting: deleteFolderMutation.isPending,
    refetch
  }
}
