import React, { useState, useRef } from 'react'
import { useLocationStore } from '@/features/theme/themeStore'
import { Button } from '@/components/ui'
import { MapPin, Navigation, X, Loader2, Map } from 'lucide-react'

export function LocationModal() {
  const { location, isLocationModalOpen, setLocationModalOpen, setLocation, detectLocation } = useLocationStore()
  const [isDetecting, setIsDetecting] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [pinPosition, setPinPosition] = useState<[number, number] | null>(null)

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

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Simple coordinate calculation based on click position
    // This is a basic approximation - in a real implementation you'd use a proper map library
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Approximate US coordinates based on click position
    // This is very basic - longitude roughly -125 to -67, latitude 25 to 49
    const lng = -125 + (x / rect.width) * (67 - 125) * -1
    const lat = 49 - (y / rect.height) * (49 - 25)

    setLocation({
      city: `Location at ${lat.toFixed(2)}, ${lng.toFixed(2)}`,
      state: '',
      coordinates: { lat, lng }
    })
    setLocationModalOpen(false)
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
            className="w-full justify-start bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Detecting GPS...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Use GPS Location
              </>
            )}
          </Button>

          <Button
            onClick={() => setShowMap(!showMap)}
            className="w-full justify-start bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Map className="h-4 w-4 mr-2" />
            Drop Pin on Map
          </Button>

          {/* Interactive Map */}
          {showMap && (
            <div className="mt-3">
              <div className="w-full h-80 rounded-lg overflow-hidden border border-border mb-3 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3164.289637926!2d-98.5795!3d39.8283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzlCsDQ5JzQyLjAiTiA5OMKwMzQnNDYuMiJX!5e0!3m2!1sen!2sus!4v1703123456789!5m2!1sen!2sus"
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                />
                {/* Pin overlay */}
                {pinPosition && (
                  <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-10 pointer-events-none"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <MapPin className="h-8 w-8 text-red-500 drop-shadow-lg" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="39.8283"
                      value={pinPosition ? pinPosition[0].toFixed(4) : ''}
                      onChange={(e) => {
                        const lat = parseFloat(e.target.value) || 39.8283
                        setPinPosition(prev => [lat, prev ? prev[1] : -98.5795])
                      }}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="-98.5795"
                      value={pinPosition ? pinPosition[1].toFixed(4) : ''}
                      onChange={(e) => {
                        const lng = parseFloat(e.target.value) || -98.5795
                        setPinPosition(prev => [prev ? prev[0] : 39.8283, lng])
                      }}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setPinPosition([39.8283, -98.5795])}
                    variant="outline"
                    className="flex-1"
                  >
                    Center US
                  </Button>
                  <Button
                    onClick={() => setPinPosition(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Clear Pin
                  </Button>
                </div>

                {pinPosition && (
                  <Button
                    onClick={() => {
                      setLocation({
                        city: `Location ${pinPosition[0].toFixed(2)}, ${pinPosition[1].toFixed(2)}`,
                        state: '',
                        coordinates: { lat: pinPosition[0], lng: pinPosition[1] }
                      })
                      setLocationModalOpen(false)
                    }}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Set Pin Location
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center mt-3">
                Use the map to find your area, then enter coordinates or use preset buttons
              </p>
            </div>
          )}
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