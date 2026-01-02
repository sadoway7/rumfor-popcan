import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
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

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Object.entries(reactionEmojis).map(([type, emoji]) => {
        const count = reactionCounts[type as keyof typeof reactionCounts]
        const isActive = userReaction?.type === type
        const isHovered = hoveredReaction === type

        return (
          <Tooltip key={type} content={reactionLabels[type as keyof typeof reactionLabels]}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 px-2 rounded-full transition-all duration-200',
                isActive && 'bg-accent/10 text-accent',
                isHovered && !isActive && 'bg-muted/50'
              )}
              disabled={isLoading}
              onClick={() => handleReactionClick(type as 'like' | 'dislike' | 'love' | 'laugh')}
              onMouseEnter={() => setHoveredReaction(type)}
              onMouseLeave={() => setHoveredReaction(null)}
            >
              <span className="text-sm mr-1">{emoji}</span>
              {count > 0 && (
                <span className={cn(
                  'text-xs font-medium',
                  isActive ? 'text-accent' : 'text-muted-foreground'
                )}>
                  {count}
                </span>
              )}
            </Button>
          </Tooltip>
        )
      })}
    </div>
  )
}

export default CommentReactions