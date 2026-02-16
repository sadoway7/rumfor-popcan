import React from 'react'
import { Bookmark, BookmarkPlus } from 'lucide-react'
import { cn } from '@/utils/cn'

interface TrackButtonProps {
  isTracked: boolean
  onClick: (e: React.MouseEvent) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const TrackButton: React.FC<TrackButtonProps> = ({
  isTracked,
  onClick,
  disabled,
  className,
  size = 'md'
}) => {
  const iconSize = size === 'sm' ? 22 : size === 'md' ? 28 : 32

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={cn(
        "inline-flex items-center justify-center transition-transform shadow-md",
        size === 'sm' && 'w-10 h-10 rounded-full',
        size === 'md' && 'w-12 h-12 rounded-full',
        size === 'lg' && 'w-14 h-14 rounded-full',
        isTracked ? 'bg-green-500' : 'bg-white',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {isTracked ? (
        <Bookmark
          size={iconSize}
          strokeWidth={2.5}
          className="text-white"
          fill="currentColor"
        />
      ) : (
        <BookmarkPlus
          size={iconSize}
          strokeWidth={2.5}
          className="text-gray-400"
        />
      )}
    </button>
  )
}
