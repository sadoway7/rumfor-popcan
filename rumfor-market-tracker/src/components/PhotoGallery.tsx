import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { PhotoUploader } from './PhotoUploader'
import { PhotoThumbnail } from './PhotoThumbnail'
import { usePhotos } from '@/features/community/hooks/usePhotos'
import { useAuthStore } from '@/features/auth/authStore'
import { cn } from '@/utils/cn'

interface PhotoGalleryProps {
  marketId: string
  showUpload?: boolean
  onPhotoClick?: (photoId: string) => void
  className?: string
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  marketId,
  showUpload = false,
  onPhotoClick,
  className
}) => {
  const [showUploader, setShowUploader] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string>('')
  
  const { user } = useAuthStore()
  const {
    photos,
    isLoading,
    error,
    deletePhoto,
    loadMorePhotos,
    refreshPhotos,
    isUploading,
  } = usePhotos(marketId)

  // Get unique tags from all photos
  const allTags = photos.reduce<string[]>((tags, photo) => {
    if (photo.tags && photo.tags.length > 0) {
      photo.tags.forEach(tag => {
        if (!tags.includes(tag)) {
          tags.push(tag)
        }
      })
    }
    return tags
  }, [])

  // Calculate top-voted photo for hero selection transparency
  const getTopVotedPhoto = () => {
    if (photos.length === 0) return null
    // Mock vote calculation - in real app this would come from API
    const photosWithVotes = photos.map(photo => ({
      ...photo,
      mockVotes: Math.floor(Math.random() * 50) + 1 // Mock data
    }))
    return photosWithVotes.sort((a, b) => b.mockVotes - a.mockVotes)[0]
  }

  const topVotedPhoto = getTopVotedPhoto()

  // Filter photos by selected tag
  const filteredPhotos = selectedTag 
    ? photos.filter(photo => photo.tags?.includes(selectedTag))
    : photos

  const handlePhotoClick = (photoId: string) => {
    onPhotoClick?.(photoId)
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return
    
    try {
      await deletePhoto(photoId)
    } catch (error) {
      console.error('Failed to delete photo:', error)
    }
  }

  const handleLoadMore = () => {
    loadMorePhotos()
  }

  const handleRefresh = () => {
    refreshPhotos()
  }

  const handleUploadComplete = () => {
    setShowUploader(false)
    refreshPhotos()
  }

  if (isLoading && photos.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading photos...</p>
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
          <h3 className="text-lg font-semibold mb-2">Failed to load photos</h3>
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
            Photos ({photos.length})
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            See what this market looks like
          </p>
        </div>
        
        <div className="flex items-center gap-2">
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
          
          {showUpload && user && (
            <Button
              onClick={() => setShowUploader(!showUploader)}
              disabled={isUploading}
            >
              {showUploader ? 'Cancel' : 'Upload Photos'}
            </Button>
          )}
        </div>
      </div>

      {/* Upload Form */}
      {showUploader && (
        <PhotoUploader
          marketId={marketId}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Filter by tags:</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTag === '' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag('')}
            >
              All ({photos.length})
            </Button>
            {allTags.map((tag) => {
              const tagCount = photos.filter(photo => photo.tags?.includes(tag)).length
              return (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag} ({tagCount})
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="No photos yet"
          description={selectedTag ? `No photos found with tag "${selectedTag}"` : "Be the first to share photos from this market!"}
          action={
            showUpload && user ? (
              <Button onClick={() => setShowUploader(true)}>
                Upload First Photo
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Selected Tag Info */}
          {selectedTag && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Filtered by: {selectedTag}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTag('')}
              >
                Clear filter
              </Button>
            </div>
          )}
          
          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => {
              const isHeroPhoto = topVotedPhoto && photo.id === topVotedPhoto.id
              return (
                <div key={photo.id} className="relative">
                  <PhotoThumbnail
                    photo={photo}
                    onClick={() => handlePhotoClick(photo.id)}
                    onDelete={photo.userId === user?.id ? () => handleDeletePhoto(photo.id) : undefined}
                    showActions={true}
                  />
                  {isHeroPhoto && (
                    <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                      🏆 Top Voted
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Load More Button */}
          {photos.length >= 20 && (
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
                  'Load More Photos'
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Photo Statistics */}
      {photos.length > 0 && (
        <div className="pt-6 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-accent">
                {photos.length}
              </div>
              <div className="text-sm text-muted-foreground">Total photos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">
                {new Set(photos.map(p => p.userId)).size}
              </div>
              <div className="text-sm text-muted-foreground">Contributors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">
                {photos.filter(p => p.isApproved).length}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">
                {allTags.length}
              </div>
              <div className="text-sm text-muted-foreground">Unique tags</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoGallery