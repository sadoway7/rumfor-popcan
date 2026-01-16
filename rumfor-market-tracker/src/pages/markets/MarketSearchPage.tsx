import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MarketGrid } from '@/components/MarketGrid'

import { Button, Input } from '@/components/ui'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import { useSidebarStore } from '@/features/theme/themeStore'
import type { MarketCategory, MarketFilters as MarketFilterType } from '@/types'

import { Search, SlidersHorizontal, ArrowUpDown, MapPin, Calendar } from 'lucide-react'

export const MarketSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'distance'>('date')
  const { isSidebarOpen } = useSidebarStore()
  const trendingHashtags = [
    'handmade',
    'fresh-produce',
    'vintage',
    'crafts',
    'family-friendly',
    'wheelchair-accessible'
  ]
  
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
        parkingAvailable: searchParams.get('parking') === 'true',
        restroomsAvailable: searchParams.get('restrooms') === 'true'
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
    if (newFilters.accessibility?.restroomsAvailable) params.set('restrooms', 'true')
    
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

  const handleTrendingTagClick = (tag: string) => {
    handleSearch(tag)
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
      <>
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className={`${isSidebarOpen ? 'w-full lg:w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-surface border-b lg:border-b-0 lg:border-r border-border`}>
            <div className="p-4 sm:p-6 w-full lg:w-80 space-y-6">

              {/* Search */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Start with location</h2>
                  {getActiveFilterCount() > 0 && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {getActiveFilterCount()} active
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                    <Input
                      placeholder="Location (city, state)"
                      value={filters.location?.city || ''}
                      onChange={(e) => handleFiltersChange({
                        ...filters,
                        location: { ...filters.location, city: e.target.value }
                      })}
                      className="pl-10 border border-border bg-surface/50 focus:bg-surface/80"
                    />
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                    <Input
                      placeholder="Search markets or keywords..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 border border-border bg-surface/50 focus:bg-surface/80"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Location filters narrow results first, then keywords refine.
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Trending hashtags</div>
                    <div className="flex flex-wrap gap-2">
                      {trendingHashtags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTrendingTagClick(tag)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px] bg-surface-2 hover:bg-surface text-foreground"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  {getActiveFilterCount() > 0 && (
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Clear All Filters ({getActiveFilterCount()})
                    </Button>
                  )}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="text-md font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort By
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSortBy('date')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors border ${
                      sortBy === 'date'
                        ? 'bg-accent/10 text-accent border-accent/30'
                        : 'border-transparent hover:bg-surface-2'
                    }`}
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Date</span>
                  </button>
                  <button
                    onClick={() => setSortBy('name')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors border ${
                      sortBy === 'name'
                        ? 'bg-accent/10 text-accent border-accent/30'
                        : 'border-transparent hover:bg-surface-2'
                    }`}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Name</span>
                  </button>
                  <button
                    onClick={() => setSortBy('distance')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors border ${
                      sortBy === 'distance'
                        ? 'bg-accent/10 text-accent border-accent/30'
                        : 'border-transparent hover:bg-surface-2'
                    }`}
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Distance</span>
                  </button>
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <h3 className="text-md font-semibold text-foreground mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </h3>

                {/* Status Filters */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Market Status</div>
                  <div className="flex flex-wrap gap-2">
                    {['upcoming', 'active', 'completed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          const currentStatuses = filters.status || []
                          const newStatuses = currentStatuses.includes(status as any)
                            ? currentStatuses.filter(s => s !== status)
                            : [...currentStatuses, status as any]
                          handleFiltersChange({ ...filters, status: newStatuses })
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px] ${
                          filters.status?.includes(status as any)
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-surface-2 hover:bg-surface text-foreground'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accessibility Filters */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Accessibility</div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer rounded-lg px-2 py-2 hover:bg-surface-2">
                      <input
                        type="checkbox"
                        checked={filters.accessibility?.wheelchairAccessible || false}
                        onChange={(e) => handleFiltersChange({
                          ...filters,
                          accessibility: { ...filters.accessibility, wheelchairAccessible: e.target.checked }
                        })}
                        className="h-4 w-4 rounded border-border"
                      />
                      <span className="text-sm">Wheelchair Accessible</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer rounded-lg px-2 py-2 hover:bg-surface-2">
                      <input
                        type="checkbox"
                        checked={filters.accessibility?.parkingAvailable || false}
                        onChange={(e) => handleFiltersChange({
                          ...filters,
                          accessibility: { ...filters.accessibility, parkingAvailable: e.target.checked }
                        })}
                        className="h-4 w-4 rounded border-border"
                      />
                      <span className="text-sm">Parking Available</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer rounded-lg px-2 py-2 hover:bg-surface-2">
                      <input
                        type="checkbox"
                        checked={filters.accessibility?.restroomsAvailable || false}
                        onChange={(e) => handleFiltersChange({
                          ...filters,
                          accessibility: { ...filters.accessibility, restroomsAvailable: e.target.checked }
                        })}
                        className="h-4 w-4 rounded border-border"
                      />
                      <span className="text-sm">Restrooms Available</span>
                    </label>
                  </div>
                </div>

                {/* Advanced Filters Toggle */}
                <div className="mt-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface-2 hover:bg-surface transition-colors"
                  >
                    <span className="text-sm font-medium flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Advanced Filters
                    </span>
                    <span className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {showFilters && (
                    <div className="mt-3 space-y-4">
                      {/* Category Filter */}
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">Market Categories</div>
                        <div className="flex flex-wrap gap-2">
                          {([
                            { label: 'Farmers Markets', value: 'farmers-market' },
                            { label: 'Arts & Crafts', value: 'arts-crafts' },
                            { label: 'Flea Markets', value: 'flea-market' },
                            { label: 'Food Festivals', value: 'food-festival' },
                            { label: 'Vintage & Antique', value: 'vintage-antique' },
                            { label: 'Craft Shows', value: 'craft-show' },
                            { label: 'Night Markets', value: 'night-market' },
                            { label: 'Street Fairs', value: 'street-fair' },
                            { label: 'Holiday Markets', value: 'holiday-market' },
                            { label: 'Community Events', value: 'community-event' }
                          ] satisfies { label: string; value: MarketCategory }[]).map((category) => (
                            <button
                              key={category.value}
                              onClick={() => {
                                const currentCategories = filters.category || []
                                const newCategories = currentCategories.includes(category.value)
                                  ? currentCategories.filter(c => c !== category.value)
                                  : [...currentCategories, category.value]
                                handleFiltersChange({ ...filters, category: newCategories })
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px] ${
                                filters.category?.includes(category.value)
                                  ? 'bg-accent text-accent-foreground'
                                  : 'bg-surface-2 hover:bg-surface text-foreground'
                              }`}
                            >
                              {category.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Date Range */}
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">Date Range</div>
                        <div className="space-y-2">
                          <input
                            type="date"
                            placeholder="From date"
                            className="w-full px-3 py-2 text-sm border border-border bg-surface/50 rounded-md focus:bg-surface/80"
                            onChange={(e) => {
                              // Handle date range - this would need backend support
                              console.log('Date from:', e.target.value)
                            }}
                          />
                          <input
                            type="date"
                            placeholder="To date"
                            className="w-full px-3 py-2 text-sm border border-border bg-surface/50 rounded-md focus:bg-surface/80"
                            onChange={(e) => {
                              // Handle date range - this would need backend support
                              console.log('Date to:', e.target.value)
                            }}
                          />
                        </div>
                      </div>

                      {/* Additional Status Options */}
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">More Status Options</div>
                        <div className="flex flex-wrap gap-2">
                          {['cancelled', 'postponed'].map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                const currentStatuses = filters.status || []
                                const newStatuses = currentStatuses.includes(status as any)
                                  ? currentStatuses.filter(s => s !== status)
                                  : [...currentStatuses, status as any]
                                handleFiltersChange({ ...filters, status: newStatuses })
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px] ${
                                filters.status?.includes(status as any)
                                  ? 'bg-accent text-accent-foreground'
                                  : 'bg-surface-2 hover:bg-surface text-foreground'
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>



            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Search Markets</h1>
                <p className="text-muted-foreground">
                  {isSearching ? 'Searching...' : `${markets.length} markets found`}
                </p>
              </div>
              {/* View Mode Toggle */}
              <div className="flex rounded-lg bg-surface/50 border border-border w-full md:w-auto">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none px-3 flex-1 md:flex-none"
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none px-3 flex-1 md:flex-none"
                >
                  List
                </Button>
              </div>
            </div>

            {/* Market Grid */}
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
          </main>
        </div>
      </>
    </div>
  )
}
