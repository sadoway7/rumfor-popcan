import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Photo } from '@/types'
import { cn } from '@/utils/cn'

interface PhotoThumbnailProps {
  photo: Photo
  onClick?: () => void
  onDelete?: () => void
  showActions?: boolean
  className?: string
}

export const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({
  photo,
  onClick,
  onDelete,
  showActions = false,
  className
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleClick = () => {
    onClick?.()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.()
  }

  return (
    <Card 
      className={cn(
        'group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg',
        className
      )}
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Failed to load</p>
            </div>
          </div>
        ) : (
          <img
            src={photo.thumbnailUrl || photo.url}
            alt={photo.caption || 'Market photo'}
            className={cn(
              'w-full h-full object-cover transition-all duration-200',
              'group-hover:scale-105',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        {/* Overlay Actions */}
        {showActions && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClick}
                className="bg-background/90"
              >
                View
              </Button>
              {photo.userId === 'user-1' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="bg-background/90"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Approval Status Badge */}
        {!photo.isApproved && (
          <div className="absolute top-2 left-2">
            <Badge variant="warning" size="sm">
              Pending Review
            </Badge>
          </div>
        )}
      </div>
      
      {/* Photo Info */}
      <div className="p-3 space-y-2">
        {/* Caption */}
        {photo.caption && (
          <p className="text-sm font-medium line-clamp-2">
            {photo.caption}
          </p>
        )}
        
        {/* Tags */}
        {photo.tags && photo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {photo.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
            {photo.tags.length > 3 && (
              <Badge variant="outline" size="sm">
                +{photo.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Photo Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar
              src={photo.user.avatar}
              alt={`${photo.user.firstName} ${photo.user.lastName}`}
              fallback={`${photo.user.firstName[0]}${photo.user.lastName[0]}`}
              size="sm"
            />
            <span>
              {photo.user.firstName} {photo.user.lastName}
            </span>
          </div>
          
          <span>{formatDate(photo.createdAt)}</span>
        </div>
        
        {/* Taken Date */}
        {photo.takenAt && (
          <div className="text-xs text-muted-foreground">
            Taken: {formatDate(photo.takenAt)}
          </div>
        )}
      </div>
    </Card>
  )
}

export default PhotoThumbnail