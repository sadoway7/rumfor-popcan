import { useState, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { Spinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import { MarketStatus, MarketCategory } from '@/types'
import { 
  Store, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
 
  Eye, 
  CheckCircle, 
  XCircle, 
  Pause,
  Play,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

export function AdminMarketsPage() {
  const { markets, isLoading, error, filters, setFilters, clearFilters, refresh } = useMarkets()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus] = useState<string>('all')
  const [selectedCategory] = useState<string>('all')

  // Market statistics
  const marketStats = {
    total: markets.length,
    active: markets.filter(m => m.status === 'active').length,
    draft: markets.filter(m => m.status === 'draft').length,
    cancelled: markets.filter(m => m.status === 'cancelled').length,
    completed: markets.filter(m => m.status === 'completed').length,
  }

  // Mock data for demonstration
  const recentActivity = [
    {
      id: '1',
      action: 'market_created',
      message: 'New market created: "Summer Art Fair"',
      timestamp: '10 minutes ago',
      type: 'success'
    },
    {
      id: '2',
      action: 'market_cancelled',
      message: 'Market cancelled: "Winter Craft Market"',
      timestamp: '1 hour ago',
      type: 'warning'
    },
    {
      id: '3',
      action: 'market_approved',
      message: 'Market approved: "Farmers Market Downtown"',
      timestamp: '2 hours ago',
      type: 'info'
    },
    {
      id: '4',
      action: 'market_updated',
      message: 'Market details updated: "Community Flea Market"',
      timestamp: '3 hours ago',
      type: 'success'
    }
  ]

  const getStatusBadge = (status: MarketStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'cancelled':
        return <Badge variant="warning">Cancelled</Badge>
      case 'completed':
        return <Badge variant="muted">Completed</Badge>
      default:
        return <Badge variant="muted">{status}</Badge>
    }
  }

  const getCategoryBadge = (category: MarketCategory) => {
    const categoryLabels = {
      'farmers-market': 'Farmers Market',
      'arts-crafts': 'Arts & Crafts',
      'flea-market': 'Flea Market',
      'food-festival': 'Food Festival',
      'holiday-market': 'Holiday Market',
      'craft-show': 'Craft Show',
      'community-event': 'Community Event'
    }
    
    return <Badge variant="outline">{categoryLabels[category]}</Badge>
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <XCircle className="h-4 w-4 text-red-500" />
      case 'info': return <AlertTriangle className="h-4 w-4 text-blue-500" />
      default: return <Store className="h-4 w-4 text-gray-500" />
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

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      setFilters({ ...filters, search: searchQuery })
      await refresh()
    }
  }, [searchQuery, filters, setFilters, refresh])

  const handleStatusFilter = useCallback(async (status: MarketStatus | 'all') => {
    const newFilters = { ...filters }
    if (status !== 'all') {
      newFilters.status = [status]
    } else {
      delete newFilters.status
    }
    setFilters(newFilters)
    await refresh()
  }, [filters, setFilters, refresh])

  const handleCategoryFilter = useCallback(async (category: MarketCategory | 'all') => {
    const newFilters = { ...filters }
    if (category !== 'all') {
      newFilters.category = [category]
    } else {
      delete newFilters.category
    }
    setFilters(newFilters)
    await refresh()
  }, [filters, setFilters, refresh])

  const handleMarketAction = useCallback(async (marketId: string, action: 'approve' | 'reject' | 'activate' | 'deactivate') => {
    // Mock action - in real implementation, this would call the API
    console.log(`Action ${action} on market ${marketId}`)
  }, [])

  useEffect(() => {
    // Auto-refresh when component mounts
    refresh()
  }, [refresh])

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
        <Button onClick={refresh}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Market Management</h1>
          <p className="text-muted-foreground">
            Manage and oversee all markets in the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Market
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
        </div>
      </div>

      {/* Market Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Markets</p>
              <p className="text-3xl font-bold">{marketStats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Store className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Markets</p>
              <p className="text-3xl font-bold">{marketStats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Play className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Draft Markets</p>
              <p className="text-3xl font-bold">{marketStats.draft}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Pause className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold">{marketStats.completed}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
              <p className="text-3xl font-bold">{marketStats.cancelled}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedStatus}
            onValueChange={(value) => handleStatusFilter(value as MarketStatus | 'all')}
            className="w-48"
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'draft', label: 'Draft' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'completed', label: 'Completed' }
            ]}
          />

          <Select
            value={selectedCategory}
            onValueChange={(value) => handleCategoryFilter(value as MarketCategory | 'all')}
            className="w-48"
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'farmers-market', label: 'Farmers Market' },
              { value: 'arts-crafts', label: 'Arts & Crafts' },
              { value: 'flea-market', label: 'Flea Market' },
              { value: 'food-festival', label: 'Food Festival' },
              { value: 'holiday-market', label: 'Holiday Market' },
              { value: 'craft-show', label: 'Craft Show' },
              { value: 'community-event', label: 'Community Event' }
            ]}
          />
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <Plus className="h-5 w-5" />
            <span>Create Market</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Bulk Actions</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <span>Analytics</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <MapPin className="h-5 w-5" />
            <span>Location Management</span>
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

      {/* Markets Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">All Markets</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Spinner />
            <span className="ml-2">Loading markets...</span>
          </div>
        ) : (
          <Table
            columns={[
              {
                title: 'Market',
                key: 'name',
                render: (_: any, record: any) => (
                  <div>
                    <p className="font-medium">{record.name}</p>
                    <p className="text-sm text-muted-foreground">{record.description}</p>
                  </div>
                )
              },
              {
                title: 'Category',
                key: 'category',
                render: (_: any, record: any) => getCategoryBadge(record.category)
              },
              {
                title: 'Status',
                key: 'status',
                render: (_: any, record: any) => getStatusBadge(record.status)
              },
              {
                title: 'Promoter',
                key: 'promoter',
                render: (_: any, record: any) => (
                  <div>
                    <p className="font-medium">{record.promoter.firstName} {record.promoter.lastName}</p>
                    <p className="text-sm text-muted-foreground">{record.promoter.email}</p>
                  </div>
                )
              },
              {
                title: 'Location',
                key: 'location',
                render: (_: any, record: any) => (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{record.location.city}, {record.location.state}</span>
                  </div>
                )
              },
              {
                title: 'Created',
                key: 'createdAt',
                render: (_: any, record: any) => (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                  </div>
                )
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_: any, record: any) => (
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMarketAction(record.id, record.status === 'active' ? 'deactivate' : 'activate')}
                    >
                      {record.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                )
              }
            ]}
            data={markets}
            loading={isLoading}
            emptyText="No markets found"
          />
        )}
      </Card>
    </div>
  )
}