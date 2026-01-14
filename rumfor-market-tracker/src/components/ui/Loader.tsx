import React from 'react'
import { cn } from '@/utils/cn'

export interface ShimmerProps {
  className?: string
  lines?: number
}

export interface SkeletonProps {
  className?: string
  animate?: boolean
}

export interface PageLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}

// Shimmer loading effect for content areas
export function Shimmer({ className, lines = 3 }: ShimmerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded"
          style={{
            width: index === 0 ? '100%' : index === 1 ? '80%' : '60%',
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </div>
  )
}

// Skeleton loader for specific shapes
export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted rounded-md",
        animate && "animate-pulse",
        className
      )}
    />
  )
}

// Full page loader
export function PageLoader({ size = 'md', message = 'Loading...', className }: PageLoaderProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div className={cn("border-2 border-current border-t-transparent rounded-full animate-spin", sizes[size])} />
      {message && (
        <p className="text-sm text-muted-foreground animate-fade-in">{message}</p>
      )}
    </div>
  )
}

// Button loading state enhancer
export function LoadingButton({ children, loading, ...props }: { children: React.ReactNode, loading?: boolean, [key: string]: any }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        props.className,
        loading && "cursor-not-allowed opacity-70"
      )}
    >
      {loading ? (
        <span className="flex items-center space-x-2">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}