import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Store, 
  Search,
  Filter,
  MapPin,
  ToggleRight,
  ToggleLeft,
  Pause,
  Play,
  Edit,
  Trash2,
  MoreVertical,
  Crown,
  Users,
  RefreshCw,
  Download
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { 
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from '@/components/ui/DataTable'
import { ModernCheckbox } from '@/components/ui/ModernCheckbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'
import { useAdminMarkets } from '@/features/admin/hooks/useAdmin'
import { Market, MarketCategory, MarketStatus, MarketType } from '@/types'
import { cn } from '@/utils/cn'

interface AdminMarketTableProps {
  className?: string
  stats?: {
    total: number
    active: number
    draft: number
    pending: number
    inactive: number
  }
}

function MarketActionsDropdown({ 
  record, 
  onEdit, 
  onToggleStatus,
  onToggleApplications,
  onDelete 
}: { 
  record: Market
  onEdit: () => void
  onToggleStatus: () => void
  onToggleApplications: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Market
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleStatus}>
          {record.status === 'active' ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Deactivate
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleApplications}>
          {record.applicationsEnabled ? (
            <>
              <ToggleLeft className="h-4 w-4 mr-2" />
              Disable Apps
            </>
          ) : (
            <>
              <ToggleRight className="h-4 w-4 mr-2" />
              Enable Apps
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Market
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const categoryShortNames: Record<MarketCategory, string> = {
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

const categoryFilterOptions: SelectOption[] = [
  { value: '', label: 'All Categories' },
  { value: 'farmers-market', label: 'Farmers' },
  { value: 'arts-crafts', label: 'Arts & Crafts' },
  { value: 'flea-market', label: 'Flea' },
  { value: 'food-festival', label: 'Food' },
  { value: 'holiday-market', label: 'Holiday' },
  { value: 'craft-show', label: 'Craft' },
  { value: 'community-event', label: 'Community' },
  { value: 'night-market', label: 'Night' },
  { value: 'street-fair', label: 'Street' },
  { value: 'vintage-antique', label: 'Vintage' }
]

const statusFilterOptions: SelectOption[] = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' }
]

export function AdminMarketTable({ className, stats }: AdminMarketTableProps) {
  const navigate = useNavigate()
  const {
    markets,
    isLoading,
    pagination,
    selectedMarkets,
    refreshMarkets,
    handleFilterChange,
    handlePageChange,
    handleToggleStatus,
    handleToggleApplications,
    handleDeleteMarket,
    selectMarket,
    selectMarkets,
    clearMarketSelection
  } = useAdminMarkets()

  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    refreshMarkets()
  }, [refreshMarkets])

  const filteredMarkets = useMemo(() => {
    if (!searchTerm) return markets
    const search = searchTerm.toLowerCase()
    return markets.filter(market => 
      market.name.toLowerCase().includes(search) ||
      market.location?.city?.toLowerCase().includes(search) ||
      market.location?.state?.toLowerCase().includes(search)
    )
  }, [markets, searchTerm])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    handleFilterChange({ 
      status: value || undefined, 
      category: categoryFilter || undefined,
      search: searchTerm || undefined
    })
  }

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value)
    handleFilterChange({ 
      status: statusFilter || undefined, 
      category: value || undefined,
      search: searchTerm || undefined
    })
  }

  const handleSelectAll = () => {
    if (selectedMarkets.length === filteredMarkets.length) {
      clearMarketSelection()
    } else {
      selectMarkets(filteredMarkets.map(m => m.id))
    }
  }

  const getStatusBadge = (status: MarketStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="text-xs">Active</Badge>
      case 'draft':
        return <Badge variant="outline" className="text-xs">Draft</Badge>
      case 'pending_approval':
        return <Badge variant="warning" className="text-xs">Pending</Badge>
      case 'suspended':
        return <Badge variant="destructive" className="text-xs">Suspended</Badge>
      case 'inactive':
        return <Badge variant="destructive" className="text-xs">Inactive</Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="text-xs">Cancelled</Badge>
      case 'completed':
        return <Badge variant="muted" className="text-xs">Completed</Badge>
      default:
        return <Badge variant="muted" className="text-xs">{status}</Badge>
    }
  }

  const getTypeBadge = (marketType: MarketType) => {
    switch (marketType) {
      case 'promoter-managed':
        return <Badge variant="default" className="text-xs"><Crown className="h-3 w-3 mr-1" /></Badge>
      case 'vendor-created':
        return <Badge variant="outline" className="text-xs"><Users className="h-3 w-3 mr-1" /></Badge>
      default:
        return null
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/20">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <Store className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold">Market Management</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refreshMarkets()} disabled={isLoading} className="h-8">
                <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {stats && (
            <div className="flex items-center gap-3 text-xs border-b pb-3 mb-3">
              <span>Total: <b>{stats.total}</b></span>
              <span>Active: <b className="text-green-600">{stats.active}</b></span>
              <span>Draft: <b className="text-yellow-600">{stats.draft}</b></span>
              <span>Pending: <b className="text-orange-600">{stats.pending}</b></span>
              <span>Inactive: <b className="text-red-600">{stats.inactive}</b></span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn("h-8 px-3", showFilters && "bg-primary text-primary-foreground")}
            >
              <Filter className="h-3 w-3" />
            </Button>
          </div>

          {showFilters && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t">
              <Select placeholder="Status" value={statusFilter} onValueChange={handleStatusFilterChange} options={statusFilterOptions} className="w-28" />
              <Select placeholder="Category" value={categoryFilter} onValueChange={handleCategoryFilterChange} options={categoryFilterOptions} className="w-32" />
            </div>
          )}
        </div>

        {selectedMarkets.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 border-b text-sm">
            <ModernCheckbox checked={selectedMarkets.length === filteredMarkets.length} onCheckedChange={handleSelectAll} />
            <span className="font-medium">{selectedMarkets.length} selected</span>
            <Button variant="ghost" size="sm" onClick={clearMarketSelection}>Clear</Button>
          </div>
        )}

        <div className="overflow-auto">
          <DataTable>
            <DataTableHeader className="sticky top-0 bg-background z-10">
              <DataTableRow>
                <DataTableHead className="h-10"><ModernCheckbox checked={selectedMarkets.length === filteredMarkets.length} onCheckedChange={handleSelectAll} /></DataTableHead>
                <DataTableHead className="h-10">Type</DataTableHead>
                <DataTableHead className="h-10">Market</DataTableHead>
                <DataTableHead className="h-10">Category</DataTableHead>
                <DataTableHead className="h-10">Status</DataTableHead>
                <DataTableHead className="h-10">Apps</DataTableHead>
                <DataTableHead className="h-10 w-12"></DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {isLoading ? (
                <DataTableRow>
                  <DataTableCell colSpan={7} className="text-center py-6">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-muted border-t-accent rounded-full animate-spin" />
                      Loading...
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ) : filteredMarkets.length === 0 ? (
                <DataTableRow>
                  <DataTableCell colSpan={7} className="text-center py-6 text-muted-foreground">No markets found</DataTableCell>
                </DataTableRow>
              ) : (
                filteredMarkets.map((market) => (
                  <DataTableRow key={market.id} className="hover:bg-muted/30">
                    <DataTableCell className="py-2"><ModernCheckbox checked={selectedMarkets.includes(market.id)} onCheckedChange={() => selectMarket(market.id)} /></DataTableCell>
                    <DataTableCell className="py-2">{getTypeBadge(market.marketType)}</DataTableCell>
                    <DataTableCell className="py-2">
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{market.name}</div>
                        <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {market.location?.city}, {market.location?.state}
                        </div>
                      </div>
                    </DataTableCell>
                    <DataTableCell className="py-2">
                      <Badge variant="outline" className="text-xs">{categoryShortNames[market.category as MarketCategory] || market.category}</Badge>
                    </DataTableCell>
                    <DataTableCell className="py-2">{getStatusBadge(market.status)}</DataTableCell>
                    <DataTableCell className="py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleApplications(market.id, market.applicationsEnabled)}
                        className="h-6 w-6 p-0"
                      >
                        {market.applicationsEnabled ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </DataTableCell>
                    <DataTableCell className="py-2">
                      <MarketActionsDropdown
                        record={market}
                        onEdit={() => navigate(`/admin/markets/${market.id}`)}
                        onToggleStatus={() => handleToggleStatus(market.id, market.status)}
                        onToggleApplications={() => handleToggleApplications(market.id, market.applicationsEnabled)}
                        onDelete={() => handleDeleteMarket(market.id)}
                      />
                    </DataTableCell>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-xs">
            <div className="text-muted-foreground">
              {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)} className="h-7 px-2">Prev</Button>
              <span className="px-2">{pagination.page}/{pagination.totalPages}</span>
              <Button variant="ghost" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)} className="h-7 px-2">Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
