import React from 'react'
import { Link } from 'react-router-dom'
import { Market } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

interface MarketCardProps {
  market: Market
  className?: string
  onTrack?: (marketId: string) => void
  onUntrack?: (marketId: string) => void
  isTracked?: boolean
  isLoading?: boolean
  showTrackButton?: boolean
  variant?: 'default' | 'compact' | 'featured'
}

const categoryLabels = {
  'farmers-market': 'Farmers Market',
  'arts-crafts': 'Arts & Crafts',
  'flea-market': 'Flea Market',
  'food-festival': 'Food Festival',
  'holiday-market': 'Holiday Market',
  'craft-show': 'Craft Show',
  'community-event': 'Community Event'
}

const categoryColors = {
  'farmers-market': 'bg-green-100 text-green-800 border-green-200',
  'arts-crafts': 'bg-purple-100 text-purple-800 border-purple-200',
  'flea-market': 'bg-blue-100 text-blue-800 border-blue-200',
  'food-festival': 'bg-orange-100 text-orange-800 border-orange-200',
  'holiday-market': 'bg-red-100 text-red-800 border-red-200',
  'craft-show': 'bg-pink-100 text-pink-800 border-pink-200',
  'community-event': 'bg-gray-100 text-gray-800 border-gray-200'
}

const statusColors = {
  'active': 'bg-success/10 text-success border-success/20',
  'draft': 'bg-warning/10 text-warning border-warning/20',
  'cancelled': 'bg-destructive/10 text-destructive border-destructive/20',
  'completed': 'bg-muted text-muted-foreground border-muted'
}

export const MarketCard: React.FC<MarketCardProps> = ({
  market,
  className,
  onTrack,
  onUntrack,
  isTracked = false,
  isLoading = false,
  showTrackButton = true,
  variant = 'default'
}) => {
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
    if (!schedule || schedule.length === 0) return 'Schedule TBD'
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const days = schedule
      .map(s => dayNames[s.dayOfWeek])
      .filter((day, index, arr) => arr.indexOf(day) === index) // Remove duplicates
      .join(', ')
    
    const time = schedule[0]
    return `${days} ${time.startTime}-${time.endTime}`
  }

  const formatLocation = (location: Market['location']) => {
    return `${location.city}, ${location.state}`
  }

  if (variant === 'compact') {
    return (
      <Link to={`/markets/${market.id}`} className="block">
        <Card className={cn('p-4 hover:shadow-md transition-shadow cursor-pointer', className)}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{market.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{formatLocation(market.location)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={cn('text-xs px-2 py-1', categoryColors[market.category])}>
                  {categoryLabels[market.category]}
                </Badge>
                <Badge variant="outline" className={cn('text-xs px-2 py-1', statusColors[market.status])}>
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
      <Link to={`/markets/${market.id}`} className="block">
        <Card className={cn('overflow-hidden hover:shadow-lg transition-shadow cursor-pointer', className)}>
          {market.images && market.images.length > 0 && (
            <div className="relative h-48">
              <img
                src={market.images[0]}
                alt={market.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className={cn(categoryColors[market.category])}>
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
              <Badge variant="outline" className={cn('ml-2 flex-shrink-0', statusColors[market.status])}>
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
                <Badge variant="outline" className={cn(categoryColors[market.category])}>
                  {categoryLabels[market.category]}
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
                  variant={isTracked ? "primary" : "outline"}
                  size="sm"
                  onClick={handleTrackClick}
                  disabled={isLoading}
                  className="ml-4"
                >
                  {isTracked ? '✓ Tracked' : 'Track Market'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  // Default variant
  return (
    <Link to={`/markets/${market.id}`} className="block">
      <Card className={cn('overflow-hidden hover:shadow-md transition-shadow cursor-pointer', className)}>
        {market.images && market.images.length > 0 && (
          <div className="relative h-40">
            <img
              src={market.images[0]}
              alt={market.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <Badge variant="outline" className={cn(categoryColors[market.category])}>
                {categoryLabels[market.category]}
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
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-2 flex-1">{market.name}</h3>
            <Badge variant="outline" className={cn('ml-2 flex-shrink-0', statusColors[market.status])}>
              {market.status}
            </Badge>
          </div>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{market.description}</p>
          
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
                variant={isTracked ? "primary" : "outline"}
                size="sm"
                onClick={handleTrackClick}
                disabled={isLoading}
                className="ml-2"
              >
                {isTracked ? '✓' : '+'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
