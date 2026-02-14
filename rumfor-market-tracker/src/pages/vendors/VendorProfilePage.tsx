import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Globe, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { useVendorProfile } from '@/features/vendor/hooks/useVendors'
import { getFullUploadUrl, MARKET_CATEGORY_LABELS } from '@/config/constants'

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
      <div className={`border-0 sm:border border-surface-3 rounded-none sm:rounded-xl overflow-hidden mb-8 flex flex-col sm:flex-row min-h-[320px] ${vendor.cardColor || 'bg-surface'}`}>
        {/* Avatar - 50% width, fills height */}
        {vendor.profileImage ? (
          <img
            src={getFullUploadUrl(vendor.profileImage)}
            alt={displayName}
            className="w-full sm:w-1/2 h-64 sm:h-full object-cover flex-shrink-0"
          />
        ) : (
          <div
            className={`w-full sm:w-1/2 h-64 sm:h-full flex items-center justify-center text-6xl font-bold text-foreground flex-shrink-0 bg-white/30`}
          >
            {initials}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0 p-6 flex flex-col">
          {/* Product Categories */}
          {vendor.productCategories && vendor.productCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {vendor.productCategories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-surface-3 text-foreground"
                >
                  {cat.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          )}

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendor.upcomingMarkets.map((market) => {
              const imageUrl = market.images && market.images.length > 0 
                ? (market.images[0] as any).url || (market.images[0] as any).thumbnail || market.images[0]
                : null
              
              return (
                <Link
                  key={market.id}
                  to={`/markets/${market.id}`}
                  className="bg-surface border border-surface-3 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  {imageUrl && (
                    <div className="relative h-40">
                      <img
                        src={imageUrl}
                        alt={market.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-2">
                        <h3 className="text-white font-bold truncate">{market.name}</h3>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    {!imageUrl && (
                      <h3 className="font-bold text-foreground mb-2">{market.name}</h3>
                    )}
                    {market.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                        <MapPin className="w-4 h-4" />
                        {market.location.city}{market.location.state ? `, ${market.location.state}` : ''}
                      </p>
                    )}
                    {market.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{market.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {MARKET_CATEGORY_LABELS[market.category as keyof typeof MARKET_CATEGORY_LABELS] || market.category}
                      </Badge>
                    </div>
                  </div>
                </Link>
              )
            })}
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
