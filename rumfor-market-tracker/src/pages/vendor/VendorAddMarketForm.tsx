import { useState } from 'react'
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
import { Market, MarketCategory } from '@/types'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Store, 
  Phone, 
  DollarSign, 
  Accessibility,
  CheckCircle,
  Plus,
  X
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
  }
  pricing: {
    boothFee?: number
    isFree: boolean
  }
  additionalInfo: {
    tags: string[]
    vendorCount?: number
    attendanceEstimate?: string
    paymentMethods: string[]
    setupRequirements: string[]
  }
}

const categories = [
  { value: 'farmers-market', label: 'Farmers Market' },
  { value: 'arts-crafts', label: 'Arts & Crafts Fair' },
  { value: 'flea-market', label: 'Flea Market' },
  { value: 'food-festival', label: 'Food Festival' },
  { value: 'holiday-market', label: 'Holiday Market' },
  { value: 'craft-show', label: 'Craft Show' },
  { value: 'community-event', label: 'Community Event' },
  { value: 'farmers-market', label: 'Farmers Market' },
  { value: 'farmers-market', label: 'Farmers Market' }
]

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
]

const attendanceOptions = [
  { value: 'small', label: 'Small (Under 50 vendors)' },
  { value: 'medium', label: 'Medium (50-200 vendors)' },
  { value: 'large', label: 'Large (200+ vendors)' }
]

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'debit', label: 'Debit' },
  { value: 'mobile-pay', label: 'Mobile Payment (Venmo, etc.)' },
  { value: 'check', label: 'Check' }
]

export function VendorAddMarketForm() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<MarketFormData>({
    name: '',
    description: '',
    category: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    schedule: [{
      dayOfWeek: 6, // Saturday default
      startTime: '08:00',
      endTime: '14:00',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      isRecurring: true
    }],
    contact: {},
    accessibility: {
      wheelchairAccessible: false,
      parkingAvailable: true,
      restroomsAvailable: true,
      familyFriendly: true,
      petFriendly: false
    },
    pricing: {
      isFree: false
    },
    additionalInfo: {
      tags: [],
      paymentMethods: ['cash', 'credit-card'],
      setupRequirements: []
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    
    try {
      const marketData: Omit<Market, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        description: formData.description,
        category: formData.category as MarketCategory,
        promoterId: user?.id || '',
        location: formData.location,
        schedule: formData.schedule.map(scheduleItem => ({
          ...scheduleItem,
          id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        })),
        status: 'draft',
        marketType: 'user-created',
        images: [],
        tags: formData.additionalInfo.tags,
        accessibility: formData.accessibility,
        contact: formData.contact,
        applicationFields: []
      }

      const response = await marketsApi.createMarket(marketData)
      
      if (response.success && response.data) {
        // Show success and redirect
        alert('Market added successfully! You can now track this market and plan your participation.')
        navigate('/vendor')
      } else {
        throw new Error(response.error || 'Failed to create market')
      }
    } catch (error) {
      console.error('Error submitting market:', error)
      alert('Failed to submit market. Please try again.')
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
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isRecurring: true
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
    if (tag && !formData.additionalInfo.tags.includes(tag)) {
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

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Market name, location, and category' },
    { number: 2, title: 'Schedule & Details', description: 'When the market operates' },
    { number: 3, title: 'Additional Info', description: 'Contact, accessibility, and extras' }
  ]

  const formatScheduleDisplay = () => {
    if (formData.schedule.length === 0) return 'No schedule set'
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const schedules = formData.schedule.map(s => {
      const dayName = dayNames[s.dayOfWeek]
      return `${dayName} ${s.startTime}-${s.endTime}`
    })
    
    return schedules.join(', ')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/vendor')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Market</h1>
          <p className="text-muted-foreground">Add a market to track and organize your participation</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                currentStep >= step.number 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {currentStep > step.number ? <CheckCircle className="w-4 h-4" /> : step.number}
              </div>
              <div className="ml-3">
                <div className={cn(
                  "text-sm font-medium",
                  currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4",
                  currentStep > step.number ? "bg-accent" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Form Steps */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>
            <p className="text-muted-foreground text-sm">Let's start with the essential details about this market.</p>
          </div>

          {/* Market Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Market Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Downtown Farmers Market"
              className={cn(errors.name && "border-red-500")}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category *</label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              placeholder="Select market category"
              options={categories.map(category => ({ value: category.value, label: category.label }))}
            />
            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the market, what it offers, or what makes it special..."
              rows={3}
            />
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location *
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">City *</label>
                <Input
                  value={formData.location.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value }
                  }))}
                  placeholder="City"
                  className={cn(errors.city && "border-red-500")}
                />
                {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">State *</label>
                <Input
                  value={formData.location.state}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, state: e.target.value }
                  }))}
                  placeholder="State"
                  className={cn(errors.state && "border-red-500")}
                />
                {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Zip Code</label>
                <Input
                  value={formData.location.zipCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, zipCode: e.target.value }
                  }))}
                  placeholder="12345"
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addScheduleItem}
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Time
              </Button>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Day</label>
                      <Select
                        value={item.dayOfWeek.toString()}
                        onValueChange={(value) => {
                          const newSchedule = [...formData.schedule]
                          newSchedule[index].dayOfWeek = parseInt(value)
                          setFormData(prev => ({ ...prev, schedule: newSchedule }))
                        }}
                        options={daysOfWeek.map(day => ({ value: day.value.toString(), label: day.label }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Start Time</label>
                      <Input
                        type="time"
                        value={item.startTime}
                        onChange={(e) => {
                          const newSchedule = [...formData.schedule]
                          newSchedule[index].startTime = e.target.value
                          setFormData(prev => ({ ...prev, schedule: newSchedule }))
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">End Time</label>
                      <Input
                        type="time"
                        value={item.endTime}
                        onChange={(e) => {
                          const newSchedule = [...formData.schedule]
                          newSchedule[index].endTime = e.target.value
                          setFormData(prev => ({ ...prev, schedule: newSchedule }))
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`recurring-${index}`}
                      checked={item.isRecurring}
                      onValueChange={(checked) => {
                        const newSchedule = [...formData.schedule]
                        newSchedule[index].isRecurring = checked
                        setFormData(prev => ({ ...prev, schedule: newSchedule }))
                      }}
                    />
                    <label htmlFor={`recurring-${index}`} className="text-sm text-foreground">
                      This is a recurring schedule
                    </label>
                  </div>
                </div>
              ))}
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
                Accessibility Features
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

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing Information
              </h3>
              
              <div className="flex items-center gap-2 mb-4">
                <Checkbox
                  id="free"
                  checked={formData.pricing.isFree}
                  onValueChange={(checked) => setFormData(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, isFree: checked }
                  }))}
                />
                <label htmlFor="free" className="text-sm text-foreground">
                  This market is free to attend
                </label>
              </div>
              
              {!formData.pricing.isFree && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Booth Fee (if known)</label>
                  <Input
                    type="number"
                    value={formData.pricing.boothFee || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      pricing: { ...prev.pricing, boothFee: parseFloat(e.target.value) || undefined }
                    }))}
                    placeholder="50"
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {formData.additionalInfo.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
                <Input
                  placeholder="Add a tag..."
                  className="w-32"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
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

            {/* Payment Methods */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Payment Methods Accepted</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {paymentMethods.map(method => (
                  <div key={method.value} className="flex items-center gap-2">
                    <Checkbox
                      id={method.value}
                      checked={formData.additionalInfo.paymentMethods.includes(method.value)}
                      onValueChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            additionalInfo: {
                              ...prev.additionalInfo,
                              paymentMethods: [...prev.additionalInfo.paymentMethods, method.value]
                            }
                          }))
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            additionalInfo: {
                              ...prev.additionalInfo,
                              paymentMethods: prev.additionalInfo.paymentMethods.filter(m => m !== method.value)
                            }
                          }))
                        }
                      }}
                    />
                    <label htmlFor={method.value} className="text-sm text-foreground">
                      {method.label}
                    </label>
                  </div>
                ))}
              </div>
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