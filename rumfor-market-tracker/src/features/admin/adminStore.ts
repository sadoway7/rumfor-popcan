import { create } from 'zustand'
import {
  AdminStats,
  UserWithStats,
  ModerationItem,
  PromoterVerification,
  SystemSettings,
  BulkOperation,
  EmailTemplate,
  EmailConfig,
  AuditLog,
  AdminFilters,
  ApiResponse
} from '@/types'
import { adminApi } from './adminApi'

interface AdminStoreState {
  // Stats
  stats: AdminStats | null
  isLoadingStats: boolean

  // Recent Activities
  recentActivities: any[]
  isLoadingActivities: boolean

  // Users
  users: UserWithStats[]
  usersPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  isLoadingUsers: boolean
  selectedUsers: string[]
  userFilters: AdminFilters['userFilters']

  // Moderation
  moderationItems: ModerationItem[]
  moderationPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  isLoadingModeration: boolean
  selectedModerationItems: string[]
  moderationFilters: AdminFilters['moderationFilters']

  // Promoter Verifications
  promoterVerifications: PromoterVerification[]
  isLoadingVerifications: boolean

  // System Settings
  systemSettings: SystemSettings[]
  isLoadingSettings: boolean

  // Email Templates
  emailTemplates: EmailTemplate[]
  isLoadingTemplates: boolean

  // Email Configuration
  emailConfig: EmailConfig | null
  isLoadingEmailConfig: boolean
  isTestingEmailConnection: boolean
  isSendingTestEmail: boolean

  // Audit Logs
  auditLogs: AuditLog[]
  auditPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  isLoadingAudit: boolean

  // Bulk Operations
  bulkOperations: BulkOperation[]
  bulkOperationProgress: { [key: string]: number }
}

interface AdminStore extends AdminStoreState {
  // Stats methods
  fetchAdminStats: () => Promise<void>

  // Activities methods
  fetchRecentActivities: () => Promise<void>

  // User management methods
  fetchUsers: (filters?: AdminFilters['userFilters']) => Promise<void>
  updateUserRole: (userId: string, role: any) => Promise<void>
  suspendUser: (userId: string, isActive: boolean) => Promise<void>
  verifyUser: (userId: string, verified: boolean) => Promise<void>
  bulkUpdateUsers: (userIds: string[], operation: 'role' | 'suspend' | 'verify', value: any) => Promise<void>
  setUserFilters: (filters: AdminFilters['userFilters']) => void
  selectUser: (userId: string) => void
  selectUsers: (userIds: string[]) => void
  clearUserSelection: () => void

  // Moderation methods
  fetchModerationQueue: (filters?: AdminFilters['moderationFilters']) => Promise<void>
  moderateContent: (itemId: string, action: 'approve' | 'reject' | 'resolve', reason?: string) => Promise<void>
  assignModerationItem: (itemId: string, assignedTo: string) => Promise<void>
  setModerationFilters: (filters: AdminFilters['moderationFilters']) => void
  selectModerationItem: (itemId: string) => void
  selectModerationItems: (itemIds: string[]) => void
  clearModerationSelection: () => void

  // Promoter verification methods
  fetchPromoterVerifications: () => Promise<void>
  reviewPromoterVerification: (verificationId: string, status: 'verified' | 'rejected', notes?: string) => Promise<void>

  // System settings methods
  fetchSystemSettings: () => Promise<void>
  updateSystemSetting: (key: string, value: string) => Promise<void>

  // Email templates methods
  fetchEmailTemplates: () => Promise<void>

  // Email configuration methods
  fetchEmailConfig: () => Promise<void>
  updateEmailConfig: (config: Partial<EmailConfig>) => Promise<void>
  testEmailConnection: () => Promise<ApiResponse<{ success: boolean; message: string }>>
  sendTestEmail: (to: string, testConfig?: Partial<EmailConfig>) => Promise<ApiResponse<{ success: boolean; messageId?: string; message?: string }>>

  // Audit logs methods
  fetchAuditLogs: (filters?: any) => Promise<void>

  // Bulk operations methods
  addBulkOperation: (operation: BulkOperation) => void
  updateBulkOperationProgress: (operationId: string, progress: number) => void

  // Analytics methods
  fetchUserAnalytics: (dateRange: { start: string; end: string }) => Promise<any>
  fetchMarketAnalytics: (dateRange: { start: string; end: string }) => Promise<any>
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  // Initial state
  stats: null,
  isLoadingStats: false,

  recentActivities: [],
  isLoadingActivities: false,

  users: [],
  usersPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  isLoadingUsers: false,
  selectedUsers: [],
  userFilters: {},

  moderationItems: [],
  moderationPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  isLoadingModeration: false,
  selectedModerationItems: [],
  moderationFilters: {},

  promoterVerifications: [],
  isLoadingVerifications: false,

  systemSettings: [],
  isLoadingSettings: false,

  emailTemplates: [],
  isLoadingTemplates: false,

  // Email Configuration
  emailConfig: null,
  isLoadingEmailConfig: false,
  isTestingEmailConnection: false,
  isSendingTestEmail: false,

  auditLogs: [],
  auditPagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  },
  isLoadingAudit: false,

  bulkOperations: [],
  bulkOperationProgress: {},

  // Stats methods
  fetchAdminStats: async () => {
    try {
      set({ isLoadingStats: true })
      const response = await adminApi.getAdminStats()
      if (response.success) {
        set({ stats: response.data, isLoadingStats: false })
      }
    } catch (error) {
      set({ isLoadingStats: false })
      throw error
    }
  },

  // Activities methods
  fetchRecentActivities: async () => {
    try {
      set({ isLoadingActivities: true })
      const response = await adminApi.getRecentActivities()
      if (response.success) {
        set({ recentActivities: response.data, isLoadingActivities: false })
      }
    } catch (error) {
      set({ isLoadingActivities: false })
      throw error
    }
  },

  // User management methods
  fetchUsers: async (filters) => {
    try {
      set({ isLoadingUsers: true, userFilters: filters })
      const response = await adminApi.getUsers(filters)
      set({
        users: response.data,
        usersPagination: response.pagination,
        isLoadingUsers: false
      })
    } catch (error) {
      set({ isLoadingUsers: false })
      throw error
    }
  },

  updateUserRole: async (userId, role) => {
    const response = await adminApi.updateUserRole(userId, role)
    if (response.success) {
      // Update the user in the list
      const { users } = get()
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, role } : user
      )
      set({ users: updatedUsers })
    }
  },

  suspendUser: async (userId, isActive) => {
    const response = await adminApi.suspendUser(userId, isActive)
    if (response.success) {
      const { users } = get()
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, isActive } : user
      )
      set({ users: updatedUsers })
    }
  },

  verifyUser: async (userId, verified) => {
    const response = await adminApi.verifyUser(userId, verified)
    if (response.success) {
      const { users } = get()
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, isEmailVerified: verified } : user
      )
      set({ users: updatedUsers })
    }
  },

  bulkUpdateUsers: async (userIds, operation, value) => {
    const response = await adminApi.bulkUpdateUsers(userIds, operation, value)
    if (response.success && response.data) {
      get().addBulkOperation(response.data)
    }
  },

  setUserFilters: (filters) => {
    set({ userFilters: filters })
  },

  selectUser: (userId) => {
    const { selectedUsers } = get()
    const isSelected = selectedUsers.includes(userId)
    if (isSelected) {
      set({ selectedUsers: selectedUsers.filter(id => id !== userId) })
    } else {
      set({ selectedUsers: [...selectedUsers, userId] })
    }
  },

  selectUsers: (userIds) => {
    set({ selectedUsers: userIds })
  },

  clearUserSelection: () => {
    set({ selectedUsers: [] })
  },

  // Moderation methods
  fetchModerationQueue: async (filters) => {
    try {
      set({ isLoadingModeration: true, moderationFilters: filters })
      const response = await adminApi.getModerationQueue(filters)
      set({
        moderationItems: response.data,
        moderationPagination: response.pagination,
        isLoadingModeration: false
      })
    } catch (error) {
      set({ isLoadingModeration: false })
      throw error
    }
  },

  moderateContent: async (itemId, action, reason) => {
    const response = await adminApi.moderateContent(itemId, action, reason)
    if (response.success) {
      const { moderationItems } = get()
      const newStatus = action === 'approve' ? 'approved' as const : action === 'reject' ? 'rejected' as const : 'resolved' as const
      const updatedItems = moderationItems.map(item =>
        item.id === itemId ? { ...item, status: newStatus, resolution: reason, resolvedAt: new Date().toISOString(), resolvedBy: 'current-admin' } : item
      )
      set({ moderationItems: updatedItems })
    }
  },

  assignModerationItem: async (itemId, assignedTo) => {
    const response = await adminApi.assignModerationItem(itemId, assignedTo)
    if (response.success) {
      const { moderationItems } = get()
      const updatedItems = moderationItems.map(item =>
        item.id === itemId ? { ...item, assignedTo } : item
      )
      set({ moderationItems: updatedItems })
    }
  },

  setModerationFilters: (filters) => {
    set({ moderationFilters: filters })
  },

  selectModerationItem: (itemId) => {
    const { selectedModerationItems } = get()
    const isSelected = selectedModerationItems.includes(itemId)
    if (isSelected) {
      set({ selectedModerationItems: selectedModerationItems.filter(id => id !== itemId) })
    } else {
      set({ selectedModerationItems: [...selectedModerationItems, itemId] })
    }
  },

  selectModerationItems: (itemIds) => {
    set({ selectedModerationItems: itemIds })
  },

  clearModerationSelection: () => {
    set({ selectedModerationItems: [] })
  },

  // Promoter verification methods
  fetchPromoterVerifications: async () => {
    try {
      set({ isLoadingVerifications: true })
      const response = await adminApi.getPromoterVerifications()
      if (response.success) {
        set({ promoterVerifications: response.data, isLoadingVerifications: false })
      }
    } catch (error) {
      set({ isLoadingVerifications: false })
      throw error
    }
  },

  reviewPromoterVerification: async (verificationId, status, notes) => {
    const response = await adminApi.reviewPromoterVerification(verificationId, status, notes)
    if (response.success) {
      const { promoterVerifications } = get()
      const updatedVerifications = promoterVerifications.map(v =>
        v.id === verificationId ? { ...v, status, reviewedAt: new Date().toISOString(), reviewedBy: 'current-admin', notes } : v
      )
      set({ promoterVerifications: updatedVerifications })
    }
  },

  // System settings methods
  fetchSystemSettings: async () => {
    try {
      set({ isLoadingSettings: true })
      const response = await adminApi.getSystemSettings()
      if (response.success) {
        set({ systemSettings: response.data, isLoadingSettings: false })
      }
    } catch (error) {
      set({ isLoadingSettings: false })
      throw error
    }
  },

  updateSystemSetting: async (key, value) => {
    const response = await adminApi.updateSystemSetting(key, value)
    if (response.success) {
      const { systemSettings } = get()
      const updatedSettings = systemSettings.map(setting =>
        setting.key === key ? { ...setting, value, updatedAt: new Date().toISOString(), updatedBy: 'current-admin' } : setting
      )
      set({ systemSettings: updatedSettings })
    }
  },

  // Email templates methods
  fetchEmailTemplates: async () => {
    try {
      set({ isLoadingTemplates: true })
      const response = await adminApi.getEmailTemplates()
      if (response.success) {
        set({ emailTemplates: response.data, isLoadingTemplates: false })
      }
    } catch (error) {
      set({ isLoadingTemplates: false })
      throw error
    }
  },

  // Email configuration methods
  fetchEmailConfig: async () => {
    try {
      set({ isLoadingEmailConfig: true })
      const response = await adminApi.getEmailConfig()
      if (response.success) {
        set({ emailConfig: response.data, isLoadingEmailConfig: false })
      }
    } catch (error) {
      set({ isLoadingEmailConfig: false })
      throw error
    }
  },

  updateEmailConfig: async (config) => {
    try {
      set({ isLoadingEmailConfig: true })
      const response = await adminApi.updateEmailConfig(config)
      if (response.success) {
        set({ emailConfig: response.data, isLoadingEmailConfig: false })
      }
    } catch (error) {
      set({ isLoadingEmailConfig: false })
      throw error
    }
  },

  testEmailConnection: async () => {
    try {
      set({ isTestingEmailConnection: true })
      const response = await adminApi.testEmailConnection()
      set({ isTestingEmailConnection: false })
      return response
    } catch (error) {
      set({ isTestingEmailConnection: false })
      throw error
    }
  },

  sendTestEmail: async (to, testConfig) => {
    try {
      set({ isSendingTestEmail: true })
      const response = await adminApi.sendTestEmail(to, testConfig)
      set({ isSendingTestEmail: false })
      return response
    } catch (error) {
      set({ isSendingTestEmail: false })
      throw error
    }
  },

  // Audit logs methods
  fetchAuditLogs: async (filters) => {
    try {
      set({ isLoadingAudit: true })
      const response = await adminApi.getAuditLogs(filters)
      set({
        auditLogs: response.data,
        auditPagination: response.pagination,
        isLoadingAudit: false
      })
    } catch (error) {
      set({ isLoadingAudit: false })
      throw error
    }
  },

  // Bulk operations methods
  addBulkOperation: (operation) => {
    const { bulkOperations } = get()
    set({ bulkOperations: [...bulkOperations, operation] })
  },

  updateBulkOperationProgress: (operationId, progress) => {
    const { bulkOperationProgress } = get()
    set({ bulkOperationProgress: { ...bulkOperationProgress, [operationId]: progress } })
  },

  // Analytics methods
  fetchUserAnalytics: async (dateRange) => {
    const response = await adminApi.getUserAnalytics(dateRange)
    return response.data
  },

  fetchMarketAnalytics: async (dateRange) => {
    const response = await adminApi.getMarketAnalytics(dateRange)
    return response.data
  }
}))