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
    sm: 'w-[25px] h-[30px]',
    md: 'w-8 h-10',
    lg: 'w-10 h-12',
  }

  const fillColor = isTracked && status ? (STATUS_COLORS[status] || '#22C55E') : (isTracked ? '#22C55E' : '#FFFFFF')
  
  // Generate unique gradient ID for this instance
  const [gradientId] = React.useState(() => `statusGradient-${Math.random().toString(36).substr(2, 9)}`)

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={cn(
        "relative active:scale-95",
        sizeClasses[size],
        disabled && 'cursor-not-allowed',
        className
      )}
      style={{ background: 'none', border: 'none', padding: 0 }}
    >
      <svg
        viewBox="0 0 26 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.75"/>
            <stop offset="100%" stopColor={fillColor} stopOpacity="1"/>
          </linearGradient>
        </defs>
        <path
          d="M3 0h20a3 3 0 0 1 3 3v29l-13-9L0 32V3a3 3 0 0 1 3-3z"
          fill={isTracked ? `url(#${gradientId})` : "#FFFFFF"}
        />
      </svg>
    </button>
  )
})
