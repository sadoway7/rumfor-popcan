import React, { useMemo } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { useHashtags } from '@/features/community/hooks/useHashtags'
import { useAuthStore } from '@/features/auth/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/utils/cn'
import { ThumbsUp, ThumbsDown, Check, X } from 'lucide-react'

interface TagVotingProps {
  marketTags: string[]
  marketId: string
  className?: string
}

export const TagVoting: React.FC<TagVotingProps> = ({
  marketTags,
  marketId,
  className
}) => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const {
    hashtags,
    isLoading,
    error,
    voteHashtag,
    getUserVote,
    getVoteCount,
    isVoting,
    predefinedHashtags,
    addTagToMarket,
    isAddingTag,
    addTagError
  } = useHashtags(marketId)

  // Convert market tags to hashtag objects for voting
  const marketHashtags = useMemo(() => {
    console.log('TagVoting - marketTags:', marketTags, 'hashtags from API:', hashtags)
    return marketTags.map(tag => {
      const existingHashtag = hashtags.find(h => h.name === tag)
      if (existingHashtag) {
        return existingHashtag
      }
      return {
        id: `market-${tag}`,
        name: tag,
        marketId,
        userId: 'system',
        user: { firstName: 'Market', lastName: 'Admin', avatar: null },
        votes: [],
        createdAt: new Date().toISOString()
      }
    })
  }, [marketTags, hashtags, marketId])

  // Generate 5 random suggested tags (excluding already used tags)
  const suggestedTags = useMemo(() => {
    if (!predefinedHashtags) return []

    const usedTags = new Set([...marketTags, ...hashtags.map(h => h.name)])
    const availableTags = predefinedHashtags.filter(tag => !usedTags.has(tag))

    // Shuffle and take 5
    const shuffled = [...availableTags].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 5)
  }, [predefinedHashtags, marketTags, hashtags])

  // Track user's voting limit (3 votes total)
  const userVotes = useMemo(() => {
    return hashtags.filter(h => getUserVote(h.id)).length
  }, [hashtags, getUserVote])

  const canVote = userVotes < 3

  const handleVote = async (tagName: string, value: 1 | -1 | 0) => {
    if (!user || !canVote) return

    try {
      // Find existing hashtag or create new one
      const existingHashtag = hashtags.find(h => h.name === tagName)
      if (existingHashtag) {
        await voteHashtag(existingHashtag.id, value)
      } else {
        // For market tags, we might need to create the hashtag first
        // This would require backend changes, for now just handle existing ones
        console.log('Voting on market tag:', tagName, value)
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    }
  }

  const handleAddSuggestedTag = async (tagName: string) => {
    if (!user) return
    
    try {
      // Add tag to market
      await addTagToMarket(tagName)
      
      // Brief wait for cache invalidation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Find newly created hashtag in refreshed list
      const updatedHashtags = queryClient.getQueryData(['hashtags', marketId]) as any[]
      const newTag = updatedHashtags?.find((h: any) => h.name === tagName)
      
      if (newTag) {
        // Vote up newly created tag
        await voteHashtag(newTag.id, 1)
      }
    } catch (error: any) {
      console.error('Failed to add and vote on tag:', error)
      // Show error to user
      if (error?.message === 'Tag not in predefined list') {
        alert('This tag is not available for this market.')
      }
    }
  }

  if (isLoading && hashtags.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <div className="text-center">
          <Spinner className="h-6 w-6 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading tags...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Market Tags with Voting */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Market Tags</h3>
          {user && (
            <span className="text-xs text-muted-foreground">
              {canVote ? `${3 - userVotes} votes left` : 'Vote limit reached'}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {marketHashtags.map((hashtag) => {
            const userVote = getUserVote(hashtag.id)
            const voteCount = getVoteCount(hashtag.id)

            return (
              <div key={hashtag.name} className="relative inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-border rounded-full text-sm shadow-sm">
                <span className="font-medium">{hashtag.name}</span>
                <span className="text-xs text-muted-foreground">
                  {voteCount > 0 ? '+' : ''}{voteCount}
                </span>

                {user && (
                  <div className="flex items-center gap-1 ml-1 border-l border-border/50 pl-2">
                    <button
                      onClick={() => handleVote(hashtag.name, userVote?.value === 1 ? 0 : 1)}
                      disabled={isVoting || (!canVote && userVote?.value !== 1)}
                      className={cn(
                        "p-1 rounded hover:bg-muted/50 transition-colors",
                        userVote?.value === 1 ? "text-primary" : "text-muted-foreground",
                        (!canVote && userVote?.value !== 1) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleVote(hashtag.name, userVote?.value === -1 ? 0 : -1)}
                      disabled={isVoting || (!canVote && userVote?.value !== -1)}
                      className={cn(
                        "p-1 rounded hover:bg-muted/50 transition-colors",
                        userVote?.value === -1 ? "text-destructive" : "text-muted-foreground",
                        (!canVote && userVote?.value !== -1) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>



      {/* Suggested Tags */}
      {suggestedTags.length > 0 && user && (
        <div className="border-t pt-4 space-y-3">
          <div>
            <h3 className="text-lg font-medium mb-1">Do any of these tags match?</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleAddSuggestedTag(tag)}
                disabled={isAddingTag}
                className={cn(
                  "relative inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-border rounded-full text-sm shadow-sm transition-colors",
                  "hover:bg-muted/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <span className="text-primary font-bold text-xs">+</span>
                <span className="font-medium">{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          {error}
        </div>
      )}
    </div>
  )
}

export default TagVoting