import React, { useState, useEffect } from 'react'
import type { MarketFilters as MarketFilterType, MarketCategory, MarketStatus } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

interface MarketFiltersProps {
  filters: MarketFilterType
  onFiltersChange: (filters: MarketFilterType) => void
  onSearch?: (query: string) => void
  onClear?: () => void
  className?: string
  showAdvanced?: boolean
}

const categories: { value: MarketCategory; label: string }[] = [
  { value: 'farmers-market', label: 'Farmers Market' },
  { value: 'arts-crafts', label: 'Arts & Crafts' },
  { value: 'flea-market', label: 'Flea Market' },
  { value: 'food-festival', label: 'Food Festival' },
  { value: 'holiday-market', label: 'Holiday Market' },
  { value: 'craft-show', label: 'Craft Show' },
  { value: 'community-event', label: 'Community Event' }
]

const statuses: { value: MarketStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' }
]

export const MarketFilters: React.FC<MarketFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  className,
  showAdvanced = false
}) => {
  const [localFilters, setLocalFilters] = useState<MarketFilterType>(filters)
  const [searchQuery, setSearchQuery] = useState(filters.search || '')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(showAdvanced)

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters)
    setSearchQuery(filters.search || '')
  }, [filters])

  const handleFilterChange = (key: keyof MarketFilterType, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleCategoryToggle = (category: MarketCategory) => {
    const currentCategories = localFilters.category || []
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category]
    
    handleFilterChange('category', newCategories)
  }

  const handleStatusToggle = (status: MarketStatus) => {
    const currentStatuses = localFilters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]
    
    handleFilterChange('status', newStatuses)
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  const handleClear = () => {
    setLocalFilters({} as MarketFilterType)
    setSearchQuery('')
    onFiltersChange({} as MarketFilterType)
    if (onClear) {
      onClear()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Card className={cn('p-6', className)}>
      {/* Search Bar */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search markets, locations, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            className="shrink-0"
          >
            Search
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="shrink-0"
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Quick filters:</span>
          <Badge
            variant={localFilters.category?.includes('farmers-market') ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleCategoryToggle('farmers-market')}
          >
            Farmers Markets
          </Badge>
          <Badge
            variant={localFilters.category?.includes('arts-crafts') ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleCategoryToggle('arts-crafts')}
          >
            Arts & Crafts
          </Badge>
          <Badge
            variant={localFilters.accessibility?.wheelchairAccessible ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleFilterChange('accessibility', {
              ...localFilters.accessibility,
              wheelchairAccessible: !localFilters.accessibility?.wheelchairAccessible
            })}
          >
            ♿ Wheelchair Accessible
          </Badge>
          <Badge
            variant={localFilters.accessibility?.parkingAvailable ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleFilterChange('accessibility', {
              ...localFilters.accessibility,
              parkingAvailable: !localFilters.accessibility?.parkingAvailable
            })}
          >
            🅿️ Parking
          </Badge>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-6 pt-6 border-t space-y-6">
          {/* Categories */}
          <div>
            <h4 className="text-sm font-medium mb-3">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category.value}
                  variant={localFilters.category?.includes(category.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleCategoryToggle(category.value)}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm font-medium mb-3">Status</h4>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <Badge
                  key={status.value}
                  variant={localFilters.status?.includes(status.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleStatusToggle(status.value)}
                >
                  {status.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-sm font-medium mb-3">Location</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="City"
                value={localFilters.location?.city || ''}
                onChange={(e) => handleFilterChange('location', {
                  ...localFilters.location,
                  city: e.target.value
                })}
              />
              <Input
                placeholder="State"
                value={localFilters.location?.state || ''}
                onChange={(e) => handleFilterChange('location', {
                  ...localFilters.location,
                  state: e.target.value
                })}
              />
            </div>
          </div>

          {/* Accessibility */}
          <div>
            <h4 className="text-sm font-medium mb-3">Accessibility</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.accessibility?.wheelchairAccessible || false}
                  onChange={(e) => handleFilterChange('accessibility', {
                    ...localFilters.accessibility,
                    wheelchairAccessible: e.target.checked
                  })}
                  className="rounded border-border"
                />
                <span className="text-sm">Wheelchair Accessible</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.accessibility?.parkingAvailable || false}
                  onChange={(e) => handleFilterChange('accessibility', {
                    ...localFilters.accessibility,
                    parkingAvailable: e.target.checked
                  })}
                  className="rounded border-border"
                />
                <span className="text-sm">Parking Available</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.accessibility?.restroomsAvailable || false}
                  onChange={(e) => handleFilterChange('accessibility', {
                    ...localFilters.accessibility,
                    restroomsAvailable: e.target.checked
                  })}
                  className="rounded border-border"
                />
                <span className="text-sm">Restrooms Available</span>
              </label>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClear}
              className="w-full"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}


