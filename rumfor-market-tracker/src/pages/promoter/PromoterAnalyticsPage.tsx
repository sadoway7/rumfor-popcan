import { useState, useMemo } from 'react'
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Activity,
  Download,
  RefreshCw,
  FileText,
  CheckCircle,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, SelectOption } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import { useApplications } from '@/features/applications/hooks/useApplications'
import { useAuthStore } from '@/features/auth/authStore'
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

export function PromoterAnalyticsPage() {
  const { user } = useAuthStore()
  const { markets } = useMarkets()
  const { applications } = useApplications()
  const [dateRange, setDateRange] = useState('6months')
  const [selectedMarket, setSelectedMarket] = useState<string>('')

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

  const pieColors = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.danger, COLORS.purple, COLORS.pink]

  // Filter markets created by current promoter
  const myMarkets = useMemo(() => {
    return markets.filter(market => market.promoterId === user?.id)
  }, [markets, user?.id])

  const myMarketIds = useMemo(() => {
    return myMarkets.map(market => market.id)
  }, [myMarkets])

  // Get applications for promoter's markets
  const promoterApplications = useMemo(() => {
    return applications.filter(app => myMarketIds.includes(app.marketId))
  }, [applications, myMarketIds])

  // Filter by selected market if any
  const filteredApplications = useMemo(() => {
    if (!selectedMarket) return promoterApplications
    return promoterApplications.filter(app => app.marketId === selectedMarket)
  }, [promoterApplications, selectedMarket])

  // Mock analytics data - in real app this would come from API
  const analyticsData = useMemo(() => {
    const now = new Date()
    const months = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        applications: Math.floor(Math.random() * 50) + 20,
        approvals: Math.floor(Math.random() * 30) + 10,
        revenue: Math.floor(Math.random() * 5000) + 2000,
        vendors: Math.floor(Math.random() * 20) + 15,
        attendance: Math.floor(Math.random() * 1000) + 500
      })
    }
    
    return months
  }, [])

  // Calculate stats
  const stats = useMemo(() => {
    const totalApplications = filteredApplications.length
    const approvedApplications = filteredApplications.filter(app => app.status === 'approved').length
    const pendingApplications = filteredApplications.filter(app => 
      app.status === 'submitted' || app.status === 'under-review'
    ).length
    const rejectionRate = totalApplications > 0 ? 
      (filteredApplications.filter(app => app.status === 'rejected').length / totalApplications) * 100 : 0
    
    const averageProcessingTime = 3.2 // Mock average in days
    const totalRevenue = Math.floor(Math.random() * 10000) + 5000 // Mock revenue
    
    return {
      totalApplications,
      approvedApplications,
      pendingApplications,
      rejectionRate,
      averageProcessingTime,
      totalRevenue,
      approvalRate: totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0
    }
  }, [filteredApplications])

  // Market performance data
  const marketPerformance = useMemo(() => {
    return myMarkets.map(market => {
      const marketApps = promoterApplications.filter(app => app.marketId === market.id)
      const approved = marketApps.filter(app => app.status === 'approved').length
      const total = marketApps.length
      
      return {
        name: market.name,
        applications: total,
        approvals: approved,
        approvalRate: total > 0 ? (approved / total) * 100 : 0,
        status: market.status
      }
    })
  }, [myMarkets, promoterApplications])

  // Application status distribution
  const statusDistribution = useMemo(() => {
    const statuses = ['submitted', 'under-review', 'approved', 'rejected', 'withdrawn']
    return statuses.map(status => ({
      status: status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: filteredApplications.filter(app => app.status === status).length,
      percentage: filteredApplications.length > 0 ? 
        (filteredApplications.filter(app => app.status === status).length / filteredApplications.length) * 100 : 0
    }))
  }, [filteredApplications])

  // Vendor engagement metrics
  const vendorEngagement = useMemo(() => {
    const uniqueVendors = new Set(filteredApplications.map(app => app.vendorId)).size
    const returningVendors = filteredApplications.filter(() => {
      // Mock logic for returning vendors
      return Math.random() > 0.7
    }).length
    
    return {
      uniqueVendors,
      returningVendors,
      newVendors: uniqueVendors - returningVendors
    }
  }, [filteredApplications])

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



  const dateRangeOptions: SelectOption[] = [
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: '3months', label: 'Last 3 months' },
    { value: '6months', label: 'Last 6 months' },
    { value: '1year', label: 'Last year' }
  ]

  const marketFilterOptions: SelectOption[] = [
    { value: '', label: 'All Markets' },
    ...myMarkets.map(market => ({
      value: market.id,
      label: market.name
    }))
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Market performance and vendor engagement metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={selectedMarket}
              onValueChange={setSelectedMarket}
              options={marketFilterOptions}
              className="w-48"
              placeholder="Filter by market"
            />
            <Select
              value={dateRange}
              onValueChange={setDateRange}
              options={dateRangeOptions}
              className="w-40"
            />
            <Button
              variant="outline"
              onClick={() => {/* Refresh data */}}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
              <p className="text-3xl font-bold">{formatNumber(stats.totalApplications)}</p>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12% from last month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Approval Rate</p>
              <p className="text-3xl font-bold">{formatPercentage(stats.approvalRate)}</p>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+5% from last month</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processing Time</p>
              <p className="text-3xl font-bold">{stats.averageProcessingTime}d</p>
              <div className="flex items-center mt-1">
                <ArrowDownRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">-0.5 days faster</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8% from last month</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Trends */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Application Trends</h3>
            <Badge variant="outline">{dateRange}</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
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
                  dataKey="approvals" 
                  stroke={COLORS.secondary} 
                  strokeWidth={2}
                  name="Approvals"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Application Status Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Application Status</h3>
            <Badge variant="outline">Current</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${status}: ${percentage.toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusDistribution.map((_, index) => (
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
        {/* Market Performance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Market Performance</h3>
            <Badge variant="outline">Comparison</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications" fill={COLORS.accent} name="Applications" />
                <Bar dataKey="approvals" fill={COLORS.secondary} name="Approvals" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Trends */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Revenue Trends</h3>
            <Badge variant="outline">{dateRange}</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={COLORS.purple}
                  fill={COLORS.purple}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Vendor Engagement</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Unique Vendors</span>
              <span className="font-medium">{vendorEngagement.uniqueVendors}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">New Vendors</span>
              <span className="font-medium">{vendorEngagement.newVendors}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Returning Vendors</span>
              <span className="font-medium">{vendorEngagement.returningVendors}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Retention Rate</span>
              <span className="font-medium">
                {vendorEngagement.uniqueVendors > 0 ? 
                  formatPercentage((vendorEngagement.returningVendors / vendorEngagement.uniqueVendors) * 100) : 
                  '0%'
                }
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Performance Metrics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Approval Rate</span>
              <span className="font-medium">{formatPercentage(stats.approvalRate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Rejection Rate</span>
              <span className="font-medium">{formatPercentage(stats.rejectionRate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Pending Review</span>
              <span className="font-medium">{stats.pendingApplications}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg. Processing</span>
              <span className="font-medium">{stats.averageProcessingTime} days</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Market Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Markets</span>
              <span className="font-medium">{myMarkets.filter(m => m.status === 'active').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Markets</span>
              <span className="font-medium">{myMarkets.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">This Month's Apps</span>
              <span className="font-medium">
                {filteredApplications.filter(app => {
                  const appDate = new Date(app.createdAt)
                  const now = new Date()
                  return appDate.getMonth() === now.getMonth() && 
                         appDate.getFullYear() === now.getFullYear()
                }).length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Growth Rate</span>
              <span className="font-medium text-green-600">+15%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">5 applications approved</p>
                <p className="text-sm text-muted-foreground">Across 3 markets</p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">2 hours ago</span>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">3 new applications submitted</p>
                <p className="text-sm text-muted-foreground">Pending review</p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">4 hours ago</span>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Market schedule updated</p>
                <p className="text-sm text-muted-foreground">Summer Market 2024</p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">1 day ago</span>
          </div>
        </div>
      </Card>
    </div>
  )
}