import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Market } from '@/types'
import { cn } from '@/utils/cn'
import { useTodos } from '@/features/tracking/hooks/useTodos'
import { useExpenses } from '@/features/tracking/hooks/useExpenses'
import {
  Calendar,
  MapPin,
  CheckSquare,
  DollarSign,
  X,
  ChevronDown,
  Trash2
} from 'lucide-react'

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

const statusColors: Record<string, string> = {
  'interested': 'bg-blue-500',
  'applied': 'bg-yellow-500',
  'approved': 'bg-green-500',
  'attending': 'bg-emerald-500',
  'declined': 'bg-orange-500',
  'cancelled': 'bg-red-500',
  'completed': 'bg-gray-500',
  'archived': 'bg-slate-500'
}

const statusLabels: Record<string, string> = {
  'interested': 'Interested',
  'applied': 'Applied',
  'approved': 'Approved',
  'attending': 'Attending',
  'completed': 'Completed',
}

const statusOptions = [
  { value: 'interested', label: 'Interested', color: 'bg-blue-500' },
  { value: 'applied', label: 'Applied', color: 'bg-yellow-500' },
  { value: 'approved', label: 'Approved', color: 'bg-green-500' },
  { value: 'attending', label: 'Attending', color: 'bg-emerald-500' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-500' },
]

export const VendorTrackedMarketRow: React.FC<VendorTrackedMarketRowProps> = ({
  market,
  tracking,
  onViewDetails,
  onUntrack,
  onToggleTodo,
  onChangeStatus,
  className
}) => {
  const { todos, toggleTodo } = useTodos(market.id)
  const { expenses } = useExpenses(market.id)
  const [showStatusModal, setShowStatusModal] = useState(false)

  const formatSchedule = (schedule: Market['schedule']): string => {
    if (!schedule || schedule.length === 0) return 'TBD'
    const firstSchedule = schedule[0]
    const startDate = new Date(firstSchedule.startDate)
    const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${dateStr} · ${firstSchedule.startTime}`
  }

  const currentStatus = tracking?.status || 'interested'
  const incompleteTodos = todos.filter(t => !t.completed)
  const completedTodos = todos.filter(t => t.completed)
  const recentTodos = [...incompleteTodos.slice(0, 3), ...completedTodos.slice(0, 2)].slice(0, 5)
  const recentExpenses = expenses.slice(0, 3)  // Show up to 3 recent expenses

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
        className={cn('rounded-lg bg-card shadow hover:shadow-xl transition-shadow opacity-100', className)}
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
              {/* Top row: Bigger status badge (left) + Untrack button (right) */}
              <div className="flex justify-between items-start mb-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowStatusModal(true)
                  }}
                  className={cn('flex items-center gap-2 text-sm font-semibold text-white border-0 shadow-lg px-4 py-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity', statusColors[currentStatus])}
                >
                  <span>{statusLabels[currentStatus]}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUntrack?.(market.id)
                  }}
                  className="p-2 rounded-full bg-white text-muted-foreground hover:bg-surface hover:text-red-600 transition-colors shadow"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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

          {/* Todo list */}
          {recentTodos.length > 0 && (
            <div className="p-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-1.5">
                {recentTodos.map((todo) => (
                  <label key={todo.id} className="flex items-center gap-2.5 py-1 rounded hover:bg-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id)}
                      className="w-4 h-4 rounded border-border text-accent focus:ring-2 focus:ring-accent shrink-0"
                    />
                    <span className={cn("text-sm flex-1", todo.completed ? "line-through text-muted-foreground" : "text-foreground")}>
                      {todo.title}
                    </span>
                    {todo.priority === 'urgent' && !todo.completed && (
                      <span className="text-destructive font-bold">!</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Expense list - show after todos */}
          {recentExpenses.length > 0 && (
            <div className="p-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-1.5">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center gap-2.5 py-1 rounded">
                    <div className="w-4 h-4 rounded bg-accent/10 flex items-center justify-center shrink-0">
                      <DollarSign className="w-3 h-3 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{expense.title}</div>
                      {expense.description && (
                        <div className="text-xs text-muted-foreground truncate">{expense.description}</div>
                      )}
                    </div>
                    <div className="text-sm font-semibold">${expense.amount.toLocaleString()}</div>
                  </div>
                ))}
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
            
            {/* Status badge - clickable with icon */}
            <div className="absolute left-3 top-3">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowStatusModal(true)
                }}
                className={cn('flex items-center gap-1 text-xs font-semibold text-white border-0 shadow-lg px-2.5 py-1 rounded-full cursor-pointer hover:opacity-90 transition-opacity', statusColors[currentStatus])}
              >
                <span>{statusLabels[currentStatus]}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Untrack button */}
            <div className="absolute right-2 top-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onUntrack?.(market.id)
                }}
                className="p-2 rounded-full bg-white text-muted-foreground hover:bg-surface hover:text-red-600 transition-colors shadow"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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

          {/* Tasks panel - now shows both tasks and expenses */}
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

            {recentTodos.length === 0 && recentExpenses.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No tasks or expenses</p>
            ) : (
              <div className="space-y-1">
                {/* Show todos */}
                {recentTodos.map((todo) => (
                  <label key={todo.id} className="flex items-center gap-2 py-0.5 rounded hover:bg-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id)}
                      className="w-3.5 h-3.5 rounded border-border text-accent focus:ring-1 focus:ring-accent shrink-0"
                    />
                    <span className={cn("text-xs flex-1 truncate", todo.completed ? "line-through text-muted-foreground" : "text-foreground")}>
                      {todo.title}
                    </span>
                    {todo.priority === 'urgent' && !todo.completed && (
                      <span className="text-destructive font-bold text-xs">!</span>
                    )}
                  </label>
                ))}
                {/* Show expenses */}
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center gap-2 py-0.5 rounded">
                    <div className="w-3.5 h-3.5 rounded bg-accent/10 flex items-center justify-center shrink-0">
                      <DollarSign className="w-2.5 h-2.5 text-accent" />
                    </div>
                    <span className="text-xs flex-1 truncate">{expense.title}</span>
                    <span className="text-xs font-semibold">${expense.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {(todos.length > 5 || expenses.length > 5) && (
              <Link to={`/vendor/markets/${market.id}`} className="block mt-2 text-xs text-accent hover:underline">
                +{(todos.length - 5) + (expenses.length - 5)} more
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowStatusModal(false)}>
          <div className="rounded-xl shadow-2xl max-w-sm w-full border-2 border-border" onClick={(e) => e.stopPropagation()} style={{backgroundColor: 'var(--color-card)', opacity: 1}}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-lg text-foreground">Change Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="p-1.5 hover:bg-surface rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2" style={{backgroundColor: 'var(--color-card)'}}>
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 font-medium",
                    currentStatus === option.value
                      ? "bg-accent text-accent-foreground shadow-lg"
                      : "bg-surface hover:bg-surface-2 text-foreground border border-border"
                  )}
                >
                  <div className={cn("w-3 h-3 rounded-full flex-shrink-0", option.color)} />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
