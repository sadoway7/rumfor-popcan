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
    <form onSubmit={handleSubmit} className={cn('w-full px-2 max-w-[500px] mx-auto', className)}>
      <div className="relative group w-full">
        <div className="flex flex-row items-center gap-2 bg-white rounded-[22px] pl-3 pr-2 py-1.5 transition-all border border-zinc-300 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.02)] hover:border-zinc-400 focus-within:border-zinc-500 focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.04)] focus-within:ring-1 focus-within:ring-zinc-500/10">
          <div className="flex-1 min-w-0">
            <Textarea
              value={content}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsExpanded(true)}
              placeholder={placeholder}
              rows={Math.max(1, Math.min(rows, 6))}
              autoFocus={autoFocus}
              className="w-full bg-transparent !border-none !outline-none !shadow-none focus:!outline-none focus:!ring-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 text-[14px] leading-normal resize-none py-0.5 text-zinc-900 placeholder-zinc-400 font-medium min-h-0"
              disabled={isCreating}
            />
          </div>
          
          {/* Right Actions - inline with textarea */}
          <div className="flex items-end gap-1 pb-0.5 flex-shrink-0">
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
                className="text-zinc-500 hover:text-zinc-900 text-[11px] font-bold rounded-full hover:bg-zinc-50 transition-all active:scale-95 h-7 min-h-0 px-2 mb-0.5"
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={!content.trim() || isCreating || content.length > 1000}
              className={cn(
                "bg-[#E67E22] text-white !rounded-full font-black text-[11px] hover:bg-[#D35400] disabled:opacity-30 transition-all shadow-md shadow-zinc-200 disabled:shadow-none flex items-center justify-center active:scale-95 h-9 w-9 min-h-0 p-0 mb-0.5",
                isCreating && "opacity-50"
              )}
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </Button>
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