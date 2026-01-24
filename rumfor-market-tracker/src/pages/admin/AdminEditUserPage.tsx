import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAdminStore } from '@/features/admin/adminStore'
import { adminApi } from '@/features/admin/adminApi'
import { UserRole } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, Save, Shield, ShieldCheck, UserX, UserCheck, Mail, Phone, Building, Calendar, FileText, MessageSquare, Image, MapPin, Heart, Clock } from 'lucide-react'

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
}

interface FullUserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  username?: string
  displayName?: string
  role: UserRole
  avatar?: string
  bio?: string
  phone?: string
  businessName?: string
  businessDescription?: string
  businessLicense?: string
  insuranceCertificate?: string
  taxId?: string
  organizationName?: string
  organizationDescription?: string
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

export function AdminEditUserPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { updateUserRole, suspendUser, verifyUser, fetchUsers } = useAdminStore()
  
  const [formData, setFormData] = useState<{
    firstName: string
    lastName: string
    email: string
    role: UserRole
    isActive: boolean
    isEmailVerified: boolean
    phone: string
    businessName: string
    bio: string
    username: string
    organizationName: string
    twoFactorEnabled: boolean
    createdAt: string
  }>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'visitor',
    isActive: true,
    isEmailVerified: false,
    phone: '',
    businessName: '',
    bio: '',
    username: '',
    organizationName: '',
    twoFactorEnabled: false,
    createdAt: new Date().toISOString()
  })
  const [userStats, setUserStats] = useState<{
    totalApplications: number
    approvedApplications: number
    rejectedApplications: number
    pendingApplications: number
    followingCount: number
    lastActiveAt: string
  }>({
    totalApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    pendingApplications: 0,
    followingCount: 0,
    lastActiveAt: ''
  })
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [activity, setActivity] = useState<UserActivity | null>(null)
  const [loadingActivity, setLoadingActivity] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadUserData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const response = await adminApi.getUser(id)
      if (response.success && response.data) {
        const user = response.data as FullUserProfile
        setFormData({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          phone: user.phone || '',
          businessName: user.businessName || '',
          bio: user.bio || '',
          username: user.username || '',
          organizationName: user.organizationName || '',
          twoFactorEnabled: user.twoFactorEnabled,
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
        // Load activity
        await loadUserActivity(id)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserActivity = async (userId: string) => {
    setLoadingActivity(true)
    try {
      const response = await adminApi.getUserActivity(userId)
      if (response.success && response.data) {
        setActivity(response.data)
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
    try {
      await updateUserRole(id, formData.role)
      await suspendUser(id, formData.isActive)
      await verifyUser(id, formData.isEmailVerified)
      await fetchUsers()
      setSuccessMessage('User updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update user:', error)
    } finally {
      setSaving(false)
    }
  }

  const roleOptions = [
    { value: 'visitor', label: 'Visitor' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'promoter', label: 'Promoter' },
    { value: 'admin', label: 'Admin' }
  ]

  const roleDescriptions: Record<UserRole, string> = {
    visitor: 'Can browse markets and events',
    vendor: 'Can apply to markets and manage applications',
    promoter: 'Can create and manage markets',
    admin: 'Full access to all admin features'
  }

  const getStatusBadgeVariant = (status: string): 'default' | 'outline' | 'destructive' | 'muted' => {
    switch (status) {
      case 'approved': return 'default'
      case 'rejected': return 'destructive'
      case 'applied': case 'under-review': return 'muted'
      default: return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysAgo = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      {successMessage && (
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-green-700">{successMessage}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                className="w-full p-3 border rounded-lg bg-background text-sm min-h-[80px]"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="User bio"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
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
              <div className="space-y-2">
                <label className="text-sm font-medium">2FA Enabled</label>
                <div className="flex items-center gap-2 h-10">
                  <input
                    type="checkbox"
                    checked={formData.twoFactorEnabled}
                    onChange={(e) => setFormData({ ...formData, twoFactorEnabled: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Vendor/Promoter Specific */}
          {(formData.role === 'vendor' || formData.role === 'promoter') && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {formData.role === 'vendor' ? 'Vendor Information' : 'Organization Information'}
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    <Building className="h-4 w-4 inline mr-1" />
                    {formData.role === 'vendor' ? 'Business Name' : 'Organization Name'}
                  </label>
                  <Input
                    value={formData.businessName || formData.organizationName}
                    onChange={(e) => formData.role === 'vendor' 
                      ? setFormData({ ...formData, businessName: e.target.value })
                      : setFormData({ ...formData, organizationName: e.target.value })
                    }
                  />
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Role & Permissions</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">User Role</label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                  options={roleOptions}
                />
                <p className="text-sm text-muted-foreground">{roleDescriptions[formData.role]}</p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {formData.isEmailVerified ? (
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                  ) : (
                    <Shield className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">Email Verification</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.isEmailVerified ? 'Email has been verified' : 'Email not yet verified'}
                    </p>
                  </div>
                </div>
                <Button
                  variant={formData.isEmailVerified ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, isEmailVerified: !formData.isEmailVerified })}
                >
                  {formData.isEmailVerified ? 'Unverify' : 'Verify'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {formData.isActive ? (
                    <UserCheck className="h-5 w-5 text-green-500" />
                  ) : (
                    <UserX className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Account Status</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.isActive ? 'Account is active' : 'Account is suspended'}
                    </p>
                  </div>
                </div>
                <Button
                  variant={formData.isActive ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                >
                  {formData.isActive ? 'Suspend' : 'Activate'}
                </Button>
              </div>
            </div>
          </Card>

          {/* User Activity Section */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">User Activity</h2>
            
            {loadingActivity ? (
              <p className="text-muted-foreground">Loading activity...</p>
            ) : (
              <div className="space-y-6">
                {/* Applications */}
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Applications ({activity?.applications.length || 0})
                  </h3>
                  {activity?.applications && activity.applications.length > 0 ? (
                    <div className="space-y-2">
                      {activity.applications.slice(0, 5).map(app => (
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

                {/* Markets Following/Tracking */}
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Following ({userStats.followingCount})
                  </h3>
                  {activity?.tracking && activity.tracking.length > 0 ? (
                    <div className="space-y-2">
                      {activity.tracking.slice(0, 5).map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.marketName}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.marketCategory || 'Unknown'} • {getDaysAgo(item.updatedAt)}
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

                {/* Recent Comments */}
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Recent Comments ({activity?.comments.length || 0})
                  </h3>
                  {activity?.comments && activity.comments.length > 0 ? (
                    <div className="space-y-2">
                      {activity.comments.slice(0, 3).map(comment => (
                        <div key={comment.id} className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm line-clamp-2">{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {comment.marketName} • {getDaysAgo(comment.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No comments yet</p>
                  )}
                </div>

                {/* Recent Photos */}
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Recent Photos ({activity?.photos.length || 0})
                  </h3>
                  {activity?.photos && activity.photos.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {activity.photos.slice(0, 4).map(photo => (
                        <div key={photo.id} className="aspect-square bg-muted/50 rounded-lg overflow-hidden">
                          <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No photos uploaded</p>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {/* User Statistics - Real Data */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">User Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Applications</span>
                <span className="font-medium">{userStats.totalApplications}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Approved</span>
                <span className="font-medium text-green-600">{userStats.approvedApplications}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rejected</span>
                <span className="font-medium text-red-600">{userStats.rejectedApplications}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-medium text-yellow-600">{userStats.pendingApplications}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Following
                </span>
                <span className="font-medium">{userStats.followingCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Last Active
                </span>
                <span className="font-medium">{getDaysAgo(userStats.lastActiveAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Member Since
                </span>
                <span className="font-medium">{formatDate(formData.createdAt || new Date().toISOString())}</span>
              </div>
            </div>
          </Card>

          {/* Account Info */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge variant={formData.role === 'admin' ? 'destructive' : formData.role === 'promoter' ? 'default' : 'outline'}>
                  {formData.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email Verified</span>
                {formData.isEmailVerified ? (
                  <Badge variant="default"><ShieldCheck className="h-3 w-3 mr-1" /> Verified</Badge>
                ) : (
                  <Badge variant="outline">Unverified</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Account Status</span>
                {formData.isActive ? (
                  <Badge variant="default"><UserCheck className="h-3 w-3 mr-1" /> Active</Badge>
                ) : (
                  <Badge variant="destructive"><UserX className="h-3 w-3 mr-1" /> Suspended</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">2FA</span>
                <span className="text-sm">{formData.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                View Activity Log
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Login History
              </Button>
            </div>
          </Card>

          <Button 
            className="w-full" 
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
