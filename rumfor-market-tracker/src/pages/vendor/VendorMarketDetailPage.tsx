import React, { useState, useEffect, Suspense } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  MessageCircle,
  Cloud,
  Car,
  AlertCircle,
  X,
  ChevronDown,
  CheckSquare,
  DollarSign,
  BarChart3,
  Navigation
} from 'lucide-react'
import { useMarket } from '@/features/markets/hooks/useMarkets'
import { useWeather } from '@/features/markets/hooks/useWeather'
import { usePreferencesStore } from '@/features/theme/themeStore'
import { useVendorApplications } from '@/features/applications/hooks/useApplications'
import { useTodos } from '@/features/tracking/hooks/useTodos'
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets'
import { Todo } from '@/types'
import { formatTime12Hour } from '@/utils/formatTime'
import { formatLocalDate } from '@/utils/formatDate'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

import { cn } from '@/utils/cn'
import { format } from 'date-fns'
import { TRACKING_STATUS_OPTIONS, TRACKING_STATUS_COLORS, TRACKING_STATUS_LABELS } from '@/config/trackingStatus'
import { StatusChangeModal } from '@/components/StatusChangeModal'

// Lazy load heavy components for better performance
const VendorTodoList = React.lazy(() => import('@/components/VendorTodoList').then(module => ({ default: module.VendorTodoList })))
const VendorBudgetList = React.lazy(() => import('@/components/VendorBudgetList').then(module => ({ default: module.VendorBudgetList })))

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

// Helper functions
const formatSchedule = (schedule: any[]) => {
  if (!schedule || schedule.length === 0) return 'Schedule TBD'
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const days = schedule
    .map((s: any) => dayNames[s.dayOfWeek])
    .filter((day: string, index: number, arr: string[]) => arr.indexOf(day) === index)
    .join(', ')
  const time = schedule[0]
  return `${days} ${formatTime12Hour(time.startTime)}-${formatTime12Hour(time.endTime)}`
}

const formatLocation = (location: any) => {
  if (!location) return 'Address TBD'
  const parts = [
    location.address || '',
    location.city || '',
    location.state || ''
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : 'Address TBD'
}

const getNextMarketDate = (schedule: any[]) => {
  if (!schedule || schedule.length === 0) return null
  const now = new Date()
  const upcomingDates = schedule
    .map(s => {
      const localDate = formatLocalDate(s.startDate)
      const startDate = new Date(localDate + 'T12:00:00')
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
  const [activeTab, setActiveTab] = useState('tasks')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [hasInitializedDates, setHasInitializedDates] = useState(false)
  const [selectedWeatherDay, setSelectedWeatherDay] = useState<any>(null)

  const { market, isLoading, error } = useMarket(id!)
  const { myApplications } = useVendorApplications()
  const { todos } = useTodos(id!)
  const { getTrackingStatus, trackMarket, trackingData } = useTrackedMarkets()
  const { weather, isLoading: weatherLoading } = useWeather(market)
  const { formatTemperature } = usePreferencesStore()

  // Initialize selected dates from tracking data once after mount
  useEffect(() => {
    if (id && trackingData && !hasInitializedDates) {
      const tracking = trackingData.find((t: any) => t.marketId === id)
      if (tracking?.attendingDates) {
        setSelectedDates(tracking.attendingDates)
      }
      setHasInitializedDates(true)
    }
  }, [id, trackingData, hasInitializedDates])

  // Toggle date selection for multi-date markets
  const toggleDate = (scheduleId: string) => {
    setSelectedDates(prev => 
      prev.includes(scheduleId)
        ? prev.filter(id => id !== scheduleId)
        : [...prev, scheduleId]
    )
  }

  // Save attendance dates to backend
  const saveAttendanceDates = async () => {
    try {
      await trackMarket(id!, undefined, selectedDates)
      // Show success toast if available
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast('Attendance dates saved successfully!', 'success')
      } else {
        alert('Attendance dates saved successfully!')
      }
    } catch (error) {
      console.error('Failed to save attendance dates:', error)
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast('Failed to save attendance dates', 'error')
      } else {
        alert('Failed to save attendance dates')
      }
    }
  }

  const existingApplication = myApplications.find(app => app.marketId === id)
  const completedTodos = todos.filter((t: Todo) => t.completed)

  // Get tracking status from tracking store (same as the list)
  const tracking = getTrackingStatus(id!)
  const trackingStatus: 'interested' | 'applied' | 'approved' | 'attending' | 'completed' =
    (tracking?.status as any) || 'interested'

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

  const handleStatusChange = async (newStatus: string) => {
    try {
      await trackMarket(id!, newStatus)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
    setShowStatusModal(false)
  }

  // Tab Content Components
  const MarketInfoTabContent = () => {
    const isCommunityMarket = market.marketType === 'vendor-created'
    
    return (
    <div className="space-y-4 -mt-2 p-4">
      {/* Location */}
      {market.location?.city && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-1 border border-surface-3">
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold">
              {[market.location.city, market.location.state].filter(Boolean).join(', ')}
            </p>
            {market.location.address && (
              <p className="text-sm text-muted-foreground mt-0.5">{market.location.address}</p>
            )}
          </div>
          <button
            onClick={() => {
              const address = [market.location.address, market.location.city, market.location.state].filter(Boolean).join(', ')
              window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank')
            }}
            className="h-10 w-10 flex-shrink-0 bg-white border border-gray-200 shadow-sm hover:bg-accent hover:border-accent hover:text-accent-foreground text-muted-foreground rounded-full transition-all duration-200 inline-flex items-center justify-center"
          >
            <MapPin className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Weather Panel */}
      {nextDate && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Weather Forecast</h3>
            </div>
            <span className="text-xs text-muted-foreground">{market.location?.city}</span>
          </div>
          
          {weatherLoading ? (
            <div className="flex items-center justify-center py-6">
              <Spinner className="w-5 h-5" />
              <span className="ml-2 text-sm text-muted-foreground">Loading weather...</span>
            </div>
          ) : weather?.days ? (
            <div className="overflow-x-auto -mx-4 px-4">
              <div className="flex gap-3">
                {weather.days.map((day, idx) => {
                  const dateObj = new Date(day.date + 'T12:00:00')
                  const dayNum = dateObj.getDate()
                  
                  return (
                  <button
                    key={idx}
                    onClick={() => setSelectedWeatherDay(day)}
                    className={cn(
                      "flex-shrink-0 rounded-xl p-3 min-w-[80px] transition-all active:scale-95",
                      day.isMarketDay 
                        ? "bg-gradient-to-b from-accent/20 to-accent/5 border-2 border-accent/40" 
                        : "bg-surface-1 hover:bg-surface-2 border border-transparent"
                    )}
                  >
                    <div className="text-center">
                      <p className={cn(
                        "text-xs font-medium mb-1",
                        day.isMarketDay ? "text-accent" : "text-muted-foreground"
                      )}>{day.dayName} {dayNum}</p>
                      <div className="text-3xl mb-1.5">{day.icon}</div>
                      <p className="text-xs">
                        <span className="font-bold">{formatTemperature(day.high)}</span>
                        <span className="text-muted-foreground ml-1">{formatTemperature(day.low)}</span>
                      </p>
                      {day.isMarketDay && (
                        <p className="text-[10px] text-accent font-semibold mt-1.5">Market Day</p>
                      )}
                    </div>
                  </button>
                )})}
              </div>
            </div>
          ) : market.location?.city ? (
            <a
              href={`https://www.google.com/search?q=weather+${encodeURIComponent(market.location.city)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center py-4 text-sm text-accent hover:underline"
            >
              View {market.location.city} weather →
            </a>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No location set</p>
          )}
        </Card>
      )}

      {/* Dates */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
          {market.schedule?.length > 0 ? new Date(market.schedule[0].startDate).getFullYear() : new Date().getFullYear()} Dates
        </p>
        <div className="flex flex-col gap-0.5">
          {market.schedule && market.schedule.length > 0 ? (
            market.schedule.map((scheduleItem: any, index: number) => {
              const dateObj = new Date(scheduleItem.startDate + 'T12:00:00')
              const monthAbbr = dateObj.toLocaleDateString('en-US', { month: 'short' })
              const dayNum = dateObj.getDate()
              const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
              const fullMonth = dateObj.toLocaleDateString('en-US', { month: 'long' })
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const itemDate = new Date(scheduleItem.startDate)
              itemDate.setHours(0, 0, 0, 0)
              const isFirstUpcoming = itemDate >= today && index === market.schedule.findIndex((s: any) => {
                const d = new Date(s.startDate)
                d.setHours(0, 0, 0, 0)
                return d >= today
              })
              
              return (
                <div
                  key={scheduleItem.id || index}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg bg-surface-1"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-lg border flex flex-col items-center justify-center flex-shrink-0",
                    isFirstUpcoming 
                      ? "bg-white border-accent" 
                      : "bg-white border-gray-300"
                  )}>
                    <span className="text-xs font-bold uppercase text-accent leading-none">{monthAbbr}</span>
                    <span className="text-2xl font-bold text-gray-800 leading-tight">{dayNum}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold">{weekday}, {fullMonth} {dayNum}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime12Hour(scheduleItem.startTime)} – {formatTime12Hour(scheduleItem.endTime)}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground py-3 px-2">Schedule not available</p>
          )}
        </div>
      </div>

      {/* Multi-date attendance selection */}
      {Array.isArray(market.schedule) && market.schedule.length > 1 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Attendance Dates</h3>
            <Badge variant="outline" className="text-xs ml-auto">
              {selectedDates.length}/{market.schedule.length} selected
            </Badge>
          </div>
          <div className="space-y-2">
            {market.schedule.map((schedule, index) => {
              const date = new Date(schedule.startDate)
              const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][schedule.dayOfWeek]
              const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              const scheduleId = schedule.id
              const isSelected = scheduleId ? selectedDates.includes(scheduleId) : false
              
              return (
                <div
                  key={scheduleId || index}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all",
                    isSelected ? "bg-accent/10 border-accent" : "hover:bg-muted/50"
                  )}
                  onClick={() => scheduleId && toggleDate(scheduleId)}
                >
                  <div className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center",
                    isSelected ? "bg-accent border-accent text-white" : "border-gray-300"
                  )}>
                    {isSelected && <CheckCircle className="w-3 h-3" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{dayName}, {dateStr}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime12Hour(schedule.startTime)} - {formatTime12Hour(schedule.endTime)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          <Button 
            className="w-full mt-3" 
            size="sm" 
            onClick={() => saveAttendanceDates()}
            disabled={selectedDates.length === 0}
          >
            Save Attendance Dates
          </Button>
        </Card>
      )}

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

      {/* Logistics - only for promoter-created markets */}
      {!isCommunityMarket && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Car className="w-4 h-4" /> Logistics
          </h3>
          <p className="text-sm text-muted-foreground">Parking & transportation planning coming soon.</p>
        </Card>
      )}

      {/* Communication - only for promoter-created markets */}
      {!isCommunityMarket && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> Communication
          </h3>
          <p className="text-sm text-muted-foreground">Direct messaging coming soon.</p>
        </Card>
      )}
    </div>
  )}

  const TasksTabContent = () => (
    <div className="space-y-4 -mt-2 p-4">
      <ErrorBoundary fallback={<TabErrorFallback />}>
        <Suspense fallback={<TabContentLoader />}>
          <VendorTodoList marketId={market.id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )

  const BudgetingTabContent = () => (
    <div className="-mt-2 p-4">
      <ErrorBoundary fallback={<TabErrorFallback />}>
        <Suspense fallback={<TabContentLoader />}>
          <VendorBudgetList marketId={market.id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )

  return (
    <div className="min-h-screen bg-background -m-4">
      {/* Hero Image with Overlay - like VendorTrackedMarketRow */}
      <div className="relative w-full h-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-none sm:rounded-t-3xl overflow-hidden">
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
          trackingStatus === 'approved' && "from-green-500/20",
          trackingStatus === 'attending' && "from-emerald-500/20",
          trackingStatus === 'completed' && "from-gray-500/20"
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
                TRACKING_STATUS_COLORS[trackingStatus]
              )}
            >
              <span>{TRACKING_STATUS_LABELS[trackingStatus]}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          {/* Bottom info - market name and details */}
          <div className="text-white mt-auto">
            <h1 className="font-bold text-xl leading-tight mb-2 drop-shadow-lg">{market.name}</h1>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{market.location.city}, {market.location.state}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
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
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        variant="pills"
        size="md"
        listClassName="bg-black px-2 sm:px-4 py-3 gap-1 sm:gap-2 rounded-none sm:rounded-b-3xl"
        items={[
            {
              key: 'tasks',
              label: 'Tasks',
              icon: <CheckSquare className="w-4 h-4" />,
              content: <TasksTabContent />
            },
            {
              key: 'budgeting',
              label: 'Budget',
              icon: <DollarSign className="w-4 h-4" />,
              content: <BudgetingTabContent />
            },
            {
              key: 'info',
              label: 'Stats',
              icon: <BarChart3 className="w-4 h-4" />,
              content: <MarketInfoTabContent />
            }
          ]}
        />

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        currentStatus={trackingStatus}
        statusOptions={TRACKING_STATUS_OPTIONS}
        onStatusChange={handleStatusChange}
      />

      {/* Weather Detail Modal */}
      <Modal isOpen={!!selectedWeatherDay} onClose={() => setSelectedWeatherDay(null)} size="sm" showCloseButton={false}>
        {selectedWeatherDay && (
          <div className="relative">
            <button
              onClick={() => setSelectedWeatherDay(null)}
              className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-3 mb-3 pr-8">
              <span className="text-7xl leading-none">{selectedWeatherDay.icon}</span>
              <div className="flex-1">
                <p className="text-xl font-bold">{selectedWeatherDay.dayName}, {selectedWeatherDay.monthName} {selectedWeatherDay.dayNumber}</p>
                <p className="text-sm text-muted-foreground">{selectedWeatherDay.condition}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-muted-foreground font-medium">H</span>
                <span className="text-3xl font-bold">{formatTemperature(selectedWeatherDay.high)}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-muted-foreground font-medium">L</span>
                <span className="text-2xl font-semibold text-muted-foreground">{formatTemperature(selectedWeatherDay.low)}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="p-2.5 rounded-lg bg-surface-1 border border-surface-3">
                <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Rain</p>
                <p className="text-sm font-bold">{selectedWeatherDay.precipitation}%</p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-1 border border-surface-3">
                <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Wind</p>
                <p className="text-sm font-bold">{selectedWeatherDay.windSpeed}<span className="text-[10px] font-normal">km/h</span></p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-1 border border-surface-3">
                <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Sunrise</p>
                <p className="text-sm font-bold">{selectedWeatherDay.sunrise}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-1 border border-surface-3">
                <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Sunset</p>
                <p className="text-sm font-bold">{selectedWeatherDay.sunset}</p>
              </div>
            </div>

            {selectedWeatherDay.hourly?.length > 0 && (
              <div className="overflow-x-auto">
                <div className="flex gap-2">
                  {selectedWeatherDay.hourly.map((h: any) => (
                    <div 
                      key={h.hour} 
                      className={cn(
                        "flex flex-col items-center py-2 px-1.5 rounded-lg min-w-[38px]",
                        h.hour >= 6 && h.hour <= 20 ? "bg-surface-1 border border-surface-3" : "opacity-50"
                      )}
                    >
                      <p className="text-[10px] text-muted-foreground mb-1 font-medium">
                        {h.hour === 0 ? '12am' : h.hour === 12 ? '12pm' : h.hour > 12 ? `${h.hour - 12}pm` : `${h.hour}am`}
                      </p>
                      <span className="text-lg">{h.icon}</span>
                      <p className="text-xs font-semibold mt-0.5">{formatTemperature(h.temp)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
