import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Tabs } from '@/components/ui/Tabs'
import { useMarket, useMarkets } from '@/features/markets/hooks/useMarkets'
import { useVendorApplications } from '@/features/applications/hooks/useApplications'
import { CommentList } from '@/components/CommentList'
import { PhotoGallery } from '@/components/PhotoGallery'
import { HashtagVoting } from '@/components/HashtagVoting'
import { MarketLifespan } from '@/components/MarketLifespan'
import { ReportIssueModal } from '@/components/ReportIssueModal'
import { useAuthStore } from '@/features/auth/authStore'
import { cn } from '@/utils/cn'

const categoryLabels = {
  'farmers-market': 'Farmers Market',
  'arts-crafts': 'Arts & Crafts',
  'flea-market': 'Flea Market',
  'food-festival': 'Food Festival',
  'holiday-market': 'Holiday Market',
  'craft-show': 'Craft Show',
  'community-event': 'Community Event'
}

const categoryColors = {
  'farmers-market': 'bg-green-100 text-green-800 border-green-200',
  'arts-crafts': 'bg-purple-100 text-purple-800 border-purple-200',
  'flea-market': 'bg-blue-100 text-blue-800 border-blue-200',
  'food-festival': 'bg-orange-100 text-orange-800 border-orange-200',
  'holiday-market': 'bg-red-100 text-red-800 border-red-200',
  'craft-show': 'bg-pink-100 text-pink-800 border-pink-200',
  'community-event': 'bg-gray-100 text-gray-800 border-gray-200'
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
  
  const { market, isLoading, error, refetch } = useMarket(id!)
  const {
    trackMarket,
    untrackMarket,
    isMarketTracked,
    isTracking
  } = useMarkets()
  const { myApplications } = useVendorApplications()
  const { user } = useAuthStore()

  // Check if user has already applied to this market
  const existingApplication = myApplications.find(app => app.marketId === id)

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
            <Button onClick={refetch} variant="outline" className="w-full">
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

  const formatSchedule = (schedule: any[]) => {
    if (!schedule || schedule.length === 0) return 'Schedule TBD'
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const days = schedule
      .map((s: any) => dayNames[s.dayOfWeek])
      .filter((day: string, index: number, arr: string[]) => arr.indexOf(day) === index) // Remove duplicates
      .join(', ')
    
    const time = schedule[0]
    return `${days} ${time.startTime}-${time.endTime}`
  }

  const formatLocation = (location: any) => {
    return `${location.address}, ${location.city}, ${location.state} ${location.zipCode}`
  }

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

      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className={cn(categoryColors[market.category])}>
                  {categoryLabels[market.category]}
                </Badge>
                <Badge variant="outline" className={cn(statusColors[market.status])}>
                  {market.status}
                </Badge>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{market.name}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{formatLocation(market.location)}</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatSchedule(market.schedule)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 ml-6">
              <Button
                variant="outline"
                onClick={() => navigate('/markets')}
              >
                Back to Markets
              </Button>
              <Button
                onClick={handleTrackToggle}
                disabled={isTracking}
                variant={isMarketTracked(market.id) ? "primary" : "outline"}
              >
                {isMarketTracked(market.id) ? '✓ Tracked' : '+ Track Market'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {market.images && market.images.length > 0 && (
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={market.images[selectedImageIndex]}
                    alt={market.name}
                    className="w-full h-full object-cover"
                  />
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

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">About This Market</h2>
              <div className="prose prose-sm max-w-none">
                <p className={cn(
                  "text-muted-foreground leading-relaxed",
                  !showFullDescription && "line-clamp-4"
                )}>
                  {market.description}
                </p>
                {market.description.length > 200 && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="p-0 h-auto mt-2"
                  >
                    {showFullDescription ? 'Show Less' : 'Read More'}
                  </Button>
                )}
              </div>
            </Card>

            {/* Accessibility Features */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Accessibility & Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-medium">Accessibility</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      {market.accessibility.wheelchairAccessible ? (
                        <span className="text-success mr-2">✓</span>
                      ) : (
                        <span className="text-muted-foreground mr-2">✗</span>
                      )}
                      <span className="text-sm">Wheelchair Accessible</span>
                    </div>
                    <div className="flex items-center">
                      {market.accessibility.parkingAvailable ? (
                        <span className="text-success mr-2">✓</span>
                      ) : (
                        <span className="text-muted-foreground mr-2">✗</span>
                      )}
                      <span className="text-sm">Parking Available</span>
                    </div>
                    <div className="flex items-center">
                      {market.accessibility.restroomsAvailable ? (
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
                      {market.accessibility.familyFriendly ? (
                        <span className="text-success mr-2">✓</span>
                      ) : (
                        <span className="text-muted-foreground mr-2">✗</span>
                      )}
                      <span className="text-sm">Family Friendly</span>
                    </div>
                    <div className="flex items-center">
                      {market.accessibility.petFriendly ? (
                        <span className="text-success mr-2">✓</span>
                      ) : (
                        <span className="text-muted-foreground mr-2">✗</span>
                      )}
                      <span className="text-sm">Pet Friendly</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tags */}
            {market.tags && market.tags.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {market.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Community Features */}
            <Card className="p-0 overflow-hidden">
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
                  },
                  {
                    key: 'hashtags',
                    label: 'Hashtags',
                    content: (
                      <HashtagVoting 
                        marketId={id!} 
                        showCreateForm={!!user}
                      />
                    )
                  }
                ]}
                defaultActiveKey="comments"
                className="w-full"
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Contact Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {market.contact.phone && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm">{market.contact.phone}</span>
                    </div>
                  )}
                  
                  {market.contact.email && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${market.contact.email}`} className="text-sm text-accent hover:underline">
                        {market.contact.email}
                      </a>
                    </div>
                  )}
                  
                  {market.contact.website && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                      <a href={market.contact.website} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </Card>

              {/* Market Promoter */}
              {market.promoter && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Market Organizer</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {market.promoter.firstName[0]}{market.promoter.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{market.promoter.firstName} {market.promoter.lastName}</p>
                      <p className="text-sm text-muted-foreground">{market.promoter.email}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  {/* Apply to Market Button */}
                  {existingApplication ? (
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
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
                      onClick={() => navigate(`/markets/${id}/apply`)}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Apply to Market
                    </Button>
                  )}
                  
                  <Button className="w-full" variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share Market
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Add to Favorites
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v4m-4-4h.01M16 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Report Issue
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
