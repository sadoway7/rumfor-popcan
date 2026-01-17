// Application constants
export const APP_NAME = 'Rumfor Market Tracker'
export const APP_VERSION = '1.0.0'

// API endpoints
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api/v1'
export const API_TIMEOUT = 10000

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
