import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Tabs } from '@/components/ui/Tabs'
import { useMarket, useMarkets, useMarketVendors } from '@/features/markets/hooks/useMarkets'
import { CommentList } from '@/components/CommentList'
import { PhotoGallery } from '@/components/PhotoGallery'
import TagVoting from '@/components/TagVoting'
import { ReportIssueModal } from '@/components/ReportIssueModal'
import { useAuthStore } from '@/features/auth/authStore'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatTime12Hour } from '@/utils/formatTime'
import { parseLocalDate } from '@/utils/formatDate'
import { MARKET_CATEGORY_LABELS, MARKET_CATEGORY_COLORS, MARKET_STATUS_COLORS } from '@/config/constants'
import { Search, MapPin, Globe, Phone, Mail, User, Share2, Flag, MessageSquare, Image, DollarSign, Calendar, ArrowLeft, ArrowRight, Car, Footprints, Users, RefreshCw } from 'lucide-react'

const categoryLabels = MARKET_CATEGORY_LABELS
const categoryFlagColors: Record<string, string> = {
  'farmers-market': 'bg-white/60 text-green-700',
  'arts-crafts': 'bg-white/60 text-purple-700',
  'flea-market': 'bg-white/60 text-amber-700',
  'food-festival': 'bg-white/60 text-orange-700',
  'vintage-antique': 'bg-white/60 text-stone-700',
  'craft-show': 'bg-white/60 text-blue-700',
  'night-market': 'bg-white/60 text-indigo-700',
  'street-fair': 'bg-white/60 text-pink-700',
  'holiday-market': 'bg-white/60 text-red-700',
  'community-event': 'bg-white/60 text-teal-700'
}

export const MarketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [vendorSearchTerm, setVendorSearchTerm] = useState('')
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  
  const { market, isLoading, error, refetch } = useMarket(id!)
  
  useEffect(() => {
    setIsPageLoaded(true)
  }, [])
  const {
    trackMarket,
    untrackMarket,
    isMarketTracked,
    isTracking
  } = useMarkets()
  const { vendors: marketVendors } = useMarketVendors(id!)
  const { user } = useAuthStore()

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading market details...</p>
        </div>
      </div>
    )
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-2">Market Not Found</h1>
          <p className="text-muted-foreground text-sm mb-6">
            The market you're looking for doesn't exist or has been removed.
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate('/markets')} className="w-full">
              Browse All Markets
            </Button>
            <Button onClick={() => refetch()} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleTrackToggle = async () => {
    const currentlyTracked = isMarketTracked(market.id)
    
    try {
      if (currentlyTracked) {
        await untrackMarket(market.id)
      } else {
        await trackMarket(market.id)
      }
    } catch (error) {
      console.error('Failed to toggle tracking:', error)
    }
  }

  const formatSchedule = (schedule: any) => {
    if (!schedule) return 'Schedule TBD'

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    let days: string[] = []
    let startTime: string = ''
    let endTime: string = ''
    let allDates: { date: string; dayName: string; startTime: string; endTime: string; displayDate: string }[] = []

    if (Array.isArray(schedule)) {
      if (schedule.length === 0) return 'Schedule TBD'

      allDates = schedule.map((s: any) => {
        const dateObj = parseLocalDate(s.startDate)
        const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const fullDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
        
        return {
          date: monthDay,
          displayDate: fullDate,
          dayName: dayNames[s.dayOfWeek] || 'Unknown',
          startTime: s.startTime,
          endTime: s.endTime
        }
      })

      days = schedule
        .map((s: any) => dayNames[s.dayOfWeek])
        .filter((day: string, index: number, arr: string[]) => arr.indexOf(day) === index)
      const time = schedule[0]
      startTime = time.startTime
      endTime = time.endTime
    } else if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
      days = schedule.daysOfWeek.map((day: string) => {
        const dayMap: { [key: string]: string } = {
          'monday': 'Mon', 'tuesday': 'Tue', 'wednesday': 'Wed', 'thursday': 'Thu',
          'friday': 'Fri', 'saturday': 'Sat', 'sunday': 'Sun'
        }
        return dayMap[day.toLowerCase()] || day
      })
      startTime = schedule.startTime
      endTime = schedule.endTime
    } else {
      return 'Schedule TBD'
    }

    if (allDates.length > 0) {
      if (allDates.length === 1) {
        return `${allDates[0].displayDate} ${formatTime12Hour(startTime)}-${formatTime12Hour(endTime)}`
      } else {
        return allDates.map(d => d.displayDate).join(', ') + ` ${formatTime12Hour(startTime)}-${formatTime12Hour(endTime)}`
      }
    }

    return `${days.join(', ')} ${formatTime12Hour(startTime)}-${formatTime12Hour(endTime)}`
  }

  const formatLocation = (location: any) => {
    if (!location) return 'Address not available'
    return `${location.address || ''}, ${location.city || ''}, ${location.state || ''} ${location.zipCode || ''}`.trim()
  }

  const filteredVendors = marketVendors.filter(vendor =>
    `${vendor.user.firstName} ${vendor.user.lastName}`.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
    vendor.user.username.toLowerCase().includes(vendorSearchTerm.toLowerCase())
  )

  const scheduleDates = Array.isArray(market.schedule) ? market.schedule : []

  return (
    <div className={cn(
      "min-h-screen bg-background",
      isPageLoaded && "animate-in fade-in-0 slide-in-from-top-full duration-500"
    )}>
      <div className="w-full max-w-6xl mx-auto sm:px-4">
      {/* HERO SECTION - Matching MarketCard minimal variant */}
      <div className="relative h-96 md:h-[28rem] overflow-hidden !rounded-none shadow-[0_1px_3px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04),0_-1px_3px_rgba(0,0,0,0.06),0_-2px_6px_rgba(0,0,0,0.03)]">
        {/* Market Image */}
        {market.images && market.images.length > 0 ? (
          <img
            src={market.images[selectedImageIndex]}
            alt={market.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}

        {/* Back Button - Top Left */}
        <div className="absolute top-0 left-0 p-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/markets')}
            className="bg-black/40 border-white/30 text-white hover:bg-black/60 backdrop-blur-sm h-8 px-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Category - Flag style at right edge */}
        <div className={`absolute top-0 -right-2 pl-5 pr-4 py-1.5 ${categoryFlagColors[market.category] || 'bg-white'} text-zinc-900 font-medium text-sm`} style={{ clipPath: 'polygon(15px 0%, 100% 0%, 100% 100%, 0% 100%)' }}>
          {categoryLabels[market.category]}
        </div>

        {/* Track/Follow - Bottom right of hero */}
        <div className="absolute bottom-4 right-4 z-20">
          {isMarketTracked(market.id) ? (
            <button
              onClick={handleTrackToggle}
              disabled={isTracking}
              type="button"
            >
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 drop-shadow-md"
              >
                <rect
                  x="4"
                  y="4"
                  width="40"
                  height="40"
                  rx="12"
                  fill="white"
                  stroke="white"
                  strokeWidth="4"
                />
                <path
                  d="M15 24L21 30L33 18"
                  stroke="#22C55E"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleTrackToggle}
              disabled={isTracking}
              type="button"
            >
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 drop-shadow-md"
              >
                <rect
                  x="4"
                  y="4"
                  width="40"
                  height="40"
                  rx="12"
                  fill="white"
                  stroke="white"
                  strokeWidth="4"
                />
                <path
                  d="M24 14V34M12 24H36"
                  stroke="#E67E22"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Title + Description - Same as MarketCard */}
        <div className="absolute bottom-0 left-0 right-0">
          {/* Dark gradient overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.15) 85%, transparent 100%)'
            }}
          />
          {/* Dark overlay for readability */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0.08) 90%, transparent 100%)'
            }}
          />
          {/* Content */}
          <div className="relative px-4 pt-4 pb-6 pr-16 z-10">
            <h1 className="text-white font-quicksand font-bold text-2xl leading-tight line-clamp-2 drop-shadow-lg" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)' }}>
              {market.name}
            </h1>
            <p className="text-white/90 text-base font-medium leading-relaxed line-clamp-2 mt-2 drop-shadow-md" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
              {market.description}
            </p>
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {market.images && market.images.length > 1 && (
        <div className="flex gap-1.5 p-2 overflow-x-auto bg-muted/30">
          {market.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                selectedImageIndex === index
                  ? "border-accent ring-2 ring-accent/30"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              <img
                src={image}
                alt={`${market.name} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* TABS */}
      <div className="mb-2 sm:mb-2">
        <Tabs
          inactiveTextColor="text-gray-400"
          variant="pills"
          size="md"
          listClassName="bg-black px-4 py-3"
          items={[
            {
              key: 'details',
              label: 'Details',
              content: (
                <div className="space-y-4 pb-4 pt-4 px-4">
                  {/* Left: Location + Schedule / Right: Action Links */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Location */}
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <p className="text-sm">{formatLocation(market.location)}</p>
                      </div>

                      {/* Schedule */}
                      <div className="space-y-2">
                        {scheduleDates.length > 0 ? (
                          scheduleDates.map((scheduleItem: any, index) => {
                            const dateObj = parseLocalDate(scheduleItem.startDate)
                            const displayDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                            
                            return (
                              <div key={index} className="flex items-start gap-3">
                                <Calendar className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-medium text-sm">{displayDate}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatTime12Hour(scheduleItem.startTime)} - {formatTime12Hour(scheduleItem.endTime)}
                                  </p>
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <p className="text-sm text-muted-foreground">Schedule not available</p>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Action Links */}
                    <div className="space-y-4 text-right flex flex-col items-end">
                      {market.promoter && (
                        <>
                          <button
                            className="text-base font-medium text-accent hover:underline inline-flex items-center gap-2 cursor-pointer"
                            onClick={() => navigate('/fake-404')}
                          >
                            {market.marketType === 'promoter-managed' ? 'Promoter Managed' : 'Community Submitted'}
                            <Users className="w-4 h-4" />
                          </button>
                          <button
                            className="text-base font-medium text-primary hover:underline inline-flex items-center gap-2 cursor-pointer"
                            onClick={() => navigate('/fake-404')}
                          >
                            Official Link
                            <Globe className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {market.location?.address && (
                        <button
                          className="text-base font-medium text-primary hover:underline inline-flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            const address = formatLocation(market.location)
                            window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank')
                          }}
                        >
                          Directions
                          <MapPin className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {user && (
                    <TagVoting
                      marketTags={market.tags || []}
                      marketId={id!}
                      className="mt-8 mb-6"
                    />
                  )}

{/* Booth Fee */}
                  {market.pricing?.boothFee !== undefined && market.pricing?.boothFee !== 0 && (
                    <div className="mt-10 space-y-2">
                      <h2 className="font-semibold text-sm flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Booth Fee
                      </h2>
                      <p className="text-lg font-semibold">
                        {market.pricing.isFree ? 'Free' : formatCurrency(market.pricing.boothFee)}
                      </p>
                    </div>
                  )}

                  {/* Spacer before Accessibility */}
                  <div className="h-2" />

                  {/* Accessibility - Grid */}
                  <div className="mt-12 space-y-2">
                    <h2 className="text-lg font-medium">Accessibility & Amenities</h2>
                      <div className="grid grid-cols-2 gap-2">
                        {market.accessibility?.wheelchairAccessible && (
                          <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                            <span className="text-green-600">✓</span>
                            <span>Wheelchair</span>
                          </div>
                        )}
                        {market.accessibility?.parkingAvailable && (
                          <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                            <span className="text-green-600">✓</span>
                            <span>Parking</span>
                          </div>
                        )}
                        {market.accessibility?.restroomsAvailable && (
                          <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                            <span className="text-green-600">✓</span>
                            <span>Restrooms</span>
                          </div>
                        )}
                       {market.accessibility?.familyFriendly && (
                         <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                           <span className="text-green-600">✓</span>
                           <span>Family</span>
                         </div>
                       )}
                       {market.accessibility?.indoor && (
                         <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                           <span className="text-green-600">✓</span>
                           <span>Indoor</span>
                         </div>
                       )}
                       {market.accessibility?.petFriendly && (
                         <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                           <span className="text-green-600">✓</span>
                           <span>Pets</span>
                         </div>
                       )}
                       {market.accessibility?.wifi && (
                         <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                           <span className="text-green-600">✓</span>
                           <span>WiFi</span>
                         </div>
                       )}
                       {market.accessibility?.atm && (
                         <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                           <span className="text-green-600">✓</span>
                           <span>ATM</span>
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Quick Actions - Share, Report & Update */}
                  <div className="mt-8 grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: market.name, url: window.location.href })
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10"
                      onClick={() => setShowReportModal(true)}
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </Button>
                    <Button
variant="outline"
                      size="sm"
                      className="h-10"
                      onClick={() => setShowUpdateModal(true)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                  </div>
                </div>
              )
            },
            {
              key: 'vendors',
              label: 'Vendors',
              content: (
                <div className="space-y-4 pb-4 pt-4 px-4">
                  {/* Vendors Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">
                      {filteredVendors.length} Vendors Attending
                    </h2>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search vendors..."
                      value={vendorSearchTerm}
                      onChange={(e) => setVendorSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  {/* Vendor List - Homepage Mock Style */}
                  {filteredVendors.length > 0 ? (
                    <div className="space-y-3">
                      {filteredVendors.map((vendor, index) => (
                        <div key={index} className="bg-surface border border-surface-3 rounded-lg overflow-hidden">
                          <div className="flex items-start">
                            <div className={`w-24 h-24 flex-shrink-0 flex items-center justify-center text-2xl font-bold text-foreground ${vendor.color || 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'}`}>
                              {vendor.user.firstName?.[0]}{vendor.user.lastName?.[0]}
                            </div>
                            <div className="flex-1 min-w-0 p-3">
                              <h3 className="font-bold text-foreground text-sm truncate">{vendor.name}</h3>
                              {vendor.description && (
                                <p className="text-xs text-amber-500 font-medium mb-1 line-clamp-2">{vendor.description}</p>
                              )}
                              {vendor.blurb && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{vendor.blurb}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        {vendorSearchTerm ? 'No vendors match your search' : 'No vendors yet'}
                      </p>
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'comments',
              label: 'Comments',
              icon: <MessageSquare className="w-4 h-4" />,
              content: (
                <div className="pb-4 pt-4 px-4">
                  <CommentList marketId={id!} />
                </div>
              )
            },
            {
              key: 'photos',
              label: 'Photos',
              icon: <Image className="w-4 h-4" />,
              content: (
                <div className="pb-4 pt-4 px-4">
                  <PhotoGallery
                    marketId={id!}
                    showUpload={!!user && (user.role === 'vendor' || user.role === 'promoter')}
                  />
                </div>
              )
            }
          ]}
          defaultActiveKey="details"
          className="w-full"
          fullWidth
          />
        </div>

      {/* Update Status Button (for tracked markets) */}
      {isMarketTracked(market.id) && (
        <div className="px-4 py-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9"
            onClick={() => setShowStatusModal(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Update My Status
          </Button>
        </div>
      )}

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        marketId={market.id}
        marketName={market.name}
      />

      {/* Update Request Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-background rounded-t-xl sm:rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-background">
              <h3 className="font-semibold">Request Update</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Help keep this market information up to date. Report any changes, updates, or corrections needed.
              </p>
              <textarea
                className="w-full p-3 text-sm bg-surface rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[100px]"
                placeholder="Describe what needs to be updated..."
              />
            </div>
            <div className="p-4 border-t sticky bottom-0 bg-background">
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowUpdateModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Implement update submission
                    setShowUpdateModal(false)
                  }}
                  className="flex-1"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-background rounded-t-xl sm:rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-background">
              <h3 className="font-semibold">Update Your Status</h3>
            </div>
            <div className="p-4 space-y-2">
              {[
                { value: 'interested', label: 'Interested' },
                { value: 'applied', label: 'Applied' },
                { value: 'approved', label: 'Approved' },
                { value: 'attending', label: 'Attending' },
                { value: 'declined', label: 'Declined' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'completed', label: 'Completed' },
                { value: 'archived', label: 'Archived' }
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={async () => {
                    try {
                      await trackMarket(market.id, status.value)
                      setShowStatusModal(false)
                    } catch (error) {
                      console.error('Failed to update status:', error)
                    }
                  }}
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent/50 transition-colors min-h-[44px]"
                >
                  {status.label}
                </button>
              ))}
            </div>
            <div className="p-4 border-t sticky bottom-0 bg-background">
              <Button
                variant="outline"
                onClick={() => setShowStatusModal(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}