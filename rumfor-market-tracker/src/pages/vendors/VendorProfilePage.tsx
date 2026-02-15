import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Phone, Globe, MapPin, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useVendorProfile } from '@/features/vendor/hooks/useVendors'
import { getFullUploadUrl } from '@/config/constants'
import { formatTime12Hour } from '@/utils/formatTime'

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

const EtsyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 16.5h-9v-1.5h3.75V9H7.5V7.5h9V9h-3.75v6H16.5v1.5z"/>
  </svg>
)

const ShoppingBagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)

const formatMarketSchedule = (schedule: any): { dateStr: string; timeStr: string } => {
  if (!schedule) return { dateStr: 'TBD', timeStr: '' }

  if (typeof schedule === 'object' && !Array.isArray(schedule)) {
    const schedObj = schedule as any

    if (schedObj.specialDates && Array.isArray(schedObj.specialDates) && schedObj.specialDates.length > 0) {
      const sorted = [...schedObj.specialDates]
        .filter((s: any) => s.date)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      if (sorted.length > 0) {
        const first = new Date(sorted[0].date)
        const last = new Date(sorted[sorted.length - 1].date)
        const startTime = sorted[0].startTime || schedObj.startTime || '09:00'
        const endTime = sorted[0].endTime || schedObj.endTime || '17:00'
        
        if (sorted.length === 1) {
          return {
            dateStr: first.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            timeStr: `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`
          }
        }
        return {
          dateStr: `${first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${last.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          timeStr: `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`
        }
      }
    }

    if (schedObj.daysOfWeek && Array.isArray(schedObj.daysOfWeek) && schedObj.daysOfWeek.length > 0) {
      return {
        dateStr: `Every ${schedObj.daysOfWeek[0].charAt(0).toUpperCase() + schedObj.daysOfWeek[0].slice(1)}`,
        timeStr: `${formatTime12Hour(schedObj.startTime || '09:00')} - ${formatTime12Hour(schedObj.endTime || '17:00')}`
      }
    }
  }

  if (Array.isArray(schedule) && schedule.length > 0) {
    const sorted = schedule
      .filter((s: any) => s && s.startDate)
      .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    
    if (sorted.length > 0) {
      const first = new Date(sorted[0].startDate)
      const last = sorted.length > 1 ? new Date(sorted[sorted.length - 1].startDate) : first
      
      if (sorted.length === 1) {
        return {
          dateStr: first.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          timeStr: `${formatTime12Hour(sorted[0].startTime || '09:00')} - ${formatTime12Hour(sorted[0].endTime || '17:00')}`
        }
      }
      return {
        dateStr: `${first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${last.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        timeStr: `${formatTime12Hour(sorted[0].startTime || '09:00')} - ${formatTime12Hour(sorted[0].endTime || '17:00')}`
      }
    }
  }

  return { dateStr: 'TBD', timeStr: '' }
}

const formatLocation = (location: any): string => {
  if (!location) return ''
  const parts = [location.city, location.state].filter(Boolean)
  return parts.join(', ')
}

const getSortDate = (schedule: any): Date => {
  if (!schedule) return new Date(0)

  if (typeof schedule === 'object' && !Array.isArray(schedule)) {
    const schedObj = schedule as any

    if (schedObj.specialDates && Array.isArray(schedObj.specialDates) && schedObj.specialDates.length > 0) {
      const first = schedObj.specialDates.find((s: any) => s.date)
      if (first) return new Date(first.date)
    }

    if (schedObj.daysOfWeek && Array.isArray(schedObj.daysOfWeek) && schedObj.daysOfWeek.length > 0) {
      const today = new Date()
      const dayName = schedObj.daysOfWeek[0].toLowerCase()
      const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayName)
      if (dayIndex !== -1) {
        const result = new Date(today)
        result.setDate(today.getDate() + ((dayIndex + 7 - today.getDay()) % 7 || 7))
        return result
      }
    }
  }

  if (Array.isArray(schedule) && schedule.length > 0) {
    const first = schedule.find((s: any) => s && s.startDate)
    if (first) return new Date(first.startDate)
  }

  return new Date(0)
}

export const VendorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { vendor, isLoading, error } = useVendorProfile(id || '')
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

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
  const profileImage = vendor.profileImage ? getFullUploadUrl(vendor.profileImage) : null
  const galleryImages = vendor.galleryImages || []
  const hasSocialLinks = vendor.instagram || vendor.facebook || vendor.tiktok || vendor.website || vendor.publicPhone || vendor.etsy || vendor.shoppingLink
  const vendorLocation = vendor.city && vendor.state ? `${vendor.city}, ${vendor.state}` : vendor.city || vendor.state || null

  return (
    <div className="min-h-screen pb-8">
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={lightboxImage} 
            alt="Product" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Banner */}
        <div className="relative h-72 overflow-hidden bg-black">
          {profileImage ? (
            <img src={profileImage} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-5xl font-bold text-muted-foreground ${vendor.cardColor ? 'bg-white/30' : ''}`}>
              {initials}
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
          {vendor.productCategories && vendor.productCategories.length > 0 && (
            <div className="absolute top-0 left-0 right-0 p-4 flex flex-wrap gap-2">
              {vendor.productCategories.map((cat) => (
                <span key={cat} className="px-3 py-1 rounded-full text-xs bg-white border border-gray-200 text-foreground font-medium">
                  {cat.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">{displayName}</h1>
            {vendor.tagline && (
              <p className="text-base text-white/90 mt-1">{vendor.tagline}</p>
            )}
          </div>
        </div>

        <div className="bg-black px-4 py-4">
          {(vendor.bio || vendor.blurb) && (
            <p className="text-sm text-white/90 leading-relaxed">{vendor.bio || vendor.blurb}</p>
          )}
          {vendorLocation && (
            <p className="text-sm text-white/70 mt-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {vendorLocation}
            </p>
          )}
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Social Links */}
          {hasSocialLinks && (
            <div className="flex flex-wrap gap-3">
              {vendor.publicPhone && (
                <a href={`tel:${vendor.publicPhone}`} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 shadow-md text-sm text-foreground font-medium hover:bg-gray-50 transition-colors">
                  <Phone className="w-5 h-5" />
                  <span>{vendor.publicPhone}</span>
                </a>
              )}
              {vendor.website && (
                <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 shadow-md text-sm text-foreground font-medium hover:bg-gray-50 transition-colors">
                  <Globe className="w-5 h-5" />
                  <span>Website</span>
                </a>
              )}
              {vendor.instagram && (
                <a href={`https://instagram.com/${vendor.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 shadow-md text-sm text-foreground font-medium hover:bg-gray-50 transition-colors">
                  <InstagramIcon />
                  <span>{vendor.instagram}</span>
                </a>
              )}
              {vendor.facebook && (
                <a href={`https://facebook.com/${vendor.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 shadow-md text-sm text-foreground font-medium hover:bg-gray-50 transition-colors">
                  <FacebookIcon />
                  <span>Facebook</span>
                </a>
              )}
              {vendor.tiktok && (
                <a href={`https://tiktok.com/${vendor.tiktok.startsWith('@') ? vendor.tiktok : '@' + vendor.tiktok}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 shadow-md text-sm text-foreground font-medium hover:bg-gray-50 transition-colors">
                  <TikTokIcon />
                  <span>{vendor.tiktok}</span>
                </a>
              )}
              {vendor.etsy && (
                <a href={vendor.etsy} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 shadow-md text-sm text-foreground font-medium hover:bg-gray-50 transition-colors">
                  <EtsyIcon />
                  <span>Etsy</span>
                </a>
              )}
              {vendor.shoppingLink && (
                <a href={vendor.shoppingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 shadow-md text-sm text-foreground font-medium hover:bg-gray-50 transition-colors">
                  <ShoppingBagIcon />
                  <span>Shop</span>
                </a>
              )}
            </div>
          )}

          {/* Gallery */}
          {galleryImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setLightboxImage(img)}
                  className="aspect-square rounded-xl overflow-hidden bg-surface-2 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="h-1" />

        {/* Upcoming Markets */}
        <section className="px-4 py-8">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Markets
            </h2>

            {vendor.upcomingMarkets && vendor.upcomingMarkets.length > 0 ? (
              <div className="space-y-4">
                {vendor.upcomingMarkets
                  .slice()
                  .sort((a, b) => getSortDate(a.schedule).getTime() - getSortDate(b.schedule).getTime())
                  .map((market) => {
                  const { dateStr, timeStr } = formatMarketSchedule(market.schedule)
                  const locationStr = formatLocation(market.location)
                  const marketImage = market.images?.[0]?.url ? getFullUploadUrl(market.images[0].url) : null
                  return (
                    <Link
                      key={market.id}
                      to={`/markets/${market.id}`}
                      className="flex items-stretch bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="w-20 h-20 flex-shrink-0">
                        {marketImage ? (
                          <img src={marketImage} alt={market.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 p-3 flex-1 flex flex-col justify-center">
                        <p className="font-medium text-foreground truncate">{market.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-amber-700 font-semibold">{dateStr}</span>
                          {timeStr && (
                            <span className="text-sm text-muted-foreground">{timeStr}</span>
                          )}
                        </div>
                        {locationStr && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {locationStr}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center pr-4">
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-white border border-gray-200 shadow-md rounded-xl">
                <p className="text-sm text-muted-foreground">No upcoming markets</p>
              </div>
            )}
          </section>
        <div className="h-24" />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-5xl mx-auto">
          {/* Banner */}
          <div className={`relative h-80 rounded-b-2xl overflow-hidden ${vendor.cardColor || 'bg-surface-2'}`}>
            {profileImage ? (
              <img src={profileImage} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-8xl font-bold text-muted-foreground ${vendor.cardColor ? 'bg-white/30' : ''}`}>
                {initials}
              </div>
            )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">{displayName}</h1>
              {vendor.tagline && (
                <p className="text-lg text-white/90 mt-1">{vendor.tagline}</p>
              )}
              {vendor.productCategories && vendor.productCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {vendor.productCategories.map((cat) => (
                    <span
                      key={cat}
                      className="px-4 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-foreground"
                    >
                      {cat.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-12 gap-8">
              {/* Left Column */}
              <div className="col-span-4 space-y-6">
                {/* Bio */}
                {(vendor.bio || vendor.blurb) && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">About</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {vendor.bio || vendor.blurb}
                    </p>
                  </div>
                )}

                {/* Location */}
                {vendorLocation && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{vendorLocation}</span>
                  </div>
                )}

                {/* Social Links */}
                {hasSocialLinks && (
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Contact & Links</h3>
                    <div className="flex flex-wrap gap-2">
                      {vendor.publicPhone && (
                        <a href={`tel:${vendor.publicPhone}`} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 shadow-md text-sm text-foreground font-medium hover:bg-gray-50 transition-colors">
                          <Phone className="w-5 h-5" />
                          <span>{vendor.publicPhone}</span>
                        </a>
                      )}
                      {vendor.website && (
                        <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 shadow-md text-sm text-foreground font-medium hover:bg-gray-50 transition-colors">
                          <Globe className="w-5 h-5" />
                          <span>{vendor.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      )}
                      {vendor.instagram && (
                        <a href={`https://instagram.com/${vendor.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 shadow-md text-sm text-foreground font-medium hover:bg-gray-50 transition-colors">
                          <InstagramIcon />
                          <span>{vendor.instagram}</span>
                        </a>
                      )}
                      {vendor.facebook && (
                        <a href={`https://facebook.com/${vendor.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 shadow-md text-sm text-foreground font-medium hover:bg-gray-50 transition-colors">
                          <FacebookIcon />
                          <span>{vendor.facebook}</span>
                        </a>
                      )}
                      {vendor.tiktok && (
                        <a href={`https://tiktok.com/${vendor.tiktok.startsWith('@') ? vendor.tiktok : '@' + vendor.tiktok}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 shadow-md text-sm text-foreground font-medium hover:bg-gray-50 transition-colors">
                          <TikTokIcon />
                          <span>{vendor.tiktok}</span>
                        </a>
                      )}
                      {vendor.etsy && (
                        <a href={vendor.etsy} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 shadow-md text-sm text-foreground font-medium hover:bg-gray-50 transition-colors">
                          <EtsyIcon />
                          <span>Etsy</span>
                        </a>
                      )}
                      {vendor.shoppingLink && (
                        <a href={vendor.shoppingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 shadow-md text-sm text-foreground font-medium hover:bg-gray-50 transition-colors">
                          <ShoppingBagIcon />
                          <span>Shop</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="col-span-8">
                {/* Gallery */}
                {galleryImages.length > 0 && (
                  <section className="mb-8">
                    <div className="grid grid-cols-3 gap-4">
                      {galleryImages.map((img, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setLightboxImage(img)}
                          className="aspect-square rounded-xl overflow-hidden bg-surface-2 cursor-pointer"
                        >
                          <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Upcoming Markets */}
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Markets
                  </h2>

                  {vendor.upcomingMarkets && vendor.upcomingMarkets.length > 0 ? (
                    <div className="space-y-4">
                      {vendor.upcomingMarkets
                        .slice()
                        .sort((a, b) => getSortDate(a.schedule).getTime() - getSortDate(b.schedule).getTime())
                        .map((market) => {
                        const { dateStr, timeStr } = formatMarketSchedule(market.schedule)
                        const locationStr = formatLocation(market.location)
                        const marketImage = market.images?.[0]?.url ? getFullUploadUrl(market.images[0].url) : null
                        return (
                          <Link
                            key={market.id}
                            to={`/markets/${market.id}`}
                            className="flex items-stretch bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                          >
                            <div className="w-48 h-24 flex-shrink-0">
                              {marketImage ? (
                                <img src={marketImage} alt={market.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                                  <Calendar className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 p-3 flex-1 flex flex-col justify-center">
                              <p className="font-medium text-foreground truncate">{market.name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-amber-700 font-semibold">{dateStr}</span>
                                {timeStr && (
                                  <span className="text-sm text-muted-foreground">{timeStr}</span>
                                )}
                              </div>
                              {locationStr && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {locationStr}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center pr-4">
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white border border-gray-200 shadow-md rounded-xl">
                      <p className="text-muted-foreground">No upcoming markets listed</p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
        <div className="h-24" />
      </div>
    </div>
  )
}

export default VendorProfilePage
