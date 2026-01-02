import { AdminUserTable } from '@/components/AdminUserTable'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAdmin } from '@/features/admin/hooks/useAdmin'
import { Users, UserPlus, Shield, ShieldCheck, UserX, Download, RefreshCw } from 'lucide-react'

export function AdminUsersPage() {
  const { stats } = useAdmin()

  const userStats = {
    total: stats?.totalUsers || 0,
    active: stats?.activeUsers || 0,
    pending: 15,
    verified: 987,
    suspended: 8
  }

  const recentActivity = [
    {
      id: '1',
      action: 'user_registered',
      message: 'New user registered: Sarah Johnson',
      timestamp: '5 minutes ago',
      type: 'success'
    },
    {
      id: '2',
      action: 'user_suspended',
      message: 'User suspended: John Doe',
      timestamp: '1 hour ago',
      type: 'warning'
    },
    {
      id: '3',
      action: 'role_changed',
      message: 'Role changed: Jane Smith → Promoter',
      timestamp: '2 hours ago',
      type: 'info'
    },
    {
      id: '4',
      action: 'user_verified',
      message: 'Email verified: Mike Chen',
      timestamp: '3 hours ago',
      type: 'success'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <ShieldCheck className="h-4 w-4 text-green-500" />
      case 'warning': return <UserX className="h-4 w-4 text-red-500" />
      case 'info': return <Shield className="h-4 w-4 text-blue-500" />
      default: return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'success': return <Badge variant="default">Success</Badge>
      case 'warning': return <Badge variant="warning">Warning</Badge>
      case 'info': return <Badge variant="outline">Info</Badge>
      default: return <Badge variant="muted">Activity</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold">{userStats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <p className="text-3xl font-bold">{userStats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ShieldCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold">{userStats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <RefreshCw className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Verified</p>
              <p className="text-3xl font-bold">{userStats.verified}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Suspended</p>
              <p className="text-3xl font-bold">{userStats.suspended}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <UserPlus className="h-5 w-5" />
            <span>Bulk Invite Users</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>Role Management</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            <span>Email Verification</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <Download className="h-5 w-5" />
            <span>Export Data</span>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Button variant="outline" size="sm">
            View All Activity
          </Button>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getActivityIcon(activity.type)}
                <div>
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
              <div>
                {getActivityBadge(activity.type)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* User Statistics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth Trend</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">This Month</span>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">+142 users</div>
                <Badge variant="default">+12.5%</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Last Month</span>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">+126 users</div>
                <Badge variant="outline">+11.2%</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">This Quarter</span>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">+387 users</div>
                <Badge variant="default">+34.1%</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Engagement</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Daily Active Users</span>
              <div className="text-sm font-medium">342 (27.4%)</div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Weekly Active Users</span>
              <div className="text-sm font-medium">856 (68.5%)</div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Monthly Active Users</span>
              <div className="text-sm font-medium">1,089 (87.1%)</div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Average Session Time</span>
              <div className="text-sm font-medium">8.5 minutes</div>
            </div>
          </div>
        </Card>
      </div>

      {/* User Table */}
      <AdminUserTable />
    </div>
  )
}