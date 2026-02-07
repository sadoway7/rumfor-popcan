import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
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
    <div className={cn('p-0 md:p-3 pt-6 px-3 sm:px-0', className)}>
      {/* Modern Comment Form */}
      <div className="mb-6">
        <CommentForm
          marketId={marketId}
          placeholder="Share your perspective..."
          onSubmit={handleRefresh}
        />
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 sm:px-0">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-700">
            No comments yet
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="px-4 sm:px-0">
          <ul style={{ '--depth': 0 } as React.CSSProperties} className={cn('space-y-6', styles.commentList)}>
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