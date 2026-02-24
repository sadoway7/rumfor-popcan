import { AppRoutes } from './router/routes'
import { LocationModal } from './components/LocationModal'
import { CommentsModal } from './components/CommentsModal'
import { BottomNav } from './components/BottomNav'
import { useAuthStore } from '@/features/auth/authStore'
import { useLocation } from 'react-router-dom'

function App() {
  const { user, isAuthenticated, isHydrated } = useAuthStore()
  const userRole = isAuthenticated && user ? user.role : 'visitor'
  const location = useLocation()
  
  const hideBottomNav = location.pathname.includes('/vendor/add-market')

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="App min-h-screen bg-background">
      <AppRoutes />
      <LocationModal />
      <CommentsModal />
      {!hideBottomNav && <BottomNav role={userRole} />}
    </div>
  )
}

export default App