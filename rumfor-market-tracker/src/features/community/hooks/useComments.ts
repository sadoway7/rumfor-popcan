import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communityApi } from '../communityApi'
import { Comment, CommentReaction } from '@/types'
import { useAuthStore } from '@/features/auth/authStore'

export const useComments = (marketId: string) => {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

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
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({ queryKey: ['comments', marketId] })
      
      const previousComments = queryClient.getQueriesData({ queryKey: ['comments', marketId] })
      
      const optimisticComment: Comment = {
        id: `optimistic-${Date.now()}`,
        marketId,
        userId: user?.id || 'temp-user-id',
        user: user || {
          id: 'temp-user-id',
          email: '',
          firstName: 'You',
          lastName: '',
          role: 'visitor',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isEmailVerified: false,
          isActive: true,
        },
        content: newComment.content,
        parentId: newComment.parentId,
        replies: [],
        reactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      previousComments.forEach(([queryKey, data]) => {
        if (!data || !(data as any).data) return
        
        if (newComment.parentId) {
          const updatedData = (data as any).data.map((comment: Comment) => {
            if (comment.id === newComment.parentId) {
              return {
                ...comment,
                replies: [optimisticComment, ...comment.replies]
              }
            }
            return comment
          })
          
          queryClient.setQueryData(
            queryKey,
            () => ({
              ...(data as any),
              data: updatedData
            })
          )
        } else {
          queryClient.setQueryData(
            queryKey,
            () => ({
              ...(data as any),
              data: [optimisticComment, ...(data as any).data]
            })
          )
        }
      })
      
      return { previousComments }
    },
    onError: (error, _variables, context) => {
      if (context?.previousComments) {
        context.previousComments.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to create comment:', error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', marketId] })
      setPage(1)
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
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ['comments', marketId] })
      
      const previousComments = queryClient.getQueriesData({ queryKey: ['comments', marketId] })
      
      const removeCommentAndReplies = (comment: Comment): Comment => {
        return {
          ...comment,
          replies: comment.replies
            .filter((reply: Comment) => reply.id !== commentId)
            .map(removeCommentAndReplies)
        }
      }
      
      previousComments.forEach(([queryKey, data]) => {
        if (!data || !(data as any).data) return
        
        const filteredComments = (data as any).data
          .filter((comment: Comment) => comment.id !== commentId)
          .map(removeCommentAndReplies)
        
        queryClient.setQueryData(
          queryKey,
          () => ({
            ...(data as any),
            data: filteredComments
          })
        )
      })
      
      return { previousComments }
    },
    onError: (error, _variables, context) => {
      if (context?.previousComments) {
        context.previousComments.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to delete comment:', error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', marketId] })
    },
  })

  const addReactionMutation = useMutation({
    mutationFn: ({ commentId, type }: { commentId: string; type: 'like' | 'dislike' | 'love' | 'laugh' }) =>
      communityApi.addReaction(commentId, type),
    onMutate: async ({ commentId, type }) => {
      void commentId

      await queryClient.cancelQueries({ queryKey: ['comments', marketId] })
      await queryClient.cancelQueries({ queryKey: ['comments', marketId] })
      
      const previousComments = queryClient.getQueriesData({ queryKey: ['comments', marketId] })
      
      const optimisticReaction: CommentReaction = {
        id: `optimistic-reaction-${Date.now()}`,
        userId: user?.id || 'user-1',
        type,
        createdAt: new Date().toISOString(),
      }
      
      const updateCommentReactions = (comment: Comment): Comment => {
        const existingReaction = comment.reactions.find(r => r.userId === optimisticReaction.userId)
        const reactions = existingReaction
          ? comment.reactions.map(r => 
              r.userId === optimisticReaction.userId ? optimisticReaction : r
            )
          : [...comment.reactions, optimisticReaction]
        
        return {
          ...comment,
          reactions,
          replies: comment.replies.map(updateCommentReactions),
        }
      }
      
      previousComments.forEach(([queryKey, data]) => {
        if (!data || !(data as any).data) return
        
        queryClient.setQueryData(
          queryKey,
          () => ({
            ...(data as any),
            data: (data as any).data.map((comment: Comment) => updateCommentReactions(comment)),
          })
        )
      })
      
      return { previousComments }
    },
    onError: (error, _variables, context) => {
      if (context?.previousComments) {
        context.previousComments.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to add reaction:', error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', marketId] })
    },
  })

  const removeReactionMutation = useMutation({
    mutationFn: (commentId: string) => communityApi.removeReaction(commentId),
    onMutate: async (_commentId) => {
      await queryClient.cancelQueries({ queryKey: ['comments', marketId] })
      
      const previousComments = queryClient.getQueryData(['comments', marketId, page])
      const userId = user?.id || 'user-1'
      
      const removeReactionFromComment = (comment: Comment): Comment => {
        return {
          ...comment,
          reactions: comment.reactions.filter(r => r.userId !== userId),
          replies: comment.replies.map(removeReactionFromComment),
        }
      }
      
      queryClient.setQueryData(
        ['comments', marketId, page],
        (old: any) => {
          if (!old?.success || !old?.data) return old
          
          return {
            ...old,
            data: old.data.map((comment: Comment) => removeReactionFromComment(comment)),
          }
        }
      )
      
      return { previousComments }
    },
    onError: (error, _variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', marketId, page], context.previousComments)
      }
      console.error('Failed to remove reaction:', error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', marketId] })
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
    return comment?.reactions.find(r => r.userId === user?.id)
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