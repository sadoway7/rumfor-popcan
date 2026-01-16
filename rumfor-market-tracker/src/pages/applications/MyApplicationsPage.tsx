import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ApplicationCard } from '@/components/ApplicationCard'
import { ApplicationFilters, ApplicationFilters as Filters } from '@/components/ApplicationFilters'
import { StatusBadge } from '@/components/ApplicationStatus'
import { useVendorApplications } from '@/features/applications/hooks/useApplications'
import { useMarkets } from '@/features/markets/hooks/useMarkets'
import { Application, ApplicationStatus } from '@/types'
import { cn } from '@/utils/cn'

export const MyApplicationsPage: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
    marketId: '',
    dateRange: { from: '', to: '' },
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const { myApplications, isLoading, getApplicationStats } = useVendorApplications()
  const { markets } = useMarkets()

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let filtered = [...myApplications]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(app => 
        app.market.name.toLowerCase().includes(searchLower) ||
        app.submittedData?.businessName?.toLowerCase().includes(searchLower) ||
        app.submittedData?.businessDescription?.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === filters.status)
    }

    // Market filter
    if (filters.marketId) {
      filtered = filtered.filter(app => app.marketId === filters.marketId)
    }

    // Date range filter
    if (filters.dateRange.from) {
      filtered = filtered.filter(app => 
        new Date(app.createdAt) >= new Date(filters.dateRange.from)
      )
    }
    if (filters.dateRange.to) {
      filtered = filtered.filter(app => 
        new Date(app.createdAt) <= new Date(filters.dateRange.to + 'T23:59:59')
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'updatedAt':
          aValue = new Date(a.updatedAt || a.createdAt)
          bValue = new Date(b.updatedAt || b.createdAt)
          break
        case 'marketName':
          aValue = a.market.name.toLowerCase()
          bValue = b.market.name.toLowerCase()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          aValue = a.createdAt
          bValue = b.createdAt
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [myApplications, filters])

  // Group applications by status for stats
  const stats = getApplicationStats()
  const applicationsByStatus = useMemo(() => {
    const grouped = myApplications.reduce((acc, app) => {
      if (!acc[app.status]) {
        acc[app.status] = []
      }
      acc[app.status].push(app)
      return acc
    }, {} as Record<ApplicationStatus, Application[]>)
    return grouped
  }, [myApplications])

  const marketOptions = markets.map(market => ({
    id: market.id,
    name: market.name
  }))

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading your applications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your vendor applications
          </p>
        </div>
        <Link to="/markets" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            Browse Markets
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Applications</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.submitted + stats.underReview}</div>
          <div className="text-sm text-muted-foreground">Under Review</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-muted-foreground">Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card p-4 sm:p-6">
        <ApplicationFilters
          filters={filters}
          onFiltersChange={setFilters}
          markets={marketOptions}
        />
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {filteredApplications.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No applications found"
            description={
              myApplications.length === 0 
                ? "You haven't submitted any applications yet. Browse markets to get started."
                : "No applications match your current filters. Try adjusting your search criteria."
            }
            action={
              myApplications.length === 0 ? (
                <Link to="/markets">
                  <Button>Browse Markets</Button>
                </Link>
              ) : (
                <Button variant="outline" onClick={() => setFilters({
                  search: '',
                  status: 'all',
                  marketId: '',
                  dateRange: { from: '', to: '' },
                  sortBy: 'createdAt',
                  sortOrder: 'desc'
                })}>
                  Clear Filters
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-lg border bg-card px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Showing {filteredApplications.length} of {myApplications.length} applications
              </p>

              {/* Quick Status Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Quick filter:</span>
                {Object.entries(applicationsByStatus).map(([status, apps]) => (
                  <Link
                    key={status}
                    to={`?status=${status}`}
                    className="inline-flex items-center gap-2 rounded-full border border-transparent bg-surface px-2.5 py-1 text-xs hover:bg-surface-2"
                  >
                    <StatusBadge
                      status={status as ApplicationStatus}
                      className={cn(
                        'cursor-pointer hover:opacity-80',
                        filters.status === status && 'ring-2 ring-accent'
                      )}
                    />
                    <span className="text-muted-foreground">({apps.length})</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Applications Grid/List */}
            <div className="grid gap-4">
              {filteredApplications.map(application => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  variant="default"
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Recent Activity Section */}
      {myApplications.length > 0 && (
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(applicationsByStatus).map(([status, apps]) => (
              <div key={status} className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={status as ApplicationStatus} />
                  <span className="text-2xl font-bold">{apps.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {status === 'approved' && 'Applications that have been accepted'}
                  {status === 'rejected' && 'Applications that were not accepted'}
                  {status === 'submitted' && 'Applications awaiting review'}
                  {status === 'under-review' && 'Applications currently being reviewed'}
                  {status === 'draft' && 'Applications you started but didn\'t submit'}
                  {status === 'withdrawn' && 'Applications you withdrew'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
