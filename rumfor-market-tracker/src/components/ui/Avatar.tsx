import React from 'react'
import { cn } from '@/utils/cn'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square' | 'rounded'
  online?: boolean
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  shape = 'circle',
  online = false,
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  }

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-md',
  }

  const getInitials = (text: string) => {
    return text
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center font-medium text-foreground bg-surface border border-border overflow-hidden',
        sizeClasses[size],
        shapeClasses[shape],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Hide broken image and show fallback
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <span className="select-none">
          {fallback ? getInitials(fallback) : '?'}
        </span>
      )}
      
      {online && (
        <span
          className={cn(
            'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background',
            'bg-success'
          )}
          aria-label="Online"
        />
      )}
    </div>
  )
}

Avatar.displayName = 'Avatar'

// Avatar group component for multiple avatars
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  max?: number
  showCount?: boolean
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  size = 'md',
  max = 5,
  showCount = true,
  className,
  ...props
}) => {
  const avatars = React.Children.toArray(children).filter(Boolean) as React.ReactElement[]
  const visibleAvatars = avatars.slice(0, max)
  const remainingCount = Math.max(0, avatars.length - max)

  return (
    <div
      className={cn('flex -space-x-2', className)}
      {...props}
    >
      {visibleAvatars.map((avatar, index) =>
        React.cloneElement(avatar, {
          key: index,
          className: cn(
            'border-2 border-background',
            avatar.props.className
          )
        })
      )}
      
      {remainingCount > 0 && showCount && (
        <div
          className={cn(
            'relative inline-flex items-center justify-center font-medium text-muted-foreground bg-surface border-2 border-background',
            size === 'sm' && 'h-8 w-8 text-xs',
            size === 'md' && 'h-10 w-10 text-sm',
            size === 'lg' && 'h-12 w-12 text-base',
            size === 'xl' && 'h-16 w-16 text-lg',
            'rounded-full'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

AvatarGroup.displayName = 'AvatarGroup'

export { Avatar, AvatarGroup }