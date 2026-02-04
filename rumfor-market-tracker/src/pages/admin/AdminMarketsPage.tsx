import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { Spinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import { adminApi } from '@/features/admin/adminApi'
import { Market, MarketStatus, MarketCategory, MarketType } from '@/types'
import {
  Store,
  Plus,
  Search,
  Edit,
  Pause,
  Play,
  MapPin,
  Trash2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Crown,
  Users
} from 'lucide-react'

interface MarketFilters {
  status?: string
  category?: string
  marketType?: string
  search?: string
  page?: number
  limit?: number
}

export function AdminMarketsPage() {
  const navigate = useNavigate()
  const [markets, setMarkets] = useState<Market[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<MarketFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const fetchMarkets = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await adminApi.getAdminMarkets(filters)
      if (response.data) {
        setMarkets(response.data)
        setPagination(response.pagination)
      }
    } catch (err) {
      setError('Failed to load markets')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchMarkets()
  }, [fetchMarkets])

  const handleSearch = useCallback(async () => {
    setFilters(prev => ({ ...prev, search: searchQuery || undefined, page: 1 }))
  }, [searchQuery])

  const handleStatusFilter = useCallback(async (status: string) => {
    setSelectedStatus(status)
    setFilters(prev => ({
      ...prev,
      status: status !== 'all' ? status : undefined,
      page: 1
    }))
  }, [])

  const handleCategoryFilter = useCallback(async (category: string) => {
    setSelectedCategory(category)
    setFilters(prev => ({
      ...prev,
      category: category !== 'all' ? category : undefined,
      page: 1
    }))
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedStatus('all')
    setSelectedCategory('all')
    setFilters({})
  }, [])

  const handleToggleMarketStatus = useCallback(async (market: Market) => {
    const newStatus = market.status === 'active' ? 'inactive' : 'active'
    try {
      await adminApi.updateAdminMarket(market.id, { status: newStatus })
      fetchMarkets()
    } catch (err) {
      console.error('Failed to toggle market status:', err)
    }
  }, [fetchMarkets])

  const handleToggleApplications = useCallback(async (market: Market) => {
    try {
      await adminApi.updateAdminMarket(market.id, { 
        applicationsEnabled: !market.applicationsEnabled 
      })
      fetchMarkets()
    } catch (err) {
      console.error('Failed to toggle applications:', err)
    }
  }, [fetchMarkets])

  const handleDeleteMarket = useCallback(async (market: Market) => {
    if (window.confirm(`Are you sure you want to delete "${market.name}"? This action cannot be undone.`)) {
      try {
        await adminApi.deleteAdminMarket(market.id, 'Deleted by admin')
        fetchMarkets()
      } catch (err) {
        console.error('Failed to delete market:', err)
        setError('Failed to delete market. Please try again.')
      }
    }
  }, [fetchMarkets])

  // Market statistics
  const marketStats = {
    total: markets.length,
    active: markets.filter(m => m.status === 'active').length,
    draft: markets.filter(m => m.status === 'draft').length,
    cancelled: markets.filter(m => m.status === 'cancelled').length,
    completed: markets.filter(m => m.status === 'completed').length,
  }

  const getStatusBadge = (status: MarketStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'pending_approval':
        return <Badge variant="warning">Pending</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'completed':
        return <Badge variant="muted">Completed</Badge>
      default:
        return <Badge variant="muted">{status}</Badge>
    }
  }

  const getTypeBadge = (marketType: MarketType) => {
    switch (marketType) {
      case 'promoter-managed':
        return <Badge variant="default"><Crown className="h-3 w-3 mr-1" /></Badge>
      case 'vendor-created':
        return <Badge variant="outline"><Users className="h-3 w-3 mr-1" /></Badge>
      default:
        return null
    }
  }

  const statusFilterOptions: SelectOption[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' }
  ]

  const categoryFilterOptions: SelectOption[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'farmers-market', label: 'Farmers' },
    { value: 'arts-crafts', label: 'Arts' },
    { value: 'flea-market', label: 'Flea' },
    { value: 'food-festival', label: 'Food' },
    { value: 'holiday-market', label: 'Holiday' },
    { value: 'craft-show', label: 'Craft' },
    { value: 'community-event', label: 'Community' },
    { value: 'night-market', label: 'Night' },
    { value: 'street-fair', label: 'Street' },
    { value: 'vintage-antique', label: 'Vintage' }
  ]

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <Store className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
        <Button onClick={fetchMarkets}>Retry</Button>
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
            Manage and oversee all markets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchMarkets} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Market
          </Button>
        </div>
      </div>

      {/* Market Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{pagination.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">{marketStats.active}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Draft</p>
          <p className="text-2xl font-bold text-yellow-600">{marketStats.draft}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-orange-600">{markets.filter(m => m.status === 'pending_approval').length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <p className="text-2xl font-bold text-red-600">{marketStats.cancelled + markets.filter(m => m.status === 'suspended').length}</p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
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
          <Button variant="outline" onClick={handleClearFilters}>
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedStatus}
            onValueChange={handleStatusFilter}
            className="w-40"
            options={statusFilterOptions}
          />

          <Select
            value={selectedCategory}
            onValueChange={handleCategoryFilter}
            className="w-40"
            options={categoryFilterOptions}
          />
        </div>
      </Card>

      {/* Markets Table */}
      <Card className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Spinner />
            <span className="ml-2">Loading markets...</span>
          </div>
        ) : markets.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No markets found</p>
          </div>
        ) : (
          <Table
            columns={[
              {
                title: 'Type',
                key: 'marketType',
                width: '60px',
                render: (_: any, record: Market) => getTypeBadge(record.marketType)
              },
              {
                title: 'Market',
                key: 'name',
                render: (_: any, record: Market) => (
                  <div>
                    <p className="font-medium">{record.name}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {record.location?.city}, {record.location?.state}
                    </p>
                  </div>
                )
              },
              {
                title: 'Category',
                key: 'category',
                width: '100px',
                render: (_: any, record: Market) => {
                  const shortNames: Record<MarketCategory, string> = {
                    'farmers-market': 'Farmers',
                    'arts-crafts': 'Arts',
                    'flea-market': 'Flea',
                    'food-festival': 'Food',
                    'holiday-market': 'Holiday',
                    'craft-show': 'Craft',
                    'community-event': 'Community',
                    'night-market': 'Night',
                    'street-fair': 'Street',
                    'vintage-antique': 'Vintage'
                  }
                  return <Badge variant="outline">{shortNames[record.category]}</Badge>
                }
              },
              {
                title: 'Status',
                key: 'status',
                width: '100px',
                render: (_: any, record: Market) => getStatusBadge(record.status)
              },
              {
                title: 'Apps',
                key: 'applicationsEnabled',
                width: '70px',
                render: (_: any, record: Market) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleApplications(record)
                    }}
                  >
                    {record.applicationsEnabled ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                  </Button>
                )
              },
              {
                title: 'Actions',
                key: 'actions',
                width: '140px',
                render: (_: any, record: Market) => (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/admin/markets/${record.id}`)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleMarketStatus(record)}
                      title={record.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {record.status === 'active' ? (
                        <Pause className="h-4 w-4 text-orange-600" />
                      ) : (
                        <Play className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMarket(record)}
                      title="Delete"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {pagination.total} markets
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {pagination.page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
