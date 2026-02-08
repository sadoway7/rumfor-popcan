import React, { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MarketGrid } from '@/components/MarketGrid'

import { Button, Spinner } from '@/components/ui'
import { DatePicker } from '@/components/DatePicker'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import { useSidebarStore } from '@/features/theme/themeStore'
import { useAuthStore } from '@/features/auth/authStore'
import type { MarketCategory, MarketFilters as MarketFilterType } from '@/types'

import { Layers, RotateCcw } from 'lucide-react'

export const MarketSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sortBy, setSortBy] = useState<'date-oldest' | 'date-newest' | 'recently-added' | 'name-asc' | 'name-desc'>('recently-added')
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' })
  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<HTMLDivElement>(null)
  const isInitialLoad = useRef(true)
  const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useSidebarStore()
  const { isAuthenticated } = useAuthStore()
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
    trackedMarketIds,
    isTracking,
    searchMarkets,
    setFilters,
    clearFilters,
    trackMarket,
    untrackMarket,
    hasNextPage,
    fetchNextPage
  } = useMarkets({
    autoLoad: true,
    infiniteScroll: true
  })

  // Initialize filters from URL params when component mounts
  useEffect(() => {
    if (!isInitialLoad.current) return
    isInitialLoad.current = false

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
      },
      sortBy: 'recently-added',
      sortOrder: 'desc'
    }

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
  }, [])

  // Handle URL search param changes from header search
  useEffect(() => {
    if (isInitialLoad.current) return
    
    const urlSearch = searchParams.get('search') || ''
    if (urlSearch !== filters.search) {
      if (urlSearch) {
        searchMarkets(urlSearch)
      } else {
        // Clear search and show normal results
        searchMarkets('')
        clearFilters()
      }
      setFilters({ ...filters, search: urlSearch })
    }
  }, [searchParams])

  // Close sidebar by default
  useEffect(() => {
    useSidebarStore.getState().setSidebarOpen(false)
  }, [])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasNextPage && !isSearching) {
          fetchNextPage()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
      observer.disconnect()
    }
  }, [hasNextPage, isSearching, fetchNextPage])

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy)
    if (newFilters.sortOrder) params.set('sortOrder', newFilters.sortOrder)
    
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
    setSidebarOpen(false)
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

  const handleSortChange = (newSortBy: 'date-oldest' | 'date-newest' | 'recently-added' | 'name-asc' | 'name-desc') => {
    setSortBy(newSortBy)
    setIsSortOpen(false)
    const newFilters: MarketFilterType = { 
      ...filters, 
      sortBy: newSortBy,
      sortOrder: (newSortBy.endsWith('-asc') ? 'asc' : 'desc') as 'asc' | 'desc'
    }
    setFilters(newFilters)
    updateUrlParams(newFilters)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Auth Message - Sales Pitch */}
      {!isAuthenticated && (
        <div className="w-full bg-gradient-to-r from-amber-500 to-amber-500/80 text-white py-2.5 px-4 text-center text-sm sm:text-base">
          <span className="font-medium">Free market tools</span>
          <span className="mx-2">·</span>
          <Link to="/auth/register" className="text-white underline font-medium hover:no-underline">
            Register
          </Link>
          <span className="mx-2">or</span>
          <Link to="/auth/login" className="text-white underline font-medium hover:no-underline">
            Sign In
          </Link>
        </div>
      )}

      <>
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <aside 
            className={`lg:${isSidebarOpen ? 'w-80' : 'w-0'} overflow-hidden bg-background`}
            style={{
              maxHeight: isSidebarOpen ? '2000px' : '0px',
              opacity: isSidebarOpen ? 1 : 0,
              transition: 'max-height 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms cubic-bezier(0.4, 0, 0.6, 1)'
            }}
          >
            <div className="p-4 sm:p-6 w-full lg:w-80 space-y-5">

              {/* Header - Active Count */}
              <div className="flex items-center justify-between">
                {getActiveFilterCount() > 0 && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {getActiveFilterCount()} active
                  </span>
                )}
              </div>

              {/* Date Range */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Date Range</div>
                <DatePicker
                  value={dateRange}
                  onChange={(newValue) => {
                    setDateRange(newValue)
                    handleFiltersChange({ ...filters, dateRange: { start: newValue.from, end: newValue.to } })
                  }}
                  className="w-full"
                />
              </div>

              {/* Market Categories */}
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
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px] shadow shadow-black/20 ${
                        filters.category?.includes(category.value)
                          ? 'bg-amber-500 text-white'
                          : 'bg-surface hover:bg-surface-2 text-foreground'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending hashtags */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Trending hashtags</div>
                <div className="flex flex-wrap gap-2">
                  {trendingHashtags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTrendingTagClick(tag)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px] bg-surface hover:bg-surface-2 text-foreground shadow shadow-black/20"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {getActiveFilterCount() > 0 && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="w-full py-3 min-h-[48px]"
                >
                  Clear All Filters ({getActiveFilterCount()})
                </Button>
              )}

            </div>
          </aside>

           {/* Main Content */}
           <main className="flex-1 py-4 px-0 sm:p-6">
             {/* Header */}
             <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
               <div className="flex justify-center">
                 <div className="flex items-center gap-2">
                   <div
                     onClick={toggleSidebar}
                     className="px-4 py-2 rounded-full text-sm font-medium bg-surface text-foreground cursor-pointer hover:bg-surface-2 shadow shadow-black/20"
                   >
                     {isSearching ? 'Searching...' : `${markets.length} markets found`}
                     {filters.search && (
                       <>
                         {' · '}
                         <button
                           onClick={(e) => {
                             e.stopPropagation()
                             handleClearFilters()
                           }}
                           className="text-muted-foreground hover:text-foreground underline"
                         >
                           Clear search
                         </button>
                       </>
                     )}
                   </div>
                     <div className="relative" ref={sortRef}>
                       <button
                         onClick={() => setIsSortOpen(!isSortOpen)}
                         className="relative px-3 py-2 rounded-full bg-surface text-foreground cursor-pointer hover:bg-surface-2 shadow shadow-black/20 flex items-center gap-2 before:content-[''] before:absolute before:inset-[-12px] before:rounded-full"
                         title="Sort"
                       >
                         <Layers className="w-4 h-4" />
                         <span className="text-sm font-medium">
                           {sortBy === 'date-oldest' ? 'Soonest' : sortBy === 'date-newest' ? 'Latest' : sortBy === 'recently-added' ? 'Recent' : sortBy === 'name-asc' ? 'A-Z' : 'Z-A'}
                         </span>
                       </button>
                      {isSortOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-[0_-4px_16px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.15)] z-[100] py-1">
                          <button
                            onClick={() => handleSortChange('date-oldest')}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-surface-2 ${sortBy === 'date-oldest' ? 'text-accent font-medium' : 'text-foreground'}`}
                          >
                            Soonest First
                          </button>
                          <button
                            onClick={() => handleSortChange('date-newest')}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-surface-2 ${sortBy === 'date-newest' ? 'text-accent font-medium' : 'text-foreground'}`}
                          >
                            Furthest First
                          </button>
                          <button
                            onClick={() => handleSortChange('recently-added')}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-surface-2 ${sortBy === 'recently-added' ? 'text-accent font-medium' : 'text-foreground'}`}
                          >
                            Newest First
                          </button>
                          <div className="border-t border-border my-1" />
                          <button
                            onClick={() => handleSortChange('name-asc')}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-surface-2 ${sortBy === 'name-asc' ? 'text-accent font-medium' : 'text-foreground'}`}
                          >
                            A - Z
                          </button>
                          <button
                            onClick={() => handleSortChange('name-desc')}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-surface-2 ${sortBy === 'name-desc' ? 'text-accent font-medium' : 'text-foreground'}`}
                          >
                            Z - A
                          </button>
                          <div className="border-t border-border my-1" />
                          <button
                            disabled
                            className="w-full px-4 py-2 text-left text-xs text-muted-foreground cursor-not-allowed opacity-60"
                          >
                            Distance (Coming Soon)
                          </button>
                        </div>
                      )}
                   </div>

                 </div>
               </div>

             </div>

            {/* Market Grid */}
            <div ref={observerRef}>
              <MarketGrid
                markets={markets}
                isLoading={isLoading}
                isSearching={isSearching}
                error={error}
                onTrack={handleTrackMarket}
                onUntrack={handleUntrackMarket}
                trackedMarketIds={trackedMarketIds}
                isTracking={isTracking}
                variant="grid"
                emptyStateProps={{
                  title: "We did not find any results",
                  description: "Try adjusting your search criteria or filters to find more markets.",
                  action: (
                    <Button onClick={handleClearFilters} size="lg">
                      Clear all filters
                    </Button>
                  )
                }}
              />
            </div>

            {/* Loading more indicator */}
            {isSearching && markets.length > 0 && (
              <div className="flex justify-center mt-12 mb-8">
                <Spinner className="h-10 w-10" />
              </div>
            )}
          </main>
        </div>
      </>
    </div>
  )
}
