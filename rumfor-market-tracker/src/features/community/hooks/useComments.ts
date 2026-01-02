import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCommunityStore } from '../communityStore'
import { communityApi } from '../communityApi'

export const useComments = (marketId: string) => {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  
  const {
    comments,
    isLoadingComments,
    commentsError,
    setComments,
    addComment,
    updateComment,
    removeComment,
    setCommentsError,
  } = useCommunityStore()

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

  // Update store when data changes
  useEffect(() => {
    if (commentsResponse?.success && commentsResponse.data) {
      if (page === 1) {
        setComments(commentsResponse.data)
      } else {
        // Append new comments for pagination
        setComments([...comments, ...commentsResponse.data])
      }
    }
  }, [commentsResponse, page, comments, setComments])

  // Mutations
  const createCommentMutation = useMutation({
    mutationFn: (commentData: { content: string; parentId?: string }) =>
      communityApi.createComment({ ...commentData, marketId }),
    onSuccess: (response) => {
      if (response.success && response.data) {
        addComment(response.data)
        queryClient.invalidateQueries({ queryKey: ['comments', marketId] })
      }
    },
    onError: (error: any) => {
      setCommentsError(error.message || 'Failed to create comment')
    },
  })

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      communityApi.updateComment(commentId, content),
    onSuccess: (response) => {
      if (response.success && response.data) {
        updateComment(response.data.id, response.data)
        queryClient.invalidateQueries({ queryKey: ['comments', marketId] })
      }
    },
    onError: (error: any) => {
      setCommentsError(error.message || 'Failed to update comment')
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => communityApi.deleteComment(commentId),
    onSuccess: (_, commentId) => {
      removeComment(commentId)
      queryClient.invalidateQueries({ queryKey: ['comments', marketId] })
    },
    onError: (error: any) => {
      setCommentsError(error.message || 'Failed to delete comment')
    },
  })

  const addReactionMutation = useMutation({
    mutationFn: ({ commentId, type }: { commentId: string; type: 'like' | 'dislike' | 'love' | 'laugh' }) =>
      communityApi.addReaction(commentId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', marketId] })
    },
    onError: (error: any) => {
      setCommentsError(error.message || 'Failed to add reaction')
    },
  })

  const removeReactionMutation = useMutation({
    mutationFn: (commentId: string) => communityApi.removeReaction(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', marketId] })
    },
    onError: (error: any) => {
      setCommentsError(error.message || 'Failed to remove reaction')
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
    return comment?.reactions.find(r => r.userId === 'user-1')
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
    isLoading: isLoading || isLoadingComments,
    error: error || commentsError,
    
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