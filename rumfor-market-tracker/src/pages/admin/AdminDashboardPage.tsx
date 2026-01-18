import { startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Store,
  FileText,
  Shield,
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAdmin } from '@/features/admin/hooks/useAdmin'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const {
    stats,
    isLoadingStats,
    fetchAdminStats
  } = useAdmin()



  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of system metrics and activity</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchAdminStats}
          disabled={isLoadingStats}
        >
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
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
                  +{formatNumber(stats.userGrowthRate)}% growth
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
                  {formatNumber(stats.marketplaceActivity)} this month
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
                <p className="text-sm text-yellow-600 flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatNumber(stats.pendingApplications)} pending
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
                <p className="text-sm font-medium text-muted-foreground">Reports</p>
                <p className="text-3xl font-bold">{formatNumber(stats.reportedContent || 0)}</p>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <Shield className="h-4 w-4 mr-1" />
                  Moderation queue
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Admin Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="justify-start" variant="outline" onClick={() => startTransition(() => navigate('/admin/users'))}>
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </Button>
          <Button className="justify-start" variant="outline" onClick={() => startTransition(() => navigate('/admin/markets'))}>
            <Store className="h-4 w-4 mr-2" />
            Review Markets
          </Button>
          <Button className="justify-start" variant="outline" onClick={() => startTransition(() => navigate('/admin/moderation'))}>
            <Shield className="h-4 w-4 mr-2" />
            Moderate Content
          </Button>
          <Button className="justify-start" variant="outline" onClick={() => startTransition(() => navigate('/admin/applications'))}>
            <FileText className="h-4 w-4 mr-2" />
            Process Apps
          </Button>
        </div>
      </Card>
    </div>
  )
}