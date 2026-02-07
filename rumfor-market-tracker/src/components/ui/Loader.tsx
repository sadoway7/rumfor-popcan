import React from 'react'
import { cn } from '@/utils/cn'

export interface ShimmerProps {
  className?: string
  lines?: number
}

export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export interface PageLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}

export function Shimmer({ className, lines = 3 }: ShimmerProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gradient-to-r from-muted via-muted/70 to-muted animate-pulse rounded"
          style={{
            width: index === lines - 1 ? '60%' : '100%',
            animationDelay: `${index * 0.15}s`
          }}
        />
      ))}
    </div>
  )
}

export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height 
}: SkeletonProps) {
  const variants = {
    text: 'rounded-sm',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return (
    <div
      className={cn(
        "bg-muted animate-pulse",
        variants[variant],
        className
      )}
      style={{ width, height }}
    />
  )
}

export function PageLoader({ size = 'lg', message = 'Loading...', className }: PageLoaderProps) {
  const sizes = { sm: 'h-8 w-8', md: 'h-12 w-12', lg: 'h-16 w-16' }
  const textSize = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }

  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <div className={cn("relative inline-flex items-center justify-center", sizes[size])}>
        <span className={cn("absolute inset-0 rounded-full bg-accent animate-ping opacity-75")} style={{ animationDuration: '2s' }} />
        <span className={cn("absolute inset-0 rounded-full bg-accent opacity-50 animate-pulse")} style={{ animationDuration: '2s' }} />
      </div>
      {message && <p className={cn("mt-6 text-muted-foreground font-medium", textSize[size])}>{message}</p>}
    </div>
  )
}

export function InlineLoader({ size = 'sm', className }: { size?: 'sm' | 'md', className?: string }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5' }
  
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("relative inline-flex items-center justify-center", sizes[size])}>
        <span className="absolute inset-0 rounded-full bg-current animate-ping opacity-75" style={{ animationDuration: '1.5s' }} />
        <span className="absolute inset-0 rounded-full bg-current opacity-50 animate-pulse" style={{ animationDuration: '1.5s' }} />
      </span>
    </span>
  )
}

export function LoadingButton({ 
  children, 
  loading, 
  variant = 'primary',
  size = 'md',
  className,
  ...props 
}: { 
  children: React.ReactNode, 
  loading?: boolean,
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive',
  size?: 'sm' | 'md' | 'lg',
  className?: string,
  [key: string]: any 
}) {
  const spinnerSize = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-4 w-4' }

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 disabled:pointer-events-none disabled:opacity-60",
        loading && "cursor-wait",
        {
          'min-h-[44px] px-4 text-base': size === 'sm',
          'min-h-[44px] px-5 text-base': size === 'md',
          'min-h-[48px] px-6 text-lg': size === 'lg',
        },
        {
          'bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/80': variant === 'primary',
          'bg-surface text-foreground hover:bg-surface/80 active:bg-surface/60': variant === 'secondary',
          'bg-transparent hover:bg-surface/50 active:bg-surface/30 text-foreground border border-border': variant === 'outline',
          'bg-transparent hover:bg-surface/50 active:bg-surface/30 text-foreground': variant === 'ghost',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80': variant === 'destructive',
        },
        className
      )}
    >
      {loading ? (
        <>
          <span className={cn("relative inline-flex items-center justify-center", spinnerSize[size])}>
            <span className="absolute inset-0 rounded-full bg-current animate-ping opacity-75" style={{ animationDuration: '1.5s' }} />
            <span className="absolute inset-0 rounded-full bg-current opacity-50 animate-pulse" style={{ animationDuration: '1.5s' }} />
          </span>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export function CircleLoader({ size = 'md', color = 'accent', className }: { size?: 'sm' | 'md' | 'lg', color?: 'accent' | 'default', className?: string }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
  const colorClass = color === 'accent' ? 'bg-accent' : 'bg-foreground'

  return (
    <div className={cn("relative inline-flex items-center justify-center", sizes[size], className)}>
      <span className={cn("absolute inset-0 rounded-full", colorClass, "animate-ping opacity-75")} style={{ animationDuration: '1.5s' }} />
      <span className={cn("absolute inset-0 rounded-full", colorClass, "animate-pulse opacity-50")} style={{ animationDuration: '1.5s' }} />
    </div>
  )
}

export function DotLoader({ size = 'md', color = 'accent', className }: { size?: 'sm' | 'md' | 'lg', color?: 'accent' | 'default', className?: string }) {
  const sizes = { sm: 'h-1.5 w-1.5', md: 'h-2.5 w-2.5', lg: 'h-3.5 w-3.5' }
  const colors = { accent: 'bg-accent', default: 'bg-foreground' }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {[0, 1, 2].map((i) => (
        <div key={i} className={cn("rounded-full animate-pulse", sizes[size], colors[color])} style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1.5s' }} />
      ))}
    </div>
  )
}

export function BarLoader({ width = 200, color = 'accent', className }: { width?: number, color?: 'accent' | 'default', className?: string }) {
  const colorClass = color === 'accent' ? 'bg-accent' : 'bg-foreground'

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden" style={{ width }}>
        <div className={cn("h-full rounded-full animate-pulse", colorClass)} style={{ animationDuration: '1.5s' }} />
      </div>
    </div>
  )
}

export function WaveLoader({ size = 'md', color = 'accent', className }: { size?: 'sm' | 'md' | 'lg', color?: 'accent' | 'default', className?: string }) {
  const heights = { sm: 'h-4', md: 'h-6', lg: 'h-8' }
  const colorClass = color === 'accent' ? 'bg-accent' : 'bg-foreground'

  return (
    <div className={cn("flex items-end gap-1", className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className={cn("w-1.5 rounded-full animate-pulse", heights[size], colorClass)} style={{ animationDelay: `${i * 0.1}s`, animationDuration: '1.5s', height: `calc(100% - ${i * 20}%)` }} />
      ))}
    </div>
  )
}

export function PulseLoader({ size = 'md', color = 'accent', className }: { size?: 'sm' | 'md' | 'lg', color?: 'accent' | 'default', className?: string }) {
  const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-14 w-14' }
  const colors = { accent: 'bg-accent', default: 'bg-foreground' }

  return (
    <div className={cn("relative inline-flex items-center justify-center", sizes[size], className)}>
      <span className={cn("absolute inset-0 rounded-full opacity-75 animate-ping", sizes[size], colors[color])} style={{ animationDuration: '2s' }} />
      <span className={cn("absolute inset-0 rounded-full opacity-50 animate-pulse", sizes[size], colors[color])} style={{ animationDuration: '2s' }} />
    </div>
  )
}

export function RingLoader({ size = 'md', color = 'accent', className }: { size?: 'sm' | 'md' | 'lg', color?: 'accent' | 'default', className?: string }) {
  const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-14 w-14' }
  const colors = { accent: 'bg-accent', default: 'bg-foreground' }

  return (
    <div className={cn("relative inline-flex items-center justify-center", sizes[size], className)}>
      <span className={cn("absolute inset-0 rounded-full opacity-75 animate-ping", sizes[size], colors[color])} style={{ animationDuration: '2s' }} />
      <span className={cn("absolute inset-0 rounded-full opacity-50 animate-pulse", sizes[size], colors[color])} style={{ animationDuration: '2s' }} />
    </div>
  )
}
