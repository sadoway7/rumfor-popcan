import React from 'react'
import { cn } from '@/utils/cn'

interface TrackButtonProps {
  isTracked: boolean
  onClick: (e: React.MouseEvent) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  status?: string
}

const STATUS_COLORS: Record<string, string> = {
  interested: '#3B82F6',
  applied: '#EAB308',
  approved: '#22C55E',
  attending: '#10B981',
  declined: '#F97316',
  canceled: '#EF4444',
  cancelled: '#EF4444',
  completed: '#6B7280',
  archived: '#64748B',
}

export const TrackButton = React.forwardRef<HTMLButtonElement, TrackButtonProps>(({
  isTracked,
  onClick,
  disabled,
  className,
  size = 'md',
  status
}, ref) => {
  const sizeClasses = {
    sm: 'w-9 h-11',
    md: 'w-11 h-14',
    lg: 'w-14 h-17',
  }

  const fillColor = isTracked && status ? (STATUS_COLORS[status] || '#22C55E') : (isTracked ? '#22C55E' : '#FFFFFF')

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={cn(
        "relative drop-shadow-md active:scale-95 transition-transform",
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{ background: 'none', border: 'none', padding: 0 }}
    >
      <svg
        viewBox="0 0 24 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <pattern id="stripes" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
          </pattern>
          <clipPath id="bookmarkClip">
            <path d="M2 4C2 2.89543 2.89543 2 4 2H20C21.1046 2 22 2.89543 22 4V30L12 22L2 30V4Z" />
          </clipPath>
        </defs>
        <path
          d="M2 4C2 2.89543 2.89543 2 4 2H20C21.1046 2 22 2.89543 22 4V30L12 22L2 30V4Z"
          fill={fillColor}
          stroke="#9CA3AF"
          strokeWidth="1"
        />
        {isTracked && (
          <g clipPath="url(#bookmarkClip)">
            <rect x="0" y="0" width="24" height="32" fill="url(#stripes)" />
          </g>
        )}
      </svg>
    </button>
  )
})
