import { Link } from 'react-router-dom'
import { 
  CheckSquare, 
  DollarSign, 
  Calendar, 
  FileText, 
  Bell,
  AlertCircle,
  Clock,
  Plus
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/features/auth/authStore'
import { useApplications } from '@/features/applications/hooks/useApplications'
import { useTodos } from '@/features/tracking/hooks/useTodos'
import { useExpenses } from '@/features/tracking/hooks/useExpenses'
import { useNotificationsStore } from '@/features/notifications/notificationsStore'
import { cn } from '@/utils/cn'

export function VendorDashboardPage() {
  const { user } = useAuthStore()
  const { applications, isLoading: applicationsLoading } = useApplications()
  const { todos, isLoading: todosLoading } = useTodos()
  const { expenses, isLoading: expensesLoading } = useExpenses()
  const { notifications, unreadCount } = useNotificationsStore()

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
          <Link to="/vendor/applications">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Application
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