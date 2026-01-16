import React, { useState } from 'react'
import { Plus, Search, CheckSquare, Clock, AlertCircle } from 'lucide-react'
import { useTodos } from '@/features/tracking/hooks/useTodos'
import { useAuthStore } from '@/features/auth/authStore'
import { Todo, TodoPriority } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { TodoItem } from './TodoItem'
import { TodoForm } from './TodoForm'
import { TodoProgress } from './TodoProgress'
import { TodoTemplates } from './TodoTemplates'
import { cn } from '@/utils/cn'

interface VendorTodoListProps {
  marketId: string
  className?: string
}

type FilterType = 'all' | 'pending' | 'completed' | 'overdue'
type SortType = 'dueDate' | 'priority' | 'created' | 'category'

const priorityOrder: Record<TodoPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1
}

export const VendorTodoList: React.FC<VendorTodoListProps> = React.memo(({
  marketId,
  className
}) => {
  const { user } = useAuthStore()
  const { todos, isLoading, error, createTodo, deleteTodo, toggleTodo } = useTodos(marketId)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('dueDate')
  const [showCompleted, setShowCompleted] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // Filter and sort todos
  const filteredAndSortedTodos = React.useMemo(() => {
    let filtered = todos

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(query) ||
        todo.description?.toLowerCase().includes(query) ||
        todo.category.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    const now = new Date()
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(todo => !todo.completed)
        break
      case 'completed':
        filtered = filtered.filter(todo => todo.completed)
        break
      case 'overdue':
        filtered = filtered.filter(todo =>
          !todo.completed && todo.dueDate && new Date(todo.dueDate) < now
        )
        break
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(todo => todo.category === selectedCategory)
    }

    // Hide completed if toggled off
    if (!showCompleted) {
      filtered = filtered.filter(todo => !todo.completed)
    }

    // Sort todos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case 'priority':
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'category':
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

    return filtered
  }, [todos, searchQuery, filter, sortBy, selectedCategory, showCompleted])

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(todos.map(todo => todo.category)))
    return cats.sort()
  }, [todos])

  // Get stats
  const stats = React.useMemo(() => {
    const now = new Date()
    const total = todos.length
    const completed = todos.filter(todo => todo.completed).length
    const pending = total - completed
    const overdue = todos.filter(todo =>
      !todo.completed && todo.dueDate && new Date(todo.dueDate) < now
    ).length

    return { total, completed, pending, overdue }
  }, [todos])

  const handleCreateTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createTodo(todoData)
      setIsFormOpen(false)
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id)
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  const handleToggleTodo = async (id: string) => {
    try {
      await toggleTodo(id)
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTodo(null)
  }

  const handleTemplateSelect = async (template: string) => {
    // Determine category based on template content
    const lowerTemplate = template.toLowerCase()
    let category = 'setup'
    
    if (lowerTemplate.includes('product') || lowerTemplate.includes('inventory')) {
      category = 'products'
    } else if (lowerTemplate.includes('marketing') || lowerTemplate.includes('social')) {
      category = 'marketing'
    } else if (lowerTemplate.includes('transport') || lowerTemplate.includes('equipment')) {
      category = 'logistics'
    } else if (lowerTemplate.includes('clean') || lowerTemplate.includes('follow')) {
      category = 'post-event'
    }

    await createTodo({
      vendorId: user?.id || '',
      marketId,
      title: template,
      description: `Auto-generated from template`,
      priority: 'medium',
      category,
      completed: false
    })
  }

  if (isLoading) {
    return (
      <Card className={cn("p-8", className)}>
        <div className="flex items-center justify-center">
          <Spinner className="w-6 h-6" />
          <span className="ml-2 text-muted-foreground">Loading todos...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("p-8", className)}>
        <div className="text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Error loading todos: {error}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Market Preparation</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your progress and stay organized for market day
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            Templates
          </Button>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Todo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-semibold text-foreground">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-lg font-semibold text-foreground">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold text-foreground">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-lg font-semibold text-foreground">{stats.overdue}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Templates */}
      {showTemplates && (
        <Card className="p-6">
          <TodoTemplates
            selectedCategory={selectedCategory || undefined}
            onSelectTemplate={handleTemplateSelect}
          />
        </Card>
      )}

      {/* Progress */}
      <TodoProgress todos={todos} />

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search todos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value as FilterType)}
              options={[
                { value: 'all', label: 'All Tasks' },
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
                { value: 'overdue', label: 'Overdue' }
              ]}
            />

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortType)}
              options={[
                { value: 'dueDate', label: 'Due Date' },
                { value: 'priority', label: 'Priority' },
                { value: 'created', label: 'Created' },
                { value: 'category', label: 'Category' }
              ]}
            />

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map(cat => ({ 
                  value: cat, 
                  label: cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')
                }))
              ]}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Todo List */}
      {filteredAndSortedTodos.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<CheckSquare className="w-12 h-12 text-muted-foreground/50" />}
            title="No todos found"
            description={
              searchQuery || filter !== 'all' || selectedCategory
                ? 'Try adjusting your search or filters'
                : 'Start by creating your first todo for market preparation'
            }
            action={
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Todo
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggleTodo}
              onEdit={handleEditTodo}
              onDelete={handleDeleteTodo}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <TodoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleCreateTodo}
        editingTodo={editingTodo}
        marketId={marketId}
      />
    </div>
  )
})