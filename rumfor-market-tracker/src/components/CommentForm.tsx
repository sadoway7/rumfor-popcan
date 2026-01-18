import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
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
    <form onSubmit={handleSubmit} className={cn('w-full', className)}>
      <div className="relative group w-full">
        <div className="flex flex-col bg-white rounded-[22px] px-5 py-3 transition-all border border-zinc-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-zinc-300 focus-within:border-zinc-900 focus-within:shadow-[0_15px_40px_rgba(0,0,0,0.08)] focus-within:ring-1 focus-within:ring-zinc-900/5">
          <Textarea
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsExpanded(true)}
            placeholder={placeholder}
            rows={1}
            autoFocus={autoFocus}
            className="w-full bg-transparent !border-none !outline-none !shadow-none focus:!outline-none focus:!ring-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 text-[15px] leading-normal resize-none py-1 text-zinc-900 placeholder-zinc-400 font-semibold min-h-0"
            disabled={isCreating}
          />
          
          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-between mt-1.5 h-9">
            {/* Left Actions */}
            <div className="flex items-center gap-1">
              {isExpanded && content.length > 800 && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-md",
                  content.length > 1000 ? "text-red-600 bg-red-50" : "text-zinc-500"
                )}>
                  {content.length}/1000
                </span>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {isExpanded && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsExpanded(false)
                    setContent('')
                  }}
                  disabled={isCreating}
                  className="text-zinc-500 hover:text-zinc-900 text-[12px] font-bold px-4 py-1.5 rounded-full hover:bg-zinc-50 transition-all h-auto active:scale-95"
                >
                  Cancel
                </Button>
              )}
              
              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || isCreating || content.length > 1000}
                className={cn(
                  "bg-zinc-900 text-white px-5 py-2 rounded-full font-black text-[12px] hover:bg-black disabled:opacity-30 transition-all shadow-md shadow-zinc-200 disabled:shadow-none flex items-center gap-2 h-auto active:scale-95 group/btn",
                  isCreating && "opacity-50"
                )}
              >
                {isCreating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Posting
                  </>
                ) : (
                  <>
                    Post
                    <svg className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {createError && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {createError}
        </div>
      )}
    </form>
  )
}

export default CommentForm