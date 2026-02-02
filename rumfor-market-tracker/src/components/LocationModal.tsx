import { useState } from 'react'
import { useLocationStore } from '@/features/theme/themeStore'
import { Button } from '@/components/ui'
import { MapPin, X, Loader2 } from 'lucide-react'

export function LocationModal() {
  const { location, isLocationModalOpen, setLocationModalOpen, setLocation, detectLocation } = useLocationStore()
  const [isDetecting, setIsDetecting] = useState(false)

  const handleDetectLocation = async () => {
    setIsDetecting(true)
    try {
      await detectLocation()
      setLocationModalOpen(false)
    } catch (error) {
      console.error('Failed to detect location:', error)
    } finally {
      setIsDetecting(false)
    }
  }

  const handleClearLocation = () => {
    setLocation(null)
    setLocationModalOpen(false)
  }

  if (!isLocationModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-surface rounded-xl shadow-xl border border-border p-6 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Location</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocationModalOpen(false)}
            className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Current Location */}
        {location && (
          <div className="mb-4 p-3 bg-accent/5 rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-1">Current Location</div>
            <div className="text-sm font-medium text-foreground">
              {location.city && location.state
                ? `${location.city}, ${location.state}`
                : location.city || 'Location detected'
              }
            </div>
          </div>
        )}

        {/* Location Options */}
        <div className="space-y-3">
          <Button
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full justify-center bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Detecting GPS...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Use GPS Location
              </>
            )}
          </Button>
        </div>

        {location && (
          <Button
            onClick={handleClearLocation}
            variant="outline"
            className="w-full mt-3"
          >
            Clear Location
          </Button>
        )}
      </div>
    </div>
  )
}