import { AdminTools } from '@/components/AdminTools'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useAdminSystemSettings, useAdminEmailTemplates, useAdminEmailConfig } from '@/features/admin/hooks/useAdmin'
import { Settings, Mail, Shield, Bell, Palette, Database, Save, RefreshCw } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'

export function AdminSettingsPage() {
  const { systemSettings, isLoadingSettings, refreshSettings, handleUpdateSetting } = useAdminSystemSettings()
  const { emailTemplates, isLoadingTemplates, refreshTemplates } = useAdminEmailTemplates()
  const {
    emailConfig,
    isLoadingEmailConfig,
    isTestingEmailConnection,
    isSendingTestEmail,
    refreshEmailConfig,
    handleUpdateEmailConfig,
    handleTestConnection,
    handleSendTestEmail
  } = useAdminEmailConfig()
  const [activeTab, setActiveTab] = useState<'general' | 'moderation' | 'notifications' | 'email' | 'appearance' | 'security'>('general')
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [emailFormData, setEmailFormData] = useState({
    host: '',
    port: 465,
    secure: true,
    authMethod: 'PLAIN' as 'PLAIN' | 'LOGIN' | 'CRAM-MD5',
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'RumFor Market Tracker',
    replyTo: '',
    isActive: true
  })
  const [testEmail, setTestEmail] = useState('')
  const { addToast } = useToast()

  // Load email config when component mounts or when tab changes to email
  useEffect(() => {
    if (activeTab === 'email') {
      refreshEmailConfig()
    }
  }, [activeTab, refreshEmailConfig])

  // Update form data when email config is loaded
  useEffect(() => {
    if (emailConfig) {
      setEmailFormData({
        host: emailConfig.host || '',
        port: emailConfig.port || 465,
        secure: emailConfig.secure || true,
        authMethod: (emailConfig.authMethod || 'PLAIN') as 'PLAIN' | 'LOGIN' | 'CRAM-MD5',
        username: emailConfig.username || '',
        password: emailConfig.password || '', // Keep password (it's masked but has value)
        fromEmail: emailConfig.fromEmail || '',
        fromName: emailConfig.fromName || 'RumFor Market Tracker',
        replyTo: emailConfig.replyTo || '',
        isActive: emailConfig.isActive || true
      })
    }
  }, [emailConfig])

  const handleSettingChange = useCallback((key: string, value: string) => {
    setUnsavedChanges(true)
    handleUpdateSetting(key, value)
  }, [handleUpdateSetting])

  const saveAllSettings = useCallback(async () => {
    setIsSaving(true)
    try {
      // Refresh settings from server to confirm all changes are persisted
      await refreshSettings()
      setUnsavedChanges(false)
      addToast({ 
        variant: 'success', 
        title: 'Settings Saved', 
        description: 'All settings have been saved successfully.' 
      })
    } catch (error) {
      addToast({ 
        variant: 'destructive', 
        title: 'Save Failed', 
        description: 'Failed to save settings. Please try again.' 
      })
    } finally {
      setIsSaving(false)
    }
  }, [refreshSettings, addToast])



  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'moderation', label: 'Moderation', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Database }
  ] as const

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Site Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Site Name</label>
            <Input 
              defaultValue="RumFor Marketplace"
              onChange={(e) => handleSettingChange('site_name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Site Description</label>
            <textarea 
              className="w-full p-2 border rounded-md resize-none"
              rows={3}
              defaultValue="A comprehensive marketplace platform for vendors and promoters"
              onChange={(e) => handleSettingChange('site_description', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Contact Email</label>
            <Input 
              type="email"
              defaultValue="admin@rumfor.com"
              onChange={(e) => handleSettingChange('contact_email', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Support Phone</label>
            <Input 
              defaultValue="1-800-RUMFOR"
              onChange={(e) => handleSettingChange('support_phone', e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Registration Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Allow New Registrations</label>
              <p className="text-xs text-muted-foreground">Enable or disable user registration</p>
            </div>
            <Button
              variant={systemSettings.find(s => s.key === 'user_registration_enabled')?.value === 'true' ? 'primary' : 'outline'}
              onClick={() => handleSettingChange('user_registration_enabled', 'true')}
            >
              Enabled
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Email Verification Required</label>
              <p className="text-xs text-muted-foreground">Require email verification for new accounts</p>
            </div>
            <Button
              variant={systemSettings.find(s => s.key === 'email_verification_required')?.value === 'true' ? 'primary' : 'outline'}
              onClick={() => handleSettingChange('email_verification_required', 'true')}
            >
              Required
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderModerationTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Content Moderation</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Auto-Moderation Enabled</label>
              <p className="text-xs text-muted-foreground">Automatically flag inappropriate content</p>
            </div>
            <Button
              variant={systemSettings.find(s => s.key === 'auto_moderation_enabled')?.value === 'true' ? 'primary' : 'outline'}
              onClick={() => handleSettingChange('auto_moderation_enabled', 'true')}
            >
              Enabled
            </Button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Moderation Sensitivity</label>
            <select 
              className="w-full p-2 border rounded-md"
              defaultValue="medium"
              onChange={(e) => handleSettingChange('moderation_sensitivity', e.target.value)}
            >
              <option value="low">Low - Only obvious violations</option>
              <option value="medium">Medium - Balanced approach</option>
              <option value="high">High - Strict filtering</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Report Response Time (hours)</label>
            <Input 
              type="number"
              defaultValue="24"
              onChange={(e) => handleSettingChange('report_response_hours', e.target.value)}
            />
          </div>
        </div>
      </Card>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Application Notifications</label>
              <p className="text-xs text-muted-foreground">Send emails for new applications</p>
            </div>
            <Button
              variant="primary"
            >
              Enabled
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Moderation Alerts</label>
              <p className="text-xs text-muted-foreground">Notify admins of reported content</p>
            </div>
            <Button
              variant="primary"
            >
              Enabled
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">System Updates</label>
              <p className="text-xs text-muted-foreground">Send platform update notifications</p>
            </div>
            <Button
              variant="outline"
            >
              Disabled
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )

  const handleEmailFormChange = (field: string, value: any) => {
    setEmailFormData(prev => ({ ...prev, [field]: value }))
    setUnsavedChanges(true)
  }

  const handleSaveEmailConfig = async () => {
    try {
      setIsSaving(true)
      await handleUpdateEmailConfig(emailFormData)
      setUnsavedChanges(false)
      addToast({
        variant: 'success',
        title: 'Email Configuration Saved',
        description: 'Email configuration has been saved successfully.'
      })
    } catch (error) {
      addToast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Failed to save email configuration. Please try again.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestEmailConnection = async () => {
    try {
      const result = await handleTestConnection()
      // Refresh email config to get updated connection status from database
      await refreshEmailConfig()
      if (result.success) {
        addToast({
          variant: 'success',
          title: 'Connection Test Successful',
          description: 'Email server connection is working.'
        })
      } else {
        addToast({
          variant: 'destructive',
          title: 'Connection Test Failed',
          description: result.message || 'Failed to connect to email server.'
        })
      }
    } catch (error) {
      addToast({
        variant: 'destructive',
        title: 'Connection Test Failed',
        description: 'Failed to test email connection.'
      })
    }
  }

  const handleSendTestEmailClick = async () => {
    if (!testEmail) {
      addToast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please enter a valid email address.'
      })
      return
    }

    // Don't send testConfig if password is empty/masked - use saved config instead
    // Backend masks with asterisks (*), frontend checks for bullets (•) - handle both
    const isMasked = emailFormData.password && (
      emailFormData.password.includes('•••') ||
      emailFormData.password.includes('***') ||
      emailFormData.password.startsWith('*')
    )
    const hasPassword = emailFormData.password && !isMasked
    const testConfigToSend = hasPassword ? emailFormData : undefined

    try {
      const result = await handleSendTestEmail(testEmail, testConfigToSend)
      // Refresh email config to get updated connection status from database
      await refreshEmailConfig()
      if (result.success) {
        addToast({
          variant: 'success',
          title: 'Test Email Sent',
          description: `Test email sent successfully to ${testEmail}`
        })
      } else {
        addToast({
          variant: 'destructive',
          title: 'Failed to Send Test Email',
          description: result.message || 'Failed to send test email.'
        })
      }
    } catch (error) {
      addToast({
        variant: 'destructive',
        title: 'Failed to Send Test Email',
        description: 'An error occurred while sending test email.'
      })
    }
  }

  const renderEmailTab = () => (
    <div className="space-y-6">
      {/* Email Configuration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Email Configuration</h3>
          <Button
            variant="outline"
            onClick={refreshEmailConfig}
            disabled={isLoadingEmailConfig}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingEmailConfig ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Host</label>
              <Input
                value={emailFormData.host}
                onChange={(e) => handleEmailFormChange('host', e.target.value)}
                placeholder="smtp.example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Port</label>
              <Input
                type="number"
                value={emailFormData.port}
                onChange={(e) => handleEmailFormChange('port', parseInt(e.target.value) || 0)}
                placeholder="465"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Authentication Method</label>
            <select
              className="w-full p-2 border rounded-md"
              value={emailFormData.authMethod}
              onChange={(e) => handleEmailFormChange('authMethod', e.target.value)}
            >
              <option value="PLAIN">PLAIN (Default)</option>
              <option value="LOGIN">LOGIN</option>
              <option value="CRAM-MD5">CRAM-MD5</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Select the authentication method required by your SMTP server. Try LOGIN or CRAM-MD5 if PLAIN doesn't work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Username</label>
              <Input
                value={emailFormData.username}
                onChange={(e) => handleEmailFormChange('username', e.target.value)}
                placeholder="username@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Password</label>
              <Input
                type="password"
                value={emailFormData.password}
                onChange={(e) => handleEmailFormChange('password', e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">From Email</label>
              <Input
                type="email"
                value={emailFormData.fromEmail}
                onChange={(e) => handleEmailFormChange('fromEmail', e.target.value)}
                placeholder="noreply@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">From Name</label>
              <Input
                value={emailFormData.fromName}
                onChange={(e) => handleEmailFormChange('fromName', e.target.value)}
                placeholder="RumFor Market Tracker"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reply To</label>
            <Input
              type="email"
              value={emailFormData.replyTo}
              onChange={(e) => handleEmailFormChange('replyTo', e.target.value)}
              placeholder="support@example.com"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="secure"
                checked={emailFormData.secure}
                onChange={(e) => handleEmailFormChange('secure', e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="secure" className="text-sm font-medium">Use SSL/TLS</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={emailFormData.isActive}
                onChange={(e) => handleEmailFormChange('isActive', e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="isActive" className="text-sm font-medium">Email System Active</label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveEmailConfig}
              disabled={!unsavedChanges || isSaving || isLoadingEmailConfig}
            >
              <Save className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
            <Button
              variant="outline"
              onClick={handleTestEmailConnection}
              disabled={isTestingEmailConnection}
            >
              {isTestingEmailConnection ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-2">Send Test Email</h4>
            <div className="flex items-center gap-2">
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter test email address"
                className="flex-1"
              />
              <Button
                onClick={handleSendTestEmailClick}
                disabled={isSendingTestEmail || !testEmail}
              >
                {isSendingTestEmail ? 'Sending...' : 'Send Test Email'}
              </Button>
            </div>
          </div>

          {emailConfig && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-2">Connection Status</h4>
              <div className="flex items-center gap-2">
                <Badge variant={emailConfig.lastTestStatus === 'success' ? 'default' : 'destructive'}>
                  {emailConfig.lastTestStatus === 'success' ? 'Connected' : 'Connection Failed'}
                </Badge>
                {emailConfig.lastTestedAt && (
                  <span className="text-sm text-muted-foreground">
                    Last tested: {new Date(emailConfig.lastTestedAt).toLocaleString()}
                  </span>
                )}
              </div>
              {emailConfig.lastTestError && (
                <p className="text-sm text-destructive mt-2">
                  Error: {emailConfig.lastTestError}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Email Templates */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Email Templates</h3>
          <Button
            variant="outline"
            onClick={refreshTemplates}
            disabled={isLoadingTemplates}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingTemplates ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="space-y-4">
          {emailTemplates.map((template) => (
            <div key={template.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{template.name}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant={template.isActive ? 'default' : 'outline'}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{template.subject}</p>
              <div className="text-xs text-muted-foreground">
                Variables: {template.variables.join(', ')}
              </div>
            </div>
          ))}
          {emailTemplates.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No email templates found
            </p>
          )}
        </div>
      </Card>
    </div>
  )

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Theme Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full border"></div>
              <Input 
                defaultValue="#3B82F6"
                onChange={(e) => handleSettingChange('primary_color', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Secondary Color</label>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-600 rounded-full border"></div>
              <Input 
                defaultValue="#6B7280"
                onChange={(e) => handleSettingChange('secondary_color', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Logo URL</label>
            <Input 
              defaultValue="/logo.png"
              onChange={(e) => handleSettingChange('logo_url', e.target.value)}
            />
          </div>
        </div>
      </Card>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
            <Input 
              type="number"
              defaultValue="30"
              onChange={(e) => handleSettingChange('session_timeout', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Login Attempts</label>
            <Input 
              type="number"
              defaultValue="5"
              onChange={(e) => handleSettingChange('max_login_attempts', e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Two-Factor Authentication</label>
              <p className="text-xs text-muted-foreground">Require 2FA for admin accounts</p>
            </div>
            <Button
              variant="outline"
            >
              Optional
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unsavedChanges && (
            <Badge variant="warning">Unsaved Changes</Badge>
          )}
          <Button
            variant="outline"
            onClick={refreshSettings}
            disabled={isLoadingSettings}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingSettings ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={saveAllSettings}
            disabled={!unsavedChanges || isSaving}
          >
            <Save className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Settings Navigation */}
      <Card className="p-6">
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'moderation' && renderModerationTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'email' && renderEmailTab()}
          {activeTab === 'appearance' && renderAppearanceTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </div>
      </Card>

      {/* Additional Tools */}
      <AdminTools />
    </div>
  )
}