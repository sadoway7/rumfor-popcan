import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })

        // Apply theme to document
        const root = document.documentElement
        if (newTheme === 'dark') {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    }),
    {
      name: 'rumfor-theme',
    }
  )
)

// Initialize theme on app load
export const initializeTheme = () => {
  const { theme } = useThemeStore.getState()
  const root = document.documentElement

  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Sidebar store for homepage
interface SidebarStore {
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  isSidebarOpen: true,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => {
    const current = get().isSidebarOpen
    set({ isSidebarOpen: !current })
  }
}))

// Location store for user location settings
interface LocationData {
  city: string
  state: string
  zipCode?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

interface LocationStore {
  location: LocationData | null
  isLocationModalOpen: boolean
  setLocation: (location: LocationData | null) => void
  setLocationModalOpen: (open: boolean) => void
  detectLocation: () => Promise<void>
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      location: null,
      isLocationModalOpen: false,
      setLocation: (location) => set({ location }),
      setLocationModalOpen: (open) => set({ isLocationModalOpen: open }),
      detectLocation: async () => {
        if (!navigator.geolocation) {
          console.warn('Geolocation is not supported by this browser.')
          return
        }

        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes
            })
          })

          const { latitude, longitude } = position.coords

          // Use reverse geocoding to get city/state from coordinates
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            )
            const data = await response.json()

            const locationData: LocationData = {
              city: data.city || data.locality || '',
              state: data.principalSubdivision || data.principalSubdivisionCode || '',
              zipCode: data.postcode || '',
              coordinates: { lat: latitude, lng: longitude }
            }

            set({ location: locationData })
          } catch (geocodeError) {
            console.warn('Reverse geocoding failed, saving coordinates only')
            const locationData: LocationData = {
              city: '',
              state: '',
              coordinates: { lat: latitude, lng: longitude }
            }
            set({ location: locationData })
          }
        } catch (error) {
          console.error('Error getting location:', error)
        }
      }
    }),
    {
      name: 'rumfor-location',
    }
  )
)
