import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
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
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('p-6', className)}>
      {/* Upload Section - Top */}
      {showUpload && user && (
        <div className="mb-6">
          {!showUploader ? (
            <Button
              onClick={() => setShowUploader(true)}
              disabled={isUploading}
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Photos
            </Button>
          ) : (
            <PhotoUploader
              marketId={marketId}
              onUploadComplete={handleUploadComplete}
            />
          )}
        </div>
      )}



      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Add Photo Button - First Grid Item */}
        {showUpload && user && (
          <div
            onClick={() => setShowUploader(true)}
            className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center hover:border-accent hover:bg-accent/5 transition-colors cursor-pointer group"
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center mx-auto mb-2 transition-colors">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-accent">Add Photo</p>
            </div>
          </div>
        )}

        {/* Existing Photos */}
        {photos.map((photo) => (
          <PhotoThumbnail
            key={photo.id}
            photo={photo}
            onClick={() => handlePhotoClick(photo.id)}
            onDelete={photo.userId === user?.id ? () => handleDeletePhoto(photo.id) : undefined}
            showActions={true}
          />
        ))}

        {/* Empty State Message when no photos and no upload button */}
        {photos.length === 0 && (!showUpload || !user) && (
          <div className="col-span-full flex flex-col items-center justify-center py-8 px-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-700">
              No photos yet
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Be the first to share photos from this market!
            </p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {photos.length >= 20 && (
        <div className="text-center pt-6">
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
    </div>
  )
}

export default PhotoGallery