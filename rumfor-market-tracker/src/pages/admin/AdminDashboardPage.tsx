import { useEffect } from 'react'
import { 
  BarChart3, 
  Users, 
  Store, 
  FileText, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  DollarSign,
  Eye,
  Flag
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AdminUserTable } from '@/components/AdminUserTable'
import { AdminModerationQueue } from '@/components/AdminModerationQueue'
import { AdminPromoterVerification } from '@/components/AdminPromoterVerification'
import { useAdmin } from '@/features/admin/hooks/useAdmin'
import { cn } from '@/utils/cn'

export function AdminDashboardPage() {
  const { 
    stats, 
    isLoadingStats, 
    fetchAdminStats
  } = useAdmin()

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  // Recent activity data (mock)
  const recentActivities = [
    {
      id: '1',
      type: 'user_registered',
      message: 'New vendor registered: Sarah Johnson',
      timestamp: '2 minutes ago',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      id: '2',
      type: 'market_created',
      message: 'New market created: Downtown Artisan Fair',
      timestamp: '15 minutes ago',
      icon: Store,
      color: 'text-green-500'
    },
    {
      id: '3',
      type: 'application_submitted',
      message: 'Application submitted for Spring Market 2024',
      timestamp: '1 hour ago',
      icon: FileText,
      color: 'text-yellow-500'
    },
    {
      id: '4',
      type: 'content_reported',
      message: 'Comment reported for inappropriate content',
      timestamp: '2 hours ago',
      icon: Flag,
      color: 'text-red-500'
    },
    {
      id: '5',
      type: 'verification_submitted',
      message: 'Promoter verification submitted by Mike Chen',
      timestamp: '3 hours ago',
      icon: Shield,
      color: 'text-purple-500'
    }
  ]

  const pendingTasks = [
    {
      id: '1',
      title: 'Review Reported Content',
      description: '8 items in moderation queue',
      priority: 'high',
      count: 8,
      link: '/admin/moderation'
    },
    {
      id: '2',
      title: 'Promoter Verifications',
      description: '3 applications pending review',
      priority: 'medium',
      count: 3,
      link: '/admin/verifications'
    },
    {
      id: '3',
      title: 'User Support Tickets',
      description: '5 tickets awaiting response',
      priority: 'medium',
      count: 5,
      link: '/admin/support'
    },
    {
      id: '4',
      title: 'System Health Check',
      description: 'Weekly maintenance due',
      priority: 'low',
      count: 1,
      link: '/admin/system'
    }
  ]

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High</Badge>
      case 'medium': return <Badge variant="warning">Medium</Badge>
      case 'low': return <Badge variant="outline">Low</Badge>
      default: return <Badge variant="muted">{priority}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of system health and key metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchAdminStats}
            disabled={isLoadingStats}
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button>
            <Eye className="h-4 w-4 mr-2" />
            View Full Analytics
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{formatNumber(stats.totalUsers)}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{formatPercentage(stats.userGrowthRate)} growth
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Markets</p>
                <p className="text-3xl font-bold">{formatNumber(stats.totalMarkets)}</p>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <Activity className="h-4 w-4 mr-1" />
                  {stats.marketplaceActivity} this month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Store className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Applications</p>
                <p className="text-3xl font-bold">{formatNumber(stats.totalApplications)}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {formatPercentage(stats.applicationSuccessRate)} success rate
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Platform fees
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-xl font-bold">{formatNumber(stats?.activeUsers || 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Apps</p>
              <p className="text-xl font-bold">{formatNumber(stats?.pendingApplications || 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Flag className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reports</p>
              <p className="text-xl font-bold">{formatNumber(stats?.reportedContent || 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">System Health</p>
              <p className="text-xl font-bold">{stats?.systemHealth || 0}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Pending Tasks & Recent Activity */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pending Tasks</h3>
              <Badge variant="outline">{pendingTasks.length} tasks</Badge>
            </div>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{task.title}</span>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-lg font-bold">{task.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg bg-muted', activity.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Middle Column - Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-3" />
              Manage Users
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Shield className="h-4 w-4 mr-3" />
              Moderate Content
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Store className="h-4 w-4 mr-3" />
              Review Markets
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-3" />
              Process Applications
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="h-4 w-4 mr-3" />
              View Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <AlertTriangle className="h-4 w-4 mr-3" />
              System Health
            </Button>
          </div>
        </Card>

        {/* Right Column - System Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Overall Health</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Services</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Service</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">Slow</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">File Storage</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Available</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-3">Today's Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>New Registrations</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span>Applications Submitted</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span>Content Reported</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span>Support Tickets</span>
                <span className="font-medium">5</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Access Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <AdminUserTable className="h-96" />
        
        {/* Recent Moderation Items */}
        <AdminModerationQueue className="h-96" />
      </div>

      {/* Promoter Verifications */}
      <AdminPromoterVerification />
    </div>
  )
}