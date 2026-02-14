import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { VendorCard } from '@/components/VendorCard'
import { useVendors } from '@/features/vendor/hooks/useVendors'
import type { VendorFilters } from '@/features/vendor/vendorsApi'

const PRODUCT_CATEGORIES = [
  'produce',
  'baked-goods',
  'crafts',
  'jewelry',
  'clothing',
  'food-prepared',
  'beverages',
  'home-goods',
  'art',
  'plants',
  'honey',
  'preserves',
  'dairy',
  'meat',
  'seafood',
  'soap',
  'candles',
  'pottery',
  'woodwork',
  'textiles',
]

export const VendorListingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [page, setPage] = useState(1)

  const filters: VendorFilters = {
    search: searchTerm || undefined,
    category: selectedCategory,
  }

  const { vendors, pagination, isLoading, error } = useVendors(filters, page, 20)

  const handleCategoryToggle = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? undefined : category))
    setPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Vendors</h1>
        <p className="text-muted-foreground">
          Discover local vendors, artisans, and makers in your community
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <input
          type="text"
          placeholder="Search vendors by name or specialty..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-12 pr-4 py-3 text-base bg-surface rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm shadow-black/15"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {PRODUCT_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryToggle(category)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px] ${
              selectedCategory === category
                ? 'bg-amber-500 text-white'
                : 'bg-surface hover:bg-surface-2 text-foreground border border-surface-3'
            }`}
          >
            {category.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">{error}</p>
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-2">No vendors found</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm || selectedCategory
              ? 'Try adjusting your search or filters'
              : 'Vendors will appear here once they set up their profiles'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.current} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default VendorListingPage
