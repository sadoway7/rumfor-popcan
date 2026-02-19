import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Market } from '@/types'
import { cn } from '@/utils/cn'
import { Calendar, Clock } from 'lucide-react'
import { marketsApi } from '@/features/markets/marketsApi'
import { formatTime12Hour } from '@/utils/formatTime'

interface RelatedMarketDatesProps {
  market: Market
  className?: string
  variant?: 'compact' | 'tabs' | 'schedule'
}

interface SplitMarketInfo {
  id: string
  date: string
  startTime?: string
  endTime?: string
}

interface RelatedMarketData {
  id: string
  startTime?: string
  endTime?: string
}

/**
 * Component for displaying related market dates when a market has been split
 * 
 * - 'compact' variant: Small badges for use in cards
 * - 'tabs' variant: Prominent tabs for use in detail pages (deprecated)
 * - 'schedule' variant: Styled like normal schedule dates, stacked with calendar icon
 */
export const RelatedMarketDates: React.FC<RelatedMarketDatesProps> = ({
  market,
  className,
  variant = 'compact'
}) => {
  const [relatedMarketData, setRelatedMarketData] = useState<Record<string, RelatedMarketData>>({})
  
  const splitTag = market.tags?.find(tag => tag.startsWith('split-market:'))
  
  if (!splitTag) {
    return null
  }
  
  // Parse the split-market tag
  // Format: split-market:id1:2024-02-19,id2:2024-02-20,id3:2024-02-21
  // Legacy format: split-market:id1,id2,id3
  const tagContent = splitTag.replace('split-market:', '')
  const currentMarketId = market.id
  
  let marketInfos: SplitMarketInfo[] = []
  
  if (tagContent.includes(':')) {
    // New format with dates
    marketInfos = tagContent.split(',').map(part => {
      const colonIndex = part.indexOf(':')
      const id = colonIndex > -1 ? part.substring(0, colonIndex) : part
      const date = colonIndex > -1 ? part.substring(colonIndex + 1) : ''
      return { id, date }
    })
  } else {
    // Legacy format without dates - just IDs
    marketInfos = tagContent.split(',').map(id => ({ id, date: '' }))
  }
  
  // Fetch related market times
  useEffect(() => {
    const fetchRelatedMarkets = async () => {
      const idsToFetch = marketInfos
        .map(info => info.id)
        .filter(id => id !== currentMarketId && !relatedMarketData[id])
      
      if (idsToFetch.length === 0) return
      
      const newData: Record<string, RelatedMarketData> = { ...relatedMarketData }
      
      for (const id of idsToFetch) {
        try {
          const response = await marketsApi.getMarketById(id)
          if (response.success && response.data) {
            const m = response.data
            // Extract time from schedule
            let startTime: string | undefined
            let endTime: string | undefined
            
            if (Array.isArray(m.schedule) && m.schedule.length > 0) {
              startTime = m.schedule[0].startTime
              endTime = m.schedule[0].endTime
            } else if (m.schedule && typeof m.schedule === 'object') {
              const sched = m.schedule as any
              startTime = sched.startTime
              endTime = sched.endTime
            }
            
            newData[id] = { id, startTime, endTime }
          }
        } catch (e) {
          console.error('Failed to fetch market', id, e)
        }
      }
      
      setRelatedMarketData(newData)
    }
    
    fetchRelatedMarkets()
  }, [splitTag])
  
  // Add current market's time to the data
  const currentMarketTime = {
    startTime: Array.isArray(market.schedule) && market.schedule.length > 0 
      ? market.schedule[0].startTime 
      : (market.schedule && typeof market.schedule === 'object' ? (market.schedule as any).startTime : undefined),
    endTime: Array.isArray(market.schedule) && market.schedule.length > 0 
      ? market.schedule[0].endTime 
      : (market.schedule && typeof market.schedule === 'object' ? (market.schedule as any).endTime : undefined)
  }
  
  // Format date for display (includes day of week)
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr + 'T12:00:00')
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
      const dateStr2 = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return `${dayName}, ${dateStr2}`
    } catch {
      return ''
    }
  }
  
  // Schedule variant - styled like normal MarketDetailPage schedule, stacked with calendar icon
  if (variant === 'schedule') {
    return (
      <div className={cn("space-y-2", className)}>
        {marketInfos.map((info, index) => {
          const isCurrentMarket = info.id === currentMarketId
          const dateDisplay = formatDate(info.date) || `Date ${index + 1}`
          
          const content = (
            <>
              <Calendar className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className={cn("text-sm", isCurrentMarket ? "font-bold" : "font-medium")}>{dateDisplay}</p>
              </div>
            </>
          )
          
          if (isCurrentMarket) {
            return (
              <div key={info.id} className="flex items-start gap-2 cursor-default">
                {content}
              </div>
            )
          }
          
          return (
            <Link
              key={info.id}
              to={`/markets/${info.id}`}
              className="flex items-start gap-2 hover:opacity-70 transition-opacity"
            >
              {content}
            </Link>
          )
        })}
      </div>
    )
  }
  
  // Tab variant - for detail pages
  if (variant === 'tabs') {
    return (
      <div className={cn("space-y-2", className)}>
        {marketInfos.map((info, index) => {
          const isCurrentMarket = info.id === currentMarketId
          const dateDisplay = formatDate(info.date) || `Date ${index + 1}`
          
          // Get time for this market
          const marketTime = isCurrentMarket 
            ? currentMarketTime 
            : relatedMarketData[info.id]
          const timeDisplay = marketTime?.startTime && marketTime?.endTime
            ? `${formatTime12Hour(marketTime.startTime)} - ${formatTime12Hour(marketTime.endTime)}`
            : null
          
          const content = (
            <>
              <Calendar className={cn("w-4 h-4 flex-shrink-0 mt-0.5 transition-colors", isCurrentMarket ? "text-amber-500" : "text-accent group-hover:text-amber-500")} />
              <div>
                <p className={cn("text-sm transition-colors", isCurrentMarket ? "font-bold text-amber-600" : "font-medium group-hover:text-amber-600")}>{dateDisplay}</p>
                {timeDisplay && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeDisplay}
                  </p>
                )}
                {isCurrentMarket && (
                  <p className="text-xs text-amber-500">Current view</p>
                )}
              </div>
            </>
          )
          
          if (isCurrentMarket) {
            return (
              <div key={info.id} className="flex items-start gap-2 cursor-default bg-amber-50 px-3 py-2 rounded-lg -ml-3">
                {content}
              </div>
            )
          }
          
          return (
            <Link
              key={info.id}
              to={`/markets/${info.id}`}
              className="flex items-start gap-2 hover:bg-gray-50 px-3 py-2 rounded-lg -mx-3 transition-colors cursor-pointer group"
            >
              {content}
            </Link>
          )
        })}
      </div>
    )
  }
  
  // Compact variant - for cards (stacked dates like normal markets)
  // Note: Uses div instead of Link to avoid nested <a> tags since MarketCard is wrapped in Link
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {marketInfos.map((info, index) => {
        const isCurrentMarket = info.id === currentMarketId
        const dateDisplay = formatDate(info.date)
        
        if (!dateDisplay) return null
        
        return (
          <div
            key={info.id}
            onClick={(e) => {
              if (!isCurrentMarket) {
                e.stopPropagation()
                window.location.href = `/markets/${info.id}`
              }
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)] w-fit",
              isCurrentMarket 
                ? "bg-white text-zinc-900" 
                : "bg-white/70 text-zinc-900 hover:bg-white cursor-pointer"
            )}
          >
            <Calendar className="w-4 h-4" />
            <span>{dateDisplay}</span>
          </div>
        )
      })}
    </div>
  )
}

export default RelatedMarketDates