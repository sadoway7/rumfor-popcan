import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { marketsApi } from '@/features/markets/marketsApi'
import { Market } from '@/types'
import { PulseDots } from '@/components/ui/PulseDots'
import { AlertTriangle } from 'lucide-react'

interface MarketNameSuggestionsProps {
  value: string
  isFocused?: boolean
  onSelect?: (market: Market) => void
  className?: string
}

export function MarketNameSuggestions({ value, isFocused = false, onSelect, className }: MarketNameSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Market[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value || value.length < 2) {
        setSuggestions([])
        setIsOpen(false)
        setHasSearched(false)
        return
      }

      setIsLoading(true)
      setHasSearched(false)
      try {
        const response = await marketsApi.searchMarketSuggestions(value)
        console.log('Market suggestions response:', response)
        
        let markets: Market[] = []
        if (Array.isArray(response.data)) {
          markets = response.data
        } else if (response.data && typeof response.data === 'object' && 'markets' in response.data && Array.isArray((response.data as any).markets)) {
          markets = (response.data as any).markets
        }
        
        setSuggestions(markets)
        setIsOpen(true)
      } catch (error) {
        console.error('Error fetching market suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
        setHasSearched(true)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [value])

  const getDatePills = (market: Market): string[] => {
    if (!market.schedule) return []
    
    const schedule = market.schedule
    
    if (schedule && typeof schedule === 'object' && !Array.isArray(schedule)) {
      const schedObj = schedule as any
      
      if (schedObj.specialDates && Array.isArray(schedObj.specialDates) && schedObj.specialDates.length > 0) {
        const datesData = schedObj.specialDates.map((s: any) => {
          const dateParts = s.date?.split('T')[0]?.split('-')
          if (dateParts) {
            const year = parseInt(dateParts[0])
            const month = parseInt(dateParts[1]) - 1
            const day = parseInt(dateParts[2])
            const dateObj = new Date(year, month, day)
            return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          }
          return null
        }).filter(Boolean)
          .sort((a: string | null, b: string | null): number => {
            if (a === null) return 1
            if (b === null) return -1
            return new Date(a).getTime() - new Date(b).getTime()
          })
        
        return datesData.filter((d: string | null): d is string => d !== null)
      }
      
      if (schedObj.daysOfWeek && Array.isArray(schedObj.daysOfWeek) && schedObj.daysOfWeek.length > 0) {
        return schedObj.daysOfWeek.map((day: string) => day.charAt(0).toUpperCase() + day.slice(1))
      }
    }
    
    if (Array.isArray(schedule) && schedule.length > 0) {
      const datesData = schedule
        .filter((s: any) => s && s.startDate)
        .map((s: any) => {
          const dateParts = s.startDate?.split('T')[0]?.split('-')
          if (dateParts) {
            const year = parseInt(dateParts[0])
            const month = parseInt(dateParts[1]) - 1
            const day = parseInt(dateParts[2])
            const dateObj = new Date(year, month, day)
            return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          }
          return null
        })
        .filter((d): d is string => d !== null)
        .sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime())

      return datesData
    }
    
    return []
  }

  const handleSelect = (market: Market) => {
    onSelect?.(market)
    setIsOpen(false)
    navigate(`/markets/${market.id}`)
  }

  if (!isFocused || !value || value.length < 2) {
    return null
  }

  return (
    <div ref={wrapperRef} className={`absolute bottom-full mb-4 left-0 right-0 z-50 ${className}`}>
      <div className="rounded-xl border-2 border-orange-300 shadow-[0_0_20px_rgba(251,146,60,0.2),0_4px_16px_rgba(0,0,0,0.08)] bg-white">
        <div className="px-4 py-3 border-b-2 border-orange-200 bg-orange-100 flex items-center justify-between">
          <p className="text-sm font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Duplication Check
          </p>
          {suggestions.length > 0 && (
            <span className="text-sm font-medium text-orange-700 bg-white px-2.5 py-1 rounded-full shadow-sm">
              {suggestions.length} similar
            </span>
          )}
        </div>
        
        {isLoading ? (
          <div className="py-4 flex items-center justify-center">
            <PulseDots size="md" color="orange" />
          </div>
        ) : suggestions.length > 0 ? (
          <ul className="max-h-60 overflow-y-auto scrollbar scrollbar-thumb-orange-300 scrollbar-track-orange-50">
            {suggestions.map((market) => {
              const datePills = getDatePills(market)
              return (
                <li key={market.id}>
                  <button
                    type="button"
                    onMouseDown={() => handleSelect(market)}
                    className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors border-t border-orange-200 first:border-t-0"
                  >
                    <div className="font-bold text-base text-foreground truncate">
                      {market.name}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white text-orange-700 border border-orange-200">
                        {market.location.city}{market.location.state && `, ${market.location.state}`}
                      </span>
                      {datePills.map((date, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white text-gray-600 border border-gray-200">
                          {date}
                        </span>
                      ))}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : !isLoading && hasSearched && value.length >= 2 ? (
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 w-full">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium">Appears to be unique</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
