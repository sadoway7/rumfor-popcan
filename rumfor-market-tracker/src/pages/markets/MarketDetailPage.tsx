import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Tabs } from '@/components/ui/Tabs'
import { Modal } from '@/components/ui/Modal'
import { useMarket, useTrackedMarkets, useMarketVendors } from '@/features/markets/hooks/useMarkets'
import { useWeather } from '@/features/markets/hooks/useWeather'
import { usePreferencesStore } from '@/features/theme/themeStore'
import { CommentList } from '@/components/CommentList'
import { PhotoGallery } from '@/components/PhotoGallery'
import TagVoting from '@/components/TagVoting'
import { VendorCard } from '@/components/VendorCard'
import { ReportIssueModal } from '@/components/ReportIssueModal'
import { SuggestUpdateModal } from '@/components/SuggestUpdateModal'
import { useAuthStore } from '@/features/auth/authStore'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatTime12Hour } from '@/utils/formatTime'
import { parseLocalDate } from '@/utils/formatDate'
import { MARKET_CATEGORY_LABELS, MARKET_CATEGORY_COLORS, MARKET_STATUS_COLORS } from '@/config/constants'
import { TRACKING_STATUS_OPTIONS, TRACKING_STATUS_COLORS, TRACKING_STATUS_LABELS } from '@/config/trackingStatus'
import { Search, MapPin, Globe, Phone, Mail, User, Share2, Flag, MessageSquare, Image, DollarSign, Calendar, ArrowLeft, ArrowRight, Car, Footprints, Users, RefreshCw, Info, X, ChevronDown, Clock, Eye, BookmarkMinus, AlertTriangle, FileText, Cloud } from 'lucide-react'
import { TrackButton } from '@/components/TrackButton'
import { RelatedMarketDates } from '@/components/RelatedMarketDates'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

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
  const [showUntrackConfirm, setShowUntrackConfirm] = useState(false)
  const [isUntracking, setIsUntracking] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [vendorSearchTerm, setVendorSearchTerm] = useState('')
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isTextTruncated, setIsTextTruncated] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [selectedWeatherDay, setSelectedWeatherDay] = useState<any>(null)
  const descriptionRef = React.useRef<HTMLParagraphElement>(null)
  
  const { market, isLoading, error, refetch } = useMarket(id!)
  const { weather } = useWeather(market)
  const { formatTemperature } = usePreferencesStore()
  
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
      const lineHeight = parseInt(getComputedStyle(descriptionRef.current).lineHeight) || 24
      const maxHeight = lineHeight * 2
      setIsTextTruncated(descriptionRef.current.scrollHeight > maxHeight)
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
    if (!user) {
      navigate('/auth/login')
      return
    }

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
      setTimeout(() => {
        refetchVendors()
      }, 1000)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleConfirmUntrack = async () => {
    setIsUntracking(true)
    try {
      await untrackMarket(market.id)
      setShowUntrackConfirm(false)
    } catch (error) {
      console.error('Failed to untrack:', error)
    } finally {
      setIsUntracking(false)
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
      <div className="relative flex flex-col justify-end overflow-hidden rounded-none sm:rounded-t-3xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04),0_-1px_3px_rgba(0,0,0,0.06),0_-2px_6px_rgba(0,0,0,0.03)] mt-3 min-h-[22rem] md:min-h-[24rem]">
        {/* Market Image - Fixed height background */}
        <button
          onClick={() => market.images && market.images.length > 0 && setShowImagePreview(true)}
          className="absolute inset-0 cursor-pointer"
        >
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
        </button>

        {/* Back Button - Top Left */}
        <div className="absolute top-0 left-0 p-3 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="bg-white !border !border-[#9CA3AF] text-black hover:bg-white hover:brightness-105 h-8 px-3 shadow-[0_2px_6px_rgba(0,0,0,0.15)] focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Track/Status Button - Top Right */}
        <div className="absolute top-0 right-0 p-3 z-10">
          {isMarketTracked(market.id) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex items-center gap-2 text-sm font-semibold text-white border-0 shadow-lg px-4 py-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity',
                    TRACKING_STATUS_COLORS[trackingStatus]
                  )}
                >
                  <span>{TRACKING_STATUS_LABELS[trackingStatus]}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {TRACKING_STATUS_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={cn(
                      "flex items-center gap-2",
                      trackingStatus === option.value && "bg-accent/10"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full", option.color)} />
                    <span>{option.label}</span>
                    {trackingStatus === option.value && (
                      <span className="ml-auto text-accent">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowUntrackConfirm(true)}
                  className="text-red-600 focus:text-red-600 flex items-center gap-2"
                >
                  <BookmarkMinus className="w-4 h-4" />
                  Untrack Market
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <TrackButton
              isTracked={false}
              onClick={handleTrackToggle}
              disabled={isTracking}
              size="sm"
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

                {/* Title + Description */}
        <div className="relative">
          {/* Dark gradient background - collapsed */}
          <div 
            className="absolute left-0 right-0 bottom-0 pointer-events-none"
            style={{
              top: 0,
              opacity: isDescriptionExpanded ? 0 : 1,
              transition: `opacity ${isDescriptionExpanded ? '0.3s' : '1.5s'} ease`,
              background: 'linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.92) 30%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.45) 85%, transparent 100%)'
            }}
          />
          {/* Dark gradient background - expanded */}
          <div 
            className="absolute left-0 right-0 bottom-0 pointer-events-none"
            style={{
              top: 0,
              opacity: isDescriptionExpanded ? 1 : 0,
              transition: `opacity ${isDescriptionExpanded ? '0.3s' : '1.5s'} ease`,
              background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.98) 30%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.2) 90%, transparent 100%)'
            }}
          />
          
          {/* Content */}
          <div 
            className="relative px-4 sm:px-6 z-10"
            style={{
              paddingTop: isDescriptionExpanded ? '4.25rem' : '1rem',
              paddingBottom: isDescriptionExpanded ? '2rem' : '0.25rem',
              transition: isDescriptionExpanded ? 'padding-top 0.15s cubic-bezier(0.4, 0, 0.2, 1), padding-bottom 0.15s cubic-bezier(0.4, 0, 0.2, 1)' : 'padding-top 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s, padding-bottom 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s'
            }}
          >
            <h1 className="text-white font-quicksand font-bold text-xl leading-tight line-clamp-2 drop-shadow-lg" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)' }}>
              {market.name}
            </h1>
            <div
              className="overflow-hidden"
              style={{
 maxHeight: isDescriptionExpanded ? '500px' : '4.5rem',
                transition: isDescriptionExpanded ? 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <p
                ref={descriptionRef}
                className="text-white/90 text-base font-medium leading-relaxed mt-2 drop-shadow-md break-words pr-8"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
              >
                {market.description}
              </p>
            </div>
          </div>
          {/* Expand/Collapse button - right side */}
          {isTextTruncated && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="absolute bottom-2 right-4 z-20 flex items-center gap-1.5 bg-gray-100/80 text-black border border-black text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-gray-200/80 transition-colors"
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
        </div>
      </div>

      {/* TABS */}
      <div className="mb-2 sm:mb-2 overflow-hidden">
        <Tabs
          variant="glow-pills"
          size="lg"
          listClassName="px-2 sm:px-4 py-2"
          contentClassName=""
          items={[
            {
              key: 'details',
              label: 'Info',
              icon: <Info className="w-5 h-5" />,
              content: (
                 <div className="bg-white pb-4 pt-0 px-4 pb-[100px] rounded-none md:rounded-t-3xl md:mt-3">
                   {/* Action Bar - Mobile Above Location */}
                    <div className="md:hidden flex items-center justify-around pt-2 pb-3 border-b border-gray-200 mb-2 bg-gray-100 -mx-4 px-4 shadow-[inset_0_4px_8px_rgba(0,0,0,0.15)]">
                     {market.location?.address && (
                       <div className="group flex flex-col items-center">
                         <button
                           onClick={() => {
                             const address = formatLocation(market.location)
                             window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank')
                           }}
                           className="h-12 w-12 hover:bg-accent hover:text-accent-foreground text-gray-700 rounded-full transition-all duration-200 inline-flex items-center justify-center -mb-0.5"
                         >
                           <MapPin className="h-6 w-6" />
                         </button>
                         <span className="text-[11px] text-gray-700 leading-none group-hover:text-transparent transition-colors">Map</span>
                       </div>
                     )}
                     {market.contact?.website && (
                       <div className="group flex flex-col items-center">
                         <a
                           href={market.contact.website}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="h-12 w-12 hover:bg-accent hover:text-accent-foreground text-gray-700 rounded-full transition-all duration-200 inline-flex items-center justify-center -mb-0.5"
                         >
                           <Globe className="h-6 w-6" />
                         </a>
                         <span className="text-[11px] text-gray-700 leading-none group-hover:text-transparent transition-colors">Website</span>
                       </div>
                     )}
                     <div className="group flex flex-col items-center">
                       <button
                         onClick={() => {
                           if (navigator.share) {
                             navigator.share({ title: market.name, url: window.location.href })
                           }
                         }}
                         className="h-12 w-12 hover:bg-accent hover:text-accent-foreground text-gray-700 rounded-full transition-all duration-200 inline-flex items-center justify-center -mb-0.5"
                       >
                         <Share2 className="h-6 w-6" />
                       </button>
                       <span className="text-[11px] text-gray-700 leading-none group-hover:text-transparent transition-colors">Share</span>
                     </div>
                      {market.applicationSettings?.applicationLink && (
                        <div className="flex flex-col items-center">
                          <a
                            href={market.applicationSettings.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-12 px-5 bg-transparent border border-gray-400 text-gray-700 hover:bg-accent hover:text-accent-foreground hover:border-accent rounded-full transition-all duration-200 inline-flex items-center justify-center text-sm font-medium whitespace-nowrap -mb-0.5 translate-y-2"
                          >
                            Vendor Call
                          </a>
                          <span className="text-[11px] text-transparent leading-none">.</span>
                        </div>
                      )}
                   </div>

                  {/* Location Bar - Desktop Only + Mobile Location Below Actions */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-2 py-1 md:py-4 md:border-b md:border-gray-200">
                    {/* Mobile Location */}
                     <div className="md:hidden flex flex-col gap-0.5 px-2 mt-2">
                      <strong className="text-base font-medium">
                        {[market.location?.city, market.location?.state].filter(Boolean).join(', ')}
                      </strong>
                      {market.location?.address && market.location.address !== 'TBD' && (
                        <span className="text-sm text-muted-foreground">{market.location.address}</span>
                      )}
                    </div>

                    {/* Desktop Layout: Location Left, Buttons Right */}
                    <div className="hidden md:flex items-center gap-4 w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-amber-500 flex-shrink-0" />
                        <strong className="text-base font-medium">
                          {[market.location?.city, market.location?.state].filter(Boolean).join(', ')}
                        </strong>
                        {market.location?.address && market.location.address !== 'TBD' && (
                          <>
                            <span className="text-muted-foreground text-base">·</span>
                            <span className="text-base text-muted-foreground">{market.location.address}</span>
                          </>
                        )}
                      </div>
                      
                      {/* Desktop Action Buttons */}
                       <div className="flex gap-2 ml-auto">
                         {market.location?.address && (
                           <button
                             onClick={() => {
                               const address = formatLocation(market.location)
                               window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank')
                             }}
                             className="h-10 w-10 hover:bg-accent hover:text-accent-foreground text-foreground rounded-full transition-all duration-200 inline-flex items-center justify-center"
                           >
                             <MapPin className="h-5 w-5" />
                           </button>
                         )}
                         {market.contact?.website && (
                           <a
                             href={market.contact.website}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="h-10 w-10 hover:bg-accent hover:text-accent-foreground text-foreground rounded-full transition-all duration-200 inline-flex items-center justify-center"
                           >
                             <Globe className="h-5 w-5" />
                           </a>
                         )}
                         <button
                           onClick={() => {
                             if (navigator.share) {
                               navigator.share({ title: market.name, url: window.location.href })
                             }
                           }}
                           className="h-10 w-10 hover:bg-accent hover:text-accent-foreground text-foreground rounded-full transition-all duration-200 inline-flex items-center justify-center"
                         >
                           <Share2 className="h-5 w-5" />
                         </button>
                          {market.applicationSettings?.applicationLink && (
                            <a
                              href={market.applicationSettings.applicationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-10 px-4 bg-transparent border border-gray-400 text-gray-700 hover:bg-accent hover:text-accent-foreground hover:border-accent rounded-full transition-all duration-200 inline-flex items-center justify-center text-sm font-medium"
                            >
                              Vendor Call
                            </a>
                          )}
                       </div>
                    </div>
                  </div>



                  {/* Main Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-0 pt-2 md:pt-6">
                    
                    {/* Left: Dates Column */}
                    <div className="pr-0 md:pr-6">
                      {/* Section Label */}
                      <p className="hidden md:block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                        {scheduleDates.length > 0 ? new Date(scheduleDates[0].startDate).getFullYear() : new Date().getFullYear()} Dates
                      </p>

                      {/* Schedule - only show if NOT a split market */}
                      {!market.tags?.some(tag => tag.startsWith('split-market:')) && (
                        <div className="flex flex-col gap-0.5">
                          {scheduleDates.length > 0 ? (
                            (() => {
                              // Calculate first upcoming date index
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              const firstUpcomingIndex = scheduleDates.findIndex(s => {
                                const d = parseLocalDate(s.startDate)
                                d.setHours(0, 0, 0, 0)
                                return d >= today
                              })
                              
                              return scheduleDates.map((scheduleItem: any, index: number) => {
                                  const dateObj = parseLocalDate(scheduleItem.startDate)
                                  const monthAbbr = dateObj.toLocaleDateString('en-US', { month: 'short' })
                                  const dayNum = dateObj.getDate()
                                  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
                                  const fullMonth = dateObj.toLocaleDateString('en-US', { month: 'long' })
                                  const isFirstUpcoming = index === firstUpcomingIndex
                                  const dateStr = scheduleItem.startDate
                                  const dayWeather = weather?.days?.find((d: any) => d.date === dateStr)
                                  
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-default"
                                    >
                                      <div className={cn(
                                         "w-14 h-14 md:w-12 md:h-12 rounded-lg border flex flex-col items-center justify-center flex-shrink-0",
                                         isFirstUpcoming 
                                           ? "bg-white border-amber-400" 
                                           : "bg-white border-gray-400"
                                       )}>
                                        <span className="text-xs md:text-[11px] font-bold uppercase text-amber-500 leading-none">{monthAbbr}</span>
                                        <span className="text-2xl md:text-xl font-bold text-gray-800 leading-tight">{dayNum}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-lg md:text-base font-semibold">{weekday}, {fullMonth} {dayNum}</p>
                                        <p className="text-sm text-gray-600">
                                          {formatTime12Hour(scheduleItem.startTime)} – {formatTime12Hour(scheduleItem.endTime)}
                                        </p>
                                      </div>
                                      {dayWeather && (
                                        <button
                                          onClick={() => setSelectedWeatherDay(dayWeather)}
                                          className="flex flex-col items-center justify-start flex-shrink-0 w-14 h-14 md:w-12 md:h-12 bg-white border border-gray-200 rounded-lg hover:border-amber-400 transition-all pt-1 shadow-sm hover:shadow active:translate-y-0.5"
                                        >
                                          <span className="text-xl md:text-lg leading-none">{dayWeather.icon}</span>
                                          <p className="text-base md:text-sm font-bold leading-tight">{formatTemperature(dayWeather.high)}</p>
                                        </button>
                                      )}
                                    </div>
                                  )
                              })
                            })()
                          ) : (
                            <p className="text-sm text-muted-foreground py-3">Schedule not available</p>
                          )}
                        </div>
                      )}
                      
                      {/* Related Market Dates - for split markets */}
                       {market.tags?.some(tag => tag.startsWith('split-market:')) && (
                         <div>
                           <RelatedMarketDates market={market} variant="schedule" />
                         </div>
                       )}

                       {/* Tags Section */}
                       <div className="mt-4 pt-4 pb-2 border-t border-gray-200">
                         <TagVoting
                           marketTags={(market.tags || []).filter(tag => !tag.startsWith('split-market:'))}
                           marketId={id!}
                           hideHeading={true}
                         />
                       </div>

                       {/* Accessibility & Amenities */}
                       <div className="mt-4 pt-4 border-t border-gray-200">
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                           {market.accessibility?.wheelchairAccessible && (
                             <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                               <span className="text-green-600">✓</span>
                               <span>Wheelchair Accessible</span>
                             </div>
                           )}
                           {market.accessibility?.handicapParking && (
                             <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                               <span className="text-green-600">✓</span>
                               <span>Handicap Parking</span>
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
                           {market.accessibility?.covered && (
                             <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                               <span className="text-green-600">✓</span>
                               <span>Covered</span>
                             </div>
                           )}
                           {market.accessibility?.indoor && (
                             <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                               <span className="text-green-600">✓</span>
                               <span>Indoor</span>
                             </div>
                           )}
                           {market.accessibility?.outdoorSeating && (
                             <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                               <span className="text-green-600">✓</span>
                               <span>Outdoor Seating</span>
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
                           {market.accessibility?.foodCourt && (
                             <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                               <span className="text-green-600">✓</span>
                               <span>Food Court</span>
                             </div>
                           )}
                           {market.accessibility?.liveMusic && (
                             <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                               <span className="text-green-600">✓</span>
                               <span>Live Music</span>
                             </div>
                           )}
                           {market.accessibility?.alcoholAvailable && (
                             <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                               <span className="text-green-600">✓</span>
                               <span>Alcohol</span>
                             </div>
                           )}
                           {market.accessibility?.familyFriendly && (
                             <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                               <span className="text-green-600">✓</span>
                               <span>Family Friendly</span>
                             </div>
                           )}
                           {market.accessibility?.petFriendly && (
                             <div className="flex items-center gap-2 text-sm p-2 bg-white rounded">
                               <span className="text-green-600">✓</span>
                               <span>Pet Friendly</span>
                             </div>
                           )}
                           {!market.accessibility?.wheelchairAccessible && 
                            !market.accessibility?.handicapParking &&
                            !market.accessibility?.parkingAvailable && 
                            !market.accessibility?.restroomsAvailable && 
                            !market.accessibility?.covered &&
                            !market.accessibility?.indoor && 
                            !market.accessibility?.outdoorSeating &&
                            !market.accessibility?.wifi && 
                            !market.accessibility?.atm &&
                            !market.accessibility?.foodCourt &&
                            !market.accessibility?.liveMusic &&
                            !market.accessibility?.alcoholAvailable &&
                            !market.accessibility?.familyFriendly && 
                            !market.accessibility?.petFriendly && (
                             <p className="text-sm text-muted-foreground col-span-2 py-2">No accessibility info available</p>
                           )}
                          </div>
                        </div>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="hidden md:block border-l border-gray-200 pl-6">
                      {/* Listing Info */}
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Listing Info</p>
                      <div className="space-y-1.5 mb-6">
                        {market.promoter && (
                          <div className="px-3 py-2 rounded-lg border border-gray-100 hover:border-amber-400 hover:text-amber-500 transition-colors">
                            <span className="text-sm font-medium text-amber-600 uppercase tracking-wide">
                              Community Submitted
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => setShowUpdateModal(true)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 hover:border-amber-400 hover:text-amber-500 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">Suggest an Update</span>
                          </div>
                          <span className="text-gray-300 text-lg">›</span>
                        </button>
                        <button
                           onClick={() => setShowReportModal(true)}
                           className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 hover:border-amber-400 hover:text-amber-500 transition-colors text-left"
                         >
                           <div className="flex items-center gap-2">
                             <Flag className="w-4 h-4 text-gray-400" />
                             <span className="text-sm font-medium">Report Issue</span>
                           </div>
                           <span className="text-gray-300 text-lg">›</span>
                         </button>
                       </div>

                       {/* Quick Links */}
                       <div className="hidden md:block">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Quick Links</p>
                        <div className="space-y-1.5">
                          {market.contact?.website && (
                           <a
                             href={market.contact.website}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 hover:border-amber-400 hover:text-amber-500 transition-colors text-left"
                           >
                             <div className="flex items-center gap-2">
                               <Globe className="w-4 h-4 text-gray-400" />
                               <span className="text-sm font-medium">Official Website</span>
                             </div>
                             <span className="text-gray-300 text-lg">›</span>
                           </a>
                         )}
                         {market.location?.address && (
                           <button
                             onClick={() => {
                               const address = formatLocation(market.location)
                               window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank')
                             }}
                             className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 hover:border-amber-400 hover:text-amber-500 transition-colors text-left"
                           >
                             <div className="flex items-center gap-2">
                               <MapPin className="w-4 h-4 text-gray-400" />
                               <span className="text-sm font-medium">Get Directions</span>
                             </div>
                             <span className="text-gray-300 text-lg">›</span>
                           </button>
                         )}
                         {!market.applicationSettings?.applicationLink && !market.contact?.website && !market.location?.address && (
                         <p className="text-sm text-muted-foreground py-2">No quick links available</p>
                          )}
                        </div>
                       </div>
                     </div>
                  </div>

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

                  {/* Mobile Listing Info - after vendors */}
                  <div className="md:hidden mt-6 pt-6 border-t border-gray-200">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Listing Info</p>
                    <div className="flex flex-wrap gap-2">
                      {market.promoter && (
                        <div className="px-3 py-2 rounded-lg border border-gray-100">
                          <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                            Community Submitted
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => setShowReportModal(true)}
                        className="px-3 py-2 rounded-lg border border-gray-100 hover:border-amber-400 hover:text-amber-500 transition-colors"
                      >
                        <span className="text-xs font-medium">Report Issue</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            },
            {
              key: 'photos',
              label: 'Photos',
              icon: <Image className="w-5 h-5" />,
              content: (
                <div className="pb-4 pt-4 px-4 pb-[100px] bg-white rounded-t-3xl mt-3">
                  <p className="text-center text-muted-foreground py-8">Disabled at the moment</p>
                </div>
              )
            },
            {
              key: 'comments',
              label: 'Comments',
              icon: <MessageSquare className="w-5 h-5" />,
              content: (
                <div className="bg-white py-2 px-0 sm:py-4 sm:px-4 pb-[100px] rounded-t-3xl mt-3">
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

      <SuggestUpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        marketId={market.id}
        marketName={market.name}
      />

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

      {/* Untrack Confirmation Modal */}
      {showUntrackConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowUntrackConfirm(false)}
        >
          <div
            className="rounded-xl shadow-2xl max-w-sm w-full border-2 border-border bg-background p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Untrack Market?</h3>
                <p className="text-sm text-muted-foreground">This will remove it from your list.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUntrackConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-surface hover:bg-surface-2 text-foreground font-medium border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUntrack}
                disabled={isUntracking}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50"
              >
                {isUntracking ? 'Removing...' : 'Untrack'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weather Detail Modal */}
      <Modal isOpen={!!selectedWeatherDay} onClose={() => setSelectedWeatherDay(null)} size="sm" showCloseButton={false}>
        {selectedWeatherDay && (
          <div className="relative">
            <button
              onClick={() => setSelectedWeatherDay(null)}
              className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-3 mb-3 pr-8">
              <span className="text-7xl leading-none">{selectedWeatherDay.icon}</span>
              <div className="flex-1">
                <p className="text-xl font-bold">{selectedWeatherDay.dayName}, {selectedWeatherDay.monthName} {selectedWeatherDay.dayNumber}</p>
                <p className="text-sm text-muted-foreground">{selectedWeatherDay.condition}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-muted-foreground font-medium">H</span>
                <span className="text-3xl font-bold">{formatTemperature(selectedWeatherDay.high)}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-muted-foreground font-medium">L</span>
                <span className="text-2xl font-semibold text-muted-foreground">{formatTemperature(selectedWeatherDay.low)}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="p-2.5 rounded-lg bg-surface-1 border border-surface-3">
                <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Rain</p>
                <p className="text-sm font-bold">{selectedWeatherDay.precipitation}%</p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-1 border border-surface-3">
                <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Wind</p>
                <p className="text-sm font-bold">{selectedWeatherDay.windSpeed}<span className="text-[10px] font-normal">km/h</span></p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-1 border border-surface-3">
                <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Sunrise</p>
                <p className="text-sm font-bold">{selectedWeatherDay.sunrise}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-1 border border-surface-3">
                <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Sunset</p>
                <p className="text-sm font-bold">{selectedWeatherDay.sunset}</p>
              </div>
            </div>

            {selectedWeatherDay.hourly?.length > 0 && (
              <div className="overflow-x-auto -mx-2 px-2">
                <div className="flex gap-2">
                  {selectedWeatherDay.hourly.map((h: any) => (
                    <div 
                      key={h.hour} 
                      className={cn(
                        "flex flex-col items-center py-2 px-1.5 rounded-lg min-w-[38px]",
                        h.hour >= 6 && h.hour <= 20 ? "bg-surface-1 border border-surface-3" : "opacity-50"
                      )}
                    >
                      <p className="text-[10px] text-muted-foreground mb-1 font-medium">
                        {h.hour === 0 ? '12am' : h.hour === 12 ? '12pm' : h.hour > 12 ? `${h.hour - 12}pm` : `${h.hour}am`}
                      </p>
                      <span className="text-lg">{h.icon}</span>
                      <p className="text-xs font-semibold mt-0.5">{formatTemperature(h.temp)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Bottom spacer for floating navbar */}
      <div className="h-24" />
      </div>
    </div>
  )
}