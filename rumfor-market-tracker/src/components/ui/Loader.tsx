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

const styles = `
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.8); opacity: 0.5; } }
  @keyframes bounce { 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); } 50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); } }
  @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
  @keyframes loading { 0% { margin-left: 0; width: 20%; } 50% { margin-left: 40%; width: 30%; } 100% { margin-left: 80%; width: 20%; } }
  @keyframes wave { 0%, 100% { transform: scaleY(0.5); } 50% { transform: scaleY(1); } }
  .animate-shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  .animate-pulse-ring { animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  .animate-bounce-subtle { animation: bounce 1s infinite; }
  .animate-ping-slow { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
`

export function Shimmer({ className, lines = 3 }: ShimmerProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gradient-to-r from-muted via-muted/70 to-muted animate-shimmer rounded"
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
  return (
    <React.Fragment>
      <style>{styles}</style>
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-4 border-muted/30 border-t-accent animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-0 h-14 w-14 rounded-full border-4 border-transparent border-t-accent/40 animate-[spin_1.5s_linear_infinite_reverse]" />
        </div>
        {message && <p className="mt-6 text-sm text-muted-foreground font-medium">{message}</p>}
      </div>
    </React.Fragment>
  )
}

export function CircleLoader({ size = 'md', color = 'accent', className }: { size?: 'sm' | 'md' | 'lg', color?: 'accent' | 'default', className?: string }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
  const colorClass = color === 'accent' ? 'text-accent' : 'text-foreground'
  const trackClass = color === 'accent' ? 'text-accent/20' : 'text-muted-foreground/20'

  return (
    <React.Fragment>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin 3s linear infinite; }
      `}</style>
      <div className={cn("relative inline-flex items-center justify-center", className)}>
        <svg className="animate-spin-slow" viewBox="0 0 50 50" style={{ width: sizes[size], height: sizes[size] }}>
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className={trackClass} />
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="90 150" strokeDashoffset="0" className={colorClass} />
        </svg>
      </div>
    </React.Fragment>
  )
}

export function DotLoader({ size = 'md', color = 'accent', className }: { size?: 'sm' | 'md' | 'lg', color?: 'accent' | 'default', className?: string }) {
  const sizes = { sm: 'h-1.5 w-1.5', md: 'h-2.5 w-2.5', lg: 'h-3.5 w-3.5' }
  const colors = { accent: 'bg-accent', default: 'bg-foreground' }

  return (
    <React.Fragment>
      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); } 50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); } }
        .animate-bounce-subtle { animation: bounce 1s infinite; }
      `}</style>
      <div className={cn("flex items-center gap-1.5", className)}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("rounded-full animate-bounce-subtle", sizes[size], colors[color])} style={{ animationDelay: `${i * 0.16}s` }} />
        ))}
      </div>
    </React.Fragment>
  )
}

export function BarLoader({ width = 200, color = 'accent', className }: { width?: number, color?: 'accent' | 'default', className?: string }) {
  return (
    <React.Fragment>
      <style>{`
        @keyframes loading { 0% { margin-left: 0; width: 20%; } 50% { margin-left: 40%; width: 30%; } 100% { margin-left: 80%; width: 20%; } }
        .animate-bar { animation: loading 1.5s ease-in-out infinite; }
      `}</style>
      <div className={cn("flex flex-col gap-1.5", className)}>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden" style={{ width }}>
          <div className={cn("h-full rounded-full animate-bar", color === 'accent' ? 'bg-accent' : 'bg-foreground')} style={{ width: '30%' }} />
        </div>
      </div>
    </React.Fragment>
  )
}

export function WaveLoader({ size = 'md', color = 'accent', className }: { size?: 'sm' | 'md' | 'lg', color?: 'accent' | 'default', className?: string }) {
  const heights = { sm: 'h-4', md: 'h-6', lg: 'h-8' }
  const colorClass = color === 'accent' ? 'bg-accent' : 'bg-foreground'

  return (
    <React.Fragment>
      <style>{`
        @keyframes wave { 0%, 100% { transform: scaleY(0.5); } 50% { transform: scaleY(1); } }
        .animate-wave { animation: wave 1.2s ease-in-out infinite; }
      `}</style>
      <div className={cn("flex items-end gap-1", className)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("w-1.5 rounded-full animate-wave", heights[size], colorClass)} style={{ animationDelay: `${i * 0.1}s`, height: `calc(100% - ${i * 20}%)` }} />
        ))}
      </div>
    </React.Fragment>
  )
}

export function PulseLoader({ size = 'md', color = 'accent', className }: { size?: 'sm' | 'md' | 'lg', color?: 'accent' | 'default', className?: string }) {
  const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-14 w-14' }
  const colors = { accent: 'bg-accent', default: 'bg-foreground' }

  return (
    <React.Fragment>
      <style>{`
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-ping-fast { animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-pulse-fast { animation: pulse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
      `}</style>
      <div className={cn("relative inline-flex items-center justify-center", className)}>
        <div className={cn("rounded-full animate-ping-fast", sizes[size], colors[color], 'opacity-75')} />
        <div className={cn("absolute rounded-full animate-pulse-fast", sizes[size], colors[color], 'opacity-50')} />
      </div>
    </React.Fragment>
  )
}

export function RingLoader({ size = 'md', color = 'accent', className }: { size?: 'sm' | 'md' | 'lg', color?: 'accent' | 'default', className?: string }) {
  const sizes = { sm: 'h-6 w-6 border-2', md: 'h-10 w-10 border-2', lg: 'h-14 w-14 border-3' }
  const colorClass = color === 'accent' ? 'border-accent' : 'border-foreground'
  const trackClass = color === 'accent' ? 'border-accent/30' : 'border-muted-foreground/30'

  return (
    <React.Fragment>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-fast { animation: spin 2s linear infinite; }
        .animate-spin-slow { animation: spin 1s linear infinite reverse; }
      `}</style>
      <div className={cn("relative inline-flex items-center justify-center", className)}>
        <div className={cn("rounded-full border-current animate-spin-fast", sizes[size], trackClass, 'border-t-transparent')} />
        <div className={cn("absolute rounded-full animate-spin-slow", sizes[size], colorClass, 'border-transparent')} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 35%, 0 35%)' }} />
      </div>
    </React.Fragment>
  )
}

export function InlineLoader({ size = 'sm', className }: { size?: 'sm' | 'md', className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-[spin_1s_linear_infinite]" />
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
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-[spin_1s_linear_infinite]" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
