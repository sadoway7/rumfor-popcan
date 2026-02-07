import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'accent' | 'default' | 'success' | 'warning' | 'destructive'
}

const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  (
    {
      className,
      size = 'lg',
      color = 'accent',
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: 'h-5 w-5',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    }

    const colorClasses = {
      accent: 'bg-accent',
      default: 'bg-foreground',
      success: 'bg-success',
      warning: 'bg-warning',
      destructive: 'bg-destructive',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center',
          sizes[size],
          className
        )}
        {...props}
      >
        <span className={cn("absolute inset-0 rounded-full", colorClasses[color], "animate-ping opacity-75")} style={{ animationDuration: '2s' }} />
        <span className={cn("absolute inset-0 rounded-full", colorClasses[color], "animate-pulse opacity-50")} style={{ animationDuration: '2s' }} />
      </span>
    )
  }
)

Spinner.displayName = 'Spinner'

export { Spinner }
