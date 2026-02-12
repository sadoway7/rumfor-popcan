import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Market } from '@/types'
import { cn } from '@/utils/cn'
import { formatTime12Hour } from '@/utils/formatTime'
import { parseLocalDate } from '@/utils/formatDate'
import { useTodos } from '@/features/tracking/hooks/useTodos'
import { useExpenses } from '@/features/tracking/hooks/useExpenses'
import {
  Calendar,
  MapPin,
  CheckSquare,
  Check,
  DollarSign,
  ChevronDown,
  Trash2,
  Clock,
  TrendingUp,
  MoreVertical,
  AlertTriangle,
  Eye,
  Archive
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ChatNotificationIcon } from '@/components/ui/ChatNotificationIcon'
import { useCommentsModalStore } from '@/features/comments/commentsModalStore'
import { communityApi } from '@/features/community/communityApi'
import { useQuery } from '@tanstack/react-query'
import { StatusChangeModal } from '@/components/StatusChangeModal'
import { TRACKING_STATUS_OPTIONS, TRACKING_STATUS_COLORS, TRACKING_STATUS_LABELS } from '@/config/trackingStatus'

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

interface VendorTrackedMarketRowProps {
  market: Market
  tracking?: VendorMarketTracking
  onViewDetails?: (marketId: string) => void
  onManage?: (marketId: string) => void
  onUntrack?: (marketId: string) => void
  onToggleTodo?: (todoId: string) => void
  onChangeStatus?: (marketId: string, status: string) => void
  className?: string
}

export const VendorTrackedMarketRow: React.FC<VendorTrackedMarketRowProps> = ({
  market,
  tracking,
  onViewDetails,
  onUntrack,
  onToggleTodo,
  onChangeStatus,
  className
}) => {
  const navigate = useNavigate()
  const { todos, toggleTodo } = useTodos(market.id)
  const { expenses, updateExpense } = useExpenses(market.id)
  const { openComments } = useCommentsModalStore()
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const { data: commentsData } = useQuery({
    queryKey: ['comments', market.id, 1],
    queryFn: () => communityApi.getComments(market.id, 1),
    staleTime: 60000,
  })

  const commentCount = market.stats?.commentCount || commentsData?.totalComments || 0

  const priorityConfig = {
    urgent: { color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="w-3 h-3" /> },
    high: { color: 'bg-orange-100 text-orange-700', icon: null },
    medium: { color: 'bg-yellow-100 text-yellow-700', icon: null },
    low: { color: 'bg-gray-100 text-gray-600', icon: null }
  }

  // Categories for expense display
  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'booth-fee', label: 'Booth Fee', icon: '🏠' },
    { id: 'transportation', label: 'Transportation', icon: '🚚' },
    { id: 'accommodation', label: 'Accommodation', icon: '🏨' },
    { id: 'supplies', label: 'Supplies', icon: '📦' },
    { id: 'equipment', label: 'Equipment', icon: '🔧' },
    { id: 'marketing', label: 'Marketing', icon: '📣' },
    { id: 'food-meals', label: 'Food', icon: '🍽️' },
    { id: 'gasoline', label: 'Fuel', icon: '⛽' },
    { id: 'insurance', label: 'Insurance', icon: '🛡️' },
    { id: 'permits-licenses', label: 'Permits', icon: '📄' },
    { id: 'parking', label: 'Parking', icon: '🅿️' },
    { id: 'storage', label: 'Storage', icon: '📦' },
    { id: 'shipping', label: 'Shipping', icon: '🚢' },
    { id: 'utilities', label: 'Utilities', icon: '💡' },
    { id: 'miscellaneous', label: 'Other', icon: '📋' },
    { id: 'revenue', label: 'Revenue', icon: '💰' }
  ]

  const categoryColors: Record<string, string> = {
    'booth-fee': 'bg-blue-100 text-blue-700',
    'transportation': 'bg-purple-100 text-purple-700',
    'accommodation': 'bg-teal-100 text-teal-700',
    'supplies': 'bg-amber-100 text-amber-700',
    'equipment': 'bg-rose-100 text-rose-700',
    'marketing': 'bg-pink-100 text-pink-700',
    'food-meals': 'bg-orange-100 text-orange-700',
    'gasoline': 'bg-red-100 text-red-700',
    'insurance': 'bg-cyan-100 text-cyan-700',
    'permits-licenses': 'bg-indigo-100 text-indigo-700',
    'parking': 'bg-yellow-100 text-yellow-700',
    'storage': 'bg-violet-100 text-violet-700',
    'shipping': 'bg-emerald-100 text-emerald-700',
    'utilities': 'bg-sky-100 text-sky-700',
    'miscellaneous': 'bg-gray-100 text-gray-700',
    'revenue': 'bg-green-100 text-green-700'
  }

  const updateExpenseById = (id: string, updates: any) => {
    updateExpense(id, updates)
  }

const formatSchedule = (schedule: Market['schedule']): string => {
    if (!schedule || schedule.length === 0) return 'TBD'
    const firstSchedule = schedule[0]
    const dateObj = parseLocalDate(firstSchedule.startDate)
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${dateStr} · ${formatTime12Hour(firstSchedule.startTime)}`
  }

  const currentStatus = tracking?.status || 'interested'

  // Get days until due for a todo
  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  // Filter to show only overdue tasks (past due date, not completed)
  const overdueTodos = todos.filter(todo => {
    if (todo.completed || !todo.dueDate) return false
    const dueDate = new Date(todo.dueDate)
    const now = new Date()
    return dueDate < now
  })

  // Filter to show only overdue expenses (actual > budgeted)
  const overdueExpenses = expenses.filter(expense => {
    const actual = expense.actualAmount || 0
    const budget = expense.amount || 0
    return actual > budget
  })

  // Get completed todos count
  const completedTodos = todos.filter(t => t.completed)

  const handleToggleTodo = (todoId: string) => {
    if (onToggleTodo) {
      onToggleTodo(todoId)
    } else {
      toggleTodo(todoId)
    }
  }

  const handleStatusChange = (newStatus: string) => {
    if (onChangeStatus) {
      onChangeStatus(market.id, newStatus)
    }
    setShowStatusModal(false)
  }

  const handleCardClick = () => {
    onViewDetails?.(market.id)
  }

  return (
    <>
    <div 
        className={cn('rounded-lg bg-card shadow hover:shadow-xl transition-shadow opacity-100 sm:mb-0 mb-4', className)}
        onClick={handleCardClick}
      >
        {/* Mobile */}
        <div className="flex flex-col sm:hidden overflow-hidden rounded-lg">
          <div className="relative w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900">
            {market.images && market.images.length > 0 && (
              <img src={market.images[0]} alt={market.name} className="absolute inset-0 w-full h-full object-cover" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
            {/* Status color tint - left edge, fading right */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent",
              currentStatus === 'applied' && "from-yellow-500/20",
              currentStatus === 'approved' && "from-green-500/20",
              currentStatus === 'attending' && "from-emerald-500/20",
              currentStatus === 'completed' && "from-gray-500/20"
            )} />
            
            <div className="absolute inset-0 p-3 flex flex-col">
                {/* Top row: Options button (left) + Status button (right) */}
                <div className="flex justify-between items-start mb-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-full bg-white text-muted-foreground hover:bg-surface hover:text-foreground transition-colors shadow"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onViewDetails?.(market.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/markets/${market.id}`} onClick={(e) => e.stopPropagation()}>
                          <Eye className="w-4 h-4 mr-2" />
                          Go to Public Page
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => console.log('Archive placeholder')}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive List
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onUntrack?.(market.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Untrack Market
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowStatusModal(true)
                    }}
                    className={cn('flex items-center gap-2 text-sm font-semibold text-white border-0 shadow-lg px-4 py-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity', TRACKING_STATUS_COLORS[currentStatus])}
                  >
                    <span>{TRACKING_STATUS_LABELS[currentStatus]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Chat button */}
                <div 
                  className="absolute bottom-6 right-2 cursor-pointer z-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    openComments(market.id, market.name)
                  }}
                >
                  <ChatNotificationIcon count={commentCount} />
                </div>

               {/* Bottom info - clickable to view details */}
              <div className="text-white mt-auto">
                <h3 className="font-bold text-xl leading-tight mb-1 drop-shadow-lg line-clamp-2">
                  {market.name}
                </h3>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{market.location.city}, {market.location.state}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatSchedule(market.schedule).split('·')[0]}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <CheckSquare className="w-4 h-4" />
                      {completedTodos.length}/{todos.length}
                    </span>
                    <span>${tracking?.totalExpenses || 0}</span>
                  </div>
                  <span className="text-white/70 text-xs">Tap for full plan →</span>
                </div>
              </div>
            </div>
          </div>

          {/* Todo list - show only overdue */}
          {overdueTodos.length > 0 && (
            <div className="p-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-1.5">
                {overdueTodos.map((todo) => {
                  const days = getDaysUntilDue(todo.dueDate)
                  const isOverdue = days !== null && days < 0 && !todo.completed
                  const overdueDays = days !== null && days < 0 ? Math.abs(days) : 0
                  return (
                    <div key={todo.id} className={cn(
                      "flex items-center gap-2 py-2 px-2.5 rounded-lg border bg-surface touch-manipulation min-h-[44px]",
                      todo.completed && "bg-muted/30 border-transparent opacity-60",
                      isOverdue && "border-red-200 bg-red-50/50"
                    )}>
                      <button
                        onClick={() => handleToggleTodo(todo.id)}
                        className={cn(
                          "w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all border-2",
                          todo.completed
                            ? 'bg-accent border-accent text-white'
                            : 'border-muted-foreground/40 hover:border-accent bg-white'
                        )}
                      >
                        {todo.completed && <Check className="w-4 h-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          "block text-sm font-medium truncate",
                          todo.completed && "line-through text-muted-foreground"
                        )}>
                          {todo.title}
                        </span>
                        {todo.description && (
                          <span className={cn(
                            "block text-xs text-muted-foreground truncate",
                            todo.completed && "line-through"
                          )}>
                            {todo.description}
                          </span>
                        )}
                      </div>
                      {todo.dueDate && (
                        <span className={cn(
                          "text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded flex-shrink-0",
                          isOverdue ? "bg-red-100 text-red-700 font-medium" : "text-foreground font-medium"
                        )}>
                          <Clock className="w-3 h-3" />
                          {isOverdue ? `${overdueDays}d overdue` : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : new Date(todo.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {todo.priority === 'urgent' && !todo.completed && (
                        <span className={cn(
                          "text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded flex-shrink-0",
                          priorityConfig[todo.priority]?.color
                        )}>
                          {priorityConfig[todo.priority]?.icon}
                        </span>
                      )}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === todo.id ? null : todo.id)}
                          className="p-1.5 rounded hover:bg-surface/50 touch-manipulation"
                        >
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {openMenuId === todo.id && (
                          <div className="absolute right-0 top-full mt-1 bg-background border rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
                            <button
                              onClick={() => handleToggleTodo(todo.id)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-surface flex items-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Mark Complete
                            </button>
                            <button
                              onClick={() => handleToggleTodo(todo.id)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-surface text-red-600 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Expense list - show only overdue */}
          {overdueExpenses.length > 0 && (
            <div className="p-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-destructive flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {overdueExpenses.length} Overdue Budgets
                </span>
              </div>
              <div className="space-y-1.5">
                {overdueExpenses.map((expense) => {
                  const categoryLabel = categories.find(c => c.id === expense.category)?.label.split(' ')[0]?.substring(0, 4) || expense.category
                  const variance = expense.actualAmount !== undefined ? expense.actualAmount - expense.amount : null
                  return (
                    <div key={expense.id} className="flex items-center gap-2 py-2 px-2.5 rounded-lg border bg-surface touch-manipulation min-h-[44px]">
                      {/* Category badge */}
                      <span className={cn(
                        "inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap flex-shrink-0",
                        categoryColors[expense.category] || 'bg-gray-100 text-gray-700'
                      )}>
                        {categoryLabel}
                      </span>
                      
                      {/* Title and description */}
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium truncate">{expense.title}</span>
                        {expense.description && (
                          <span className="block text-xs text-muted-foreground truncate">{expense.description}</span>
                        )}
                      </div>
                      
                      {/* Expected amount */}
                      <div className="text-xs text-muted-foreground whitespace-nowrap min-w-[60px] text-right">
                        ${expense.amount.toLocaleString()}
                      </div>
                      
                      {/* Actual amount - editable */}
                      <button
                        onClick={() => {
                          if (expense.actualAmount === expense.amount) {
                            updateExpenseById(expense.id, { actualAmount: undefined })
                          } else {
                            updateExpenseById(expense.id, { actualAmount: expense.amount })
                          }
                        }}
                        className={cn(
                          "text-sm font-semibold whitespace-nowrap min-w-[60px] text-right px-2 py-0.5 rounded transition-colors border",
                          expense.actualAmount === undefined
                            ? "text-muted-foreground italic border-muted/30 hover:text-foreground hover:border-muted/60 hover:bg-muted/50"
                            : "border-border hover:text-accent hover:bg-accent/10"
                        )}
                      >
                        {expense.actualAmount !== undefined ? `$${expense.actualAmount.toLocaleString()}` : '-'}
                      </button>
                      
                      {/* Variance */}
                      <div className={cn(
                        "text-xs font-medium min-w-[50px] text-right whitespace-nowrap",
                        variance === null && "text-muted-foreground/30",
                        variance === 0 && "text-muted-foreground",
                        variance && variance > 0 && "text-red-600",
                        variance && variance < 0 && "text-emerald-600"
                      )}>
                        {variance === null ? '-' :
                         variance === 0 ? '$0' :
                         (variance > 0 ? '+' : '') + `$${variance.toLocaleString()}`}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden sm:flex h-36 lg:h-40">
          {/* Image with overlays */}
          <div className="relative w-80 lg:w-96 shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden rounded-l-lg">
            {market.images && market.images.length > 0 && (
              <img src={market.images[0]} alt={market.name} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />
            
            {/* Options menu */}
            <div className="absolute left-3 top-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-full bg-white text-muted-foreground hover:bg-surface hover:text-foreground transition-colors shadow"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onViewDetails?.(market.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/markets/${market.id}`} onClick={(e) => e.stopPropagation()}>
                          <Eye className="w-4 h-4 mr-2" />
                          Go to Public Page
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => console.log('Archive placeholder')}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive List
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onUntrack?.(market.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Untrack Market
                      </DropdownMenuItem>
                    </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Status badge - clickable with icon */}
            <div className="absolute right-2 top-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowStatusModal(true)
                }}
                className={cn('flex items-center gap-1 text-xs font-semibold text-white border-0 shadow-lg px-2.5 py-1 rounded-full cursor-pointer hover:opacity-90 transition-opacity', TRACKING_STATUS_COLORS[currentStatus])}
              >
                <span>{TRACKING_STATUS_LABELS[currentStatus]}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Options menu */}
            <div className="absolute right-2 top-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-full bg-white text-muted-foreground hover:bg-surface hover:text-foreground transition-colors shadow"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onViewDetails?.(market.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/markets/${market.id}`} onClick={(e) => e.stopPropagation()}>
                          <Eye className="w-4 h-4 mr-2" />
                          Go to Public Page
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => console.log('Archive placeholder')}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive List
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onUntrack?.(market.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Untrack Market
                      </DropdownMenuItem>
                    </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Chat button */}
            <div 
              className="absolute bottom-6 right-2 cursor-pointer z-50"
              onClick={(e) => {
                e.stopPropagation()
                openComments(market.id, market.name)
              }}
            >
              <ChatNotificationIcon count={commentCount} size="sm" />
            </div>

            {/* Market info - clickable */}
            <div 
              className="absolute bottom-3 left-3 right-3 text-white cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onViewDetails?.(market.id)
              }}
            >
              <h3 className="font-bold text-base lg:text-lg leading-tight mb-1.5 drop-shadow-lg line-clamp-2">
                {market.name}
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{market.location.city}, {market.location.state}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatSchedule(market.schedule).split('·')[0]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks panel - shows only overdue items */}
          <div className="flex-1 p-3 min-w-0 bg-surface/50 rounded-r-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                {completedTodos.length}/{todos.length}
                <span className="text-muted-foreground/50">·</span>
                <DollarSign className="w-3.5 h-3.5" />
                ${tracking?.totalExpenses || 0}
              </span>
              <Link to={`/vendor/markets/${market.id}`} className="text-xs font-medium text-accent hover:underline">
                + Add
              </Link>
            </div>

            {overdueTodos.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-destructive flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {overdueTodos.length} Overdue Tasks
                </span>
              </div>
            )}

            {overdueExpenses.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-destructive flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {overdueExpenses.length} Overdue Budgets
                </span>
              </div>
            )}

            {overdueTodos.length === 0 && overdueExpenses.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No overdue tasks or expenses</p>
            ) : (
              <div className="space-y-1">
                {/* Show overdue todos */}
                {overdueTodos.map((todo) => {
                  const days = getDaysUntilDue(todo.dueDate)
                  const isOverdue = days !== null && days < 0 && !todo.completed
                  const overdueDays = days !== null && days < 0 ? Math.abs(days) : 0
                  return (
                    <div key={todo.id} className={cn(
                      "flex items-center gap-2 py-2 px-2.5 rounded-lg border bg-surface touch-manipulation min-h-[44px]",
                      todo.completed && "bg-muted/30 border-transparent opacity-60",
                      isOverdue && "border-red-200 bg-red-50/50"
                    )}>
                      <button
                        onClick={() => handleToggleTodo(todo.id)}
                        className={cn(
                          "w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all border-2",
                          todo.completed
                            ? 'bg-accent border-accent text-white'
                            : 'border-muted-foreground/40 hover:border-accent bg-white'
                        )}
                      >
                        {todo.completed && <Check className="w-4 h-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          "block text-sm font-medium truncate",
                          todo.completed && "line-through text-muted-foreground"
                        )}>
                          {todo.title}
                        </span>
                        {todo.description && (
                          <span className={cn(
                            "block text-xs text-muted-foreground truncate",
                            todo.completed && "line-through"
                          )}>
                            {todo.description}
                          </span>
                        )}
                      </div>
                      {todo.dueDate && (
                        <span className={cn(
                          "text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded flex-shrink-0",
                          isOverdue ? "bg-red-100 text-red-700 font-medium" : "text-foreground font-medium"
                        )}>
                          <Clock className="w-3 h-3" />
                          {isOverdue ? `${overdueDays}d overdue` : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : new Date(todo.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {todo.priority === 'urgent' && !todo.completed && (
                        <span className={cn(
                          "text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded flex-shrink-0",
                          priorityConfig[todo.priority]?.color
                        )}>
                          {priorityConfig[todo.priority]?.icon}
                        </span>
                      )}
                    </div>
                  )
                })}
                {/* Show overdue expenses */}
                {overdueExpenses.map((expense) => {
                  const categoryLabel = categories.find(c => c.id === expense.category)?.label.split(' ')[0]?.substring(0, 4) || expense.category
                  const variance = expense.actualAmount !== undefined ? expense.actualAmount - expense.amount : null
                  return (
                    <div key={expense.id} className="flex items-center gap-2 py-2 px-2.5 rounded-lg border bg-surface">
                      {/* Category badge */}
                      <span className={cn(
                        "inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap flex-shrink-0",
                        categoryColors[expense.category] || 'bg-gray-100 text-gray-700'
                      )}>
                        {categoryLabel}
                      </span>
                      
                      {/* Title and description */}
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium truncate">{expense.title}</span>
                        {expense.description && (
                          <span className="block text-xs text-muted-foreground truncate">{expense.description}</span>
                        )}
                      </div>
                      
                      {/* Expected amount */}
                      <div className="text-xs text-muted-foreground whitespace-nowrap min-w-[60px] text-right">
                        ${expense.amount.toLocaleString()}
                      </div>
                      
                      {/* Actual amount - editable */}
                      <button
                        onClick={() => {
                          if (expense.actualAmount === expense.amount) {
                            updateExpenseById(expense.id, { actualAmount: undefined })
                          } else {
                            updateExpenseById(expense.id, { actualAmount: expense.amount })
                          }
                        }}
                        className={cn(
                          "text-sm font-semibold whitespace-nowrap min-w-[60px] text-right px-2 py-0.5 rounded transition-colors border",
                          expense.actualAmount === undefined
                            ? "text-muted-foreground italic border-muted/30 hover:text-foreground hover:border-muted/60 hover:bg-muted/50"
                            : "border-border hover:text-accent hover:bg-accent/10"
                        )}
                      >
                        {expense.actualAmount !== undefined ? `$${expense.actualAmount.toLocaleString()}` : '-'}
                      </button>
                      
                      {/* Variance */}
                      <div className="text-xs font-medium min-w-[50px] text-right whitespace-nowrap">
                        {variance !== null && variance > 0 ? (
                          <span className="text-red-600">+${variance.toLocaleString()}</span>
                        ) : variance !== null && variance < 0 ? (
                          <span className="text-emerald-600">${variance.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground/30">$0</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {(overdueTodos.length > 5 || overdueExpenses.length > 5) && (
              <Link to={`/vendor/markets/${market.id}`} className="block mt-2 text-xs text-accent hover:underline">
                +{(overdueTodos.length - 5) + (overdueExpenses.length - 5)} more
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        currentStatus={currentStatus}
        statusOptions={TRACKING_STATUS_OPTIONS}
        onStatusChange={handleStatusChange}
      />
    </>
  )
}
