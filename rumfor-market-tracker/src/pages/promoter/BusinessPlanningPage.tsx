import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Calendar,
  CheckSquare,
  DollarSign,
  Target,
  Plus,
  Trash2,
  Clock,
  TrendingUp,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Save
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

interface TodoItem {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: string
  dueDate?: string
  assignedTo?: string
  createdAt: string
}

interface BudgetItem {
  id: string
  category: string
  item: string
  estimatedCost: number
  actualCost?: number
  status: 'planned' | 'committed' | 'paid'
  vendor?: string
  notes?: string
}

interface PlanningSection {
  id: string
  title: string
  icon: React.ElementType
  isCollapsed: boolean
  count?: number
}

// Mock data - in real app this would come from API
const mockTodos: TodoItem[] = [
  {
    id: '1',
    title: 'Secure vending permit',
    description: 'Contact city hall for vending license',
    completed: true,
    priority: 'high',
    category: 'Legal',
    dueDate: '2026-01-20',
    assignedTo: 'John Doe',
    createdAt: '2026-01-01'
  },
  {
    id: '2',
    title: 'Book entertainment act',
    description: 'Contact local musicians for performance',
    completed: false,
    priority: 'high',
    category: 'Entertainment',
    dueDate: '2026-01-25',
    createdAt: '2026-01-05'
  },
  {
    id: '3',
    title: 'Design marketing flyers',
    description: 'Create eye-catching promotional materials',
    completed: false,
    priority: 'medium',
    category: 'Marketing',
    dueDate: '2026-01-28',
    createdAt: '2026-01-08'
  }
]

const mockBudget: BudgetItem[] = [
  {
    id: '1',
    category: 'Facilities',
    item: 'Table rental',
    estimatedCost: 150,
    actualCost: 150,
    status: 'paid',
    vendor: 'City Event Services'
  },
  {
    id: '2',
    category: 'Entertainment',
    item: 'Music act',
    estimatedCost: 800,
    status: 'committed',
    vendor: 'Bluegrass Band'
  },
  {
    id: '3',
    category: 'Marketing',
    item: 'Flyers and posters',
    estimatedCost: 300,
    status: 'planned'
  }
]

export function BusinessPlanningPage() {
  const { marketId } = useParams<{ marketId: string }>()
  const { markets } = useMarkets()
  const { addToast } = useToast()

  const [todos, setTodos] = useState<TodoItem[]>(mockTodos)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(mockBudget)
  const [sections, setSections] = useState<PlanningSection[]>([
    { id: 'overview', title: 'Market Overview', icon: Target, isCollapsed: false },
    { id: 'tasks', title: 'Task Management', icon: CheckSquare, isCollapsed: false },
    { id: 'budget', title: 'Budget Planning', icon: DollarSign, isCollapsed: false },
    { id: 'timeline', title: 'Project Timeline', icon: Calendar, isCollapsed: true },
    { id: 'performance', title: 'Performance Tracking', icon: BarChart3, isCollapsed: true }
  ])

  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    dueDate: '',
    assignedTo: ''
  })

  const [newBudgetItem, setNewBudgetItem] = useState({
    category: '',
    item: '',
    estimatedCost: 0,
    vendor: '',
    notes: ''
  })

  // Find the current market
  const currentMarket = useMemo(() => {
    return markets.find(market => market.id === marketId)
  }, [markets, marketId])

  // Calculate planning metrics
  const planningMetrics = useMemo(() => {
    const totalTasks = todos.length
    const completedTasks = todos.filter(t => t.completed).length
    const highPriority = todos.filter(t => t.priority === 'high').length
    const overdueTasks = todos.filter(t =>
      t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
    ).length

    const totalBudget = budgetItems.reduce((sum, item) => sum + item.estimatedCost, 0)
    const actualSpending = budgetItems.reduce((sum, item) => sum + (item.actualCost || 0), 0)
    const committedBudget = budgetItems
      .filter(item => item.status === 'committed' || item.status === 'paid')
      .reduce((sum, item) => sum + item.estimatedCost, 0)

    return {
      tasksCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      totalTasks,
      completedTasks,
      highPriority,
      overdueTasks,
      totalBudget,
      actualSpending,
      committedBudget,
      budgetUtilizationRate: totalBudget > 0 ? (actualSpending / totalBudget) * 100 : 0
    }
  }, [todos, budgetItems])

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, isCollapsed: !section.isCollapsed }
        : section
    ))
  }

  const addTodo = () => {
    if (!newTodo.title.trim()) return

    const todo: TodoItem = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description,
      completed: false,
      priority: newTodo.priority,
      category: newTodo.category || 'General',
      dueDate: newTodo.dueDate || undefined,
      assignedTo: newTodo.assignedTo || undefined,
      createdAt: new Date().toISOString().split('T')[0]
    }

    setTodos([...todos, todo])
    setNewTodo({
      title: '',
      description: '',
      priority: 'medium' as 'low' | 'medium' | 'high',
      category: '',
      dueDate: '',
      assignedTo: ''
    })
    addToast({
      title: 'Task Added',
      description: `"${todo.title}" has been added to your planning list`,
      variant: 'success'
    })
  }

  const toggleTodo = (todoId: string) => {
    setTodos(todos.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (todoId: string) => {
    setTodos(todos.filter(todo => todo.id !== todoId))
    addToast({
      title: 'Task Removed',
      description: 'Task has been deleted from your planning list',
      variant: 'success'
    })
  }

  const addBudgetItem = () => {
    if (!newBudgetItem.item.trim() || newBudgetItem.estimatedCost <= 0) return

    const budgetItem: BudgetItem = {
      id: Date.now().toString(),
      category: newBudgetItem.category || 'General',
      item: newBudgetItem.item,
      estimatedCost: newBudgetItem.estimatedCost,
      status: 'planned',
      vendor: newBudgetItem.vendor || undefined,
      notes: newBudgetItem.notes || undefined
    }

    setBudgetItems([...budgetItems, budgetItem])
    setNewBudgetItem({
      category: '',
      item: '',
      estimatedCost: 0,
      vendor: '',
      notes: ''
    })
    addToast({
      title: 'Budget Item Added',
      description: `${budgetItem.item} has been added to your budget`,
      variant: 'success'
    })
  }

  const updateBudgetStatus = (itemId: string, status: BudgetItem['status'], actualCost?: number) => {
    setBudgetItems(budgetItems.map(item =>
      item.id === itemId
        ? { ...item, status, actualCost: actualCost !== undefined ? actualCost : item.actualCost }
        : item
    ))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200'
      case 'committed': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!currentMarket) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading market planning...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {currentMarket.name} - Business Planning
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive planning workspace for your market event
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/promoter/markets/${marketId}`}>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              View Market
            </Button>
          </Link>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Plan
          </Button>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
              <p className="text-2xl font-bold text-foreground">
                {planningMetrics.completedTasks}/{planningMetrics.totalTasks}
              </p>
              <Progress
                value={planningMetrics.tasksCompletionRate}
                className="mt-2 h-2"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget Usage</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(planningMetrics.actualSpending)}
              </p>
              <p className="text-xs text-muted-foreground">
                of {formatCurrency(planningMetrics.totalBudget)} planned
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High Priority Tasks</p>
              <p className="text-2xl font-bold text-foreground">
                {planningMetrics.highPriority}
              </p>
              {planningMetrics.overdueTasks > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {planningMetrics.overdueTasks} overdue
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget Utilization</p>
              <p className="text-2xl font-bold text-foreground">
                {planningMetrics.budgetUtilizationRate.toFixed(1)}%
              </p>
              <Progress
                value={planningMetrics.budgetUtilizationRate}
                className="mt-2 h-2"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Planning Sections */}
      <div className="space-y-4">
        {sections.map(section => (
          <Card key={section.id} className="overflow-hidden">
            <div
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center gap-3">
                <section.icon className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">{section.title}</h2>
                {section.count && (
                  <Badge variant="outline">{section.count}</Badge>
                )}
              </div>
              <Button variant="ghost" size="sm">
                {section.isCollapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
            </div>

            {!section.isCollapsed && (
              <div className="px-6 pb-6">
                {section.id === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">Market Details</h3>
                      <p className="text-sm text-muted-foreground">
                        <strong>Name:</strong> {currentMarket.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Category:</strong> {currentMarket.category}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Location:</strong> {currentMarket.location.city}, {currentMarket.location.state}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">Schedule</h3>
                      {currentMarket.schedule.length > 0 ? (
                        <div className="text-sm text-muted-foreground">
                          <p><strong>Type:</strong> {currentMarket.schedule[0].isRecurring ? 'Recurring' : 'One-time'}</p>
                          <p><strong>Date:</strong> {formatDate(currentMarket.schedule[0].startDate)}</p>
                          <p><strong>Time:</strong> {currentMarket.schedule[0].startTime} - {currentMarket.schedule[0].endTime}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No schedule set</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">Planning Status</h3>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Tasks: {planningMetrics.tasksCompletionRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Budget: {planningMetrics.budgetUtilizationRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {section.id === 'tasks' && (
                  <div className="space-y-4">
                    {/* Add New Task */}
                    <Card className="p-4 border-dashed">
                      <h3 className="font-medium mb-3">Add New Task</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <Input
                          placeholder="Task title"
                          value={newTodo.title}
                          onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                        />
                        <Select
                          placeholder="Priority"
                          value={newTodo.priority}
                          onValueChange={(value) =>
                            setNewTodo({...newTodo, priority: value as 'low' | 'medium' | 'high'})
                          }
                          options={[
                            { value: 'low', label: 'Low' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'high', label: 'High' }
                          ]}
                        />
                        <Input
                          placeholder="Category"
                          value={newTodo.category}
                          onChange={(e) => setNewTodo({...newTodo, category: e.target.value})}
                        />
                        <Input
                          type="date"
                          placeholder="Due date"
                          value={newTodo.dueDate}
                          onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <Textarea
                          placeholder="Task description (optional)"
                          value={newTodo.description}
                          onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                          className="flex-1 mr-4"
                          rows={2}
                        />
                        <Button onClick={addTodo} className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Task
                        </Button>
                      </div>
                    </Card>

                    {/* Task List */}
                    <div className="space-y-2">
                      <h3 className="font-medium">Task List ({todos.length})</h3>
                      {todos.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No tasks yet. Add your first task above!
                        </p>
                      ) : (
                        todos.map(todo => (
                          <Card key={todo.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTodo(todo.id)}
                                  className="mt-0.5 h-6 w-6 p-0"
                                >
                                  {todo.completed ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                                  )}
                                </Button>
                                <div className="flex-1">
                                  <div className={cn(
                                    'font-medium',
                                    todo.completed && 'line-through text-muted-foreground'
                                  )}>
                                    {todo.title}
                                  </div>
                                  {todo.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {todo.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className={getPriorityColor(todo.priority)}>
                                      {todo.priority}
                                    </Badge>
                                    <Badge variant="outline">{todo.category}</Badge>
                                    {todo.dueDate && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Due {formatDate(todo.dueDate)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTodo(todo.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {section.id === 'budget' && (
                  <div className="space-y-4">
                    {/* Add Budget Item */}
                    <Card className="p-4 border-dashed">
                      <h3 className="font-medium mb-3">Add Budget Item</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <Input
                          placeholder="Category"
                          value={newBudgetItem.category}
                          onChange={(e) => setNewBudgetItem({...newBudgetItem, category: e.target.value})}
                        />
                        <Input
                          placeholder="Item description"
                          value={newBudgetItem.item}
                          onChange={(e) => setNewBudgetItem({...newBudgetItem, item: e.target.value})}
                        />
                        <Input
                          type="number"
                          placeholder="Estimated cost"
                          value={newBudgetItem.estimatedCost || ''}
                          onChange={(e) => setNewBudgetItem({...newBudgetItem, estimatedCost: parseFloat(e.target.value) || 0})}
                        />
                        <Input
                          placeholder="Vendor"
                          value={newBudgetItem.vendor}
                          onChange={(e) => setNewBudgetItem({...newBudgetItem, vendor: e.target.value})}
                        />
                      </div>
                      <div className="flex justify-between items-end">
                        <Textarea
                          placeholder="Notes (optional)"
                          value={newBudgetItem.notes}
                          onChange={(e) => setNewBudgetItem({...newBudgetItem, notes: e.target.value})}
                          className="flex-1 mr-4"
                          rows={2}
                        />
                        <Button onClick={addBudgetItem} className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Item
                        </Button>
                      </div>
                    </Card>

                    {/* Budget Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Budget</span>
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(planningMetrics.totalBudget)}
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Spent/Committed</span>
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(planningMetrics.committedBudget)}
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Actual Spending</span>
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(planningMetrics.actualSpending)}
                        </div>
                      </Card>
                    </div>

                    {/* Budget Items List */}
                    <div className="space-y-2">
                      <h3 className="font-medium">Budget Items ({budgetItems.length})</h3>
                      {budgetItems.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No budget items yet. Add your first item above!
                        </p>
                      ) : (
                        budgetItems.map(item => (
                          <Card key={item.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-medium">{item.item}</h4>
                                  <Badge variant="outline">{item.category}</Badge>
                                  <Badge className={getStatusColor(item.status)}>
                                    {item.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  {item.vendor && <p>Vendor: {item.vendor}</p>}
                                  <div className="flex items-center gap-4">
                                    <span>Estimated: {formatCurrency(item.estimatedCost)}</span>
                                    {item.actualCost && (
                                      <span>Actual: {formatCurrency(item.actualCost)}</span>
                                    )}
                                  </div>
                                  {item.notes && <p>Notes: {item.notes}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={item.status}
                                  onValueChange={(value) =>
                                    updateBudgetStatus(item.id, value as BudgetItem['status'])
                                  }
                                  options={[
                                    { value: 'planned', label: 'Planned' },
                                    { value: 'committed', label: 'Committed' },
                                    { value: 'paid', label: 'Paid' }
                                  ]}
                                />
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {section.id === 'timeline' && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Timeline View</h3>
                    <p className="text-muted-foreground">
                      Interactive timeline visualization coming soon. This will show task deadlines,
                      budget commitments, and key milestones for your market event.
                    </p>
                  </div>
                )}

                {section.id === 'performance' && (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Performance Analytics</h3>
                    <p className="text-muted-foreground">
                      Advanced analytics dashboard coming soon. Track planning efficiency,
                      budget accuracy, and success metrics for your market events.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}