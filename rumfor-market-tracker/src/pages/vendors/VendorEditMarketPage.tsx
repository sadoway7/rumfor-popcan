import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Textarea, Select } from '@/components/ui'
import { ArrowLeft, Loader2, Clock, Lock, Plus, Trash2, MapPin, Calendar } from 'lucide-react'
import { useMarket } from '@/features/markets/hooks/useMarkets'
import { useAuthStore } from '@/features/auth/authStore'
import { marketsApi } from '@/features/markets/marketsApi'
import { MarketCategory } from '@/types'
import { formatLocalDate } from '@/utils/formatDate'

const marketCategories = [
  { value: 'farmers-market', label: 'Farmers Market' },
  { value: 'arts-crafts', label: 'Arts & Crafts' },
  { value: 'flea-market', label: 'Flea Market' },
  { value: 'food-festival', label: 'Food Festival' },
  { value: 'craft-show', label: 'Craft Show' },
  { value: 'community-event', label: 'Community Event' },
  { value: 'holiday-market', label: 'Holiday Market' },
  { value: 'night-market', label: 'Night Market' },
  { value: 'street-fair', label: 'Street Fair' },
  { value: 'vintage-antique', label: 'Vintage & Antique' },
]

export function VendorEditMarketPage() {
  const { marketId } = useParams<{ marketId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { market, isLoading, error } = useMarket(marketId || '')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    comments: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    eventDates: [] as Array<{
      id: string
      date: string
      startTime: string
      endTime: string
    }>,
    contactEmail: '',
    contactPhone: '',
    website: '',
    facebook: '',
    instagram: '',
  })
  
  // Calculate time remaining
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [canEdit, setCanEdit] = useState(false)
  
  useEffect(() => {
    if (market) {
      // Populate form with market data
      setFormData({
        name: market.name,
        category: market.category,
        description: market.description || '',
        comments: '', // Not stored yet
        address: market.location.address,
        city: market.location.city,
        state: market.location.state,
        zipCode: market.location.zipCode || '',
        eventDates: market.schedule?.map((s, i) => ({
          id: `event-${i}`,
          date: s.startDate?.split('T')[0] || '',
          startTime: s.startTime,
          endTime: s.endTime
        })) || [],
        contactEmail: market.contact?.email || '',
        contactPhone: market.contact?.phone || '',
        website: market.contact?.website || '',
        facebook: market.contact?.socialMedia?.facebook || '',
        instagram: market.contact?.socialMedia?.instagram || '',
      })
      
      // Check if editable
      if (market.editableUntil) {
        const editUntil = new Date(market.editableUntil)
        const now = new Date()
        setCanEdit(now < editUntil)
        
        if (now < editUntil) {
          // Update countdown
          const updateTimer = () => {
            const remaining = editUntil.getTime() - Date.now()
            if (remaining <= 0) {
              setTimeRemaining('Editing period has ended')
              setCanEdit(false)
            } else {
              const hours = Math.floor(remaining / (1000 * 60 * 60))
              const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
              setTimeRemaining(`${hours}h ${minutes}m remaining to edit`)
            }
          }
          updateTimer()
          const interval = setInterval(updateTimer, 60000)
          return () => clearInterval(interval)
        }
      } else {
        setCanEdit(true)
      }
    }
  }, [market])
  
  // Check ownership
  const isOwner = market?.createdBy === user?.id
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addEventDate = () => {
    setFormData(prev => ({
      ...prev,
      eventDates: [
        ...prev.eventDates,
        {
          id: `event-${Date.now()}`,
          date: '',
          startTime: '09:00',
          endTime: '17:00'
        }
      ]
    }))
  }

  const removeEventDate = (id: string) => {
    setFormData(prev => ({
      ...prev,
      eventDates: prev.eventDates.filter(e => e.id !== id)
    }))
  }

  const updateEventDate = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      eventDates: prev.eventDates.map(e =>
        e.id === id ? { ...e, [field]: value } : e
      )
    }))
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }
  
  if (error || !market) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-destructive">Market not found or you don't have access.</p>
        <Link to="/my-markets" className="text-accent hover:underline">
          Back to My Markets
        </Link>
      </div>
    )
  }
  
  if (!isOwner) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-destructive">You can only edit markets you created.</p>
        <Link to="/my-markets" className="text-accent hover:underline">
          Back to My Markets
        </Link>
      </div>
    )
  }
  
  if (!canEdit) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Editing Period Ended</h2>
            <p className="text-muted-foreground mb-4">
              The 24-hour editing window for this market has expired.
              The market is now locked for security.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              If you need to make changes, please contact support.
            </p>
            <Link to={`/markets/${marketId}`}>
              <Button>View Market</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
// Transform event dates to backend format
      const events = formData.eventDates.map(event => ({
        startDate: new Date(formatLocalDate(event.date)).toISOString(),
        endDate: new Date(formatLocalDate(event.date)).toISOString(),
        time: {
          start: event.startTime,
          end: event.endTime
        }
      }))

      const updateData = {
        name: formData.name,
        category: formData.category as MarketCategory,
        description: formData.description,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode || '00000',
          country: 'USA',
        },
        dates: {
          type: 'one-time' as const,
          events
        },
        contact: {
          email: formData.contactEmail || undefined,
          phone: formData.contactPhone || undefined,
          website: formData.website || undefined,
          socialMedia: {
            facebook: formData.facebook || undefined,
            instagram: formData.instagram || undefined,
          }
        },
      }

      await marketsApi.updateMarket(marketId!, updateData)
      
      navigate(`/markets/${marketId}`, {
        state: { message: 'Market updated successfully!' }
      })
    } catch (error) {
      console.error('Failed to update market:', error)
      alert('Failed to update market. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header with Timer */}
      <div className="mb-6">
        <Link
          to={`/markets/${marketId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Market
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Edit Market</h1>
          {timeRemaining && (
            <div className="flex items-center gap-2 text-warning">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{timeRemaining}</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground">
          You can make changes to your market during the 24-hour window after creation.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Market Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Category *
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
                options={marketCategories}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Street Address *
              </label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  City *
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  State *
                </label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Zip Code
              </label>
              <Input
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Market Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.eventDates.map((event) => (
              <div key={event.id} className="flex gap-4 items-end p-4 bg-surface rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <Input
                    type="date"
                    value={event.date}
                    onChange={(e) => updateEventDate(event.id, 'date', e.target.value)}
                    min={formatLocalDate(new Date().toISOString())}
                    required
                  />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <Input
                    type="time"
                    value={event.startTime}
                    onChange={(e) => updateEventDate(event.id, 'startTime', e.target.value)}
                    required
                  />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <Input
                    type="time"
                    value={event.endTime}
                    onChange={(e) => updateEventDate(event.id, 'endTime', e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEventDate(event.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addEventDate}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Market Date
            </Button>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Contact Email
                </label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Contact Phone
                </label>
                <Input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Website
              </label>
              <Input
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Facebook
              </label>
              <Input
                value={formData.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Instagram
              </label>
              <Input
                value={formData.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Link to={`/markets/${marketId}`}>
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
