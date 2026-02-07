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
      accent: 'text-accent',
      default: 'text-foreground',
      success: 'text-success',
      warning: 'text-warning',
      destructive: 'text-destructive',
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
        <span className={cn("absolute inset-0 rounded-full opacity-20", colorClasses[color])} />
        <span className={cn("absolute inset-1 rounded-full border-2 border-transparent opacity-60", colorClasses[color], "border-t-current animate-spin")} />
        <span className={cn("absolute inset-3 rounded-full border border-transparent opacity-40", colorClasses[color], "border-t-current animate-spin")} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </span>
    )
  }
)

Spinner.displayName = 'Spinner'

export { Spinner }
