import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'accent' | 'muted' | 'success' | 'warning' | 'destructive'
}

const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  (
    {
      className,
      size = 'md',
      color = 'default',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'spinner'

    const sizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-6 h-6',
    }

    const colors = {
      default: 'text-foreground',
      accent: 'text-accent',
      muted: 'text-muted-foreground',
      success: 'text-success',
      warning: 'text-warning',
      destructive: 'text-destructive',
    }

    return (
      <span
        ref={ref}
        className={cn(
          baseClasses,
          sizes[size],
          colors[color],
          className
        )}
        {...props}
      >
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </span>
    )
  }
)

Spinner.displayName = 'Spinner'

export { Spinner }