import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { CityAutocomplete } from '@/components/ui/CityAutocomplete'
import { MarketNameSuggestions } from '@/components/ui/MarketNameSuggestions'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/features/auth/authStore'
import { marketsApi } from '@/features/markets/marketsApi'
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets'
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
  Upload,
  ChevronDown,
  Info
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
  applicationSettings: {
    applicationLink?: string
    applicationDeadline?: string
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
    splitMultipleDates?: boolean
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
  const queryClient = useQueryClient()
  const { trackMarket } = useTrackedMarkets()
  const [currentStep, setCurrentStep] = useState(1)
  const [tagInputValue, setTagInputValue] = useState('')
  const [marketImage, setMarketImage] = useState<string | undefined>(undefined)
  const [isMarketNameFocused, setIsMarketNameFocused] = useState(false)
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)
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
    applicationSettings: {},
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
      tags: [],
      splitMultipleDates: false
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

    // Step 3 validation
    if (step === 3) {
      if (!formData.contact.website?.trim()) {
        newErrors.website = 'Official website/link is required'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    console.log('nextStep clicked, currentStep:', currentStep)
    console.log('formData:', formData)
    console.log('errors:', errors)
    if (validateStep(currentStep)) {
      console.log('validation passed, moving to step', currentStep + 1)
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    } else {
      console.log('validation failed')
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo(0, 0)
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

      // If splitMultipleDates is checked, create separate markets for each date
      if (formData.additionalInfo.splitMultipleDates && formData.schedule.length > 1) {
        const createdMarketIds: string[] = []
        const createdMarketDates: string[] = []
        
        // First, create all markets without the relationship tag
        for (let i = 0; i < formData.schedule.length; i++) {
          const scheduleItem = formData.schedule[i]
          const dateStr_raw = scheduleItem.eventDate || scheduleItem.startDate || new Date().toISOString().split('T')[0]
          const eventDate = dateStr_raw
          
          // Parse date string as local date (not UTC) to avoid timezone shift
          const [year, month, day] = dateStr_raw.split('-').map(Number)
          const dateObj = new Date(year, month - 1, day)
          const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          
          // All markets get date appended
          const marketName = `${formData.name} - ${dateStr}`
          
          const marketData = {
            name: marketName,
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
              startTime: scheduleItem.startTime || '08:00',
              endTime: scheduleItem.endTime || '14:00',
              seasonStart: formatLocalDate(scheduleItem.eventDate || new Date().toISOString()),
              seasonEnd: formatLocalDate(scheduleItem.eventDate || new Date().toISOString()),
              specialDates: [{
                date: new Date(scheduleItem.eventDate || scheduleItem.startDate || new Date()).toISOString().split('T')[0],
                startTime: scheduleItem.startTime || '08:00',
                endTime: scheduleItem.endTime || '14:00'
              }]
            },
            status: 'active',
            isPublic: true,
            applicationsEnabled: false,
            acceptVendors: true,
            applicationSettings: {
              acceptVendors: true,
              maxVendors: undefined,
              applicationFee: 0,
              boothFee: 0,
              applicationLink: formData.applicationSettings?.applicationLink || undefined,
              applicationDeadline: formData.applicationSettings?.applicationDeadline || undefined
            },
            images: finalImages.map(url => ({ url, isHero: true })),
            tags: [...formData.additionalInfo.tags], // Will add relationship tag after
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
          
          const response = await marketsApi.createMarket(marketData as any)
          if (response.success && response.data) {
            const data = response.data as any
            const newMarketId = data.id || data._id || data.market?.id
            createdMarketIds.push(newMarketId)
            createdMarketDates.push(eventDate)
            await trackMarket(newMarketId, 'interested')
          }
        }
        
        // Now update all markets with the relationship tag
        // Format: split-market:id1:2024-02-19,id2:2024-02-20,id3:2024-02-21
        const relationshipParts = createdMarketIds.map((id, i) => `${id}:${createdMarketDates[i]}`)
        const relationshipTag = `split-market:${relationshipParts.join(',')}`
        
        for (const marketId of createdMarketIds) {
          try {
            await marketsApi.updateMarket(marketId, {
              tags: [...formData.additionalInfo.tags, relationshipTag]
            } as any)
          } catch (e) {
            console.error('Failed to update market with relationship tag:', e)
          }
        }
        
        // Invalidate markets queries to force refetch with updated tags
        queryClient.invalidateQueries({ queryKey: ['markets'] })
        
        // Navigate to the first (primary) market
        setTimeout(() => {
          navigate(`/vendor/markets/${createdMarketIds[0]}`)
        }, 500)
        
        setIsSubmitting(false)
        return
      }

      // Single market creation (original code path)

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
          boothFee: 0,
          applicationLink: formData.applicationSettings?.applicationLink || undefined,
          applicationDeadline: formData.applicationSettings?.applicationDeadline || undefined
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
        const data = response.data as any
        const newMarketId = data.id || data._id || data.market?.id
        
        // Auto-track with "interested" status using the same function as the track button
        await trackMarket(newMarketId, 'interested')
        
        // Small delay to ensure market is fully processed
        setTimeout(() => {
          navigate(`/vendor/markets/${newMarketId}`)
        }, 500)
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
    const firstItem = formData.schedule[0]
    const newDate = new Date()
    
    let dayOfWeek = 6
    if (formData.schedule.length > 0) {
      dayOfWeek = new Date(formData.schedule[formData.schedule.length - 1].eventDate || new Date()).getDay()
    }
    
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, {
        dayOfWeek: dayOfWeek,
        startTime: firstItem?.startTime || '08:00',
        endTime: firstItem?.endTime || '14:00',
startDate: formatLocalDate(newDate.toISOString()),
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
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string
        const compressedDataUrl = await compressImage(dataUrl)
        setMarketImage(compressedDataUrl)
      } catch (error) {
        console.error('Image compression failed:', error)
        alert('Failed to process image. Please try again.')
      }
    }
    reader.onerror = () => {
      alert('Failed to read file. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  const compressImage = (dataUrl: string, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = dataUrl
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0)
        const compressedDataUrl = canvas.toDataURL('image/webp', quality)
        resolve(compressedDataUrl)
      }
      img.onerror = (error) => {
        reject(error)
      }
    })
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

  const handleBack = () => {
    if (currentStep > 1) {
      prevStep();
    } else {
      navigate('/markets');
    }
  }

  return (
    <div className="space-y-3 animate-in slide-in-from-bottom-8 duration-500">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* Progress Steps - Mobile Friendly */}
      <div className="flex items-center gap-3 py-2">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="p-2 h-10 w-10 shrink-0"
          title={currentStep > 1 ? "Go to previous step" : "Go back to previous page"}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2 flex-1 justify-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors",
                currentStep >= step.number 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-white text-foreground border border-border"
              )}>
                {currentStep > step.number ? <CheckCircle className="w-4 h-4" /> : step.number}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-6 h-0.5",
                  currentStep > step.number ? "bg-accent" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="w-24 shrink-0">
          <span className="text-sm font-medium text-muted-foreground">
            {steps[currentStep - 1]?.title}
          </span>
        </div>
      </div>

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
        <>
          <Card className="px-3 py-4 space-y-4 -mx-3 rounded-xl border-0 shadow-none">
            {/* Banner Photo */}
            <div className="space-y-1.5">
              <input
                type="file"
                id="market-image-upload"
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                onChange={handleImageUpload}
                className="hidden"
              />
              {marketImage ? (
                <div className="relative group w-full h-28 rounded-lg overflow-hidden">
                  <img 
                    src={marketImage} 
                    alt="Market preview" 
                    className="w-full h-full object-cover" 
                  />
                  <label
                    htmlFor="market-image-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <div className="bg-white rounded-full p-2">
                      <Upload className="w-5 h-5" />
                    </div>
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="market-image-upload"
                  className="w-full h-28 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground bg-orange-50/50"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-base font-semibold">Add Banner Photo</span>
                </label>
              )}
            </div>

        {/* Market Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-foreground">Market Name *</label>
              <div className="relative">
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                    clearFieldError('name')
                  }}
                  onFocus={() => setIsMarketNameFocused(true)}
                  onBlur={() => setIsMarketNameFocused(false)}
                  placeholder="Market Name *"
                  className={cn((errors.name || apiErrors.name) && "border-red-500", "text-base font-semibold placeholder:text-muted-foreground/70")}
                />
                <MarketNameSuggestions
                  value={formData.name}
                  isFocused={isMarketNameFocused}
                  className="absolute bottom-full mb-2 left-0 right-0 z-50"
                  onSelect={(market) => {
                    // Just informational - don't auto-fill
                    console.log('Selected existing market:', market.name)
                  }}
                />
              </div>
              {(errors.name || apiErrors.name) && (
                <p className="text-red-500 text-xs">{errors.name || apiErrors.name}</p>
              )}
            </div>

      {/* Description */}
      <div className="space-y-1.5">

              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description..."
                rows={4}
                  className="text-base font-semibold placeholder:text-muted-foreground/70"
              />
            </div>

            {/* Category */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, category: value }))
                    clearFieldError('category')
                  }}
                  placeholder="Category"
                  options={categories.map(category => ({ value: category.value, label: category.label }))}
                />
                {(errors.category || apiErrors.category) && (
                  <p className="text-red-500 text-xs">{errors.category || apiErrors.category}</p>
                )}
              </div>
            </div>

    {/* Location */}
    <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <CityAutocomplete
                  value={formData.location.city}
                  onChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, city: value }
                    }))
                    clearFieldError('city')
                  }}
                  onStateChange={(state) => {
                    setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, state }
                    }))
                  }}
                  onError={(hasError) => {
                    if (hasError) {
                      setErrors(prev => ({ ...prev, city: 'Please select a city from the list' }))
                    } else {
                      setErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.city
                        return newErrors
                      })
                    }
                  }}
                  placeholder="Search City *"
                  error={!!(errors.city || apiErrors.city)}
                />
                {(errors.city || apiErrors.city) && (
                  <p className="text-red-500 text-xs">{errors.city || apiErrors.city}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Select
                  value={formData.location.state}
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, state: value }
                    }))
                    clearFieldError('state')
                  }}
                  placeholder="Province/State *"
                  options={provincesAndStates.map(ps => ({ value: ps.value, label: ps.label }))}
                />
                {(errors.state || apiErrors.state) && (
                  <p className="text-red-500 text-xs">{errors.state || apiErrors.state}</p>
                )}
              </div>
              
              <div className="sm:col-span-2">
                <Input
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  placeholder="Street address"
              className="text-base font-semibold placeholder:text-muted-foreground/70"
                />
              </div>
              
              <div className="sm:col-span-2">
                <Input
                  value={formData.location.zipCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, zipCode: e.target.value }
                  }))}
                  placeholder="Postal/Zip Code"
                  className="text-base font-semibold placeholder:text-muted-foreground/70 sm:max-w-xs"
                />
              </div>
            </div>
          </div>
        </Card>
        </>
      )}

      {currentStep === 2 && (
        <Card className="px-3 py-4 space-y-4 -mx-3 rounded-xl border-0 shadow-none">
          {/* Schedule */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4" />
                Schedule *
              </h3>
            </div>

            <div className="space-y-2">
              {formData.schedule.map((item, index) => (
                <div key={index} className="p-3 rounded-lg space-y-3 bg-muted/20 shadow-md">
                  <div className="relative">
                    <h4 className="text-base font-bold text-foreground text-center">Date {index + 1}</h4>
                    {formData.schedule.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeScheduleItem(index)}
                        className="absolute top-0 right-0 p-1 h-7 w-7"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 items-end">
                    <div className="flex-1 min-w-[100px]">
                      <label className="text-xs font-medium text-muted-foreground text-center block mb-1">Date</label>
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = (e.currentTarget.parentElement?.querySelector('input[type="date"]') as HTMLInputElement)
                          if (input) {
                            input.focus()
                            input.showPicker()
                          }
                        }}
                        className="w-full h-12 px-3 rounded-lg bg-white shadow-md hover:bg-accent hover:text-accent-foreground text-base flex items-center justify-center gap-2 relative z-10"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>
                          {item.eventDate ? new Date(item.eventDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date'}
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
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        style={{ WebkitAppearance: 'none' }}
                      />
                    </div>
                    
                    <div className="w-24">
                      <label className="text-xs font-medium text-muted-foreground text-center block mb-1">Start</label>
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = (e.currentTarget.parentElement?.querySelector('input[type="time"]') as HTMLInputElement)
                          if (input) {
                            input.focus()
                            input.showPicker()
                          }
                        }}
                        className="w-full h-12 px-2 rounded-lg bg-white shadow-md hover:bg-accent hover:text-accent-foreground text-base flex items-center justify-center gap-1 relative z-10"
                      >
                        <span>{item.startTime ? formatTime12Hour(item.startTime) : 'Start'}</span>
                      </button>
                      <Input
                        type="time"
                        value={item.startTime}
                        onChange={(e) => {
                          const newSchedule = [...formData.schedule]
                          newSchedule[index].startTime = e.target.value
                          setFormData(prev => ({ ...prev, schedule: newSchedule }))
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        style={{ WebkitAppearance: 'none' }}
                      />
                    </div>
                    
                    <div className="w-24">
                      <label className="text-xs font-medium text-muted-foreground text-center block mb-1">End</label>
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = (e.currentTarget.parentElement?.querySelector('input[type="time"]') as HTMLInputElement)
                          if (input) {
                            input.focus()
                            input.showPicker()
                          }
                        }}
                        className="w-full h-12 px-2 rounded-lg bg-white shadow-md hover:bg-accent hover:text-accent-foreground text-base flex items-center justify-center gap-1 relative z-10"
                      >
                        <span>{item.endTime ? formatTime12Hour(item.endTime) : 'End'}</span>
                      </button>
                      <Input
                        type="time"
                        value={item.endTime}
                        onChange={(e) => {
                          const newSchedule = [...formData.schedule]
                          newSchedule[index].endTime = e.target.value
                          setFormData(prev => ({ ...prev, schedule: newSchedule }))
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        style={{ WebkitAppearance: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between items-center">
                {/* Split Multiple Dates Option - only show if there are multiple dates */}
                {formData.schedule.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="split-dates"
                      checked={formData.additionalInfo.splitMultipleDates || false}
                      onValueChange={(checked) => setFormData(prev => ({
                        ...prev,
                        additionalInfo: { ...prev.additionalInfo, splitMultipleDates: checked }
                      }))}
                      className="h-5 w-5 sm:h-4 sm:w-4"
                    />
                    <label htmlFor="split-dates" className="font-bold text-sm text-foreground">
                      Different Vendors Each Day
                    </label>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addScheduleItem}
                  className="flex items-center gap-1 h-9 ml-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add Date
                </Button>
              </div>
              
              {/* Explanation note - only show when checkbox is checked */}
              {formData.additionalInfo.splitMultipleDates && formData.schedule.length > 1 && (
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Note:</span> We'll create separate market listings for each date. Each date will be shown on its own market card.
                  </p>
                </div>
              )}
            </div>
            
            {errors.schedule && <p className="text-red-500 text-xs">{errors.schedule}</p>}
            
            {/* Schedule Preview */}
            <div className="p-4 rounded-lg border border-accent/30 bg-accent/5">
              <h4 className="text-sm font-semibold text-foreground mb-2">Preview</h4>
              <p className="text-base text-foreground">{formatScheduleDisplay()}</p>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          {/* Contact & Additional Info */}
        <Card className="px-3 py-4 space-y-4 -mx-3 rounded-xl border-0 shadow-none">
            {/* Promoters Contact Information */}
            <div className="space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-base">
                <Phone className="w-4 h-4" />
                Promoter's Contact
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                   <Input
                    value={formData.contact.website || ''}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, website: e.target.value }
                      }))
                      clearFieldError('website')
                    }}
                    placeholder="Official Website/Link *"
                    className={cn((errors.website || apiErrors.website) && "border-red-500", "text-base font-semibold placeholder:text-muted-foreground/70")}
                  />
                  {(errors.website || apiErrors.website) && (
                    <p className="text-red-500 text-xs">{errors.website || apiErrors.website}</p>
                  )}
                </div>
                
                {/* Phone and Email temporarily hidden */}
                {/* 
                <div>
                  <Input
                    value={formData.contact.phone || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    placeholder="Phone"
                    className="font-semibold placeholder:text-muted-foreground/70"
                  />
                </div>
                
                <div>
                  <Input
                    type="email"
                    value={formData.contact.email || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    placeholder="Email"
                    className="font-semibold placeholder:text-muted-foreground/70"
                  />
                </div>
                */}
              </div>
            </div>

            {/* Application Information */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <Input
                    value={formData.applicationSettings?.applicationLink || ''}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        applicationSettings: { ...prev.applicationSettings, applicationLink: e.target.value }
                      }))
                    }}
                    placeholder="Application Link"
                    className="text-base font-semibold placeholder:text-muted-foreground/70"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = (e.currentTarget.parentElement?.querySelector('input[type="date"]') as HTMLInputElement)
                      if (input) {
                        input.focus()
                        input.showPicker()
                      }
                    }}
                    className="w-full min-h-[44px] px-3 rounded-lg bg-white shadow-md hover:bg-accent hover:text-accent-foreground text-base font-semibold flex items-center justify-center gap-2 relative z-10"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formData.applicationSettings?.applicationDeadline 
                        ? new Date(formData.applicationSettings.applicationDeadline + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                        : 'Select deadline'}
                    </span>
                  </button>
                  <Input
                    type="date"
                    value={formData.applicationSettings?.applicationDeadline || ''}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        applicationSettings: { ...prev.applicationSettings, applicationDeadline: e.target.value }
                      }))
                    }}
                    min={formatLocalDate(new Date().toISOString())}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ WebkitAppearance: 'none' }}
                  />
                </div>
              </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-base">Tags (max 3)</h3>
                <span className="text-xs text-muted-foreground">
                  {formData.additionalInfo.tags.length}/3
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.additionalInfo.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1 text-xs font-medium">
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
                    placeholder="Type tag..."
                    className="text-base font-semibold placeholder:text-muted-foreground/70"
                  />
                  {tagInputValue && formData.additionalInfo.tags.length < 3 && (
                    <div ref={tagSuggestionsRef} className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {ALLOWED_MARKET_TAGS
                        .filter(tag => 
                          !formData.additionalInfo.tags.includes(tag) &&
                          tag.toLowerCase().includes(tagInputValue.toLowerCase())
                        )
                        .slice(0, 8)
                        .map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              addTag(tag)
                              setTagInputValue('')
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Market Size Estimate */}
            <div className="space-y-1.5">
              <label className="text-base font-bold text-foreground">Estimated Market Size</label>
              <Select
                value={formData.additionalInfo.attendanceEstimate || ''}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  additionalInfo: { ...prev.additionalInfo, attendanceEstimate: value }
                }))}
                placeholder="Vendor count..."
                options={attendanceOptions.map(option => ({ value: option.value, label: option.label }))}
              />
            </div>

            {/* Accessibility Features */}
            <div className="space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2 text-base">
                <Accessibility className="w-4 h-4" />
                Accessibility & Amenities
              </h3>
              
              <div className="grid grid-cols-1 gap-1">
                <label htmlFor="wheelchair" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    id="wheelchair"
                    checked={formData.accessibility.wheelchairAccessible}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, wheelchairAccessible: checked }
                    }))}
                    className="h-6 w-6"
                  />
                  <span className="text-base">Wheelchair Accessible</span>
                </label>
                
                <label htmlFor="handicap-parking" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    id="handicap-parking"
                    checked={formData.accessibility.handicapParking}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, handicapParking: checked }
                    }))}
                    className="h-6 w-6"
                  />
                  <span className="text-base">Handicap Parking</span>
                </label>
                
                <label htmlFor="parking" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    id="parking"
                    checked={formData.accessibility.parkingAvailable}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, parkingAvailable: checked }
                    }))}
                    className="h-6 w-6"
                  />
                  <span className="text-base">Parking Available</span>
                </label>
                
                <label htmlFor="restrooms" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    id="restrooms"
                    checked={formData.accessibility.restroomsAvailable}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, restroomsAvailable: checked }
                    }))}
                    className="h-6 w-6"
                  />
                  <span className="text-base">Restrooms</span>
                </label>
                
                <label htmlFor="covered" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    id="covered"
                    checked={formData.accessibility.covered}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, covered: checked }
                    }))}
                    className="h-6 w-6"
                  />
                  <span className="text-base">Covered Area</span>
                </label>
                
                <label htmlFor="indoor" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    id="indoor"
                    checked={formData.accessibility.indoor}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, indoor: checked }
                    }))}
                    className="h-6 w-6"
                  />
                  <span className="text-base">Indoor</span>
                </label>
                
                <label htmlFor="outdoor-seating" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    id="outdoor-seating"
                    checked={formData.accessibility.outdoorSeating}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, outdoorSeating: checked }
                    }))}
                    className="h-6 w-6"
                  />
                  <span className="text-base">Outdoor Seating</span>
                </label>
                
                <label htmlFor="wifi" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    id="wifi"
                    checked={formData.accessibility.wifi}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, wifi: checked }
                    }))}
                    className="h-6 w-6"
                  />
                  <span className="text-base">WiFi</span>
                </label>
                
                <label htmlFor="atm" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    id="atm"
                    checked={formData.accessibility.atm}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, atm: checked }
                    }))}
                    className="h-6 w-6"
                  />
                  <span className="text-base">ATM</span>
                </label>
                
                <label htmlFor="food-court" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    id="food-court"
                    checked={formData.accessibility.foodCourt}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, foodCourt: checked }
                    }))}
                    className="h-6 w-6"
                  />
                  <span className="text-base">Food Court</span>
                </label>
                
                <label htmlFor="live-music" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    id="live-music"
                    checked={formData.accessibility.liveMusic}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, liveMusic: checked }
                    }))}
                    className="h-6 w-6"
                  />
                  <span className="text-base">Live Music</span>
                </label>
                
                <label htmlFor="alcohol" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    id="alcohol"
                    checked={formData.accessibility.alcoholAvailable}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, alcoholAvailable: checked }
                    }))}
                    className="h-6 w-6"
                  />
                  <span className="text-base">Alcohol</span>
                </label>
                
                <label htmlFor="family" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    id="family"
                    checked={formData.accessibility.familyFriendly}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, familyFriendly: checked }
                    }))}
                    className="h-6 w-6"
                  />
                  <span className="text-base">Family Friendly</span>
                </label>
                
                <label htmlFor="pets" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    id="pets"
                    checked={formData.accessibility.petFriendly}
                    onValueChange={(checked) => setFormData(prev => ({
                      ...prev,
                      accessibility: { ...prev.accessibility, petFriendly: checked }
                    }))}
                    className="h-6 w-6"
                  />
                  <span className="text-base">Pet Friendly</span>
                </label>
              </div>
            </div>
          </Card>

          {/* Market Preview */}
          <Card className="p-4">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
              <Store className="w-3 h-3 sm:w-4 sm:h-4" />
              Preview
            </h3>
            
            <div className="bg-surface border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{formData.name || 'Market Name'}</h4>
                  <p className="text-xs text-muted-foreground">
                    {categories.find(c => c.value === formData.category)?.label || 'Category'}
                  </p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  Community Listed
                </Badge>
              </div>
              
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {formData.location.city}, {formData.location.state}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {formatScheduleDisplay()}
                </div>
              </div>
              
              {formData.description && (
                <p className="text-sm text-foreground">{formData.description}</p>
              )}
            </div>
          </Card>

          {/* Notes Banner */}
          <button
            type="button"
            onClick={() => setIsNotesExpanded(!isNotesExpanded)}
            className="w-full flex items-center justify-between p-2 rounded-lg border border-orange-400/50 bg-orange-50/20"
          >
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Info className="w-4 h-4" />
              Notes
            </span>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isNotesExpanded && "rotate-180")} />
          </button>
          {isNotesExpanded && (
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside p-2">
              <li>Market listings are public</li>
              <li>More details help other vendors</li>
              <li>Admin-Managed - Edits require requests</li>
            </ul>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep} className="h-12 px-4 text-base font-semibold">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/vendor/tracked-markets')} className="h-12 px-4 text-base font-semibold">
            Cancel
          </Button>
          
          {currentStep < 3 ? (
            <Button onClick={nextStep} className="h-12 px-6 text-base font-semibold">
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="h-12 px-6 text-base font-semibold">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
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
