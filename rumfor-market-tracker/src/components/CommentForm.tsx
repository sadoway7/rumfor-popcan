import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/features/auth/authStore'
import { useComments } from '@/features/community/hooks/useComments'
import { cn } from '@/utils/cn'

interface CommentFormProps {
  marketId: string
  parentId?: string
  placeholder?: string
  autoFocus?: boolean
  onSubmit?: () => void
  className?: string
}

export const CommentForm: React.FC<CommentFormProps> = ({
  marketId,
  parentId,
  placeholder = 'Write a comment...',
  autoFocus = false,
  onSubmit,
  className
}) => {
  const [content, setContent] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  
  const { user } = useAuthStore()
  const {
    createComment,
    isCreating,
    createError
  } = useComments(marketId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || isCreating) return
    
    try {
      await createComment(content.trim(), parentId)
      setContent('')
      setIsExpanded(false)
      onSubmit?.()
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    
    // Auto-expand when user starts typing
    if (e.target.value.trim() && !isExpanded) {
      setIsExpanded(true)
    }
  }

  if (!user) {
    return (
      <div className={cn('p-4 border border-border rounded-lg bg-muted/50', className)}>
        <p className="text-sm text-muted-foreground text-center">
          Please log in to join the conversation.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', className)}>
      {/* User Avatar and Input */}
      <div className="flex gap-3">
        <Avatar
          src={user.avatar}
          alt={`${user.firstName} ${user.lastName}`}
          fallback={`${user.firstName[0]}${user.lastName[0]}`}
          size="sm"
        />
        
        <div className="flex-1">
          <div className={cn(
            'relative transition-all duration-200',
            isExpanded ? 'space-y-3' : ''
          )}>
            <Textarea
              value={content}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsExpanded(true)}
              placeholder={placeholder}
              rows={isExpanded ? 3 : 1}
              autoFocus={autoFocus}
              className={cn(
                'resize-none transition-all duration-200',
                isExpanded ? 'min-h-[80px]' : 'min-h-[40px]'
              )}
              disabled={isCreating}
            />
            
            {/* Character Count */}
            {isExpanded && content.length > 0 && (
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  {content.length}/1000 characters
                </div>
                {content.length > 900 && (
                  <div className="text-xs text-warning">
                    {1000 - content.length} characters remaining
                  </div>
                )}
              </div>
            )}
            
            {/* Actions */}
            {isExpanded && (
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Press Ctrl+Enter to submit
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsExpanded(false)
                      setContent('')
                    }}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!content.trim() || isCreating || content.length > 1000}
                  >
                    {isCreating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Posting...
                      </div>
                    ) : (
                      'Post Comment'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {createError && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          {createError}
        </div>
      )}
      
      {/* Content Guidelines */}
      {isExpanded && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
          <div className="font-medium mb-1">Community Guidelines:</div>
          <ul className="space-y-1">
            <li>• Be respectful and constructive</li>
            <li>• Keep comments relevant to the market</li>
            <li>• No spam or promotional content</li>
            <li>• Use appropriate language</li>
          </ul>
        </div>
      )}
    </form>
  )
}

export default CommentForm