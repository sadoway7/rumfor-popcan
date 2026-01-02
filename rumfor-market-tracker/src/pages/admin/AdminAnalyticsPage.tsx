import { AdminAnalyticsDashboard } from '@/components/AdminAnalyticsDashboard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAdmin } from '@/features/admin/hooks/useAdmin'
import { BarChart3, TrendingUp, Users, Store, FileText, DollarSign, Download } from 'lucide-react'
import { useState } from 'react'

export function AdminAnalyticsPage() {
  const { stats } = useAdmin()
  const [activeTimeframe, setActiveTimeframe] = useState('30days')

  const analyticsOverview = {
    totalUsers: stats?.totalUsers || 0,
    totalMarkets: stats?.totalMarkets || 0,
    totalApplications: stats?.totalApplications || 0,
    totalRevenue: stats?.totalRevenue || 0,
    userGrowth: '+12.5%',
    applicationSuccess: stats?.applicationSuccessRate || 0,
    marketplaceActivity: stats?.marketplaceActivity || 0,
    systemHealth: stats?.systemHealth || 0
  }

  const topPerformingMarkets = [
    { name: 'Downtown Artisan Fair', applications: 45, revenue: '$2,250', growth: '+15%' },
    { name: 'Farmers Market Central', applications: 38, revenue: '$1,900', growth: '+8%' },
    { name: 'Holiday Craft Show', applications: 32, revenue: '$1,600', growth: '+22%' },
    { name: 'Weekend Flea Market', applications: 28, revenue: '$1,400', growth: '+5%' },
    { name: 'Food Festival 2024', applications: 25, revenue: '$1,250', growth: '+12%' }
  ]

  const userSegmentation = [
    { segment: 'Active Vendors', count: 287, percentage: '23%', trend: '+5%' },
    { segment: 'Regular Visitors', count: 445, percentage: '36%', trend: '+8%' },
    { segment: 'Promoters', count: 89, percentage: '7%', trend: '+12%' },
    { segment: 'One-time Users', count: 429, percentage: '34%', trend: '-2%' }
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const timeframeOptions = [
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: '3months', label: 'Last 3 months' },
    { value: '6months', label: 'Last 6 months' },
    { value: '1year', label: 'Last year' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={activeTimeframe}
            onChange={(e) => setActiveTimeframe(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            {timeframeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold">{formatNumber(analyticsOverview.totalUsers)}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {analyticsOverview.userGrowth}
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
              <p className="text-3xl font-bold">{formatNumber(analyticsOverview.totalMarkets)}</p>
              <p className="text-sm text-muted-foreground flex items-center mt-1">
                <BarChart3 className="h-4 w-4 mr-1" />
                {analyticsOverview.marketplaceActivity} this month
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
              <p className="text-3xl font-bold">{formatNumber(analyticsOverview.totalApplications)}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {analyticsOverview.applicationSuccess}% success rate
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
              <p className="text-3xl font-bold">{formatCurrency(analyticsOverview.totalRevenue)}</p>
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

      {/* Detailed Analytics Dashboard */}
      <AdminAnalyticsDashboard />

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Markets */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Performing Markets</h3>
            <Badge variant="outline">{activeTimeframe}</Badge>
          </div>
          <div className="space-y-3">
            {topPerformingMarkets.map((market, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{market.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {market.applications} applications
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{market.revenue}</div>
                  <Badge variant="default" className="text-xs">
                    {market.growth}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* User Segmentation */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">User Segmentation</h3>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
          <div className="space-y-3">
            {userSegmentation.map((segment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{segment.segment}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatNumber(segment.count)} users ({segment.percentage})
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={segment.trend.startsWith('+') ? 'default' : 'destructive'}>
                    {segment.trend}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Platform Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">System Uptime</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">99.9%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">API Response Time</span>
              <span className="text-sm font-medium">145ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Page Load Time</span>
              <span className="text-sm font-medium">1.2s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Error Rate</span>
              <span className="text-sm font-medium">0.01%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Engagement</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Daily Active Users</span>
              <span className="text-sm font-medium">342 (27.4%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg Session Duration</span>
              <span className="text-sm font-medium">8.5 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Bounce Rate</span>
              <span className="text-sm font-medium">23.1%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Return Users</span>
              <span className="text-sm font-medium">68.5%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Business Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Conversion Rate</span>
              <span className="text-sm font-medium">4.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Customer Lifetime Value</span>
              <span className="text-sm font-medium">$156</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Revenue per User</span>
              <span className="text-sm font-medium">$12.34</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Churn Rate</span>
              <span className="text-sm font-medium">2.1%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}