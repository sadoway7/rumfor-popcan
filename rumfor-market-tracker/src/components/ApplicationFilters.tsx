import React, { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Card } from '@/components/ui/Card'
import { ApplicationStatus } from '@/types'
import { cn } from '@/utils/cn'
import { formatLocalDate } from '@/utils/formatDate'


export interface ApplicationFilters {
  search: string
  status: ApplicationStatus | 'all'
  marketId: string
  vendorId?: string
  category?: string[]
  location?: {
    city?: string
    state?: string
  }
  dateRange: {
    from: string
    to: string
  }
  sortBy: 'createdAt' | 'updatedAt' | 'marketName' | 'status' | 'vendorName' | 'applicationCount'
  sortOrder: 'asc' | 'desc'
  hasDocuments?: boolean
  reviewedBy?: string
  priority?: 'high' | 'medium' | 'low'
  tags?: string[]
}

interface ApplicationFiltersProps {
  filters: ApplicationFilters
  onFiltersChange: (filters: ApplicationFilters) => void
  markets?: Array<{ id: string; name: string }>
  className?: string
}

const statusOptions: Array<{ value: ApplicationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
]

const sortOptions = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'marketName', label: 'Market Name' },
  { value: 'status', label: 'Status' },
]

export const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
  filters,
  onFiltersChange,
  markets = [],
  className
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof ApplicationFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const updateDateRange = (key: 'from' | 'to', value: string) => {
    updateFilter('dateRange', {
      ...filters.dateRange,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      marketId: '',
      dateRange: { from: '', to: '' },
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  const hasActiveFilters = 
    filters.search || 
    filters.status !== 'all' || 
    filters.marketId || 
    filters.dateRange.from || 
    filters.dateRange.to

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <Input
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search applications..."
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => updateFilter('status', value as ApplicationStatus | 'all')}
              options={statusOptions.map(option => ({
                value: option.value,
                label: option.label
              }))}
              placeholder="All statuses"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Market</label>
            <Select
              value={filters.marketId}
              onValueChange={(value) => updateFilter('marketId', value)}
              options={[
                { value: '', label: 'All markets' },
                ...markets.map(market => ({
                  value: market.id,
                  label: market.name
                }))
              ]}
              placeholder="All markets"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter('sortBy', value)}
              options={sortOptions.map(option => ({
                value: option.value,
                label: option.label
              }))}
              placeholder="Sort by"
            />
          </div>
        </div>

        {/* Sort Order */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Order:</label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => updateFilter('sortOrder', value as 'asc' | 'desc')}
                options={[
                  { value: 'desc', label: 'Newest First' },
                  { value: 'asc', label: 'Oldest First' }
                ]}
                placeholder="Sort order"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
            </Button>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="text-sm font-medium">Date Range</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <Input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => updateDateRange('from', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => updateDateRange('to', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Quick Date Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
const today = formatLocalDate(new Date().toISOString())
                  const weekAgo = formatLocalDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
                  updateFilter('dateRange', { from: weekAgo, to: today })
                }}
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
const today = formatLocalDate(new Date().toISOString())
                  const monthAgo = formatLocalDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                  updateFilter('dateRange', { from: monthAgo, to: today })
                }}
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
const today = formatLocalDate(new Date().toISOString())
                  const yearAgo = formatLocalDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
                  updateFilter('dateRange', { from: yearAgo, to: today })
                }}
              >
                Last year
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// Status-specific filters
export const StatusFilters: React.FC<{
  selectedStatuses: ApplicationStatus[]
  onStatusToggle: (status: ApplicationStatus) => void
  className?: string
}> = ({ selectedStatuses, onStatusToggle, className }) => {
  const statusOptions: Array<{ value: ApplicationStatus; label: string; color: string }> = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-50 text-gray-700' },
    { value: 'submitted', label: 'Submitted', color: 'bg-blue-50 text-blue-700' },
    { value: 'under-review', label: 'Under Review', color: 'bg-yellow-50 text-yellow-700' },
    { value: 'approved', label: 'Approved', color: 'bg-green-50 text-green-700' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-50 text-red-700' },
    { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-50 text-gray-700' },
  ]

  return (
    <Card className={cn('p-4', className)}>
      <h4 className="text-sm font-medium mb-3">Filter by Status</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {statusOptions.map(option => (
          <Checkbox
            key={option.value}
            checked={selectedStatuses.includes(option.value)}
            onValueChange={() => onStatusToggle(option.value)}
            label={option.label}
          />
        ))}
      </div>
    </Card>
  )
}