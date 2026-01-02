import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  Calendar,
  Eye,
  MessageSquare,
  Download,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { Textarea } from '@/components/ui/Textarea'
import { ApplicationCard } from '@/components/ApplicationCard'
import { BulkActions } from '@/components/ApplicationActions'
import { useApplications } from '@/features/applications/hooks/useApplications'
import { useAuthStore } from '@/features/auth/authStore'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import { Application, ApplicationStatus } from '@/types'
import { cn } from '@/utils/cn'

export function PromoterApplicationsPage() {
  const { user } = useAuthStore()
  const { markets } = useMarkets()
  const { 
    applications, 
    isLoading: applicationsLoading, 
    updateStatus, 
    bulkUpdateStatus 
  } = useApplications()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [marketFilter, setMarketFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [bulkActionModal, setBulkActionModal] = useState<{
    type: 'approve' | 'reject'
    ids: string[]
  } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Filter applications for markets created by current promoter
  const myMarkets = useMemo(() => {
    return markets.filter(market => market.promoterId === user?.id)
  }, [markets, user?.id])

  const myMarketIds = useMemo(() => {
    return myMarkets.map(market => market.id)
  }, [myMarkets])

  const promoterApplications = useMemo(() => {
    return applications.filter(app => myMarketIds.includes(app.marketId))
  }, [applications, myMarketIds])

  // Apply filters
  const filteredApplications = useMemo(() => {
    return promoterApplications.filter(application => {
      const matchesSearch = !searchTerm || 
        application.vendor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.vendor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.submittedData.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = !statusFilter || application.status === statusFilter
      const matchesMarket = !marketFilter || application.marketId === marketFilter
      
      return matchesSearch && matchesStatus && matchesMarket
    })
  }, [promoterApplications, searchTerm, statusFilter, marketFilter])

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-info/10 text-info border-info/20">Submitted</Badge>
      case 'under-review':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Under Review</Badge>
      case 'approved':
        return <Badge className="bg-success/10 text-success border-success/20">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'withdrawn':
        return <Badge variant="outline">Withdrawn</Badge>
      default:
        return <Badge variant="muted">{status}</Badge>
    }
  }

  const getPriorityBadge = (application: Application) => {
    // Mock priority logic - in real app this would be based on actual criteria
    const daysSinceSubmission = Math.floor(
      (new Date().getTime() - new Date(application.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceSubmission > 7) {
      return <Badge variant="destructive" className="text-xs">High Priority</Badge>
    } else if (daysSinceSubmission > 3) {
      return <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">Medium</Badge>
    }
    return null
  }

  const handleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(filteredApplications.map(app => app.id))
    }
  }

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    )
  }

  const handleApproveApplication = async (applicationId: string) => {
    try {
      await updateStatus(applicationId, 'approved')
    } catch (error) {
      console.error('Failed to approve application:', error)
    }
  }

  const handleRejectApplication = async (applicationId: string, reason?: string) => {
    try {
      await updateStatus(applicationId, 'rejected', reason)
    } catch (error) {
      console.error('Failed to reject application:', error)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedApplications.length === 0) return
    
    setIsProcessing(true)
    try {
      await bulkUpdateStatus(selectedApplications, 'approved')
      setSelectedApplications([])
      setBulkActionModal(null)
    } catch (error) {
      console.error('Failed to bulk approve applications:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkReject = async () => {
    if (selectedApplications.length === 0 || !rejectionReason.trim()) return
    
    setIsProcessing(true)
    try {
      await bulkUpdateStatus(selectedApplications, 'rejected', rejectionReason)
      setSelectedApplications([])
      setBulkActionModal(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Failed to bulk reject applications:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Calculate stats
  const stats = useMemo(() => {
    const total = promoterApplications.length
    const pending = promoterApplications.filter(app => 
      app.status === 'submitted' || app.status === 'under-review'
    ).length
    const approved = promoterApplications.filter(app => app.status === 'approved').length
    const rejected = promoterApplications.filter(app => app.status === 'rejected').length
    const avgProcessingTime = 3.2 // Mock average in days

    return { total, pending, approved, rejected, avgProcessingTime }
  }, [promoterApplications])

  const statusFilterOptions: SelectOption[] = [
    { value: '', label: 'All Status' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under-review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ]

  const marketFilterOptions: SelectOption[] = [
    { value: '', label: 'All Markets' },
    ...myMarkets.map(market => ({
      value: market.id,
      label: market.name
    }))
  ]

  // Table columns
  const columns = [
    {
      key: 'select',
      title: '',
      width: '48px',
      render: (_: any, record: Application) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSelectApplication(record.id)}
          className="h-8 w-8 p-0"
        >
          <div className={cn(
            'w-4 h-4 rounded border-2 flex items-center justify-center',
            selectedApplications.includes(record.id) 
              ? 'bg-primary border-primary' 
              : 'border-muted-foreground'
          )}>
            {selectedApplications.includes(record.id) && (
              <CheckCircle className="w-3 h-3 text-primary-foreground" />
            )}
          </div>
        </Button>
      )
    },
    {
      key: 'vendor',
      title: 'Vendor',
      render: (_: any, record: Application) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium">
              {record.vendor.firstName} {record.vendor.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              {record.submittedData.businessName || 'Independent Vendor'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'market',
      title: 'Market',
      render: (_: any, record: Application) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{record.market.name}</div>
            <div className="text-sm text-muted-foreground">
              {record.market.location.city}, {record.market.location.state}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: any, record: Application) => (
        <div className="flex flex-col gap-2">
          {getStatusBadge(record.status)}
          {getPriorityBadge(record)}
        </div>
      )
    },
    {
      key: 'submitted',
      title: 'Submitted',
      render: (_: any, record: Application) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            {new Date(record.createdAt).toLocaleDateString()}
          </div>
          <div className="text-muted-foreground">
            {Math.floor(
              (new Date().getTime() - new Date(record.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            )} days ago
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: Application) => (
        <div className="flex items-center gap-1">
          <Link to={`/applications/${record.id}`} title="View details">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {(record.status === 'submitted' || record.status === 'under-review') && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleApproveApplication(record.id)}
                title="Approve application"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRejectApplication(record.id)}
                title="Reject application"
              >
                <XCircle className="h-4 w-4 text-red-600" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            title="Send message"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  if (applicationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Application Review</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage vendor applications for your markets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Processing</p>
              <p className="text-2xl font-bold text-foreground">{stats.avgProcessingTime}d</p>
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
                placeholder="Search applications..."
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
                placeholder="Filter by market"
                value={marketFilter}
                onValueChange={setMarketFilter}
                options={marketFilterOptions}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Bulk Actions */}
      <BulkActions
        selectedApplicationIds={selectedApplications}
        onBulkApprove={() => setBulkActionModal({ type: 'approve', ids: selectedApplications })}
        onBulkReject={() => setBulkActionModal({ type: 'reject', ids: selectedApplications })}
        onClearSelection={() => setSelectedApplications([])}
        isProcessing={isProcessing}
      />

      {/* Applications Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Applications ({filteredApplications.length})</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-8 w-8 p-0"
            >
              <div className={cn(
                'w-4 h-4 rounded border-2 flex items-center justify-center',
                selectedApplications.length === filteredApplications.length && filteredApplications.length > 0
                  ? 'bg-primary border-primary' 
                  : 'border-muted-foreground'
              )}>
                {selectedApplications.length === filteredApplications.length && filteredApplications.length > 0 && (
                  <CheckCircle className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
            </Button>
            <span className="text-sm text-muted-foreground">Select all</span>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredApplications}
          loading={applicationsLoading}
          emptyText="No applications found for your markets."
        />
      </Card>

      {/* Application Cards for Mobile View */}
      <div className="lg:hidden space-y-4">
        {filteredApplications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            showActions={true}
            onApprove={(id) => handleApproveApplication(id)}
            onReject={(id) => handleRejectApplication(id)}
            onViewDetails={(id) => window.open(`/applications/${id}`, '_blank')}
          />
        ))}
      </div>

      {/* High Priority Alert */}
      {stats.pending > 0 && (
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-800">Review Needed</h3>
              <p className="text-orange-700">
                You have {stats.pending} applications waiting for review. 
                Average response time: {stats.avgProcessingTime} days.
              </p>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Start Reviewing
            </Button>
          </div>
        </Card>
      )}

      {/* Bulk Action Modal */}
      {bulkActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              {bulkActionModal.type === 'approve' ? 'Approve Applications' : 'Reject Applications'}
            </h3>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {bulkActionModal.type === 'approve' 
                  ? `Are you sure you want to approve ${bulkActionModal.ids.length} application(s)?`
                  : `Are you sure you want to reject ${bulkActionModal.ids.length} application(s)?`
                }
              </p>
              
              {bulkActionModal.type === 'reject' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reason for rejection (required)
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    rows={3}
                    required
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setBulkActionModal(null)
                    setRejectionReason('')
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={bulkActionModal.type === 'approve' ? handleBulkApprove : handleBulkReject}
                  disabled={isProcessing || (bulkActionModal.type === 'reject' && !rejectionReason.trim())}
                  className={bulkActionModal.type === 'approve' 
                    ? 'bg-success hover:bg-success/90' 
                    : 'bg-destructive hover:bg-destructive/90'
                  }
                >
                  {isProcessing ? 'Processing...' : 
                   bulkActionModal.type === 'approve' ? 'Approve All' : 'Reject All'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}