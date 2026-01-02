import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { CommentForm } from './CommentForm'
import { CommentItem } from './CommentItem'
import { useComments } from '@/features/community/hooks/useComments'
import { cn } from '@/utils/cn'

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

  // Filter comments by depth level for initial display
  const topLevelComments = comments.filter(comment => !comment.parentId)
  const displayComments = showAllComments ? comments : topLevelComments.slice(0, 3)
  
  // Separate top-level comments from replies
  const visibleComments = displayComments.filter(comment => !comment.parentId)
  
  const handleReply = async () => {
    // This will be handled by the CommentForm component
    // We could implement a state to track which comment is being replied to
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
          <p className="text-muted-foreground mb-4">{typeof error === 'string' ? error : error.message}</p>
          <Button onClick={handleRefresh} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Comments ({comments.length})
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Join the conversation about this market
          </p>
        </div>
        
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
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
        <div className="space-y-4">
          {visibleComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              marketId={marketId}
              onReply={handleReply}
            />
          ))}
          
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

      {/* Community Stats */}
      {comments.length > 0 && (
        <div className="pt-6 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-accent">
                {comments.filter(c => !c.parentId).length}
              </div>
              <div className="text-sm text-muted-foreground">Top-level comments</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">
                {comments.filter(c => c.parentId).length}
              </div>
              <div className="text-sm text-muted-foreground">Replies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">
                {new Set(comments.map(c => c.userId)).size}
              </div>
              <div className="text-sm text-muted-foreground">Unique commenters</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommentList