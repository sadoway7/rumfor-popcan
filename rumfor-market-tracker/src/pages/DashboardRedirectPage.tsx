import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { Spinner } from '@/components/ui/Spinner'

export function DashboardRedirectPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      // Redirect based on role hierarchy:
      // Admin = admin dashboard (has access to all)
      // Promoter = promoter dashboard (has access to promoter + vendor)
      // Vendor = vendor dashboard (vendor only)
      // Visitor = home page
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard')
          break
        case 'promoter':
          navigate('/promoter/dashboard')
          break
        case 'vendor':
          navigate('/vendor/dashboard')
          break
        case 'visitor':
        default:
          navigate('/')
          break
      }
    }
  }, [user, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Spinner className="h-8 w-8 mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}