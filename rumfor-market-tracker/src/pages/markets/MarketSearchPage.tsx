import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MarketGrid } from '@/components/MarketGrid'
import { MarketFilters } from '@/components/MarketFilters'
import { Button } from '@/components/ui/Button'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import type { MarketFilters as MarketFilterType } from '@/types'
import { cn } from '@/utils/cn'

export const MarketSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  const {
    markets,
    isLoading,
    isSearching,
    error,
    filters,
    searchQuery,
    trackedMarketIds,
    isTracking,
    searchMarkets,
    setFilters,
    trackMarket,
    untrackMarket,
    nextPage,
    previousPage,
    hasMore,
    currentPage,
    refresh
  } = useMarkets({
    autoLoad: true
  })

  // Initialize filters from URL params only on component mount
  useEffect(() => {
    const urlFilters: MarketFilterType = {
      search: searchParams.get('search') || '',
      category: searchParams.get('category')?.split(',') as MarketFilterType['category'],
      location: {
        city: searchParams.get('city') || '',
        state: searchParams.get('state') || ''
      },
      status: searchParams.get('status')?.split(',') as MarketFilterType['status'],
      accessibility: {
        wheelchairAccessible: searchParams.get('wheelchair') === 'true',
        parkingAvailable: searchParams.get('parking') === 'true'
      }
    }
    
    // Only set filters if they are not empty to avoid unnecessary updates
    if (Object.keys(urlFilters).some(key => {
      const value = urlFilters[key as keyof MarketFilterType]
      if (typeof value === 'string') return value !== ''
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v === true)
      }
      return false
    })) {
      setFilters(urlFilters)
    }
  }, []) // Empty dependency array ensures this only runs on mount

  // Update URL when filters change
  const updateUrlParams = (newFilters: MarketFilterType) => {
    const params = new URLSearchParams()
    
    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.category?.length) params.set('category', newFilters.category.join(','))
    if (newFilters.location?.city) params.set('city', newFilters.location.city)
    if (newFilters.location?.state) params.set('state', newFilters.location.state)
    if (newFilters.status?.length) params.set('status', newFilters.status.join(','))
    if (newFilters.accessibility?.wheelchairAccessible) params.set('wheelchair', 'true')
    if (newFilters.accessibility?.parkingAvailable) params.set('parking', 'true')
    
    setSearchParams(params)
  }

  const handleFiltersChange = (newFilters: MarketFilterType) => {
    setFilters(newFilters)
    updateUrlParams(newFilters)
  }

  const handleSearch = (query: string) => {
    searchMarkets(query)
    const newFilters = { ...filters, search: query }
    updateUrlParams(newFilters)
  }

  const handleTrackMarket = async (marketId: string) => {
    try {
      await trackMarket(marketId)
    } catch (error) {
      console.error('Failed to track market:', error)
    }
  }

  const handleUntrackMarket = async (marketId: string) => {
    try {
      await untrackMarket(marketId)
    } catch (error) {
      console.error('Failed to untrack market:', error)
    }
  }

  const handleClearFilters = () => {
    setFilters({})
    setSearchParams({})
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.category?.length) count++
    if (filters.location?.city || filters.location?.state) count++
    if (filters.status?.length) count++
    if (filters.accessibility?.wheelchairAccessible) count++
    if (filters.accessibility?.parkingAvailable) count++
    if (filters.search) count++
    return count
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Discover Markets</h1>
              <p className="text-muted-foreground mt-1">
                Find local markets, festivals, and community events near you
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </Button>
              </div>
              
              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={cn(
            "lg:col-span-1",
            !showFilters && "hidden lg:block"
          )}>
            <div className="sticky top-4">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  Close
                </Button>
              </div>
              
              <MarketFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onSearch={handleSearch}
                onClear={handleClearFilters}
                showAdvanced={true}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="ml-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  {isSearching ? (
                    'Searching...'
                  ) : (
                    <>
                      {markets.length} {markets.length === 1 ? 'market' : 'markets'} found
                      {searchQuery && ` for "${searchQuery}"`}
                    </>
                  )}
                </div>
              </div>
              
              {/* Pagination Info */}
              {markets.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Page {currentPage}
                </div>
              )}
            </div>

            {/* Results */}
            <MarketGrid
              markets={markets}
              isLoading={isLoading}
              isSearching={isSearching}
              error={error}
              onTrack={handleTrackMarket}
              onUntrack={handleUntrackMarket}
              trackedMarketIds={trackedMarketIds}
              isTracking={isTracking}
              variant={viewMode}
              emptyStateProps={{
                title: "No markets found",
                description: "Try adjusting your search criteria or filters to find more markets.",
                action: (
                  <div className="space-y-2">
                    <Button onClick={handleClearFilters} variant="outline">
                      Clear all filters
                    </Button>
                    <Button onClick={refresh} variant="outline">
                      Refresh markets
                    </Button>
                  </div>
                )
              }}
            />

            {/* Pagination */}
            {markets.length > 0 && hasMore && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={previousPage}
                    disabled={currentPage <= 1 || isLoading}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={nextPage}
                    disabled={!hasMore || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
