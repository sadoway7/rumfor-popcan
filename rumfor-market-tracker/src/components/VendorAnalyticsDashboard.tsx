import React, { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface VendorAnalyticsDashboardProps {
  marketId: string
  marketData: any
  applicationData: any
  className?: string
}

export const VendorAnalyticsDashboard: React.FC<VendorAnalyticsDashboardProps> = ({
  marketId,
  marketData,
  applicationData,
  className
}) => {
  const [timeRange, setTimeRange] = useState('all-time')

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

  // Mock analytics data for this market - in real app this would come from API
  const marketAnalytics = React.useMemo(() => {
    // Generate mock data based on market and application data
    const mockData = []

    // Create trend data for the past 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)

      mockData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        earnings: Math.floor(Math.random() * 2000) + 500,
        attendance: Math.floor(Math.random() * 1000) + 200,
        rating: (Math.random() * 2) + 3, // 3-5 star rating
        sales: Math.floor(Math.random() * 1500) + 300
      })
    }

    return mockData
  }, [marketId])

  // Calculate market-specific stats
  const marketStats = React.useMemo(() => {
    const totalEarnings = marketAnalytics.reduce((sum, month) => sum + month.earnings, 0)
    const avgEarnings = totalEarnings / marketAnalytics.length
    const totalAttendance = marketAnalytics.reduce((sum, month) => sum + month.attendance, 0)
    const avgRating = marketAnalytics.reduce((sum, month) => sum + month.rating, 0) / marketAnalytics.length
    const totalSales = marketAnalytics.reduce((sum, month) => sum + month.sales, 0)

    // Mock comparisons to previous periods
    const earningsChange = Math.random() > 0.5 ? 15 : -5
    const attendanceChange = Math.random() > 0.5 ? 8 : -12

    return {
      totalEarnings,
      avgEarnings,
      totalAttendance,
      avgRating: avgRating.toFixed(1),
      totalSales,
      earningsChange,
      attendanceChange,
      applicationStatus: applicationData?.status || 'pending'
    }
  }, [marketAnalytics, applicationData])

  // Performance by category (mock data)
  const categoryPerformance = React.useMemo(() => {
    const categories = ['Sales', 'Foot Traffic', 'Customer Satisfaction', 'Competition']
    return categories.map(category => ({
      category,
      score: Math.floor(Math.random() * 40) + 60, // 60-100 score
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }))
  }, [marketId])

  // Market comparison data (mock)
  const marketComparison = React.useMemo(() => {
    const similarMarkets = [
      { name: 'Similar Market A', earnings: marketStats.avgEarnings * (Math.random() * 0.4 + 0.8) },
      { name: 'Similar Market B', earnings: marketStats.avgEarnings * (Math.random() * 0.4 + 0.8) },
      { name: 'Your Performance', earnings: marketStats.avgEarnings }
    ]

    return similarMarkets
  }, [marketStats.avgEarnings])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const timeRangeOptions = [
    { value: 'all-time', label: 'All Markets' },
    { value: 'this-year', label: 'This Year' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '3months', label: 'Last 3 Months' }
  ]



  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Performance Analytics</h2>
            <p className="text-sm text-muted-foreground">
              Your performance in {marketData?.name || 'this market'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border border-border rounded-md text-sm"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Earnings</p>
              <p className="text-2xl font-bold">{formatCurrency(marketStats.totalEarnings)}</p>
              <div className="flex items-center mt-1">
                {marketStats.earningsChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={`text-xs ${marketStats.earningsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(marketStats.earningsChange)}% vs last period
                </span>
              </div>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Attendance</p>
              <p className="text-2xl font-bold">{formatNumber(marketStats.totalAttendance / marketAnalytics.length)}</p>
              <div className="flex items-center mt-1">
                {marketStats.attendanceChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={`text-xs ${marketStats.attendanceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(marketStats.attendanceChange)}% vs last period
                </span>
              </div>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer Rating</p>
              <p className="text-2xl font-bold">{marketStats.avgRating} ⭐</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-muted-foreground">Based on {marketAnalytics.length} months</span>
              </div>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <Star className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Application Status</p>
              <div className="mt-1">
                <Badge
                  variant="outline"
                  className={
                    marketStats.applicationStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    marketStats.applicationStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                    marketStats.applicationStatus === 'submitted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
                  }
                >
                  {marketStats.applicationStatus === 'under-review' ? 'Under Review' :
                   marketStats.applicationStatus === 'submitted' ? 'Submitted' :
                   marketStats.applicationStatus.charAt(0).toUpperCase() + marketStats.applicationStatus.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Earnings Trend</h3>
            <Badge variant="outline">{timeRange}</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Earnings']} />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Market Comparison */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Market Comparison</h3>
            <Badge variant="outline">Similar Markets</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Avg Earnings']} />
                <Bar
                  dataKey="earnings"
                  fill={COLORS.primary}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Categories</h3>
          <div className="space-y-4">
            {categoryPerformance.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{item.score}/100</span>
                  {item.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p>Your earnings are trending upward with a <strong>{marketStats.earningsChange > 0 ? '+' : ''}{marketStats.earningsChange}%</strong> change from last period.</p>
            </div>
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p>Customer ratings average <strong>{marketStats.avgRating} stars</strong>, positioning you above average performance.</p>
            </div>
            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <p>Consider optimizing for high-traffic days to maximize your <strong>{formatCurrency(marketStats.totalEarnings)}</strong> potential.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}