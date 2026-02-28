import { useQuery } from '@tanstack/react-query'
import { Market } from '@/types'

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

const WEATHER_CODES: Record<number, { condition: string; icon: string }> = {
  0: { condition: 'Clear', icon: '☀️' },
  1: { condition: 'Mainly clear', icon: '🌤️' },
  2: { condition: 'Partly cloudy', icon: '⛅' },
  3: { condition: 'Overcast', icon: '☁️' },
  45: { condition: 'Foggy', icon: '🌫️' },
  48: { condition: 'Foggy', icon: '🌫️' },
  51: { condition: 'Drizzle', icon: '🌧️' },
  53: { condition: 'Drizzle', icon: '🌧️' },
  55: { condition: 'Drizzle', icon: '🌧️' },
  61: { condition: 'Rain', icon: '🌧️' },
  63: { condition: 'Rain', icon: '🌧️' },
  65: { condition: 'Heavy rain', icon: '🌧️' },
  71: { condition: 'Snow', icon: '🌨️' },
  73: { condition: 'Snow', icon: '🌨️' },
  75: { condition: 'Heavy snow', icon: '🌨️' },
  77: { condition: 'Snow', icon: '🌨️' },
  80: { condition: 'Showers', icon: '🌦️' },
  81: { condition: 'Showers', icon: '🌦️' },
  82: { condition: 'Heavy showers', icon: '⛈️' },
  85: { condition: 'Snow showers', icon: '🌨️' },
  86: { condition: 'Snow showers', icon: '🌨️' },
  95: { condition: 'Thunderstorm', icon: '⛈️' },
  96: { condition: 'Thunderstorm', icon: '⛈️' },
  99: { condition: 'Thunderstorm', icon: '⛈️' },
}

const FORECAST_DAYS_LIMIT = 14

const geocodeLocation = async (city: string, region?: string): Promise<{ lat: number; lon: number } | null> => {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`
    )
    if (!response.ok) return null
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      let match = data.results[0]
      if (region) {
        const regionMatch = data.results.find((r: any) => 
          r.admin1?.toLowerCase().includes(region.toLowerCase()) ||
          region.toLowerCase().includes(r.admin1?.toLowerCase())
        )
        if (regionMatch) match = regionMatch
      }
      return { lat: match.latitude, lon: match.longitude }
    }
    return null
  } catch {
    return null
  }
}

const fetchWeatherForecast = async (
  latitude: number,
  longitude: number,
  marketDate: string
): Promise<WeatherForecast | null> => {
  try {
    const marketDateObj = new Date(marketDate)
    const startDate = new Date(marketDateObj)
    startDate.setDate(startDate.getDate() - 2)
    const endDate = new Date(marketDateObj)
    endDate.setDate(endDate.getDate() + 2)

    const formatDate = (d: Date) => d.toISOString().split('T')[0]
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&hourly=temperature_2m,weathercode&timezone=auto&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`
    
    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()
    
    if (!data.daily?.time || data.daily.time.length === 0) return null
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    const days: DailyWeather[] = data.daily.time.map((date: string, index: number) => {
      const dateObj = new Date(date + 'T12:00:00')
      const weatherCode = data.daily.weathercode[index]
      const weatherInfo = WEATHER_CODES[weatherCode] || { condition: 'Unknown', icon: '🌡️' }
      
      const hourly: HourlyWeather[] = []
      if (data.hourly?.time) {
        for (let h = 0; h < 24; h++) {
          const hourIndex = data.hourly.time.findIndex((t: string) => 
            t.startsWith(date) && new Date(t).getHours() === h
          )
          if (hourIndex !== -1) {
            const hourCode = data.hourly.weathercode[hourIndex]
            const hourInfo = WEATHER_CODES[hourCode] || { condition: 'Unknown', icon: '🌡️' }
            hourly.push({
              hour: h,
              temp: Math.round(data.hourly.temperature_2m[hourIndex]),
              icon: hourInfo.icon,
              condition: hourInfo.condition,
            })
          }
        }
      }
      
      const sunriseRaw = data.daily.sunrise?.[index]
      const sunsetRaw = data.daily.sunset?.[index]
      const formatTime = (iso: string) => {
        if (!iso) return ''
        const d = new Date(iso)
        const h = d.getHours()
        const m = d.getMinutes()
        const ampm = h >= 12 ? 'pm' : 'am'
        const hour = h % 12 || 12
        return `${hour}:${m.toString().padStart(2, '0')}${ampm}`
      }

      return {
        date,
        dayName: dayNames[dateObj.getDay()],
        monthName: monthNames[dateObj.getMonth()],
        dayNumber: dateObj.getDate(),
        icon: weatherInfo.icon,
        high: Math.round(data.daily.temperature_2m_max[index]),
        low: Math.round(data.daily.temperature_2m_min[index]),
        condition: weatherInfo.condition,
        isMarketDay: date === marketDate,
        precipitation: data.daily.precipitation_probability_max?.[index] ?? 0,
        windSpeed: Math.round(data.daily.wind_speed_10m_max?.[index] ?? 0),
        sunrise: formatTime(sunriseRaw),
        sunset: formatTime(sunsetRaw),
        hourly,
      }
    })

    return { marketDate, days, daysUntilForecast: null }
  } catch {
    return null
  }
}

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

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['weather', market?.id, nextMarketDate],
    queryFn: async () => {
      if (!hasLocation || !nextMarketDate) return null

      let lat = market!.location!.latitude
      let lon = market!.location!.longitude

      if (!lat || !lon) {
        const coords = await geocodeLocation(market!.location!.city, market!.location!.state)
        if (!coords) return null
        lat = coords.lat
        lon = coords.lon
      }

      return fetchWeatherForecast(lat, lon, nextMarketDate)
    },
    enabled: !!hasLocation && !!nextMarketDate && isForecastAvailable,
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
