// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
  isActive: boolean;
}

export type UserRole = 'visitor' | 'vendor' | 'promoter' | 'admin';

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Password reset
  isPasswordResetLoading: boolean;
  passwordResetSuccess: boolean;
  passwordResetError: string | null;
  // Email verification
  isEmailVerificationLoading: boolean;
  emailVerificationSuccess: boolean;
  emailVerificationError: string | null;
  isEmailVerified: boolean;
  // Token refresh
  isTokenRefreshing: boolean;
  tokenRefreshError: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword?: string; // Optional - only used for client-side validation
}

export interface EmailVerificationRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// Market Types
export interface Market {
  id: string;
  name: string;
  description: string;
  category: MarketCategory;
  promoterId?: string; // Optional - only for promoter-managed markets
  promoter?: User; // Only exists for promoter-managed markets
  location: Location;
  schedule: MarketScheduleItem[];
  status: MarketStatus;
  marketType: MarketType; // NEW: user-created or promoter-managed

  // Application system settings
  applicationsEnabled: boolean; // Whether the application system is enabled for this market

  applicationStatus?: ApplicationStatus; // Only for promoter-managed markets
  applicationSettings?: {
    acceptVendors: boolean;
    maxVendors?: number;
    applicationFee?: number;
    boothFee?: number;
    requirements?: {
      businessLicense?: boolean;
      insurance?: boolean;
      healthPermit?: boolean;
      liabilityInsurance?: boolean;
    };
    customRequirements?: string[];
  };

  // Market statistics
  stats: {
    viewCount: number;
    favoriteCount: number;
    applicationCount: number;
    commentCount: number;
    rating: number;
    reviewCount: number;
  };

  images: string[];
  tags: string[];
  accessibility: AccessibilityFeatures;
  contact: ContactInfo;
  applicationFields: CustomField[];
  createdAt: string;
  updatedAt: string;

  // 24-hour edit window fields (for vendor-created markets)
  editableUntil?: string; // ISO date string - when the edit window expires
  isLocked?: boolean; // Whether the market is locked from editing
  createdBy?: string; // User ID of the creator
  canEdit?: boolean; // Computed field from backend - whether the market can still be edited

  // Pricing information (optional)
  pricing?: {
    boothFee?: number;
    isFree: boolean;
  };

  // Legacy date format (for old markets created before schedule migration)
  dates?: {
    type: 'one-time';
    events: Array<{
      startDate: string;
      endDate: string;
      time: {
        start: string;
        end: string;
      };
    }>;
  };
}

export type MarketCategory =
  | 'farmers-market'
  | 'arts-crafts'
  | 'flea-market'
  | 'food-festival'
  | 'holiday-market'
  | 'craft-show'
  | 'community-event'
  | 'night-market'
  | 'street-fair'
  | 'vintage-antique';

export type MarketSubcategory =
  | 'produce'
  | 'baked_goods'
  | 'meat'
  | 'dairy'
  | 'crafts'
  | 'art'
  | 'jewelry'
  | 'clothing'
  | 'books'
  | 'antiques'
  | 'food_trucks'
  | 'plants'
  | 'mixed';

// Market status from backend
export type MarketStatus =
  | 'draft'
  | 'pending_approval'
  | 'active'
  | 'suspended'
  | 'inactive'
  | 'cancelled'
  | 'completed';

export type MarketType = 'vendor-created' | 'promoter-managed';

// User Market Tracking relationship
export interface UserMarketTracking {
  id: string;
  userId: string;
  marketId: string;
  status:
    | 'interested'
    | 'applied'
    | 'approved'
    | 'attending'
    | 'declined'
    | 'cancelled'
    | 'completed'
    | 'archived';
  notes?: string;
  attendingDates?: string[]; // Array of market schedule IDs the vendor is attending
  todoCount: number;
  todoProgress: number;
  totalExpenses: number;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface MarketScheduleItem {
  id?: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  eventDate?: string; // Optional specific event date for single-date markets
}

export interface BackendScheduleFormat {
  recurring: boolean;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  specialDates?: Array<{
    date: string | Date;
    startTime?: string;
    endTime?: string;
    notes?: string;
  }>;
  seasonStart?: string | Date;
  seasonEnd?: string | Date;
}

// Union type for schedule - can be array (frontend) or object (backend)
export type MarketSchedule = MarketScheduleItem[] | BackendScheduleFormat;

export interface AccessibilityFeatures {
  wheelchairAccessible: boolean;
  parkingAvailable: boolean;
  restroomsAvailable: boolean;
  familyFriendly: boolean;
  petFriendly: boolean;
  covered: boolean;
  indoor: boolean;
  outdoorSeating: boolean;
  wifi: boolean;
  atm: boolean;
  foodCourt: boolean;
  liveMusic: boolean;
  handicapParking: boolean;
  alcoholAvailable: boolean;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

// Application Types
export interface Application {
  id: string;
  marketId: string;
  vendorId: string;
  vendor: User;
  market: Market;
  status: ApplicationStatus;
  submittedData: Record<string, any>;
  customFields: Record<string, any>;
  documents: Document[];
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under-review'
  | 'approved'
  | 'rejected'
  | 'withdrawn'
  | 'open'
  | 'accepting-applications'
  | 'closed';

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: string;
}

// Community Types
export interface Comment {
  id: string;
  marketId: string;
  userId: string;
  user: User;
  content: string;
  parentId?: string;
  replies: Comment[];
  reactions: CommentReaction[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentReaction {
  id: string;
  userId: string;
  type: 'like' | 'dislike' | 'love' | 'laugh';
  createdAt: string;
}

export interface Photo {
  id: string;
  marketId: string;
  userId: string;
  user: User;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  tags: string[];
  isApproved: boolean;
  takenAt?: string;
  createdAt: string;
}

export interface Hashtag {
  id: string;
  name: string;
  marketId: string;
  userId: string;
  user: User;
  votes: HashtagVote[];
  createdAt: string;
}

export interface HashtagVote {
  id: string;
  userId: string;
  value: number; // 1 for upvote, -1 for downvote
  createdAt: string;
}

// Vendor Tracking Types
export interface Todo {
  id: string;
  vendorId?: string; // Set by backend from auth
  marketId?: string; // Set by backend from request
  title: string;
  description?: string;
  completed?: boolean; // Set by backend (defaults to false)
  priority: TodoPriority;
  dueDate?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Expense {
  id: string;
  vendorId: string;
  marketId: string;
  title: string;
  description?: string;
  amount: number; // Expected/budgeted amount
  actualAmount?: number; // Actual spent amount (optional, defaults to amount)
  category: ExpenseCategory;
  date: string;
  receipt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'booth-fee'
  | 'transportation'
  | 'accommodation'
  | 'supplies'
  | 'equipment'
  | 'marketing'
  | 'food-meals'
  | 'gasoline'
  | 'insurance'
  | 'permits-licenses'
  | 'parking'
  | 'storage'
  | 'shipping'
  | 'utilities'
  | 'miscellaneous'
  | 'revenue';

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'application-approved'
  | 'application-rejected'
  | 'market-updated'
  | 'new-comment'
  | 'new-photo'
  | 'reminder'
  | 'announcement';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface FormData {
  [key: string]: any;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Filter and Search Types
export interface MarketFilters {
  category?: MarketCategory[];
  location?: {
    city?: string;
    state?: string;
    radius?: number; // in miles
    latitude?: number;
    longitude?: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
  status?: MarketStatus[];
  search?: string;
  tags?: string[];
  sortBy?:
    | 'date-oldest'
    | 'date-newest'
    | 'recently-added'
    | 'name-asc'
    | 'name-desc'
    | 'date'
    | 'name'
    | 'distance'
    | 'createdAt'
    | 'popularity';
  sortOrder?: 'asc' | 'desc';
  accessibility?: {
    wheelchairAccessible?: boolean;
    parkingAvailable?: boolean;
    restroomsAvailable?: boolean;
  };
  showPastMarkets?: boolean;
}

export interface ApplicationFilters {
  status?: ApplicationStatus[];
  marketId?: string;
  vendorId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  totalMarkets: number;
  totalApplications: number;
  totalRevenue: number;
  activeUsers: number;
  pendingApplications: number;
  reportedContent: number;
  systemHealth: number;
  userGrowthRate: number;
  applicationSuccessRate: number;
  marketplaceActivity: number;
  contentModerationQueue: number;
}

export interface UserWithStats extends User {
  totalApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  lastActiveAt: string;
  isVerified: boolean;
  reportedContent: number;
}

export interface ModerationItem {
  id: string;
  type: 'comment' | 'photo' | 'market' | 'user-report' | 'application';
  contentId: string;
  reportedBy: string;
  reporter: User;
  target: {
    id: string;
    type: 'comment' | 'photo' | 'market' | 'user' | 'application';
    content: string;
    author?: User;
  };
  reason: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
}

export interface PromoterVerification {
  id: string;
  userId: string;
  user: User;
  businessName: string;
  businessDescription: string;
  businessLicense: string;
  businessAddress: Location;
  taxId: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  references: BusinessReference[];
  status: 'pending' | 'under-review' | 'verified' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  documents: Document[];
}

export interface BusinessReference {
  name: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
  yearsKnown: number;
}

export interface AdminFilters {
  userFilters?: {
    role?: UserRole[];
    isActive?: boolean;
    isEmailVerified?: boolean;
    dateRange?: { start: string; end: string };
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  };
  moderationFilters?: {
    type?: string[];
    status?: string[];
    priority?: string[];
    assignedTo?: string;
    dateRange?: { start: string; end: string };
    search?: string;
  };
  applicationFilters?: {
    status?: ApplicationStatus[];
    marketId?: string;
    dateRange?: { start: string; end: string };
    search?: string;
  };
}

export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  category:
    | 'general'
    | 'moderation'
    | 'notifications'
    | 'payments'
    | 'features';
  isPublic: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface EmailConfig {
  id: string;
  host: string;
  port: number;
  secure: boolean;
  authMethod?: 'PLAIN' | 'LOGIN' | 'CRAM-MD5';
  username: string;
  password: string; // Masked on client
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  isActive: boolean;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed';
  lastTestError?: string;
  updatedBy?: string;
  updatedAt: string;
  createdAt: string;
}

export interface EmailTemplateVariable {
  name: string;
  description: string;
  example: string;
  required: boolean;
}

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  description?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: EmailTemplateVariable[];
  category:
    | 'authentication'
    | 'application'
    | 'notification'
    | 'marketing'
    | 'system';
  isActive: boolean;
  isSystem: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplatePreview {
  subject: string;
  html: string;
  text: string;
  variables: Record<string, string>;
}

export interface AuditLog {
  id: string;
  userId: string;
  user: User;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface BulkOperation {
  id: string;
  type:
    | 'user-role'
    | 'user-suspend'
    | 'content-approve'
    | 'content-reject'
    | 'application-bulk-review';
  targetIds: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total: number;
  results?: {
    success: string[];
    failed: { id: string; error: string }[];
  };
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

// Market Conversion Types
export interface MarketConversionRequest {
  id: string;
  marketId: string;
  market: Market;
  requesterId: string;
  requester: User;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Honor System Tracking Types
export interface VendorAttendance {
  id: string;
  userId: string;
  marketId: string;
  status: 'attending' | 'interested' | 'not-attending' | 'maybe';
  notes?: string;
  lastUpdated: string;
}
