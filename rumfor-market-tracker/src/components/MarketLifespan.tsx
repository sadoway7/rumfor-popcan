import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { format, differenceInDays, differenceInWeeks, differenceInMonths } from 'date-fns'
import { Calendar, Clock, TrendingUp, TrendingDown } from 'lucide-react'

interface MarketLifespanProps {
  market: {
    id: string
    createdAt: string
    schedule?: {
      seasonalStart?: string
      seasonalEnd?: string
      isRecurring?: boolean
      daysOfWeek?: string[]
      startDate?: string
      endDate?: string
    }[]
    status: string
  }
  className?: string
}

export const MarketLifespan: React.FC<MarketLifespanProps> = ({ market, className }) => {
  const now = new Date()
  const createdAt = new Date(market.createdAt)

  // Calculate market age
  const ageInDays = differenceInDays(now, createdAt)
  const ageInWeeks = differenceInWeeks(now, createdAt)
  const ageInMonths = Math.floor(differenceInMonths(now, createdAt))

  // Format age display
  const formatAge = () => {
    if (ageInMonths > 0) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}`
    } else if (ageInWeeks > 0) {
      return `${ageInWeeks} week${ageInWeeks !== 1 ? 's' : ''}`
    } else {
      return `${ageInDays} day${ageInDays !== 1 ? 's' : ''}`
    }
  }

  // Get current schedule info
  const currentSchedule = market.schedule?.[0]
  const seasonalStart = currentSchedule?.seasonalStart ? new Date(currentSchedule.seasonalStart) : null
  const seasonalEnd = currentSchedule?.seasonalEnd ? new Date(currentSchedule.seasonalEnd) : null
  const startDate = currentSchedule?.startDate ? new Date(currentSchedule.startDate) : null
  const endDate = currentSchedule?.endDate ? new Date(currentSchedule.endDate) : null

  // Determine if market is seasonal or one-time
  const isSeasonal = seasonalStart && seasonalEnd
  const isOneTime = startDate && endDate
  const isRecurring = currentSchedule?.isRecurring

  // Calculate time remaining or elapsed for current season/event
  const getLifespanInfo = () => {
    if (isSeasonal) {
      const currentYear = now.getFullYear()
      const seasonStart = new Date(seasonalStart!)
      const seasonEnd = new Date(seasonalEnd!)

      // Adjust for current year
      seasonStart.setFullYear(currentYear)
      seasonEnd.setFullYear(currentYear)

      // If we're past the end date, use next year's season
      if (now > seasonEnd) {
        seasonStart.setFullYear(currentYear + 1)
        seasonEnd.setFullYear(currentYear + 1)
      } else if (now < seasonStart) {
        // Before season start
        const daysUntil = differenceInDays(seasonStart, now)
        return {
          type: 'upcoming',
          message: `${daysUntil} days until season starts`,
          start: seasonStart,
          end: seasonEnd,
          icon: TrendingUp
        }
      }

      // During season
      const daysRemaining = differenceInDays(seasonEnd, now)
      if (daysRemaining > 0) {
        return {
          type: 'active',
          message: `${daysRemaining} days remaining in season`,
          start: seasonStart,
          end: seasonEnd,
          icon: Clock
        }
      } else {
        return {
          type: 'ended',
          message: 'Season ended',
          start: seasonStart,
          end: seasonEnd,
          icon: TrendingDown
        }
      }
    } else if (isOneTime) {
      if (now < startDate!) {
        const daysUntil = differenceInDays(startDate!, now)
        return {
          type: 'upcoming',
          message: `${daysUntil} days until event`,
          start: startDate!,
          end: endDate!,
          icon: Calendar
        }
      } else if (now > endDate!) {
        return {
          type: 'ended',
          message: 'Event ended',
          start: startDate!,
          end: endDate!,
          icon: TrendingDown
        }
      } else {
        const daysRemaining = differenceInDays(endDate!, now)
        return {
          type: 'active',
          message: `${daysRemaining} days remaining`,
          start: startDate!,
          end: endDate!,
          icon: Clock
        }
      }
    } else if (isRecurring) {
      return {
        type: 'recurring',
        message: `${formatAge()} old`,
        start: null,
        end: null,
        icon: Calendar
      }
    } else {
      return {
        type: 'ongoing',
        message: `${formatAge()} old`,
        start: null,
        end: null,
        icon: Calendar
      }
    }
  }

  const lifespan = getLifespanInfo()

  return (
    <Card className={className}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <lifespan.icon className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Market Lifespan</h3>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${
              market.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
              market.status === 'completed' ? 'bg-gray-100 text-gray-800 border-gray-200' :
              'bg-yellow-100 text-yellow-800 border-yellow-200'
            }`}
          >
            {market.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Market Age</span>
            <span className="text-sm font-medium">{formatAge()}</span>
          </div>

          {lifespan.start && lifespan.end && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {isSeasonal ? 'Current Season' : 'Event Dates'}
              </span>
              <span className="text-sm font-medium">
                {format(lifespan.start, 'MMM d')} - {format(lifespan.end, 'MMM d')}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Created</span>
            <span className="text-sm font-medium">
              {format(createdAt, 'MMM d, yyyy')}
            </span>
          </div>

          <div className="pt-2 border-t">
            <div className={`text-sm font-medium flex items-center gap-1 ${
              lifespan.type === 'active' ? 'text-green-600' :
              lifespan.type === 'upcoming' ? 'text-blue-600' :
              lifespan.type === 'ended' ? 'text-gray-600' :
              'text-primary'
            }`}>
              <lifespan.icon className="h-3 w-3" />
              {lifespan.message}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}