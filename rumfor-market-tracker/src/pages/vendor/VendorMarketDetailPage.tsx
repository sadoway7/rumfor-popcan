import React, { useState, Suspense } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  MessageCircle,
  Share,
  Heart,
  Download,
  Cloud,
  Car,
  Users,
  TrendingUp,
  AlertCircle,
  Settings
} from 'lucide-react'
import { useMarket } from '@/features/markets/hooks/useMarkets'
import { useVendorApplications } from '@/features/applications/hooks/useApplications'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

import { cn } from '@/utils/cn'
import { format } from 'date-fns'

// Lazy load heavy components for better performance
const VendorTodoList = React.lazy(() => import('@/components/VendorTodoList').then(module => ({ default: module.VendorTodoList })))
const VendorExpenseTracker = React.lazy(() => import('@/components/VendorExpenseTracker').then(module => ({ default: module.VendorExpenseTracker })))
const VendorAnalyticsDashboard = React.lazy(() => import('@/components/VendorAnalyticsDashboard').then(module => ({ default: module.VendorAnalyticsDashboard })))

// Loading component for lazy-loaded content
const TabContentLoader: React.FC = () => (
  <Card className="p-8">
    <div className="flex items-center justify-center">
      <Spinner className="w-6 h-6" />
      <span className="ml-2 text-muted-foreground">Loading...</span>
    </div>
  </Card>
)

// Error component for failed tab loads
const TabErrorFallback: React.FC = () => (
  <Card className="p-8">
    <div className="text-center">
      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
      <h3 className="text-lg font-semibold mb-2">Failed to load content</h3>
      <p className="text-muted-foreground">Please try refreshing the page.</p>
    </div>
  </Card>
)

const categoryLabels = {
  'farmers-market': 'Farmers Market',
  'arts-crafts': 'Arts & Crafts',
  'flea-market': 'Flea Market',
  'food-festival': 'Food Festival',
  'holiday-market': 'Holiday Market',
  'craft-show': 'Craft Show',
  'community-event': 'Community Event',
  'night-market': 'Night Market',
  'street-fair': 'Street Fair',
  'vintage-antique': 'Vintage & Antique'
}

const categoryColors: Record<string, string> = {
  'farmers-market': 'bg-green-100 text-green-800 border-green-200',
  'arts-crafts': 'bg-purple-100 text-purple-800 border-purple-200',
  'flea-market': 'bg-blue-100 text-blue-800 border-blue-200',
  'food-festival': 'bg-orange-100 text-orange-800 border-orange-200',
  'holiday-market': 'bg-red-100 text-red-800 border-red-200',
  'craft-show': 'bg-pink-100 text-pink-800 border-pink-200',
  'community-event': 'bg-gray-100 text-gray-800 border-gray-200',
  'night-market': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'street-fair': 'bg-amber-100 text-amber-800 border-amber-200',
  'vintage-antique': 'bg-slate-100 text-slate-800 border-slate-200'
}

const statusColors: Record<string, string> = {
  'active': 'bg-success/10 text-success border-success/20',
  'draft': 'bg-warning/10 text-warning border-warning/20',
  'cancelled': 'bg-destructive/10 text-destructive border-destructive/20',
  'completed': 'bg-muted text-muted-foreground border-muted'
}

export const VendorMarketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')

  const { market, isLoading, error, refetch } = useMarket(id!)
  const { myApplications } = useVendorApplications()

  // Check if user has already applied to this market
  const existingApplication = myApplications.find(app => app.marketId === id)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading market details...</p>
        </div>
      </div>
    )
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Market Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The market you're looking for doesn't exist or has been removed.
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate('/vendor/tracked-markets')} className="w-full">
              Back to Tracked Markets
            </Button>
            <Button onClick={() => refetch()} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const formatSchedule = (schedule: any[]) => {
    if (!schedule || schedule.length === 0) return 'Schedule TBD'

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const days = schedule
      .map((s: any) => dayNames[s.dayOfWeek])
      .filter((day: string, index: number, arr: string[]) => arr.indexOf(day) === index)
      .join(', ')

    const time = schedule[0]
    return `${days} ${time.startTime}-${time.endTime}`
  }

  const formatLocation = (location: any) => {
    if (!location || !location.address) {
      return 'Address not available'
    }
    return `${location.address?.street || ''}, ${location.address?.city || ''}, ${location.address?.state || ''} ${location.address?.zipCode || ''}`.trim()
  }

  const getNextMarketDate = () => {
    if (!market.schedule || market.schedule.length === 0) return null

    const now = new Date()
    const upcomingDates = market.schedule
      .map(s => {
        const startDate = new Date(s.startDate)
        if (startDate >= now) return startDate
        return null
      })
      .filter(date => date !== null)
      .sort((a, b) => a!.getTime() - b!.getTime())

    return upcomingDates[0] || null
  }

  const nextDate = getNextMarketDate()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/vendor/tracked-markets"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Tracked Markets
              </Link>
              <div className="h-4 border-l border-border" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className={cn(categoryColors[market.category])}>{categoryLabels[market.category]}</Badge>
                <Badge variant="outline" className={cn(statusColors[market.status])}>{market.status}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Favorite
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-3xl font-bold mb-2">{market.name}</h1>
            <div className="flex items-center gap-6 text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{formatLocation(market.location)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatSchedule(market.schedule)}</span>
              </div>
              {nextDate && (
                <div className="flex items-center gap-2 text-success">
                  <Clock className="w-4 h-4" />
                  <span>Next: {format(nextDate, 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-padding">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              size="lg" // Use larger size for better mobile touch targets
              className="mb-6"
              items={[
                {
                  key: 'overview',
                  label: 'Overview',
                  icon: <MapPin className="w-4 h-4" />,
                  content: (
                    <div className="space-y-6">
                      {/* Hero Image */}
                      {market.images && market.images.length > 0 && (
                        <Card className="overflow-hidden">
                          <div className="aspect-video relative">
                            <img
                              src={market.images[selectedImageIndex]}
                              alt={market.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-4 left-4">
                              <div className="flex gap-2">
                                {market.images.slice(0, 5).map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={cn(
                                      "w-2 h-2 rounded-full transition-colors",
                                      selectedImageIndex === index ? "bg-white" : "bg-white/50"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}

                      {/* Market Info Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Application Status */}
                        <Card className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-accent" />
                            </div>
                            <h3 className="text-lg font-semibold">Application Status</h3>
                          </div>

                          {existingApplication ? (
                            <div className="space-y-3">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-sm",
                                  existingApplication.status === 'approved' && "bg-success/10 text-success border-success/20",
                                  existingApplication.status === 'submitted' && "bg-warning/10 text-warning border-warning/20",
                                  existingApplication.status === 'rejected' && "bg-destructive/10 text-destructive border-destructive/20"
                                )}
                              >
                                {existingApplication.status.replace('-', ' ')}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                Submitted {format(new Date(existingApplication.createdAt), 'MMM d, yyyy')}
                              </p>
                              <Button
                                size="sm"
                                onClick={() => navigate(`/applications/${existingApplication.id}`)}
                              >
                                View Application
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-sm text-muted-foreground">Not applied yet</p>
                              <Button
                                size="sm"
                                onClick={() => navigate(`/markets/${id}/apply`)}
                              >
                                Apply to Market
                              </Button>
                            </div>
                          )}
                        </Card>

                        {/* Quick Stats */}
                        <Card className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-accent" />
                            </div>
                            <h3 className="text-lg font-semibold">Quick Stats</h3>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Status:</span>
                              <Badge className={cn(statusColors[market.status])}>{market.status}</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Category:</span>
                              <span>{categoryLabels[market.category]}</span>
                            </div>
                            {market.schedule && market.schedule.length > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Next Date:</span>
                                <span>{nextDate ? format(nextDate, 'MMM d') : 'N/A'}</span>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>

                      {/* Description */}
                      <Card className="p-6">
                        <h3 className="text-xl font-semibold mb-4">About This Market</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {market.description}
                        </p>
                      </Card>

                      {/* Contact Information */}
                      <Card className="p-6">
                        <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {market.contact.phone && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                📞
                              </div>
                              <div>
                                <p className="text-sm font-medium">Phone</p>
                                <p className="text-sm text-muted-foreground">{market.contact.phone}</p>
                              </div>
                            </div>
                          )}

                          {market.contact.email && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                ✉️
                              </div>
                              <div>
                                <p className="text-sm font-medium">Email</p>
                                <a href={`mailto:${market.contact.email}`} className="text-sm text-accent hover:underline">
                                  {market.contact.email}
                                </a>
                              </div>
                            </div>
                          )}

                          {market.contact.website && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                🌐
                              </div>
                              <div>
                                <p className="text-sm font-medium">Website</p>
                                <a href={market.contact.website} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                                  Visit Website
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  )
                },
                {
                  key: 'preparation',
                  label: 'Preparation',
                  icon: <CheckCircle className="w-4 h-4" />,
                  content: (
                    <ErrorBoundary fallback={<TabErrorFallback />}>
                      <Suspense fallback={<TabContentLoader />}>
                        <VendorTodoList marketId={market.id} />
                      </Suspense>
                    </ErrorBoundary>
                  )
                },
                {
                  key: 'expenses',
                  label: 'Expenses',
                  icon: <DollarSign className="w-4 h-4" />,
                  content: (
                    <ErrorBoundary fallback={<TabErrorFallback />}>
                      <Suspense fallback={<TabContentLoader />}>
                        <VendorExpenseTracker marketId={market.id} />
                      </Suspense>
                    </ErrorBoundary>
                  )
                },
                {
                  key: 'analytics',
                  label: 'Analytics',
                  icon: <TrendingUp className="w-4 h-4" />,
                  content: (
                    <ErrorBoundary fallback={<TabErrorFallback />}>
                      <Suspense fallback={<TabContentLoader />}>
                        <VendorAnalyticsDashboard
                          marketId={market.id}
                          marketData={market}
                          applicationData={existingApplication}
                        />
                      </Suspense>
                    </ErrorBoundary>
                  )
                },
                {
                  key: 'logistics',
                  label: 'Logistics',
                  icon: <Car className="w-4 h-4" />,
                  content: (
                    <Card className="p-8">
                      <div className="text-center">
                        <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Logistics Tools</h3>
                        <p className="text-muted-foreground">
                          Parking, loading zones, and transportation planning tools will be available here.
                        </p>
                      </div>
                    </Card>
                  )
                },
                {
                  key: 'communication',
                  label: 'Communication',
                  icon: <MessageCircle className="w-4 h-4" />,
                  content: (
                    <Card className="p-8">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Direct Messaging</h3>
                        <p className="text-muted-foreground">
                          Direct messaging with market promoter will be available here.
                        </p>
                      </div>
                    </Card>
                  )
                }
              ]}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="sticky top-6 space-y-4 lg:space-y-6">
              {/* Market Promoter */}
              {market.promoter && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Market Organizer</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {market.promoter.firstName[0]}{market.promoter.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{market.promoter.firstName} {market.promoter.lastName}</p>
                      <p className="text-sm text-muted-foreground">{market.promoter.email}</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Organizer
                  </Button>
                </Card>
              )}

              {/* Weather Forecast */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Weather Forecast
                </h3>
                {nextDate ? (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {format(nextDate, 'EEEE, MMM d')}
                    </p>
                    <div className="text-2xl mb-1">🌤️</div>
                    <p className="text-sm font-medium">72°F</p>
                    <p className="text-xs text-muted-foreground">Partly Cloudy</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">No upcoming dates</p>
                )}
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Market Settings
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Share className="w-4 h-4 mr-2" />
                    Share Market
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Details
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    View Community
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
