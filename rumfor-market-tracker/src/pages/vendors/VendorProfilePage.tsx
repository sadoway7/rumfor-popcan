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
      <div className={`border-0 sm:border border-surface-3 rounded-none sm:rounded-xl overflow-hidden mb-8 flex flex-col sm:flex-row h-64 sm:max-h-[320px] ${vendor.cardColor || 'bg-surface'}`}>
        {/* Avatar - 50% width, fills height */}
        <div className="relative w-full sm:w-1/2 h-full flex-shrink-0">
          {vendor.profileImage ? (
            <img
              src={getFullUploadUrl(vendor.profileImage)}
              alt={displayName}
              className="absolute inset-0 w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div
              className={`absolute inset-0 flex items-center justify-center text-6xl font-bold text-foreground bg-white/30`}
            >
              {initials}
            </div>
          )}
          {/* Product Categories overlay at bottom of image */}
          {vendor.productCategories && vendor.productCategories.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent z-10">
              <div className="flex flex-wrap gap-1.5">
                {vendor.productCategories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 text-gray-800"
                  >
                    {cat.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 p-6 flex flex-col">
          {/* Website */}
          {vendor.website && (
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-600 mb-3"
            >
              <Globe className="w-4 h-4" />
              {vendor.website.replace(/^https?:\/\//, '')}
            </a>
          )}

          <h1 className="text-3xl font-bold text-foreground mb-2">{displayName}</h1>
          {vendor.tagline && (
            <p className="text-xl text-amber-500 font-medium mb-4">{vendor.tagline}</p>
          )}
          {vendor.bio && (
            <p className="text-muted-foreground leading-relaxed mb-4">{vendor.bio}</p>
          )}
          {vendor.blurb && !vendor.bio && (
            <p className="text-muted-foreground leading-relaxed mb-4">{vendor.blurb}</p>
          )}
        </div>
      </div>

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
