import React from 'react'
import { Link } from 'react-router-dom'
import { Market } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import { Calendar, MapPin, Clock, MessageSquare } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { CommentList } from './CommentList'
import { MARKET_CATEGORY_LABELS, MARKET_CATEGORY_COLORS, MARKET_STATUS_COLORS } from '@/config/constants'

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

  const formatSchedule = (schedule: Market['schedule']) => {
    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) return 'Schedule TBD'

    // Get unique days and their dates
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dates = schedule
      .filter(s => s && s.startDate && s.dayOfWeek !== undefined) // Filter out invalid schedule items
      .map(s => {
        const startDate = new Date(s.startDate)
        const endDate = new Date(s.endDate)

        return {
          dayName: dayNames[s.dayOfWeek] || 'Unknown',
          startDate: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          endDate: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          startTime: s.startTime,
          endTime: s.endTime
        }
      })
      .filter((item, index, arr) =>
        arr.findIndex(t => t.dayName === item.dayName) === index // Remove duplicates
      )
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    if (dates.length === 0) return 'Schedule TBD'

    if (dates.length === 1) {
      return `${dates[0].startDate} ${dates[0].startTime}-${dates[0].endTime}`
    } else {
      const times = dates[0].startTime === dates[dates.length - 1].startTime &&
                   dates[0].endTime === dates[dates.length - 1].endTime
      const dateList = dates.map(d => d.startDate).join(', ')
      return times ? `${dateList} ${dates[0].startTime}-${dates[0].endTime}` : `${dateList} (var. times)`
    }
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
        return { text: '✓ Approved', action: 'untrack' }
      } else if (trackingStatus === 'completed') {
        return { text: '✓ Completed', action: 'untrack' }
      } else if (trackingStatus === 'cancelled') {
        return { text: 'Track Market', action: 'track' }
      } else {
        return { text: '✓ Tracked', action: 'untrack' }
      }
    }
  }

  const buttonConfig = getButtonConfig()

  if (variant === 'compact') {
    return (
      <Link to={detailPath || `/markets/${market.id}`} className="block">
        <Card className={cn('p-4 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer !rounded-none', className)}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{market.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{formatLocation(market.location)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={cn('text-xs px-2 py-1', MARKET_CATEGORY_COLORS[market.category])}>
                  {MARKET_CATEGORY_LABELS[market.category]}
                </Badge>
                <Badge variant="outline" className={cn('text-xs px-2 py-1', MARKET_STATUS_COLORS[market.status])}>
                  {market.status}
                </Badge>
              </div>
            </div>
            
            {market.images && market.images.length > 0 && (
              <div className="ml-3 flex-shrink-0">
                <img
                  src={market.images[0]}
                  alt={market.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </div>
            )}
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
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold line-clamp-2">{market.name}</h3>
              <Badge variant="outline" className={cn('ml-2 flex-shrink-0', MARKET_STATUS_COLORS[market.status])}>
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
                {formatSchedule(market.schedule)}
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
    const formatScheduleDate = (schedule: Market['schedule']) => {
      if (!schedule || !Array.isArray(schedule) || schedule.length === 0) return null

      const firstSchedule = schedule[0]
      if (!firstSchedule || !firstSchedule.startDate) return null

      const startDate = new Date(firstSchedule.startDate)

      return startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }

    return (
      <div className={cn(
        'cursor-pointer',
        'overflow-hidden !rounded-none',
        className
      )}>
        <Link to={detailPath || `/markets/${market.id}`} className="block group">
          {/* Image with overlaid details */}
          {market.images && market.images.length > 0 && (
            <div className="relative h-96">
              <img
                src={market.images[0]}
                alt={market.name}
                className="w-full h-full object-cover"
              />

              {/* Top overlays */}
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                <div className="space-y-2">
                  {/* Category badge */}
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-xs font-medium">
                    {MARKET_CATEGORY_LABELS[market.category]}
                  </div>
                  {/* Location */}
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
                    <MapPin className="w-3 h-3" />
                    <span>{formatLocation(market.location)}</span>
                  </div>
                </div>
                {/* Date */}
                {formatScheduleDate(market.schedule) && (
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{formatScheduleDate(market.schedule)}</span>
                  </div>
                )}
              </div>

              {/* Solid dark bar at bottom for title */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
                <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2">
                  {market.name}
                </h3>
              </div>
            </div>
          )}

          {/* Description under image */}
          <div className="p-4 space-y-2">
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {market.description}
            </p>

            {/* Simple details row */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <Clock className="w-3 h-3" />
                <span>{formatSchedule(market.schedule)}</span>
              </div>

              {/* Right side buttons */}
              <div className="flex items-center gap-2">
                {/* Comments button - Mobile only */}
                <Button
                  variant="ghost"
                  size="md"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsCommentsModalOpen(true)
                  }}
                  className="text-sm text-muted-foreground hover:text-accent px-4 py-2 md:hidden"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comments
                </Button>

                {/* Simple follow button inside Link */}
                {showTrackButton && (
                  <Button
                    variant="ghost"
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
                    disabled={isLoading || buttonConfig.text.includes('Pending') || buttonConfig.text.includes('Approved') || buttonConfig.text.includes('Completed')}
                    className="text-xs font-medium text-accent hover:text-accent/80 px-3 py-1.5"
                  >
                    {buttonConfig.text === 'Track Market' ? 'Follow' : buttonConfig.text === 'Apply to Market' ? 'Apply' : buttonConfig.text}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Link>



        {/* Comments Modal - Fullscreen on mobile, normal modal on desktop */}
        <Modal
          isOpen={isCommentsModalOpen}
          onClose={() => setIsCommentsModalOpen(false)}
          title={`Comments for ${market.name}`}
          size="xl"
          className="sm:!max-w-xl sm:!h-auto sm:!max-h-[90vh] sm:!w-auto sm:!rounded-lg sm:!border sm:!shadow-lg sm:!bg-surface sm:!p-6 !absolute !inset-0 !w-full !h-full !max-w-none !max-h-none !rounded-none !border-none !shadow-none !bg-background !p-0"
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
              <Badge variant="outline" className={cn('text-xs', MARKET_STATUS_COLORS[market.status])}>
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
              {formatSchedule(market.schedule)}
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
