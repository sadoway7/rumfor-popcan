import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MarketCard } from '@/components'
import { MarketCalendar } from '@/components/MarketCalendar'
import { EmailAlertsSettings } from '@/components/EmailAlertsSettings'
import { ExportModal } from '@/components/ExportModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets'
import { Market } from '@/types'
import { cn } from '@/utils/cn'
import { ChevronDown, ChevronUp, RefreshCw, Search, Calendar, Mail, Download, Plus, Heart, Zap, Clock } from 'lucide-react'

export const MyMarketsPage: React.FC = () => {
  const [activeTab] = useState<'tracked' | 'recent'>('tracked')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [showEmailSettings, setShowEmailSettings] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [isQuickActionsCollapsed, setIsQuickActionsCollapsed] = useState(true)
  const [emailPreferences, setEmailPreferences] = useState({
    marketUpdates: true,
    applicationDeadlines: true,
    newMarketAnnouncements: true,
    eventReminders: true,
    weeklyDigest: false,
    marketingEmails: false,
    frequency: 'immediate' as 'immediate' | 'daily' | 'weekly' | 'monthly'
  })
  
  const {
    trackedMarkets,
    trackedMarketIds,
    isLoading,
    trackMarket,
    untrackMarket,
    isMarketTracked,
    refetch
  } = useTrackedMarkets()

  const handleTrackToggle = async (marketId: string) => {
    if (isMarketTracked(marketId)) {
      await untrackMarket(marketId)
    } else {
      await trackMarket(marketId)
    }
  }

  const handleRefresh = async () => {
    await refetch()
  }

  const handleMarketSelect = (market: Market) => {
    // Navigate to market detail or perform other action
    console.log('Selected market:', market.name)
  }

  const handleEmailSettingsSave = async (preferences: any) => {
    // Save email preferences - in a real app, this would call an API
    setEmailPreferences(preferences)
    console.log('Email preferences saved:', preferences)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient background */}
      <div className="border-b bg-gradient-to-r from-accent/5 via-background to-background px-4 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">My Markets</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1">
                <Heart className="w-4 h-4 text-accent" />
                {trackedMarkets.length} tracked
              </span>
              <span className="text-border">|</span>
              <span className="inline-flex items-center gap-1 text-success">
                <Zap className="w-4 h-4" />
                {trackedMarkets.filter(m => m.status === 'active').length} active
              </span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-9 px-3 border-accent/20 hover:border-accent/40"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
            
            <Link to="/markets">
              <Button size="sm" className="h-9 px-4 bg-accent hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-1.5" />
                Find Markets
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 bg-background">
        {/* Compact Stats Row */}
        <div className="flex gap-2">
          <Card className="flex-1 p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tracked</p>
                <p className="text-lg font-bold">{trackedMarkets.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="flex-1 p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-lg font-bold">
                  {trackedMarkets.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="flex-1 p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Scheduled</p>
                <p className="text-lg font-bold">
                  {trackedMarkets.filter(m => m.schedule && m.schedule.length > 0).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Tabs - Horizontally Scrollable with Background */}
        <div className="sticky top-[61px] z-10 space-y-2">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Filter search word..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-border rounded-full focus:border-accent focus:outline-none transition-all placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            )}
          </div>
          
          {/* Scrollable filter tags */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {[
              { key: 'all', label: 'All', count: trackedMarkets.length },
              { key: 'active', label: 'Active', count: trackedMarkets.filter(m => m.status === 'active').length },
              { key: 'draft', label: 'Draft', count: trackedMarkets.filter(m => m.status === 'draft').length },
              { key: 'upcoming', label: 'Upcoming', count: trackedMarkets.filter(m => m.schedule && m.schedule.length > 0).length },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap flex-shrink-0",
                  activeFilter === filter.key
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {filter.label}
                <span className="text-xs opacity-70">({filter.count})</span>
              </button>
            ))}
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

        {/* Content */}
        {activeTab === 'tracked' && (
          <div>
            {trackedMarkets.length > 0 ? (
              <div className="space-y-3">
                {trackedMarkets
            .filter(market => {
              // First filter by status
              if (activeFilter !== 'all' && market.status !== activeFilter) return false
              // Then filter by search query
              if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                return (
                  market.name.toLowerCase().includes(query) ||
                  market.location.city.toLowerCase().includes(query) ||
                  market.location.state.toLowerCase().includes(query)
                )
              }
              return true
            })
            .map((market) => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    variant="minimal"
                    onTrack={handleTrackToggle}
                    onUntrack={handleTrackToggle}
                    isTracked={trackedMarketIds.includes(market.id)}
                    trackingStatus="interested"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Heart className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium mb-1">No tracked markets</h3>
                <p className="text-xs text-muted-foreground mb-3 text-center max-w-xs">
                  Start tracking markets you're interested in.
                </p>
                <div className="flex gap-2">
                  <Link to="/markets">
                    <Button size="sm" variant="outline">Find Markets</Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={handleRefresh}>
                    Refresh
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium mb-1">No recent activity</h3>
            <p className="text-xs text-muted-foreground mb-3 text-center max-w-xs">
              Markets you view will appear here.
            </p>
            <Link to="/markets">
              <Button size="sm" variant="outline">Browse Markets</Button>
            </Link>
          </div>
        )}

        {/* Collapsible Quick Actions */}
        {trackedMarkets.length > 0 && (
          <Card className="overflow-hidden">
            <button
              onClick={() => setIsQuickActionsCollapsed(!isQuickActionsCollapsed)}
              className="w-full flex items-center justify-between p-3 min-h-[44px]"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Quick Actions</span>
                <Badge variant="outline" className="text-xs">4</Badge>
              </div>
              {isQuickActionsCollapsed ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {!isQuickActionsCollapsed && (
              <div className="px-3 pb-3 space-y-2">
                <Link to="/markets">
                  <Button variant="outline" size="sm" className="w-full justify-start h-9">
                    <Search className="w-4 h-4 mr-2" />
                    Find Markets
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-start h-9"
                  onClick={() => setShowCalendar(true)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-start h-9"
                  onClick={() => setShowEmailSettings(true)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Alerts
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-start h-9"
                  onClick={() => setShowExportModal(true)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export List
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Calendar Modal */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Market Calendar</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCalendar(false)}
                  >
                    Close
                  </Button>
                </div>
                <MarketCalendar
                  markets={trackedMarkets}
                  onMarketSelect={handleMarketSelect}
                />
              </div>
            </div>
          </div>
        )}

        {/* Email Alerts Settings Modal */}
        <EmailAlertsSettings
          isOpen={showEmailSettings}
          onClose={() => setShowEmailSettings(false)}
          onSave={handleEmailSettingsSave}
          initialPreferences={emailPreferences}
        />

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          markets={trackedMarkets}
        />
      </div>
    </div>
  )
}
