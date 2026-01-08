import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, CardContent, Badge, Input, EmptyState } from '@/components/ui'
import { ArrowLeft, CheckSquare, Plus, Search } from 'lucide-react'

const todoCategories = [
  { value: 'all', label: 'All Categories' },
  { value: 'setup', label: 'Setup' },
  { value: 'products', label: 'Products' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'post-event', label: 'Post Event' },
  { value: 'financial', label: 'Financial' },
  { value: 'travel', label: 'Travel' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'permits', label: 'Permits' },
  { value: 'other', label: 'Other' },
]

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

// Mock todos for demonstration
const mockTodos = [
  { id: '1', title: 'Order booth supplies', category: 'setup', priority: 'high', completed: false, dueDate: '2026-01-15' },
  { id: '2', title: 'Print business cards', category: 'marketing', priority: 'medium', completed: true, dueDate: '2026-01-10' },
  { id: '3', title: 'Check parking availability', category: 'logistics', priority: 'urgent', completed: false, dueDate: '2026-01-08' },
]

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-blue-100 text-blue-800',
  low: 'bg-gray-100 text-gray-800',
}

export function VendorTodosPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showCompleted, setShowCompleted] = useState(true)
  const [todos] = useState(mockTodos)

  // Stats
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    urgent: todos.filter(t => t.priority === 'urgent' && !t.completed).length,
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link 
          to="/vendor/dashboard" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-accent" />
              My To-Do Items
            </h1>
            <p className="text-muted-foreground">
              Track tasks for your upcoming markets and events
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Todo
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-warning">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-destructive">{stats.urgent}</div>
              <div className="text-sm text-muted-foreground">Urgent</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search todos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              >
                {todoCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              >
                {priorityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <Button 
                variant={showCompleted ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                {showCompleted ? 'Hide Completed' : 'Show Completed'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Todo List */}
      <Card>
        <CardContent className="pt-6">
          {todos.length === 0 ? (
            <EmptyState
              icon={<CheckSquare className="w-12 h-12 text-muted-foreground" />}
              title="No todos yet"
              description="Start by creating your first todo item"
              action={<Button><Plus className="h-4 w-4 mr-2" />Create Todo</Button>}
            />
          ) : (
            <div className="space-y-3">
              {todos.map(todo => (
                <div 
                  key={todo.id}
                  className={`flex items-center gap-4 p-4 border border-border rounded-lg transition-colors ${
                    todo.completed ? 'bg-muted/50' : 'bg-background hover:bg-surface/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => {}}
                    className="h-5 w-5 rounded border-border"
                  />
                  <div className="flex-1">
                    <h3 className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {todo.title}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {todo.category}
                      </Badge>
                      <Badge className={`text-xs ${priorityColors[todo.priority]}`}>
                        {todo.priority}
                      </Badge>
                      {todo.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due: {todo.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
