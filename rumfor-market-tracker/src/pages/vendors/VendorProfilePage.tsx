import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Globe, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { MarketCard } from '@/components/MarketCard'
import { useVendorProfile } from '@/features/vendor/hooks/useVendors'
import { getFullUploadUrl } from '@/config/constants'

export const VendorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { vendor, isLoading, error } = useVendorProfile(id || '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Vendor not found</h2>
        <p className="text-muted-foreground mb-6">{error || 'This vendor profile does not exist.'}</p>
        <Link to="/vendors">
          <Button variant="outline">Back to Vendors</Button>
        </Link>
      </div>
    )
  }

  const initials = `${(vendor.firstName || '')[0] || ''}${(vendor.lastName || '')[0] || ''}`.toUpperCase()
  const displayName = vendor.businessName || `${vendor.firstName} ${vendor.lastName}`

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Profile Header */}
      <div className={`border-0 sm:border border-surface-3 rounded-none sm:rounded-xl overflow-hidden mb-8 flex flex-col sm:flex-row sm:h-[320px] ${vendor.cardColor || 'bg-surface'}`}>
        {/* Avatar - 50% width on desktop, fixed height on mobile */}
        <div className="relative w-full sm:w-1/2 h-48 sm:h-full flex-shrink-0">
          {vendor.profileImage ? (
            <img
              src={getFullUploadUrl(vendor.profileImage)}
              alt={displayName}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className={`absolute inset-0 flex items-center justify-center text-6xl font-bold text-foreground bg-white/30`}
            >
              {initials}
            </div>
          )}
          {/* Name and categories overlay at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            {/* Dark gradient overlay */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, transparent 100%)'
              }}
            />
            <div className="relative p-4 pb-5">
              <h1 className="text-white font-quicksand font-bold text-2xl sm:text-3xl leading-tight drop-shadow-lg" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)' }}>
                {displayName}
              </h1>
              {vendor.productCategories && vendor.productCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {vendor.productCategories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 text-gray-800"
                    >
                      {cat.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info - hidden on mobile since name is in image */}
        <div className="hidden sm:flex flex-1 min-w-0 p-5 flex-col">
          {vendor.website && (
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-2 text-sm"
            >
              <Globe className="w-4 h-4" />
              {vendor.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {vendor.tagline && (
            <p className="text-lg text-muted-foreground font-medium mb-2">{vendor.tagline}</p>
          )}
          {vendor.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed">{vendor.bio}</p>
          )}
          {vendor.blurb && !vendor.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed">{vendor.blurb}</p>
          )}
        </div>

        {/* Mobile info - compact inline below image */}
        <div className="sm:hidden px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {vendor.website && (
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80"
            >
              <Globe className="w-3.5 h-3.5" />
              {vendor.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {vendor.tagline && (
            <span className="text-muted-foreground">{vendor.tagline}</span>
          )}
        </div>
      </div>

      {/* Mobile bio section */}
      {(vendor.bio || vendor.blurb) && (
        <div className="sm:hidden px-4 pb-4 -mt-4">
          <p className="text-sm text-muted-foreground leading-snug">{vendor.bio || vendor.blurb}</p>
        </div>
      )}

      {/* Upcoming Markets */}
      <section className="px-4 sm:px-0">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Markets
        </h2>

        {vendor.upcomingMarkets && vendor.upcomingMarkets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {vendor.upcomingMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={{
                  id: market.id,
                  name: market.name,
                  description: market.description || '',
                  category: market.category as any,
                  location: market.location ? {
                    address: market.location.address || '',
                    city: market.location.city || '',
                    state: market.location.state || '',
                    zipCode: market.location.zipCode || '',
                    country: market.location.country || '',
                  } : { address: '', city: '', state: '', zipCode: '', country: '' },
                  schedule: market.schedule || [],
                  status: market.status as any,
                  images: market.images?.map(img => typeof img === 'string' ? img : (img as any).url || (img as any).thumbnail || '') || [],
                  tags: market.tags || [],
                  marketType: market.marketType as any,
                  accessibility: {
                    wheelchairAccessible: false,
                    parkingAvailable: false,
                    restroomsAvailable: false,
                    familyFriendly: false,
                    petFriendly: false,
                    covered: false,
                    indoor: false,
                    outdoorSeating: false,
                    wifi: false,
                    atm: false,
                    foodCourt: false,
                    liveMusic: false,
                    handicapParking: false,
                    alcoholAvailable: false,
                  },
                  stats: {
                    viewCount: 0,
                    favoriteCount: 0,
                    applicationCount: 0,
                    commentCount: 0,
                    rating: 0,
                    reviewCount: 0,
                  },
                  applicationsEnabled: false,
                  contact: {},
                  applicationFields: [],
                  createdAt: market.joinedAt || new Date().toISOString(),
                  updatedAt: market.joinedAt || new Date().toISOString(),
                }}
                variant="profile"
                showTrackButton={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface border border-surface-3 rounded-xl">
            <p className="text-muted-foreground">No upcoming markets listed</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default VendorProfilePage
