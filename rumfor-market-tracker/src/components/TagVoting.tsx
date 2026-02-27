import React, { useMemo } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { useHashtags } from '@/features/community/hooks/useHashtags'
import { useAuthStore } from '@/features/auth/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/utils/cn'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TagVotingProps {
  marketTags: string[]
  marketId: string
  className?: string
  hideHeading?: boolean
}

export const TagVoting: React.FC<TagVotingProps> = ({
  marketTags,
  marketId,
  className,
  hideHeading = false
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

  // Sort by votes and show up to 30 tags
  const marketHashtags = useMemo(() => {
    return [...hashtags]
      .sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id))
      .slice(0, 30)
  }, [hashtags])

  // Generate 8 random suggested tags (excluding already used tags)
  const suggestedTags = useMemo(() => {
    if (!predefinedHashtags) return []

    const usedTags = new Set(hashtags.map(h => h.name))
    const availableTags = predefinedHashtags.filter(tag => !usedTags.has(tag))

    // Shuffle and take 8
    const shuffled = [...availableTags].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 8)
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
      await addTagToMarket(tagName)
    } catch (error: any) {
      console.error('Failed to add and vote on tag:', error)
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
        {!hideHeading && (
          <div className="flex items-center justify-between pt-4">
            <h3 className="text-lg font-medium">Market Tags</h3>
          </div>
        )}
<motion.div 
            className="flex flex-wrap gap-3"
          >
            <AnimatePresence mode="popLayout">
              {marketHashtags.map((hashtag) => {
                const userVote = getUserVote(hashtag.id)
                const voteCount = getVoteCount(hashtag.id)

                return (
                  <motion.div
                    key={hashtag.name}
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="relative inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full text-sm shadow-[0_1px_2px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.06)] group whitespace-nowrap"
                  >
                    <span className="font-medium">{hashtag.name}</span>
                  </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Suggested Tags */}
      {suggestedTags.length > 0 && user && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="pt-6 space-y-4"
        >
          <div>
            <h3 className="text-base font-medium text-muted-foreground/70 mb-3">Do any of these tags match?</h3>
          </div>

<motion.div 
            className="flex flex-wrap gap-3 overflow-hidden max-w-full"
          >
            <AnimatePresence mode="popLayout">
              {suggestedTags.map((tag) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddSuggestedTag(tag)}
                  disabled={isAddingTag}
                  className={cn(
                    "relative inline-flex items-center gap-1 px-2 py-0.5 bg-white/50 rounded-full text-xs shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.06)] transition-all whitespace-nowrap",
                    "hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_4px_8px_rgba(0,0,0,0.08)]",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <span className="text-primary font-bold text-[10px]">+</span>
                  <span className="font-medium">{tag}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3"
        >
          {error}
        </motion.div>
      )}
    </div>
  )
}

export default TagVoting