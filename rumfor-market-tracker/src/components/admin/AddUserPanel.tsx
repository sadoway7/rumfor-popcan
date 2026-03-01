import React, { useState } from 'react'
import { SidePanel } from '@/components/ui/SidePanel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { UserPlus, Mail, Phone, MapPin, Briefcase } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { UserRole } from '@/types'

interface AddUserPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const AddUserPanel: React.FC<AddUserPanelProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'vendor' as UserRole,
    company: '',
    bio: ''
  })
  const [isCreating, setIsCreating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { addToast } = useToast()

  const roleOptions: SelectOption[] = [
    { value: 'visitor', label: 'Visitor' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'promoter', label: 'Promoter' },
    { value: 'admin', label: 'Admin' }
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateUser = async () => {
    if (!validateForm()) return

    setIsCreating(true)
    try {
      // TODO: Implement actual API call
      console.log('Creating user:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      addToast({
        variant: 'success',
        title: 'User Created',
        description: `${formData.firstName} ${formData.lastName} has been created successfully. An invitation email has been sent.`
      })
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'vendor',
        company: '',
        bio: ''
      })
      setErrors({})
      onClose()
    } catch (error) {
      addToast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create user. Please try again.'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Add New User"
      description="Create a new user account and send invitation"
      width="lg"
    >
      <div className="space-y-6">
        <Card className="p-4">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Basic Information
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name *</label>
                <Input
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name *</label>
                <Input
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Role & Account
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">User Role</label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange('role', value)}
                options={roleOptions}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This determines what the user can access and do in the system
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-4">Optional Information</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Company or organization"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>
          </div>
        </Card>

        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> An invitation email will be sent to the user with instructions to set up their password and complete their profile.
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleCreateUser}
            disabled={isCreating}
            className="flex-1"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {isCreating ? 'Creating...' : 'Create User'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </SidePanel>
  )
}