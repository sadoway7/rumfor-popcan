// User and Authentication Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  createdAt: string
  updatedAt: string
  isEmailVerified: boolean
  isActive: boolean
}

export type UserRole = 'visitor' | 'vendor' | 'promoter' | 'admin'

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
}

// Market Types
export interface Market {
  id: string
  name: string
  description: string
  category: MarketCategory
  promoterId: string
  promoter: User
  location: Location
  schedule: MarketSchedule[]
  status: MarketStatus
  images: string[]
  tags: string[]
  accessibility: AccessibilityFeatures
  contact: ContactInfo
  applicationFields: CustomField[]
  createdAt: string
  updatedAt: string
}

export type MarketCategory = 
  | 'farmers-market'
  | 'arts-crafts'
  | 'flea-market'
  | 'food-festival'
  | 'holiday-market'
  | 'craft-show'
  | 'community-event'

export type MarketStatus = 'draft' | 'active' | 'cancelled' | 'completed'

export interface Location {
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  latitude?: number
  longitude?: number
}

export interface MarketSchedule {
  id: string
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  startDate: string
  endDate: string
  isRecurring: boolean
}

export interface AccessibilityFeatures {
  wheelchairAccessible: boolean
  parkingAvailable: boolean
  restroomsAvailable: boolean
  familyFriendly: boolean
  petFriendly: boolean
}

export interface ContactInfo {
  phone?: string
  email?: string
  website?: string
  socialMedia?: {
    facebook?: string
    instagram?: string
    twitter?: string
  }
}

export interface CustomField {
  id: string
  name: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file'
  required: boolean
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
  }
}

// Application Types
export interface Application {
  id: string
  marketId: string
  vendorId: string
  vendor: User
  market: Market
  status: ApplicationStatus
  submittedData: Record<string, any>
  customFields: Record<string, any>
  documents: Document[]
  notes?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export type ApplicationStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected'

export interface Document {
  id: string
  name: string
  type: string
  url: string
  size: number
  uploadedAt: string
}

// Community Types
export interface Comment {
  id: string
  marketId: string
  userId: string
  user: User
  content: string
  parentId?: string
  replies: Comment[]
  reactions: CommentReaction[]
  createdAt: string
  updatedAt: string
}

export interface CommentReaction {
  id: string
  userId: string
  type: 'like' | 'dislike' | 'love' | 'laugh'
  createdAt: string
}

export interface Photo {
  id: string
  marketId: string
  userId: string
  user: User
  url: string
  thumbnailUrl: string
  caption?: string
  tags: string[]
  isApproved: boolean
  takenAt?: string
  createdAt: string
}

export interface Hashtag {
  id: string
  name: string
  marketId: string
  userId: string
  user: User
  votes: HashtagVote[]
  createdAt: string
}

export interface HashtagVote {
  id: string
  userId: string
  value: number // 1 for upvote, -1 for downvote
  createdAt: string
}

// Vendor Tracking Types
export interface Todo {
  id: string
  vendorId: string
  marketId: string
  title: string
  description?: string
  completed: boolean
  priority: TodoPriority
  dueDate?: string
  category: string
  createdAt: string
  updatedAt: string
}

export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Expense {
  id: string
  vendorId: string
  marketId: string
  title: string
  description?: string
  amount: number
  category: ExpenseCategory
  date: string
  receipt?: string
  createdAt: string
  updatedAt: string
}

export type ExpenseCategory = 
  | 'booth-fee'
  | 'transportation'
  | 'accommodation'
  | 'supplies'
  | 'equipment'
  | 'marketing'
  | 'food'
  | 'fuel'
  | 'insurance'
  | 'other'

// Notification Types
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  createdAt: string
}

export type NotificationType = 
  | 'application-approved'
  | 'application-rejected'
  | 'market-updated'
  | 'new-comment'
  | 'new-photo'
  | 'reminder'
  | 'announcement'

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
}

export interface FormData {
  [key: string]: any
}

// Error Types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

// Filter and Search Types
export interface MarketFilters {
  category?: MarketCategory[]
  location?: {
    city?: string
    state?: string
    radius?: number // in miles
    latitude?: number
    longitude?: number
  }
  dateRange?: {
    start: string
    end: string
  }
  status?: MarketStatus[]
  search?: string
  tags?: string[]
  accessibility?: {
    wheelchairAccessible?: boolean
    parkingAvailable?: boolean
    restroomsAvailable?: boolean
  }
}

export interface SortOption {
  field: string
  direction: 'asc' | 'desc'
  label: string
}