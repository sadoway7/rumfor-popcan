import {
  AdminStats,
  UserWithStats,
  ModerationItem,
  PromoterVerification,
  AdminFilters,
  SystemSettings,
  EmailTemplate,
  AuditLog,
  BulkOperation,
  User,
  Application,
  UserRole,
  ApiResponse,
  PaginatedResponse
} from '@/types'
import { httpClient } from '@/lib/httpClient'

// Environment configuration
const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true'

// API simulation delay (reduced for better UX)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock data for development
const mockAdminStats: AdminStats = {
  totalUsers: 1250,
  totalMarkets: 85,
  totalApplications: 340,
  totalRevenue: 15420.50,
  activeUsers: 892,
  pendingApplications: 23,
  reportedContent: 8,
  systemHealth: 98.5,
  userGrowthRate: 15.3,
  applicationSuccessRate: 78.2,
  marketplaceActivity: 245,
  contentModerationQueue: 8
}

const mockUsers: UserWithStats[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'vendor',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    createdAt: '2023-01-15T08:30:00Z',
    updatedAt: '2023-12-01T14:20:00Z',
    isEmailVerified: true,
    isActive: true,
    totalApplications: 12,
    approvedApplications: 9,
    rejectedApplications: 2,
    lastActiveAt: '2023-12-01T10:30:00Z',
    isVerified: true,
    reportedContent: 0
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'promoter',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150',
    createdAt: '2023-02-20T10:15:00Z',
    updatedAt: '2023-11-28T16:45:00Z',
    isEmailVerified: true,
    isActive: true,
    totalApplications: 3,
    approvedApplications: 2,
    rejectedApplications: 1,
    lastActiveAt: '2023-11-30T09:15:00Z',
    isVerified: true,
    reportedContent: 0
  },
  {
    id: '3',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-12-01T08:00:00Z',
    isEmailVerified: true,
    isActive: true,
    totalApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    lastActiveAt: '2023-12-01T08:00:00Z',
    isVerified: true,
    reportedContent: 0
  }
]

const mockModerationItems: ModerationItem[] = [
  {
    id: '1',
    type: 'comment',
    contentId: 'comment-1',
    reportedBy: 'user-123',
    reporter: mockUsers[0],
    target: {
      id: 'comment-1',
      type: 'comment',
      content: 'This market is terrible and the organizer is incompetent...',
      author: mockUsers[1]
    },
    reason: 'Inappropriate language',
    description: 'Comment contains offensive language directed at market organizer',
    status: 'pending',
    priority: 'medium',
    createdAt: '2023-11-30T14:30:00Z',
    updatedAt: '2023-11-30T14:30:00Z'
  },
  {
    id: '2',
    type: 'photo',
    contentId: 'photo-1',
    reportedBy: 'user-456',
    reporter: mockUsers[1],
    target: {
      id: 'photo-1',
      type: 'photo',
      content: 'Photo showing inappropriate content at farmers market',
      author: mockUsers[0]
    },
    reason: 'Inappropriate content',
    description: 'Photo contains content that violates community guidelines',
    status: 'pending',
    priority: 'high',
    createdAt: '2023-11-29T10:15:00Z',
    updatedAt: '2023-11-29T10:15:00Z'
  }
]

const mockPromoterVerifications: PromoterVerification[] = [
  {
    id: '1',
    userId: 'user-789',
    user: mockUsers[1],
    businessName: 'Downtown Farmers Market Co.',
    businessDescription: 'Operating farmers markets in downtown area for over 10 years',
    businessLicense: 'BUS-2023-789',
    businessAddress: {
      address: '123 Main Street',
      city: 'Anytown',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    taxId: '12-3456789',
    website: 'https://downtownmarket.com',
    socialMedia: {
      facebook: 'https://facebook.com/downtownmarket',
      instagram: 'https://instagram.com/downtownmarket'
    },
    references: [
      {
        name: 'Bob Johnson',
        company: 'City Council',
        email: 'b.johnson@citycouncil.gov',
        phone: '(555) 123-4567',
        relationship: 'City Liaison',
        yearsKnown: 5
      }
    ],
    status: 'pending',
    submittedAt: '2023-11-25T10:00:00Z',
    documents: []
  }
]

// Admin API functions
export const adminApi = {
  // Dashboard & Analytics
  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    if (isMockMode) {
      await delay(500)
      return { success: true, data: mockAdminStats }
    } else {
      const response = await httpClient.get<ApiResponse<AdminStats>>('/admin/stats')
      return response
    }
  },

  async getRecentActivities(): Promise<ApiResponse<any[]>> {
    if (isMockMode) {
      await delay(300)
      return {
        success: true,
        data: [
          {
            id: '1',
            type: 'user_registered',
            message: 'New vendor registered: Sarah Johnson',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
            icon: 'Users',
            color: 'text-blue-500'
          },
          {
            id: '2',
            type: 'market_created',
            message: 'New market created: Downtown Artisan Fair',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
            icon: 'Store',
            color: 'text-green-500'
          },
          {
            id: '3',
            type: 'application_submitted',
            message: 'Application submitted for Spring Market 2024',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
            icon: 'FileText',
            color: 'text-yellow-500'
          }
        ].slice(0, 5) // Limit to 5 recent activities
      }
    } else {
      const response = await httpClient.get<ApiResponse<any[]>>('/admin/activities/recent')
      return response
    }
  },

  async getUserAnalytics(dateRange: { start: string; end: string }): Promise<ApiResponse<any>> {
    if (isMockMode) {
      await delay(600)
      return {
        success: true,
        data: {
          userGrowth: [
            { date: '2023-01', users: 850 },
            { date: '2023-02', users: 920 },
            { date: '2023-03', users: 1050 },
            { date: '2023-04', users: 1150 },
            { date: '2023-05', users: 1200 },
            { date: '2023-06', users: 1250 }
          ],
          roleDistribution: [
            { role: 'visitor', count: 650, percentage: 52 },
            { role: 'vendor', count: 350, percentage: 28 },
            { role: 'promoter', count: 200, percentage: 16 },
            { role: 'admin', count: 50, percentage: 4 }
          ]
        }
      }
    } else {
      const queryParams = new URLSearchParams()
      queryParams.append('startDate', dateRange.start)
      queryParams.append('endDate', dateRange.end)
      const response = await httpClient.get<ApiResponse<any>>(`/admin/analytics/users?${queryParams}`)
      return response
    }
  },

  async getMarketAnalytics(dateRange: { start: string; end: string }): Promise<ApiResponse<any>> {
    if (isMockMode) {
      await delay(550)
      return {
        success: true,
        data: {
          marketActivity: [
            { date: '2023-01', applications: 45, markets: 12 },
            { date: '2023-02', applications: 52, markets: 15 },
            { date: '2023-03', applications: 68, markets: 18 },
            { date: '2023-04', applications: 71, markets: 20 },
            { date: '2023-05', applications: 59, markets: 22 },
            { date: '2023-06', applications: 45, markets: 20 }
          ],
          categoryDistribution: [
            { category: 'farmers-market', count: 35, percentage: 41 },
            { category: 'arts-crafts', count: 25, percentage: 29 },
            { category: 'food-festival', count: 15, percentage: 18 },
            { category: 'flea-market', count: 10, percentage: 12 }
          ]
        }
      }
    } else {
      const queryParams = new URLSearchParams()
      queryParams.append('startDate', dateRange.start)
      queryParams.append('endDate', dateRange.end)
      const response = await httpClient.get<ApiResponse<any>>(`/admin/analytics/markets?${queryParams}`)
      return response
    }
  },

  // User Management
  async getUsers(filters?: AdminFilters['userFilters']): Promise<PaginatedResponse<UserWithStats>> {
    if (isMockMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filteredUsers = [...mockUsers]

          if (filters?.role && filters.role.length > 0) {
            filteredUsers = filteredUsers.filter(user => filters.role!.includes(user.role))
          }

          if (filters?.isActive !== undefined) {
            filteredUsers = filteredUsers.filter(user => user.isActive === filters.isActive)
          }

          if (filters?.search) {
            const search = filters.search.toLowerCase()
            filteredUsers = filteredUsers.filter(user =>
              user.firstName.toLowerCase().includes(search) ||
              user.lastName.toLowerCase().includes(search) ||
              user.email.toLowerCase().includes(search)
            )
          }

          resolve({
            data: filteredUsers,
            pagination: {
              page: 1,
              limit: 20,
              total: filteredUsers.length,
              totalPages: Math.ceil(filteredUsers.length / 20)
            }
          })
        }, 400)
      })
    } else {
      const queryParams = new URLSearchParams()
      if (filters?.role && filters.role.length > 0) queryParams.append('role', filters.role[0])
      if (filters?.isActive !== undefined) queryParams.append('status', filters.isActive ? 'active' : 'inactive')
      if (filters?.search) queryParams.append('search', filters.search)
      if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy)
      if (filters?.sortDirection) queryParams.append('sortOrder', filters.sortDirection)

      const response = await httpClient.get<PaginatedResponse<UserWithStats>>(`/admin/users?${queryParams}`)
      return response
    }
  },

  async updateUserRole(userId: string, role: UserRole): Promise<ApiResponse<User>> {
    if (isMockMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const user = mockUsers.find(u => u.id === userId)
          if (user) {
            user.role = role
            user.updatedAt = new Date().toISOString()
          }
          resolve({ success: true, data: user! })
        }, 300)
      })
    } else {
      const response = await httpClient.put<ApiResponse<User>>(`/admin/users/${userId}`, { role })
      return response
    }
  },

  async suspendUser(userId: string, suspended: boolean): Promise<ApiResponse<User>> {
    if (isMockMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const user = mockUsers.find(u => u.id === userId)
          if (user) {
            user.isActive = !suspended
            user.updatedAt = new Date().toISOString()
          }
          resolve({ success: true, data: user! })
        }, 300)
      })
    } else {
      const response = await httpClient.put<ApiResponse<User>>(`/admin/users/${userId}`, { isActive: !suspended })
      return response
    }
  },

  async verifyUser(userId: string, verified: boolean): Promise<ApiResponse<User>> {
    if (isMockMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const user = mockUsers.find(u => u.id === userId)
          if (user) {
            user.isEmailVerified = verified
            user.updatedAt = new Date().toISOString()
          }
          resolve({ success: true, data: user! })
        }, 300)
      })
    } else {
      const response = await httpClient.put<ApiResponse<User>>(`/admin/users/${userId}`, { verifiedPromoter: verified })
      return response
    }
  },

  async bulkUpdateUsers(
    userIds: string[], 
    operation: 'role' | 'suspend' | 'verify',
    value: UserRole | boolean
  ): Promise<ApiResponse<BulkOperation>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const bulkOp: BulkOperation = {
          id: `bulk-${Date.now()}`,
          type: operation === 'role' ? 'user-role' : operation === 'suspend' ? 'user-suspend' : 'user-suspend',
          targetIds: userIds,
          parameters: { operation, value },
          status: 'processing',
          progress: 0,
          total: userIds.length,
          createdBy: 'current-admin',
          createdAt: new Date().toISOString()
        }
        
        // Simulate processing
        setTimeout(() => {
          bulkOp.status = 'completed'
          bulkOp.progress = bulkOp.total
          bulkOp.results = {
            success: userIds,
            failed: []
          }
          bulkOp.completedAt = new Date().toISOString()
        }, 2000)
        
        resolve({ success: true, data: bulkOp })
      }, 200)
    })
  },

  // Content Moderation
  async getModerationQueue(filters?: AdminFilters['moderationFilters']): Promise<PaginatedResponse<ModerationItem>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredItems = [...mockModerationItems]
        
        if (filters?.type && filters.type.length > 0) {
          filteredItems = filteredItems.filter(item => filters.type!.includes(item.type))
        }
        
        if (filters?.status && filters.status.length > 0) {
          filteredItems = filteredItems.filter(item => filters.status!.includes(item.status))
        }
        
        if (filters?.priority && filters.priority.length > 0) {
          filteredItems = filteredItems.filter(item => filters.priority!.includes(item.priority))
        }
        
        if (filters?.search) {
          const search = filters.search.toLowerCase()
          filteredItems = filteredItems.filter(item =>
            item.target.content.toLowerCase().includes(search) ||
            item.reason.toLowerCase().includes(search) ||
            item.description.toLowerCase().includes(search)
          )
        }
        
        resolve({
          data: filteredItems,
          pagination: {
            page: 1,
            limit: 20,
            total: filteredItems.length,
            totalPages: Math.ceil(filteredItems.length / 20)
          }
        })
      }, 450)
    })
  },

  async moderateContent(
    itemId: string, 
    action: 'approve' | 'reject' | 'resolve',
    reason?: string
  ): Promise<ApiResponse<ModerationItem>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = mockModerationItems.find(i => i.id === itemId)
        if (item) {
          item.status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'resolved'
          item.resolution = reason
          item.resolvedAt = new Date().toISOString()
          item.resolvedBy = 'current-admin'
          item.updatedAt = new Date().toISOString()
        }
        resolve({ success: true, data: item! })
      }, 300)
    })
  },

  async assignModerationItem(itemId: string, assignedTo: string): Promise<ApiResponse<ModerationItem>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = mockModerationItems.find(i => i.id === itemId)
        if (item) {
          item.assignedTo = assignedTo
          item.updatedAt = new Date().toISOString()
        }
        resolve({ success: true, data: item! })
      }, 200)
    })
  },

  // Promoter Verification
  async getPromoterVerifications(): Promise<ApiResponse<PromoterVerification[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: mockPromoterVerifications })
      }, 400)
    })
  },

  async reviewPromoterVerification(
    verificationId: string,
    status: 'verified' | 'rejected',
    notes?: string
  ): Promise<ApiResponse<PromoterVerification>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const verification = mockPromoterVerifications.find(v => v.id === verificationId)
        if (verification) {
          verification.status = status
          verification.reviewedAt = new Date().toISOString()
          verification.reviewedBy = 'current-admin'
          verification.notes = notes
        }
        resolve({ success: true, data: verification! })
      }, 300)
    })
  },

  // Applications Management
  async getAllApplications(_filters?: AdminFilters['applicationFilters']): Promise<PaginatedResponse<Application>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock applications data
        const mockApplications: Application[] = []
        resolve({
          data: mockApplications,
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
          }
        })
      }, 500)
    })
  },

  async bulkReviewApplications(
    applicationIds: string[],
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<ApiResponse<BulkOperation>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const bulkOp: BulkOperation = {
          id: `bulk-app-${Date.now()}`,
          type: 'application-bulk-review',
          targetIds: applicationIds,
          parameters: { action, reason },
          status: 'processing',
          progress: 0,
          total: applicationIds.length,
          createdBy: 'current-admin',
          createdAt: new Date().toISOString()
        }
        
        setTimeout(() => {
          bulkOp.status = 'completed'
          bulkOp.progress = bulkOp.total
          bulkOp.results = {
            success: applicationIds,
            failed: []
          }
          bulkOp.completedAt = new Date().toISOString()
        }, 2000)
        
        resolve({ success: true, data: bulkOp })
      }, 200)
    })
  },

  // System Settings
  async getSystemSettings(): Promise<ApiResponse<SystemSettings[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const settings: SystemSettings[] = [
          {
            id: '1',
            key: 'user_registration_enabled',
            value: 'true',
            type: 'boolean',
            description: 'Allow new user registrations',
            category: 'general',
            isPublic: false,
            updatedAt: '2023-01-01T00:00:00Z',
            updatedBy: 'admin'
          },
          {
            id: '2',
            key: 'auto_moderation_enabled',
            value: 'true',
            type: 'boolean',
            description: 'Enable automatic content moderation',
            category: 'moderation',
            isPublic: false,
            updatedAt: '2023-01-01T00:00:00Z',
            updatedBy: 'admin'
          }
        ]
        resolve({ success: true, data: settings })
      }, 300)
    })
  },

  async updateSystemSetting(key: string, value: string): Promise<ApiResponse<SystemSettings>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const setting: SystemSettings = {
          id: key,
          key,
          value,
          type: 'string',
          description: '',
          category: 'general',
          isPublic: false,
          updatedAt: new Date().toISOString(),
          updatedBy: 'current-admin'
        }
        resolve({ success: true, data: setting })
      }, 200)
    })
  },

  // Email Templates
  async getEmailTemplates(): Promise<ApiResponse<EmailTemplate[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const templates: EmailTemplate[] = [
          {
            id: '1',
            name: 'Welcome Email',
            subject: 'Welcome to RumFor!',
            content: 'Hello {{firstName}}, welcome to our platform!',
            variables: ['firstName', 'lastName'],
            category: 'welcome',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          }
        ]
        resolve({ success: true, data: templates })
      }, 300)
    })
  },

  // Contact Form Submission
  async submitContactForm(formData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    userType: 'vendor' | 'promoter' | 'visitor' | 'other';
    priority: 'low' | 'medium' | 'high';
  }): Promise<ApiResponse<{ ticketId: string }>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ticketId = `contact-${Date.now()}`;
        console.log('Contact form submitted:', formData);
        resolve({ success: true, data: { ticketId } });
      }, 1000);
    });
  },

  // Audit Logs
  async getAuditLogs(_filters?: { userId?: string; action?: string; dateRange?: { start: string; end: string } }): Promise<PaginatedResponse<AuditLog>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const logs: AuditLog[] = [
          {
            id: '1',
            userId: '1',
            user: mockUsers[0],
            action: 'user_role_updated',
            resource: 'user',
            resourceId: '1',
            details: { from: 'visitor', to: 'vendor' },
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0...',
            createdAt: '2023-12-01T10:00:00Z'
          }
        ]
        resolve({
          data: logs,
          pagination: {
            page: 1,
            limit: 50,
            total: logs.length,
            totalPages: Math.ceil(logs.length / 50)
          }
        })
      }, 400)
    })
  },

  // Vendor Messaging (for promoters)
  async sendMessageToVendor(vendorId: string, message: string): Promise<ApiResponse<{ messageId: string }>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const messageId = `msg-${Date.now()}`
        console.log('Sending message to vendor:', vendorId, 'Message:', message)
        resolve({ success: true, data: { messageId } })
      }, 500)
    })
  },

  // Vendor Blacklisting (for promoters)
  async blacklistVendor(vendorId: string, reason: string): Promise<ApiResponse<User>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.id === vendorId)
        if (user) {
          // In a real app, this would create a blacklist record and update user status
          console.log('Blacklisting vendor:', vendorId, 'Reason:', reason)
          user.updatedAt = new Date().toISOString()
        }
        resolve({ success: true, data: user! })
      }, 500)
    })
  },

  // Unblacklist vendor
  async unblacklistVendor(vendorId: string): Promise<ApiResponse<User>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.id === vendorId)
        if (user) {
          console.log('Unblacklisting vendor:', vendorId)
          user.updatedAt = new Date().toISOString()
        }
        resolve({ success: true, data: user! })
      }, 500)
    })
  },

  // Market Status Update (for promoters)
  async updateMarketStatus(marketId: string, status: string): Promise<ApiResponse<any>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Updating market status:', marketId, 'to status:', status)
        resolve({ success: true, data: { id: marketId, status } })
      }, 500)
    })
  },

  // Market Deletion (for promoters)
  async deleteMarket(marketId: string, reason?: string): Promise<ApiResponse<any>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Deleting market:', marketId, 'Reason:', reason)
        resolve({ success: true, data: { id: marketId, deleted: true } })
      }, 500)
    })
  }
}