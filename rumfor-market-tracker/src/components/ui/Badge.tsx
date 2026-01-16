import React from 'react'
import { cn } from '@/utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'muted' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  removable?: boolean
  onRemove?: () => void
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      dot = false,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'

    const variants = {
      default: 'bg-accent/10 text-accent border border-accent/20',
      success: 'bg-success/20 text-success border border-success/30',
      warning: 'bg-warning/20 text-warning border border-warning/30',
      destructive: 'bg-destructive/20 text-destructive border border-destructive/30',
      muted: 'bg-muted text-muted-foreground border border-border',
      outline: 'bg-transparent text-foreground border border-border',
    }

    const sizes = {
      sm: 'min-h-[24px] px-2 py-0.5 text-xs',
      md: 'min-h-[24px] px-2.5 py-0.5 text-xs',
      lg: 'min-h-[28px] px-3 py-1 text-sm',
    }

    return (
      <span
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full mr-1.5',
              variant === 'default' && 'bg-accent',
              variant === 'success' && 'bg-success',
              variant === 'warning' && 'bg-warning',
              variant === 'destructive' && 'bg-destructive',
              variant === 'muted' && 'bg-muted-foreground',
              variant === 'outline' && 'bg-foreground'
            )}
          />
        )}
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1.5 -mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-background/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            aria-label="Remove badge"
          >
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
              <path
                d="M9 3L3 9M3 3L9 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
