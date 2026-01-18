import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communityApi } from '../communityApi'

export const useComments = (marketId: string) => {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  // Query for fetching comments
  const {
    data: commentsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['comments', marketId, page],
    queryFn: () => communityApi.getComments(marketId, page),
    enabled: !!marketId,
    staleTime: 30000, // 30 seconds
  })

  // Get comments from response, handling pagination
  const comments = commentsResponse?.success ? commentsResponse.data || [] : []

  // Mutations
  const createCommentMutation = useMutation({
    mutationFn: (commentData: { content: string; parentId?: string }) =>
      communityApi.createComment({ ...commentData, marketId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', marketId] })
      setPage(1) // Reset to first page after creating
    },
    onError: (error: any) => {
      console.error('Failed to create comment:', error)
    },
  })

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      communityApi.updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', marketId] })
    },
    onError: (error: any) => {
      console.error('Failed to update comment:', error)
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => communityApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', marketId] })
    },
    onError: (error: any) => {
      console.error('Failed to delete comment:', error)
    },
  })

  const addReactionMutation = useMutation({
    mutationFn: ({ commentId, type }: { commentId: string; type: 'like' | 'dislike' | 'love' | 'laugh' }) =>
      communityApi.addReaction(commentId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', marketId] })
    },
    onError: (error: any) => {
      console.error('Failed to add reaction:', error)
    },
  })

  const removeReactionMutation = useMutation({
    mutationFn: (commentId: string) => communityApi.removeReaction(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', marketId] })
    },
    onError: (error: any) => {
      console.error('Failed to remove reaction:', error)
    },
  })

  // Helper functions
  const createComment = async (content: string, parentId?: string) => {
    await createCommentMutation.mutateAsync({ content, parentId })
  }

  const editComment = async (commentId: string, content: string) => {
    await updateCommentMutation.mutateAsync({ commentId, content })
  }

  const deleteComment = async (commentId: string) => {
    await deleteCommentMutation.mutateAsync(commentId)
  }

  const addReaction = async (commentId: string, type: 'like' | 'dislike' | 'love' | 'laugh') => {
    await addReactionMutation.mutateAsync({ commentId, type })
  }

  const removeReaction = async (commentId: string) => {
    await removeReactionMutation.mutateAsync(commentId)
  }

  const loadMoreComments = () => {
    setPage(prev => prev + 1)
  }

  const refreshComments = () => {
    setPage(1)
    refetch()
  }

  const getUserReaction = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId)
    return comment?.reactions.find(r => r.userId === 'user-1') // TODO: Use actual user ID
  }

  const getReactionCounts = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId)
    if (!comment) return { like: 0, dislike: 0, love: 0, laugh: 0 }

    return comment.reactions.reduce(
      (acc, reaction) => {
        acc[reaction.type]++
        return acc
      },
      { like: 0, dislike: 0, love: 0, laugh: 0 }
    )
  }

  return {
    // Data
    comments,
    isLoading,
    error: error ? (error as Error).message : null,

    // Actions
    createComment,
    editComment,
    deleteComment,
    addReaction,
    removeReaction,
    loadMoreComments,
    refreshComments,

    // Helpers
    getUserReaction,
    getReactionCounts,

    // States
    isCreating: createCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
    isReacting: addReactionMutation.isPending || removeReactionMutation.isPending,

    // Errors
    createError: createCommentMutation.error?.message,
    updateError: updateCommentMutation.error?.message,
    deleteError: deleteCommentMutation.error?.message,
    reactionError: addReactionMutation.error?.message || removeReactionMutation.error?.message,
  }
}

export default useComments