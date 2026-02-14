// Application constants
export const APP_NAME = 'Rumfor Market Tracker'
export const APP_VERSION = '1.0.0'

// API endpoints
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'
export const API_TIMEOUT = 10000

// Backend base URL (for serving static files like uploads)
// VITE_BACKEND_URL can be set explicitly, otherwise derive from API_BASE_URL
export const getBackendBaseUrl = (): string => {
  const explicitBackendUrl = (import.meta as any).env?.VITE_BACKEND_URL
  if (explicitBackendUrl) return explicitBackendUrl
  return API_BASE_URL.replace(/\/api(\/v\d+)?$/, '')
}

// Convert relative upload URLs to full URLs
export const getFullUploadUrl = (path: string | undefined | null): string | undefined => {
  if (!path) return undefined
  // Handle base64 data URLs directly
  if (path.startsWith('data:')) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/uploads/')) return `${getBackendBaseUrl()}${path}`
  return path
}

// User roles
export const USER_ROLES = {
  VISITOR: 'visitor',
  VENDOR: 'vendor',
  PROMOTER: 'promoter',
  ADMIN: 'admin',
} as const

// Market categories
export const MARKET_CATEGORIES = {
  FARMERS_MARKET: 'farmers-market',
  ARTS_CRAFTS: 'arts-crafts',
  FLEA_MARKET: 'flea-market',
  FOOD_FESTIVAL: 'food-festival',
  HOLIDAY_MARKET: 'holiday-market',
  CRAFT_SHOW: 'craft-show',
  COMMUNITY_EVENT: 'community-event',
  NIGHT_MARKET: 'night-market',
  STREET_FAIR: 'street-fair',
  VINTAGE_ANTIQUE: 'vintage-antique',
} as const

// Market category labels for display
export const MARKET_CATEGORY_LABELS = {
  'farmers-market': 'Farmers Market',
  'arts-crafts': 'Arts & Crafts',
  'flea-market': 'Flea Market',
  'food-festival': 'Food Festival',
  'holiday-market': 'Holiday Market',
  'craft-show': 'Craft Show',
  'community-event': 'Community Event',
  'night-market': 'Night Market',
  'street-fair': 'Street Fair',
  'vintage-antique': 'Vintage & Antique',
} as const

// Market category colors for badges
export const MARKET_CATEGORY_COLORS = {
  'farmers-market': 'bg-green-100 text-green-800 border-green-200',
  'arts-crafts': 'bg-purple-100 text-purple-800 border-purple-200',
  'flea-market': 'bg-orange-100 text-orange-800 border-orange-200',
  'food-festival': 'bg-red-100 text-red-800 border-red-200',
  'holiday-market': 'bg-blue-100 text-blue-800 border-blue-200',
  'craft-show': 'bg-pink-100 text-pink-800 border-pink-200',
  'community-event': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'night-market': 'bg-gray-100 text-gray-800 border-gray-200',
  'street-fair': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'vintage-antique': 'bg-brown-100 text-brown-800 border-brown-200',
} as const

// Market status colors
export const MARKET_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  pending_approval: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  suspended: 'bg-orange-100 text-orange-800 border-orange-200',
  inactive: 'bg-gray-200 text-gray-600 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
} as const

// Application statuses
export const APPLICATION_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under-review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Generic market images for vendor-created markets (cycle through these)
export const GENERIC_MARKET_IMAGES = [
  'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=400&fit=crop', // Farmers market stalls
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop', // Market square
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop', // Craft fair
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop', // Local crafts
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop', // Weekend market
  'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=400&fit=crop', // Community market
]

// Function to get a generic image based on market ID for consistency
export const getGenericMarketImage = (marketId: string): string => {
  const index = marketId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % GENERIC_MARKET_IMAGES.length
  return GENERIC_MARKET_IMAGES[index]
}

// Category-specific default banner images
// Using local placeholder images for consistency
export const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  'farmers-market': new URL('/assets/images/farmermarket.png', import.meta.url).href,
  'arts-crafts': new URL('/assets/images/artandcraft.png', import.meta.url).href,
  'flea-market': new URL('/assets/images/fleamarket.png', import.meta.url).href,
  'food-festival': new URL('/assets/images/foodfestival.png', import.meta.url).href,
  'craft-fair': new URL('/assets/images/craftshow.png', import.meta.url).href,
  'community-event': new URL('/assets/images/communityevent.png', import.meta.url).href,
  'holiday-market': new URL('/assets/images/holidaymarket.png', import.meta.url).href,
  'night-market': new URL('/assets/images/nightmarket.png', import.meta.url).href,
  'street-fair': new URL('/assets/images/streetfair.png', import.meta.url).href,
  'vintage-antique': new URL('/assets/images/vintageandantique.jpeg', import.meta.url).href,
}

// Function to get the default image for a category
export const getCategoryDefaultImage = (category: string): string => {
  // Use the category default image from CATEGORY_DEFAULT_IMAGES
  return CATEGORY_DEFAULT_IMAGES[category]
}

// Allowed market tags
export const ALLOWED_MARKET_TAGS = [
  'handmade',
  'vintage',
  'crafts',
  'fresh-produce',
  'local',
  'family-friendly',
  'wheelchair-accessible',
  'pet-friendly',
  'live-music',
  'food-trucks',
  'baked-goods',
  'artisan',
  'organic',
  'farm-to-table',
  'eco-friendly',
  'seasonal',
  'holiday-themed',
  'indoor',
  'outdoor',
  'covered',
  'art',
  'jewelry',
  'clothing',
  'antiques',
  'furniture',
  'plants',
  'flowers',
  'home-decor',
  'kids-friendly',
  'weekend-market',
  'morning-market',
  'evening-market',
  'night-market',
  'community'
] as const

export type MarketTag = typeof ALLOWED_MARKET_TAGS[number]
