import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { usePreferencesStore } from '@/features/theme/themeStore'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { BugReportModal } from '@/components/BugReportModal'

export function SettingsPage() {
  const { user, deleteProfile, isLoading } = useAuthStore()
  const { temperatureUnit, setTemperatureUnit } = usePreferencesStore()
  const navigate = useNavigate()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBugReport, setShowBugReport] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account</p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Account</h2>
          <Card padding="none">
            <CardContent className="divide-y divide-surface-3 px-4">
              <div className="flex items-center justify-between py-3 min-w-0">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">Email address</p>
                </div>
                <Link 
                  to={user?.role === 'vendor' || user?.role === 'promoter' || user?.role === 'admin' ? '/vendor/profile' : '/profile'}
                  className="flex-shrink-0"
                >
                  <Button variant="ghost" size="sm" className="text-accent hover:text-accent-light h-9 px-3">
                    Edit
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Account type</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Security</h2>
          <Card padding="none">
            <CardContent className="divide-y divide-surface-3 px-4">
              <div className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-sm font-medium text-foreground">Password</p>
                  <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
                </div>
                <Button variant="ghost" size="sm" className="text-accent hover:text-accent-light h-9 px-3 flex-shrink-0">
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Display</h2>
          <Card padding="none">
            <CardContent className="divide-y divide-surface-3 px-4">
              <div className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-sm font-medium text-foreground">Temperature Unit</p>
                  <p className="text-xs text-muted-foreground">Choose how temperatures are displayed</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => setTemperatureUnit('celsius')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-l-lg border transition-colors ${
                      temperatureUnit === 'celsius'
                        ? 'bg-accent text-white border-accent'
                        : 'bg-surface-2 text-foreground border-surface-3 hover:bg-surface-3'
                    }`}
                  >
                    °C
                  </button>
                  <button
                    onClick={() => setTemperatureUnit('fahrenheit')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-r-lg border transition-colors ${
                      temperatureUnit === 'fahrenheit'
                        ? 'bg-accent text-white border-accent'
                        : 'bg-surface-2 text-foreground border-surface-3 hover:bg-surface-3'
                    }`}
                  >
                    °F
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Notifications</h2>
          <Card padding="none">
            <CardContent className="divide-y divide-surface-3 px-4">
              <div className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-sm font-medium text-foreground">Email notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    emailNotifications ? 'bg-accent' : 'bg-surface-3'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    emailNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-sm font-medium text-foreground">Push notifications</p>
                  <p className="text-xs text-muted-foreground">Receive browser notifications</p>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    pushNotifications ? 'bg-accent' : 'bg-surface-3'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    pushNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Help & Support</h2>
          <Card padding="none">
            <CardContent className="divide-y divide-surface-3 px-4">
              <div className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-sm font-medium text-foreground">Report a Bug</p>
                  <p className="text-xs text-muted-foreground">Found an issue? Let us know</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-accent hover:text-accent-light h-9 px-3 flex-shrink-0"
                  onClick={() => setShowBugReport(true)}
                >
                  Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card padding="none">
          <CardContent className="px-4">
            <div className="flex items-center justify-between py-3">
              <div className="min-w-0 flex-1 pr-4">
                <p className="text-sm font-medium text-foreground">Delete profile</p>
                <p className="text-xs text-muted-foreground">Remove your personal data only</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-9 px-3 flex-shrink-0"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Profile Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Profile"
        description="This action cannot be undone"
        size="sm"
      >
        <ModalContent>
          <Alert variant="destructive" className="mb-4" title="Warning">
            Are you sure you want to delete your profile?
            
            <div className="mt-3 space-y-2">
              <div>
                <p className="font-medium text-sm">Will be deleted:</p>
                <ul className="list-disc list-inside mt-1 text-sm">
                  <li>Your account credentials</li>
                  <li>Personal profile information</li>
                  <li>Notification preferences</li>
                  <li>Application history</li>
                  <li>Comments and reviews</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-sm">Will remain:</p>
                <ul className="list-disc list-inside mt-1 text-sm">
                  <li>Markets you've created (will become unassociated)</li>
                  <li>Photos uploaded to markets (will remain)</li>
                </ul>
              </div>
            </div>
            
            <p className="mt-3 text-sm font-medium">This action cannot be undone.</p>
          </Alert>
        </ModalContent>
        
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              setIsDeleting(true)
              try {
                await deleteProfile()
                navigate('/')
              } catch (error) {
                console.error('Failed to delete profile:', error)
              } finally {
                setIsDeleting(false)
                setShowDeleteModal(false)
              }
            }}
            disabled={isDeleting || isLoading}
          >
            {isDeleting ? 'Deleting...' : 'Delete Profile'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Bug Report Modal */}
      <BugReportModal 
        isOpen={showBugReport} 
        onClose={() => setShowBugReport(false)} 
      />
    </div>
  )
}
