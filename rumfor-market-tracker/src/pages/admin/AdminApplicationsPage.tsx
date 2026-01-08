import { useState, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'
import { Spinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import { useApplications } from '@/features/applications/hooks/useApplications'
import { ApplicationStatus } from '@/types'
import { 
  FileText, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  AlertTriangle,
  Download,
  RefreshCw,
  FileCheck
} from 'lucide-react'

export function AdminApplicationsPage() {
  const { applications, isLoading, error, searchApplications, applyFilters, updateStatus } = useApplications()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus] = useState<string>('all')

  // Application statistics
  const applicationStats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'submitted' || app.status === 'under-review').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    draft: applications.filter(app => app.status === 'draft').length,
  }

  // Mock data for demonstration
  const recentActivity = [
    {
      id: '1',
      action: 'application_submitted',
      message: 'New application submitted by Sarah Johnson for "Farmers Market Downtown"',
      timestamp: '5 minutes ago',
      type: 'info'
    },
    {
      id: '2',
      action: 'application_approved',
      message: 'Application approved for "Summer Art Fair" by Mike Chen',
      timestamp: '1 hour ago',
      type: 'success'
    },
    {
      id: '3',
      action: 'application_rejected',
      message: 'Application rejected for "Community Flea Market" by Jane Smith',
      timestamp: '2 hours ago',
      type: 'warning'
    },
    {
      id: '4',
      action: 'application_under_review',
      message: 'Application marked as under review for "Food Festival 2024"',
      timestamp: '3 hours ago',
      type: 'info'
    }
  ]

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="default">Submitted</Badge>
      case 'under-review':
        return <Badge variant="warning">Under Review</Badge>
      case 'approved':
        return <Badge variant="default">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'withdrawn':
        return <Badge variant="muted">Withdrawn</Badge>
      default:
        return <Badge variant="muted">{status}</Badge>
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <XCircle className="h-4 w-4 text-red-500" />
      case 'info': return <AlertTriangle className="h-4 w-4 text-blue-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
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
      await searchApplications(searchQuery)
    }
  }, [searchQuery, searchApplications])

  const handleStatusFilter = useCallback(async (status: string) => {
    const newFilters = status === 'all' ? {} : { status: [status as ApplicationStatus] }
    await applyFilters(newFilters)
  }, [applyFilters])

  const handleApplicationAction = useCallback(async (applicationId: string, action: 'approve' | 'reject' | 'under-review') => {
    let status: ApplicationStatus
    
    switch (action) {
      case 'approve':
        status = 'approved'
        break
      case 'reject':
        status = 'rejected'
        break
      case 'under-review':
        status = 'under-review'
        break
      default:
        return
    }
    
    await updateStatus(applicationId, status)
  }, [updateStatus])



  useEffect(() => {
    // Component mounted
  }, [])

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
        <Button onClick={() => console.log('Retry')}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Application Management</h1>
          <p className="text-muted-foreground">
            Review and manage all vendor applications
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Applications
          </Button>
          <Button>
            <FileCheck className="h-4 w-4 mr-2" />
            Bulk Review
          </Button>
        </div>
      </div>

      {/* Application Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
              <p className="text-3xl font-bold">{applicationStats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
              <p className="text-3xl font-bold">{applicationStats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Approved</p>
              <p className="text-3xl font-bold">{applicationStats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rejected</p>
              <p className="text-3xl font-bold">{applicationStats.rejected}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Draft</p>
              <p className="text-3xl font-bold">{applicationStats.draft}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Edit className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search applications..."
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
          <Button variant="outline" onClick={() => console.log('Clear filters')}>
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedStatus}
            onValueChange={(value) => handleStatusFilter(value)}
            className="w-48"
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'submitted', label: 'Submitted' },
              { value: 'under-review', label: 'Under Review' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'draft', label: 'Draft' },
              { value: 'withdrawn', label: 'Withdrawn' }
            ]}
          />
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <FileCheck className="h-5 w-5" />
            <span>Bulk Approve</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <XCircle className="h-5 w-5" />
            <span>Bulk Reject</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>Mark Under Review</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center gap-2">
            <Download className="h-5 w-5" />
            <span>Export Data</span>
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

      {/* Applications Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">All Applications</h3>
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
            <span className="ml-2">Loading applications...</span>
          </div>
        ) : (
          <Table
            columns={[
              {
                title: 'Application',
                key: 'application',
                render: (_: any, record: any) => (
                  <div>
                    <p className="font-medium">{record.market?.name || 'Unknown Market'}</p>
                    <p className="text-sm text-muted-foreground">
                      Vendor: {record.vendor?.firstName} {record.vendor?.lastName}
                    </p>
                  </div>
                )
              },
              {
                title: 'Status',
                key: 'status',
                render: (_: any, record: any) => getStatusBadge(record.status)
              },
              {
                title: 'Submitted Date',
                key: 'createdAt',
                render: (_: any, record: any) => (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                  </div>
                )
              },
              {
                title: 'Last Updated',
                key: 'updatedAt',
                render: (_: any, record: any) => (
                  <div className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(record.updatedAt).toLocaleDateString()}</span>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleApplicationAction(record.id, 'approve')}
                      disabled={record.status === 'approved'}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleApplicationAction(record.id, 'reject')}
                      disabled={record.status === 'rejected'}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleApplicationAction(record.id, 'under-review')}
                      disabled={record.status === 'under-review'}
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                  </div>
                )
              }
            ]}
            data={applications}
            loading={isLoading}
            emptyText="No applications found"
          />
        )}
      </Card>
    </div>
  )
}