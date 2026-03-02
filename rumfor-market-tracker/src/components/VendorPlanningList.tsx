import React, { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { usePlanning } from '@/features/tracking/hooks/usePlanning'
import { useTodos } from '@/features/tracking/hooks/useTodos'
import { useExpenses } from '@/features/tracking/hooks/useExpenses'
import { Todo, Expense, TodoPriority, ExpenseCategory, PlanningItem } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/utils/cn'
import { Plus, ChevronLeft, MoreVertical, Trash2, Edit2, Check, Clock, AlertTriangle, Sparkles, GripVertical, DollarSign, ListTodo } from 'lucide-react'
import { useAuthStore } from '@/features/auth/authStore'
import { formatLocalDate } from '@/utils/formatDate'

interface VendorPlanningListProps {
  marketId: string
  className?: string
}

const todoCategories = [
  { id: 'setup', label: 'Setup', icon: '📦' },
  { id: 'products', label: 'Products', icon: '🛒' },
  { id: 'marketing', label: 'Marketing', icon: '📣' },
  { id: 'logistics', label: 'Logistics', icon: '🚚' },
  { id: 'post-event', label: 'Post-event', icon: '🎉' },
  { id: 'misc', label: 'Misc', icon: '📋' }
]

const expenseCategories = [
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

const todoPresets: Record<string, string[]> = {
  setup: ['Complete vendor application', 'Review market rules', 'Design booth layout', 'Obtain permits', 'Set up payment'],
  products: ['Prepare inventory', 'Price all products', 'Organize display', 'Prepare samples', 'Update descriptions'],
  marketing: ['Create materials', 'Post on social media', 'Design flyers', 'Contact media', 'Update website'],
  logistics: ['Arrange transport', 'Prepare equipment', 'Pack materials', 'Plan booth setup', 'Confirm accommodation'],
  'post-event': ['Clean up area', 'Process payments', 'Follow up customers', 'Review sales', 'Plan next market'],
  misc: ['Take photos', 'Network with vendors', 'Check weather', 'Review feedback', 'Update records']
}

const budgetPresets: Record<string, { id: string; name: string; expected: number; description: string; icon: string }[]> = {
  'booth-fee': [
    { id: 'booth-standard', name: 'Standard Booth', expected: 100, description: 'Standard 10x10 booth space', icon: '🏠' },
    { id: 'booth-corner', name: 'Corner Booth', expected: 150, description: 'Corner booth with extra visibility', icon: '📍' },
  ],
  'transportation': [
    { id: 'transport-gas', name: 'Gas/Fuel', expected: 50, description: 'Fuel for transportation', icon: '⛽' },
    { id: 'transport-truck', name: 'Rental Truck', expected: 100, description: 'Vehicle rental for transport', icon: '🚚' },
  ],
  'supplies': [
    { id: 'supply-packaging', name: 'Packaging', expected: 50, description: 'Bags, boxes, and packaging materials', icon: '📦' },
    { id: 'supply-signage', name: 'Signage', expected: 75, description: 'Banners, signs, and displays', icon: '🪧' },
  ],
}

const priorityConfig = {
  urgent: { color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="w-3 h-3" /> },
  high: { color: 'bg-orange-100 text-orange-700', icon: null },
  medium: { color: 'bg-yellow-100 text-yellow-700', icon: null },
  low: { color: 'bg-gray-100 text-gray-600', icon: null }
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
  'miscellaneous': 'bg-gray-100 text-gray-700',
  'revenue': 'bg-green-100 text-green-700'
}

interface SortableItemProps {
  item: PlanningItem
  onToggleTodo: (id: string) => void
  onEditTodo: (todo: Todo) => void
  onEditExpense: (expense: Expense) => void
  onDeleteTodo: (id: string) => void
  onDeleteExpense: (id: string) => void
  onUpdateExpenseActual: (id: string, actual: number | undefined) => void
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
}

const SortableItem: React.FC<SortableItemProps> = ({
  item,
  onToggleTodo,
  onEditTodo,
  onEditExpense,
  onDeleteTodo,
  onDeleteExpense,
  onUpdateExpenseActual,
  openMenuId,
  setOpenMenuId
}) => {
  const [isEditingActual, setIsEditingActual] = useState(false)
  const [actualValue, setActualValue] = useState('')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  if (item.type === 'todo') {
    const todo = item.data as Todo
    const days = todo.dueDate ? Math.ceil((new Date(todo.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
    const isOverdue = days !== null && days < 0 && !todo.completed
    const priority = priorityConfig[todo.priority]

    return (
      <div ref={setNodeRef} style={style} className={cn(
        "flex items-center gap-2 py-3 px-3 rounded-lg border bg-surface touch-manipulation min-h-[56px]",
        todo.completed && "border-transparent",
        isOverdue && "border-red-200 bg-red-50/50"
      )}>
        <button {...attributes} {...listeners} className="touch-none p-1.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
          <GripVertical className="w-5 h-5" />
        </button>

        <button
          onClick={() => onToggleTodo(todo.id)}
          className={cn(
            "w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all border-2",
            todo.completed ? 'bg-accent border-accent text-white' : 'border-muted-foreground/40 hover:border-accent bg-white'
          )}
        >
          {todo.completed && <Check className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <span className={cn("block text-sm font-medium truncate", todo.completed && "line-through text-muted-foreground")}>
            {todo.title}
          </span>
          {todo.description && (
            <span className={cn("block text-xs text-muted-foreground truncate", todo.completed && "line-through")}>
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
            {isOverdue ? `${Math.abs(days!)}d overdue` : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : new Date(todo.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        )}

        {todo.priority === 'urgent' && (
          <span className={cn("text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded flex-shrink-0", priority.color)}>
            {priority.icon}
          </span>
        )}

        <div className="relative">
          <button onClick={() => setOpenMenuId(openMenuId === todo.id ? null : todo.id)} className="p-1.5 rounded hover:bg-surface/50 touch-manipulation">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          {openMenuId === todo.id && (
            <div className="absolute right-0 top-full mt-1 bg-background border rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
              <button onClick={() => { onEditTodo(todo); setOpenMenuId(null); }} className="w-full px-3 py-2 text-left text-sm hover:bg-surface flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => onDeleteTodo(todo.id)} className="w-full px-3 py-2 text-left text-sm hover:bg-surface text-red-600 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const expense = item.data as Expense
  const actualAmount = expense.actualAmount
  const variance = actualAmount !== undefined ? actualAmount - expense.amount : null

  const startEditing = () => {
    setActualValue(actualAmount !== undefined ? actualAmount.toString() : '')
    setIsEditingActual(true)
  }

  const handleActualSave = () => {
    const newActual = actualValue === '' ? undefined : parseFloat(actualValue)
    if (newActual === undefined || (!isNaN(newActual) && newActual >= 0)) {
      onUpdateExpenseActual(expense.id, newActual)
    }
    setIsEditingActual(false)
  }

return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 py-3 px-3 rounded-lg border bg-surface touch-manipulation min-h-[56px]">
      <button {...attributes} {...listeners} className="touch-none p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
        <GripVertical className="w-5 h-5" />
      </button>

      <span className={cn(
        "inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap flex-shrink-0",
        categoryColors[expense.category] || 'bg-gray-100 text-gray-700'
      )}>
        {expenseCategories.find(c => c.id === expense.category)?.label.split(' ')[0]?.substring(0, 4) || expense.category}
      </span>

      <div className="flex-1 min-w-0">
        <span className="block text-sm font-medium truncate">{expense.title}</span>
        {expense.description && <span className="block text-xs text-muted-foreground truncate">{expense.description}</span>}
      </div>

      <div className="text-xs text-muted-foreground whitespace-nowrap min-w-[60px] text-right">
        ${expense.amount.toLocaleString()}
      </div>

      {isEditingActual ? (
        <input
          type="number"
          value={actualValue}
          onChange={(e) => setActualValue(e.target.value)}
          onBlur={handleActualSave}
          onKeyDown={(e) => { if (e.key === 'Enter') handleActualSave(); else if (e.key === 'Escape') setIsEditingActual(false); }}
          placeholder="0"
          className="w-16 text-sm font-semibold text-right px-1 py-0.5 border-2 border-accent rounded bg-background focus:outline-none"
          autoFocus
        />
      ) : (
        <button
          onClick={startEditing}
          className={cn(
            "text-sm font-semibold whitespace-nowrap min-w-[60px] text-right px-2 py-0.5 rounded transition-colors border",
            actualAmount === undefined
              ? "text-muted-foreground italic border-muted/30 hover:text-foreground hover:border-muted/60 hover:bg-muted/50"
              : "border-border hover:text-accent hover:bg-accent/10"
          )}
        >
          {actualAmount !== undefined ? `$${actualAmount.toLocaleString()}` : '-'}
        </button>
      )}

      <div className={cn(
        "text-xs font-medium min-w-[50px] text-right whitespace-nowrap hidden md:block",
        variance === null && "text-muted-foreground/30",
        variance === 0 && "text-muted-foreground",
        variance && variance > 0 && "text-red-600",
        variance && variance < 0 && "text-emerald-600"
      )}>
        {variance === null ? '-' : variance === 0 ? '$0' : (variance > 0 ? '+' : '') + `$${variance.toLocaleString()}`}
      </div>

      <div className="relative">
        <button onClick={() => setOpenMenuId(openMenuId === expense.id ? null : expense.id)} className="p-1.5 rounded hover:bg-surface/50 touch-manipulation">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        {openMenuId === expense.id && (
          <div className="absolute right-0 top-full mt-1 bg-background border rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
            <button onClick={() => { onEditExpense(expense); setOpenMenuId(null); }} className="w-full px-3 py-2 text-left text-sm hover:bg-surface flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button onClick={() => onDeleteExpense(expense.id)} className="w-full px-3 py-2 text-left text-sm hover:bg-surface text-red-600 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export const VendorPlanningList: React.FC<VendorPlanningListProps> = ({ marketId, className }) => {
  const { user } = useAuthStore()
  const { planningItems, todos, expenses, isLoading, error, updateOrder, isUpdatingOrder } = usePlanning(marketId)
  const { toggleTodo, deleteTodo: deleteTodoApi, createTodo, updateTodo } = useTodos(marketId)
  const { createExpense, deleteExpense: deleteExpenseApi, updateExpense } = useExpenses(marketId)

  const [showTodoPresets, setShowTodoPresets] = useState(false)
  const [showBudgetPresets, setShowBudgetPresets] = useState(false)
  const [selectedTodoCategory, setSelectedTodoCategory] = useState<string | null>(null)
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState<string | null>(null)
  const [showTodoForm, setShowTodoForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [newTodoDescription, setNewTodoDescription] = useState('')
  const [newTodoCategory, setNewTodoCategory] = useState('setup')
  const [newTodoPriority, setNewTodoPriority] = useState<TodoPriority>('medium')
  const [newTodoDueDate, setNewTodoDueDate] = useState('')

  const [newBudgetCategory, setNewBudgetCategory] = useState<ExpenseCategory>('booth-fee')
  const [newBudgetTitle, setNewBudgetTitle] = useState('')
  const [newBudgetExpected, setNewBudgetExpected] = useState('')
  const [newBudgetActual, setNewBudgetActual] = useState('')
  const [newBudgetDescription, setNewBudgetDescription] = useState('')
  const [newBudgetDate, setNewBudgetDate] = useState('')

  // Use planning items directly - they come sorted from usePlanning
  const items = planningItems

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(item => item.id === active.id)
    const newIndex = items.findIndex(item => item.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)

    // Save new order to server
    const orderUpdates = newItems.map((item, index) => ({
      id: item.id,
      type: item.type,
      sortOrder: index
    }))
    updateOrder(orderUpdates)
  }, [items, updateOrder])

  const handleToggleTodo = (id: string) => {
    toggleTodo(id)
    setOpenMenuId(null)
  }

  const handleDeleteTodo = (id: string) => {
    if (confirm('Delete this task?')) {
      deleteTodoApi(id)
    }
    setOpenMenuId(null)
  }

  const handleDeleteExpense = (id: string) => {
    if (confirm('Delete this budget item?')) {
      deleteExpenseApi(id)
    }
    setOpenMenuId(null)
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setNewTodoTitle(todo.title)
    setNewTodoDescription(todo.description || '')
    setNewTodoCategory(todo.category)
    setNewTodoPriority(todo.priority)
    setNewTodoDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '')
    setShowTodoForm(true)
    setOpenMenuId(null)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setNewBudgetCategory(expense.category)
    setNewBudgetTitle(expense.title)
    setNewBudgetExpected(expense.amount.toString())
    setNewBudgetActual(expense.actualAmount !== undefined ? expense.actualAmount.toString() : '')
    setNewBudgetDescription(expense.description || '')
    setNewBudgetDate(expense.date ? expense.date.split('T')[0] : '')
    setShowBudgetForm(true)
    setOpenMenuId(null)
  }

  const handleUpdateExpenseActual = (id: string, actual: number | undefined) => {
    updateExpense(id, { actualAmount: actual })
  }

  const handleSaveTodo = async () => {
    if (!newTodoTitle.trim()) return
    if (editingTodo) {
      await updateTodo(editingTodo.id, { title: newTodoTitle, description: newTodoDescription, category: newTodoCategory, priority: newTodoPriority, dueDate: newTodoDueDate || undefined })
    } else {
      createTodo({ title: newTodoTitle, description: newTodoDescription, category: newTodoCategory, priority: newTodoPriority, dueDate: newTodoDueDate || undefined })
    }
    setShowTodoForm(false)
    setEditingTodo(null)
    resetTodoForm()
  }

  const handleSaveBudget = async () => {
    if (!newBudgetTitle.trim() || !newBudgetExpected) return
    const expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
      vendorId: user?.id || '',
      marketId,
      category: newBudgetCategory,
      title: newBudgetTitle,
      amount: parseFloat(newBudgetExpected),
      actualAmount: newBudgetActual !== '' ? parseFloat(newBudgetActual) : undefined,
      description: newBudgetDescription,
      date: newBudgetDate || formatLocalDate(new Date().toISOString())
    }
    if (editingExpense) {
      await updateExpense(editingExpense.id, expenseData)
    } else {
      await createExpense(expenseData)
    }
    setShowBudgetForm(false)
    setEditingExpense(null)
    resetBudgetForm()
  }

  const resetTodoForm = () => {
    setNewTodoTitle('')
    setNewTodoDescription('')
    setNewTodoCategory('setup')
    setNewTodoPriority('medium')
    setNewTodoDueDate('')
  }

  const resetBudgetForm = () => {
    setNewBudgetCategory('booth-fee')
    setNewBudgetTitle('')
    setNewBudgetExpected('')
    setNewBudgetActual('')
    setNewBudgetDescription('')
    setNewBudgetDate('')
  }

  const handleSelectTodoPreset = async (preset: string) => {
    createTodo({ title: preset, category: selectedTodoCategory || 'setup', priority: 'medium' })
    setShowTodoPresets(false)
    setSelectedTodoCategory(null)
  }

  const handleSelectBudgetPreset = (preset: any) => {
    setNewBudgetCategory(preset.category as ExpenseCategory)
    setNewBudgetTitle(preset.name)
    setNewBudgetExpected(preset.expected.toString())
    setNewBudgetActual('')
    setNewBudgetDescription(preset.description)
    setNewBudgetDate('')
    setShowBudgetPresets(false)
    setSelectedBudgetCategory(null)
    setShowBudgetForm(true)
  }

  const completedTodos = todos.filter((t: Todo) => t.completed)
  const pendingTodos = todos.filter((t: Todo) => !t.completed)
  const overdueCount = pendingTodos.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length

  const totalExpected = expenses.reduce((sum, item) => sum + item.amount, 0)
  const totalActual = expenses.reduce((sum, item) => sum + (item.actualAmount !== undefined ? item.actualAmount : 0), 0)
  const variance = totalActual - totalExpected

  if (isLoading) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <div className="animate-pulse">Loading...</div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <p className="text-red-500 text-sm">Error loading planning items</p>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        {(todos.length > 0 || expenses.length > 0) && (
          <span className="text-sm text-muted-foreground">
            {completedTodos.length}/{todos.length} tasks • {expenses.length} budget
          </span>
        )}
        <div className="flex gap-1 ml-auto">
          <Button size="sm" onClick={() => { resetTodoForm(); setEditingTodo(null); setShowTodoForm(true); }} className="h-8 w-8 p-0" variant="outline" title="Add task">
            <ListTodo className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => { resetBudgetForm(); setEditingExpense(null); setShowBudgetForm(true); }} className="h-8 w-8 p-0" variant="outline" title="Add budget item">
            <DollarSign className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-red-700 font-medium">{overdueCount} overdue</span>
        </div>
      )}

      {expenses.length > 0 && (
        <Card className="p-3 bg-surface border border-border">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Budget</div>
                <div className="text-sm font-bold">${totalExpected.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Actual</div>
                <div className="text-sm font-bold">${totalActual.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Diff</div>
              <div className={cn("text-sm font-bold", variance > 0 ? 'text-red-600' : variance < 0 ? 'text-emerald-600' : 'text-foreground')}>
                {variance > 0 ? '+' : ''}{variance.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      )}

      {items.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {items.map(item => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onToggleTodo={handleToggleTodo}
                  onEditTodo={handleEditTodo}
                  onEditExpense={handleEditExpense}
                  onDeleteTodo={handleDeleteTodo}
                  onDeleteExpense={handleDeleteExpense}
                  onUpdateExpenseActual={handleUpdateExpenseActual}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {items.length === 0 && !isLoading && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">No planning items yet</p>
          <div className="flex gap-2 justify-center mt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowTodoPresets(true)} className="text-xs">Add tasks</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowBudgetPresets(true)} className="text-xs">Add budget</Button>
          </div>
        </div>
      )}

      <Modal isOpen={showTodoPresets} onClose={() => { setShowTodoPresets(false); setSelectedTodoCategory(null); }} title={selectedTodoCategory ? `${todoCategories.find(c => c.id === selectedTodoCategory)?.icon} ${todoCategories.find(c => c.id === selectedTodoCategory)?.label}` : 'Task Templates'} showCloseButton={true} className="sm:max-w-sm sm:rounded-xl max-w-none max-h-[85vh] m-0 sm:m-auto">
        <div className="h-full flex flex-col">
          {selectedTodoCategory && (
            <button onClick={() => setSelectedTodoCategory(null)} className="flex items-center gap-1 p-3 -mx-3 text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <div className="flex-1 -mx-4 px-4">
            {!selectedTodoCategory ? (
              <div className="grid grid-cols-2 gap-2">
                {todoCategories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedTodoCategory(cat.id)} className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-surface hover:bg-surface-2 transition-colors touch-manipulation">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {todoPresets[selectedTodoCategory]?.map((preset, i) => (
                  <button key={i} onClick={() => handleSelectTodoPreset(preset)} className="w-full text-left p-3.5 rounded-xl bg-surface hover:bg-surface-2 text-sm transition-colors touch-manipulation">
                    {preset}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBudgetPresets} onClose={() => { setShowBudgetPresets(false); setSelectedBudgetCategory(null); }} title={selectedBudgetCategory ? `${expenseCategories.find(c => c.id === selectedBudgetCategory)?.icon} ${expenseCategories.find(c => c.id === selectedBudgetCategory)?.label}` : 'Budget Presets'} showCloseButton={true} className="sm:max-w-sm sm:rounded-xl max-w-none max-h-[85vh] m-0 sm:m-auto">
        <div className="h-full flex flex-col">
          {selectedBudgetCategory && (
            <button onClick={() => setSelectedBudgetCategory(null)} className="flex items-center gap-1 p-3 -mx-3 text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <div className="flex-1 -mx-4 px-4">
            {!selectedBudgetCategory ? (
              <div className="grid grid-cols-2 gap-2">
                {expenseCategories.filter(c => budgetPresets[c.id]).map(cat => (
                  <button key={cat.id} onClick={() => setSelectedBudgetCategory(cat.id)} className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-surface hover:bg-surface-2 transition-colors touch-manipulation">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs font-medium text-center">{cat.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {budgetPresets[selectedBudgetCategory]?.map((preset) => (
                  <button key={preset.id} onClick={() => handleSelectBudgetPreset({ ...preset, category: selectedBudgetCategory })} className="w-full text-left p-3.5 rounded-xl bg-surface hover:bg-surface-2 transition-colors touch-manipulation">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{preset.icon}</div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{preset.name}</div>
                        <div className="text-xs text-muted-foreground mb-2">{preset.description}</div>
                        <div className="text-sm font-bold text-accent">${preset.expected.toLocaleString()}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={showTodoForm} onClose={() => setShowTodoForm(false)} title={editingTodo ? 'Edit Task' : 'New Task'} showCloseButton={true} className="sm:max-w-sm sm:rounded-xl max-w-none max-h-[85vh] m-0 sm:m-auto">
        <div className="h-full flex flex-col -mx-4">
          {!editingTodo && (
            <div className="px-4 pb-2 border-b">
              <Button size="sm" onClick={() => { setShowTodoForm(false); setShowTodoPresets(true); }} className="w-full justify-center font-medium h-10" variant="outline">
                Use a Preset Task
              </Button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
                <input type="text" value={newTodoTitle} onChange={e => setNewTodoTitle(e.target.value)} placeholder="Task title" className="w-full p-3 text-base border-2 rounded-lg bg-background focus:border-accent outline-none" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea value={newTodoDescription} onChange={e => setNewTodoDescription(e.target.value)} placeholder="Add details..." rows={2} className="w-full p-3 border-2 rounded-lg bg-background focus:border-accent outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                  <select value={newTodoCategory} onChange={e => setNewTodoCategory(e.target.value)} className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none">
                    {todoCategories.map(cat => (<option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
                  <select value={newTodoPriority} onChange={e => setNewTodoPriority(e.target.value as TodoPriority)} className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Due Date</label>
                <input type="date" value={newTodoDueDate} onChange={e => setNewTodoDueDate(e.target.value)} className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none" />
              </div>
            </div>
          </div>
          <div className="p-4 border-t space-y-2">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-10" onClick={handleSaveTodo}>Save</Button>
              {!editingTodo && (
                <Button variant="secondary" className="flex-1 h-10" onClick={() => { if (newTodoTitle.trim()) { createTodo({ title: newTodoTitle, description: newTodoDescription, category: newTodoCategory, priority: newTodoPriority, dueDate: newTodoDueDate || undefined }); resetTodoForm(); } }}>Quick Add</Button>
              )}
            </div>
            {editingTodo && (
              <Button variant="ghost" className="w-full h-10 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => { handleDeleteTodo(editingTodo.id); setShowTodoForm(false); }}>Delete</Button>
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBudgetForm} onClose={() => setShowBudgetForm(false)} title={editingExpense ? 'Edit Budget Item' : 'Add Budget Item'} showCloseButton={true} className="sm:max-w-sm sm:rounded-xl max-w-none max-h-[85vh] m-0 sm:m-auto">
        <div className="h-full flex flex-col -mx-4">
          {!editingExpense && (
            <div className="px-4 pb-2 border-b">
              <Button size="sm" onClick={() => { setShowBudgetForm(false); setShowBudgetPresets(true); }} className="w-full justify-center font-medium h-10" variant="outline">
                <Sparkles className="w-4 h-4 mr-2" /> Use a Preset
              </Button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                <select value={newBudgetCategory} onChange={e => setNewBudgetCategory(e.target.value as ExpenseCategory)} className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none">
                  {expenseCategories.map(cat => (<option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Name *</label>
                <input type="text" value={newBudgetTitle} onChange={e => setNewBudgetTitle(e.target.value)} placeholder="Item name" className="w-full p-3 text-base border-2 rounded-lg bg-background focus:border-accent outline-none" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Expected *</label>
                  <input type="number" value={newBudgetExpected} onChange={e => setNewBudgetExpected(e.target.value)} placeholder="0" className="w-full p-3 border-2 rounded-lg bg-background focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Actual</label>
                  <input type="number" value={newBudgetActual} onChange={e => setNewBudgetActual(e.target.value)} placeholder="0" className="w-full p-3 border-2 rounded-lg bg-background focus:border-accent outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea value={newBudgetDescription} onChange={e => setNewBudgetDescription(e.target.value)} placeholder="Add details..." rows={2} className="w-full p-3 border-2 rounded-lg bg-background focus:border-accent outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
                <input type="date" value={newBudgetDate} onChange={e => setNewBudgetDate(e.target.value)} className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none" />
              </div>
            </div>
          </div>
          <div className="p-4 border-t space-y-2">
            <Button className="w-full h-10" onClick={handleSaveBudget} disabled={!newBudgetTitle.trim() || !newBudgetExpected}>
              {editingExpense ? 'Save Changes' : 'Add Budget Item'}
            </Button>
            {editingExpense && (
              <Button variant="ghost" className="w-full h-10 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => { handleDeleteExpense(editingExpense.id); setShowBudgetForm(false); }}>Delete</Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
