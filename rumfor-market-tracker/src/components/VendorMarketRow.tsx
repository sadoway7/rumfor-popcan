import React from 'react'
import { Link } from 'react-router-dom'
import { Market } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/utils/cn'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckSquare, 
  DollarSign, 
  Users, 
  Car, 
  Accessibility, 
  Heart,
  Plus,
  Edit,
  ArrowRight
} from 'lucide-react'

// Interface for vendor market tracking relationship
interface VendorMarketTracking {
  id: string
  userId: string
  marketId: string
  status: 'interested' | 'applied' | 'booked' | 'completed' | 'cancelled'
  notes?: string
  todoCount: number
  todoProgress: number
  totalExpenses: number
  createdAt: string
  updatedAt: string
}

// Interface for individual todo item
interface TodoItem {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
}

// Interface for individual expense item
interface ExpenseItem {
  id: string
  title: string
  amount: number
  category: string
  date: string
}

interface VendorMarketRowProps {
  market: Market
  tracking?: VendorMarketTracking
  todos?: TodoItem[]
  expenses?: ExpenseItem[]
  onUpdateStatus?: (marketId: string, status: string) => void
  onCreateTodo?: (marketId: string) => void
  onAddExpense?: (marketId: string) => void
  onCompleteTodo?: (todoId: string) => void
  className?: string
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

const statusColors = {
  'interested': 'bg-blue-100 text-blue-800 border-blue-200',
  'applied': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'booked': 'bg-green-100 text-green-800 border-green-200',
  'completed': 'bg-gray-100 text-gray-800 border-gray-200',
  'cancelled': 'bg-red-100 text-red-800 border-red-200'
}

export const VendorMarketRow: React.FC<VendorMarketRowProps> = ({
  market,
  tracking,
  todos = [],
  expenses = [],
  onUpdateStatus,
  onCreateTodo,
  onAddExpense,
  onCompleteTodo,
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
  const applicationStatus = (market.applicationStatus as string) || 'not-applied'
  const applicationsOpen = isPromoterManaged && (
    applicationStatus === 'open' || 
    applicationStatus === 'accepting-applications'
  )

  // Get recent todos (max 3) and expenses (max 3)
  const recentTodos = todos.slice(0, 3)
  const recentExpenses = expenses.slice(0, 3)

  return (
    <Card className={cn('overflow-hidden hover:shadow-lg transition-shadow', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        
        {/* Column 1: Market Details and Info */}
        <div className="space-y-4">
          {/* Market Image and Basic Info */}
          <div className="relative h-32 rounded-lg overflow-hidden">
            {market.images && market.images.length > 0 && (
              <img
                src={market.images[0]}
                alt={market.name}
                className="w-full h-full object-cover"
              />
            )}
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

          {/* Market Info */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-2">{market.name}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {formatLocation(market.location)}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatSchedule(market.schedule)}
              </div>
            </div>
          </div>

          {/* Market Type and Application Status */}
          <div className="space-y-2">
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
            </div>

            {isPromoterManaged && (
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs',
                  applicationsOpen ? 'bg-green-50 text-green-700 border-green-200' :
                  applicationStatus === 'closed' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                )}
              >
                {applicationsOpen ? 'Applications Open' : 
                 applicationStatus === 'closed' ? 'Applications Closed' : 'Applications TBD'}
              </Badge>
            )}
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

          {/* Actions */}
          <div className="flex gap-2">
            <Link to={`/markets/${market.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <ArrowRight className="w-4 h-4 mr-1" />
                Details
              </Button>
            </Link>
          </div>
        </div>

        {/* Column 2: Todo Quick List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Todo List
            </h4>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onCreateTodo?.(market.id)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress for User-Created Markets */}
          {!isPromoterManaged && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {tracking?.todoProgress || 0}%
                </span>
              </div>
              <Progress value={tracking?.todoProgress || 0} className="h-2" />
            </div>
          )}

          {/* Todo List */}
          <div className="space-y-2">
            {recentTodos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No todos yet
              </p>
            ) : (
              recentTodos.map((todo) => (
                <div 
                  key={todo.id} 
                  className={cn(
                    "flex items-center gap-2 p-2 rounded border text-sm",
                    todo.completed ? "bg-green-50 border-green-200" : "bg-surface border-border"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => onCompleteTodo?.(todo.id)}
                    className="rounded"
                  />
                  <span className={cn(
                    "flex-1",
                    todo.completed ? "line-through text-muted-foreground" : ""
                  )}>
                    {todo.title}
                  </span>
                  {todo.priority === 'urgent' && (
                    <Badge variant="destructive" className="text-xs">!</Badge>
                  )}
                </div>
              ))
            )}
          </div>

          {recentTodos.length > 0 && (
            <Link to={`/vendor/todos?market=${market.id}`}>
              <Button variant="ghost" size="sm" className="w-full">
                View All Todos
              </Button>
            </Link>
          )}
        </div>

        {/* Column 3: Finance Quick List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Expenses
            </h4>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onAddExpense?.(market.id)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Total Expenses */}
          <div className="bg-surface-2 rounded-lg p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                ${tracking?.totalExpenses || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </div>
          </div>

          {/* Expense List */}
          <div className="space-y-2">
            {recentExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No expenses yet
              </p>
            ) : (
              recentExpenses.map((expense) => (
                <div 
                  key={expense.id} 
                  className="flex items-center justify-between p-2 bg-surface border border-border rounded text-sm"
                >
                  <span className="flex-1">{expense.title}</span>
                  <div className="text-right">
                    <div className="font-medium">${expense.amount}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {expense.category.replace('-', ' ')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {recentExpenses.length > 0 && (
            <Link to={`/vendor/expenses?market=${market.id}`}>
              <Button variant="ghost" size="sm" className="w-full">
                View All Expenses
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Actions for Promoter-Managed Markets */}
      {isPromoterManaged && (
        <div className="border-t border-border p-4 bg-surface-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {currentStatus === 'interested' ? 'Ready to apply?' : 
               currentStatus === 'applied' ? 'Application submitted' : 
               currentStatus === 'booked' ? 'Application approved!' : 
               currentStatus === 'completed' ? 'Market completed' : 
               'Application processed'}
            </div>
            
            {applicationsOpen && currentStatus === 'interested' && onUpdateStatus && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onUpdateStatus(market.id, 'applied')}
              >
                Apply to Market
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}