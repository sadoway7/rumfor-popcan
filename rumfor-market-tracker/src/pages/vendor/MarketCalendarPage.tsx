import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/features/auth/authStore'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import { useApplications } from '@/features/applications/hooks/useApplications'

export function MarketCalendarPage() {
  const { user } = useAuthStore()
  const { markets, isLoading: marketsLoading } = useMarkets()
  const { applications, isLoading: applicationsLoading } = useApplications()
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get markets the user has applied to or been approved for
  const myApplications = applications.filter(app => app.vendorId === user?.id)
  const myMarketIds = myApplications.map(app => app.marketId)
  const myMarkets = markets.filter(market => myMarketIds.includes(market.id))

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const calendarDays = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get markets scheduled for a specific day
  const getMarketsForDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    const dayOfWeek = date.getDay()
    
    return myMarkets.filter(market => {
      return market.schedule.some(schedule => 
        schedule.dayOfWeek === dayOfWeek && 
        schedule.isRecurring &&
        new Date(schedule.startDate) <= date &&
        new Date(schedule.endDate) >= date
      )
    })
  }

  // Get application status for a market
  const getMarketApplicationStatus = (marketId: string) => {
    const application = myApplications.find(app => app.marketId === marketId)
    return application?.status || null
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (marketsLoading || applicationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Market Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View your market schedule and upcoming events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/vendor/todos">
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              View Planning
            </Button>
          </Link>
          <Link to="/vendor/expenses">
            <Button variant="outline" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              View Expenses
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold text-foreground min-w-[200px] text-center">
              {formatMonthYear(currentDate)}
            </h2>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} className="p-2 h-24"></div>
            }
            
            const marketsForDay = getMarketsForDay(day)
            const isToday = day === new Date().getDate() && 
                           currentMonth === new Date().getMonth() && 
                           currentYear === new Date().getFullYear()
            
            return (
              <div 
                key={day} 
                className={`p-2 h-24 border border-border rounded-lg ${
                  isToday ? 'bg-accent/10 border-accent' : 'bg-surface'
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-accent' : 'text-foreground'
                }`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {marketsForDay.slice(0, 2).map(market => {
                    const status = getMarketApplicationStatus(market.id)
                    return (
                      <div 
                        key={market.id}
                        className="text-xs p-1 bg-muted rounded truncate"
                        title={market.name}
                      >
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            status === 'approved' ? 'bg-green-500' :
                            status === 'under-review' ? 'bg-yellow-500' :
                            status === 'rejected' ? 'bg-red-500' :
                            'bg-gray-400'
                          }`}></div>
                          <span className="truncate">{market.name}</span>
                        </div>
                      </div>
                    )
                  })}
                  {marketsForDay.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{marketsForDay.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Market Legend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Application Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-foreground">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-foreground">Under Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-foreground">Rejected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-foreground">Not Applied</span>
          </div>
        </div>
      </Card>

      {/* Upcoming Markets */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Markets This Month</h3>
        <div className="space-y-3">
          {myMarkets.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">No markets scheduled</p>
              <Link to="/markets">
                <Button className="mt-4 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Browse Markets
                </Button>
              </Link>
            </div>
          ) : (
            myMarkets.slice(0, 5).map(market => {
              const status = getMarketApplicationStatus(market.id)
              return (
                <div key={market.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium text-foreground">{market.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {market.location.city}, {market.location.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {market.schedule[0]?.startTime} - {market.schedule[0]?.endTime}
                        </span>
                      </div>
                      <Badge 
                        variant={
                          status === 'approved' ? 'success' :
                          status === 'under-review' ? 'warning' :
                          status === 'rejected' ? 'destructive' : 'outline'
                        }
                        className="text-xs"
                      >
                        {status === 'under-review' ? 'Under Review' : 
                         status === 'rejected' ? 'Rejected' : 
                         status === 'approved' ? 'Approved' : 'Not Applied'}
                      </Badge>
                    </div>
                  </div>
                  <Link to={`/markets/${market.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}