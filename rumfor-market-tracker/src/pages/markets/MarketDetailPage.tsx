import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Tabs } from '@/components/ui/Tabs'
import { useMarket, useTrackedMarkets, useMarketVendors } from '@/features/markets/hooks/useMarkets'
import { CommentList } from '@/components/CommentList'
import { PhotoGallery } from '@/components/PhotoGallery'
import TagVoting from '@/components/TagVoting'
import { VendorCard } from '@/components/VendorCard'
import { ReportIssueModal } from '@/components/ReportIssueModal'
import { useAuthStore } from '@/features/auth/authStore'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatTime12Hour } from '@/utils/formatTime'
import { parseLocalDate } from '@/utils/formatDate'
import { MARKET_CATEGORY_LABELS, MARKET_CATEGORY_COLORS, MARKET_STATUS_COLORS } from '@/config/constants'
import { TRACKING_STATUS_OPTIONS, TRACKING_STATUS_COLORS, TRACKING_STATUS_LABELS } from '@/config/trackingStatus'
import { Search, MapPin, Globe, Phone, Mail, User, Share2, Flag, MessageSquare, Image, DollarSign, Calendar, ArrowLeft, ArrowRight, Car, Footprints, Users, RefreshCw, Info, X, ChevronDown, Clock, Eye } from 'lucide-react'
import { TrackButton } from '@/components/TrackButton'
import { StatusChangeModal } from '@/components/StatusChangeModal'
import { RelatedMarketDates } from '@/components/RelatedMarketDates'

const categoryLabels = MARKET_CATEGORY_LABELS
const categoryFlagColors: Record<string, string> = {
  'farmers-market': 'bg-white text-green-700',
  'arts-crafts': 'bg-white text-purple-700',
  'flea-market': 'bg-white text-amber-700',
  'food-festival': 'bg-white text-orange-700',
  'vintage-antique': 'bg-white text-stone-700',
  'craft-show': 'bg-white text-blue-700',
  'night-market': 'bg-white text-indigo-700',
  'street-fair': 'bg-white text-pink-700',
  'holiday-market': 'bg-white text-red-700',
  'community-event': 'bg-white text-teal-700'
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isTextTruncated, setIsTextTruncated] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const descriptionRef = React.useRef<HTMLParagraphElement>(null)
  
  const { market, isLoading, error, refetch } = useMarket(id!)
  
  useEffect(() => {
    setIsPageLoaded(true)
  }, [])
  const {
    trackMarket,
    untrackMarket,
    isMarketTracked,
    isTracking,
    getTrackingStatus
  } = useTrackedMarkets()
  const { vendors: marketVendors, refetch: refetchVendors } = useMarketVendors(id!)
  const { user } = useAuthStore()

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  React.useEffect(() => {
    if (descriptionRef.current) {
      const { scrollHeight, clientHeight } = descriptionRef.current
      setIsTextTruncated(scrollHeight > clientHeight)
    }
  }, [market?.description])

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

  const handleStatusChange = async (newStatus: string) => {
    try {
      await trackMarket(market.id, newStatus)
      setShowStatusModal(false)
      setTimeout(() => {
        refetchVendors()
      }, 1000)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const trackingStatus = getTrackingStatus(market.id)?.status as keyof typeof TRACKING_STATUS_LABELS || 'interested'

  // Get primary market ID for shared comments (split markets share comments)
  const getPrimaryMarketId = (): string => {
    const splitTag = market.tags?.find(tag => tag.startsWith('split-market:'))
    if (splitTag) {
      const tagContent = splitTag.replace('split-market:', '')
      // Handle both old format (id1,id2) and new format (id1:date1,id2:date2)
      const parts = tagContent.split(',')
      const firstPart = parts[0]
      // Extract just the ID (before the colon if present)
      const primaryId = firstPart.includes(':') ? firstPart.split(':')[0] : firstPart
      return primaryId
    }
    return market.id // Not a split market, use current ID
  }
  
  const commentsMarketId = getPrimaryMarketId()

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
    const address = location.address && location.address !== 'TBD' ? location.address : ''
    const city = location.city || ''
    const state = location.state || ''
    const zipCode = location.zipCode && location.zipCode !== '00000' ? location.zipCode : ''
    const parts = [address, city, state, zipCode].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Address not available'
  }

  const filteredVendors = (marketVendors || []).filter((vendor: any) => {
    const searchTerm = vendorSearchTerm.toLowerCase()
    const fullName = `${vendor.user?.firstName || ''} ${vendor.user?.lastName || ''}`.toLowerCase()
    const name = (vendor.name || '').toLowerCase()
    const description = (vendor.description || '').toLowerCase()
    const blurb = (vendor.blurb || '').toLowerCase()
    const username = (vendor.user?.username || '').toLowerCase()
    
    return fullName.includes(searchTerm) ||
      name.includes(searchTerm) ||
      description.includes(searchTerm) ||
      blurb.includes(searchTerm) ||
      username.includes(searchTerm)
  })

  const scheduleDates = Array.isArray(market.schedule) ? market.schedule : []

  return (
    <div className={cn(
      "min-h-screen bg-background",
      isPageLoaded && "animate-in fade-in-0 slide-in-from-top-full duration-500"
    )}>
      <div className="w-full max-w-6xl mx-auto sm:px-4">
      {/* HERO SECTION - Matching MarketCard minimal variant */}
      <div className={cn(
        "relative overflow-hidden !rounded-none shadow-[0_1px_3px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04),0_-1px_3px_rgba(0,0,0,0.06),0_-2px_6px_rgba(0,0,0,0.03)]",
        isDescriptionExpanded ? "min-h-96 md:min-h-[28rem] h-auto" : "h-96 md:h-[28rem]"
      )}>
        {/* Market Image - Fixed height background */}
        <div className="absolute inset-0 h-96 md:h-[28rem]">
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
        </div>

        {/* Back Button - Top Left */}
        <div className="absolute top-0 left-0 p-3 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="bg-white border-white text-black hover:bg-white/90 h-8 px-3 shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Track/Status Button - Top Right */}
        <div className="absolute top-0 right-0 p-3 z-10">
          {isMarketTracked(market.id) ? (
            <button
              onClick={() => setShowStatusModal(true)}
              className={cn(
                'flex items-center gap-2 text-sm font-semibold text-white border-0 shadow-lg px-4 py-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity',
                TRACKING_STATUS_COLORS[trackingStatus]
              )}
            >
              <span>{TRACKING_STATUS_LABELS[trackingStatus]}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          ) : (
            <TrackButton
              isTracked={false}
              onClick={handleTrackToggle}
              disabled={isTracking}
            />
          )}
        </div>

        {/* Rotating Vendors - Center Top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 flex pt-3">
          {/* Rotating Vendors - only for split markets */}
          {market.tags?.some(tag => tag.startsWith('split-market:')) && (
            <div className="px-4 py-2 bg-amber-500 text-white font-semibold text-sm rounded-full shadow-lg flex items-center gap-2">
              <span>Rotating Vendors</span>
              {scheduleDates.length > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(scheduleDates[0].startDate).getDate()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Expand/Collapse description - Bottom right of hero */}
        {isTextTruncated && (
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="absolute bottom-4 right-0 z-20 flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-3 py-1.5 rounded-l-full hover:bg-white/90 transition-opacity shadow-lg"
          >
            {isDescriptionExpanded ? (
              <>
                <span>Show less</span>
                <ChevronDown className="w-4 h-4 rotate-180" />
              </>
            ) : (
              <>
                <span>Read more</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}

        {/* Title + Description - always absolute, animate with transforms */}
        <div className={cn(
          "absolute left-0 right-0 bottom-0 transition-all duration-500 ease-in-out",
          isDescriptionExpanded && "top-0"
        )}>
          {/* Dark gradient background */}
          <div 
            className={cn(
              "absolute left-0 right-0 bottom-0 transition-all duration-500",
              isDescriptionExpanded ? "top-0" : "inset-0"
            )}
            style={{
              background: isDescriptionExpanded
                ? 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.98) 20%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.7) 80%, rgba(0,0,0,0.4) 100%)'
                : 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.3) 85%, transparent 100%)'
            }}
          />
          
          {/* Content */}
          <div className={cn(
            "relative px-4 pt-4 z-10 transition-[padding] duration-500 ease-out",
            isDescriptionExpanded ? "pb-16 pr-28" : "pb-6 pr-16"
          )}>
            {/* Thumbnail preview button */}
            {market.images && market.images.length > 0 && (
              <button
                onClick={() => setShowImagePreview(true)}
                className="max-w-36 max-h-36 rounded-lg overflow-hidden border-2 border-white hover:border-white transition-all mb-3 shadow-[0_4px_14px_rgba(0,0,0,0.35)] inline-block relative"
              >
                <img
                  src={market.images[selectedImageIndex]}
                  alt={market.name}
                  className="max-w-full max-h-36 object-contain"
                />
                <div className="absolute bottom-1 left-1 bg-white/90 rounded p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <Eye className="w-4 h-4 text-black" />
                </div>
              </button>
            )}
            <h1 className="text-white font-quicksand font-bold text-xl leading-tight line-clamp-2 drop-shadow-lg" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)' }}>
              {market.name}
            </h1>
            <p
              ref={descriptionRef}
              className={cn(
                "text-white/90 text-base font-medium leading-relaxed mt-2 drop-shadow-md overflow-hidden transition-[max-height] duration-500 ease-in-out",
                isDescriptionExpanded ? "max-h-96" : "max-h-12"
              )}
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
            >
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
      <div className="mb-2 sm:mb-2 overflow-hidden">
        <Tabs
          inactiveTextColor="text-gray-400"
          variant="pills"
          size="md"
          listClassName="bg-black px-2 sm:px-4 py-3 gap-1 sm:gap-2"
          items={[
            {
              key: 'details',
              label: 'Info',
              icon: <Info className="w-4 h-4" />,
              content: (
                <div className="space-y-4 pb-4 pt-0 px-4 pb-[100px]">
                  {/* Quick Actions - Share, Report & Update */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 hover:text-accent hover:border-accent"
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
                      variant="ghost"
                      size="sm"
                      className="h-10 text-muted-foreground/40 hover:text-muted-foreground/40 hover:bg-transparent"
                      onClick={() => setShowReportModal(true)}
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 text-muted-foreground/40 hover:text-muted-foreground/40 hover:bg-transparent"
                      onClick={() => setShowUpdateModal(true)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                  </div>

                  {/* Left: Location + Schedule / Right: Action Links */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Location */}
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <p className="text-sm">{formatLocation(market.location)}</p>
                      </div>

                      {/* Schedule - only show if NOT a split market */}
                      {!market.tags?.some(tag => tag.startsWith('split-market:')) && (
                        <div className="space-y-2">
                          {scheduleDates.length > 0 ? (
                            scheduleDates.map((scheduleItem: any, index) => {
                              const dateObj = parseLocalDate(scheduleItem.startDate)
                              const displayDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                              
                              return (
                                <div key={index} className="flex items-start gap-2">
                                  <Calendar className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-sm">{displayDate}</p>
                                    <p className="text-xs text-muted-foreground">
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
                      )}
                      
                      {/* Related Market Dates - for split markets */}
                      {market.tags?.some(tag => tag.startsWith('split-market:')) && (
                        <div className="mt-3">
                          <div className="mb-3">
                            <h3 className="text-base font-bold flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-accent" />
                              Rotating Vendors
                            </h3>
                            <span className="text-xs text-muted-foreground ml-7">(select date to view)</span>
                          </div>
                          <RelatedMarketDates market={market} variant="tabs" />
                        </div>
                      )}
                    </div>

                    {/* Right Column: Action Links */}
                    <div className="space-y-4 text-right flex flex-col items-end">
                      {market.applicationSettings?.applicationLink && (
                        <a
                          href={market.applicationSettings.applicationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-medium text-primary hover:underline inline-flex items-center gap-2"
                        >
                          Apply Here
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                      {market.applicationSettings?.applicationDeadline && (
                        <span className="text-xs font-medium text-muted-foreground inline-flex items-center gap-2">
                          App Deadline: {new Date(market.applicationSettings.applicationDeadline + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          <Clock className="w-4 h-4" />
                        </span>
                      )}
                      {market.promoter && (
                        <span className="text-xs font-bold text-accent inline-flex items-center gap-2">
                          {market.marketType === 'promoter-managed' ? 'Promoter Managed' : 'Community Submitted'}
                          <Users className="w-4 h-4" />
                        </span>
                      )}
                      {market.contact?.website && (
                        <a
                          href={market.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-medium text-primary hover:underline inline-flex items-center gap-2"
                        >
                          Official Website
                          <Globe className="w-4 h-4" />
                        </a>
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
                  <TagVoting
                    marketTags={(market.tags || []).filter(tag => !tag.startsWith('split-market:'))}
                    marketId={id!}
                    className="mt-8 mb-6"
                  />

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

                  <hr className="border-t border-gray-200 my-8" />

                  {/* Vendors Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-lg font-medium">
                        {filteredVendors.length > 0 ? `${filteredVendors.length} ` : ''}Vendors Attending
                      </h2>
                      <div className="relative w-48">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                          type="text"
                          placeholder="Filter vendors..."
                          value={vendorSearchTerm}
                          onChange={(e) => setVendorSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 text-sm bg-surface rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm shadow-black/15"
                        />
                      </div>
                    </div>

                    {/* Official Market Page Notice - only when vendors exist */}
                    {market.contact?.website && filteredVendors.length > 0 && (
                      <div className="text-center bg-white px-4 py-3 text-sm -mx-4 sm:mx-0 sm:rounded-lg rounded-none">
                        <p className="text-muted-foreground">
                          Visit the{' '}
                          <a
                            href={market.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent font-medium hover:underline"
                          >
                            Official Market Page
                          </a>
                          {' '}for their complete vendor list
                        </p>
                      </div>
                    )}

                    {filteredVendors.length > 0 ? (
                      <div className="space-y-3">
                        {filteredVendors.map((vendor, index) => (
                          <VendorCard
                            key={vendor.user?.id || index}
                            vendor={vendor}
                            variant="compact"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-base font-medium text-muted-foreground flex items-center justify-center gap-2">
                          {vendorSearchTerm ? 'No vendors match your search' : (
                            <>
                              <Users className="w-5 h-5" />
                              No Vendors Listed on Rumfor
                            </>
                          )}
                        </p>
                        {!vendorSearchTerm && market.contact?.website && (
                          <div className="inline-block bg-white border-2 border-black rounded-lg px-6 py-3 mt-4 text-base">
                            <p className="text-muted-foreground">
                              Visit the{' '}
                              <a
                                href={market.contact.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent font-semibold hover:underline"
                              >
                                Official Market Page
                              </a>
                              <br />
                              <span>for their complete vendor list</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            },
            {
              key: 'photos',
              label: 'Photos',
              icon: <Image className="w-4 h-4" />,
              content: (
                <div className="pb-4 pt-4 px-4 pb-[100px]">
                  <p className="text-center text-muted-foreground py-8">Disabled at the moment</p>
                </div>
              )
            },
            {
              key: 'comments',
              label: 'Comments',
              icon: <MessageSquare className="w-4 h-4" />,
              content: (
                <div className="py-2 px-0 sm:py-4 sm:px-4 pb-[100px]">
                  <CommentList marketId={commentsMarketId} />
                </div>
              )
            }
          ]}
          defaultActiveKey="details"
          className="w-full"
          fullWidth
          />
        </div>

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

      {/* Image Preview Modal */}
      {showImagePreview && market.images && market.images.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100]"
          onClick={() => setShowImagePreview(false)}
        >
          <button
            onClick={() => setShowImagePreview(false)}
            className="absolute top-4 right-4 bg-white rounded-full p-2 text-black"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={market.images[selectedImageIndex]}
            alt={market.name}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Status Update Modal */}
      <StatusChangeModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        currentStatus={trackingStatus as string}
        statusOptions={TRACKING_STATUS_OPTIONS}
        onStatusChange={handleStatusChange}
        onUntrack={handleTrackToggle}
      />

      {/* Bottom spacer for floating navbar */}
      <div className="h-24" />
      </div>
    </div>
  )
}