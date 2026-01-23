import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { CommentReactions } from './CommentReactions'
import { useComments } from '@/features/community/hooks/useComments'
import { useAuthStore } from '@/features/auth/authStore'
import { Comment } from '@/types'
import { cn } from '@/utils/cn'

interface CommentItemProps {
  comment: Comment
  marketId: string
  depth?: number
  maxDepth?: number
  onReply?: (commentId: string) => void
  className?: string
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment: initialComment,
  marketId,
  depth = 0,
  maxDepth = 3,
  onReply,
  className
}) => {
  const [comment, setComment] = useState(initialComment)
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [editContent, setEditContent] = useState(comment.content)
  const [replyContent, setReplyContent] = useState('')
  
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
      setComment(prev => ({ ...prev, content: editContent.trim() }))
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

    try {
      await createComment(replyContent.trim(), comment.id)
      setIsReplying(false)
      setReplyContent('')
      onReply?.(comment.id)
    } catch (error) {
      console.error('Failed to reply to comment:', error)
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
      <li className={cn('relative', depth > 0 ? 'mt-3' : 'mt-4 first:mt-0', className)}>
        {depth > 0 && (
          <div className="absolute left-[-12px] top-[-38px] w-[12px] h-[58px] pointer-events-none z-0">
            <svg width="12" height="58" viewBox="0 0 12 58" fill="none" className="text-zinc-200/80">
              <path d="M1 0V44C1 49.5228 5.47715 54 4 54H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-all flex items-center justify-center text-zinc-600 hover:text-zinc-900 shadow-sm active:scale-95"
            title="Expand thread"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-zinc-900">{comment.user.firstName} {comment.user.lastName}</span>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight">Thread collapsed</span>
            <span className="text-[11px] font-bold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200 shadow-sm">
              {(comment.replies?.length || 0) + 1} messages
            </span>
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className={cn('relative', depth > 0 ? 'mt-3' : 'mt-4 first:mt-0', className)} data-depth={depth}>
      {/* Curved Connector Line for nested replies - TALLER */}
      {depth > 0 && (
        <div className="absolute left-[-12px] top-[-58px] w-[12px] h-[78px] pointer-events-none z-0">
          <svg width="12" height="78" viewBox="0 0 12 78" fill="none" className="text-zinc-200">
            <path
              d="M1 0V64C1 69.5228 5.47715 74 4 74H12"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      <div className="group/thread flex gap-4 relative">
        {/* Avatar & Vertical Line Column */}
        <div className="flex flex-col items-center flex-shrink-0 w-10 relative group/avatar">
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
                src={comment.user.avatar}
                alt={`${comment.user.firstName} ${comment.user.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-xs">
                {comment.user.firstName[0]}{comment.user.lastName[0]}
              </div>
            )}
          </div>
          
          {/* Vertical Line connecting to children */}
          {(hasChildren || isReplying) && (
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute left-1/2 -translate-x-1/2 top-10 bottom-[-30px] w-[2px] bg-zinc-100 hover:bg-zinc-300 transition-all duration-300 group/line z-10 rounded-full"
              title="Collapse thread"
            >
              <div className="absolute inset-y-0 -left-2 -right-2 hidden group-hover/line:block cursor-pointer" />
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 relative">
          {/* Header Info */}
          <div className="flex items-center gap-2 mb-1.5 mt-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[14px] hover:underline cursor-pointer decoration-2 underline-offset-2 tracking-tight text-zinc-900">
                {comment.user.firstName} {comment.user.lastName}
              </span>
              
              {/* Role Badges */}
              {comment.user.role === 'vendor' && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-wider rounded">
                  <svg className="w-2.5 h-2.5 fill-white/20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Vendor
                </span>
              )}
              
              {comment.user.role === 'promoter' && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-wider rounded">
                  <svg className="w-2.5 h-2.5 fill-white/20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                  </svg>
                  Promoter
                </span>
              )}
              
              {canEdit && (
                <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/60">
                  Author
                </span>
              )}
            
              <span className="text-[13px] text-zinc-500 font-bold select-none">·</span>
              <span className="text-[11px] text-zinc-700 font-bold uppercase tracking-wide">{formatDate(comment.createdAt)}</span>
            </div>
            
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-[10px] text-zinc-600">(edited)</span>
            )}
          </div>

          {/* Comment Body */}
          {isEditing ? (
            <div className="space-y-2 mt-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                rows={3}
                className="text-sm"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleEdit}
                  disabled={isUpdating || !editContent.trim()}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(comment.content)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className={cn(
              "relative text-[14.5px] leading-relaxed text-zinc-700 px-3 py-2 rounded-[20px] border shadow-sm bg-white border-zinc-300",
              depth === 0 ? 'ring-[4px] ring-zinc-50/30 font-medium' : 'font-normal'
            )}>
              {/* Floating Reaction Button */}
              <div className="absolute -top-3 -right-2 z-10">
                <CommentReactions
                  commentId={comment.id}
                  reactions={comment.reactions}
                  onAddReaction={handleReaction}
                  onRemoveReaction={handleRemoveReaction}
                  isLoading={isReacting}
                />
              </div>
              
              <p dir="auto" className={cn(
                /^\p{Emoji}+$/u.test(comment.content.trim()) && "text-lg"
              )}>
                {comment.content}
              </p>
            </div>
          )}

          {/* Controls */}
          {!isEditing && !isReplying && (
            <div className="flex items-center gap-3 mt-2 px-1 flex-wrap">
              {canReply && (
                <button
                  onClick={() => setIsReplying(true)}
                  className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider transition-all py-1.5 px-3 rounded-full h-auto active:scale-95 text-zinc-500 hover:text-zinc-900 hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-100"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Reply
                </button>
              )}

              {/* Edit/Delete Menu */}
              {(canEdit || canDelete) && (
                <div className="ml-auto flex items-center gap-1">
                  {canEdit && !isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleDelete}
                      disabled={isUpdating}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Nested Content */}
          <div className="space-y-0">
            {/* Reply Form */}
            {isReplying && (
              <div className="mt-3">
                <div className="pl-[12px] relative">
                  <div className="absolute left-0 top-[-48px] w-[12px] h-[68px] pointer-events-none z-0">
                    <svg width="12" height="68" viewBox="0 0 12 68" fill="none" className="text-zinc-200">
                      <path d="M1 0V54C1 59.5228 5.47715 64 4 64H12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="bg-white rounded-[22px] px-4 py-3 border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${comment.user.firstName}...`}
                      rows={2}
                      className="w-full bg-transparent !border-none !outline-none !shadow-none focus:!outline-none focus:!ring-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 text-[14px] leading-normal resize-none py-0 text-zinc-900 placeholder-zinc-400 font-medium min-h-0"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-2.5 mt-2 pt-2 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsReplying(false)
                          setReplyContent('')
                        }}
                        className="text-zinc-600 hover:text-zinc-900 text-[12px] font-bold px-3.5 py-1.5 rounded-full hover:bg-zinc-50 transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleReply}
                        disabled={!replyContent.trim()}
                        className="bg-zinc-900 text-white text-[12px] font-bold px-4 py-2 rounded-full hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm shadow-zinc-200 disabled:shadow-none active:scale-95"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Nested Replies */}
            {hasChildren && (
              <ul className="pl-[12px] mt-3 space-y-0">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    marketId={marketId}
                    depth={depth + 1}
                    maxDepth={maxDepth}
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
