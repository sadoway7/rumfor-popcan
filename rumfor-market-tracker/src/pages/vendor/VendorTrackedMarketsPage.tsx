import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets'
import { Button, EmptyState } from '@/components/ui'
import { VendorTrackedMarketRow } from '@/components/VendorTrackedMarketRow'
import { VendorMarketCard } from '@/components/VendorMarketCard'
import { MapPin, List, LayoutGrid, Plus } from 'lucide-react'
import { cn } from '@/utils/cn'

export function VendorTrackedMarketsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { trackedMarkets, isLoading, untrackMarket, getTrackingStatus, trackMarket } = useTrackedMarkets()

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const searchQuery = searchParams.get('search') || ''

  // Scroll to top when filters change
  useEffect(() => {
    if (statusFilter !== 'all' || searchQuery) {
      window.scrollTo(0, 0)
    }
  }, [statusFilter, searchQuery])

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
    <div className="min-h-screen bg-background -mt-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background shadow-sm py-2.5">
        {/* Status filters row */}
        <div className="relative flex flex-nowrap items-center gap-2 px-4 bg-background justify-between">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-xs font-medium text-muted-foreground shrink-0 hidden sm:block">{trackedMarkets.length} Markets:</span>

            {/* Scrollable filters */}
            <div className="flex flex-nowrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap min-h-[32px]',
                  statusFilter === 'all' ? `${STATUS_COLORS.all} text-white shadow` : 'bg-surface text-foreground hover:bg-surface'
                )}
              >
                All ({statusCounts.all})
              </button>
              <button
                onClick={() => setStatusFilter('interested')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap min-h-[32px]',
                  statusFilter === 'interested' ? `${STATUS_COLORS.interested} text-white shadow` : 'bg-surface text-foreground hover:bg-surface'
                )}
              >
                {statusCounts.interested} interested
              </button>
              <button
                onClick={() => setStatusFilter('applied')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap min-h-[32px]',
                  statusFilter === 'applied' ? `${STATUS_COLORS.applied} text-white shadow` : 'bg-surface text-foreground hover:bg-surface'
                )}
              >
                {statusCounts.applied} applied
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap min-h-[32px]',
                  statusFilter === 'approved' ? `${STATUS_COLORS.approved} text-white shadow` : 'bg-surface text-foreground hover:bg-surface'
                )}
              >
                {statusCounts.approved} approved
              </button>
              <button
                onClick={() => setStatusFilter('attending')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap min-h-[32px]',
                  statusFilter === 'attending' ? `${STATUS_COLORS.attending} text-white shadow` : 'bg-surface text-foreground hover:bg-surface'
                )}
              >
                {statusCounts.attending} attending
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap min-h-[32px]',
                  statusFilter === 'completed' ? `${STATUS_COLORS.completed} text-white shadow` : 'bg-surface text-foreground hover:bg-surface'
                )}
              >
                {statusCounts.completed} done
              </button>
            </div>
          </div>

          {/* Action buttons - right side */}
          <div className="hidden sm:flex items-center gap-2 shrink-0 ml-4">
            <Link to="/markets">
              <Button size="sm" className="h-10 whitespace-nowrap">
                <MapPin className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Find Markets</span>
              </Button>
            </Link>
            <Link to="/vendor/add-market">
              <Button size="sm" className="h-10 whitespace-nowrap">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add New Market</span>
              </Button>
            </Link>
          </div>
        </div>
        
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>

      {/* Content */}
      <div className="pt-0 sm:pt-3 sm:container sm:mx-auto sm:px-3 sm:py-3">
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
              <div className="space-y-3 -mt-px -mx-4 px-4 sm:mx-0 sm:px-0 sm:space-y-3 sm:py-0">
                {sortedMarkets.map((market) => (
                  <div key={market.id}>
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
              <div className="grid grid-cols-1 gap-3 -mt-px -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid-cols-2 lg:grid-cols-3 sm:py-0">
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
