import { Link } from 'react-router-dom'
import { useState } from 'react'
import { AlertCircle, Clock, Check, Edit2, Trash2, MoreVertical, DollarSign } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useTodos } from '@/features/tracking/hooks/useTodos'
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets'
import { useAllTodos } from '@/features/tracking/hooks/useAllTodos'
import { useAllExpenses } from '@/features/tracking/hooks/useAllExpenses'
import { cn } from '@/utils/cn'

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

export function VendorDashboardPage() {
  const { todos, isLoading: todosLoading } = useTodos()
  const { trackedMarkets, isLoading: marketsLoading, getTrackingStatus } = useTrackedMarkets()
  const { toggleTodo, deleteTodo, updateTodo } = useAllTodos()
  const { expenses, isLoading: expensesLoading, updateExpense } = useAllExpenses()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState<any>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPriority, setEditPriority] = useState('medium')
  const [editDueDate, setEditDueDate] = useState('')
  const [editMarketId, setEditMarketId] = useState<string | undefined>(undefined)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [editActualValue, setEditActualValue] = useState('')

  // Calculate task stats
  const pendingTodos = todos.filter(todo => !todo.completed)
  const completedTodos = todos.filter(todo => todo.completed)
  const overdueTodos = todos.filter(todo =>
    !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date()
  )

  // Calculate overdue expenses (actual not entered yet)
  const overdueExpenses = expenses.filter(expense => {
    return expense.actualAmount === undefined
  })

  // Only show overdue budgets on dashboard
  const displayExpenses = overdueExpenses
    .slice()
    .sort((a, b) => {
      const aDate = a.date ? new Date(a.date).getTime() : Infinity
      const bDate = b.date ? new Date(b.date).getTime() : Infinity
      return aDate - bDate
    })
    .slice(0, 5)

  // Calculate market tracking status counts
  const interestedCount = trackedMarkets.filter(market => getTrackingStatus(market.id)?.status === 'interested').length
  const appliedCount = trackedMarkets.filter(market => getTrackingStatus(market.id)?.status === 'applied').length
  const approvedCount = trackedMarkets.filter(market => getTrackingStatus(market.id)?.status === 'approved').length
  // const attendingCount = trackedMarkets.filter(market => getTrackingStatus(market.id)?.status === 'attending').length
  // const completedCount = trackedMarkets.filter(market => getTrackingStatus(market.id)?.status === 'completed').length

  const getMarketColor = (marketId: string) => {
    // Simple hash-based color generation for consistent market colors
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

  const handleEdit = (todo: any) => {
    setEditingTodo(todo)
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
    setEditPriority(todo.priority)
    setEditDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '')
    setEditMarketId(todo.marketId || undefined)
    setShowEditModal(true)
    setOpenMenuId(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) {
      await deleteTodo(id)
    }
    setOpenMenuId(null)
  }

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editingTodo) return

    await updateTodo(editingTodo.id, {
      title: editTitle,
      description: editDescription || undefined,
      priority: editPriority as any,
      dueDate: editDueDate || undefined,
      marketId: editMarketId || undefined
    })
    
    setShowEditModal(false)
    setEditingTodo(null)
  }

  if (todosLoading || marketsLoading || expensesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Markets Overview - Clean List Style */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Markets</h2>
          <Link to="/vendor/tracked-markets" className="text-xs px-2 py-1 border border-foreground rounded-full hover:bg-surface">
            View All
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">{trackedMarkets.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Interested</span>
            <span className="font-semibold">{interestedCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Applied</span>
            <span className="font-semibold">{appliedCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Approved</span>
            <span className="font-semibold text-green-600">{approvedCount}</span>
          </div>
        </div>
      </Card>

      {/* Tasks Overview - Clean List Style */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Tasks</h2>
          <Link to="/vendor/todos" className="text-xs px-2 py-1 border border-foreground rounded-full hover:bg-surface">
            View All
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">{todos.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Done</span>
            <span className="font-semibold text-green-600">{completedTodos.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Pending</span>
            <span className="font-semibold">{pendingTodos.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Overdue</span>
            <span className="font-semibold text-red-600">{overdueTodos.length}</span>
          </div>
        </div>

        {overdueTodos.length > 0 && (
          <>
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Overdue</h3>
            <div className="space-y-1">
              {overdueTodos.slice(0, 5).map((todo) => {
                const marketName = todo.marketId ? trackedMarkets.find(m => m.id === todo.marketId)?.name || 'General' : 'General'

                return (
                  <div key={todo.id} className="flex items-center gap-2 py-2 px-2.5 rounded-lg border bg-surface touch-manipulation min-h-[44px] border-red-200 bg-red-50/50">
                    {/* Checkbox with market indicator */}
                    <div className="flex-shrink-0 relative">
                      <button
                        onClick={() => {
                          toggleTodo(todo.id)
                          setOpenMenuId(null)
                        }}
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-all border-2 ${todo.completed ? 'bg-accent border-accent text-white' : 'border-muted-foreground/40 hover:border-accent bg-white'}`}
                        title="Complete task"
                      >
                        {todo.completed && <Check className="w-4 h-4" />}
                      </button>
                      {todo.marketId && (
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full border border-background" style={{backgroundColor: getMarketColor(todo.marketId)}} />
                      )}
                    </div>

                    {/* Title and market name + date */}
                    <div className="flex-1 min-w-0">
                      <p className="block text-sm font-medium truncate text-red-600">
                        {todo.title}
                      </p>
                      <p className="block text-xs text-muted-foreground truncate">
                        {marketName !== 'General' ? marketName : ''}{todo.dueDate && marketName !== 'General' ? ' • ' : ''}{todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </p>
                    </div>

                    {/* Priority pill for urgent tasks */}
                    {todo.priority === 'urgent' && (
                      <span className="text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded flex-shrink-0 bg-red-100 text-red-700">
                        <AlertCircle className="w-3 h-3" />
                      </span>
                    )}

                    {/* Actions menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === todo.id ? null : todo.id)}
                        className="p-1.5 rounded hover:bg-surface/50 touch-manipulation"
                        title="More actions"
                      >
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>

                      {openMenuId === todo.id && (
                        <div className="absolute right-0 top-full mt-1 bg-background border rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
                          <button
                            onClick={() => handleEdit(todo)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-surface flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(todo.id)}
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
          </>
        )}
      </Card>

      {/* Budget Overview - Clean List Style */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Budget</h2>
          <Link to="/vendor/budgets" className="text-xs px-2 py-1 border border-foreground rounded-full hover:bg-surface">
            View All
          </Link>
        </div>

        <div className="flex items-center gap-3 text-sm mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">{expenses.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Pending</span>
            <span className="font-semibold text-amber-600">{overdueExpenses.length}</span>
          </div>
        </div>

        {displayExpenses.length > 0 && (
          <>
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Pending Budget Items</h3>
            <div className="space-y-1">
              {displayExpenses.map((expense) => {
                const marketName = expense.marketId ? trackedMarkets.find(m => m.id === expense.marketId)?.name || 'General' : 'General'
                const isEditing = editingExpenseId === expense.id

                return (
                  <div key={expense.id} className="flex items-center gap-2 py-2 px-2.5 rounded-lg border bg-surface touch-manipulation min-h-[44px]">
                    <span className={cn(
                      "inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap flex-shrink-0",
                      categoryColors[expense.category] || 'bg-gray-100 text-gray-700'
                    )}>
                      {categoryLabels[expense.category] || expense.category?.substring(0, 4) || 'Item'}
                    </span>

                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate">{expense.title || 'Untitled Budget'}</span>
                      <span className="block text-xs text-muted-foreground truncate">
                        {marketName !== 'General' ? marketName : ''}{expense.date && marketName !== 'General' ? ' • ' : ''}{expense.date ? new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground whitespace-nowrap min-w-[60px] text-right">
                      ${expense.amount.toLocaleString()}
                    </div>

                    {isEditing ? (
                      <input
                        type="number"
                        value={editActualValue}
                        onChange={(e) => setEditActualValue(e.target.value)}
                        onBlur={() => saveActualAmount(expense.id)}
                        onKeyDown={(e) => handleActualKeyPress(e, expense.id)}
                        placeholder="0"
                        className="w-16 text-sm font-semibold text-right px-1 py-0.5 border-2 border-accent rounded bg-background focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => startEditingActual(expense.id, expense.actualAmount)}
                        className={cn(
                          "text-sm font-semibold whitespace-nowrap min-w-[60px] text-right px-2 py-0.5 rounded transition-colors border",
                          expense.actualAmount === undefined
                            ? "text-muted-foreground italic border-muted/30 hover:text-foreground hover:border-muted/60 hover:bg-muted/50"
                            : "border-border hover:text-accent hover:bg-accent/10"
                        )}
                      >
                        {expense.actualAmount !== undefined ? `$${expense.actualAmount.toLocaleString()}` : '-'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {displayExpenses.length === 0 && (
          <div className="text-center py-4">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">No budget items</p>
          </div>
        )}
      </Card>

      {/* Edit Task Modal */}
      {showEditModal && editingTodo && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingTodo(null)
          }}
          title="Edit Task"
          showCloseButton={true}
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
              <Input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="Task title"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
              <textarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                placeholder="Add details..."
                rows={2}
                className="w-full p-3 border-2 rounded-lg bg-background focus:border-accent outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
              <select
                value={editPriority}
                onChange={e => setEditPriority(e.target.value)}
                className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Market</label>
              <select
                value={editMarketId || ''}
                onChange={e => setEditMarketId(e.target.value || undefined)}
                className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none"
              >
                <option value="">General</option>
                {trackedMarkets.map(market => (
                  <option key={market.id} value={market.id}>{market.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Due Date</label>
              <input
                type="date"
                value={editDueDate}
                onChange={e => setEditDueDate(e.target.value)}
                className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none"
              />
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleSaveEdit}
              >
                Save
              </Button>

              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  handleDelete(editingTodo.id)
                  setShowEditModal(false)
                  setEditingTodo(null)
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}