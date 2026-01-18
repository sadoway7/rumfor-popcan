import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { CommentReactions } from './CommentReactions'
import { useComments } from '@/features/community/hooks/useComments'
import { Comment } from '@/types'
import { cn } from '@/utils/cn'
import styles from './CommentList.module.css'

interface CommentItemProps {
  comment: Comment
  marketId: string
  depth?: number
  maxDepth?: number
  onReply?: (commentId: string) => void
  className?: string
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  marketId,
  depth = 0,
  maxDepth = 3,
  onReply,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [replyContent, setReplyContent] = useState('')
  
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
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else if (diffInHours < 168) { // 7 days
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} days ago`
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

    try {
      await createComment(replyContent.trim(), comment.id)
      setIsReplying(false)
      setReplyContent('')
      onReply?.(comment.id) // Refresh parent if needed
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
  const canEdit = comment.userId === 'user-1' // Assuming current user ID
  const canDelete = comment.userId === 'user-1' // Assuming current user ID

  return (
    <li style={{ '--depth': depth, '--nested': depth > 0 ? 'true' : 'false' } as React.CSSProperties} className={cn('comment-item', className)}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar
          src={comment.user.avatar}
          alt={`${comment.user.firstName} ${comment.user.lastName}`}
          fallback={`${comment.user.firstName[0]}${comment.user.lastName[0]}`}
          size="sm"
        />
      
      {/* Comment Content */}
      <div className="flex-1 min-w-0 comment-content">
        <Card className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {comment.user.firstName} {comment.user.lastName}
              </span>
              <span className="text-xs text-muted-foreground">
                {comment.user.role}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.createdAt)}
              </span>
              {comment.updatedAt !== comment.createdAt && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>
            
            {/* Actions */}
            {(canEdit || canDelete) && (
              <div className="flex items-center gap-1">
                {canEdit && !isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isUpdating}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Content */}
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                rows={3}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={isUpdating || !editContent.trim()}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
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
            <p
              dir="auto"
              className={cn(
                "text-sm leading-relaxed mb-3",
                /^\p{Emoji}+$/u.test(comment.content.trim()) && styles.emojiOnly
              )}
            >
              {comment.content}
            </p>
          )}
          
          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center justify-between">
              {/* Reactions */}
              <CommentReactions
                commentId={comment.id}
                reactions={comment.reactions}
                onAddReaction={handleReaction}
                onRemoveReaction={handleRemoveReaction}
                isLoading={isReacting}
              />
              
              {/* Reply Button */}
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  Reply
                </Button>
              )}
            </div>
          )}
        </Card>
        
        {/* Reply Form */}
        {isReplying && (
          <div className="mt-3 ml-4 space-y-3">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleReply}
                disabled={!replyContent.trim()}
              >
                Reply
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsReplying(false)
                  setReplyContent('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <ul style={{ '--depth': depth + 1, '--nested': 'true' } as React.CSSProperties} className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <li key={reply.id}>
                <CommentItem
                  comment={reply}
                  marketId={marketId}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  onReply={onReply}
                />
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
    </li>
  )
}

export default CommentItem