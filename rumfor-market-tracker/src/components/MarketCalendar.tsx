import React, { useState, useMemo } from 'react'
import Calendar from 'react-calendar'
import { format, parseISO, isSameDay } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Market } from '@/types'
import { cn } from '@/utils/cn'
import { Calendar as CalendarIcon, MapPin, Clock, Users } from 'lucide-react'
import 'react-calendar/dist/Calendar.css'

interface MarketCalendarProps {
  markets: Market[]
  onMarketSelect?: (market: Market) => void
  onDateSelect?: (date: Date) => void
  className?: string
}

interface CalendarEvent {
  date: Date
  markets: Market[]
  type: 'market-day' | 'event-start' | 'event-end'
}

export const MarketCalendar: React.FC<MarketCalendarProps> = ({
  markets,
  onMarketSelect,
  onDateSelect,
  className
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  // Generate calendar events from market schedules
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = []

    markets.forEach(market => {
      if (market.schedule && market.schedule.length > 0) {
        market.schedule.forEach(schedule => {
          const startDate = parseISO(schedule.startDate)
          const endDate = parseISO(schedule.endDate)
          
          // Add event start
          events.push({
            date: startDate,
            markets: [market],
            type: 'event-start'
          })
          
          // Add event end
          if (!isSameDay(startDate, endDate)) {
            events.push({
              date: endDate,
              markets: [market],
              type: 'event-end'
            })
          }

          // Add recurring schedule dates
          if (schedule.isRecurring) {
            let currentDate = new Date(startDate)
            while (currentDate <= endDate) {
              const dayOfWeek = currentDate.getDay()
              if (dayOfWeek === schedule.dayOfWeek) {
                events.push({
                  date: new Date(currentDate),
                  markets: [market],
                  type: 'market-day'
                })
              }
              currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        })
      }
    })

    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [markets])

  // Get markets for a specific date
  const getMarketsForDate = (date: Date): Market[] => {
    return calendarEvents
      .filter(event => isSameDay(event.date, date))
      .flatMap(event => event.markets)
  }

  // Custom tile content for calendar
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayMarkets = getMarketsForDate(date)
      if (dayMarkets.length === 0) return null

      return (
        <div className="flex flex-col gap-1 mt-1">
          {dayMarkets.slice(0, 2).map((market) => (
            <div
              key={market.id}
              className={cn(
                "text-xs px-1 py-0.5 rounded truncate",
                market.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              )}
              title={market.name}
            >
              {market.name}
            </div>
          ))}
          {dayMarkets.length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{dayMarkets.length - 2} more
            </div>
          )}
        </div>
      )
    }
    return null
  }

  // Handle date selection
  const handleDateChange = (value: any) => {
    if (!value) return
    
    const selectedDate = Array.isArray(value) ? value[0] : value
    setSelectedDate(selectedDate)
    onDateSelect?.(selectedDate)
  }

  // Handle market selection
  const handleMarketSelect = (market: Market) => {
    onMarketSelect?.(market)
  }

  const selectedDateMarkets = getMarketsForDate(selectedDate)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with view mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6" />
          <h2 className="text-xl font-semibold">Market Calendar</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'month' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button
            variant={viewMode === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileContent={tileContent}
              className="w-full border-none"
              prev2Label={null}
              next2Label={null}
              showNeighboringMonth={false}
            />
          </Card>
        </div>

        {/* Selected date details */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            
            {selectedDateMarkets.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {selectedDateMarkets.length} market(s) scheduled
                </p>
                {selectedDateMarkets.map(market => (
                  <div
                    key={market.id}
                    className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleMarketSelect(market)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{market.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground truncate">
                            {market.location.city}, {market.location.state}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {market.schedule?.[0]?.startTime} - {market.schedule?.[0]?.endTime}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={market.status === 'active' ? 'success' : 'muted'}
                        className="ml-2"
                      >
                        {market.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No markets scheduled for this date.
              </p>
            )}
          </Card>

          {/* Legend */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                <span>Active Markets</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                <span>Upcoming Events</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3" />
                <span>Click markets for details</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}