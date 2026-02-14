import React from 'react'
import { cn } from '@/utils/cn'
import { getFullUploadUrl } from '@/config/constants'

interface UserAvatarProps {
  user: {
    firstName?: string
    lastName?: string
    profileImage?: string
    vendorProfile?: { profileImage?: string }
    avatar?: string
  }
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header'
  shape?: 'circle' | 'square'
  className?: string
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase()
}

function getImageUrl(user: UserAvatarProps['user']): string | null {
  const rawUrl = user.vendorProfile?.profileImage || user.profileImage || user.avatar || null
  return rawUrl ? getFullUploadUrl(rawUrl) || null : null
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-28 h-28 text-4xl',
  header: 'w-10 h-10 md:w-9 md:h-9 text-xs',
}

const shapeClasses = {
  circle: 'rounded-full',
  square: 'rounded-lg',
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  shape = 'circle',
  className,
}) => {
  const imageUrl = getImageUrl(user)
  const initials = getInitials(user.firstName, user.lastName)

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
        className={cn(
          'object-cover flex-shrink-0',
          sizeClasses[size],
          shapeClasses[shape],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center font-bold flex-shrink-0',
        sizeClasses[size],
        shapeClasses[shape],
        className
      )}
    >
      {initials || '?'}
    </div>
  )
}

export default UserAvatar
