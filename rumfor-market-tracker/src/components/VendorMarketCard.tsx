import React from 'react'
import { Link } from 'react-router-dom'
import { Market } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/utils/cn'
import { Calendar, MapPin, DollarSign, CheckSquare, Users, Car, Accessibility, Heart } from 'lucide-react'

// Interface for vendor market tracking relationship
interface VendorMarketTracking {
  id: string
  userId: string
  marketId: string
  status: 'interested' | 'applied' | 'approved' | 'attending' | 'declined' | 'cancelled' | 'completed' | 'archived'
  notes?: string
  todoCount: number
  todoProgress: number
  totalExpenses: number
  createdAt: string
  updatedAt: string
}

interface VendorMarketCardProps {
  market: Market
  tracking?: VendorMarketTracking
  onUpdateStatus?: (marketId: string, status: string) => void
  onCreateTodo?: (marketId: string) => void
  onAddExpense?: (marketId: string) => void
  className?: string
}

const categoryLabels = {
  'farmers-market': 'Farmers Market',
  'arts-crafts': 'Arts & Crafts',
  'flea-market': 'Flea Market',
  'food-festival': 'Food Festival',
  'holiday-market': 'Holiday Market',
  'craft-show': 'Craft Show',
  'community-event': 'Community Event',
  'night-market': 'Night Market',
  'street-fair': 'Street Fair',
  'vintage-antique': 'Vintage & Antique'
}

const statusColors = {
  'interested': 'bg-blue-100 text-blue-800 border-blue-200',
  'applied': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'approved': 'bg-green-100 text-green-800 border-green-200',
  'attending': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'declined': 'bg-orange-100 text-orange-800 border-orange-200',
  'cancelled': 'bg-red-100 text-red-800 border-red-200',
  'completed': 'bg-gray-100 text-gray-800 border-gray-200',
  'archived': 'bg-slate-100 text-slate-800 border-slate-200'
}

export const VendorMarketCard: React.FC<VendorMarketCardProps> = ({
  market,
  tracking,
  onUpdateStatus,
  onCreateTodo,
  onAddExpense,
  className
}) => {
  const formatSchedule = (schedule: Market['schedule']) => {
    if (!schedule || schedule.length === 0) return 'Schedule TBD'
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dates = schedule
      .map(s => {
        const startDate = new Date(s.startDate)
        const endDate = new Date(s.endDate)
        
        return {
          dayName: dayNames[s.dayOfWeek],
          startDate: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          endDate: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          startTime: s.startTime,
          endTime: s.endTime
        }
      })
      .filter((item, index, arr) => 
        arr.findIndex(t => t.dayName === item.dayName) === index
      )
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    
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

  const isPromoterManaged = market.marketType === 'promoter-managed'
  const currentStatus = tracking?.status || 'interested'
  
  // Get application status for promoter-managed markets
  const applicationStatus = market.applicationStatus || 'not-applied'
  
  // Determine if applications are open for promoter-managed markets
  const applicationsOpen = isPromoterManaged && (
    applicationStatus === 'open' || 
    applicationStatus === 'accepting-applications'
  )

  return (
    <Card className={cn('overflow-hidden hover:shadow-lg transition-shadow', className)}>
      {/* Market Image and Basic Info */}
      {market.images && market.images.length > 0 && (
        <div className="relative h-32">
          <img
            src={market.images[0]}
            alt={market.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <Badge className="text-xs">
              {categoryLabels[market.category]}
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge className={cn('text-xs', statusColors[currentStatus] || 'bg-gray-100 text-gray-800 border-gray-200')}>
              {currentStatus}
            </Badge>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Market Title and Type */}
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">{market.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {formatLocation(market.location)}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {formatSchedule(market.schedule)}
          </div>
        </div>

        {/* Market Type Indicator */}
        <div className="flex items-center gap-2">
          {isPromoterManaged ? (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              <Users className="w-3 h-3 mr-1" />
              Promoter Managed
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              Community Listed
            </Badge>
          )}
          
          {/* Application Status for Promoter-Managed Markets */}
          {isPromoterManaged && (
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs',
                applicationsOpen ? 'bg-green-50 text-green-700 border-green-200' :
                applicationStatus === 'closed' ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-gray-50 text-gray-700 border-gray-200'
              )}
            >
              {applicationsOpen ? 'Applications Open' : 
               applicationStatus === 'closed' ? 'Applications Closed' :
               'Applications TBD'}
            </Badge>
          )}
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          {isPromoterManaged ? (
            // Application progress for promoter-managed markets
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Application Status</span>
              <span className="font-medium capitalize">
                {currentStatus}
              </span>
            </div>
          ) : (
            // Preparation progress for user-created markets
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Preparation Progress</span>
                <span className="font-medium">
                  {tracking?.todoProgress || 0}% complete
                </span>
              </div>
              <Progress value={tracking?.todoProgress || 0} className="h-2" />
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-muted-foreground" />
            <span>{tracking?.todoCount || 0} todos</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>${tracking?.totalExpenses || 0} spent</span>
          </div>
        </div>

        {/* Accessibility Features */}
        <div className="flex items-center gap-3">
          {market.accessibility.wheelchairAccessible && (
            <div className="flex items-center gap-1" title="Wheelchair Accessible">
              <Accessibility className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          {market.accessibility.parkingAvailable && (
            <div className="flex items-center gap-1" title="Parking Available">
              <Car className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          {market.accessibility.familyFriendly && (
            <div className="flex items-center gap-1" title="Family Friendly">
              <Heart className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link to={`/markets/${market.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
          
          {onCreateTodo && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCreateTodo(market.id)}
              className="flex-1"
            >
              <CheckSquare className="w-4 h-4 mr-1" />
              Todos
            </Button>
          )}
          
          {onAddExpense && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddExpense(market.id)}
              className="flex-1"
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Expenses
            </Button>
          )}
        </div>

        {/* Context-Specific Actions */}
        {isPromoterManaged ? (
          // Actions for promoter-managed markets
          <div className="pt-2">
            {applicationsOpen && currentStatus === 'interested' && onUpdateStatus && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onUpdateStatus(market.id, 'applied')}
                className="w-full mb-2"
              >
                Apply to Market
              </Button>
            )}
            {currentStatus !== 'interested' && (
              <div className="text-center text-sm text-muted-foreground">
                Application {currentStatus === 'applied' ? 'submitted' :
                          currentStatus === 'approved' ? 'approved' :
                          currentStatus === 'attending' ? 'attending' :
                          currentStatus === 'completed' ? 'completed' : 'processed'}
              </div>
            )}
          </div>
        ) : (
          // Actions for user-created markets
          <div className="pt-2">
            <div className="text-center text-sm text-muted-foreground">
              Community Listed • Track and plan your participation
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
