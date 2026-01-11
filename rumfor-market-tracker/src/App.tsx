import { AppRoutes } from './router/routes'
import { LocationModal } from './components/LocationModal'

function App() {
  return (
    <div className="App min-h-screen bg-background">
      <AppRoutes />
      <LocationModal />
    </div>
  )
}

export default App