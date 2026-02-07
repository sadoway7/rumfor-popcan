import React from 'react'
import { cn } from '@/utils/cn'

export interface PulseDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  color?: 'accent' | 'orange' | 'default' | 'success' | 'warning' | 'destructive'
}

const sizeClasses = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
}

const colorClasses = {
  accent: 'bg-accent',
  orange: 'bg-orange-400',
  default: 'bg-foreground',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
}

export const PulseDots: React.FC<PulseDotsProps> = ({
  className,
  size = 'md',
  color = 'accent',
  ...props
}) => {
  return (
    <div
      className={cn('flex items-center justify-center gap-1.5', className)}
      {...props}
    >
      <span
        className={cn('rounded-full animate-ping opacity-75', sizeClasses[size], colorClasses[color])}
        style={{ animationDelay: '0ms' }}
      />
      <span
        className={cn('rounded-full animate-ping opacity-75', sizeClasses[size], colorClasses[color])}
        style={{ animationDelay: '150ms' }}
      />
      <span
        className={cn('rounded-full animate-ping opacity-75', sizeClasses[size], colorClasses[color])}
        style={{ animationDelay: '300ms' }}
      />
    </div>
  )
}

// Alternative: use PulseDots component instead of Spinner for loading states
// It's cleaner and works well for inline loading indicators
// 
// Example usage:
// <PulseDots size="md" color="orange" />
// <PulseDots size="sm" color="accent" />
