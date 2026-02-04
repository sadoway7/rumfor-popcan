import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/features/auth/authStore'
import { marketsApi } from '@/features/markets/marketsApi'
import { getCategoryImage, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE, ALLOWED_MARKET_TAGS } from '@/assets/images'
import { formatLocalDate } from '@/utils/formatDate'
import { formatTime12Hour } from '@/utils/formatTime'
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Store,
  Phone,
  Accessibility,
  CheckCircle,
  Plus,
  X,
  Upload
} from 'lucide-react'

interface MarketFormData {
  name: string
  description: string
  category: string
  location: {
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  schedule: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
    startDate: string
    endDate: string
    isRecurring: boolean
    eventDate: string
  }>
  contact: {
    phone?: string
    email?: string
    website?: string
  }
  accessibility: {
    wheelchairAccessible: boolean
    parkingAvailable: boolean
    restroomsAvailable: boolean
    familyFriendly: boolean
    petFriendly: boolean
    covered: boolean
    indoor: boolean
    outdoorSeating: boolean
    wifi: boolean
    atm: boolean
    foodCourt: boolean
    liveMusic: boolean
    handicapParking: boolean
    alcoholAvailable: boolean
  }
  additionalInfo: {
    tags: string[]
    vendorCount?: number
    attendanceEstimate?: string
    marketImage?: string
  }
}

const categories = [
  { value: 'farmers-market', label: 'Farmers Market' },
  { value: 'arts-crafts', label: 'Arts & Crafts' },
  { value: 'flea-market', label: 'Flea Market' },
  { value: 'food-festival', label: 'Food Festival' },
  { value: 'holiday-market', label: 'Holiday Market' },
  { value: 'craft-show', label: 'Craft Show' },
  { value: 'community-event', label: 'Community Event' },
  { value: 'night-market', label: 'Night Market' },
  { value: 'street-fair', label: 'Street Fair' },
  { value: 'vintage-antique', label: 'Vintage & Antique' }
]

const provincesAndStates = [
  { label: 'Alberta', value: 'AB' },
  { label: 'British Columbia', value: 'BC' },
  { label: 'Manitoba', value: 'MB' },
  { label: 'New Brunswick', value: 'NB' },
  { label: 'Newfoundland and Labrador', value: 'NL' },
  { label: 'Northwest Territories', value: 'NT' },
  { label: 'Nova Scotia', value: 'NS' },
  { label: 'Nunavut', value: 'NU' },
  { label: 'Ontario', value: 'ON' },
  { label: 'Prince Edward Island', value: 'PE' },
  { label: 'Quebec', value: 'QC' },
  { label: 'Saskatchewan', value: 'SK' },
  { label: 'Yukon', value: 'YT' },
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' },
  { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' },
  { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' },
  { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' }
]

const attendanceOptions = [
  { value: 'small', label: 'Small (Under 50 vendors)' },
  { value: 'medium', label: 'Medium (50-200 vendors)' },
  { value: 'large', label: 'Large (200+ vendors)' }
]

export function VendorAddMarketForm() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [tagInputValue, setTagInputValue] = useState('')
  const [marketImage, setMarketImage] = useState<string | undefined>(undefined)
  const tagSuggestionsRef = useRef<HTMLDivElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagSuggestionsRef.current && !tagSuggestionsRef.current.contains(event.target as Node)) {
        setTagInputValue('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  const [formData, setFormData] = useState<MarketFormData>({
    name: '',
    description: '',
    category: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    schedule: [{
      dayOfWeek: 6, // Saturday default
      startTime: '08:00',
      endTime: '14:00',
startDate: formatLocalDate(new Date().toISOString()),
      endDate: formatLocalDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()), // 1 year from now
      eventDate: formatLocalDate(new Date().toISOString()),
      isRecurring: false
    }],
    contact: {},
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
    additionalInfo: {
      tags: []
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Clear API error when user starts editing a field
  const clearFieldError = (field: string) => {
    if (apiErrors[field]) {
      setApiErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Market name is required'
      if (!formData.category) newErrors.category = 'Category is required'
      if (!formData.location.city.trim()) newErrors.city = 'City is required'
      if (!formData.location.state.trim()) newErrors.state = 'State is required'
    }
    
    if (step === 2) {
      if (formData.schedule.length === 0) newErrors.schedule = 'At least one schedule item is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)
    setApiErrors({})

    try {
      const finalImages = marketImage
        ? [marketImage]
        : [getCategoryImage(formData.category)]

      const amenities = []
      if (formData.accessibility.wheelchairAccessible) amenities.push('accessible')
      if (formData.accessibility.parkingAvailable) amenities.push('parking')
      if (formData.accessibility.restroomsAvailable) amenities.push('restrooms')
      if (formData.accessibility.familyFriendly) amenities.push('playground')
      if (formData.accessibility.petFriendly) amenities.push('pet_friendly')
      if (formData.accessibility.covered) amenities.push('covered_area')
      if (formData.accessibility.indoor) amenities.push('electricity')
      if (formData.accessibility.outdoorSeating) amenities.push('food_court')
      if (formData.accessibility.wifi) amenities.push('wifi')
      if (formData.accessibility.atm) amenities.push('atm')
      if (formData.accessibility.foodCourt) amenities.push('food_court')
      if (formData.accessibility.liveMusic) amenities.push('playground')

      const city = formData.location.city?.trim() || 'Unknown'
      const state = formData.location.state?.trim() || 'NA'

      const marketData: any = {
        name: formData.name,
        description: formData.description || 'A great market for vendors and visitors.',
        promoter: user?.id || '',
        createdBy: user?.id || '',
        createdByType: 'vendor',
        marketType: 'vendor-created',
        location: {
          address: {
            street: formData.location.address?.trim() || 'TBD',
            city: city,
            state: state,
            zipCode: formData.location.zipCode?.trim() || '00000',
            country: formData.location.country?.trim() || 'USA'
          },
          coordinates: [0, 0]
        },
        category: formData.category,
        schedule: {
          recurring: false,
          daysOfWeek: [],
          startTime: formData.schedule[0]?.startTime || '08:00',
          endTime: formData.schedule[0]?.endTime || '14:00',
          seasonStart: formatLocalDate(formData.schedule[0]?.eventDate || new Date().toISOString()),
          seasonEnd: formatLocalDate(formData.schedule[formData.schedule.length - 1]?.eventDate || formData.schedule[0]?.eventDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()),
          specialDates: formData.schedule.map(s => ({
            date: new Date(s.eventDate || s.startDate || new Date()).toISOString().split('T')[0],
            startTime: s.startTime || '08:00',
            endTime: s.endTime || '14:00'
          }))
        },
        status: 'active',
        isPublic: true,
        applicationsEnabled: false,
        acceptVendors: true,
        applicationSettings: {
          acceptVendors: true,
          maxVendors: undefined,
          applicationFee: 0,
          boothFee: 0
        },
        images: finalImages.map(url => ({ url, isHero: true })),
        tags: formData.additionalInfo.tags,
        amenities,
        contact: formData.contact,
        accessibility: formData.accessibility,
        applicationFields: [],
        stats: {
          viewCount: 0,
          favoriteCount: 0,
          applicationCount: 0,
          commentCount: 0,
          rating: 0,
          reviewCount: 0
        }
      }

      const response = await marketsApi.createMarket(marketData)

      if (response.success && response.data) {
        alert('Market added successfully! You can now track this market and plan your participation.')
        navigate('/vendor/tracked-markets')
      } else {
        throw new Error(response.error || 'Failed to create market')
      }
    } catch (error: any) {
      console.error('Error submitting market:', error)

      if (error.details?.errors && Array.isArray(error.details.errors)) {
        const newApiErrors: Record<string, string> = {}
        error.details.errors.forEach((err: any) => {
          const fieldKey = err.path.replace('location.', '').replace('additionalInfo.', '')
          newApiErrors[fieldKey] = err.msg
        })
        setApiErrors(newApiErrors)

        const errorCount = error.details.errors.length
        alert(`Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} before submitting.`)

        if (newApiErrors.name || newApiErrors.category || newApiErrors.city || newApiErrors.state) {
          setCurrentStep(1)
        } else if (newApiErrors.schedule) {
          setCurrentStep(2)
        }
      } else {
        alert(error.message || 'Failed to submit market. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const addScheduleItem = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, {
        dayOfWeek: 6,
        startTime: '08:00',
        endTime: '14:00',
startDate: formatLocalDate(new Date().toISOString()),
        endDate: formatLocalDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()),
        eventDate: formatLocalDate(new Date().toISOString()),
        isRecurring: false
      }]
    }))
  }

  const removeScheduleItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }))
  }

  const addTag = (tag: string) => {
    if (tag && !formData.additionalInfo.tags.includes(tag) && formData.additionalInfo.tags.length < 3) {
      setFormData(prev => ({
        ...prev,
        additionalInfo: {
          ...prev.additionalInfo,
          tags: [...prev.additionalInfo.tags, tag]
        }
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      additionalInfo: {
        ...prev.additionalInfo,
        tags: prev.additionalInfo.tags.filter(tag => tag !== tagToRemove)
      }
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert('Invalid file type. Please upload JPG, PNG, or WebP images.')
      return
    }
    
    if (file.size > MAX_FILE_SIZE) {
      alert('File too large. Maximum size is 10MB.')
      return
    }
    
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      setMarketImage(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setMarketImage(undefined)
  }

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Market name, location, and category' },
    { number: 2, title: 'Schedule & Details', description: 'When the market operates' },
    { number: 3, title: 'Additional Info', description: 'Contact, accessibility, and extras' }
  ]

  const formatScheduleDisplay = () => {
    if (formData.schedule.length === 0) return 'No schedule set'
    
const schedules = formData.schedule.map(s => {
      const eventDate = s.eventDate || s.startDate
      // Parse date directly without timezone conversion
      const dateParts = eventDate.split('-')
      const year = parseInt(dateParts[0])
      const month = parseInt(dateParts[1]) - 1
      const day = parseInt(dateParts[2])
      const dateObj = new Date(year, month, day)
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return `${formattedDate} ${formatTime12Hour(s.startTime)}-${formatTime12Hour(s.endTime)}`
    })
    
    return schedules.join(', ')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Progress Steps - Compact with integrated back button */}
      <Card className="p-3 sm:p-6">
        <div className="flex items-center gap-2">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/vendor')}
            className="p-2 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          {/* Progress Steps */}
          <div className="flex items-center flex-1 overflow-hidden">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1 min-w-0">
                <div className={cn(
                  "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium flex-shrink-0",
                  currentStep >= step.number 
                    ? "bg-accent text-accent-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {currentStep > step.number ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : step.number}
                </div>
                <div className="ml-1.5 sm:ml-3 min-w-0 flex-1 hidden sm:block">
                  <div className={cn(
                    "text-xs sm:text-sm font-medium truncate",
                    currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-1 sm:mx-4",
                    currentStep > step.number ? "bg-accent" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* API Error Display */}
      {Object.keys(apiErrors).length > 0 && (
        <Card className="p-4 border-red-500 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-red-600">
              <X className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                Please fix the following errors:
              </h4>
              <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
                {Object.entries(apiErrors).map(([field, message]) => (
                  <li key={field} className="flex items-start gap-2">
                    <span className="font-medium">{field}:</span>
                    <span>{message}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setApiErrors({})}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Form Steps */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>
            <p className="text-muted-foreground text-sm">Let's start with the essential details about this market.</p>
          </div>

          {/* Market Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Market Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }))
                clearFieldError('name')
              }}
              placeholder="e.g., Downtown Farmers Market"
              className={cn((errors.name || apiErrors.name) && "border-red-500")}
            />
            {(errors.name || apiErrors.name) && (
              <p className="text-red-500 text-sm">{errors.name || apiErrors.name}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Category *</label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, category: value }))
                clearFieldError('category')
              }}
              placeholder="Select market category"
              options={categories.map(category => ({ value: category.value, label: category.label }))}
            />
            {(errors.category || apiErrors.category) && (
              <p className="text-red-500 text-sm">{errors.category || apiErrors.category}</p>
            )}
          </div>

          {/* Market Image Upload - Optional */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Market Image (Optional)</label>
            <div className="flex items-start gap-3">
              <input
                type="file"
                id="market-image-upload"
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="market-image-upload"
                className={cn(
                  "flex-1 cursor-pointer",
                  !marketImage && "w-full h-28 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50"
                )}
              >
                {marketImage ? (
                  <img 
                    src={marketImage} 
                    alt="Market preview" 
                    className="w-full h-28 object-cover rounded-lg" 
                  />
                ) : (
                  <div className="w-full h-28 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground ml-2">Click to upload</span>
                  </div>
                )}
              </label>
              {marketImage && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={removeImage}
                  className="text-destructive h-8"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the market..."
              rows={2}
            />
          </div>

          {/* Location */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              Location *
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-foreground">Address</label>
                <Input
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  placeholder="Street address"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">City *</label>
                <Input
                  value={formData.location.city}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, city: e.target.value }
                    }))
                    clearFieldError('city')
                  }}
                  placeholder="City"
                  className={cn((errors.city || apiErrors.city) && "border-red-500")}
                />
                {(errors.city || apiErrors.city) && (
                  <p className="text-red-500 text-sm">{errors.city || apiErrors.city}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Province/State *</label>
                <Select
                  value={formData.location.state}
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, state: value }
                    }))
                    clearFieldError('state')
                  }}
                  placeholder="Select province/state"
                  options={provincesAndStates.map(ps => ({ value: ps.value, label: ps.label }))}
                />
                {(errors.state || apiErrors.state) && (
                  <p className="text-red-500 text-sm">{errors.state || apiErrors.state}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Postal/Zip Code</label>
                <Input
                  value={formData.location.zipCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, zipCode: e.target.value }
                  }))}
                  placeholder="A1A 1A1 or 12345"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Schedule & Details</h2>
            <p className="text-muted-foreground text-sm">When does this market operate?</p>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule *
              </h3>
            </div>

            <div className="space-y-3">
              {formData.schedule.map((item, index) => (
                <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">Schedule {index + 1}</h4>
                    {formData.schedule.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeScheduleItem(index)}
                        className="p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = (e.currentTarget.parentElement?.querySelector('input[type="date"]') as HTMLInputElement)
                        if (input) input.showPicker()
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background hover:bg-accent text-sm flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>
                        {item.eventDate ? new Date(item.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Select Date'}
                      </span>
                    </button>
                    <Input
                      type="date"
                      value={item.eventDate || ''}
                      onChange={(e) => {
                        const newSchedule = [...formData.schedule]
                        newSchedule[index].eventDate = e.target.value
                        setFormData(prev => ({ ...prev, schedule: newSchedule }))
                      }}
                      min={formatLocalDate(new Date().toISOString())}
                      required
                      className="w-0 h-0 p-0 border-0 opacity-0 absolute"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Start</label>
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = (e.currentTarget.parentElement?.querySelector('input[type="time"]') as HTMLInputElement)
                          if (input) input.showPicker()
                        }}
                        className="w-full h-9 px-3 rounded-lg border border-input bg-background hover:bg-accent text-sm flex items-center justify-between gap-2"
                      >
                        <span className="truncate">{item.startTime ? formatTime12Hour(item.startTime) : '--:--'}</span>
                        <Clock className="w-3 h-3 opacity-50" />
                      </button>
                      <Input
                        type="time"
                        value={item.startTime}
                        onChange={(e) => {
                          const newSchedule = [...formData.schedule]
                          newSchedule[index].startTime = e.target.value
                          setFormData(prev => ({ ...prev, schedule: newSchedule }))
                        }}
                        className="w-0 h-0 p-0 border-0 opacity-0 absolute"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">End</label>
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = (e.currentTarget.parentElement?.querySelector('input[type="time"]') as HTMLInputElement)
                          if (input) input.showPicker()
                        }}
                        className="w-full h-9 px-3 rounded-lg border border-input bg-background hover:bg-accent text-sm flex items-center justify-between gap-2"
                      >
                        <span className="truncate">{item.endTime ? formatTime12Hour(item.endTime) : '--:--'}</span>
                        <Clock className="w-3 h-3 opacity-50" />
                      </button>
                      <Input
                        type="time"
                        value={item.endTime}
                        onChange={(e) => {
                          const newSchedule = [...formData.schedule]
                          newSchedule[index].endTime = e.target.value
                          setFormData(prev => ({ ...prev, schedule: newSchedule }))
                        }}
                        className="w-0 h-0 p-0 border-0 opacity-0 absolute"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addScheduleItem}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Date
                </Button>
              </div>
            </div>
            
            {errors.schedule && <p className="text-red-500 text-sm">{errors.schedule}</p>}
            
            {/* Schedule Preview */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">Schedule Preview</h4>
              <p className="text-sm text-muted-foreground">{formatScheduleDisplay()}</p>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Contact & Additional Info */}
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Additional Information</h2>
              <p className="text-muted-foreground text-sm">Help other vendors by providing extra details.</p>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <Input
                    value={formData.contact.phone || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    value={formData.contact.email || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    placeholder="contact@market.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Website</label>
                  <Input
                    value={formData.contact.website || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, website: e.target.value }
                    }))}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Accessibility Features */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Accessibility className="w-4 h-4" />
                Accessibility & Amenities
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="wheelchair"
                    checked={formData.accessibility.wheelchairAccessible}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, wheelchairAccessible: checked }
                    }))}
                  />
                  <label htmlFor="wheelchair" className="text-sm text-foreground">
                    Wheelchair Accessible
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="handicap-parking"
                    checked={formData.accessibility.handicapParking}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, handicapParking: checked }
                    }))}
                  />
                  <label htmlFor="handicap-parking" className="text-sm text-foreground">
                    Handicap Parking
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="parking"
                    checked={formData.accessibility.parkingAvailable}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, parkingAvailable: checked }
                    }))}
                  />
                  <label htmlFor="parking" className="text-sm text-foreground">
                    Parking Available
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="restrooms"
                    checked={formData.accessibility.restroomsAvailable}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, restroomsAvailable: checked }
                    }))}
                  />
                  <label htmlFor="restrooms" className="text-sm text-foreground">
                    Restrooms Available
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="covered"
                    checked={formData.accessibility.covered}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, covered: checked }
                    }))}
                  />
                  <label htmlFor="covered" className="text-sm text-foreground">
                    Covered Area
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="indoor"
                    checked={formData.accessibility.indoor}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, indoor: checked }
                    }))}
                  />
                  <label htmlFor="indoor" className="text-sm text-foreground">
                    Indoor
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="outdoor-seating"
                    checked={formData.accessibility.outdoorSeating}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, outdoorSeating: checked }
                    }))}
                  />
                  <label htmlFor="outdoor-seating" className="text-sm text-foreground">
                    Outdoor Seating
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="wifi"
                    checked={formData.accessibility.wifi}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, wifi: checked }
                    }))}
                  />
                  <label htmlFor="wifi" className="text-sm text-foreground">
                    WiFi Available
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="atm"
                    checked={formData.accessibility.atm}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, atm: checked }
                    }))}
                  />
                  <label htmlFor="atm" className="text-sm text-foreground">
                    ATM On-Site
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="food-court"
                    checked={formData.accessibility.foodCourt}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, foodCourt: checked }
                    }))}
                  />
                  <label htmlFor="food-court" className="text-sm text-foreground">
                    Food Court
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="live-music"
                    checked={formData.accessibility.liveMusic}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, liveMusic: checked }
                    }))}
                  />
                  <label htmlFor="live-music" className="text-sm text-foreground">
                    Live Music
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="alcohol"
                    checked={formData.accessibility.alcoholAvailable}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, alcoholAvailable: checked }
                    }))}
                  />
                  <label htmlFor="alcohol" className="text-sm text-foreground">
                    Alcohol Available
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="family"
                    checked={formData.accessibility.familyFriendly}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, familyFriendly: checked }
                    }))}
                  />
                  <label htmlFor="family" className="text-sm text-foreground">
                    Family Friendly
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="pets"
                    checked={formData.accessibility.petFriendly}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, petFriendly: checked }
                    }))}
                  />
                  <label htmlFor="pets" className="text-sm text-foreground">
                    Pet Friendly
                  </label>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">Tags (max 3)</h3>
                <span className="text-xs text-muted-foreground">
                  {formData.additionalInfo.tags.length}/3 selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.additionalInfo.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              {formData.additionalInfo.tags.length < 3 && (
                <div className="relative">
                  <Input
                    ref={tagInputRef}
                    value={tagInputValue}
                    onChange={(e) => setTagInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        const value = tagInputValue.trim().replace(/,/g, '')
                        if (value) {
                          addTag(value)
                          setTagInputValue('')
                        }
                      }
                    }}
                    placeholder="Type to search tags (comma to add)..."
                    className="w-full"
                  />
                  {tagInputValue && formData.additionalInfo.tags.length < 3 && (
                    <div ref={tagSuggestionsRef} className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {ALLOWED_MARKET_TAGS
                        .filter(tag => 
                          !formData.additionalInfo.tags.includes(tag) &&
                          tag.toLowerCase().includes(tagInputValue.toLowerCase())
                        )
                        .slice(0, 10)
                        .map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              addTag(tag)
                              setTagInputValue('')
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      {ALLOWED_MARKET_TAGS.filter(tag => 
                        !formData.additionalInfo.tags.includes(tag) &&
                        tag.toLowerCase().includes(tagInputValue.toLowerCase())
                      ).length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No matching tags
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Market Size Estimate */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Estimated Market Size</label>
              <Select
                value={formData.additionalInfo.attendanceEstimate || ''}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  additionalInfo: { ...prev.additionalInfo, attendanceEstimate: value }
                }))}
                placeholder="How many vendors typically participate?"
                options={attendanceOptions.map(option => ({ value: option.value, label: option.label }))}
              />
            </div>
          </Card>

          {/* Market Preview */}
          <Card className="p-6">
            <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <Store className="w-4 h-4" />
              Market Preview
            </h3>
            
            <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{formData.name || 'Market Name'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {categories.find(c => c.value === formData.category)?.label || 'Category'}
                  </p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Community Listed
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {formData.location.city}, {formData.location.state}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatScheduleDisplay()}
                </div>
              </div>
              
              {formData.description && (
                <p className="text-sm text-foreground">{formData.description}</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/vendor')}>
            Cancel
          </Button>
          
          {currentStep < 3 ? (
            <Button onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Market...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Market
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
