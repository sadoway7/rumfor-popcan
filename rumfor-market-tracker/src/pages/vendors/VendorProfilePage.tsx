import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Globe, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { MarketCard } from '@/components/MarketCard'
import { useVendorProfile } from '@/features/vendor/hooks/useVendors'

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        to="/vendors"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Vendors
      </Link>

      {/* Profile Header */}
      <div className="bg-surface border border-surface-3 rounded-lg overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6 p-6">
          {/* Avatar */}
          {vendor.profileImage ? (
            <img
              src={vendor.profileImage}
              alt={displayName}
              className="w-28 h-28 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div
              className={`w-28 h-28 rounded-lg flex items-center justify-center text-4xl font-bold text-foreground flex-shrink-0 ${
                vendor.cardColor || 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
              }`}
            >
              {initials}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground mb-1">{displayName}</h1>
            {vendor.tagline && (
              <p className="text-amber-500 font-medium mb-2">{vendor.tagline}</p>
            )}
            {vendor.bio && (
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">{vendor.bio}</p>
            )}
            {vendor.blurb && !vendor.bio && (
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">{vendor.blurb}</p>
            )}

            {/* Product Categories */}
            {vendor.productCategories && vendor.productCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {vendor.productCategories.map((cat) => (
                  <Badge key={cat} variant="muted" className="text-xs">
                    {cat.replace(/-/g, ' ')}
                  </Badge>
                ))}
              </div>
            )}

            {/* Website */}
            {vendor.website && (
              <a
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-amber-500 hover:text-amber-600"
              >
                <Globe className="w-3.5 h-3.5" />
                {vendor.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-surface-3 px-6 py-3 flex gap-6 text-sm">
          <div>
            <span className="font-semibold text-foreground">{vendor.stats.totalMarkets}</span>{' '}
            <span className="text-muted-foreground">Markets</span>
          </div>
          <div>
            <span className="font-semibold text-foreground">{vendor.stats.attendingMarkets}</span>{' '}
            <span className="text-muted-foreground">Attending</span>
          </div>
          {vendor.stats.yearsActive > 0 && (
            <div>
              <span className="font-semibold text-foreground">{vendor.stats.yearsActive}</span>{' '}
              <span className="text-muted-foreground">{vendor.stats.yearsActive === 1 ? 'Year' : 'Years'} Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Markets */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Markets
        </h2>

        {vendor.upcomingMarkets && vendor.upcomingMarkets.length > 0 ? (
          <div className="space-y-4">
            {vendor.upcomingMarkets.map((market) => (
              <Link
                key={market.id}
                to={`/markets/${market.id}`}
                className="block bg-surface border border-surface-3 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{market.name}</h3>
                    {market.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        {market.location.city}{market.location.state ? `, ${market.location.state}` : ''}
                      </p>
                    )}
                    {market.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{market.description}</p>
                    )}
                  </div>
                  <Badge variant="muted" className="text-xs flex-shrink-0">
                    {market.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface border border-surface-3 rounded-lg">
            <p className="text-muted-foreground">No upcoming markets listed</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default VendorProfilePage
