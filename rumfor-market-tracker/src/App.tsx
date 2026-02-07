import { AppRoutes } from './router/routes'
import { LocationModal } from './components/LocationModal'
import { BottomNav } from './components/BottomNav'
import { useAuthStore } from '@/features/auth/authStore'

function App() {
  console.log('App is rendering')
  const { user, isAuthenticated } = useAuthStore()
  const userRole = isAuthenticated && user ? user.role : 'visitor'

  return (
    <div className="App min-h-screen bg-background">
      <AppRoutes />
      <LocationModal />
      {/* Bottom Navigation - Moved to App level to prevent re-rendering */}
      <BottomNav role={userRole} />
    </div>
  )
}

export default App