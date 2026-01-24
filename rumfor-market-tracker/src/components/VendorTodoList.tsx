import React, { useState } from 'react'
import { useTodos } from '@/features/tracking/hooks/useTodos'
import { Todo, TodoPriority } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/utils/cn'
import { Plus, BookOpen, ChevronLeft, MoreVertical, Trash2, Edit2, Check, Clock, AlertTriangle } from 'lucide-react'

interface VendorTodoListProps {
  marketId: string
  className?: string
}

const categories = [
  { id: 'setup', label: 'Setup', icon: '📦' },
  { id: 'products', label: 'Products', icon: '🛒' },
  { id: 'marketing', label: 'Marketing', icon: '📣' },
  { id: 'logistics', label: 'Logistics', icon: '🚚' },
  { id: 'post-event', label: 'Post-event', icon: '🎉' },
  { id: 'misc', label: 'Misc', icon: '📋' }
]

const systemPresets: Record<string, string[]> = {
  setup: ['Complete vendor application', 'Review market rules', 'Design booth layout', 'Obtain permits', 'Set up payment'],
  products: ['Prepare inventory', 'Price all products', 'Organize display', 'Prepare samples', 'Update descriptions'],
  marketing: ['Create materials', 'Post on social media', 'Design flyers', 'Contact media', 'Update website'],
  logistics: ['Arrange transport', 'Prepare equipment', 'Pack materials', 'Plan booth setup', 'Confirm accommodation'],
  'post-event': ['Clean up area', 'Process payments', 'Follow up customers', 'Review sales', 'Plan next market'],
  misc: ['Take photos', 'Network with vendors', 'Check weather', 'Review feedback', 'Update records']
}

const priorityConfig = {
  urgent: { color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="w-3 h-3" /> },
  high: { color: 'bg-orange-100 text-orange-700', icon: null },
  medium: { color: 'bg-yellow-100 text-yellow-700', icon: null },
  low: { color: 'bg-gray-100 text-gray-600', icon: null }
}

export const VendorTodoList: React.FC<VendorTodoListProps> = ({ marketId, className }) => {
  const { todos, isLoading, error, toggleTodo, deleteTodo, createTodo, updateTodo } = useTodos(marketId)
  const [showPresets, setShowPresets] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newCategory, setNewCategory] = useState('setup')
  const [newPriority, setNewPriority] = useState<TodoPriority>('medium')
  const [newDueDate, setNewDueDate] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const pendingTodos = todos.filter((t: Todo) => !t.completed)
  const completedTodos = todos.filter((t: Todo) => t.completed)
  const overdueCount = pendingTodos.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length

  const handleToggle = async (id: string) => {
    await toggleTodo(id)
    setOpenMenuId(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) {
      await deleteTodo(id)
    }
    setOpenMenuId(null)
  }

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setNewTitle(todo.title)
    setNewDescription(todo.description || '')
    setNewCategory(todo.category)
    setNewPriority(todo.priority)
    setNewDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '')
    setShowForm(true)
    setOpenMenuId(null)
  }

  const handleSave = async () => {
    if (!newTitle.trim()) return

    if (editingTodo) {
      await updateTodo(editingTodo.id, { 
        title: newTitle, 
        description: newDescription, 
        category: newCategory, 
        priority: newPriority,
        dueDate: newDueDate || undefined
      })
    } else {
      createTodo({ 
        title: newTitle, 
        description: newDescription, 
        category: newCategory, 
        priority: newPriority,
        dueDate: newDueDate || undefined
      })
    }
    setShowForm(false)
    setEditingTodo(null)
    setNewTitle('')
    setNewDescription('')
    setNewCategory('setup')
    setNewPriority('medium')
    setNewDueDate('')
  }

  const handleSelectPreset = async (preset: string) => {
    createTodo({ title: preset, category: selectedCategory || 'setup', priority: 'medium' })
    setShowPresets(false)
    setSelectedCategory(null)
  }

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  // Ultra-compact todo item - single line for mobile efficiency
  const TodoCompactItem = ({ todo }: { todo: Todo }) => {
    const days = getDaysUntilDue(todo.dueDate)
    const isOverdue = days !== null && days < 0 && !todo.completed
    const priority = priorityConfig[todo.priority]

    return (
      <div className={cn(
        "flex items-center gap-2 py-2 px-2.5 rounded-lg border bg-surface touch-manipulation min-h-[44px]",
        todo.completed && "bg-muted/30 border-transparent opacity-60",
        isOverdue && "border-red-200 bg-red-50/50"
      )}>
        {/* Checkbox */}
        <button
          onClick={() => handleToggle(todo.id)}
          className={cn(
            "w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all border-2",
            todo.completed
              ? 'bg-accent border-accent text-white'
              : 'border-muted-foreground/40 hover:border-accent bg-white'
          )}
        >
          {todo.completed && <Check className="w-4 h-4" />}
        </button>

        {/* Title and description */}
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

        {/* Due date pill - only show if has due date */}
        {todo.dueDate && (
          <span className={cn(
            "text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded flex-shrink-0",
            isOverdue ? "bg-red-100 text-red-700 font-medium" : "text-foreground font-medium"
          )}>
            <Clock className="w-3 h-3" />
            {isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : new Date(todo.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        )}

        {/* Priority pill - only show if high/urgent */}
        {todo.priority === 'urgent' && (
          <span className={cn(
            "text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded flex-shrink-0",
            priority.color
          )}>
            {priority.icon}
          </span>
        )}

        {/* Actions menu */}
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
  }

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
        <p className="text-red-500 text-sm">Error loading tasks</p>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header - compact, no duplicate "Tasks" since tab says Tasks */}
      <div className="flex items-center justify-between">
        {todos.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {completedTodos.length} / {todos.length}
          </span>
        )}
        <div className="flex gap-1 ml-auto">
          <Button
            size="sm"
            onClick={() => { setEditingTodo(null); setShowForm(true); setNewTitle(''); }}
            className="h-8 px-3"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-red-700 font-medium">{overdueCount} overdue</span>
        </div>
      )}

      {/* Pending Tasks */}
      {pendingTodos.length > 0 && (
        <div className="space-y-1">
          {pendingTodos.map((todo: Todo) => (
            <TodoCompactItem key={todo.id} todo={todo} />
          ))}
        </div>
      )}

      {/* Completed Tasks - collapsible */}
      {completedTodos.length > 0 && (
        <details className="group">
          <summary className="text-sm text-muted-foreground cursor-pointer py-2 list-none flex items-center gap-1 min-h-[44px]">
            <span>{completedTodos.length} completed</span>
            <ChevronLeft className="w-4 h-4 transition-transform group-open:rotate-90" />
          </summary>
          <div className="space-y-1 mt-1 pb-2">
            {completedTodos.map((todo: Todo) => (
              <TodoCompactItem key={todo.id} todo={todo} />
            ))}
          </div>
        </details>
      )}

      {/* Empty State */}
      {todos.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">No tasks yet</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowPresets(true)}
            className="mt-1 text-xs"
          >
            Add from template
          </Button>
        </div>
      )}

      {/* Presets Modal */}
      <Modal 
        isOpen={showPresets} 
        onClose={() => { setShowPresets(false); setSelectedCategory(null); }}
        title={selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.icon} ${categories.find(c => c.id === selectedCategory)?.label}` : 'Templates'}
        showCloseButton={true}
        className="sm:max-w-sm sm:rounded-xl max-w-none max-h-[85vh] m-0 sm:m-auto"
      >
        <div className="h-full flex flex-col">
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1 p-3 -mx-3 text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}

          <div className="flex-1 -mx-4 px-4">
            {!selectedCategory ? (
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-surface hover:bg-surface-2 transition-colors touch-manipulation"
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {systemPresets[selectedCategory]?.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full text-left p-3.5 rounded-xl bg-surface hover:bg-surface-2 text-sm transition-colors touch-manipulation"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Add/Edit Todo Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingTodo ? 'Edit Task' : 'New Task'}
        showCloseButton={true}
        className="sm:max-w-sm sm:rounded-xl max-w-none max-h-[85vh] m-0 sm:m-auto"
      >
        <div className="h-full flex flex-col -mx-4">
          {!editingTodo && (
            <div className="px-4 pb-2 border-b">
              <Button
                size="sm"
                onClick={() => { setShowForm(false); setShowPresets(true); }}
                className="w-full justify-center font-medium h-10"
              >
                Use a Preset Task
              </Button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Task title"
                  className="w-full p-3 text-base border-2 rounded-lg bg-background focus:border-accent outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Add details..."
                  rows={2}
                  className="w-full p-3 border-2 rounded-lg bg-background focus:border-accent outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as TodoPriority)}
                    className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="w-full p-2.5 border-2 rounded-lg bg-background focus:border-accent outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t space-y-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-10"
                onClick={handleSave}
              >
                {editingTodo ? 'Save' : 'Save'}
              </Button>
              {!editingTodo && (
                <Button
                  variant="secondary"
                  className="flex-1 h-10"
                  onClick={() => {
                    if (newTitle.trim()) {
                      createTodo({ title: newTitle, description: newDescription, category: newCategory, priority: newPriority, dueDate: newDueDate || undefined })
                      setNewTitle('')
                      setNewDescription('')
                      setNewCategory('setup')
                      setNewPriority('medium')
                      setNewDueDate('')
                    }
                  }}
                >
                  Quick Add Task
                </Button>
              )}
            </div>

            {editingTodo && (
              <Button
                variant="ghost"
                className="w-full h-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  handleDelete(editingTodo.id)
                  setShowForm(false)
                }}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
