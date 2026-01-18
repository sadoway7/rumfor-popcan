import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useHashtags } from '@/features/community/hooks/useHashtags'
import { useAuthStore } from '@/features/auth/authStore'
import { cn } from '@/utils/cn'

interface HashtagVotingProps {
  marketId: string
  showCreateForm?: boolean
  maxDisplayCount?: number
  className?: string
}

export const HashtagVoting: React.FC<HashtagVotingProps> = ({
  marketId,
  showCreateForm = false,
  maxDisplayCount = 20,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'votes' | 'name' | 'created'>('votes')
  const [isCreatingFormVisible, setIsCreatingFormVisible] = useState(showCreateForm)
  const [newHashtag, setNewHashtag] = useState('')
  
  const { user } = useAuthStore()
  const {
    hashtags,
    isLoading,
    error,
    createHashtag,
    voteHashtag,
    refreshHashtags,
    getUserVote,
    getVoteCount,
    getVoteCounts,
    sortHashtags,
    validateHashtagName,
    getSuggestedHashtags,
    isCreating,
    isVoting,
  } = useHashtags(marketId)

  // Filter and sort hashtags - hide low-signal tags (less than 3 votes net)
  const filteredSortedHashtags = sortHashtags(sortBy).filter(hashtag => {
    const voteCount = getVoteCount(hashtag.id)
    return voteCount >= -2 && (voteCount > 0 || voteCount === 0) // Hide negative/zero vote tags
  }).slice(0, maxDisplayCount)
  const suggestedHashtags = getSuggestedHashtags()

  const handleCreateHashtag = async () => {
    if (!newHashtag.trim() || isCreating) return
    
    const validation = validateHashtagName(newHashtag.trim())
    if (validation) {
      alert(validation)
      return
    }
    
    try {
      await createHashtag(newHashtag.trim())
      setNewHashtag('')
      setIsCreatingFormVisible(false)
    } catch (error) {
      console.error('Failed to create hashtag:', error)
    }
  }

  const handleVote = async (hashtagId: string, value: 1 | -1 | 0) => {
    try {
      await voteHashtag(hashtagId, value)
    } catch (error) {
      console.error('Failed to vote:', error)
    }
  }

  const handleSuggestedHashtagClick = (hashtag: string) => {
    setNewHashtag(hashtag)
  }

  if (isLoading && hashtags.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading hashtags...</p>
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
            Hashtags ({hashtags.length})
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Help categorize and discover this market
          </p>
        </div>
        
        <Button
          onClick={refreshHashtags}
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

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search hashtags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={sortBy === 'votes' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSortBy('votes')}
          >
            By Votes
          </Button>
          <Button
            variant={sortBy === 'name' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSortBy('name')}
          >
            By Name
          </Button>
          <Button
            variant={sortBy === 'created' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSortBy('created')}
          >
            By Date
          </Button>
        </div>
      </div>

      {/* Create Hashtag Form */}
      {isCreatingFormVisible && user && (
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Create New Hashtag</h3>
          
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter hashtag name..."
              value={newHashtag}
              onChange={(e) => setNewHashtag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateHashtag()
                }
              }}
              disabled={isCreating}
            />
            <Button
              onClick={handleCreateHashtag}
              disabled={!newHashtag.trim() || isCreating}
            >
              {isCreating ? (
                <Spinner className="h-4 w-4" />
              ) : (
                'Create'
              )}
            </Button>
          </div>
          
          {/* Suggested Hashtags */}
          {suggestedHashtags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Suggested hashtags:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedHashtags.slice(0, 10).map((hashtag: string) => (
                  <Button
                    key={hashtag}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedHashtagClick(hashtag)}
                  >
                    #{hashtag}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Hashtags List */}
      {filteredSortedHashtags.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
          title="No hashtags yet"
          description={searchTerm ? "No hashtags found matching your search." : "Be the first to add hashtags for this market!"}
          action={
            user && !isCreatingFormVisible ? (
              <Button onClick={() => setIsCreatingFormVisible(true)}>
                Create First Hashtag
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredSortedHashtags.map((hashtag: any) => {
            const userVote = getUserVote(hashtag.id)
            const voteCount = getVoteCount(hashtag.id)
            const voteCounts = getVoteCounts(hashtag.id)
            
            return (
              <Card key={hashtag.id} className="p-4">
                <div className="flex items-center justify-between">
                  {/* Hashtag Info */}
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-accent">
                      #{hashtag.name}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {voteCount >= 0 ? '+' : ''}{voteCount}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant={userVote?.value === 1 ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => handleVote(hashtag.id, userVote?.value === 1 ? 0 : 1)}
                          disabled={isVoting || !user}
                          className="h-11 w-11 p-0"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </Button>
                        
                        <Button
                          variant={userVote?.value === -1 ? 'destructive' : 'ghost'}
                          size="sm"
                          onClick={() => handleVote(hashtag.id, userVote?.value === -1 ? 0 : -1)}
                          disabled={isVoting || !user}
                          className="h-11 w-11 p-0"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Creator Info */}
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={hashtag.user.avatar}
                      alt={`${hashtag.user.firstName} ${hashtag.user.lastName}`}
                      fallback={`${hashtag.user.firstName[0]}${hashtag.user.lastName[0]}`}
                      size="sm"
                    />
                    <div className="text-xs text-muted-foreground">
                      by {hashtag.user.firstName} {hashtag.user.lastName}
                    </div>
                  </div>
                </div>
                
                {/* Vote Breakdown */}
                {(voteCounts.upvotes > 0 || voteCounts.downvotes > 0) && (
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{voteCounts.upvotes} upvote{voteCounts.upvotes !== 1 ? 's' : ''}</span>
                    <span>{voteCounts.downvotes} downvote{voteCounts.downvotes !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Hashtag Button */}
      {user && !isCreatingFormVisible && hashtags.length === 0 && (
        <div className="text-center">
          <Button onClick={() => setIsCreatingFormVisible(true)}>
            Create First Hashtag
          </Button>
        </div>
      )}

      {/* Show More Button */}
      {hashtags.length > maxDisplayCount && (
        <div className="text-center">
          <Button variant="outline">
            Show {hashtags.length - maxDisplayCount} More Hashtags
          </Button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          {error}
        </div>
      )}

      {/* Guidelines */}
      {user && (
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-2">Hashtag Guidelines</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use descriptive hashtags to help others find this market</li>
            <li>• Keep hashtags short and relevant (2-50 characters)</li>
            <li>• Vote on hashtags you find helpful or relevant</li>
            <li>• Only letters, numbers, underscores, and hyphens allowed</li>
            <li>• Hashtags are case-insensitive</li>
          </ul>
        </Card>
      )}
    </div>
  )
}

export default HashtagVoting
