import { useAuthStore } from '@/features/auth/authStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Avatar } from '@/components/ui'

export function ProfilePage() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <div className="w-full h-full bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-accent">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
          </Avatar>
          <CardTitle>{user.firstName} {user.lastName}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">First Name</label>
              <p className="text-foreground">{user.firstName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Name</label>
              <p className="text-foreground">{user.lastName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-foreground">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <p className="text-foreground capitalize">{user.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account Status</label>
              <p className="text-foreground">{user.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Verified</label>
              <p className="text-foreground">{user.isEmailVerified ? 'Verified' : 'Not Verified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}