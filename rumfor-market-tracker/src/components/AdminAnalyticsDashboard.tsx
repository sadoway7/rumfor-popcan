import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Store, 
  DollarSign, 
  Activity,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
  FileText,
  CheckCircle
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, SelectOption } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { useAdminAnalytics } from '@/features/admin/hooks/useAdmin'
import { useAdmin } from '@/features/admin/hooks/useAdmin'
import { cn } from '@/utils/cn'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface AdminAnalyticsDashboardProps {
  className?: string
}

export function AdminAnalyticsDashboard({ className }: AdminAnalyticsDashboardProps) {
  const { loadUserAnalytics, loadMarketAnalytics } = useAdminAnalytics()
  const { stats, isLoadingStats } = useAdmin()
  
  const [userAnalytics, setUserAnalytics] = useState<any>(null)
  const [marketAnalytics, setMarketAnalytics] = useState<any>(null)
  const [dateRange, setDateRange] = useState('6months')
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)

  // Chart colors
  const COLORS = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
    indigo: '#6366F1',
    gray: '#6B7280'
  }

  const pieColors = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.danger]

  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true)
    try {
      const [userData, marketData] = await Promise.all([
        loadUserAnalytics({
          start: getDateRangeStart(dateRange),
          end: new Date().toISOString()
        }),
        loadMarketAnalytics({
          start: getDateRangeStart(dateRange),
          end: new Date().toISOString()
        })
      ])
      
      setUserAnalytics(userData)
      setMarketAnalytics(marketData)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const getDateRangeStart = (range: string) => {
    const now = new Date()
    switch (range) {
      case '7days': 
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30days': 
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      case '3months': 
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
      case '6months': 
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString()
      case '1year': 
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString()
      default: 
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  const dateRangeOptions: SelectOption[] = [
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: '3months', label: 'Last 3 months' },
    { value: '6months', label: 'Last 6 months' },
    { value: '1year', label: 'Last year' }
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                System performance and user engagement metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={dateRange}
              onValueChange={setDateRange}
              options={dateRangeOptions}
              className="w-40"
            />
            <Button
              variant="outline"
              onClick={loadAnalytics}
              disabled={isLoadingAnalytics || isLoadingStats}
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', (isLoadingAnalytics || isLoadingStats) && 'animate-spin')} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

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
                  +{formatPercentage(stats.userGrowthRate)} from last month
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
                <p className="text-sm font-medium text-muted-foreground">Total Markets</p>
                <p className="text-3xl font-bold">{formatNumber(stats.totalMarkets)}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{formatNumber(stats.marketplaceActivity)} active this month
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
                  <TrendingUp className="h-4 w-4 mr-1" />
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
                  <Activity className="h-4 w-4 mr-1" />
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

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">User Growth</h3>
            <Badge variant="outline">{dateRange}</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userAnalytics?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatNumber(Number(value)), 'Users']}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Role Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">User Role Distribution</h3>
            <Badge variant="outline">Current</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userAnalytics?.roleDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, percentage }) => `${role}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {userAnalytics?.roleDistribution?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Market Activity</h3>
            <Badge variant="outline">{dateRange}</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketAnalytics?.marketActivity || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke={COLORS.primary} 
                  strokeWidth={2}
                  name="Applications"
                />
                <Line 
                  type="monotone" 
                  dataKey="markets" 
                  stroke={COLORS.secondary} 
                  strokeWidth={2}
                  name="Active Markets"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Market Categories */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Market Categories</h3>
            <Badge variant="outline">Distribution</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketAnalytics?.categoryDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.accent} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">System Health</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Overall Health</span>
              <span className="font-medium">{stats?.systemHealth || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Users</span>
              <span className="font-medium">{formatNumber(stats?.activeUsers || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Pending Applications</span>
              <span className="font-medium">{formatNumber(stats?.pendingApplications || 0)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Content Moderation</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Reported Content</span>
              <span className="font-medium">{formatNumber(stats?.reportedContent || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Moderation Queue</span>
              <span className="font-medium">{formatNumber(stats?.contentModerationQueue || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg. Response Time</span>
              <span className="font-medium">2.4 hours</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Page Load Time</span>
              <span className="font-medium">1.2s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Uptime</span>
              <span className="font-medium">99.9%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">API Response</span>
              <span className="font-medium">145ms</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}