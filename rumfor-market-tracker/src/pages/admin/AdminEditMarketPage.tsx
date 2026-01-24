import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { adminApi } from '@/features/admin/adminApi'
import { Market, MarketStatus, MarketCategory, MarketSchedule } from '@/types'
import {
  ArrowLeft,
  Save,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Calendar,
  Plus,
  Edit2,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Crown,
  AlertTriangle,
  Eye,
  Image as ImageIcon
} from 'lucide-react'

export function AdminEditMarketPage() {
  const { marketId } = useParams<{ marketId: string }>()
  const navigate = useNavigate()
  
  const [market, setMarket] = useState<Market | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as MarketCategory | '',
    status: '' as MarketStatus | '',
    applicationsEnabled: false,
    isActive: true,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  })

  // Schedule state
  const [schedules, setSchedules] = useState<MarketSchedule[]>([])
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<MarketSchedule | null>(null)
  const [scheduleForm, setScheduleForm] = useState({
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '16:00',
    startDate: '',
    endDate: '',
    isRecurring: false
  })

  // Image state
  const [images, setImages] = useState<string[]>([])
  const [heroImage, setHeroImage] = useState<string>('')
  const [showImageForm, setShowImageForm] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState('')

  const fetchMarket = useCallback(async () => {
    if (!marketId) return
    
    setIsLoading(true)
    setError(null)
    try {
      const response = await adminApi.getAdminMarket(marketId)
      if (response.data && (response.data as any).market) {
        const m = (response.data as any).market
        setMarket(m)
        setFormData({
          name: m.name || '',
          description: m.description || '',
          category: m.category || '',
          status: m.status || 'draft',
          applicationsEnabled: m.applicationsEnabled || false,
          isActive: m.status === 'active',
          address: m.location?.address || '',
          city: m.location?.city || '',
          state: m.location?.state || '',
          zipCode: m.location?.zipCode || '',
          country: m.location?.country || 'USA'
        })
        setSchedules(m.schedule || [])
        setImages(m.images || [])
        setHeroImage(m.images?.[0] || '')
      } else {
        setError('Market not found')
      }
    } catch (err) {
      setError('Failed to load market')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [marketId])

  useEffect(() => {
    fetchMarket()
  }, [fetchMarket])

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    if (!marketId) return
    
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      // Save basic market info
      await adminApi.updateAdminMarket(marketId, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        applicationsEnabled: formData.applicationsEnabled,
        isActive: formData.isActive,
        // Save location
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        // Save schedules
        schedule: schedules,
        // Save images
        images: images
      })
      setSuccessMessage('Market saved successfully!')
      fetchMarket()
    } catch (err) {
      setError('Failed to save market')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }, [marketId, formData, schedules, images, fetchMarket])

  const handleDelete = useCallback(async () => {
    if (!market || !window.confirm(`Are you sure you want to delete "${market.name}"? This action cannot be undone.`)) {
      return
    }
    
    setIsSaving(true)
    setError(null)
    
    try {
      await adminApi.deleteAdminMarket(market.id, 'Deleted by admin')
      navigate('/admin/markets')
    } catch (err) {
      setError('Failed to delete market')
      console.error(err)
      setIsSaving(false)
    }
  }, [market, navigate])

  // Schedule management functions
  const openScheduleForm = (schedule?: MarketSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule)
      setScheduleForm({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        startDate: schedule.startDate ? schedule.startDate.split('T')[0] : '',
        endDate: schedule.endDate ? schedule.endDate.split('T')[0] : '',
        isRecurring: schedule.isRecurring
      })
    } else {
      setEditingSchedule(null)
      setScheduleForm({
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '16:00',
        startDate: '',
        endDate: '',
        isRecurring: false
      })
    }
    setShowScheduleForm(true)
  }

  const closeScheduleForm = () => {
    setShowScheduleForm(false)
    setEditingSchedule(null)
  }

  const saveSchedule = useCallback(() => {
    // Validate that a date is selected
    if (!scheduleForm.startDate) {
      setError('Please select a date')
      return
    }
    
    const newSchedule: MarketSchedule = {
      id: editingSchedule?.id || `temp_${Date.now()}`,
      dayOfWeek: scheduleForm.dayOfWeek,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      startDate: new Date(scheduleForm.startDate).toISOString(),
      endDate: new Date(scheduleForm.startDate).toISOString(), // Use same date for start/end for single-day events
      isRecurring: false // Single specific dates are always non-recurring
    }

    if (editingSchedule) {
      setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? newSchedule : s))
    } else {
      setSchedules(prev => [...prev, newSchedule])
    }
    closeScheduleForm()
  }, [editingSchedule, scheduleForm])

  const deleteSchedule = useCallback((scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId))
  }, [])

  // Image management functions
  const openImageForm = () => {
    setImageUrlInput('')
    setShowImageForm(true)
  }

  const closeImageForm = () => {
    setShowImageForm(false)
    setImageUrlInput('')
  }

  const addImage = useCallback(() => {
    if (imageUrlInput.trim()) {
      setImages(prev => [...prev, imageUrlInput.trim()])
      if (!heroImage) {
        setHeroImage(imageUrlInput.trim())
      }
      closeImageForm()
    }
  }, [imageUrlInput, heroImage])

  const removeImage = useCallback((imageUrl: string) => {
    setImages(prev => prev.filter(img => img !== imageUrl))
    if (heroImage === imageUrl) {
      setHeroImage(images.find(img => img !== imageUrl) || '')
    }
  }, [heroImage, images])

  const setAsHero = useCallback((imageUrl: string) => {
    setHeroImage(imageUrl)
    // Move hero image to front
    setImages(prev => {
      const filtered = prev.filter(img => img !== imageUrl)
      return [imageUrl, ...filtered]
    })
  }, [])

  const categoryOptions: SelectOption[] = [
    { value: '', label: 'Select Category' },
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

  const statusOptions: SelectOption[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
        <span className="ml-2">Loading market...</span>
      </div>
    )
  }

  if (error && !market) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
        <Button onClick={() => navigate('/admin/markets')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Markets
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/markets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Market</h1>
            <p className="text-muted-foreground">
              {market?.name || 'Unknown Market'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert variant="default">
          <CheckCircle className="h-4 w-4" />
          <span>{successMessage}</span>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Market Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter market name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter market description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                    options={categoryOptions}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                    options={statusOptions}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Schedule */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                <Calendar className="h-5 w-5 inline mr-2" />
                Market Dates
              </h2>
              <Button variant="outline" size="sm" onClick={() => openScheduleForm()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Date
              </Button>
            </div>
            
            {schedules.length === 0 ? (
              <p className="text-muted-foreground text-sm">No dates added. Click "Add Date" to add specific market dates.</p>
            ) : (
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-center min-w-[60px]">
                        <div className="text-xs font-medium">
                          {new Date(schedule.startDate).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {new Date(schedule.startDate).getDate()}
                        </div>
                        <div className="text-xs opacity-75">
                          {new Date(schedule.startDate).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">
                          {new Date(schedule.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openScheduleForm(schedule)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteSchedule(schedule.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Location */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              <MapPin className="h-5 w-5 inline mr-2" />
              Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street address"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP Code</label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="ZIP"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Application Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              <FileText className="h-5 w-5 inline mr-2" />
              Application System
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Enable Application System</p>
                  <p className="text-sm text-muted-foreground">
                    When enabled, vendors must apply to join this market
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleInputChange('applicationsEnabled', !formData.applicationsEnabled)}
                  className="gap-2"
                >
                  {formData.applicationsEnabled ? (
                    <>
                      <ToggleRight className="h-5 w-5 text-green-600" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                      Disabled
                    </>
                  )}
                </Button>
              </div>

              {formData.applicationsEnabled && (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Application system is enabled. Vendor applications will be required.</span>
                </Alert>
              )}
            </div>
          </Card>

          {/* Images */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                <ImageIcon className="h-5 w-5 inline mr-2" />
                Market Images
              </h2>
              <Button variant="outline" size="sm" onClick={openImageForm}>
                <Plus className="h-4 w-4 mr-1" />
                Add Image
              </Button>
            </div>
            
            {/* Hero Image */}
            {heroImage && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Main Image</p>
                <div className="relative rounded-lg overflow-hidden border">
                  <img 
                    src={heroImage} 
                    alt="Market main image" 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbS1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzYwNiI+SW1hZ2Ugbm90IGF2YWlsYWJsZTwvdGV4dD48L3N2Zz4='
                    }}
                  />
                </div>
              </div>
            )}

            {/* Image Gallery */}
            {images.length === 0 ? (
              <p className="text-muted-foreground text-sm">No images added. Click "Add Image" to add photos.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {images.map((imageUrl, index) => (
                  <div key={index} className={`relative group rounded-lg overflow-hidden border-2 ${heroImage === imageUrl ? 'border-blue-500' : 'border-transparent'}`}>
                    <img 
                      src={imageUrl} 
                      alt={`Market image ${index + 1}`}
                      className="w-full h-20 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    {heroImage === imageUrl && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">Main</div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {heroImage !== imageUrl && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => setAsHero(imageUrl)}
                          title="Set as main image"
                        >
                          <Crown className="h-3 w-3" />
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeImage(imageUrl)}
                        title="Remove image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Market Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Market Details</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant={market?.marketType === 'promoter-managed' ? 'default' : 'outline'}>
                  {market?.marketType === 'promoter-managed' ? (
                    <><Crown className="h-3 w-3 mr-1" />Promoter</>
                  ) : (
                    <><Users className="h-3 w-3 mr-1" />Vendor</>
                  )}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={
                  market?.status === 'active' ? 'default' :
                  market?.status === 'suspended' ? 'destructive' :
                  market?.status === 'draft' ? 'outline' : 'muted'
                }>
                  {market?.status || 'Unknown'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-sm">
                  {market?.createdAt ? new Date(market.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-sm">
                  {market?.updatedAt ? new Date(market.updatedAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tracking Vendors</span>
                <span className="font-medium">{market?.stats?.favoriteCount || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Applications</span>
                <span className="font-medium">{market?.stats?.applicationCount || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Comments</span>
                <span className="font-medium">{market?.stats?.commentCount || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Views</span>
                <span className="font-medium">{market?.stats?.viewCount || 0}</span>
              </div>
            </div>
          </Card>

          {/* Assigned Promoter */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              <Crown className="h-5 w-5 inline mr-2" />
              Assigned Promoter
            </h2>
            {market?.promoter ? (
              <div className="space-y-2">
                <p className="font-medium">
                  {market.promoter.firstName} {market.promoter.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {market.promoter.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Role: {market.promoter.role}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No promoter assigned
              </p>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`/markets/${marketId}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Public Page
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  if (market?.status === 'active') {
                    handleInputChange('status', 'inactive')
                  } else {
                    handleInputChange('status', 'active')
                  }
                }}
              >
                {market?.status === 'active' ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2 text-orange-600" />
                    Deactivate Market
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Activate Market
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingSchedule ? 'Edit Date' : 'Add Market Date'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  type="date"
                  value={scheduleForm.startDate}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, startDate: e.target.value, endDate: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <Input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <Input
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              {scheduleForm.startDate && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Preview:</strong> {new Date(scheduleForm.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={closeScheduleForm} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={saveSchedule} className="flex-1" disabled={!scheduleForm.startDate}>
                  {editingSchedule ? 'Update' : 'Add Date'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Image Form Modal */}
      {showImageForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              <ImageIcon className="h-5 w-5 inline mr-2" />
              Add Image from URL
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <Input
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a direct image URL (ends with .jpg, .png, .webp, etc.)
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={closeImageForm} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={addImage} className="flex-1" disabled={!imageUrlInput.trim()}>
                  Add Image
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
