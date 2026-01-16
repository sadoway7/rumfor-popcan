import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Textarea, Select } from '@/components/ui'
import { ArrowLeft, MapPin, Calendar, Loader2 } from 'lucide-react'
import { getGenericMarketImage } from '@/config/constants'

const marketCategories = [
  { value: 'farmers-market', label: 'Farmers Market' },
  { value: 'arts-crafts', label: 'Arts & Crafts' },
  { value: 'flea-market', label: 'Flea Market' },
  { value: 'food-festival', label: 'Food Festival' },
  { value: 'craft-show', label: 'Craft Show' },
  { value: 'community-event', label: 'Community Event' },
  { value: 'holiday-market', label: 'Holiday Market' },
]

const vendorAttendanceOptions = [
  { value: 'attending', label: 'I\'m attending this market' },
  { value: 'interested', label: 'I\'m interested in attending' },
  { value: 'not-attending', label: 'Not attending (or no longer attending)' },
]

export function VendorCreateMarketPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    comments: '', // Additional details and notes
    address: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    vendorAttendance: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    facebook: '',
    instagram: '',
    otherLink: '',
    isRecurring: false,
    daysOfWeek: [] as string[],
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
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
    if (!formData.startDate) {
      alert('Start date is required.')
      return
    }
    if (!formData.startTime) {
      alert('Start time is required.')
      return
    }
    if (!formData.endTime) {
      alert('End time is required.')
      return
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

    // Simulate API call - will be implemented with marketsApi.createMarket()
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Generate a temporary market ID for generic image selection
    const tempMarketId = `temp-${Date.now()}`
    const genericImage = getGenericMarketImage(tempMarketId)

    console.log('Creating vendor market:', {
      ...formData,
      marketType: 'vendor-created', // Mark as vendor-created
      images: [genericImage], // Add generic cycling image
    })

    setIsSubmitting(false)
    // Navigate to my markets page on success
    window.location.href = '/my-markets'
  }

  const weekDays = [
    { value: 'monday', label: 'M' },
    { value: 'tuesday', label: 'T' },
    { value: 'wednesday', label: 'W' },
    { value: 'thursday', label: 'T' },
    { value: 'friday', label: 'F' },
    { value: 'saturday', label: 'S' },
    { value: 'sunday', label: 'S' },
  ]

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

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.isRecurring}
                onChange={(e) => handleChange('isRecurring', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="recurring" className="text-sm font-medium">
                This is a recurring market (happens regularly)
              </label>
            </div>

            {formData.isRecurring ? (
              // Recurring Schedule
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Days of the Week
                  </label>
                  <div className="flex gap-1">
                    {weekDays.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleDayToggle(day.value)}
                        className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                          formData.daysOfWeek.includes(day.value)
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-surface hover:bg-surface-2'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Start Time *
                    </label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      End Time *
                    </label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  This market repeats on the selected days each week.
                </div>
              </>
            ) : (
              // One-time Schedule
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Event Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      End Date (if multi-day event)
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Start Time *
                    </label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      End Time *
                    </label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
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
                required
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