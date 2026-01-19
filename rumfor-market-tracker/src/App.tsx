import { AppRoutes } from './router/routes'
import { LocationModal } from './components/LocationModal'

function App() {
  console.log('App is rendering')
  return (
    <div className="App min-h-screen bg-background">
      <AppRoutes />
      <LocationModal />
    </div>
  )
}

export default App