import { Link } from 'react-router-dom'
import { 
  CheckSquare, 
  DollarSign, 
  Calendar, 
  FileText, 
  Bell,
  AlertCircle,
  Clock,
  Plus,
  Store
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { VendorMarketRow } from '@/components/VendorMarketRow'
import { useAuthStore } from '@/features/auth/authStore'
import { useApplications } from '@/features/applications/hooks/useApplications'
import { useTodos } from '@/features/tracking/hooks/useTodos'
import { useExpenses } from '@/features/tracking/hooks/useExpenses'
import { useNotificationsStore } from '@/features/notifications/notificationsStore'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import { cn } from '@/utils/cn'

export function VendorDashboardPage() {
  const { user } = useAuthStore()
  const { applications, isLoading: applicationsLoading } = useApplications()
  const { todos, isLoading: todosLoading } = useTodos()
  const { expenses, isLoading: expensesLoading } = useExpenses()
  const { notifications, unreadCount } = useNotificationsStore()
  
  // Mock tracked markets for demo - in real app this would come from API
  const trackedMarkets = [
    {
      id: 'market-1',
      name: 'Downtown Farmers Market',
      description: 'Weekly farmers market in the heart of downtown',
      category: 'farmers-market' as const,
      promoterId: 'promoter-1',
      promoter: { 
        id: 'promoter-1', 
        firstName: 'Sarah', 
        lastName: 'Johnson', 
        email: 'sarah@example.com', 
        role: 'promoter' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        isEmailVerified: true,
        isActive: true
      },
      location: { address: '123 Main St', city: 'Springfield', state: 'IL', zipCode: '62701', country: 'USA' },
      schedule: [{ id: '1', dayOfWeek: 6, startTime: '08:00', endTime: '14:00', startDate: '2024-01-06', endDate: '2024-12-31', isRecurring: true }],
      status: 'active' as const,
      marketType: 'promoter-managed' as const,
      applicationStatus: 'under-review' as const,
      images: ['/api/placeholder/400/200'],
      tags: ['local', 'organic', 'fresh'],
      accessibility: { wheelchairAccessible: true, parkingAvailable: true, restroomsAvailable: true, familyFriendly: true, petFriendly: true },
      contact: { phone: '(555) 123-4567' },
      applicationFields: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'market-2',
      name: 'Artisan Craft Fair',
      description: 'Monthly craft fair featuring local artisans',
      category: 'craft-show' as const,
      location: { address: '456 Oak Ave', city: 'Springfield', state: 'IL', zipCode: '62702', country: 'USA' },
      schedule: [{ id: '2', dayOfWeek: 0, startTime: '10:00', endTime: '16:00', startDate: '2024-02-04', endDate: '2024-02-04', isRecurring: false }],
      status: 'active' as const,
      marketType: 'user-created' as const,
      images: ['/api/placeholder/400/200'],
      tags: ['handmade', 'artisan', 'crafts'],
      accessibility: { wheelchairAccessible: false, parkingAvailable: true, restroomsAvailable: true, familyFriendly: true, petFriendly: false },
      contact: {},
      applicationFields: [],
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  ]
  
  // Mock tracking data for each market
  const trackingData = {
    'market-1': {
      id: 'track-1',
      userId: user?.id || '',
      marketId: 'market-1',
      status: 'applied' as const,
      notes: 'Excited to participate!',
      todoCount: 3,
      todoProgress: 66,
      totalExpenses: 150,
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z'
    },
    'market-2': {
      id: 'track-2',
      userId: user?.id || '',
      marketId: 'market-2',
      status: 'interested' as const,
      todoCount: 1,
      todoProgress: 25,
      totalExpenses: 0,
      createdAt: '2024-01-18T00:00:00Z',
      updatedAt: '2024-01-18T00:00:00Z'
    }
  }

  // Get recent activity
  const recentApplications = applications.slice(0, 3)
  const recentTodos = todos.filter(todo => !todo.completed).slice(0, 3)
  const recentExpenses = expenses.slice(0, 3)
  const recentNotifications = notifications.slice(0, 5)

  // Calculate stats
  const stats = {
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'under-review').length,
    approvedApplications: applications.filter(app => app.status === 'approved').length,
    totalTodos: todos.length,
    completedTodos: todos.filter(todo => todo.completed).length,
    overdueTodos: todos.filter(todo => 
      !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date()
    ).length,
    totalExpenses: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    thisMonthExpenses: expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      const now = new Date()
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear()
    }).reduce((sum, expense) => sum + expense.amount, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (applicationsLoading || todosLoading || expensesLoading) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your market business
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Bell className="w-3 h-3" />
              {unreadCount} new
            </Badge>
          )}
          <Link to="/markets">
            <Button variant="outline" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Find a Market
            </Button>
          </Link>
          <Link to="/vendor/add-market">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Market
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Applications</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalApplications}</p>
              <p className="text-xs text-muted-foreground">
                {stats.pendingApplications} pending
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Todos</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalTodos}</p>
              <p className="text-xs text-muted-foreground">
                {stats.completedTodos} completed
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalExpenses)}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.thisMonthExpenses)} this month
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Markets</p>
              <p className="text-2xl font-bold text-foreground">{stats.approvedApplications}</p>
              <p className="text-xs text-muted-foreground">
                approved
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* My Markets Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Store className="w-5 h-5" />
            My Markets
          </h2>
          <Link to="/markets">
            <Button variant="ghost" size="sm">Browse Markets</Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {trackedMarkets.map((market) => (
            <VendorMarketRow
              key={market.id}
              market={market}
              tracking={trackingData[market.id as keyof typeof trackingData]}
              todos={[
                { id: '1', title: 'Prepare booth setup', completed: true, priority: 'high' },
                { id: '2', title: 'Order business cards', completed: false, priority: 'medium' },
                { id: '3', title: 'Pack display materials', completed: false, priority: 'low' }
              ]}
              expenses={[
                { id: '1', title: 'Booth fee', amount: 50, category: 'booth-fee', date: '2024-01-15' },
                { id: '2', title: 'Gas & parking', amount: 25, category: 'transportation', date: '2024-01-15' },
                { id: '3', title: 'Business cards', amount: 15, category: 'marketing', date: '2024-01-10' }
              ]}
              onUpdateStatus={(marketId, status) => {
                console.log('Update status:', marketId, status)
                // TODO: Implement status update
              }}
              onCreateTodo={(marketId) => {
                console.log('Create todo for:', marketId)
                // TODO: Navigate to todo creation
              }}
              onAddExpense={(marketId) => {
                console.log('Add expense for:', marketId)
                // TODO: Navigate to expense creation
              }}
              onCompleteTodo={(todoId) => {
                console.log('Complete todo:', todoId)
                // TODO: Implement todo completion
              }}
            />
          ))}
        </div>
        
        {trackedMarkets.length === 0 && (
          <div className="text-center py-8">
            <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No markets tracked yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking markets to get organized and plan your participation
            </p>
            <Link to="/markets">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Browse Markets
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/vendor/todos" className="group">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 group-hover:bg-accent/10">
              <CheckSquare className="w-6 h-6" />
              <span className="text-sm">Manage Todos</span>
            </Button>
          </Link>
          <Link to="/vendor/expenses" className="group">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 group-hover:bg-accent/10">
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Track Expenses</span>
            </Button>
          </Link>
          <Link to="/vendor/calendar" className="group">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 group-hover:bg-accent/10">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">View Calendar</span>
            </Button>
          </Link>
          <Link to="/notifications" className="group">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 group-hover:bg-accent/10 relative">
              <Bell className="w-6 h-6" />
              <span className="text-sm">Notifications</span>
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Applications</h2>
            <Link to="/vendor/applications">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentApplications.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No applications yet</p>
            ) : (
              recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{application.market.name}</p>
                    <p className="text-sm text-muted-foreground">{application.vendor.firstName} {application.vendor.lastName}</p>
                  </div>
                  <Badge 
                    variant={
                      application.status === 'approved' ? 'success' :
                      application.status === 'rejected' ? 'destructive' : 'outline'
                    }
                  >
                    {application.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Todos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Tasks</h2>
            <Link to="/vendor/todos">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentTodos.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No pending tasks</p>
            ) : (
              recentTodos.map((todo) => (
                <div key={todo.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{todo.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {todo.dueDate ? (
                        new Date(todo.dueDate) < new Date() ? (
                          <span className="text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Overdue
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due {new Date(todo.dueDate).toLocaleDateString()}
                          </span>
                        )
                      ) : (
                        'No due date'
                      )}
                    </p>
                  </div>
                  <Badge variant={
                    todo.priority === 'urgent' ? 'destructive' :
                    todo.priority === 'high' ? 'default' : 'outline'
                  }>
                    {todo.priority}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Expenses & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Expenses</h2>
            <Link to="/vendor/expenses">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentExpenses.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No expenses recorded</p>
            ) : (
              recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{expense.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{formatCurrency(expense.amount)}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {expense.category.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Notifications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Notifications</h2>
            <Link to="/notifications">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentNotifications.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No notifications</p>
            ) : (
              recentNotifications.map((notification: any) => (
                <div key={notification.id} className={cn(
                  "p-3 border rounded-lg",
                  !notification.read && "bg-blue-50 border-l-4 border-l-blue-500"
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}