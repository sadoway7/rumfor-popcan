import React from 'react'
import { Market } from '@/types'
import { MarketCard } from './MarketCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/utils/cn'

interface MarketGridProps {
  markets: Market[]
  isLoading?: boolean
  isSearching?: boolean
  error?: string | null
  onTrack?: (marketId: string) => void
  onUntrack?: (marketId: string) => void
  trackedMarketIds?: string[]
  isTracking?: boolean
  variant?: 'grid' | 'list' | 'compact'
  columns?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  className?: string
  emptyStateProps?: {
    title?: string
    description?: string
    action?: React.ReactNode
  }
}

const defaultColumns = {
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4
}

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
  columns = defaultColumns,
  className,
  emptyStateProps
}) => {
  // Calculate grid columns based on variant and screen size
  const getGridClasses = () => {
    if (variant === 'list') {
      return 'grid grid-cols-1 gap-4'
    }
    
    if (variant === 'compact') {
      return `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3`
    }
    
    return `grid grid-cols-1 sm:grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl} gap-6`
  }

  // Show loading state
  if (isLoading || isSearching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">
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
          className={className}
        />
      </div>
    )
  }

  return (
    <div className={cn(getGridClasses(), className)}>
      {markets.map((market) => (
        <MarketCard
          key={market.id}
          market={market}
          variant={variant === 'list' ? 'featured' : variant === 'grid' ? 'default' : variant}
          onTrack={onTrack}
          onUntrack={onUntrack}
          isTracked={trackedMarketIds.includes(market.id)}
          isLoading={isTracking}
          showTrackButton={true}
          className="h-full"
        />
      ))}
    </div>
  )
}

// Compact grid variant for sidebar or mobile
export const CompactMarketGrid: React.FC<Omit<MarketGridProps, 'variant'>> = (props) => {
  return <MarketGrid {...props} variant="compact" />
}

// List view variant for detailed browsing
export const MarketList: React.FC<Omit<MarketGridProps, 'variant'>> = (props) => {
  return <MarketGrid {...props} variant="list" />
}
