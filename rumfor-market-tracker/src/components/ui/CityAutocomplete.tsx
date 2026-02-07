import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface CitySuggestion {
  display_name?: string
  name?: string
  type?: string
  osm_type?: string
  osm_id?: number
  osm_key?: string
  osm_value?: string
  countrycode?: string
  country?: string
  state?: string
  province?: string
  county?: string
  city?: string
  town?: string
  village?: string
  properties?: {
    name?: string
    display_name?: string
    state?: string
    province?: string
    country?: string
  }
}

interface CityAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onStateChange?: (state: string) => void
  onError?: (hasError: boolean) => void
  placeholder?: string
  className?: string
  error?: boolean
}

export function CityAutocomplete({
  value,
  onChange,
  onStateChange,
  onError,
  placeholder = 'City *',
  className,
  error
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSelectionError, setHasSelectionError] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=15`
      )
      const data = await response.json()
      
      const allowedCountries = ['us', 'ca']
      const cityTypes = ['city', 'town', 'village', 'municipality']
      
      const filtered = (data.features || []).filter((feature: any) => {
        const countryCode = feature.properties?.countrycode?.toLowerCase()
        const type = feature.properties?.type || feature.properties?.osm_value
        
        const isAllowedCountry = allowedCountries.includes(countryCode)
        const isCityType = cityTypes.includes(type) || 
                           (feature.properties?.osm_key === 'place' && cityTypes.includes(feature.properties?.osm_value))
        
        return isAllowedCountry && isCityType
      })
      
      setSuggestions(filtered)
    } catch (error) {
      console.error('Error fetching city suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSelect = (suggestion: CitySuggestion) => {
    const props = suggestion.properties || suggestion
    const cityName = props.name || props.display_name?.split(',')[0] || ''
    const state = props.state || props.province || ''
    
    setIsSelecting(true)
    setQuery(cityName)
    onChange(cityName)
    setHasSelectionError(false)
    onError?.(false)
    if (state) {
      onStateChange?.(state)
    }
    setIsOpen(false)
    
    setTimeout(() => setIsSelecting(false), 200)
  }

  const handleBlur = () => {
    setIsOpen(false)
    
    if (isSelecting) return
    
    if (!query || query.length < 2) {
      setHasSelectionError(false)
      onError?.(false)
      return
    }
    
    if (suggestions.length > 0) {
      const queryLower = query.toLowerCase().trim()
      const matchingSuggestion = suggestions.find(suggestion => {
        const suggestionName = suggestion.properties?.name || ''
        const displayName = suggestion.properties?.display_name || ''
        const suggestionLower = suggestionName.toLowerCase().trim()
        // Check if query is contained in suggestion name or vice versa
        return queryLower === suggestionLower || 
               suggestionLower.includes(queryLower) ||
               displayName.toLowerCase().includes(queryLower)
      })
      
      if (!matchingSuggestion) {
        setHasSelectionError(true)
        onError?.(true)
      } else {
        setHasSelectionError(false)
        onError?.(false)
      }
    } else if (query.length >= 2) {
      // No suggestions found but user typed something - still allow it
      setHasSelectionError(false)
      onError?.(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    onChange('')
    setSuggestions([])
    setHasSelectionError(false)
    onError?.(false)
  }

  const getDisplayName = (suggestion: CitySuggestion) => {
    const props = suggestion.properties || suggestion
    const name = props.name || props.display_name?.split(',')[0] || ''
    const state = props.state || props.province || ''
    const country = props.country || ''
    
    if (state && country) {
      return `${name}, ${state}, ${country}`
    } else if (state) {
      return `${name}, ${state}`
    } else if (country) {
      return `${name}, ${country}`
    }
    
    return props.display_name || name
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          name={`city-autocomplete-${Date.now()}`}
          data-1p-ignore
          data-lpignore="true"
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setHasSelectionError(false)
            onError?.(false)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="new-password"
          className={cn(
            'w-full h-10 px-3 rounded-lg border bg-white shadow-sm',
            'text-sm font-semibold placeholder:text-muted-foreground/70 pr-10',
            (error || hasSelectionError) && 'border-red-500',
            className
          )}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-9 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white rounded-lg border shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li key={index}>
              <button
                type="button"
                onMouseDown={() => handleSelect(suggestion)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
              >
                {getDisplayName(suggestion)}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.length >= 2 && !isLoading && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border shadow-lg p-3 text-sm text-muted-foreground text-center">
          No cities found
        </div>
      )}

      {hasSelectionError && (
        <p className="text-red-500 text-xs mt-1">Please select a city from the list</p>
      )}
    </div>
  )
}
