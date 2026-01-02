import { useState, useMemo } from 'react'
import { 
  Shield, 
  Search, 
  Filter, 
  CheckSquare, 
  Square,
  Flag, 
  AlertTriangle, 
  Clock, 
  User, 
  MessageSquare, 
  Image as ImageIcon, 
  Store, 
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { Avatar } from '@/components/ui/Avatar'
import { useAdminModeration } from '@/features/admin/hooks/useAdmin'
import { ModerationItem } from '@/types'
import { cn } from '@/utils/cn'

interface AdminModerationQueueProps {
  className?: string
}

export function AdminModerationQueue({ className }: AdminModerationQueueProps) {
  const {
    moderationItems,
    moderationPagination,
    isLoadingModeration,
    selectedModerationItems,
    moderationFilters,
    refreshModerationQueue,
    handleModerateContent,
    handleFilterChange,
    selectModerationItem,
    selectModerationItems,
    clearModerationSelection
  } = useAdminModeration()

  const [searchTerm, setSearchTerm] = useState(moderationFilters?.search || '')
  const [showFilters, setShowFilters] = useState(false)

  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject' | 'resolve'; item: ModerationItem } | null>(null)
  const [actionReason, setActionReason] = useState('')

  const filteredItems = useMemo(() => {
    if (!searchTerm) return moderationItems
    
    const search = searchTerm.toLowerCase()
    return moderationItems.filter(item =>
      item.target.content.toLowerCase().includes(search) ||
      item.reason.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      item.target.author?.firstName.toLowerCase().includes(search) ||
      item.target.author?.lastName.toLowerCase().includes(search)
    )
  }, [moderationItems, searchTerm])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    handleFilterChange({
      ...moderationFilters,
      search: value || undefined
    })
  }

  const handleTypeFilter = (type: string) => {
    handleFilterChange({
      ...moderationFilters,
      type: type ? [type] : undefined
    })
  }

  const handleStatusFilter = (status: string) => {
    handleFilterChange({
      ...moderationFilters,
      status: status ? [status] : undefined
    })
  }

  const handlePriorityFilter = (priority: string) => {
    handleFilterChange({
      ...moderationFilters,
      priority: priority ? [priority] : undefined
    })
  }

  const handleSelectAll = () => {
    if (selectedModerationItems.length === filteredItems.length) {
      clearModerationSelection()
    } else {
      selectModerationItems(filteredItems.map(item => item.id))
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageSquare className="h-4 w-4" />
      case 'photo': return <ImageIcon className="h-4 w-4" />
      case 'market': return <Store className="h-4 w-4" />
      case 'user-report': return <User className="h-4 w-4" />
      case 'application': return <FileText className="h-4 w-4" />
      default: return <Flag className="h-4 w-4" />
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'comment': return 'default'
      case 'photo': return 'outline'
      case 'market': return 'muted'
      case 'user-report': return 'destructive'
      case 'application': return 'warning'
      default: return 'muted'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'warning'
      case 'medium': return 'default'
      case 'low': return 'muted'
      default: return 'muted'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>
      case 'approved': return <Badge variant="default">Approved</Badge>
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>
      case 'resolved': return <Badge variant="outline">Resolved</Badge>
      default: return <Badge variant="muted">{status}</Badge>
    }
  }

  const getContentPreview = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const handleAction = async (item: ModerationItem, action: 'approve' | 'reject' | 'resolve') => {
    setActionModal({ type: action, item })
  }

  const confirmAction = async () => {
    if (!actionModal) return
    
    await handleModerateContent(
      actionModal.item.id,
      actionModal.type,
      actionReason || undefined
    )
    
    setActionModal(null)
    setActionReason('')
  }

  // Select options
  const typeFilterOptions: SelectOption[] = [
    { value: '', label: 'All Types' },
    { value: 'comment', label: 'Comments' },
    { value: 'photo', label: 'Photos' },
    { value: 'market', label: 'Markets' },
    { value: 'user-report', label: 'User Reports' },
    { value: 'application', label: 'Applications' }
  ]

  const statusFilterOptions: SelectOption[] = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'resolved', label: 'Resolved' }
  ]

  const priorityFilterOptions: SelectOption[] = [
    { value: '', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ]

  // Table columns
  const columns = [
    {
      key: 'select',
      title: '',
      width: '48px',
      render: (_: any, record: ModerationItem) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectModerationItem(record.id)}
          className="h-8 w-8 p-0"
        >
          {selectedModerationItems.includes(record.id) ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </Button>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (_: any, record: ModerationItem) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(record.type)}
          <Badge variant={getTypeBadgeVariant(record.type)} className="capitalize">
            {record.type.replace('-', ' ')}
          </Badge>
        </div>
      )
    },
    {
      key: 'content',
      title: 'Content',
      render: (_: any, record: ModerationItem) => (
        <div className="max-w-xs">
          <div className="font-medium text-sm mb-1">
            {getContentPreview(record.target.content)}
          </div>
          <div className="text-xs text-muted-foreground">
            by {record.target.author?.firstName} {record.target.author?.lastName}
          </div>
        </div>
      )
    },
    {
      key: 'reason',
      title: 'Reason',
      render: (_: any, record: ModerationItem) => (
        <div className="max-w-xs">
          <div className="font-medium text-sm">{record.reason}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {getContentPreview(record.description, 60)}
          </div>
        </div>
      )
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (_: any, record: ModerationItem) => (
        <Badge variant={getPriorityBadgeVariant(record.priority)} className="capitalize">
          {record.priority}
        </Badge>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: any, record: ModerationItem) => getStatusBadge(record.status)
    },
    {
      key: 'reportedBy',
      title: 'Reported By',
      render: (_: any, record: ModerationItem) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.reporter.avatar} size="sm" />
          <span className="text-sm">
            {record.reporter.firstName} {record.reporter.lastName}
          </span>
        </div>
      )
    },
    {
      key: 'date',
      title: 'Reported',
      render: (_: any, record: ModerationItem) => (
        <div className="text-sm text-muted-foreground">
          {new Date(record.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: ModerationItem) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log('View details for:', record)}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction(record, 'approve')}
                title="Approve content"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction(record, 'reject')}
                title="Reject content"
              >
                <XCircle className="h-4 w-4 text-red-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction(record, 'resolve')}
                title="Mark as resolved"
              >
                <Flag className="h-4 w-4 text-blue-600" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ]

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Content Moderation</h2>
            <p className="text-sm text-muted-foreground">
              Review and moderate reported content
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshModerationQueue()}
            disabled={isLoadingModeration}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoadingModeration && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search moderation items..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
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
              placeholder="Filter by type"
              value={moderationFilters?.type?.[0] || ''}
              onValueChange={handleTypeFilter}
              options={typeFilterOptions}
            />
            <Select
              placeholder="Filter by status"
              value={moderationFilters?.status?.[0] || ''}
              onValueChange={handleStatusFilter}
              options={statusFilterOptions}
            />
            <Select
              placeholder="Filter by priority"
              value={moderationFilters?.priority?.[0] || ''}
              onValueChange={handlePriorityFilter}
              options={priorityFilterOptions}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {moderationItems.filter(item => item.status === 'pending').length}
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">High Priority</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {moderationItems.filter(item => item.priority === 'high' || item.priority === 'urgent').length}
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Reported Today</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {moderationItems.filter(item => {
              const today = new Date().toDateString()
              const itemDate = new Date(item.createdAt).toDateString()
              return today === itemDate
            }).length}
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Resolved</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {moderationItems.filter(item => item.status === 'resolved').length}
          </div>
        </div>
      </div>

      {/* Select All Header */}
      <div className="flex items-center justify-between mb-4 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelectAll}
          className="h-8 w-8 p-0"
        >
          {selectedModerationItems.length === filteredItems.length ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </Button>
        <span className="text-sm text-muted-foreground">
          {selectedModerationItems.length === filteredItems.length && filteredItems.length > 0 ? 'All selected' : 'Select all'}
        </span>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table
          columns={columns}
          data={filteredItems}
          loading={isLoadingModeration}
          emptyText="No moderation items found"
        />
      </div>

      {/* Pagination */}
      {moderationPagination && moderationPagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(moderationPagination.page - 1) * moderationPagination.limit + 1} to{' '}
            {Math.min(moderationPagination.page * moderationPagination.limit, moderationPagination.total)} of{' '}
            {moderationPagination.total} items
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={moderationPagination.page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {moderationPagination.page} of {moderationPagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={moderationPagination.page >= moderationPagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              {actionModal.type === 'approve' ? 'Approve Content' :
               actionModal.type === 'reject' ? 'Reject Content' : 'Resolve Item'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  className="w-full p-2 border rounded-md resize-none"
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Add a reason for this action..."
                />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActionModal(null)
                    setActionReason('')
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={confirmAction}>
                  Confirm
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  )
}