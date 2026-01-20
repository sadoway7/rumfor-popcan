import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets'
import { Button, EmptyState } from '@/components/ui'
import { VendorTrackedMarketRow } from '@/components/VendorTrackedMarketRow'
import { VendorMarketCard } from '@/components/VendorMarketCard'
import { MapPin, Search, List, LayoutGrid, Plus } from 'lucide-react'
import { cn } from '@/utils/cn'

export function VendorTrackedMarketsPage() {
  const { trackedMarkets, isLoading, untrackMarket, getTrackingStatus, trackMarket } = useTrackedMarkets()
  const navigate = useNavigate()
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: trackedMarkets.length,
      interested: 0,
      applied: 0,
      approved: 0,
      attending: 0,
      completed: 0,
    }
    
    trackedMarkets.forEach(market => {
      const status = getTrackingStatus(market.id)?.status
      if (status && status in counts) counts[status]++
    })
    
    return counts
  }, [trackedMarkets, getTrackingStatus])

  const filteredMarkets = useMemo(() => {
    return trackedMarkets.filter(market => {
      const tracking = getTrackingStatus(market.id)
      if (statusFilter === 'all') return true
      return tracking?.status === statusFilter
    })
  }, [trackedMarkets, statusFilter, getTrackingStatus])

  const searchedMarkets = useMemo(() => {
    if (!searchQuery.trim()) return filteredMarkets
    const query = searchQuery.toLowerCase()
    return filteredMarkets.filter(market =>
      market.name.toLowerCase().includes(query) ||
      market.location.city.toLowerCase().includes(query) ||
      market.location.state.toLowerCase().includes(query)
    )
  }, [filteredMarkets, searchQuery])

  const sortedMarkets = useMemo(() => {
    return [...searchedMarkets].sort((a, b) => {
      const dateA = new Date(a.schedule[0]?.startDate || 0).getTime()
      const dateB = new Date(b.schedule[0]?.startDate || 0).getTime()
      return dateA - dateB
    })
  }, [searchedMarkets])

  const handleUntrackMarket = async (marketId: string) => {
    if (window.confirm('Untrack this market?')) {
      try {
        await untrackMarket(marketId)
      } catch (error) {
        console.error('Failed to untrack:', error)
      }
    }
  }

  const handleChangeStatus = async (marketId: string, status: string) => {
    try {
      await trackMarket(marketId, status)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const STATUS_COLORS: Record<string, string> = {
    all: 'bg-gray-600',
    interested: 'bg-blue-500',
    applied: 'bg-yellow-500',
    approved: 'bg-green-500',
    attending: 'bg-emerald-500',
    completed: 'bg-gray-400',
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Redesigned header matching main site */}
      <div className="sticky top-0 z-20 bg-card border-b border-border shadow-sm">
        {/* Main controls row */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-card">
          {/* View toggle - hidden on mobile, visible on larger screens */}
          <div className="hidden sm:flex border border-border rounded shrink-0 h-10">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-2 transition-colors',
                viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-2 border-l border-border transition-colors',
                viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Search - minimalist underline style, centered */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Filter markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-2 text-sm bg-transparent border-0 border-b-2 border-border focus:border-accent focus:outline-none transition-colors text-center sm:text-left"
              />
            </div>
          </div>

          {/* Action buttons - far right, responsive text */}
          <Link to="/markets" className="shrink-0">
            <Button size="sm" className="h-10 whitespace-nowrap">
              <MapPin className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Find Markets</span>
              <span className="sm:hidden">Find</span>
            </Button>
          </Link>
          
          <Link to="/vendor/add-market" className="shrink-0">
            <Button size="sm" className="h-10 whitespace-nowrap">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add New Market</span>
              <span className="sm:hidden">Add New</span>
            </Button>
          </Link>
        </div>

        {/* Status filters row */}
        <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-2 border-t border-border bg-card">
          <span className="text-xs font-medium text-muted-foreground shrink-0 w-full sm:w-auto text-center sm:text-left">{trackedMarkets.length} Markets:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap',
              statusFilter === 'all' ? `${STATUS_COLORS.all} text-white shadow` : 'bg-surface text-foreground border border-border hover:bg-surface-2'
            )}
          >
            {statusCounts.all}
          </button>
          <button
            onClick={() => setStatusFilter('interested')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap',
              statusFilter === 'interested' ? `${STATUS_COLORS.interested} text-white shadow` : 'bg-surface text-foreground border border-border hover:bg-surface-2'
            )}
          >
            {statusCounts.interested} interested
          </button>
          <button
            onClick={() => setStatusFilter('applied')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap',
              statusFilter === 'applied' ? `${STATUS_COLORS.applied} text-white shadow` : 'bg-surface text-foreground border border-border hover:bg-surface-2'
            )}
          >
            {statusCounts.applied} applied
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap',
              statusFilter === 'approved' ? `${STATUS_COLORS.approved} text-white shadow` : 'bg-surface text-foreground border border-border hover:bg-surface-2'
            )}
          >
            {statusCounts.approved} approved
          </button>
          <button
            onClick={() => setStatusFilter('attending')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap',
              statusFilter === 'attending' ? `${STATUS_COLORS.attending} text-white shadow` : 'bg-surface text-foreground border border-border hover:bg-surface-2'
            )}
          >
            {statusCounts.attending} attending
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap',
              statusFilter === 'completed' ? `${STATUS_COLORS.completed} text-white shadow` : 'bg-surface text-foreground border border-border hover:bg-surface-2'
            )}
          >
            {statusCounts.completed} done
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="md:container md:mx-auto md:px-3 md:py-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
          </div>
        ) : sortedMarkets.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<MapPin className="w-12 h-12 text-gray-300" />}
              title={statusFilter !== 'all' ? 'No markets' : 'No tracked markets'}
              description={statusFilter !== 'all' ? `No "${statusFilter}" markets` : 'Track markets to see them here'}
              action={
                statusFilter !== 'all' ? (
                  <Button onClick={() => setStatusFilter('all')} size="sm">Show All</Button>
                ) : (
                  <Link to="/markets">
                    <Button size="sm">Find Markets</Button>
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <>
            {/* List view */}
            {viewMode === 'list' && (
              <div className="md:space-y-3 overflow-visible">
                {sortedMarkets.map((market, index) => (
                  <div key={market.id} className={cn(index > 0 && 'mt-2 md:mt-0')}>
                    <VendorTrackedMarketRow
                      market={market}
                      tracking={getTrackingStatus(market.id)}
                      onViewDetails={(id) => navigate(`/vendor/markets/${id}`)}
                      onUntrack={handleUntrackMarket}
                      onChangeStatus={handleChangeStatus}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Grid view */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
                {sortedMarkets.map((market) => (
                  <VendorMarketCard
                    key={market.id}
                    market={market}
                    tracking={getTrackingStatus(market.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
