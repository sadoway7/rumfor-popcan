import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Textarea } from '@/components/ui/Textarea'
import { CommentReactions } from './CommentReactions'
import { useComments } from '@/features/community/hooks/useComments'
import { useAuthStore } from '@/features/auth/authStore'
import { Comment } from '@/types'
import { cn } from '@/utils/cn'
import { getFullUploadUrl } from '@/config/constants'

interface CommentItemProps {
  comment: Comment
  marketId: string
  depth?: number
  maxDepth?: number
  index?: number
  onReply?: (commentId: string) => void
  className?: string
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  marketId,
  depth = 0,
  maxDepth = 3,
  index = 0,
  onReply,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [editContent, setEditContent] = useState(comment.content)
  const [replyContent, setReplyContent] = useState('')
  const [replyRows, setReplyRows] = useState(1)
  
  const { user } = useAuthStore()
  const {
    createComment,
    editComment,
    deleteComment,
    addReaction,
    removeReaction,
    isUpdating,
    isReacting,
  } = useComments(marketId)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 168) {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) return
    
    try {
      await editComment(comment.id, editContent.trim())
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to edit comment:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    try {
      await deleteComment(comment.id)
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const handleReply = async () => {
    if (!replyContent.trim()) return

    // Close immediately for better UX
    setIsReplying(false)
    setReplyContent('')
    setReplyRows(1)

    try {
      await createComment(replyContent.trim(), comment.id)
    } catch (error) {
      console.error('Failed to reply to comment:', error)
      // Optionally reopen on error
      setIsReplying(true)
      setReplyContent(replyContent)
    }
  }

  const handleReaction = async (commentId: string, type: 'like' | 'dislike' | 'love' | 'laugh') => {
    try {
      if (commentId === comment.id) {
        await addReaction(comment.id, type)
      }
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  const handleRemoveReaction = async (commentId: string) => {
    try {
      if (commentId === comment.id) {
        await removeReaction(comment.id)
      }
    } catch (error) {
      console.error('Failed to remove reaction:', error)
    }
  }

  const canReply = depth < maxDepth
  const canEdit = user?.id === comment.userId
  const canDelete = user?.id === comment.userId
  const hasChildren = comment.replies && comment.replies.length > 0

  // Collapsed state
  if (!isExpanded) {
    return (
      <li id={`comment-${comment.id}`} className={cn('relative', depth > 0 ? 'mt-3' : 'mt-4 first:mt-0', className)}>
        {depth > 0 && (
          <div className="absolute left-[-48px] top-[-60px] w-[48px] h-[80px] pointer-events-none z-0">
            <svg width="48" height="80" viewBox="0 0 48 80" fill="none" className="text-zinc-200/80">
              <path d="M1 0V60C1 67 5 72 8 72H48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setIsExpanded(true) }}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-all flex items-center justify-center text-zinc-600 hover:text-zinc-900 shadow-sm active:scale-95"
            title="Expand thread"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <Link 
              to={`/vendors/${comment.user.id}`}
              className="font-semibold text-[12px] hover:underline cursor-pointer decoration-2 underline-offset-2 tracking-tight text-zinc-900"
            >
              {comment.user.firstName} {comment.user.lastName}
            </Link>
            <span className="text-[11px] text-zinc-500">Thread collapsed</span>
            <span className="text-[11px] font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
              {(comment.replies?.length || 0) + 1} messages
            </span>
          </div>
        </div>
      </li>
    )
  }

  return (
      <li id={`comment-${comment.id}`} className={cn('relative', depth > 0 ? 'mt-4' : 'mt-4 first:mt-0', className)} data-depth={depth}>
        {depth > 0 && (
          <div className="absolute left-[-48px] top-[-60px] w-[48px] h-[80px] pointer-events-none z-0">
            <svg width="48" height="80" viewBox="0 0 48 80" fill="none" className="text-zinc-200/80">
              <path d="M1 0V60C1 67 5 72 8 72H48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
        
      <div className="group/thread flex gap-3 relative">
        {/* Avatar & Vertical Line Column */}
        <div className="flex flex-col items-center flex-shrink-0 w-8 relative group/avatar">
          <div className={cn(
            "relative z-20 rounded-full overflow-hidden border-[2.5px] border-white bg-white flex-shrink-0 shadow-lg transition-transform group-hover/thread:scale-105",
            depth === 0 ? 'w-10 h-10' : 'w-8 h-8',
            canEdit && 'ring-2 ring-zinc-900/10'
          )}>
            {/* Collapse Button - Centered on Avatar - Only shows when hovering THIS avatar */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover/avatar:opacity-100 transition-opacity z-30 rounded-full"
              title="Collapse thread"
            >
              <svg className="w-4 h-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {comment.user.avatar ? (
              <img
                src={getFullUploadUrl(comment.user.avatar)}
                alt={`${comment.user.firstName} ${comment.user.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#E67E22] bg-opacity-20 flex items-center justify-center text-[#E67E22] font-bold text-xs">
                {comment.user.firstName[0]}{comment.user.lastName[0]}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header Info */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="flex items-center gap-1.5">
              <Link 
                to={`/vendors/${comment.user.id}`}
                className="font-semibold text-[12px] hover:underline cursor-pointer decoration-2 underline-offset-2 tracking-tight text-zinc-900"
              >
                {comment.user.firstName} {comment.user.lastName}
              </Link>
              
              <span className="text-[12px] text-zinc-400 select-none">·</span>
              <span className="text-[11px] text-zinc-500">{formatDate(comment.createdAt)}</span>
            </div>
            
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-[10px] text-zinc-600">(edited)</span>
            )}
          </div>

          {/* Comment Body */}
          {isEditing ? (
            <div className="space-y-2 mt-1">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                rows={3}
                className="text-sm"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEdit}
                  disabled={isUpdating || !editContent.trim()}
                  className="rounded-full py-1.5 px-3 text-[11px] font-black uppercase tracking-wider bg-zinc-900 text-white hover:bg-black shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(comment.content)
                  }}
                  className="rounded-full py-1.5 px-3 text-[11px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-900 hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-100 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-[15px] leading-relaxed text-zinc-700 mt-1">
              <p dir="auto" className={cn(
                /^\p{Emoji}+$/u.test(comment.content.trim()) && "text-lg"
              )}>
                {comment.content}
              </p>
            </div>
          )}

          {/* Controls */}
          {!isEditing && !isReplying && (
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              {canReply && (
                <button
                  onClick={() => setIsReplying(true)}
                  className="flex items-center gap-1 text-[11px] font-bold transition-all py-1 px-2 rounded-full h-auto active:scale-95 text-zinc-500 hover:text-zinc-900"
                >
                  <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Reply
                </button>
              )}

              <CommentReactions
                commentId={comment.id}
                reactions={comment.reactions}
                onAddReaction={handleReaction}
                onRemoveReaction={handleRemoveReaction}
                isLoading={isReacting}
              />

              {/* Edit/Delete Menu */}
              {(canEdit || canDelete) && (
                <div className="flex items-center gap-1">
                  {canEdit && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 text-[11px] font-bold transition-all py-1 px-2 rounded-full h-auto active:scale-95 text-zinc-500 hover:text-zinc-900"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      disabled={isUpdating}
                      className="flex items-center gap-1 text-[11px] font-bold transition-all py-1 px-2 rounded-full h-auto active:scale-95 text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Nested Content */}
          <div className="space-y-0">
            {/* Reply Form */}
            {isReplying && (
              <div className="mt-2">
                <div className="flex flex-row items-center gap-2 bg-white rounded-[22px] pl-3 pr-2 py-1.5 border border-zinc-300 shadow-sm">
                    <div className="flex-1 min-w-0">
                      <Textarea
                        value={replyContent}
                        onChange={(e) => {
                          setReplyContent(e.target.value)
                          const lines = e.target.value.split('\n').length
                          setReplyRows(Math.min(5, Math.max(1, lines)))
                        }}
                        placeholder={`Reply to ${comment.user.firstName}...`}
                        rows={replyRows}
                        className="w-full bg-transparent !border-none !outline-none !shadow-none focus:!outline-none focus:!ring-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 text-[14px] leading-normal resize-none py-0.5 text-zinc-900 placeholder-zinc-400 font-medium min-h-0"
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsReplying(false)
                          setReplyContent('')
                          setReplyRows(1)
                        }}
                        className="text-zinc-500 hover:text-zinc-900 text-[11px] font-bold rounded-full hover:bg-zinc-50 transition-all active:scale-95 h-7 min-h-0 px-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleReply}
                        disabled={!replyContent.trim()}
                        className="bg-[#E67E22] text-white !rounded-full font-black text-[11px] hover:bg-[#D35400] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-zinc-200 disabled:shadow-none flex items-center justify-center active:scale-95 h-9 w-9 min-h-0 p-0"
                      >
                        <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {/* Nested Replies */}
            {hasChildren && (
              <ul className="pl-4 mt-4 space-y-4">
                {comment.replies.map((reply, idx) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    marketId={marketId}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                    index={idx}
                    onReply={onReply}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

export default CommentItem
