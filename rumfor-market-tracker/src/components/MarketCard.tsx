import React from 'react'
import { Link } from 'react-router-dom'
import { Market } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import { Calendar, MapPin, MessageSquare } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { CommentList } from './CommentList'
import { MARKET_CATEGORY_LABELS, MARKET_CATEGORY_COLORS, MARKET_STATUS_COLORS } from '@/config/constants'
import { formatTime12Hour } from '@/utils/formatTime'
import { parseLocalDate } from '@/utils/formatDate'

interface MarketCardProps {
  market: Market
  className?: string
  onTrack?: (marketId: string) => void
  onUntrack?: (marketId: string) => void
  isTracked?: boolean
  isLoading?: boolean
  showTrackButton?: boolean
  variant?: 'default' | 'compact' | 'featured' | 'minimal'
  detailPath?: string // Custom path for market detail page
  trackingStatus?: 'interested' | 'applied' | 'booked' | 'completed' | 'cancelled' // Current tracking status
}



const marketTypeColors = {
  'vendor-created': 'bg-blue-100 text-blue-800 border-blue-200',
  'promoter-managed': 'bg-purple-100 text-purple-800 border-purple-200'
}

const marketTypeLabels = {
  'vendor-created': 'Community Market',
  'promoter-managed': 'Managed Market'
}

export const MarketCard: React.FC<MarketCardProps> = ({
  market,
  className,
  onTrack,
  onUntrack,
  isTracked = false,
  isLoading = false,
  showTrackButton = true,
  variant = 'default',
  detailPath,
  trackingStatus
}) => {
const [isCommentsModalOpen, setIsCommentsModalOpen] = React.useState(false)
  const handleTrackClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isTracked && onUntrack) {
      onUntrack(market.id)
    } else if (!isTracked && onTrack) {
      onTrack(market.id)
    }
  }

const formatSchedule = (schedule: Market['schedule'], dates?: any) => {
    // Handle new backend format: object with specialDates
    if (schedule && typeof schedule === 'object' && !Array.isArray(schedule)) {
      const schedObj = schedule as any

      // Check for specialDates (multi-date markets)
      if (schedObj.specialDates && Array.isArray(schedObj.specialDates) && schedObj.specialDates.length > 0) {
        const datesData = schedObj.specialDates.map((s: any) => {
          const dateObj = s.date ? new Date(s.date) : new Date()

          return {
            dayName: '',
            startDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            endDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            startTime: s.startTime || schedObj.startTime || '09:00',
            endTime: s.endTime || schedObj.endTime || '17:00',
            fullStartDate: s.date
          }
        }).filter((item: any) => item.startDate && item.startDate !== 'Invalid Date')
          .sort((a: any, b: any) => new Date(a.fullStartDate).getTime() - new Date(b.fullStartDate).getTime())

        if (datesData.length === 0) return { displayText: 'Schedule TBD', allDates: [], isMulti: false }

        if (datesData.length === 1) {
          return {
            displayText: `${datesData[0].startDate} ${formatTime12Hour(datesData[0].startTime)}-${formatTime12Hour(datesData[0].endTime)}`,
            allDates: datesData,
            isMulti: false
          }
        } else {
          const times = datesData[0].startTime === datesData[datesData.length - 1].startTime &&
                       datesData[0].endTime === datesData[datesData.length - 1].endTime

          const displayText = `${datesData[0].startDate} - ${datesData[datesData.length - 1].startDate} (Multi)`

          return {
            displayText: displayText,
            allDates: datesData,
            isMulti: true,
            times: times ? `${formatTime12Hour(datesData[0].startTime)}-${formatTime12Hour(datesData[0].endTime)}` : 'var. times'
          }
        }
      }

      // Recurring schedule (single day of week)
      if (schedObj.daysOfWeek && Array.isArray(schedObj.daysOfWeek) && schedObj.daysOfWeek.length > 0) {
        const dayMap: Record<string, number> = {
          'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
          'thursday': 4, 'friday': 5, 'saturday': 6
        }

        const firstDayNum = dayMap[schedObj.daysOfWeek[0].toLowerCase()] ?? 6
        const now = new Date()
        const nextDate = new Date(now)
        nextDate.setDate(now.getDate() + ((firstDayNum + 7 - now.getDay()) % 7 || 7))

        return {
          displayText: `${nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${formatTime12Hour(schedObj.startTime || '09:00')}-${formatTime12Hour(schedObj.endTime || '17:00')}`,
          allDates: [],
          isMulti: false
        }
      }
    }

    // First try to use schedule array (old frontend format)
    if (schedule && Array.isArray(schedule) && schedule.length > 0) {
      const datesData = schedule
        .filter((s: any) => s && s.startDate)
        .map((s: any) => {
          const dateObj = parseLocalDate(s.startDate)

          return {
            dayName: '',
            startDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            endDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            startTime: s.startTime || '09:00',
            endTime: s.endTime || '17:00',
            fullStartDate: s.startDate
          }
        })
        .filter((item: any) => item.startDate && item.startDate !== 'Invalid Date')
        .sort((a: any, b: any) => new Date(a.fullStartDate).getTime() - new Date(b.fullStartDate).getTime())

      if (datesData.length === 0) return { displayText: 'Schedule TBD', allDates: [], isMulti: false }

      if (datesData.length === 1) {
        return {
          displayText: `${datesData[0].startDate} ${formatTime12Hour(datesData[0].startTime)}-${formatTime12Hour(datesData[0].endTime)}`,
          allDates: datesData,
          isMulti: false
        }
      } else {
        const times = datesData[0].startTime === datesData[datesData.length - 1].startTime &&
                     datesData[0].endTime === datesData[datesData.length - 1].endTime

        const displayText = `${datesData[0].startDate} - ${datesData[datesData.length - 1].startDate} (Multi)`

        return {
          displayText: displayText,
          allDates: datesData,
          isMulti: true,
          times: times ? `${formatTime12Hour(datesData[0].startTime)}-${formatTime12Hour(datesData[0].endTime)}` : 'var. times'
        }
      }
    }

    // Fallback: try dates.events (old format)
    if (dates && dates.events && Array.isArray(dates.events) && dates.events.length > 0) {
      const eventsData = dates.events.map((event: any) => {
        const dateObj = parseLocalDate(event.startDate)
        return {
          startDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          startTime: event.time?.start || event.startTime || '09:00',
          endTime: event.time?.end || event.endTime || '17:00'
        }
      }).filter((item: any) => item.startDate && item.startDate !== 'Invalid Date')

      if (eventsData.length === 0) return { displayText: 'Schedule TBD', allDates: [], isMulti: false }

      if (eventsData.length === 1) {
        return {
          displayText: `${eventsData[0].startDate} ${formatTime12Hour(eventsData[0].startTime)}-${formatTime12Hour(eventsData[0].endTime)}`,
          allDates: eventsData,
          isMulti: false
        }
      } else {
        const times = eventsData[0].startTime === eventsData[eventsData.length - 1].startTime &&
                     eventsData[0].endTime === eventsData[eventsData.length - 1].endTime

        const displayText = `${eventsData[0].startDate} - ${eventsData[eventsData.length - 1].startDate} (Multi)`

        return {
          displayText: displayText,
          allDates: eventsData,
          isMulti: true,
          times: times ? `${formatTime12Hour(eventsData[0].startTime)}-${formatTime12Hour(eventsData[0].endTime)}` : 'var. times'
        }
      }
    }

    return { displayText: 'Schedule TBD', allDates: [], isMulti: false }
  }

  const formatLocation = (location: Market['location']) => {
    return `${location.city}, ${location.state}`
  }

  // Determine market type and application system
  const isPromoterManaged = market.marketType === 'promoter-managed'
  const hasApplicationSystem = isPromoterManaged && (market.applicationStatus === 'open' || market.applicationStatus === 'accepting-applications')

  // Determine button text and behavior based on state
  const getButtonConfig = () => {
    if (!isTracked) {
      if (hasApplicationSystem) {
        return { text: 'Apply to Market', action: 'track' }
      } else {
        return { text: 'Track Market', action: 'track' }
      }
    } else {
      if (trackingStatus === 'applied') {
        return { text: 'Application Pending', action: 'untrack' }
      } else if (trackingStatus === 'booked') {
        return { text: 'Approved', action: 'untrack' }
      } else if (trackingStatus === 'completed') {
        return { text: 'Completed', action: 'untrack' }
      } else if (trackingStatus === 'cancelled') {
        return { text: 'Track Market', action: 'track' }
      } else {
        return { text: 'Tracked', action: 'untrack' }
      }
    }
  }

  const buttonConfig = getButtonConfig()

  if (variant === 'compact') {
    return (
      <Link to={detailPath || `/markets/${market.id}`} className="block">
        <Card className={cn('overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer !rounded-none', className)}>
          {/* Image with overlaid details */}
          {market.images && market.images.length > 0 ? (
            <div className="relative h-48">
              <img
                src={market.images[0]}
                alt={market.name}
                className="w-full h-full object-cover"
              />
              {/* Overlay with buttons */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between p-3">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className={cn('text-xs px-2.5 py-1 bg-white/90', MARKET_CATEGORY_COLORS[market.category])}>
                    {MARKET_CATEGORY_LABELS[market.category]}
                  </Badge>
                </div>
                <Button
                  variant={isTracked ? "primary" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (isTracked && onUntrack) {
                      onUntrack(market.id)
                    } else if (!isTracked && onTrack) {
                      onTrack(market.id)
                    }
                  }}
                  disabled={isLoading}
                  className="text-xs font-medium px-4 py-1.5 min-w-[70px]"
                >
                  {isTracked ? 'Untrack' : 'Plan'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-48 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
          
          {/* Content below image */}
          <div className="p-4">
            <h3 className="font-semibold text-sm truncate">{market.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{formatLocation(market.location)}</p>
          </div>
        </Card>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link to={detailPath || `/markets/${market.id}`} className="block">
        <Card className={cn('overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer', className)}>
          {market.images && market.images.length > 0 && (
            <div className="relative h-48">
              <img
                src={market.images[0]}
                alt={market.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className={cn(MARKET_CATEGORY_COLORS[market.category])}>
                  Featured
                </Badge>
              </div>
              {market.images.length > 1 && (
                <div className="absolute bottom-4 right-4">
                  <Badge variant="muted">
                    +{market.images.length - 1} more
                  </Badge>
                </div>
              )}

              {/* Bottom right - Comments button */}
              <div className="absolute bottom-4 right-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsCommentsModalOpen(true)
                  }}
                  className="bg-white hover:bg-zinc-100 rounded-2xl shadow-lg relative py-2 px-3"
                >
                  {/* Chat bubble pointer */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-white rotate-45" />
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-5 h-5 text-zinc-800" />
                    <span className="text-sm font-bold text-zinc-800">
                      {market.stats?.commentCount || 0}
                    </span>
                  </div>
                </Button>
              </div>

              {/* Solid dark bar at bottom for title */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
                <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2">
                  {market.name}
                </h3>
              </div>
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold line-clamp-2">{market.name}</h3>
              <Badge variant="outline" className={cn('ml-2 flex-shrink-0 text-base font-medium px-4 py-1.5 min-w-[80px] text-center', MARKET_STATUS_COLORS[market.status])}>
                {market.status}
              </Badge>
            </div>
            
            <p className="text-muted-foreground mb-4 line-clamp-2">{market.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {formatLocation(market.location)}
              </div>
              
              <div className="flex items-center text-sm">
<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="relative group">
                  <span>{formatSchedule(market.schedule, market.dates).displayText}</span>
                  {formatSchedule(market.schedule, market.dates).isMulti && (
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 min-w-48">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">All Dates:</p>
                      {formatSchedule(market.schedule, market.dates).allDates.map((date: any, index: number) => (
                        <div key={index} className="text-sm py-1">
                          {date.dayName ? <span className="font-medium">{date.dayName}:</span> : null} {date.startDate} {formatTime12Hour(date.startTime)}-{formatTime12Hour(date.endTime)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className={cn(MARKET_CATEGORY_COLORS[market.category])}>
                  {MARKET_CATEGORY_LABELS[market.category]}
                </Badge>
                {market.accessibility.wheelchairAccessible && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    ♿ Wheelchair Accessible
                  </Badge>
                )}
                {market.accessibility.parkingAvailable && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    🅿️ Parking
                  </Badge>
                )}
              </div>
              
              {showTrackButton && (
                <Button
                  variant={buttonConfig.action === 'track' ? "outline" : "primary"}
                  size="sm"
                  onClick={handleTrackClick}
                  disabled={isLoading || buttonConfig.text.includes('Pending') || buttonConfig.text.includes('Approved') || buttonConfig.text.includes('Completed')}
                  className="ml-4"
                >
                  {buttonConfig.text}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  // Minimal modern variant - SIMPLE REDESIGN
  if (variant === 'minimal') {
    const getScheduleDates = (schedule: Market['schedule']): string[] => {
      if (!schedule) return []

      // Handle backend format with specialDates
      if (typeof schedule === 'object' && !Array.isArray(schedule)) {
        const schedObj = schedule as any
        if (schedObj.specialDates && Array.isArray(schedObj.specialDates) && schedObj.specialDates.length > 0) {
          return schedObj.specialDates.map((s: any) => {
            const d = new Date(s.date)
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          })
        }
      }

      // Handle array format
      if (!Array.isArray(schedule) || schedule.length === 0) return []

      return schedule
        .map((s: any) => {
          if (!s || !s.startDate) return null
          const dateObj = parseLocalDate(s.startDate)
          if (isNaN(dateObj.getTime())) return null
          return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        })
        .filter(Boolean) as string[]
    }

    const scheduleDates = getScheduleDates(market.schedule)

    return (
      <div className={cn(
        'cursor-pointer',
        'overflow-hidden !rounded-none',
        className
      )}>
        <Link to={detailPath || `/markets/${market.id}`} className="block group">
          {/* Image with overlaid details */}
          {market.images && market.images.length > 0 && (
            <div className="relative h-80">
              <img
                src={market.images[0]}
                alt={market.name}
                className="w-full h-full object-cover"
              />

              {/* Top overlays */}
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                {/* Left side - Location and Dates stacked */}
                <div className="flex flex-col gap-1">
                  {/* Location */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[#ffffff] shadow text-zinc-900">
                    <MapPin className="w-4 h-4" />
                    <span>{formatLocation(market.location)}</span>
                  </div>
                  {/* Dates - stacked */}
                  {scheduleDates.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {scheduleDates.map((date, index) => (
                        <div key={index} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#ffffff] shadow text-zinc-900 w-fit">
                          <Calendar className="w-4 h-4" />
                          <span>{date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right side - Category */}
                <div className="px-3 py-1.5 rounded-full text-sm font-medium bg-[#ffffff] shadow text-zinc-900">
                  {MARKET_CATEGORY_LABELS[market.category]}
                </div>
              </div>

              {/* Footer - two rows: top row (info text + comments button), bottom row (title + description) */}
              <div className="absolute bottom-0 left-0 right-0">
                {/* Top row - Info text (left) + Comments button (right) */}
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-white/80">Tap for details</span>
                  <div
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsCommentsModalOpen(true)
                    }}
                    className="cursor-pointer flex items-center justify-center bg-white hover:bg-zinc-100 rounded-2xl shadow-lg transition-colors relative py-2 px-3 mr-1"
                  >
                    {/* Chat bubble pointer */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-white rotate-45" />
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-5 h-5 text-zinc-800" />
                      <span className="text-sm font-bold text-zinc-800">
                        {market.stats?.commentCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Bottom row - Title + description */}
                <div className="relative bg-gradient-to-r from-white via-white to-transparent shadow shadow-black/10 px-4 py-3">
                  <h3 className="text-zinc-900 font-bold text-2xl leading-tight line-clamp-2">
                    {market.name}
                  </h3>
                  <p className="text-zinc-600 text-sm leading-relaxed line-clamp-2">
                    {market.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Link>

        {/* Comments Modal - Fullscreen on mobile, normal modal on desktop */}
        <Modal
          isOpen={isCommentsModalOpen}
          onClose={() => setIsCommentsModalOpen(false)}
          title={market.name}
          size="xl"
          className="sm:!max-w-xl sm:!h-auto sm:!max-h-[90vh] sm:!w-auto sm:!rounded-lg sm:!border sm:!shadow-lg sm:!bg-surface sm:!p-4 !absolute !inset-0 !w-full !h-full !max-w-none !max-h-none !rounded-none !border-none !shadow-none !bg-background !p-0 [&>div>h2]:!text-base [&>div>h2]:!font-semibold [&>div>h2]:!mb-1 [&>div]:!pb-2 [&>div]:!border-b [&>div]:!border-zinc-200 [&>div>button]:!bg-zinc-100 [&>div>button]:!text-zinc-500 [&>div>button]:!hover:bg-zinc-200 [&>div>button]:!hover:text-zinc-900 [&>div>button]:!rounded-full [&>div>button]:!p-2"
        >
          <CommentList marketId={market.id} />
        </Modal>
      </div>
    )
  }

  // Default variant
  return (
    <Link to={detailPath || `/markets/${market.id}`} className="block">
      <Card className={cn('overflow-hidden transition-all duration-300 cursor-pointer !rounded-none', className)}>
        {market.images && market.images.length > 0 && (
          <div className="relative h-80">
            <img
              src={market.images[0]}
              alt={market.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <Badge variant="outline" className={cn(MARKET_CATEGORY_COLORS[market.category])}>
                {MARKET_CATEGORY_LABELS[market.category]}
              </Badge>
            </div>
            {market.images.length > 1 && (
              <div className="absolute bottom-3 right-3">
                <Badge variant="muted" className="bg-black/50 text-white">
                  +{market.images.length - 1}
                </Badge>
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-2xl line-clamp-2 flex-1">{market.name}</h3>
            <div className="flex flex-col sm:flex-row gap-1 ml-2 flex-shrink-0">
              <Badge variant="outline" className={cn('text-xs', marketTypeColors[market.marketType])}>
                {marketTypeLabels[market.marketType]}
              </Badge>
              <Badge variant="outline" className={cn('text-base font-medium px-4 py-1.5 min-w-[80px] text-center', MARKET_STATUS_COLORS[market.status])}>
                {market.status}
              </Badge>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{market.description}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {formatLocation(market.location)}
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
                <div className="relative group">
                  <span>{formatSchedule(market.schedule, market.dates).displayText}</span>
                  {formatSchedule(market.schedule, market.dates).isMulti && (
                    <div className="mt-1 md:hidden">
                      {formatSchedule(market.schedule, market.dates).allDates.slice(1).map((date: any, index: number) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          {date.startDate}
                        </div>
                      ))}
                    </div>
                  )}
                  {formatSchedule(market.schedule, market.dates).isMulti && (
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 min-w-48">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">All Dates:</p>
                      {formatSchedule(market.schedule, market.dates).allDates.map((date: any, index: number) => (
                        <div key={index} className="text-sm py-1">
                          {date.dayName && <span className="font-medium">{date.dayName}:</span>} {date.startDate} {formatTime12Hour(date.startTime)}-{formatTime12Hour(date.endTime)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {market.accessibility.wheelchairAccessible && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  ♿
                </Badge>
              )}
              {market.accessibility.parkingAvailable && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  🅿️
                </Badge>
              )}
              {market.accessibility.familyFriendly && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  👨‍👩‍👧‍👦
                </Badge>
              )}
            </div>
            
            {showTrackButton && (
              <Button
                variant={buttonConfig.action === 'track' ? "outline" : "primary"}
                size="sm"
                onClick={handleTrackClick}
                disabled={isLoading || buttonConfig.text.includes('Pending') || buttonConfig.text.includes('Approved') || buttonConfig.text.includes('Completed')}
                className="ml-2"
              >
                {buttonConfig.text}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}