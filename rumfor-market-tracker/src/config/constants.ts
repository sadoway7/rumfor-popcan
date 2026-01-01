// Application constants
export const APP_NAME = 'Rumfor Market Tracker'
export const APP_VERSION = '1.0.0'

// API endpoints
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api'
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
} as const

// Application statuses
export const APPLICATION_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under-review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']