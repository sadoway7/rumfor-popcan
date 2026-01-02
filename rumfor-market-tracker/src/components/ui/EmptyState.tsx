import React from 'react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  onAction?: () => void
  actionLabel?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'centered' | 'minimal'
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      title,
      description,
      icon,
      action,
      onAction,
      actionLabel = 'Get started',
      size = 'md',
      variant = 'default',
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
    }

    const iconSizes = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
    }

    const titleSizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    }

    const descriptionSizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    }

    const defaultIcon = (
      <svg
        className={cn(iconSizes[size], 'text-muted-foreground')}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-4v2m0 4v2m0-4h2m-2 0h-2m6-7a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )

    const layoutClasses = {
      default: 'flex items-start space-x-4',
      centered: 'flex flex-col items-center text-center space-y-4',
      minimal: 'flex items-center space-x-3',
    }

    return (
      <div
        ref={ref}
        className={cn(
          sizeClasses[size],
          layoutClasses[variant],
          className
        )}
        {...props}
      >
        <div className="flex-shrink-0">
          {icon || defaultIcon}
        </div>
        
        <div className={cn(
          'flex-1',
          variant === 'centered' && 'flex flex-col items-center'
        )}>
          {title && (
            <h3 className={cn(
              'font-medium text-foreground mb-2',
              titleSizes[size],
              variant === 'centered' && 'text-center'
            )}>
              {title}
            </h3>
          )}
          
          {(description || children) && (
            <div className={cn(
              'text-muted-foreground',
              descriptionSizes[size],
              variant === 'centered' && 'text-center max-w-sm',
              title ? 'mt-1' : ''
            )}>
              {description || children}
            </div>
          )}
          
          {(action || onAction) && (
            <div className={cn(
              'mt-4',
              variant === 'centered' && 'flex flex-col items-center space-y-2'
            )}>
              {action || (
                <Button onClick={onAction}>
                  {actionLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'

export { EmptyState }