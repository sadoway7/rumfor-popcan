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
import { useExpenses } from '@/features/tracking/hooks/useExpenses'

export function VendorDashboardPage() {
  const { todos, isLoading: todosLoading } = useTodos()
  const { trackedMarkets, isLoading: marketsLoading, getTrackingStatus } = useTrackedMarkets()
  const { toggleTodo, deleteTodo, updateTodo } = useAllTodos()
  const { expenses, isLoading: expensesLoading } = useExpenses()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState<any>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPriority, setEditPriority] = useState('medium')
  const [editDueDate, setEditDueDate] = useState('')
  const [editMarketId, setEditMarketId] = useState<string | undefined>(undefined)

  // Calculate task stats
  const pendingTodos = todos.filter(todo => !todo.completed)
  const completedTodos = todos.filter(todo => todo.completed)
  const overdueTodos = todos.filter(todo =>
    !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date()
  )

  // Calculate overdue expenses (actual > budgeted)
  const overdueExpenses = expenses.filter(expense => {
    const actual = expense.actualAmount || 0
    const budget = expense.amount || 0
    return actual > budget
  })

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
          <Link to="/vendor/tracked-markets" className="block">
            <Button size="sm" className="h-8 text-xs rounded-full">
              View All
            </Button>
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
          <Link to="/vendor/todos" className="block">
            <Button size="sm" className="h-8 text-xs rounded-full">
              View All
            </Button>
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
                const days = todo.dueDate ? Math.ceil((new Date(todo.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
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

                    {/* Title and market name */}
                    <div className="flex-1 min-w-0">
                      <p className="block text-sm font-medium truncate text-foreground text-red-600">
                        {todo.title}
                      </p>
                      <p className="block text-xs text-muted-foreground truncate">
                        {marketName}
                      </p>
                    </div>

                    {/* Due date pill */}
                    {todo.dueDate && (
                      <span className="text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded flex-shrink-0 bg-red-100 text-red-700 font-medium">
                        <Clock className="w-3 h-3" />
                        {days !== null && days < 0 ? `${Math.abs(days)}d overdue` : new Date(todo.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    )}

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
          <Link to="/vendor/budgets" className="block">
            <Button size="sm" className="h-8 text-xs rounded-full">
              View All
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 text-sm mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">{expenses.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Overdue</span>
            <span className="font-semibold text-red-600">{overdueExpenses.length}</span>
          </div>
        </div>

        {overdueExpenses.length > 0 && (
          <>
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Overdue Budgets</h3>
            <div className="space-y-1">
              {overdueExpenses.slice(0, 5).map((expense) => {
                const marketName = expense.marketId ? trackedMarkets.find(m => m.id === expense.marketId)?.name || 'General' : 'General'
                const variance = expense.actualAmount !== undefined ? expense.actualAmount - expense.amount : 0

                return (
                  <div key={expense.id} className="flex items-center gap-2 py-2 px-2.5 rounded-lg border bg-surface touch-manipulation min-h-[44px] border-red-200 bg-red-50/50">
                    {/* Market indicator */}
                    <div className="flex-shrink-0">
                      {expense.marketId && (
                        <div className="w-6 h-6 rounded-md flex items-center justify-center border-2" style={{backgroundColor: getMarketColor(expense.marketId), borderColor: getMarketColor(expense.marketId)}}>
                          <span className="text-white text-xs font-semibold">{marketName.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    {/* Title and market name */}
                    <div className="flex-1 min-w-0">
                      <p className="block text-sm font-medium truncate text-foreground">
                        {expense.title || 'Untitled Budget'}
                      </p>
                      <p className="block text-xs text-muted-foreground truncate">
                        {marketName}
                      </p>
                    </div>

                    {/* Amounts */}
                    <div className="text-right">
                      <div className="text-xs font-medium text-muted-foreground">
                        ${expense.amount.toLocaleString()}
                      </div>
                      <div className="text-xs font-semibold text-red-600">
                        ${expense.actualAmount?.toLocaleString() || '0'}
                      </div>
                    </div>

                    {/* Variance */}
                    <div className="text-xs font-medium min-w-[50px] text-right whitespace-nowrap">
                      {variance > 0 ? (
                        <span className="text-red-600">+${variance.toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground">$0</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {overdueExpenses.length === 0 && (
          <div className="text-center py-4">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">No overdue budgets</p>
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