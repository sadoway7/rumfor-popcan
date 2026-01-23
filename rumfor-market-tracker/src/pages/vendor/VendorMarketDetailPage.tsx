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
  Cloud,
  Car,
  AlertCircle,
  X,
  ChevronDown
} from 'lucide-react'
import { useMarket } from '@/features/markets/hooks/useMarkets'
import { useVendorApplications } from '@/features/applications/hooks/useApplications'
import { useTodos } from '@/features/tracking/hooks/useTodos'
import { Todo } from '@/types'
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
  <Card className="p-4">
    <div className="flex items-center justify-center py-8">
      <Spinner className="w-5 h-5" />
      <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
    </div>
  </Card>
)

// Error component for failed tab loads
const TabErrorFallback: React.FC = () => (
  <Card className="p-4">
    <div className="text-center py-4">
      <AlertCircle className="w-6 h-6 mx-auto mb-2 text-destructive" />
      <p className="text-sm text-muted-foreground">Failed to load</p>
    </div>
  </Card>
)

const categoryLabels: Record<string, string> = {
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

const statusColors: Record<string, string> = {
  'active': 'bg-success/10 text-success',
  'draft': 'bg-warning/10 text-warning',
  'cancelled': 'bg-destructive/10 text-destructive',
  'completed': 'bg-muted text-muted-foreground'
}

// Tracking status colors for hero overlay
const trackingStatusColors: Record<string, string> = {
  'interested': 'bg-blue-500',
  'applied': 'bg-yellow-500',
  'approved': 'bg-green-500',
  'attending': 'bg-emerald-500',
  'declined': 'bg-orange-500',
  'cancelled': 'bg-red-500',
  'completed': 'bg-gray-500'
}

const trackingStatusLabels: Record<string, string> = {
  'interested': 'Interested',
  'applied': 'Applied',
  'approved': 'Approved',
  'attending': 'Attending',
  'completed': 'Completed'
}

const trackingStatusOptions = [
  { value: 'interested', label: 'Interested', color: 'bg-blue-500' },
  { value: 'applied', label: 'Applied', color: 'bg-yellow-500' },
  { value: 'approved', label: 'Approved', color: 'bg-green-500' },
  { value: 'attending', label: 'Attending', color: 'bg-emerald-500' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-500' }
]

// Helper functions
const formatSchedule = (schedule: any[]) => {
  if (!schedule || schedule.length === 0) return 'Schedule TBD'
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const days = schedule
    .map((s: any) => dayNames[s.dayOfWeek])
    .filter((day: string, index: number, arr: string[]) => arr.indexOf(day) === index)
    .join(', ')
  const time = schedule[0]
  return `${days} ${time.startTime}-${time.endTime}`
}

const formatLocation = (location: any) => {
  if (!location || !location.address) return 'Address TBD'
  const { street, city, state, zipCode } = location.address
  return `${street || ''}, ${city || ''}, ${state || ''} ${zipCode || ''}`.trim().replace(/^, |, $/g, '')
}

const getNextMarketDate = (schedule: any[]) => {
  if (!schedule || schedule.length === 0) return null
  const now = new Date()
  const upcomingDates = schedule
    .map(s => {
      const startDate = new Date(s.startDate)
      if (startDate >= now) return startDate
      return null
    })
    .filter(date => date !== null)
    .sort((a, b) => a!.getTime() - b!.getTime())
  return upcomingDates[0] || null
}

export const VendorMarketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('info')
  const [showStatusModal, setShowStatusModal] = useState(false)

  const { market, isLoading, error } = useMarket(id!)
  const { myApplications } = useVendorApplications()
  const { todos } = useTodos(id!)

  const existingApplication = myApplications.find(app => app.marketId === id)
  const completedTodos = todos.filter((t: Todo) => t.completed)

  // Get tracking status (from application or default to interested)
  const trackingStatus: 'interested' | 'applied' | 'approved' | 'attending' | 'completed' = 
    existingApplication?.status === 'approved' ? 'approved' 
    : existingApplication?.status === 'submitted' ? 'applied'
    : existingApplication?.status ? 'applied'
    : 'interested'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <h1 className="text-lg font-bold mb-2">Market Not Found</h1>
          <p className="text-sm text-muted-foreground mb-4">The market you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/vendor/tracked-markets')} size="sm">
            Back to Tracked Markets
          </Button>
        </div>
      </div>
    )
  }

  const nextDate = getNextMarketDate(market.schedule)

  const handleStatusChange = (newStatus: string) => {
    // TODO: Hook up to update tracking status API
    console.log('Status changed to:', newStatus)
    setShowStatusModal(false)
  }

  // Tab Content Components
  const MarketInfoTabContent = () => (
    <div className="space-y-4 -mt-2">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Status</p>
          <Badge className={cn(statusColors[market.status], "text-xs")}>{market.status}</Badge>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Category</p>
          <span className="text-sm font-medium">{categoryLabels[market.category]?.split(' ')[0]}</span>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Next</p>
          <span className="text-sm font-medium">{nextDate ? format(nextDate, 'MMM d') : 'TBD'}</span>
        </Card>
      </div>

      {/* Schedule & Location */}
      <Card className="p-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{formatSchedule(market.schedule)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{formatLocation(market.location)}</span>
          </div>
          {nextDate && (
            <div className="flex items-center gap-2 text-success">
              <Clock className="w-4 h-4" />
              <span>{format(nextDate, 'EEEE, MMM d')}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Application Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-accent" />
            <div>
              <p className="font-medium text-sm">Application</p>
              {existingApplication ? (
                <Badge variant="outline" className={cn("text-xs", 
                  existingApplication.status === 'approved' && "bg-success/10 text-success",
                  existingApplication.status === 'submitted' && "bg-warning/10 text-warning",
                  existingApplication.status === 'rejected' && "bg-destructive/10 text-destructive"
                )}>
                  {existingApplication.status}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">Not applied</span>
              )}
            </div>
          </div>
          <Button size="sm" onClick={() => existingApplication ? navigate(`/applications/${existingApplication.id}`) : navigate(`/markets/${id}/apply`)}>
            {existingApplication ? 'View' : 'Apply'}
          </Button>
        </div>
      </Card>

      {/* Weather */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Weather</span>
          </div>
          {nextDate ? (
            <div className="text-right">
              <p className="text-sm font-medium">72°F</p>
              <p className="text-xs text-muted-foreground">Partly Cloudy</p>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No upcoming dates</span>
          )}
        </div>
      </Card>

      {/* About */}
      <Card className="p-4">
        <h3 className="font-semibold mb-2">About</h3>
        <p className="text-sm text-muted-foreground">{market.description}</p>
      </Card>

      {/* Contact */}
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Contact</h3>
        <div className="space-y-2 text-sm">
          {market.contact.phone && <p>📞 {market.contact.phone}</p>}
          {market.contact.email && <p>✉️ <a href={`mailto:${market.contact.email}`} className="text-accent">{market.contact.email}</a></p>}
          {market.contact.website && <p>🌐 <a href={market.contact.website} target="_blank" rel="noopener noreferrer" className="text-accent">Website</a></p>}
        </div>
      </Card>

      {/* Logistics & Communication placeholders */}
      <Card className="p-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Car className="w-4 h-4" /> Logistics
        </h3>
        <p className="text-sm text-muted-foreground">Parking & transportation planning coming soon.</p>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" /> Communication
        </h3>
        <p className="text-sm text-muted-foreground">Direct messaging coming soon.</p>
      </Card>
    </div>
  )

  const TasksTabContent = () => (
    <div className="space-y-4 -mt-2">
      <ErrorBoundary fallback={<TabErrorFallback />}>
        <Suspense fallback={<TabContentLoader />}>
          <VendorTodoList marketId={market.id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )

  const BudgetingTabContent = () => (
    <div className="space-y-4 -mt-2">
      <ErrorBoundary fallback={<TabErrorFallback />}>
        <Suspense fallback={<TabContentLoader />}>
          <VendorExpenseTracker marketId={market.id} />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary fallback={<TabErrorFallback />}>
        <Suspense fallback={<TabContentLoader />}>
          <VendorAnalyticsDashboard marketId={market.id} marketData={market} applicationData={existingApplication} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )

  return (
    <div className="min-h-screen bg-background -m-4">
      {/* Hero Image with Overlay - like VendorTrackedMarketRow */}
      <div className="relative w-full h-56 bg-gradient-to-br from-gray-800 to-gray-900">
        {market.images && market.images.length > 0 ? (
          <img 
            src={market.images[selectedImageIndex]} 
            alt={market.name} 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
        
        {/* Status color tint */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent",
          trackingStatus === 'applied' && "from-yellow-500/20",
          trackingStatus === 'approved' && "from-green-500/20"
        )} />
        
        <div className="absolute inset-0 p-4 flex flex-col">
          {/* Top row: Back button + Status badge */}
          <div className="flex justify-between items-start mb-auto">
            <Link to="/vendor/tracked-markets" className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <button
              onClick={() => setShowStatusModal(true)}
              className={cn(
                'flex items-center gap-2 text-sm font-semibold text-white border-0 shadow-lg px-4 py-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity',
                trackingStatusColors[trackingStatus]
              )}
            >
              <span>{trackingStatusLabels[trackingStatus]}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          {/* Bottom info - market name and details */}
          <div className="text-white mt-auto">
            <h1 className="font-bold text-2xl leading-tight mb-2 drop-shadow-lg">{market.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{market.location.city}, {market.location.state}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatSchedule(market.schedule).split('·')[0] || formatSchedule(market.schedule)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {completedTodos.length}/{todos.length}
                </span>
              </div>
              <Badge variant="outline" className="text-white border-white/50 bg-white/10">
                {categoryLabels[market.category]}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Image dots if multiple images */}
        {market.images && market.images.length > 1 && (
          <div className="absolute bottom-4 left-4 flex gap-1">
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
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 py-3">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="lg"
          items={[
            {
              key: 'info',
              label: 'Info',
              icon: <MapPin className="w-4 h-4" />,
              content: <MarketInfoTabContent />
            },
            {
              key: 'tasks',
              label: 'Tasks',
              icon: <CheckCircle className="w-4 h-4" />,
              content: <TasksTabContent />
            },
            {
              key: 'budgeting',
              label: 'Budget',
              icon: <DollarSign className="w-4 h-4" />,
              content: <BudgetingTabContent />
            }
          ]}
        />
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowStatusModal(false)}>
          <div className="rounded-xl shadow-2xl max-w-sm w-full border-2 border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-lg">Change Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="p-1.5 hover:bg-surface rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {trackingStatusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 font-medium",
                    trackingStatus === option.value
                      ? "bg-accent text-accent-foreground shadow-lg"
                      : "bg-surface hover:bg-surface-2 text-foreground border border-border"
                  )}
                >
                  <div className={cn("w-3 h-3 rounded-full flex-shrink-0", option.color)} />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
