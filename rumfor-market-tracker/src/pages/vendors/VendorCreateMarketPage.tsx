import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Textarea, Select } from '@/components/ui'
import { ArrowLeft, MapPin, Calendar, Loader2, Plus, Trash2 } from 'lucide-react'
import { getCategoryImage } from '@/assets/images'
import { useCreateMarketMutation } from '@/features/markets/hooks/useMarkets'
import { formatLocalDate } from '@/utils/formatDate'

const marketCategories = [
  { value: 'farmers-market', label: 'Farmers Market' },
  { value: 'arts-crafts', label: 'Arts & Crafts' },
  { value: 'flea-market', label: 'Flea Market' },
  { value: 'food-festival', label: 'Food Festival' },
  { value: 'craft-fair', label: 'Craft Show' },
  { value: 'community-event', label: 'Community Event' },
  { value: 'holiday-market', label: 'Holiday Market' },
  { value: 'night-market', label: 'Night Market' },
  { value: 'street-fair', label: 'Street Fair' },
  { value: 'vintage-antique', label: 'Vintage & Antique' },
]

const vendorAttendanceOptions = [
  { value: 'attending', label: 'I\'m attending this market' },
  { value: 'interested', label: 'I\'m interested in attending' },
  { value: 'not-attending', label: 'Not attending (or no longer attending)' },
]

export function VendorCreateMarketPage() {
  const navigate = useNavigate()
  const createMarketMutation = useCreateMarketMutation()
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
    latitude: '',
    longitude: '',
    // New: Array of event dates
    eventDates: [] as Array<{
      id: string
      date: string      // YYYY-MM-DD
      startTime: string // HH:mm
      endTime: string   // HH:mm
    }>,
    vendorAttendance: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    facebook: '',
    instagram: '',
    otherLink: '',
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation: Check required fields
    if (!formData.name.trim()) {
      alert('Market name is required.')
      return
    }
    if (!formData.category) {
      alert('Market category is required.')
      return
    }
    if (!formData.address.trim()) {
      alert('Street address is required.')
      return
    }
    if (!formData.city.trim()) {
      alert('City is required.')
      return
    }
    if (!formData.state.trim()) {
      alert('State is required.')
      return
    }
    if (formData.eventDates.length === 0) {
      alert('Please add at least one market date.')
      return
    }
    // Validate each event date
    for (const event of formData.eventDates) {
      if (!event.date) {
        alert('Please fill in all event dates.')
        return
      }
      if (!event.startTime) {
        alert('Please fill in start times for all events.')
        return
      }
      if (!event.endTime) {
        alert('Please fill in end times for all events.')
        return
      }
    }
    if (!formData.vendorAttendance) {
      alert('Please specify your attendance status.')
      return
    }

    // Validation: Check if at least one link is provided
    const hasLink = formData.website.trim() || formData.facebook.trim() || formData.instagram.trim() || formData.otherLink.trim()
    if (!hasLink) {
      alert('Please provide at least one link to the market\'s official page or social media.')
      return
    }

    setIsSubmitting(true)

    try {
      // Get default image based on category
      const defaultImage = getCategoryImage(formData.category)
      
      // Transform event dates to backend format
      const events = formData.eventDates.map(event => ({
        startDate: new Date(event.date + 'T12:00:00').toISOString(),
        endDate: new Date(event.date + 'T12:00:00').toISOString(),
        time: {
          start: event.startTime,
          end: event.endTime
        }
      }))

      // Create schedule in backend format (object with recurring/specialDates)
      const specialDates = formData.eventDates.map((event) => ({
        date: new Date(event.date + 'T12:00:00'),
        startTime: event.startTime,
        endTime: event.endTime,
        notes: ''
      }))

      // Get the first date's day of week for recurring
      const firstEvent = formData.eventDates[0]
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const daysOfWeek = formData.eventDates.map((event) => {
        const dateObj = new Date(event.date + 'T12:00:00')
        return dayNames[dateObj.getDay()]
      })

      const scheduleData = {
        recurring: false,
        daysOfWeek: daysOfWeek,
        startTime: firstEvent?.startTime || '09:00',
        endTime: firstEvent?.endTime || '17:00',
        specialDates: specialDates,
        seasonStart: formData.eventDates.length > 0 ? new Date(formData.eventDates[0].date + 'T12:00:00') : new Date(),
        seasonEnd: formData.eventDates.length > 0 ? new Date(formData.eventDates[formData.eventDates.length - 1].date + 'T12:00:00') : new Date()
      }

      const marketData: any = {
        name: formData.name,
        category: formData.category,
        description: formData.description || 'No description provided',
        comments: formData.comments,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode || '00000',
          country: 'USA',
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        },
        dates: {
          type: 'one-time',
          events
        },
        contact: {
          email: formData.contactEmail || undefined,
          phone: formData.contactPhone || undefined,
          website: formData.website || formData.facebook || formData.instagram || formData.otherLink || undefined,
          socialMedia: {
            facebook: formData.facebook || undefined,
            instagram: formData.instagram || undefined,
          }
        },
        images: [defaultImage],
        vendorAttendance: formData.vendorAttendance,
        marketType: 'vendor-created',
        status: 'active',
        editableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        tags: [],
        schedule: scheduleData,
        applicationsEnabled: false,
        stats: {
          viewCount: 0,
          favoriteCount: 0,
          applicationCount: 0,
          commentCount: 0,
          rating: 0,
          reviewCount: 0
        },
        accessibility: {
          wheelchairAccessible: false,
          parkingAvailable: false,
          restroomsAvailable: false,
          familyFriendly: false,
          petFriendly: false,
          covered: false,
          indoor: false,
          outdoorSeating: false,
          wifi: false,
          atm: false,
          foodCourt: false,
          liveMusic: false,
          handicapParking: false,
          alcoholAvailable: false
        },
        applicationFields: []
      }
      
      // Create the market
      console.log('[CreateMarket] Sending marketData:', JSON.stringify(marketData, null, 2))
      const newMarket = await createMarketMutation.mutateAsync(marketData)
      console.log('[CreateMarket] Created market:', newMarket)
      
      // Show success with edit window notice
      navigate('/my-markets', {
        state: {
          message: 'Market created successfully! You have 24 hours to make any edits.',
          marketId: newMarket?.id
        }
      })
      
    } catch (error) {
      console.error('Failed to create market:', error)
      alert('Failed to create market. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/markets"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Markets
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Create Community Market</h1>
        <p className="text-muted-foreground">
          Share a market with the community. This is an honor-based system where vendors indicate their attendance.
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
                placeholder="e.g., Downtown Farmers Market"
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
                placeholder="Select market category"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe this market and what makes it special..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Additional Comments
              </label>
              <Textarea
                value={formData.comments}
                onChange={(e) => handleChange('comments', e.target.value)}
                placeholder="Any additional details, booth fees, special notes, or other information..."
                rows={3}
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
                placeholder="123 Main Street"
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
                  placeholder="City"
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
                  placeholder="State"
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
                placeholder="12345"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Tip: Click on the map or provide coordinates for better location accuracy
            </div>
          </CardContent>
        </Card>

        {/* Schedule - New multi-date picker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Market Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add each date this market will occur. You can add multiple dates.
            </p>
            
            {/* Date List */}
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
            
            {/* Add Date Button */}
            <Button
              type="button"
              variant="outline"
              onClick={addEventDate}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Market Date
            </Button>
            
            {formData.eventDates.length === 0 && (
              <p className="text-sm text-destructive">
                Please add at least one market date.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contact & Details */}
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
                  placeholder="your.email@example.com"
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
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Website or Official Link *
              </label>
              <Input
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://example.com or link to official market page"
              />
              <div className="text-xs text-muted-foreground mt-1">
                At least one official link is required
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Facebook (optional)
              </label>
              <Input
                value={formData.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
                placeholder="https://facebook.com/marketpage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Instagram (optional)
              </label>
              <Input
                value={formData.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="https://instagram.com/marketpage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Other Link (optional)
              </label>
              <Input
                value={formData.otherLink}
                onChange={(e) => handleChange('otherLink', e.target.value)}
                placeholder="Any other relevant link"
              />
            </div>
          </CardContent>
        </Card>

        {/* Vendor Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Your Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Will you be attending this market?
              </label>
              <div className="space-y-2">
                {vendorAttendanceOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="vendorAttendance"
                      value={option.value}
                      checked={formData.vendorAttendance === option.value}
                      onChange={(e) => handleChange('vendorAttendance', e.target.value)}
                      required
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                You can always change your attendance status later.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link to="/markets">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Market...
              </>
            ) : (
              'Create Market'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
