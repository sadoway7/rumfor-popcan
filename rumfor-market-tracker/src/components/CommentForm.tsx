import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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
  const [rows, setRows] = useState(1)
  
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
      setRows(1)
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

    // Update rows based on content lines, max 5
    const lines = e.target.value.split('\n').length
    setRows(Math.min(5, Math.max(1, lines)))
  }

  if (!user) {
    return (
      <div className={cn('p-4 border border-zinc-200 rounded-lg bg-zinc-50', className)}>
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-zinc-800">
            Join the conversation
          </p>
          <div>
            <Link to="/auth/login">
              <Button>
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn('w-full', className)}>
      <div className="relative group w-full">
        <div className="flex flex-col bg-white rounded-[22px] pl-3 pr-5 py-3 transition-all border border-zinc-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-zinc-500 focus-within:border-zinc-900 focus-within:shadow-[0_15px_40px_rgba(0,0,0,0.08)] focus-within:ring-1 focus-within:ring-zinc-900/5">
          <Textarea
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsExpanded(true)}
            placeholder={placeholder}
            rows={rows}
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
                    setRows(1)
                  }}
                  disabled={isCreating}
                  className="text-zinc-500 hover:text-zinc-900 text-[12px] font-bold rounded-full hover:bg-zinc-50 transition-all active:scale-95 h-6 min-h-0"
                >
                  Cancel
                </Button>
              )}
              
              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || isCreating || content.length > 1000}
                className={cn(
                  "bg-zinc-900 text-white rounded-full font-black text-[12px] hover:bg-black disabled:opacity-30 transition-all shadow-md shadow-zinc-200 disabled:shadow-none flex items-center gap-1 active:scale-95 h-6 min-h-0",
                  isCreating && "opacity-50"
                )}
              >
                {isCreating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Posting
                  </>
                ) : (
                  "Post"
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