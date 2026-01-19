import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Tabs } from '@/components/ui/Tabs'
import { useMarket, useMarkets } from '@/features/markets/hooks/useMarkets'
// import { useVendorApplications } from '@/features/applications/hooks/useApplications'
import { CommentList } from '@/components/CommentList'
import { PhotoGallery } from '@/components/PhotoGallery'
import TagVoting from '@/components/TagVoting'
import { ReportIssueModal } from '@/components/ReportIssueModal'
import { useAuthStore } from '@/features/auth/authStore'
import { cn } from '@/utils/cn'
import { Search } from 'lucide-react'

const categoryLabels = {
  'farmers-market': 'Farmers Market',
  'arts-crafts': 'Arts & Crafts',
  'flea-market': 'Flea Market',
  'food-festival': 'Food Festival',
  'holiday-market': 'Holiday Market',
  'craft-show': 'Craft Show',
  'community-event': 'Community Event',
  'night-market': 'Night Market',
  'street-fair': 'Street Fair',
  'vintage-antique': 'Vintage & Antique'
}

const categoryColors = {
  'farmers-market': 'bg-green-100 text-green-800 border-green-200',
  'arts-crafts': 'bg-purple-100 text-purple-800 border-purple-200',
  'flea-market': 'bg-blue-100 text-blue-800 border-blue-200',
  'food-festival': 'bg-orange-100 text-orange-800 border-orange-200',
  'holiday-market': 'bg-red-100 text-red-800 border-red-200',
  'craft-show': 'bg-pink-100 text-pink-800 border-pink-200',
  'community-event': 'bg-gray-100 text-gray-800 border-gray-200',
  'night-market': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'street-fair': 'bg-amber-100 text-amber-800 border-amber-200',
  'vintage-antique': 'bg-slate-100 text-slate-800 border-slate-200'
}

const statusColors = {
  'active': 'bg-success/10 text-success border-success/20',
  'draft': 'bg-warning/10 text-warning border-warning/20',
  'cancelled': 'bg-destructive/10 text-destructive border-destructive/20',
  'completed': 'bg-muted text-muted-foreground border-muted'
}

export const MarketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isAccessibilityCollapsed, setIsAccessibilityCollapsed] = useState(true)
  const [isVendorsCollapsed, setIsVendorsCollapsed] = useState(false)
  const [vendorSearchTerm, setVendorSearchTerm] = useState('')
  
  const { market, isLoading, error, refetch } = useMarket(id!)
  const {
    trackMarket,
    untrackMarket,
    isMarketTracked,
    isTracking
  } = useMarkets()
  // const { myApplications } = useVendorApplications()
  const { user } = useAuthStore()

  // Check if user has already applied to this market
  // const existingApplication = myApplications.find(app => app.marketId === id)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading market details...</p>
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
          <h1 className="text-2xl font-bold mb-2">Market Not Found</h1>
          <p className="text-muted-foreground mb-6">
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
    if (isMarketTracked(market.id)) {
      await untrackMarket(market.id)
    } else {
      await trackMarket(market.id)
    }
  }

  const formatSchedule = (schedule: any) => {
    if (!schedule) return 'Schedule TBD'

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    let days: string[] = []
    let startTime: string = ''
    let endTime: string = ''

    if (Array.isArray(schedule)) {
      // Handle array format
      if (schedule.length === 0) return 'Schedule TBD'
      days = schedule
        .map((s: any) => dayNames[s.dayOfWeek])
        .filter((day: string, index: number, arr: string[]) => arr.indexOf(day) === index)
      const time = schedule[0]
      startTime = time.startTime
      endTime = time.endTime
    } else if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
      // Handle object format from backend
      days = schedule.daysOfWeek.map((day: string) => {
        const dayMap: { [key: string]: string } = {
          'monday': 'Monday',
          'tuesday': 'Tuesday',
          'wednesday': 'Wednesday',
          'thursday': 'Thursday',
          'friday': 'Friday',
          'saturday': 'Saturday',
          'sunday': 'Sunday'
        }
        return dayMap[day.toLowerCase()] || day
      })
      startTime = schedule.startTime
      endTime = schedule.endTime
    } else {
      return 'Schedule TBD'
    }

    return `${days.join(', ')} ${startTime}-${endTime}`
  }

  const formatLocation = (location: any) => {
    if (!location) {
      return 'Address not available'
    }
    return `${location.address || ''}, ${location.city || ''}, ${location.state || ''} ${location.zipCode || ''}`.trim()
  }

  // Mock vendor data with 40 different vendors
  const mockVendors = [
    { name: "Fresh Farms Market", type: "produce", avatar: "FF", color: "from-green-100 to-green-50" },
    { name: "Artisan Crafts Co.", type: "crafts", avatar: "AC", color: "from-purple-100 to-purple-50" },
    { name: "Sweet Treats Bakery", type: "food", avatar: "SB", color: "from-orange-100 to-orange-50" },
    { name: "Mountain View Nursery", type: "plants", avatar: "MV", color: "from-emerald-100 to-emerald-50" },
    { name: "Riverside Cheese", type: "dairy", avatar: "RC", color: "from-yellow-100 to-yellow-50" },
    { name: "Heritage Textiles", type: "textiles", avatar: "HT", color: "from-blue-100 to-blue-50" },
    { name: "Local Honey Traders", type: "food", avatar: "LH", color: "from-amber-100 to-amber-50" },
    { name: "Woodcraft Workshop", type: "crafts", avatar: "WW", color: "from-amber-100 to-amber-50" },
    { name: "Garden Fresh Herbs", type: "produce", avatar: "GF", color: "from-lime-100 to-lime-50" },
    { name: "Artisan Pottery", type: "crafts", avatar: "AP", color: "from-stone-100 to-stone-50" },
    { name: "Maple Syrup Delights", type: "food", avatar: "MS", color: "from-amber-100 to-amber-50" },
    { name: "Vintage Treasures", type: "antiques", avatar: "VT", color: "from-slate-100 to-slate-50" },
    { name: "Organic Vegetable Farm", type: "produce", avatar: "OV", color: "from-green-100 to-green-50" },
    { name: "Handmade Jewelry", type: "jewelry", avatar: "HJ", color: "from-pink-100 to-pink-50" },
    { name: "Fresh Bread Bakery", type: "food", avatar: "FB", color: "from-yellow-100 to-yellow-50" },
    { name: "Leather Goods Co.", type: "crafts", avatar: "LG", color: "from-orange-100 to-orange-50" },
    { name: "Berry Bliss Farm", type: "produce", avatar: "BB", color: "from-red-100 to-red-50" },
    { name: "Ceramic Creations", type: "crafts", avatar: "CC", color: "from-blue-100 to-blue-50" },
    { name: "Spice Route Traders", type: "food", avatar: "SR", color: "from-red-100 to-red-50" },
    { name: "Floral Arrangements", type: "flowers", avatar: "FA", color: "from-pink-100 to-pink-50" },
    { name: "Artisan Cheese Makers", type: "dairy", avatar: "AC", color: "from-yellow-100 to-yellow-50" },
    { name: "Woodworking Studio", type: "crafts", avatar: "WS", color: "from-amber-100 to-amber-50" },
    { name: "Herb & Spice Garden", type: "produce", avatar: "HS", color: "from-green-100 to-green-50" },
    { name: "Glass Art Gallery", type: "art", avatar: "GA", color: "from-cyan-100 to-cyan-50" },
    { name: "Coffee Roasters", type: "beverages", avatar: "CR", color: "from-amber-100 to-amber-50" },
    { name: "Textile Weavers", type: "textiles", avatar: "TW", color: "from-indigo-100 to-indigo-50" },
    { name: "Mushroom Growers", type: "produce", avatar: "MG", color: "from-neutral-100 to-neutral-50" },
    { name: "Metalwork Studio", type: "crafts", avatar: "MS", color: "from-gray-100 to-gray-50" },
    { name: "Jam & Preserves", type: "food", avatar: "JP", color: "from-red-100 to-red-50" },
    { name: "Bookbinders Workshop", type: "crafts", avatar: "BW", color: "from-stone-100 to-stone-50" },
    { name: "Olive Oil Producers", type: "food", avatar: "OO", color: "from-yellow-100 to-yellow-50" },
    { name: "Basket Weavers", type: "crafts", avatar: "BW", color: "from-green-100 to-green-50" },
    { name: "Tea Merchants", type: "beverages", avatar: "TM", color: "from-green-100 to-green-50" },
    { name: "Soap & Candle Makers", type: "crafts", avatar: "SC", color: "from-purple-100 to-purple-50" },
    { name: "Nut & Dried Fruit", type: "food", avatar: "ND", color: "from-orange-100 to-orange-50" },
    { name: "Paper Crafts", type: "crafts", avatar: "PC", color: "from-pink-100 to-pink-50" },
    { name: "Wine & Vineyard", type: "beverages", avatar: "WV", color: "from-purple-100 to-purple-50" },
    { name: "Leather Tanners", type: "crafts", avatar: "LT", color: "from-brown-100 to-brown-50" },
    { name: "Seed & Bulb Suppliers", type: "plants", avatar: "SB", color: "from-lime-100 to-lime-50" },
    { name: "Musical Instruments", type: "crafts", avatar: "MI", color: "from-wood-100 to-wood-50" }
  ]

  // Filter vendors based on search term
  const filteredVendors = mockVendors.filter(vendor =>
    vendor.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
    vendor.type.toLowerCase().includes(vendorSearchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/markets" className="hover:text-foreground transition-colors">Markets</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-foreground font-medium truncate">{market.name}</span>
          </nav>
        </div>
      </div>



      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery with Overlay */}
            {market.images && market.images.length > 0 && (
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
                  <img
                    src={market.images[selectedImageIndex]}
                    alt={market.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Back to Markets Button - Top Right */}
                  <div className="absolute top-4 right-4 z-10">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/markets')}
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to All Markets
                    </Button>
                  </div>

                  {/* Header Overlay */}
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent backdrop-blur-sm p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className={cn(statusColors[market.status], "bg-white/20 text-white border-white/30")}>
                            {market.status}
                          </Badge>
                          <Badge variant="outline" className={cn(categoryColors[market.category], "bg-white/20 text-white border-white/30")}>
                            {categoryLabels[market.category]}
                          </Badge>
                        </div>

                        <h1 className="text-2xl font-bold mb-4 text-white leading-tight" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.9), 0px 0px 20px rgba(0,0,0,0.7)'}}>{market.name}</h1>

                        <div className="text-white/90">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{formatLocation(market.location)}</span>
                          </div>


                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {/* Commented out for future use case */}
                        {/* <Button
                          onClick={handleTrackToggle}
                          disabled={isTracking}
                          variant={isMarketTracked(market.id) ? "secondary" : "outline"}
                          className={isMarketTracked(market.id) ? "bg-white text-black" : "bg-white/10 border-white/30 text-white hover:bg-white/20"}
                        >
                          {isMarketTracked(market.id) ? '✓ Tracked' : '+ Track Market'}
                        </Button> */}
                      </div>
                    </div>
                  </div>

                  {/* Footer Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent backdrop-blur-sm p-6">
                    <div className="prose prose-sm max-w-none">
                      <p className={cn(
                        "text-white leading-relaxed",
                        !showFullDescription && "line-clamp-3"
                      )}>
                        {market.description}
                      </p>
                      {market.description && market.description.length > 200 && (
                        <Button
                          variant="ghost"
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="p-0 h-auto mt-2 text-white hover:text-white/80"
                        >
                          {showFullDescription ? 'Show Less' : 'Read More'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {market.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {market.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={cn(
                          "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                          selectedImageIndex === index
                            ? "border-accent"
                            : "border-transparent hover:border-muted-foreground/20"
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
              </div>
            )}

            {/* Accessibility Features */}
            <Card className="p-6">
              <button
                onClick={() => setIsAccessibilityCollapsed(!isAccessibilityCollapsed)}
                className="w-full flex items-center justify-between text-left"
              >
                <h2 className="text-lg font-medium">Accessibility & Amenities</h2>
                <svg
                  className={`w-5 h-5 transition-all duration-300 ${isAccessibilityCollapsed ? 'rotate-0 animate-bounce' : 'rotate-180'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {!isAccessibilityCollapsed && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-medium">Accessibility</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        {market.accessibility?.wheelchairAccessible ? (
                          <span className="text-success mr-2">✓</span>
                        ) : (
                          <span className="text-muted-foreground mr-2">✗</span>
                        )}
                        <span className="text-sm">Wheelchair Accessible</span>
                      </div>
                      <div className="flex items-center">
                        {market.accessibility?.parkingAvailable ? (
                          <span className="text-success mr-2">✓</span>
                        ) : (
                          <span className="text-muted-foreground mr-2">✗</span>
                        )}
                        <span className="text-sm">Parking Available</span>
                      </div>
                      <div className="flex items-center">
                        {market.accessibility?.restroomsAvailable ? (
                          <span className="text-success mr-2">✓</span>
                        ) : (
                          <span className="text-muted-foreground mr-2">✗</span>
                        )}
                        <span className="text-sm">Restrooms Available</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium">Family Features</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        {market.accessibility?.familyFriendly ? (
                          <span className="text-success mr-2">✓</span>
                        ) : (
                          <span className="text-muted-foreground mr-2">✗</span>
                        )}
                        <span className="text-sm">Family Friendly</span>
                      </div>
                      <div className="flex items-center">
                        {market.accessibility?.petFriendly ? (
                          <span className="text-success mr-2">✓</span>
                        ) : (
                          <span className="text-muted-foreground mr-2">✗</span>
                        )}
                        <span className="text-sm">Pet Friendly</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Vendor List */}
            <Card className="p-6">
              <button
                onClick={() => setIsVendorsCollapsed(!isVendorsCollapsed)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center justify-between flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Filter vendors..."
                      value={vendorSearchTerm}
                      onChange={(e) => setVendorSearchTerm(e.target.value)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isVendorsCollapsed) setIsVendorsCollapsed(false);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface rounded-full focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 shadow"
                    />
                  </div>
                  <span className="text-base font-medium text-muted-foreground ml-4">
                    {filteredVendors.length} vendors attending
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 ml-4 transition-transform ${isVendorsCollapsed ? 'rotate-0' : 'rotate-180'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {!isVendorsCollapsed && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredVendors.map((vendor, index) => (
                  <div key={index} className={`bg-gradient-to-br ${vendor.color} rounded-lg p-3 hover:shadow-md transition-all duration-200`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white/50 shadow-sm">
                        <span className="text-sm font-bold text-primary">
                          {vendor.avatar}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm leading-tight text-foreground">{vendor.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{vendor.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </Card>

            {/* Community Features */}
            <Card className="p-0 overflow-hidden bg-transparent">
              <Tabs
                items={[
                  {
                    key: 'comments',
                    label: 'Comments',
                    content: <CommentList marketId={id!} />
                  },
                  {
                    key: 'photos',
                    label: 'Photos',
                    content: (
                      <PhotoGallery
                        marketId={id!}
                        showUpload={!!user && (user.role === 'vendor' || user.role === 'promoter')}
                      />
                    )
                  }
                ]}
                defaultActiveKey="comments"
                className="w-full [&>div:first-child]:bg-white [&>div:first-child]:rounded-lg [&>div:first-child]:border-b-0 [&>div:first-child>button]:ring-0 [&>div:first-child>button]:ring-offset-0 [&>div:first-child>button]:outline-none [&>div:first-child>button]:data-[state=active]:bg-accent/40 [&>div:last-child]:bg-transparent"
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Schedule</h3>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatSchedule(market.schedule)}</span>
                </div>
              </Card>

              {/* Official Market Link */}
              <Card className="p-6">
                <div className="text-center">
                  <a
                    href="#"
                    className="inline-flex items-center text-lg font-medium text-accent hover:underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    <svg className="w-5 h-5 mr-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit official website
                  </a>
                </div>
              </Card>
              {/* Quick Actions */}
              <Card className="p-6">
                <div className="space-y-3">
                  {/* Track Market Button */}
                  <Button
                    className="w-full"
                    onClick={handleTrackToggle}
                    disabled={isTracking}
                    variant={isMarketTracked(market.id) ? "secondary" : "primary"}
                  >
                    {isMarketTracked(market.id) ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Tracked
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Track this Market
                      </>
                    )}
                  </Button>

                  {/* User Status Button (only for tracked markets) */}
                  {isMarketTracked(market.id) && (
                    <div className="pt-2">
                      <Button
                        className="w-full"
                        variant="outline"
                        size="sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Update My Status
                      </Button>
                    </div>
                  )}

                  {/* Application Button (for promoter-run markets) - Commented out for dynamic system */}
                  {/* {market.promoter && (
                    <div className="pt-2">
                      {existingApplication ? (
                        <div className="space-y-2">
                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => navigate(`/applications/${existingApplication.id}`)}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View My Application
                          </Button>
                          <div className="text-xs text-muted-foreground text-center">
                            Status: {existingApplication.status.replace('-', ' ')}
                          </div>
                        </div>
                      ) : (
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => navigate(`/markets/${id}/apply`)}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Apply to Market
                        </Button>
                      )}
                    </div>
                  )} */}

                  <Button className="w-full" variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share Market
                  </Button>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setShowReportModal(true)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v4m-4-4h.01M16 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {market.promoter ? 'Report Issue' : 'Request Update'}
                  </Button>
                </div>
              </Card>

              {/* Tags & Hashtags */}
              {((market.tags && market.tags.length > 0) || user) && (
                <Card className="p-6">
                  <TagVoting
                    marketTags={market.tags || []}
                    marketId={id!}
                  />
                </Card>
              )}

              {/* Contact Info */}
              {market.promoter && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {market.contact?.phone && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-sm">{market.contact?.phone}</span>
                      </div>
                    )}

                    {market.contact?.email && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href={`mailto:${market.contact?.email}`} className="text-sm text-accent hover:underline">
                          {market.contact?.email}
                        </a>
                      </div>
                    )}

                    {market.contact?.website && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                        <a href={market.contact?.website} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Market Promoter */}
{market.promoter && (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Market Organizer</h3>
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
        <span className="text-sm font-medium">
          {market.promoter.firstName?.[0]}{market.promoter.lastName?.[0]}
        </span>
      </div>
      <div>
        <p className="font-medium">{market.promoter.firstName || ''} {market.promoter.lastName || ''}</p>
        <p className="text-sm text-muted-foreground">{market.promoter.email}</p>
      </div>
    </div>
  </Card>
)}
            </div>
          </div>
        </div>
      </div>

      <ReportIssueModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        marketId={market.id}
        marketName={market.name}
      />
    </div>
  )
}
