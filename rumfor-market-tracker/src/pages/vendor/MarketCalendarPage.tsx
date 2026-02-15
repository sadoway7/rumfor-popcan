import { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check, ChevronDown, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/features/auth/authStore'
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets'
import { useAllTodos } from '@/features/tracking/hooks/useAllTodos'
import { useAllExpenses } from '@/features/tracking/hooks/useAllExpenses'
import { formatTime12Hour } from '@/utils/formatTime'
import { cn } from '@/utils/cn'
import { TRACKING_STATUS_COLORS, TRACKING_STATUS_LABELS } from '@/config/trackingStatus'
import { Todo, Expense } from '@/types'

type CalendarEvent = {
  id: string
  type: 'market' | 'todo' | 'expense'
  title: string
  date: Date
  color: string
  subtitle?: string
  link?: string
  todoId?: string
  completed?: boolean
  todo?: Todo
  expense?: Expense
  marketId?: string
}

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

const categoryLabels: Record<string, string> = {
  'booth-fee': 'Booth',
  'transportation': 'Trans',
  'accommodation': 'Stay',
  'supplies': 'Supply',
  'equipment': 'Equip',
  'marketing': 'Mktg',
  'food-meals': 'Food',
  'gasoline': 'Fuel',
  'insurance': 'Insur',
  'permits-licenses': 'Permit',
  'parking': 'Park',
  'storage': 'Store',
  'shipping': 'Ship',
  'utilities': 'Util',
  'miscellaneous': 'Other',
  'revenue': 'Rev'
}

export function MarketCalendarPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { trackedMarkets, isLoading: trackedLoading, getTrackingStatus, trackMarket } = useTrackedMarkets()
  const { todos, isLoading: todosLoading } = useAllTodos()
  const { expenses, isLoading: expensesLoading, updateExpense } = useAllExpenses()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [editActualValue, setEditActualValue] = useState('')
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  const today = new Date()
  const todayDate = today.getDate()
  const todayMonth = today.getMonth()
  const todayYear = today.getFullYear()

  const { toggleTodo } = useAllTodos()

  const calendarDays = useMemo(() => {
    const days: { day: number | null; key: string }[] = []
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, key: `empty-${currentYear}-${currentMonth}-${i}` })
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, key: `day-${currentYear}-${currentMonth}-${day}` })
    }
    return days
  }, [firstDayOfWeek, daysInMonth, currentYear, currentMonth])

  const getMarketColor = (marketId: string) => {
    let hash = 0
    for (let i = 0; i < marketId.length; i++) {
      hash = marketId.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']
    return colors[Math.abs(hash) % colors.length]
  }

  const startEditingActual = (expenseId: string, currentValue: number | undefined) => {
    setEditingExpenseId(expenseId)
    setEditActualValue(currentValue !== undefined ? currentValue.toString() : '')
  }

  const saveActualAmount = (expenseId: string) => {
    const newActual = editActualValue === '' ? undefined : parseFloat(editActualValue)
    if (newActual === undefined || (!isNaN(newActual) && newActual >= 0)) {
      updateExpense(expenseId, { actualAmount: newActual })
    }
    setEditingExpenseId(null)
    setEditActualValue('')
  }

  const handleActualKeyPress = (e: React.KeyboardEvent, expenseId: string) => {
    if (e.key === 'Enter') {
      saveActualAmount(expenseId)
    } else if (e.key === 'Escape') {
      setEditingExpenseId(null)
      setEditActualValue('')
    }
  }

  const getEventsForDay = useMemo(() => {
    return (day: number): CalendarEvent[] => {
      const events: CalendarEvent[] = []
      const date = new Date(currentYear, currentMonth, day)
      const dayOfWeek = date.getDay()
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      trackedMarkets.forEach(market => {
        if (!market.schedule || market.schedule.length === 0) return
        
        market.schedule.forEach((schedule, scheduleIndex) => {
          if (!schedule.isRecurring) {
            // One-time event - check if this day matches the start date
            const startDate = new Date(schedule.startDate)
            startDate.setHours(0, 0, 0, 0)
            const checkDate = new Date(date)
            checkDate.setHours(0, 0, 0, 0)
            
            if (startDate.getTime() === checkDate.getTime()) {
              events.push({
                id: `market-${market.id}-${day}-${scheduleIndex}`,
                type: 'market',
                title: market.name,
                date,
                color: 'bg-green-500',
                subtitle: `${formatTime12Hour(schedule.startTime)} - ${formatTime12Hour(schedule.endTime)}`,
                link: `/vendor/markets/${market.id}`,
                marketId: market.id
              })
            }
          } else {
            // Recurring event - check day of week and date range
            const startDate = new Date(schedule.startDate)
            startDate.setHours(0, 0, 0, 0)
            const endDate = new Date(schedule.endDate)
            endDate.setHours(23, 59, 59, 999)
            const checkDate = new Date(date)
            checkDate.setHours(12, 0, 0, 0)
            
            if (schedule.dayOfWeek === dayOfWeek && checkDate >= startDate && checkDate <= endDate) {
              events.push({
                id: `market-${market.id}-${day}-${scheduleIndex}`,
                type: 'market',
                title: market.name,
                date,
                color: 'bg-green-500',
                subtitle: `${formatTime12Hour(schedule.startTime)} - ${formatTime12Hour(schedule.endTime)}`,
                link: `/vendor/markets/${market.id}`,
                marketId: market.id
              })
            }
          }
        })
      })

      todos.forEach(todo => {
        if (todo.dueDate) {
          const todoDate = new Date(todo.dueDate)
          if (
            todoDate.getFullYear() === currentYear &&
            todoDate.getMonth() === currentMonth &&
            todoDate.getDate() === day
          ) {
            const market = todo.marketId ? trackedMarkets.find(m => m.id === todo.marketId) : null
            const marketName = market?.name
            const statusText = todo.completed ? 'Completed' : ''
            events.push({
              id: `todo-${todo.id}`,
              type: 'todo',
              title: todo.title,
              date,
              color: todo.completed ? 'bg-gray-400' : 'bg-accent',
              subtitle: marketName || 'General',
              link: '/vendor/todos',
              todoId: todo.id,
              completed: todo.completed,
              todo: todo
            })
          }
        }
      })

      expenses.forEach(expense => {
        if (expense.date) {
          const expenseDate = new Date(expense.date)
          if (
            expenseDate.getFullYear() === currentYear &&
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getDate() === day
          ) {
            const market = expense.marketId ? trackedMarkets.find(m => m.id === expense.marketId) : null
            const marketName = market?.name || 'General'
            events.push({
              id: `expense-${expense.id}`,
              type: 'expense',
              title: marketName,
              date,
              color: 'bg-red-500',
              subtitle: `$${expense.amount.toFixed(0)}${expense.actualAmount !== undefined ? ` / $${expense.actualAmount.toFixed(0)}` : ''}`,
              link: '/vendor/budgets',
              expense
            })
          }
        }
      })

      return events
    }
  }, [currentYear, currentMonth, trackedMarkets, todos, expenses])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    setSelectedDay(null)
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    setSelectedDay(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDay(todayDate)
  }

  const handleDayClick = (day: number) => {
    setSelectedDay(selectedDay === day ? null : day)
  }

  const handleEventClick = (event: CalendarEvent) => {
    if (event.link) {
      navigate(event.link)
    }
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const formatSelectedDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const selectedDayEvents = selectedDay !== null ? getEventsForDay(selectedDay) : []

  const isLoading = trackedLoading || todosLoading || expensesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-2 py-2 sm:px-4 sm:py-4">
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div className="space-y-3">
          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousMonth}
                className="flex items-center justify-center w-11 h-11 rounded-lg bg-surface-2 hover:bg-surface-3 active:bg-accent active:text-white transition-colors touch-manipulation"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  {formatMonthYear(currentDate)}
                </h2>
                <Button variant="outline" size="sm" onClick={goToToday} className="h-8 text-xs px-3">
                  Today
                </Button>
              </div>
              <button
                onClick={goToNextMonth}
                className="flex items-center justify-center w-11 h-11 rounded-lg bg-surface-2 hover:bg-surface-3 active:bg-accent active:text-white transition-colors touch-manipulation"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {dayNames.map((day, index) => (
                <div key={index} className="text-center text-xs font-medium text-muted-foreground py-1.5">
                  {day}
                </div>
              ))}

              {calendarDays.map((item) => {
                if (item.day === null) {
                  return <div key={item.key} className="min-h-[50px] sm:min-h-[60px] lg:min-h-[70px]" />
                }

                const day = item.day
                const events = getEventsForDay(day)
                const isToday = day === todayDate && currentMonth === todayMonth && currentYear === todayYear
                const isSelected = day === selectedDay
                const marketEvents = events.filter(e => e.type === 'market')
                const todoEvents = events.filter(e => e.type === 'todo')
                const expenseEvents = events.filter(e => e.type === 'expense')

                return (
                  <button
                    key={item.key}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "min-h-[50px] sm:min-h-[60px] lg:min-h-[70px] p-1 rounded-lg text-left transition-all touch-manipulation",
                      "flex flex-col justify-start border border-surface-3",
                      isToday && "border-foreground",
                      isSelected && "bg-accent/10 border-accent",
                      !isSelected && !isToday && "bg-surface hover:bg-surface-2"
                    )}
                  >
                    <span className="text-xs sm:text-sm font-medium text-foreground">
                      {day}
                    </span>
                    {events.length > 0 && (
                      <div className="flex items-center gap-1 mt-auto pb-0.5">
                        {marketEvents.length > 0 && (
                          <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 flex-shrink-0" />
                        )}
                        {todoEvents.length > 0 && (
                          <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-accent flex-shrink-0" />
                        )}
                        {expenseEvents.length > 0 && (
                          <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500 flex-shrink-0" />
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </Card>

          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground px-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500" />
              <span>Markets</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-accent" />
              <span>Todos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500" />
              <span>Expenses</span>
            </div>
          </div>
        </div>

        <div className="mt-4 lg:mt-0">
          <Card className="p-3 sm:p-4 lg:sticky lg:top-4">
            {selectedDay !== null ? (
              <>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {formatSelectedDate(selectedDay)}
                </h3>
                {selectedDayEvents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDayEvents.map(event => (
                      <div
                        key={event.id}
                        className="w-full p-2.5 rounded-lg bg-surface hover:bg-surface-2 transition-colors touch-manipulation min-h-[44px]"
                      >
                        <div className="flex items-start gap-2">
                          {event.type === 'todo' && event.todoId ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleTodo(event.todoId!)
                              }}
                              className={cn(
                                "w-5 h-5 rounded-md flex items-center justify-center transition-all border-2 flex-shrink-0 mt-0.5",
                                event.completed 
                                  ? "bg-accent border-accent text-white" 
                                  : "border-muted-foreground/40 hover:border-accent bg-white"
                              )}
                            >
                              {event.completed && <Check className="w-3 h-3" />}
                            </button>
                          ) : event.type === 'expense' && event.expense ? (
                            <span className={cn(
                              "inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap flex-shrink-0",
                              categoryColors[event.expense.category] || 'bg-gray-100 text-gray-700'
                            )}>
                              {categoryLabels[event.expense.category] || event.expense.category?.substring(0, 4) || 'Item'}
                            </span>
                          ) : (
                            <span className={cn("w-3 h-3 rounded-full mt-1 flex-shrink-0", event.color)} />
                          )}
                          {event.type === 'expense' && event.expense ? (
                            <>
                              <div className="flex-1 min-w-0">
                                <span className="block text-sm font-medium truncate">{event.expense.title || 'Untitled Budget'}</span>
                                <span className="block text-xs text-muted-foreground truncate">{event.title}</span>
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap min-w-[50px] text-right">
                                ${event.expense.amount.toLocaleString()}
                              </div>
                              {editingExpenseId === event.expense.id ? (
                                <input
                                  type="number"
                                  value={editActualValue}
                                  onChange={(e) => setEditActualValue(e.target.value)}
                                  onBlur={() => saveActualAmount(event.expense!.id)}
                                  onKeyDown={(e) => handleActualKeyPress(e, event.expense!.id)}
                                  placeholder="0"
                                  className="w-14 text-sm font-semibold text-right px-1 py-0.5 border-2 border-accent rounded bg-background focus:outline-none"
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    startEditingActual(event.expense!.id, event.expense!.actualAmount)
                                  }}
                                  className={cn(
                                    "text-sm font-semibold whitespace-nowrap min-w-[50px] text-right px-2 py-0.5 rounded transition-colors border text-xs",
                                    event.expense.actualAmount === undefined
                                      ? "text-muted-foreground italic border-muted/30 hover:text-foreground hover:border-muted/60 hover:bg-muted/50"
                                      : "border-border hover:text-accent hover:bg-accent/10"
                                  )}
                                >
                                  {event.expense.actualAmount !== undefined ? `$${event.expense.actualAmount.toLocaleString()}` : '-'}
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              <div 
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => event.link && navigate(event.link)}
                              >
                                <p className={cn(
                                  "text-sm font-medium truncate",
                                  event.type === 'todo' && event.completed ? "text-muted-foreground line-through" : "text-foreground"
                                )}>{event.title}</p>
                                {event.subtitle && (
                                  <p className="text-xs text-muted-foreground truncate">{event.subtitle}</p>
                                )}
                              </div>
                              {event.type === 'market' && event.marketId && (
                                <div className="relative" ref={dropdownRef}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setShowStatusDropdown(showStatusDropdown === event.id ? null : event.id)
                                    }}
                                    className={cn(
                                      'flex items-center gap-1 text-xs font-semibold text-white px-2.5 py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-opacity touch-manipulation min-h-[32px]',
                                      TRACKING_STATUS_COLORS[getTrackingStatus(event.marketId)?.status || 'interested']
                                    )}
                                  >
                                    <span>{TRACKING_STATUS_LABELS[getTrackingStatus(event.marketId)?.status || 'interested']}</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                  {showStatusDropdown === event.id && (
                                    <div className="absolute right-0 top-full mt-1 bg-background border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                                      {['interested', 'applied', 'approved', 'attending', 'completed'].map((status) => {
                                        const currentStatus = getTrackingStatus(event.marketId!)?.status
                                        return (
                                          <button
                                            key={status}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              trackMarket(event.marketId!, status)
                                              setShowStatusDropdown(null)
                                            }}
                                            className={cn(
                                              'w-full px-3 py-2.5 text-left text-sm hover:bg-surface flex items-center gap-2 touch-manipulation min-h-[44px]',
                                              currentStatus === status && 'font-medium bg-surface'
                                            )}
                                          >
                                            <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', TRACKING_STATUS_COLORS[status])} />
                                            {TRACKING_STATUS_LABELS[status]}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No events</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Select a day to view events</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {trackedMarkets.length === 0 && todos.length === 0 && expenses.length === 0 && (
        <Card className="p-6 mt-4 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <h3 className="text-base font-semibold text-foreground mb-2">No events yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Track markets, create todos, and add expenses to see them on your calendar
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/markets">
              <Button size="sm">Find Markets</Button>
            </Link>
            <Link to="/vendor/todos">
              <Button variant="outline" size="sm">Add Todos</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
