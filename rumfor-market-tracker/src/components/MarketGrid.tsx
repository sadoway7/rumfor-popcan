import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Market } from '@/types'
import { MarketCard } from './MarketCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/utils/cn'

/**
 * Props for the MarketGrid component
 */
interface MarketGridProps {
  markets: Market[]
  isLoading?: boolean
  isSearching?: boolean
  error?: string | null
  onTrack?: (marketId: string) => void
  onUntrack?: (marketId: string) => void
  trackedMarketIds?: string[]
  isTracking?: boolean
  variant?: 'grid' | 'list' | 'compact' | 'minimal'
  className?: string
  emptyStateProps?: {
    title?: string
    description?: string
    action?: React.ReactNode
  }
}

/**
 * MarketGrid component for displaying a collection of markets in various layouts
 *
 * Features:
 * - Responsive grid/list layouts with different variants
 * - Loading states with spinner
 * - Error handling with user-friendly messages
 * - Empty state with customizable content
 * - Market tracking functionality
 * - Multiple grid variants (grid, list, compact, minimal)
 *
 * @param markets - Array of market objects to display
 * @param isLoading - Whether data is currently loading
 * @param isSearching - Whether a search operation is in progress (shows different loading text)
 * @param error - Error message to display if loading failed
 * @param onTrack - Callback function when user tracks a market
 * @param onUntrack - Callback function when user untracks a market
 * @param trackedMarketIds - Array of market IDs that the user has tracked
 * @param isTracking - Whether a tracking operation is in progress
 * @param variant - Layout variant: 'grid' (default), 'list', 'compact', or 'minimal'
 * @param className - Additional CSS classes for styling
 * @param emptyStateProps - Customization options for empty state display
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <MarketGrid
 *   markets={markets}
 *   isLoading={false}
 *   onTrack={(marketId) => console.log('Track', marketId)}
 *   trackedMarketIds={['market1', 'market2']}
 *   variant="grid"
 * />
 * ```
 */
export const MarketGrid: React.FC<MarketGridProps> = ({
  markets,
  isLoading = false,
  isSearching = false,
  error = null,
  onTrack,
  onUntrack,
  trackedMarketIds = [],
  isTracking = false,
  variant = 'grid',
  className,
  emptyStateProps
}) => {
  // Calculate grid columns based on variant and screen size
  const getGridClasses = () => {
    if (variant === 'list') {
      return 'grid grid-cols-1 gap-4'
    }
    
    if (variant === 'compact') {
      return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'
    }
    

    
    // Use fixed classes instead of dynamic ones for Tailwind purging - 4 wide on large screens
    return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4'
  }

  // Show loading state
  if (isLoading || isSearching) {
    return (
      <div className="flex items-center justify-center py-16 mt-8">
        <div className="text-center">
          <Spinner className="h-12 w-12 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            {isSearching ? 'Searching markets...' : 'Loading markets...'}
          </p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="py-12">
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Failed to load markets"
          description={error}
          className={className}
        />
      </div>
    )
  }

  // Ensure markets is an array
  if (!Array.isArray(markets)) {
    return (
      <div className="py-12">
        <EmptyState
          title="Loading markets..."
          description="Please wait while we load the markets."
          className={className}
        />
      </div>
    )
  }

  // Show empty state
  if (markets.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          title={emptyStateProps?.title || "No markets found"}
          description={emptyStateProps?.description || "Try adjusting your search criteria or filters to find more markets."}
          action={emptyStateProps?.action}
          size="lg"
          variant="centered"
          className={className}
        />
      </div>
    )
  }

  return (
    <div className={cn(getGridClasses(), className)}>
      {markets.map((market) => (
        <FadeInWrapper key={market.id}>
          <MarketCard
            market={market}
            variant={variant === 'list' ? 'featured' : variant === 'grid' ? 'minimal' : variant}
            onTrack={onTrack}
            onUntrack={onUntrack}
            isTracked={trackedMarketIds.includes(market.id)}
            isLoading={isTracking}
            showTrackButton={false}
            className="h-full"
          />
        </FadeInWrapper>
      ))}
    </div>
  )
}

const FadeInWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '20px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: '100ms' }}
    >
      {children}
    </div>
  )
}

/**
 * Compact grid variant for sidebar or mobile views
 * Displays markets in a tighter grid with smaller gaps
 * @param props - All MarketGrid props except variant (automatically set to 'compact')
 */
export const CompactMarketGrid: React.FC<Omit<MarketGridProps, 'variant'>> = (props) => {
  return <MarketGrid {...props} variant="compact" />
}

/**
 * List view variant for detailed market browsing
 * Shows markets in a vertical list format with featured card style
 * @param props - All MarketGrid props except variant (automatically set to 'list')
 */
export const MarketList: React.FC<Omit<MarketGridProps, 'variant'>> = (props) => {
  return <MarketGrid {...props} variant="list" />
}
