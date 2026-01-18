import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { CommentForm } from './CommentForm'
import { CommentItem } from './CommentItem'
import { useComments } from '@/features/community/hooks/useComments'
import { cn } from '@/utils/cn'
import styles from './CommentList.module.css'

interface CommentListProps {
  marketId: string
  className?: string
}

export const CommentList: React.FC<CommentListProps> = ({
  marketId,
  className
}) => {
  const [showAllComments, setShowAllComments] = useState(false)
  
  const {
    comments,
    isLoading,
    error,
    loadMoreComments,
    refreshComments,
  } = useComments(marketId)

  // Get top-level comments for display control
  const topLevelComments = comments.filter(comment => !comment.parentId)

  // Show all or limited top-level comments
  const visibleTopLevelComments = showAllComments ? topLevelComments : topLevelComments.slice(0, 3)
  
  const handleReply = async (_commentId: string) => {
    // This will trigger a refresh after reply is created
    // The actual reply creation is handled by the CommentItem's reply form
    await refreshComments()
  }

  const handleLoadMore = () => {
    loadMoreComments()
  }

  const handleRefresh = () => {
    refreshComments()
  }

  if (isLoading && comments.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading comments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('py-8', className)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to load comments</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Comments ({comments.length})
          </h2>
        </div>

        <Button
          onClick={handleRefresh}
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {isLoading ? (
            <Spinner className="h-3 w-3" />
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

      {/* Comment Form */}
      <CommentForm
        marketId={marketId}
        placeholder="Share your thoughts about this market..."
        onSubmit={handleRefresh}
      />

      {/* Comments List */}
      {comments.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
          title="No comments yet"
          description="Be the first to share your thoughts about this market!"
          action={
            <Button onClick={() => document.querySelector('textarea')?.focus()}>
              Write First Comment
            </Button>
          }
        />
      ) : (
        <div>
          <ul style={{ '--depth': 0, '--lines': 'true', '--size': '2rem' } as React.CSSProperties} className={cn('space-y-4', styles.commentList)}>
            {visibleTopLevelComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                marketId={marketId}
                onReply={handleReply}
              />
            ))}
          </ul>

          {/* Show More/Less Button */}
          {topLevelComments.length > 3 && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAllComments(!showAllComments)}
              >
                {showAllComments ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Show Less
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Show {topLevelComments.length - 3} More Comments
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Load More Button for Pagination */}
      {comments.length >= 20 && !showAllComments && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Loading...
              </div>
            ) : (
              'Load More Comments'
            )}
          </Button>
        </div>
      )}


    </div>
  )
}

export default CommentList