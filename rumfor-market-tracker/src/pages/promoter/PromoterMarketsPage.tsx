import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  Edit3,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { Textarea } from '@/components/ui/Textarea'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import { useAuthStore } from '@/features/auth/authStore'
import { Market, MarketStatus, MarketCategory } from '@/types'
import { cn } from '@/utils/cn'

export function PromoterMarketsPage() {
  const { user } = useAuthStore()
  const { markets, isLoading: marketsLoading } = useMarkets()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
  const [actionModal, setActionModal] = useState<{
    type: 'edit' | 'delete' | 'view'
    market: Market | null
  } | null>(null)
  const [deleteReason, setDeleteReason] = useState('')

  // Filter markets created by current promoter
  const myMarkets = useMemo(() => {
    return markets.filter(market => market.promoterId === user?.id)
  }, [markets, user?.id])

  // Apply filters
  const filteredMarkets = useMemo(() => {
    return myMarkets.filter(market => {
      const matchesSearch = !searchTerm || 
        market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        market.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        market.location.state.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = !statusFilter || market.status === statusFilter
      const matchesCategory = !categoryFilter || market.category === categoryFilter
      
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [myMarkets, searchTerm, statusFilter, categoryFilter])

  const getStatusBadge = (status: MarketStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>
      default:
        return <Badge variant="muted">{status}</Badge>
    }
  }

  const getCategoryLabel = (category: MarketCategory) => {
    const labels = {
      'farmers-market': 'Farmers Market',
      'arts-crafts': 'Arts & Crafts',
      'flea-market': 'Flea Market',
      'food-festival': 'Food Festival',
      'holiday-market': 'Holiday Market',
      'craft-show': 'Craft Show',
      'community-event': 'Community Event'
    }
    return labels[category] || category
  }

  const handleSelectAll = () => {
    if (selectedMarkets.length === filteredMarkets.length) {
      setSelectedMarkets([])
    } else {
      setSelectedMarkets(filteredMarkets.map(market => market.id))
    }
  }

  const handleSelectMarket = (marketId: string) => {
    setSelectedMarkets(prev => 
      prev.includes(marketId) 
        ? prev.filter(id => id !== marketId)
        : [...prev, marketId]
    )
  }

  const handleStatusChange = async (marketId: string, newStatus: MarketStatus) => {
    try {
      // In a real app, this would call an API to update the market
      console.log('Update market:', marketId, 'to status:', newStatus)
      // For now, just simulate success
    } catch (error) {
      console.error('Failed to update market status:', error)
    }
  }

  const handleDeleteMarket = async () => {
    if (!actionModal?.market || !deleteReason.trim()) return
    
    try {
      // In a real app, this would call an API to update the market status
      console.log('Delete market:', actionModal.market.id, 'reason:', deleteReason)
      setActionModal(null)
      setDeleteReason('')
    } catch (error) {
      console.error('Failed to delete market:', error)
    }
  }

  // Calculate stats
  const stats = useMemo(() => {
    const total = myMarkets.length
    const active = myMarkets.filter(m => m.status === 'active').length
    const draft = myMarkets.filter(m => m.status === 'draft').length
    const totalApplications = filteredMarkets.reduce((sum) => {
      // This would come from actual application data
      return sum + Math.floor(Math.random() * 20) + 1
    }, 0)

    return { total, active, draft, totalApplications }
  }, [myMarkets, filteredMarkets])

  const statusFilterOptions: SelectOption[] = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' }
  ]

  const categoryFilterOptions: SelectOption[] = [
    { value: '', label: 'All Categories' },
    { value: 'farmers-market', label: 'Farmers Market' },
    { value: 'arts-crafts', label: 'Arts & Crafts' },
    { value: 'flea-market', label: 'Flea Market' },
    { value: 'food-festival', label: 'Food Festival' },
    { value: 'holiday-market', label: 'Holiday Market' },
    { value: 'craft-show', label: 'Craft Show' },
    { value: 'community-event', label: 'Community Event' }
  ]

  // Table columns
  const columns = [
    {
      key: 'select',
      title: '',
      width: '48px',
      render: (_: any, record: Market) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSelectMarket(record.id)}
          className="h-8 w-8 p-0"
        >
          <div className={cn(
            'w-4 h-4 rounded border-2 flex items-center justify-center',
            selectedMarkets.includes(record.id) 
              ? 'bg-primary border-primary' 
              : 'border-muted-foreground'
          )}>
            {selectedMarkets.includes(record.id) && (
              <CheckCircle className="w-3 h-3 text-primary-foreground" />
            )}
          </div>
        </Button>
      )
    },
    {
      key: 'market',
      title: 'Market',
      render: (_: any, record: Market) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {record.location.city}, {record.location.state}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      render: (_: any, record: Market) => (
        <Badge variant="outline">{getCategoryLabel(record.category)}</Badge>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: any, record: Market) => getStatusBadge(record.status)
    },
    {
      key: 'applications',
      title: 'Applications',
      render: () => {
        // Mock application count - in real app, this would come from joined data
        const appCount = Math.floor(Math.random() * 20) + 1
        return (
          <div className="text-center">
            <div className="font-medium">{appCount}</div>
            <div className="text-xs text-muted-foreground">applications</div>
          </div>
        )
      }
    },
    {
      key: 'schedule',
      title: 'Schedule',
      render: (_: any, record: Market) => (
        <div className="text-sm">
          {record.schedule.length > 0 ? (
            <div>
              <div className="font-medium">
                {record.schedule[0].isRecurring ? 'Recurring' : 'One-time'}
              </div>
              <div className="text-muted-foreground">
                {record.schedule[0].startDate}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Not scheduled</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: Market) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActionModal({ type: 'view', market: record })}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActionModal({ type: 'edit', market: record })}
            title="Edit market"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActionModal({ type: 'delete', market: record })}
            title="Delete market"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )
    }
  ]

  if (marketsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading markets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Markets</h1>
          <p className="text-muted-foreground mt-1">
            Manage your markets and track performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/promoter/markets/create">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Market
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Markets</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Markets</p>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Draft Markets</p>
              <p className="text-2xl font-bold text-foreground">{stats.draft}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalApplications}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onValueChange={setStatusFilter}
                options={statusFilterOptions}
              />
              <Select
                placeholder="Filter by category"
                value={categoryFilter}
                onValueChange={setCategoryFilter}
                options={categoryFilterOptions}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedMarkets.length > 0 && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedMarkets.length} market{selectedMarkets.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMarkets([])}
              >
                Clear Selection
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  selectedMarkets.forEach(id => handleStatusChange(id, 'active'))
                  setSelectedMarkets([])
                }}
                className="bg-success hover:bg-success/90"
              >
                Mark as Active
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  selectedMarkets.forEach(id => handleStatusChange(id, 'cancelled'))
                  setSelectedMarkets([])
                }}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Cancel Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Markets Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Markets ({filteredMarkets.length})</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-8 w-8 p-0"
            >
              <div className={cn(
                'w-4 h-4 rounded border-2 flex items-center justify-center',
                selectedMarkets.length === filteredMarkets.length && filteredMarkets.length > 0
                  ? 'bg-primary border-primary' 
                  : 'border-muted-foreground'
              )}>
                {selectedMarkets.length === filteredMarkets.length && filteredMarkets.length > 0 && (
                  <CheckCircle className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
            </Button>
            <span className="text-sm text-muted-foreground">Select all</span>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredMarkets}
          loading={marketsLoading}
          emptyText="No markets found. Create your first market to get started."
        />
      </Card>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            {actionModal.type === 'view' && actionModal.market && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">{actionModal.market.name}</h3>
                  <Button
                    variant="ghost"
                    onClick={() => setActionModal(null)}
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{actionModal.market.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Category</h4>
                      <Badge variant="outline">{getCategoryLabel(actionModal.market.category)}</Badge>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Status</h4>
                      {getStatusBadge(actionModal.market.status)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Location</h4>
                    <p className="text-muted-foreground">
                      {actionModal.market.location.address}<br />
                      {actionModal.market.location.city}, {actionModal.market.location.state} {actionModal.market.location.zipCode}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Schedule</h4>
                    {actionModal.market.schedule.length > 0 ? (
                      <div className="space-y-2">
                        {actionModal.market.schedule.map((sched, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">
                              {sched.isRecurring ? 'Recurring' : 'One-time'}: 
                            </span>
                            <span className="text-muted-foreground ml-2">
                              {sched.startDate} ({sched.startTime} - {sched.endTime})
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No schedule set</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setActionModal(null)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setActionModal({ type: 'edit', market: actionModal.market })
                      }}
                    >
                      Edit Market
                    </Button>
                  </div>
                </div>
              </>
            )}

            {actionModal.type === 'edit' && actionModal.market && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Edit Market</h3>
                  <Button
                    variant="ghost"
                    onClick={() => setActionModal(null)}
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Edit functionality would open a form with the market's current data.
                    For now, this redirects to the market detail page.
                  </p>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setActionModal(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        // In a real app, this would navigate to an edit form
                        console.log('Navigate to edit form for:', actionModal.market)
                      }}
                    >
                      Continue to Edit
                    </Button>
                  </div>
                </div>
              </>
            )}

            {actionModal.type === 'delete' && actionModal.market && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Delete Market</h3>
                  <Button
                    variant="ghost"
                    onClick={() => setActionModal(null)}
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-destructive">
                      Are you sure you want to delete "{actionModal.market.name}"? 
                      This action cannot be undone.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Reason for deletion (optional)
                    </label>
                    <Textarea
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Please provide a reason for deletion..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActionModal(null)
                        setDeleteReason('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteMarket}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete Market
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}