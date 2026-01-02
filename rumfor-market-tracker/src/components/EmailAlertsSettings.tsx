import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Mail, Bell, Calendar, AlertCircle, Settings, Save, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface EmailAlertPreferences {
  marketUpdates: boolean
  applicationDeadlines: boolean
  newMarketAnnouncements: boolean
  eventReminders: boolean
  weeklyDigest: boolean
  marketingEmails: boolean
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly'
}

interface EmailAlertsSettingsProps {
  isOpen: boolean
  onClose: () => void
  onSave: (preferences: EmailAlertPreferences) => Promise<void>
  initialPreferences?: EmailAlertPreferences
  isLoading?: boolean
}

const defaultPreferences: EmailAlertPreferences = {
  marketUpdates: true,
  applicationDeadlines: true,
  newMarketAnnouncements: true,
  eventReminders: true,
  weeklyDigest: false,
  marketingEmails: false,
  frequency: 'immediate'
}

export const EmailAlertsSettings: React.FC<EmailAlertsSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPreferences = defaultPreferences,
  isLoading = false
}) => {
  const [preferences, setPreferences] = useState<EmailAlertPreferences>(initialPreferences)
  const [hasChanges, setHasChanges] = useState(false)

  React.useEffect(() => {
    setPreferences(initialPreferences)
    setHasChanges(false)
  }, [initialPreferences, isOpen])

  const handlePreferenceChange = (key: keyof EmailAlertPreferences, value: boolean | string) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    setHasChanges(JSON.stringify(newPreferences) !== JSON.stringify(initialPreferences))
  }

  const handleSave = async () => {
    try {
      await onSave(preferences)
      setHasChanges(false)
      onClose()
    } catch (error) {
      console.error('Failed to save email preferences:', error)
    }
  }

  const handleCancel = () => {
    setPreferences(initialPreferences)
    setHasChanges(false)
    onClose()
  }

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'daily', label: 'Daily Digest' },
    { value: 'weekly', label: 'Weekly Summary' },
    { value: 'monthly', label: 'Monthly Update' }
  ]

  const alertTypes = [
    {
      key: 'marketUpdates' as keyof EmailAlertPreferences,
      title: 'Market Updates',
      description: 'Get notified when markets you track are updated or modified',
      icon: Settings
    },
    {
      key: 'applicationDeadlines' as keyof EmailAlertPreferences,
      title: 'Application Deadlines',
      description: 'Reminders about upcoming application deadlines for your tracked markets',
      icon: AlertCircle
    },
    {
      key: 'newMarketAnnouncements' as keyof EmailAlertPreferences,
      title: 'New Market Announcements',
      description: 'Be the first to know about new markets that match your interests',
      icon: Bell
    },
    {
      key: 'eventReminders' as keyof EmailAlertPreferences,
      title: 'Event Reminders',
      description: 'Remind me when markets are starting soon or have special events',
      icon: Calendar
    }
  ]

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Email Alert Settings</h2>
              <p className="text-sm text-muted-foreground">
                Configure your email notification preferences
              </p>
            </div>
          </div>
        </div>

        {/* Alert Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Types</h3>
          <div className="space-y-3">
            {alertTypes.map(({ key, title, description, icon: Icon }) => (
              <Card key={key} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{title}</h4>
                      <input
                        type="checkbox"
                        checked={preferences[key] as boolean}
                        onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Additional Options</h3>
          <div className="space-y-3">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Weekly Digest</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your tracked markets and activities
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.weeklyDigest}
                  onChange={(e) => handlePreferenceChange('weeklyDigest', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Marketing Emails</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional emails about new features and platform updates
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketingEmails}
                  onChange={(e) => handlePreferenceChange('marketingEmails', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Frequency Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Frequency</h3>
          <Card className="p-4">
            <Select
              value={preferences.frequency}
              onValueChange={(value) => handlePreferenceChange('frequency', value as EmailAlertPreferences['frequency'])}
              options={frequencyOptions}
              placeholder="Select frequency"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Choose how often you want to receive email notifications
            </p>
          </Card>
        </div>

        {/* Info Box */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Note</p>
              <p>
                You can change these settings at any time in your profile. 
                Critical security notifications will always be sent regardless of your preferences.
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isLoading}
            className={cn(
              hasChanges && !isLoading && "bg-green-600 hover:bg-green-700"
            )}
          >
            {isLoading ? (
              <div className="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}