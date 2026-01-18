import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MarketGrid } from '@/components/MarketGrid'
import { MarketCalendar } from '@/components/MarketCalendar'
import { EmailAlertsSettings } from '@/components/EmailAlertsSettings'
import { ExportModal } from '@/components/ExportModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets'
import { Market } from '@/types'
import { cn } from '@/utils/cn'

export const MyMarketsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tracked' | 'recent'>('tracked')
  const [showCalendar, setShowCalendar] = useState(false)
  const [showEmailSettings, setShowEmailSettings] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
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
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Markets</h1>
              <p className="text-muted-foreground mt-1">
                Track your favorite markets and stay updated on events
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
              
              <Link to="/markets">
                <Button>
                  Discover Markets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tracked Markets</p>
                <p className="text-3xl font-bold">{trackedMarkets.length}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Events</p>
                <p className="text-3xl font-bold">
                  {trackedMarkets.filter(m => m.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-3xl font-bold">
                  {trackedMarkets.filter(m => m.schedule && m.schedule.length > 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <button
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  activeTab === 'tracked'
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={() => setActiveTab('tracked')}
              >
                Tracked Markets ({trackedMarkets.length})
              </button>
              <button
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  activeTab === 'recent'
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={() => setActiveTab('recent')}
              >
                Recently Viewed
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'tracked' && (
          <div>
            {trackedMarkets.length > 0 ? (
              <MarketGrid
                markets={trackedMarkets}
                isLoading={isLoading}
                onTrack={handleTrackToggle}
                onUntrack={handleTrackToggle}
                trackedMarketIds={trackedMarketIds}
                emptyStateProps={{
                  title: "No tracked markets yet",
                  description: "Start tracking markets you're interested in to see them here.",
                  action: (
                    <Link to="/markets">
                      <Button>Discover Markets</Button>
                    </Link>
                  )
                }}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">No tracked markets yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start tracking markets you're interested in by clicking the track button on any market.
                </p>
                <div className="space-x-3">
                  <Link to="/markets">
                    <Button>Discover Markets</Button>
                  </Link>
                  <Button variant="outline" onClick={handleRefresh}>
                    Refresh
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No recent activity</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Markets you view will appear here for quick access.
            </p>
            <Link to="/markets">
              <Button>Browse Markets</Button>
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        {trackedMarkets.length > 0 && (
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/markets">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find More Markets
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowCalendar(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v4m-4-4h.01M16 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Calendar
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowEmailSettings(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Alerts
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowExportModal(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export List
              </Button>
            </div>
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
