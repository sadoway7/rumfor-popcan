import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { getFullUploadUrl } from '@/config/constants'
import type { VendorCardData, VendorMarketDisplay } from '@/types'

// Default gradient colors for vendors without a custom color
const DEFAULT_GRADIENTS = [
  'from-purple-500/20 to-pink-500/20',
  'from-green-500/20 to-emerald-500/20',
  'from-amber-500/20 to-orange-500/20',
  'from-blue-500/20 to-cyan-500/20',
  'from-red-500/20 to-rose-500/20',
  'from-yellow-500/20 to-amber-500/20',
  'from-indigo-500/20 to-violet-500/20',
  'from-teal-500/20 to-green-500/20',
]

function getGradientForVendor(id: string): string {
  // Deterministic gradient based on vendor ID
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return DEFAULT_GRADIENTS[Math.abs(hash) % DEFAULT_GRADIENTS.length]
}

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase()
}

export interface VendorCardProps {
  vendor: VendorCardData | VendorMarketDisplay
  variant?: 'default' | 'compact'
  showLink?: boolean
  className?: string
}

/**
 * Reusable vendor display card.
 * - `default`: Used on homepage and vendor listing (larger, horizontal layout with profile link)
 * - `compact`: Used on MarketDetailPage vendors tab (smaller, denser)
 */
export const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  variant = 'default',
  showLink = true,
  className,
}) => {
  // Normalize data — VendorMarketDisplay has nested user, VendorCardData has flat fields
  const isMarketDisplay = 'user' in vendor
  const vendorId = isMarketDisplay ? (vendor as VendorMarketDisplay).user.id : vendor.id
  const firstName = isMarketDisplay ? (vendor as VendorMarketDisplay).user.firstName : vendor.firstName
  const lastName = isMarketDisplay ? (vendor as VendorMarketDisplay).user.lastName : vendor.lastName
  const name = isMarketDisplay
    ? (vendor as VendorMarketDisplay).name
    : vendor.businessName || `${vendor.firstName} ${vendor.lastName}`
  const description = isMarketDisplay
    ? (vendor as VendorMarketDisplay).description
    : vendor.tagline
  const blurb = isMarketDisplay
    ? (vendor as VendorMarketDisplay).blurb
    : vendor.blurb
  const color = isMarketDisplay
    ? (vendor as VendorMarketDisplay).color
    : vendor.cardColor
  const profileImage = isMarketDisplay
    ? (vendor as VendorMarketDisplay).profileImage
    : vendor.profileImage

  const initials = getInitials(firstName, lastName)
  const gradientClass = color || `bg-gradient-to-br ${getGradientForVendor(vendorId)}`

  // Compact variant (MarketDetailPage)
  if (variant === 'compact') {
    const card = (
      <div className={cn(
        'border border-surface-3 rounded-xl overflow-hidden',
        gradientClass,
        className
      )}>
      <div className="flex items-stretch">
          {profileImage ? (
            <img
              src={getFullUploadUrl(profileImage)}
              alt={name}
              className="w-24 h-24 flex-shrink-0 object-cover"
            />
          ) : (
            <div
              className={cn(
                'w-24 h-24 flex-shrink-0 flex items-center justify-center text-2xl font-bold text-foreground',
                'bg-white/30'
              )}
            >
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col bg-surface/80 rounded-r-xl">
            <div className="px-3 pt-2 pb-0.5">
              <h3 className="font-bold text-foreground text-sm truncate">{name}</h3>
            </div>
            <div className="px-3 pb-2 pt-0 flex-1">
              {description && (
                <p className="text-xs text-amber-500 font-medium mb-0.5 line-clamp-1">
                  {description}
                </p>
              )}
              {blurb && (
                <p className="text-xs text-muted-foreground line-clamp-2">{blurb}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )

    if (showLink) {
      return (
        <Link to={`/vendors/${vendorId}`} className="block hover:opacity-90 transition-opacity">
          {card}
        </Link>
      )
    }
    return card
  }

  // Default variant (Homepage, Vendor Listing)
    const card = (
      <div
        className={cn(
          'hover:shadow-md transition-all duration-200 border border-surface-3 relative rounded-xl overflow-visible',
          gradientClass,
          className
        )}
      >
      {showLink && (
        <Link
          to={`/vendors/${vendorId}`}
          className="text-xs text-amber-500 hover:text-amber-600 underline absolute top-2 right-2 z-10"
        >
          vendor profile
        </Link>
      )}
      <div className="flex items-stretch">
        {profileImage ? (
          <img
            src={getFullUploadUrl(profileImage)}
            alt={name}
            className="w-32 h-32 flex-shrink-0 object-cover border-2 border-surface-3 shadow-sm"
          />
        ) : (
          <div
            className={cn(
              'w-32 h-32 flex items-center justify-center text-4xl font-bold text-foreground border-2 border-surface-3 shadow-sm flex-shrink-0',
              'bg-white/30'
            )}
          >
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col bg-surface/80 rounded-r-xl">
          <div className="px-4 pt-3 pb-1">
            <h3 className="font-bold text-foreground text-lg truncate" title={name}>
              {name}
            </h3>
          </div>
          <div className="px-4 pb-3 pt-0 flex-1">
            {description && (
              <p
                className="text-sm text-amber-500 font-medium mb-1 line-clamp-1"
                title={description}
              >
                {description}
              </p>
            )}
            {blurb && (
              <p
                className="text-sm text-muted-foreground leading-relaxed line-clamp-2"
                title={blurb}
              >
                {blurb}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (showLink) {
    return (
      <Link to={`/vendors/${vendorId}`} className="block">
        {card}
      </Link>
    )
  }
  return card
}

VendorCard.displayName = 'VendorCard'

export default VendorCard
