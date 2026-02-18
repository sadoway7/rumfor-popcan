import React from 'react'
import { Link } from 'react-router-dom'
import { Market } from '@/types'
import { cn } from '@/utils/cn'
import { Calendar } from 'lucide-react'

interface RelatedMarketDatesProps {
  market: Market
  className?: string
  variant?: 'compact' | 'tabs' | 'schedule'
}

interface SplitMarketInfo {
  id: string
  date: string
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
  
  // Tab variant - for detail pages (legacy style)
  if (variant === 'tabs') {
    return (
      <div className={cn("", className)}>
        {/* Banner */}
        <div className="px-3 py-2 bg-slate-600 text-white text-sm font-bold rounded-lg mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Different Vendors Each Day
        </div>
        
        {/* Date tabs */}
        <div className="flex flex-wrap gap-2">
          {marketInfos.map((info, index) => {
            const isCurrentMarket = info.id === currentMarketId
            const dateDisplay = formatDate(info.date) || `Date ${index + 1}`
            
            return (
              <Link
                key={info.id}
                to={isCurrentMarket ? '#' : `/markets/${info.id}`}
                onClick={(e) => {
                  if (isCurrentMarket) e.preventDefault()
                }}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                  isCurrentMarket 
                    ? "bg-slate-600 text-white cursor-default shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                )}
              >
                <Calendar className="w-4 h-4" />
                <span>{dateDisplay}</span>
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
  
  // Compact variant - for cards (stacked dates like normal markets)
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {marketInfos.map((info, index) => {
        const isCurrentMarket = info.id === currentMarketId
        const dateDisplay = formatDate(info.date)
        
        if (!dateDisplay) return null
        
        return (
          <Link
            key={info.id}
            to={isCurrentMarket ? '#' : `/markets/${info.id}`}
            onClick={(e) => {
              if (isCurrentMarket) e.preventDefault()
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] w-fit",
              isCurrentMarket 
                ? "bg-[#ffffff] text-zinc-900" 
                : "bg-white/70 text-zinc-700 hover:bg-white"
            )}
          >
            <Calendar className="w-4 h-4" />
            <span>{dateDisplay}</span>
          </Link>
        )
      })}
    </div>
  )
}

export default RelatedMarketDates