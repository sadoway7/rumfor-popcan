import React from 'react'
import { Link } from 'react-router-dom'
import { Market } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import { Calendar, MapPin } from 'lucide-react'
import { ChatNotificationIcon } from '@/components/ui/ChatNotificationIcon'
import { TrackButton } from '@/components/TrackButton'
import { MARKET_CATEGORY_LABELS, MARKET_CATEGORY_COLORS, MARKET_STATUS_COLORS } from '@/config/constants'
import { formatTime12Hour } from '@/utils/formatTime'
import { parseLocalDate } from '@/utils/formatDate'
import { useCommentsModalStore } from '@/features/comments/commentsModalStore'

interface MarketCardProps {
  market: Market
  className?: string
  onTrack?: (marketId: string) => void
  onUntrack?: (marketId: string) => void
  isTracked?: boolean
  isLoading?: boolean
  showTrackButton?: boolean
  variant?: 'default' | 'compact' | 'featured' | 'minimal' | 'profile'
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

// Category flag colors tied to category themes
const categoryFlagColors: Record<string, string> = {
  'farmers-market': 'bg-white/60 text-green-700',
  'arts-crafts': 'bg-white/60 text-purple-700',
  'flea-market': 'bg-white/60 text-amber-700',
  'food-festival': 'bg-white/60 text-orange-700',
  'vintage-antique': 'bg-white/60 text-stone-700',
  'craft-show': 'bg-white/60 text-blue-700',
  'night-market': 'bg-white/60 text-indigo-700',
  'street-fair': 'bg-white/60 text-pink-700',
  'holiday-market': 'bg-white/60 text-red-700',
  'community-event': 'bg-white/60 text-teal-700'
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
  const [dominantColor, setDominantColor] = React.useState<string>('')
  const [, setIsLightBackground] = React.useState(false)
  const [isTrackedOptimistic, setIsTrackedOptimistic] = React.useState(isTracked)
  const { openComments } = useCommentsModalStore()

  // Extract dominant color from market image
  React.useEffect(() => {
    if (variant === 'minimal' && market.images && market.images.length > 0) {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = market.images[0]
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        canvas.width = 100
        canvas.height = 100
        ctx.drawImage(img, 0, 0, 100, 100)
        
        // Sample center-bottom area for dominant color (where market activity is)
        const imageData = ctx.getImageData(20, 60, 60, 30)
        const data = imageData.data
        
        // Find the most vibrant/saturated color
        let maxSaturation = 0
        let vibrantR = 128, vibrantG = 128, vibrantB = 128
        
        for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          
          // Calculate saturation
          const max = Math.max(r, g, b)
          const min = Math.min(r, g, b)
          const saturation = max === 0 ? 0 : (max - min) / max
          
          // Also consider brightness - avoid too dark or too light
          const brightness = (r + g + b) / 3
          
          if (saturation > maxSaturation && brightness > 40 && brightness < 220) {
            maxSaturation = saturation
            vibrantR = r
            vibrantG = g
            vibrantB = b
          }
        }
        
        // If no vibrant color found, fall back to average
        if (maxSaturation < 0.1) {
          let totalR = 0, totalG = 0, totalB = 0
          for (let i = 0; i < data.length; i += 4) {
            totalR += data[i]
            totalG += data[i + 1]
            totalB += data[i + 2]
          }
          const pixelCount = data.length / 4
          vibrantR = Math.round(totalR / pixelCount)
          vibrantG = Math.round(totalG / pixelCount)
          vibrantB = Math.round(totalB / pixelCount)
        }
        
        // Enhance saturation and darken for overlay
        const enhanceFactor = 1.2
        vibrantR = Math.min(255, Math.round(vibrantR * enhanceFactor))
        vibrantG = Math.min(255, Math.round(vibrantG * enhanceFactor))
        vibrantB = Math.min(255, Math.round(vibrantB * enhanceFactor))
        
        // Darken more for better contrast and less washout
        const darkenFactor = 0.5
        vibrantR = Math.round(vibrantR * (1 - darkenFactor))
        vibrantG = Math.round(vibrantG * (1 - darkenFactor))
        vibrantB = Math.round(vibrantB * (1 - darkenFactor))
        
        setDominantColor(`rgb(${vibrantR}, ${vibrantG}, ${vibrantB})`)
        
        // Determine if background is light or dark
        const brightness = (vibrantR * 299 + vibrantG * 587 + vibrantB * 114) / 1000
        setIsLightBackground(brightness > 128)
      }
    }
  }, [variant, market.images])
  const handleTrackClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsTrackedOptimistic(!isTrackedOptimistic)
    
    if (isTrackedOptimistic && onUntrack) {
      onUntrack(market.id)
    } else if (!isTrackedOptimistic && onTrack) {
      onTrack(market.id)
    }
  }

  React.useEffect(() => {
    setIsTrackedOptimistic(isTracked)
  }, [isTracked])

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
        <Card className={cn('overflow-hidden hover:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_8px_30px_rgba(0,0,0,0.25)] transition-all duration-300 cursor-pointer !rounded-none', className)}>
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
        <Card className={cn('overflow-hidden hover:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_8px_30px_rgba(0,0,0,0.25)] hover:scale-[1.02] transition-all duration-300 cursor-pointer', className)}>
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

              {/* Bottom right - Follow and Comments buttons */}
              {/*
              <div className="absolute bottom-6 right-2 flex flex-col items-end gap-1 z-50">
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // Handle follow click - could open follow modal or toggle follow
                  }}
                >
                  <FollowCountIcon count={market.stats?.vendorFollowCount || 0} />
                </div>
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openComments(market.id, market.name)
                  }}
                >
                  <ChatNotificationIcon count={market.stats?.commentCount || 0} />
                </div>
              </div>
              */}
              
              {/* Bottom right - Comments button */}
              <div 
                className="absolute bottom-6 right-2 cursor-pointer z-50"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  openComments(market.id, market.name)
                }}
              >
                <ChatNotificationIcon count={market.stats?.commentCount || 0} />
              </div>

              {/* Solid dark bar at bottom for title */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
                <h3 className="text-white font-quicksand font-bold text-lg leading-tight line-clamp-2">
                  {market.name}
                </h3>
              </div>
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-quicksand font-bold line-clamp-2">{market.name}</h3>
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
        'shadow-[0_1px_3px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04),0_-1px_3px_rgba(0,0,0,0.06),0_-2px_6px_rgba(0,0,0,0.03)]',
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
              <div className="absolute top-10 left-4 right-4 flex items-start justify-between">
                {/* Left side - Dates stacked */}
                <div className="flex flex-col gap-1">
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
              </div>

              {/* Location - Flag style at left edge */}
              <div className="absolute top-0 -left-2 pl-5 pr-5 py-1.5 bg-white text-zinc-900 font-medium text-sm flex items-center gap-1.5" style={{ clipPath: 'polygon(0% 0%, 100% 0%, calc(100% - 15px) 100%, 0% 100%)' }}>
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{formatLocation(market.location)}</span>
              </div>

              {/* Category - Flag style at right edge */}
              <div className={`absolute top-0 -right-2 pl-5 pr-4 py-1.5 ${categoryFlagColors[market.category] || 'bg-white'} text-zinc-900 font-medium text-sm`} style={{ clipPath: 'polygon(15px 0%, 100% 0%, 100% 100%, 0% 100%)' }}>{MARKET_CATEGORY_LABELS[market.category]}</div>

              {/* Footer - two rows: top row (info text + comments button), bottom row (title + description) */}
              <div className="absolute bottom-0 left-0 right-0">
                  {/* Top row - Info text (left) + Icons (right) */}
                  {/*
                  <div className="flex items-center justify-between px-3 py-2 relative">
                    <span className="text-xs text-white/80">Tap for details</span>
                    <div className="flex flex-col items-end gap-1 z-50">
                      <div
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          // Handle follow click
                        }}
                      >
                        <FollowCountIcon count={market.stats?.vendorFollowCount || 0} />
                      </div>
                      <div
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          openComments(market.id, market.name)
                        }}
                        className="cursor-pointer"
                      >
                        <ChatNotificationIcon count={market.stats?.commentCount || 0} />
                      </div>
                    </div>
                  </div>
                  */}
                  
                   {/* Top row - Info text (left) + Stacked buttons (right, anchored bottom, grows up) */}
                  <div className="flex items-center justify-between px-3 py-2 relative">
                    <span className="text-xs text-white/80">Tap for details</span>
                    <div className="absolute bottom-4 right-2 z-50 flex flex-col items-end">
                      {/* Comments Button */}
                      <div
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          openComments(market.id, market.name)
                        }}
                        className="cursor-pointer mb-2"
                      >
                        <ChatNotificationIcon count={market.stats?.commentCount || 0} />
                      </div>
                      {/* Track Button */}
                      <TrackButton
                        isTracked={isTrackedOptimistic}
                        onClick={handleTrackClick}
                        disabled={isLoading}
                        className="mr-1 mt-1"
                        size="sm"
                      />
                    </div>
                  </div>
                   {/* Bottom row - Title + description with dark gradient and color accent */}
                   <div className="relative">
                      {/* Color accent layer */}
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: dominantColor 
                             ? `linear-gradient(to top, ${dominantColor.replace('rgb', 'rgba').replace(')', ', 0.9)')} 0%, ${dominantColor.replace('rgb', 'rgba').replace(')', ', 0.7)')} 30%, ${dominantColor.replace('rgb', 'rgba').replace(')', ', 0.4)')} 60%, ${dominantColor.replace('rgb', 'rgba').replace(')', ', 0.15)')} 85%, transparent 100%)`
                             : 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.15) 85%, transparent 100%)'
                        }}
                      />
                      {/* Dark overlay for readability */}
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0.08) 90%, transparent 100%)'
                        }}
                      />
                       {/* Content */}
                      <div className="relative px-4 pt-4 pb-6 z-10">
                        <h3 className="text-white font-quicksand font-bold text-2xl leading-tight line-clamp-2 drop-shadow-lg" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)' }}>
                          {market.name}
                        </h3>
                        <p className="text-white/90 text-base font-medium leading-relaxed line-clamp-2 mt-2 drop-shadow-md" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                          {market.description}
                        </p>
                      </div>
                   </div>
              </div>
            </div>
           )}
         </Link>
      </div>
    )
  }

  // Profile variant - Similar to minimal but without comments/track buttons
  if (variant === 'profile') {
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
        'shadow-[0_1px_3px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04),0_-1px_3px_rgba(0,0,0,0.06),0_-2px_6px_rgba(0,0,0,0.03)]',
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
              <div className="absolute top-10 left-4 right-4 flex items-start justify-between">
                {/* Left side - Dates stacked */}
                <div className="flex flex-col gap-1">
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
              </div>

              {/* Location - Flag style at left edge */}
              <div className="absolute top-0 -left-2 pl-5 pr-5 py-1.5 bg-white text-zinc-900 font-medium text-sm flex items-center gap-1.5" style={{ clipPath: 'polygon(0% 0%, 100% 0%, calc(100% - 15px) 100%, 0% 100%)' }}>
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{formatLocation(market.location)}</span>
              </div>

              {/* Footer - without comments/track buttons */}
              <div className="absolute bottom-0 left-0 right-0">
                <div className="relative">
                  {/* Color accent layer */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: dominantColor 
                         ? `linear-gradient(to top, ${dominantColor.replace('rgb', 'rgba').replace(')', ', 0.9)')} 0%, ${dominantColor.replace('rgb', 'rgba').replace(')', ', 0.7)')} 30%, ${dominantColor.replace('rgb', 'rgba').replace(')', ', 0.4)')} 60%, ${dominantColor.replace('rgb', 'rgba').replace(')', ', 0.15)')} 85%, transparent 100%)`
                         : 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.15) 85%, transparent 100%)'
                    }}
                  />
                  {/* Dark overlay for readability */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0.08) 90%, transparent 100%)'
                    }}
                  />
                  {/* Content */}
                  <div className="relative px-4 pt-4 pb-6 z-10">
                    <h3 className="text-white font-quicksand font-bold text-2xl leading-tight line-clamp-2 drop-shadow-lg" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)' }}>
                      {market.name}
                    </h3>
                    <p className="text-white/90 text-base font-medium leading-relaxed line-clamp-2 mt-2 drop-shadow-md" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                      {market.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Link>
      </div>
    )
  }

  // Default variant
  return (
    <Link to={detailPath || `/markets/${market.id}`} className="block">
      <Card className={cn('overflow-hidden transition-all duration-300 cursor-pointer !rounded-none shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_20px_rgba(0,0,0,0.2)]', className)}>
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