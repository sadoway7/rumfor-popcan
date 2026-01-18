import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communityApi } from '../communityApi'

export const useHashtags = (marketId: string) => {
  const queryClient = useQueryClient()

  // Query for fetching hashtags
  const {
    data: hashtagsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['hashtags', marketId],
    queryFn: () => communityApi.getHashtags(marketId),
    enabled: !!marketId,
    staleTime: 60000, // 1 minute
  })

  // Query for predefined hashtags
  const {
    data: predefinedResponse,
    isLoading: isLoadingPredefined,
  } = useQuery({
    queryKey: ['predefinedHashtags'],
    queryFn: () => communityApi.getPredefinedHashtags(),
    staleTime: 300000, // 5 minutes
  })

  // Get hashtags from response
  const hashtags = hashtagsResponse?.success ? hashtagsResponse.data || [] : []

  // Mutations
  const createHashtagMutation = useMutation({
    mutationFn: (hashtagData: { name: string }) =>
      communityApi.createHashtag({ ...hashtagData, marketId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hashtags', marketId] })
    },
    onError: (error: any) => {
      console.error('Failed to create hashtag:', error)
    },
  })

  const deleteHashtagMutation = useMutation({
    mutationFn: (hashtagId: string) => communityApi.deleteHashtag(hashtagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hashtags', marketId] })
    },
    onError: (error: any) => {
      console.error('Failed to delete hashtag:', error)
    },
  })

  const voteOnHashtagMutation = useMutation({
    mutationFn: ({ hashtagId, value }: { hashtagId: string; value: number }) =>
      communityApi.voteOnHashtag(hashtagId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hashtags', marketId] })
    },
    onError: (error: any) => {
      console.error('Failed to vote on hashtag:', error)
    },
  })

  // Helper functions
  const createHashtag = async (name: string) => {
    // Validate hashtag name
    const validation = validateHashtagName(name)
    if (validation !== null) {
      throw new Error(validation)
    }
    
    await createHashtagMutation.mutateAsync({ name })
  }

  const deleteHashtag = async (hashtagId: string) => {
    await deleteHashtagMutation.mutateAsync(hashtagId)
  }

  const voteHashtag = async (hashtagId: string, value: 1 | -1 | 0) => {
    await voteOnHashtagMutation.mutateAsync({ hashtagId, value })
  }

  const refreshHashtags = () => {
    refetch()
  }

  // Validation
  const validateHashtagName = (name: string): string | null => {
    // Check if empty
    if (!name.trim()) {
      return 'Hashtag name is required'
    }

    // Check length
    if (name.length < 2) {
      return 'Hashtag name must be at least 2 characters'
    }

    if (name.length > 50) {
      return 'Hashtag name must be less than 50 characters'
    }

    // Check for valid characters (letters, numbers, underscores, hyphens)
    const validPattern = /^[a-zA-Z0-9_-]+$/
    if (!validPattern.test(name)) {
      return 'Hashtag name can only contain letters, numbers, underscores, and hyphens'
    }

    // Check if hashtag already exists
    const existing = hashtags.find(h => h.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      return 'This hashtag already exists'
    }

    return null
  }

  // Utility functions
  const getUserVote = (hashtagId: string) => {
    const hashtag = hashtags.find(h => h.id === hashtagId)
    return hashtag?.votes.find(v => v.userId === 'user-1')
  }

  const getVoteCount = (hashtagId: string) => {
    const hashtag = hashtags.find(h => h.id === hashtagId)
    return hashtag?.votes.reduce((total, vote) => total + vote.value, 0) || 0
  }

  const getVoteCounts = (hashtagId: string) => {
    const hashtag = hashtags.find(h => h.id === hashtagId)
    if (!hashtag) return { upvotes: 0, downvotes: 0 }
    
    return hashtag.votes.reduce(
      (acc, vote) => {
        if (vote.value > 0) acc.upvotes++
        else if (vote.value < 0) acc.downvotes++
        return acc
      },
      { upvotes: 0, downvotes: 0 }
    )
  }

  const sortHashtags = (sortBy: 'votes' | 'name' | 'created') => {
    const sorted = [...hashtags]
    
    switch (sortBy) {
      case 'votes':
        return sorted.sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id))
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'created':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      default:
        return sorted
    }
  }

  const filterHashtags = (searchTerm: string) => {
    if (!searchTerm.trim()) return hashtags
    
    const term = searchTerm.toLowerCase()
    return hashtags.filter(hashtag => 
      hashtag.name.toLowerCase().includes(term)
    )
  }

  const getTopHashtags = (limit: number = 10) => {
    return sortHashtags('votes').slice(0, limit)
  }

  const getTrendingHashtags = () => {
    // For demo purposes, return top 5 hashtags
    return getTopHashtags(5)
  }

  const getSuggestedHashtags = () => {
    // Filter predefined hashtags that don't already exist
    if (!predefinedResponse?.success || !predefinedResponse.data) return []
    
    const existingNames = hashtags.map(h => h.name.toLowerCase())
    return predefinedResponse.data.filter(name => 
      !existingNames.includes(name.toLowerCase())
    ).slice(0, 10)
  }

  return {
    // Data
    hashtags,
    predefinedHashtags: predefinedResponse?.data || [],
    isLoading,
    isLoadingPredefined,
    error: error ? (error as Error).message : null,
    
    // Actions
    createHashtag,
    deleteHashtag,
    voteHashtag,
    refreshHashtags,
    
    // Utilities
    validateHashtagName,
    getUserVote,
    getVoteCount,
    getVoteCounts,
    sortHashtags,
    filterHashtags,
    getTopHashtags,
    getTrendingHashtags,
    getSuggestedHashtags,
    
    // States
    isCreating: createHashtagMutation.isPending,
    isDeleting: deleteHashtagMutation.isPending,
    isVoting: voteOnHashtagMutation.isPending,
    
    // Errors
    createError: createHashtagMutation.error?.message,
    deleteError: deleteHashtagMutation.error?.message,
    voteError: voteOnHashtagMutation.error?.message,
  }
}

export default useHashtags
