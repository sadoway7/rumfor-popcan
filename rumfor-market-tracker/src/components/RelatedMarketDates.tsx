import React from 'react'
import { Link } from 'react-router-dom'
import { Market } from '@/types'
import { cn } from '@/utils/cn'
import { Calendar } from 'lucide-react'

interface RelatedMarketDatesProps {
  market: Market
  className?: string
  variant?: 'compact' | 'tabs'
}

/**
 * Component for displaying related market dates when a market has been split
 * 
 * - 'compact' variant: Small badges for use in cards
 * - 'tabs' variant: Prominent tabs for use in detail pages
 */
export const RelatedMarketDates: React.FC<RelatedMarketDatesProps> = ({
  market,
  className,
  variant = 'compact'
}) => {
  const splitTag = market.tags?.find(tag => tag.startsWith('split-market:'))
  
  if (!splitTag) {
    return null
  }
  
  // Extract all related market IDs from the tag
  const allMarketIds = splitTag.replace('split-market:', '').split(',')
  const currentMarketId = market.id
  
  // Find the index of current market in the list
  const currentIndex = allMarketIds.indexOf(currentMarketId)
  
  // Get the date for this market from its schedule
  const getMarketDate = (schedule: Market['schedule']): string => {
    if (!schedule) return ''
    
    if (typeof schedule === 'object' && !Array.isArray(schedule)) {
      const schedObj = schedule as any
      if (schedObj.specialDates && Array.isArray(schedObj.specialDates) && schedObj.specialDates.length > 0) {
        const d = new Date(schedObj.specialDates[0].date)
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
    }
    return ''
  }
  
  const thisDate = getMarketDate(market.schedule)
  
  // Tab variant - for detail pages
  if (variant === 'tabs') {
    return (
      <div className={cn("", className)}>
        {/* Banner */}
        <div className="px-3 py-2 bg-blue-500 text-white text-sm font-bold rounded-lg mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Different Vendors Each Day
        </div>
        
        {/* Date tabs */}
        <div className="flex flex-wrap gap-2">
          {allMarketIds.map((marketId, index) => {
            const isCurrentMarket = marketId === currentMarketId
            
            return (
              <Link
                key={marketId}
                to={isCurrentMarket ? '#' : `/markets/${marketId}`}
                onClick={(e) => {
                  if (isCurrentMarket) e.preventDefault()
                }}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                  isCurrentMarket 
                    ? "bg-blue-600 text-white cursor-default shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 cursor-pointer"
                )}
              >
                <Calendar className="w-4 h-4" />
                <span>
                  {index === 0 ? 'Primary Date' : `Date ${index + 1}`}
                </span>
                {isCurrentMarket && (
                  <span className="ml-1 w-2 h-2 bg-white rounded-full"></span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    )
  }
  
  // Compact variant - for cards
  return (
    <div className={cn("space-y-1", className)}>
      {/* Note about different vendors - always show for split markets */}
      <div className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded inline-block">
        Different Vendors Each Day
      </div>
      
      {/* All related dates shown as small links */}
      <div className="flex flex-wrap gap-1">
        {allMarketIds.map((marketId, index) => {
          const isCurrentMarket = marketId === currentMarketId
          
          return (
            <Link
              key={marketId}
              to={isCurrentMarket ? '#' : `/markets/${marketId}`}
              onClick={(e) => {
                if (isCurrentMarket) e.preventDefault()
              }}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all",
                isCurrentMarket 
                  ? "bg-white text-zinc-900 shadow-md cursor-default" 
                  : "bg-white/60 text-zinc-600 hover:bg-white/90 hover:text-zinc-900 cursor-pointer"
              )}
              title={isCurrentMarket ? "This listing" : `View market for date ${index + 1}`}
            >
              <Calendar className="w-3 h-3" />
              <span>Date {index + 1}</span>
              {isCurrentMarket && (
                <span className="text-blue-600 font-bold text-[8px]">●</span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default RelatedMarketDates