import { useQuery } from '@tanstack/react-query'
import { Market } from '@/types'
import { marketsApi } from '@/features/markets/marketsApi'

interface HourlyWeather {
  hour: number
  temp: number
  icon: string
  condition: string
}

interface DailyWeather {
  date: string
  dayName: string
  monthName: string
  dayNumber: number
  icon: string
  high: number
  low: number
  condition: string
  isMarketDay: boolean
  precipitation: number
  windSpeed: number
  sunrise: string
  sunset: string
  hourly: HourlyWeather[]
}

interface WeatherForecast {
  marketDate: string
  days: DailyWeather[]
  daysUntilForecast: number | null
}

interface UseWeatherReturn {
  weather: WeatherForecast | null
  isLoading: boolean
  error: string | null
  daysUntilForecast: number | null
  refetch: () => void
}

const FORECAST_DAYS_LIMIT = 14

export const useWeather = (market: Market | null): UseWeatherReturn => {
  const getNextMarketDate = (): { date: string; daysUntil: number } | null => {
    if (!market?.schedule || market.schedule.length === 0) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcomingDates = market.schedule
      .filter((item) => {
        if (!item.startDate) return false
        const itemDate = new Date(item.startDate)
        itemDate.setHours(0, 0, 0, 0)
        return itemDate >= today
      })
      .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())

    if (upcomingDates.length === 0) return null
    
    const nextDate = new Date(upcomingDates[0].startDate!)
    const diffTime = nextDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return { date: upcomingDates[0].startDate!, daysUntil: diffDays }
  }

  const nextMarket = getNextMarketDate()
  const nextMarketDate = nextMarket?.date || null
  const daysUntilMarket = nextMarket?.daysUntil ?? null
  const hasLocation = market?.location?.city
  
  const isForecastAvailable = daysUntilMarket !== null && daysUntilMarket <= FORECAST_DAYS_LIMIT

  const enabled = !!market?.id && !!nextMarketDate && isForecastAvailable
  
  console.log('[useWeather]', {
    marketId: market?.id,
    nextMarketDate,
    daysUntilMarket,
    hasLocation,
    isForecastAvailable,
    enabled
  })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['weather', market?.id, nextMarketDate],
    queryFn: async () => {
      if (!market?.id || !nextMarketDate) return null

      console.log('[useWeather] Fetching from API...')
      const response = await marketsApi.getWeatherForecast(market.id, nextMarketDate)
      console.log('[useWeather] API response:', response)
      return response.data?.forecast || null
    },
    enabled,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  })

  const daysUntilForecast = isForecastAvailable 
    ? null 
    : daysUntilMarket !== null 
      ? daysUntilMarket - FORECAST_DAYS_LIMIT 
      : null

  return {
    weather: data || null,
    isLoading,
    error: error?.message || null,
    daysUntilForecast,
    refetch: () => refetch(),
  }
}

export type { WeatherForecast, DailyWeather, HourlyWeather, UseWeatherReturn }
