import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { useHashtags } from '@/features/community/hooks/useHashtags'
import { useAuthStore } from '@/features/auth/authStore'
import { cn } from '@/utils/cn'
import { RefreshCw } from 'lucide-react'
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
  const [shuffledTags, setShuffledTags] = useState<string[]>([])
  const hasInitialized = useRef(false)
  
  const {
    hashtags,
    isLoading,
    error,
    voteHashtag,
    getUserVote,
    getVoteCount,
    predefinedHashtags,
    addTagToMarket,
    isAddingTag,
  } = useHashtags(marketId)

  const marketHashtags = useMemo(() => {
    return [...hashtags]
      .sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id))
      .slice(0, 30)
  }, [hashtags, getVoteCount])

  useEffect(() => {
    if (hasInitialized.current) return
    if (!predefinedHashtags || predefinedHashtags.length === 0) return
    
    hasInitialized.current = true
    const usedTags = new Set(hashtags.map(h => h.name))
    const availableTags = predefinedHashtags.filter((tag: string) => !usedTags.has(tag))
    const shuffled = [...availableTags].sort(() => 0.5 - Math.random())
    setShuffledTags(shuffled.slice(0, 8))
  }, [predefinedHashtags, hashtags])

  const suggestedTags = useMemo(() => {
    const usedTags = new Set(hashtags.map(h => h.name))
    return shuffledTags.filter((tag: string) => !usedTags.has(tag))
  }, [shuffledTags, hashtags])

  const handleRefresh = () => {
    if (!predefinedHashtags) return
    const usedTags = new Set(hashtags.map(h => h.name))
    const availableTags = predefinedHashtags.filter((tag: string) => !usedTags.has(tag))
    const shuffled = [...availableTags].sort(() => 0.5 - Math.random())
    setShuffledTags(shuffled.slice(0, 8))
  }

  const userVotes = useMemo(() => {
    return hashtags.filter(h => getUserVote(h.id)).length
  }, [hashtags, getUserVote])

  const canVote = userVotes < 3

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
      <div className="space-y-3">
        {!hideHeading && (
          <div className="flex items-center justify-between pt-4">
            <h3 className="text-lg font-medium">Market Tags</h3>
          </div>
        )}
        <motion.div className="flex flex-wrap gap-3">
          <AnimatePresence mode="popLayout">
            {marketHashtags.map((hashtag) => (
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
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {suggestedTags.length > 0 && user && (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-muted-foreground/70">Do any of these tags match?</h3>
            <button
              type="button"
              onClick={handleRefresh}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
              title="Refresh suggestions"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex flex-wrap gap-3 overflow-hidden max-w-full">
            {suggestedTags.map((tag: string) => (
              <button
                key={tag}
                onClick={() => handleAddSuggestedTag(tag)}
                disabled={isAddingTag}
                className={cn(
                  "relative inline-flex items-center gap-1 px-2 py-0.5 bg-white/50 rounded-full text-xs shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.06)] whitespace-nowrap",
                  "hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_4px_8px_rgba(0,0,0,0.08)] hover:bg-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <span className="text-primary font-bold text-[10px]">+</span>
                <span className="font-medium">{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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
