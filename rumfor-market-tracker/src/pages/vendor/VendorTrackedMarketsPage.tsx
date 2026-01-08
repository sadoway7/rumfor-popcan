import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets'
import { useVendorApplications } from '@/features/applications/hooks/useApplications'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, EmptyState } from '@/components/ui'
import { MarketCard } from '@/components/MarketCard'
import { ArrowLeft, MapPin, Heart, Search } from 'lucide-react'

export function VendorTrackedMarketsPage() {
  const { trackedMarkets, trackedMarketIds, isLoading, trackMarket, untrackMarket } = useTrackedMarkets()
  const { myApplications } = useVendorApplications()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'tracked' | 'applied'>('tracked')

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      // Filter locally for tracked markets
    }
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link 
          to="/vendor/dashboard" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500" />
              Tracked Markets
            </h1>
            <p className="text-muted-foreground">
              Markets you're following and interested in
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('tracked')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'tracked'
              ? 'text-accent border-accent'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          Tracked ({trackedMarkets.length})
        </button>
        <button
          onClick={() => setActiveTab('applied')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'applied'
              ? 'text-accent border-accent'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          Applied To
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tracked markets..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
        </div>
      ) : trackedMarkets.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-12 h-12 text-muted-foreground" />}
          title="No tracked markets"
          description="Start exploring markets and click the heart icon to track ones you're interested in."
          action={
            <Link to="/markets">
              <Button>Explore Markets</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trackedMarkets.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              variant="default"
              isTracked={trackedMarketIds.includes(market.id)}
              onTrack={handleTrackMarket}
              onUntrack={handleUntrackMarket}
              showTrackButton={true}
            />
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Tracking Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-surface/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{trackedMarkets.length}</div>
              <div className="text-sm text-muted-foreground">Total Tracked</div>
            </div>
            <div className="text-center p-4 bg-surface/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{myApplications.length}</div>
              <div className="text-sm text-muted-foreground">Applications</div>
            </div>
            <div className="text-center p-4 bg-surface/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{myApplications.filter(a => a.status === 'approved').length}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
            <div className="text-center p-4 bg-surface/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{myApplications.filter(a => a.status === 'submitted' || a.status === 'under-review').length}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
