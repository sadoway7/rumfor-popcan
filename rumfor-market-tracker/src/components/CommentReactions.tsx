 import React, { useState } from 'react'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/utils/cn'

interface CommentReactionsProps {
  commentId: string
  reactions: Array<{ id: string; userId: string; type: 'like' | 'dislike' | 'love' | 'laugh'; createdAt: string }>
  onAddReaction: (commentId: string, type: 'like' | 'dislike' | 'love' | 'laugh') => Promise<void>
  onRemoveReaction: (commentId: string) => Promise<void>
  isLoading?: boolean
  className?: string
}

const reactionEmojis = {
  like: '👍',
  dislike: '👎',
  love: '❤️',
  laugh: '😂'
}

const reactionLabels = {
  like: 'Like',
  dislike: 'Dislike',
  love: 'Love',
  laugh: 'Laugh'
}

export const CommentReactions: React.FC<CommentReactionsProps> = ({
  commentId,
  reactions,
  onAddReaction,
  onRemoveReaction,
  isLoading = false,
  className
}) => {
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null)

  // Get current user's reaction
  const userReaction = reactions.find(r => r.userId === 'user-1')

  // Calculate reaction counts
  const reactionCounts = reactions.reduce(
    (acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1
      return acc
    },
    { like: 0, dislike: 0, love: 0, laugh: 0 }
  )

  const handleReactionClick = async (type: 'like' | 'dislike' | 'love' | 'laugh') => {
    try {
      if (userReaction?.type === type) {
        // Remove existing reaction
        await onRemoveReaction(commentId)
      } else {
        // Add new reaction or change existing one
        await onAddReaction(commentId, type)
      }
    } catch (error) {
      console.error('Failed to handle reaction:', error)
    }
  }

  const totalCount = Object.values(reactionCounts).reduce((acc, count) => acc + count, 0)
  const hasReactions = totalCount > 0

  return (
    <div className={cn('relative flex items-center group/rx', className)}>
      {hasReactions ? (
        <div
          onClick={() => setHoveredReaction(hoveredReaction ? null : 'picker')}
          className={cn(
            "flex items-center transition-all rounded-full px-3 py-1.5 gap-2 cursor-pointer active:scale-95",
            hoveredReaction === 'picker' ? 'bg-zinc-900 text-white shadow-xl ring-2 ring-zinc-900/10' : 'bg-zinc-100 hover:bg-zinc-200'
          )}
        >
          <div className="flex -space-x-1">
            {Object.entries(reactionEmojis).slice(0, 3).filter(([type]) => reactionCounts[type as keyof typeof reactionCounts] > 0).map(([type, emoji]) => (
              <span key={type} className="text-[14px] hover:scale-110 transition-transform">
                {emoji}
              </span>
            ))}
          </div>
          <span className={cn('text-[12px] font-bold', hoveredReaction === 'picker' ? 'text-zinc-200' : 'text-zinc-600')}>
            {totalCount}
          </span>
          <span className={cn('text-[11px] font-bold', hoveredReaction === 'picker' ? 'text-zinc-300' : 'text-zinc-500')}>
            React
          </span>
        </div>
      ) : (
        <button
          onClick={() => setHoveredReaction(hoveredReaction ? null : 'picker')}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full transition-all text-[11px] font-bold",
            hoveredReaction === 'picker' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'
          )}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          React
        </button>
      )}

      {hoveredReaction === 'picker' && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 bg-white border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[24px] p-4 flex gap-2 animate-in fade-in zoom-in-95 duration-200 origin-bottom-center"
          onMouseLeave={() => setHoveredReaction(null)}
        >
          {Object.entries(reactionEmojis).map(([type, emoji]) => {
            const isActive = userReaction?.type === type
            return (
              <Tooltip key={type} content={reactionLabels[type as keyof typeof reactionLabels]}>
                <button
                  onClick={() => {
                    handleReactionClick(type as 'like' | 'dislike' | 'love' | 'laugh')
                    setHoveredReaction(null)
                  }}
                  disabled={isLoading}
                  className={cn(
                    "text-2xl w-12 h-12 flex items-center justify-center rounded-xl transition-all hover:scale-110 hover:bg-zinc-50 active:scale-95 flex-shrink-0",
                    isActive && 'bg-zinc-100 ring-2 ring-zinc-200'
                  )}
                  title={reactionLabels[type as keyof typeof reactionLabels]}
                >
                  {emoji}
                </button>
              </Tooltip>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CommentReactions