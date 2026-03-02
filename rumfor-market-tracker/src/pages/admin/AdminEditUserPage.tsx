import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '@/features/admin/adminApi'
import { UserRole } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { UserAvatar } from '@/components/UserAvatar'
import { getFullUploadUrl } from '@/config/constants'
import { 
  ArrowLeft, Save, Shield, ShieldCheck, UserX, UserCheck, Mail, Phone, 
  Building, Calendar, FileText, MessageSquare, Image, MapPin, Heart, 
  Clock, Settings, Globe, Instagram, Facebook, ShoppingBag, ChevronDown, ChevronUp,
  Store, Trash2
} from 'lucide-react'

interface UserActivity {
  applications: Array<{
    id: string
    marketId?: string
    marketName: string
    marketCategory?: string
    status: string
    createdAt: string
  }>
  comments: Array<{
    id: string
    marketId?: string
    marketName: string
    content: string
    createdAt: string
  }>
  photos: Array<{
    id: string
    marketId?: string
    marketName: string
    url: string
    createdAt: string
  }>
  tracking: Array<{
    id: string
    marketId?: string
    marketName: string
    marketCategory?: string
    marketStatus?: string
    status: string
    updatedAt: string
  }>
  createdMarkets: Array<{
    id: string
    name: string
    category?: string
    status?: string
    isActive?: boolean
    createdByType?: 'vendor' | 'promoter' | 'admin'
    city?: string
    state?: string
    createdAt: string
  }>
}

interface FullUserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  username?: string
  displayName?: string
  role: UserRole
  profileImage?: string
  bio?: string
  phone?: string
  businessName?: string
  businessDescription?: string
  businessLicense?: string
  insuranceCertificate?: string
  taxId?: string
  organizationName?: string
  organizationDescription?: string
  vendorProfile?: {
    tagline?: string
    blurb?: string
    website?: string
    productCategories?: string[]
    cardColor?: string
    profileImage?: string
    instagram?: string
    facebook?: string
    tiktok?: string
    publicPhone?: string
    galleryImages?: string[]
    etsy?: string
    shoppingLink?: string
    city?: string
    state?: string
  }
  preferences?: {
    emailNotifications: boolean
    smsNotifications: boolean
    locationTracking: boolean
    theme: string
  }
  twoFactorEnabled: boolean
  isEmailVerified: boolean
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
  totalApplications: number
  approvedApplications: number
  rejectedApplications: number
  pendingApplications: number
  followingCount: number
  lastActiveAt: string
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  username: string
  displayName: string
  role: UserRole
  isActive: boolean
  isEmailVerified: boolean
  twoFactorEnabled: boolean
  phone: string
  bio: string
  businessName: string
  businessDescription: string
  businessLicense: string
  insuranceCertificate: string
  taxId: string
  organizationName: string
  organizationDescription: string
  profileImage: string
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    locationTracking: boolean
    theme: string
  }
  vendorProfile: {
    tagline: string
    blurb: string
    website: string
    productCategories: string[]
    cardColor: string
    profileImage: string
    instagram: string
    facebook: string
    tiktok: string
    publicPhone: string
    galleryImages: string[]
    etsy: string
    shoppingLink: string
    city: string
    state: string
  }
  createdAt: string
}

const roleOptions = [
  { value: 'visitor', label: 'Visitor' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'promoter', label: 'Promoter' },
  { value: 'admin', label: 'Admin' }
]

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
]

const categoryOptions = [
  'jewelry', 'crafts', 'food', 'produce', 'art', 'clothing', 'home-goods', 
  'vintage', 'flowers', 'pottery', 'baked-goods', 'coffee', 'beauty', 'other'
]

function CollapsibleSection({ title, children, defaultOpen = false, icon: Icon }: { 
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  icon?: React.ComponentType<{ className?: string }>
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 font-semibold">
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
          {title}
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {isOpen && <div className="p-4 pt-0 border-t">{children}</div>}
    </Card>
  )
}

export function AdminEditUserPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    displayName: '',
    role: 'visitor',
    isActive: true,
    isEmailVerified: false,
    twoFactorEnabled: false,
    phone: '',
    bio: '',
    businessName: '',
    businessDescription: '',
    businessLicense: '',
    insuranceCertificate: '',
    taxId: '',
    organizationName: '',
    organizationDescription: '',
    profileImage: '',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      locationTracking: true,
      theme: 'light'
    },
    vendorProfile: {
      tagline: '',
      blurb: '',
      website: '',
      productCategories: [],
      cardColor: '',
      profileImage: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      publicPhone: '',
      galleryImages: [],
      etsy: '',
      shoppingLink: '',
      city: '',
      state: ''
    },
    createdAt: new Date().toISOString()
  })
  
  const [userStats, setUserStats] = useState({
    totalApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    pendingApplications: 0,
    followingCount: 0,
    lastActiveAt: ''
  })
  
  const [activity, setActivity] = useState<UserActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingActivity, setLoadingActivity] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const loadUserData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const response = await adminApi.getUser(id)
      if (response.success && response.data) {
        const user = response.data as FullUserProfile
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          username: user.username || '',
          displayName: user.displayName || '',
          role: user.role || 'visitor',
          isActive: user.isActive ?? true,
          isEmailVerified: user.isEmailVerified ?? false,
          twoFactorEnabled: user.twoFactorEnabled ?? false,
          phone: user.phone || '',
          bio: user.bio || '',
          businessName: user.businessName || '',
          businessDescription: user.businessDescription || '',
          businessLicense: user.businessLicense || '',
          insuranceCertificate: user.insuranceCertificate || '',
          taxId: user.taxId || '',
          organizationName: user.organizationName || '',
          organizationDescription: user.organizationDescription || '',
          profileImage: user.profileImage || '',
          preferences: {
            emailNotifications: user.preferences?.emailNotifications ?? true,
            smsNotifications: user.preferences?.smsNotifications ?? false,
            locationTracking: user.preferences?.locationTracking ?? true,
            theme: user.preferences?.theme || 'light'
          },
          vendorProfile: {
            tagline: user.vendorProfile?.tagline || '',
            blurb: user.vendorProfile?.blurb || '',
            website: user.vendorProfile?.website || '',
            productCategories: user.vendorProfile?.productCategories || [],
            cardColor: user.vendorProfile?.cardColor || '',
            profileImage: user.vendorProfile?.profileImage || '',
            instagram: user.vendorProfile?.instagram || '',
            facebook: user.vendorProfile?.facebook || '',
            tiktok: user.vendorProfile?.tiktok || '',
            publicPhone: user.vendorProfile?.publicPhone || '',
            galleryImages: user.vendorProfile?.galleryImages || [],
            etsy: user.vendorProfile?.etsy || '',
            shoppingLink: user.vendorProfile?.shoppingLink || '',
            city: user.vendorProfile?.city || '',
            state: user.vendorProfile?.state || ''
          },
          createdAt: user.createdAt
        })
        setUserStats({
          totalApplications: user.totalApplications,
          approvedApplications: user.approvedApplications,
          rejectedApplications: user.rejectedApplications,
          pendingApplications: user.pendingApplications,
          followingCount: user.followingCount,
          lastActiveAt: user.lastActiveAt
        })
        await loadUserActivity(id)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
      setErrorMessage('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const loadUserActivity = async (userId: string) => {
    setLoadingActivity(true)
    try {
      const response = await adminApi.getUserActivity(userId)
      if (response.success && response.data) {
        setActivity({
        ...response.data,
        createdMarkets: response.data.createdMarkets || []
      } as UserActivity)
      }
    } catch (error) {
      console.error('Failed to load user activity:', error)
    } finally {
      setLoadingActivity(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [id])

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    setErrorMessage('')
    try {
      const response = await adminApi.updateUserProfile(id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username || undefined,
        displayName: formData.displayName || undefined,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        role: formData.role,
        isActive: formData.isActive,
        isEmailVerified: formData.isEmailVerified,
        twoFactorEnabled: formData.twoFactorEnabled,
        businessName: formData.businessName || undefined,
        businessDescription: formData.businessDescription || undefined,
        businessLicense: formData.businessLicense || undefined,
        insuranceCertificate: formData.insuranceCertificate || undefined,
        taxId: formData.taxId || undefined,
        organizationName: formData.organizationName || undefined,
        organizationDescription: formData.organizationDescription || undefined,
        profileImage: formData.profileImage || undefined,
        preferences: formData.preferences,
        vendorProfile: formData.vendorProfile
      })
      
      if (response.success) {
        setSuccessMessage('User updated successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrorMessage('Failed to update user')
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      setErrorMessage('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysAgo = (dateString: string) => {
    if (!dateString) return 'N/A'
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  const getStatusBadgeVariant = (status: string): 'default' | 'outline' | 'destructive' | 'muted' => {
    switch (status) {
      case 'approved': return 'default'
      case 'rejected': return 'destructive'
      case 'applied': case 'under-review': return 'muted'
      default: return 'outline'
    }
  }

  const toggleCategory = (category: string) => {
    const current = formData.vendorProfile.productCategories || []
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category]
    setFormData({
      ...formData,
      vendorProfile: { ...formData.vendorProfile, productCategories: updated }
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit User</h1>
            <p className="text-muted-foreground">Manage user account details and permissions</p>
          </div>
        </div>
        <Badge variant={formData.role === 'admin' ? 'destructive' : formData.role === 'promoter' ? 'default' : 'outline'}>
          {formData.role}
        </Badge>
      </div>

      {successMessage && (
        <Card className="p-4 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <p className="text-green-700 dark:text-green-400">{successMessage}</p>
        </Card>
      )}

      {errorMessage && (
        <Card className="p-4 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
          <p className="text-red-700 dark:text-red-400">{errorMessage}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <CollapsibleSection title="Basic Information" defaultOpen icon={UserCheck}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name *</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name *</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="@username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Public display name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email (read-only)</label>
                <Input type="email" value={formData.email} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                className="w-full p-3 border rounded-lg bg-background text-sm min-h-[80px]"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="User bio (max 500 characters)"
                maxLength={500}
              />
            </div>
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">Profile Image URL</label>
              <div className="flex gap-2">
                <Input
                  value={formData.profileImage}
                  onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                  placeholder="/uploads/profile/image.webp"
                  className="flex-1"
                />
                {formData.profileImage && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFormData({ ...formData, profileImage: '' })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {formData.profileImage && (
                <div className="mt-2">
                  <img 
                    src={getFullUploadUrl(formData.profileImage)} 
                    alt="Profile" 
                    className="w-20 h-20 object-cover rounded-full border"
                  />
                </div>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Account Status & Permissions" defaultOpen icon={Shield}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">User Role</label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                  options={roleOptions}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Theme Preference</label>
                <Select
                  value={formData.preferences.theme}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    preferences: { ...formData.preferences, theme: value }
                  })}
                  options={themeOptions}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Account status</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.isEmailVerified}
                  onChange={(e) => setFormData({ ...formData, isEmailVerified: e.target.checked })}
                  className="h-4 w-4"
                />
                <div>
                  <p className="text-sm font-medium">Verified</p>
                  <p className="text-xs text-muted-foreground">Email verified</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.twoFactorEnabled}
                  onChange={(e) => setFormData({ ...formData, twoFactorEnabled: e.target.checked })}
                  className="h-4 w-4"
                />
                <div>
                  <p className="text-sm font-medium">2FA</p>
                  <p className="text-xs text-muted-foreground">Two-factor auth</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.preferences.emailNotifications}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    preferences: { ...formData.preferences, emailNotifications: e.target.checked }
                  })}
                  className="h-4 w-4"
                />
                <div>
                  <p className="text-sm font-medium">Emails</p>
                  <p className="text-xs text-muted-foreground">Notifications</p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {(formData.role === 'vendor' || formData.role === 'promoter') && (
            <CollapsibleSection 
              title={formData.role === 'vendor' ? 'Vendor Information' : 'Organization Information'} 
              icon={Building}
            >
              {formData.role === 'vendor' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Business Name</label>
                      <Input
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tax ID</label>
                      <Input
                        value={formData.taxId}
                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Business Description</label>
                    <textarea
                      className="w-full p-3 border rounded-lg bg-background text-sm min-h-[80px]"
                      value={formData.businessDescription}
                      onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Business License</label>
                      <Input
                        value={formData.businessLicense}
                        onChange={(e) => setFormData({ ...formData, businessLicense: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Insurance Certificate</label>
                      <Input
                        value={formData.insuranceCertificate}
                        onChange={(e) => setFormData({ ...formData, insuranceCertificate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Organization Name</label>
                    <Input
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Organization Description</label>
                    <textarea
                      className="w-full p-3 border rounded-lg bg-background text-sm min-h-[80px]"
                      value={formData.organizationDescription}
                      onChange={(e) => setFormData({ ...formData, organizationDescription: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </CollapsibleSection>
          )}

          {formData.role === 'vendor' && (
            <CollapsibleSection title="Vendor Profile (Public)" icon={Globe}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tagline</label>
                    <Input
                      value={formData.vendorProfile.tagline}
                      onChange={(e) => setFormData({
                        ...formData,
                        vendorProfile: { ...formData.vendorProfile, tagline: e.target.value }
                      })}
                      placeholder="Short tagline (max 100 chars)"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Card Color</label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.vendorProfile.cardColor}
                        onChange={(e) => setFormData({
                          ...formData,
                          vendorProfile: { ...formData.vendorProfile, cardColor: e.target.value }
                        })}
                        placeholder="#hex or tailwind class"
                      />
                      {formData.vendorProfile.cardColor && (
                        <div 
                          className="w-10 h-10 rounded border" 
                          style={{ backgroundColor: formData.vendorProfile.cardColor.startsWith('#') ? formData.vendorProfile.cardColor : undefined }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Blurb</label>
                  <textarea
                    className="w-full p-3 border rounded-lg bg-background text-sm min-h-[80px]"
                    value={formData.vendorProfile.blurb}
                    onChange={(e) => setFormData({
                      ...formData,
                      vendorProfile: { ...formData.vendorProfile, blurb: e.target.value }
                    })}
                    placeholder="Public blurb about the vendor (max 500 chars)"
                    maxLength={500}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      value={formData.vendorProfile.website}
                      onChange={(e) => setFormData({
                        ...formData,
                        vendorProfile: { ...formData.vendorProfile, website: e.target.value }
                      })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Public Phone</label>
                    <Input
                      value={formData.vendorProfile.publicPhone}
                      onChange={(e) => setFormData({
                        ...formData,
                        vendorProfile: { ...formData.vendorProfile, publicPhone: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Instagram className="h-4 w-4" /> Instagram
                    </label>
                    <Input
                      value={formData.vendorProfile.instagram}
                      onChange={(e) => setFormData({
                        ...formData,
                        vendorProfile: { ...formData.vendorProfile, instagram: e.target.value }
                      })}
                      placeholder="@username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Facebook className="h-4 w-4" /> Facebook
                    </label>
                    <Input
                      value={formData.vendorProfile.facebook}
                      onChange={(e) => setFormData({
                        ...formData,
                        vendorProfile: { ...formData.vendorProfile, facebook: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      TikTok
                    </label>
                    <Input
                      value={formData.vendorProfile.tiktok}
                      onChange={(e) => setFormData({
                        ...formData,
                        vendorProfile: { ...formData.vendorProfile, tiktok: e.target.value }
                      })}
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <ShoppingBag className="h-4 w-4" /> Etsy
                    </label>
                    <Input
                      value={formData.vendorProfile.etsy}
                      onChange={(e) => setFormData({
                        ...formData,
                        vendorProfile: { ...formData.vendorProfile, etsy: e.target.value }
                      })}
                      placeholder="Etsy shop URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Shopping Link</label>
                    <Input
                      value={formData.vendorProfile.shoppingLink}
                      onChange={(e) => setFormData({
                        ...formData,
                        vendorProfile: { ...formData.vendorProfile, shoppingLink: e.target.value }
                      })}
                      placeholder="Online store URL"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input
                      value={formData.vendorProfile.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        vendorProfile: { ...formData.vendorProfile, city: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State</label>
                    <Input
                      value={formData.vendorProfile.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        vendorProfile: { ...formData.vendorProfile, state: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                          formData.vendorProfile.productCategories?.includes(cat)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Vendor Profile Image (overrides main)</label>
                  <Input
                    value={formData.vendorProfile.profileImage}
                    onChange={(e) => setFormData({
                      ...formData,
                      vendorProfile: { ...formData.vendorProfile, profileImage: e.target.value }
                    })}
                    placeholder="/uploads/vendor/profile.webp"
                  />
                  {formData.vendorProfile.profileImage && (
                    <div className="mt-2">
                      <img 
                        src={getFullUploadUrl(formData.vendorProfile.profileImage)} 
                        alt="Vendor profile" 
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Gallery Images</label>
                  <p className="text-xs text-muted-foreground">Add image URLs (one per line) or click X to remove</p>
                  <textarea
                    className="w-full p-3 border rounded-lg bg-background text-sm min-h-[80px] font-mono"
                    value={formData.vendorProfile.galleryImages?.join('\n') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      vendorProfile: { 
                        ...formData.vendorProfile, 
                        galleryImages: e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
                      }
                    })}
                    placeholder="One image URL per line&#10;/uploads/gallery/img1.webp&#10;/uploads/gallery/img2.webp"
                  />
                  {formData.vendorProfile.galleryImages && formData.vendorProfile.galleryImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {formData.vendorProfile.galleryImages.map((img, idx) => (
                        <div key={idx} className="relative border rounded-lg overflow-hidden">
                          <img 
                            src={getFullUploadUrl(img)} 
                            alt={`Gallery ${idx + 1}`}
                            className="w-full aspect-square object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              vendorProfile: {
                                ...formData.vendorProfile,
                                galleryImages: formData.vendorProfile.galleryImages?.filter((_, i) => i !== idx)
                              }
                            })}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                            {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleSection>
          )}

          <CollapsibleSection title="User Activity" icon={FileText}>
            {loadingActivity ? (
              <p className="text-muted-foreground">Loading activity...</p>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Applications ({activity?.applications.length || 0})
                  </h3>
                  {activity?.applications && activity.applications.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {activity.applications.slice(0, 10).map(app => (
                        <div key={app.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{app.marketName}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(app.createdAt)}</p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(app.status)}>{app.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No applications yet</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Following ({userStats.followingCount})
                  </h3>
                  {activity?.tracking && activity.tracking.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {activity.tracking.slice(0, 10).map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.marketName}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.marketCategory || 'Unknown'} - {getDaysAgo(item.updatedAt)}
                            </p>
                          </div>
                          <Badge variant="outline">{item.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not following any markets</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Recent Comments ({activity?.comments.length || 0})
                  </h3>
                  {activity?.comments && activity.comments.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {activity.comments.slice(0, 5).map(comment => (
                        <div key={comment.id} className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm line-clamp-2">{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {comment.marketName} - {getDaysAgo(comment.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No comments yet</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Recent Photos ({activity?.photos.length || 0})
                  </h3>
                  {activity?.photos && activity.photos.length > 0 ? (
                    <div className="grid grid-cols-5 gap-2">
                      {activity.photos.slice(0, 10).map(photo => (
                        <div key={photo.id} className="aspect-square bg-muted/50 rounded-lg overflow-hidden">
                          <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No photos uploaded</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Created Markets ({activity?.createdMarkets?.length || 0})
                  </h3>
                  {activity?.createdMarkets && activity.createdMarkets.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {activity.createdMarkets.map(market => (
                        <div key={market.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{market.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {market.city && market.state ? `${market.city}, ${market.state}` : 'No location'} - {market.category || 'No category'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Created: {formatDate(market.createdAt)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1">
                              <Badge variant={market.isActive ? 'default' : 'outline'} className="text-xs">
                                {market.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {market.createdByType && (
                                <Badge 
                                  variant={market.createdByType === 'vendor' ? 'muted' : 'outline'} 
                                  className="text-xs"
                                >
                                  {market.createdByType}
                                </Badge>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/admin/markets/${market.id}/edit`)}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No markets created</p>
                  )}
                </div>
              </div>
            )}
          </CollapsibleSection>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <UserAvatar 
                user={{
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  profileImage: formData.profileImage
                }}
                size="lg"
              />
              <div>
                <p className="font-semibold">{formData.firstName} {formData.lastName}</p>
                <p className="text-sm text-muted-foreground">{formData.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <Badge variant={formData.role === 'admin' ? 'destructive' : 'outline'}>{formData.role}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                {formData.isActive ? (
                  <Badge variant="default"><UserCheck className="h-3 w-3 mr-1" /> Active</Badge>
                ) : (
                  <Badge variant="destructive"><UserX className="h-3 w-3 mr-1" /> Suspended</Badge>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                {formData.isEmailVerified ? (
                  <Badge variant="default"><ShieldCheck className="h-3 w-3 mr-1" /> Verified</Badge>
                ) : (
                  <Badge variant="outline">Unverified</Badge>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">2FA</span>
                <span>{formData.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>

            <hr className="my-4" />

            <div className="space-y-3 text-sm">
              <h4 className="font-semibold">Statistics</h4>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Applications</span>
                <span>{userStats.totalApplications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-green-600">Approved</span>
                <span>{userStats.approvedApplications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-red-600">Rejected</span>
                <span>{userStats.rejectedApplications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-yellow-600">Pending</span>
                <span>{userStats.pendingApplications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Following
                </span>
                <span>{userStats.followingCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Last Active
                </span>
                <span>{getDaysAgo(userStats.lastActiveAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Joined
                </span>
                <span>{formatDate(formData.createdAt)}</span>
              </div>
            </div>

            <hr className="my-4" />

            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Reset Password
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Editing: {formData.firstName} {formData.lastName} ({formData.email})
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/users')}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
