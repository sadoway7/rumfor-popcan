import { useState, useMemo } from 'react'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Edit3,
  Copy,
  Eye,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Pause,
  Settings,
  Grid3X3
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, SelectOption } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import { useAuthStore } from '@/features/auth/authStore'
import { cn } from '@/utils/cn'

export function PromoterCalendarPage() {
  const { user } = useAuthStore()
  const { markets } = useMarkets()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedMarket, setSelectedMarket] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Filter markets created by current promoter
  const myMarkets = useMemo(() => {
    return markets.filter(market => market.promoterId === user?.id)
  }, [markets, user?.id])

  // Mock market events for calendar
  const marketEvents = useMemo(() => {
    const events: Array<{
      id: string;
      title: string;
      date: Date;
      marketId: string;
      status: 'active' | 'upcoming' | 'completed';
      vendors: number;
      expectedAttendance: number;
      recurring: boolean;
    }> = []
    
    myMarkets.forEach((market, index) => {
      const baseDate = new Date()
      baseDate.setDate(baseDate.getDate() + (index * 7)) // Spread events across weeks
      
      // Generate recurring events for recurring markets
      for (let i = 0; i < 12; i++) {
        const eventDate = new Date(baseDate)
        eventDate.setDate(eventDate.getDate() + (i * 7)) // Weekly events
        
        events.push({
          id: `${market.id}-${i}`,
          title: market.name,
          date: eventDate,
          marketId: market.id,
          status: market.status === 'draft' ? 'upcoming' : market.status as 'active' | 'upcoming' | 'completed',
          vendors: Math.floor(Math.random() * 30) + 10,
          expectedAttendance: Math.floor(Math.random() * 500) + 100,
          recurring: false
        })
      }
    })
    
    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [myMarkets])

  // Filter events by selected market if any
  const filteredEvents = useMemo(() => {
    if (!selectedMarket) return marketEvents
    return marketEvents.filter(event => event.marketId === selectedMarket)
  }, [marketEvents, selectedMarket])

  // Calendar navigation functions
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        break
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Calendar utilities
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = event.date
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear()
    })
  }

  // Helper functions
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />
      case 'draft':
        return <Edit3 className="h-3 w-3" />
      case 'paused':
        return <Pause className="h-3 w-3" />
      case 'cancelled':
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  // Upcoming events for sidebar
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return filteredEvents
      .filter(event => event.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5)
  }, [filteredEvents])

  // Statistics
  const stats = useMemo(() => {
    const totalMarkets = myMarkets.length
    const activeMarkets = myMarkets.filter(m => m.status === 'active').length
    const upcomingEventsCount = upcomingEvents.length
    const totalEvents = filteredEvents.length
    
    return {
      totalMarkets,
      activeMarkets,
      upcomingEventsCount,
      totalEvents
    }
  }, [myMarkets, upcomingEvents, filteredEvents])

  const marketFilterOptions: SelectOption[] = [
    { value: '', label: 'All Markets' },
    ...myMarkets.map(market => ({
      value: market.id,
      label: market.name
    }))
  ]

  const viewModeOptions: SelectOption[] = [
    { value: 'month', label: 'Month View' },
    { value: 'week', label: 'Week View' },
    { value: 'day', label: 'Day View' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Market Calendar</h1>
              <p className="text-muted-foreground">
                Manage your market schedule and recurring events
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={selectedMarket}
              onValueChange={setSelectedMarket}
              options={marketFilterOptions}
              className="w-48"
              placeholder="Filter by market"
            />
            <Select
              value={viewMode}
              onValueChange={(value) => setViewMode(value as 'month' | 'week' | 'day')}
              options={viewModeOptions}
              className="w-40"
            />
            <Button
              variant="outline"
              onClick={() => {/* Refresh data */}}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Markets</p>
              <p className="text-3xl font-bold">{stats.totalMarkets}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Grid3X3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Markets</p>
              <p className="text-3xl font-bold">{stats.activeMarkets}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
              <p className="text-3xl font-bold">{stats.upcomingEventsCount}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Events</p>
              <p className="text-3xl font-bold">{stats.totalEvents}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Calendar and Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h2>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateCalendar('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateCalendar('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                >
                  Today
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'month' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Month
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Week
                </Button>
                <Button
                  variant={viewMode === 'day' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Day
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            {viewMode === 'month' && (
              <div className="space-y-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentDate).map((day, index) => {
                    if (!day) {
                      return <div key={index} className="p-2 h-24"></div>
                    }
                    
                    const dayEvents = getEventsForDate(day)
                    const isToday = day.toDateString() === new Date().toDateString()
                    
                    return (
                      <div
                        key={index}
                        className={cn(
                          "p-2 h-24 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                          isToday && "bg-primary/10 border-primary"
                        )}
                      >
                        <div className={cn(
                          "text-sm font-medium mb-1",
                          isToday ? "text-primary" : ""
                        )}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={cn(
                                "text-xs p-1 rounded border truncate",
                                getStatusColor(event.status)
                              )}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Week and Day views would go here */}
            {viewMode !== 'month' && (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} view coming soon</p>
                <p className="text-sm">For now, please use Month view</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Upcoming Events</h3>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm truncate">{event.title}</h4>
                      <Badge variant="outline" className={cn("text-xs", getStatusColor(event.status))}>
                        {getStatusIcon(event.status)}
                        <span className="ml-1">{event.status}</span>
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.vendors} vendors
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming events</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Event
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Event
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Recurring Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="h-4 w-4 mr-2" />
                Filter Events
              </Button>
            </div>
          </Card>

          {/* Event Details */}
          {selectedMarket && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Market Details</h3>
              {(() => {
                const market = myMarkets.find(m => m.id === selectedMarket)
                if (!market) return null
                
                return (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">{market.name}</h4>
                      <p className="text-sm text-muted-foreground">{market.description}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{market.location?.address || 'No location specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(getStatusColor(market.status))}>
                          {market.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </Card>
          )}
        </div>
      </div>

      {/* Create Event Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Create New Event</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Market</label>
                <Select
                  options={marketFilterOptions}
                  placeholder="Select a market"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1">
                  Create Event
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}