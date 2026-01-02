import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { 
  AdminStats, 
  UserWithStats, 
  ModerationItem, 
  PromoterVerification, 
  AdminFilters, 
  SystemSettings, 
  EmailTemplate, 
  AuditLog, 
  BulkOperation 
} from '@/types'
import { adminApi } from './adminApi'

interface AdminState {
  // Dashboard stats
  stats: AdminStats | null
  isLoadingStats: boolean
  
  // Users
  users: UserWithStats[]
  usersPagination: { page: number; limit: number; total: number; totalPages: number } | null
  isLoadingUsers: boolean
  userFilters: AdminFilters['userFilters'] | null
  
  // Moderation
  moderationItems: ModerationItem[]
  moderationPagination: { page: number; limit: number; total: number; totalPages: number } | null
  isLoadingModeration: boolean
  moderationFilters: AdminFilters['moderationFilters'] | null
  
  // Promoter Verifications
  promoterVerifications: PromoterVerification[]
  isLoadingVerifications: boolean
  
  // Applications
  applications: any[]
  applicationsPagination: { page: number; limit: number; total: number; totalPages: number } | null
  isLoadingApplications: boolean
  applicationFilters: AdminFilters['applicationFilters'] | null
  
  // System Settings
  systemSettings: SystemSettings[]
  isLoadingSettings: boolean
  
  // Email Templates
  emailTemplates: EmailTemplate[]
  isLoadingTemplates: boolean
  
  // Audit Logs
  auditLogs: AuditLog[]
  auditPagination: { page: number; limit: number; total: number; totalPages: number } | null
  isLoadingAudit: boolean
  
  // Bulk Operations
  bulkOperations: BulkOperation[]
  
  // UI State
  selectedUsers: string[]
  selectedModerationItems: string[]
  selectedApplications: string[]
  bulkOperationProgress: Record<string, number>
}

interface AdminActions {
  // Dashboard
  fetchAdminStats: () => Promise<void>
  
  // Users
  fetchUsers: (filters?: AdminFilters['userFilters']) => Promise<void>
  updateUserRole: (userId: string, role: any) => Promise<void>
  suspendUser: (userId: string, suspended: boolean) => Promise<void>
  verifyUser: (userId: string, verified: boolean) => Promise<void>
  bulkUpdateUsers: (userIds: string[], operation: 'role' | 'suspend' | 'verify', value: any) => Promise<void>
  setUserFilters: (filters: AdminFilters['userFilters']) => void
  selectUser: (userId: string) => void
  selectUsers: (userIds: string[]) => void
  clearUserSelection: () => void
  
  // Moderation
  fetchModerationQueue: (filters?: AdminFilters['moderationFilters']) => Promise<void>
  moderateContent: (itemId: string, action: 'approve' | 'reject' | 'resolve', reason?: string) => Promise<void>
  assignModerationItem: (itemId: string, assignedTo: string) => Promise<void>
  setModerationFilters: (filters: AdminFilters['moderationFilters']) => void
  selectModerationItem: (itemId: string) => void
  selectModerationItems: (itemIds: string[]) => void
  clearModerationSelection: () => void
  
  // Promoter Verifications
  fetchPromoterVerifications: () => Promise<void>
  reviewPromoterVerification: (verificationId: string, status: 'verified' | 'rejected', notes?: string) => Promise<void>
  
  // Applications
  fetchAllApplications: (filters?: AdminFilters['applicationFilters']) => Promise<void>
  bulkReviewApplications: (applicationIds: string[], action: 'approve' | 'reject', reason?: string) => Promise<void>
  setApplicationFilters: (filters: AdminFilters['applicationFilters']) => void
  selectApplication: (applicationId: string) => void
  selectApplications: (applicationIds: string[]) => void
  clearApplicationSelection: () => void
  
  // System Settings
  fetchSystemSettings: () => Promise<void>
  updateSystemSetting: (key: string, value: string) => Promise<void>
  
  // Email Templates
  fetchEmailTemplates: () => Promise<void>
  
  // Audit Logs
  fetchAuditLogs: (filters?: any) => Promise<void>
  
  // Bulk Operations
  addBulkOperation: (operation: BulkOperation) => void
  updateBulkOperationProgress: (operationId: string, progress: number) => void
  
  // Analytics
  fetchUserAnalytics: (dateRange: { start: string; end: string }) => Promise<any>
  fetchMarketAnalytics: (dateRange: { start: string; end: string }) => Promise<any>
}

type AdminStore = AdminState & AdminActions

const initialState: AdminState = {
  stats: null,
  isLoadingStats: false,
  users: [],
  usersPagination: null,
  isLoadingUsers: false,
  userFilters: null,
  moderationItems: [],
  moderationPagination: null,
  isLoadingModeration: false,
  moderationFilters: null,
  promoterVerifications: [],
  isLoadingVerifications: false,
  applications: [],
  applicationsPagination: null,
  isLoadingApplications: false,
  applicationFilters: null,
  systemSettings: [],
  isLoadingSettings: false,
  emailTemplates: [],
  isLoadingTemplates: false,
  auditLogs: [],
  auditPagination: null,
  isLoadingAudit: false,
  bulkOperations: [],
  selectedUsers: [],
  selectedModerationItems: [],
  selectedApplications: [],
  bulkOperationProgress: {}
}

export const useAdminStore = create<AdminStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Dashboard
      fetchAdminStats: async () => {
        set({ isLoadingStats: true })
        try {
          const response = await adminApi.getAdminStats()
          if (response.success && response.data) {
            set({ stats: response.data })
          }
        } catch (error) {
          console.error('Failed to fetch admin stats:', error)
        } finally {
          set({ isLoadingStats: false })
        }
      },
      
      // Users
      fetchUsers: async (filters) => {
        set({ isLoadingUsers: true })
        try {
          const response = await adminApi.getUsers(filters)
          set({ 
            users: response.data, 
            usersPagination: response.pagination,
            userFilters: filters || null
          })
        } catch (error) {
          console.error('Failed to fetch users:', error)
        } finally {
          set({ isLoadingUsers: false })
        }
      },
      
      updateUserRole: async (userId, role) => {
        try {
          const response = await adminApi.updateUserRole(userId, role)
          if (response.success && response.data) {
            set((state) => ({
              users: state.users.map(user => 
                user.id === userId ? { ...user, role } : user
              )
            }))
          }
        } catch (error) {
          console.error('Failed to update user role:', error)
        }
      },
      
      suspendUser: async (userId, suspended) => {
        try {
          const response = await adminApi.suspendUser(userId, suspended)
          if (response.success && response.data) {
            set((state) => ({
              users: state.users.map(user => 
                user.id === userId ? { ...user, isActive: !suspended } : user
              )
            }))
          }
        } catch (error) {
          console.error('Failed to suspend user:', error)
        }
      },
      
      verifyUser: async (userId, verified) => {
        try {
          const response = await adminApi.verifyUser(userId, verified)
          if (response.success && response.data) {
            set((state) => ({
              users: state.users.map(user => 
                user.id === userId ? { ...user, isEmailVerified: verified } : user
              )
            }))
          }
        } catch (error) {
          console.error('Failed to verify user:', error)
        }
      },
      
      bulkUpdateUsers: async (userIds, operation, value) => {
        try {
          const response = await adminApi.bulkUpdateUsers(userIds, operation, value)
          if (response.success && response.data) {
            get().addBulkOperation(response.data)
            
            // Start tracking progress
            const operationId = response.data.id
            const interval = setInterval(() => {
              const progress = get().bulkOperationProgress[operationId] || 0
              if (progress < 100) {
                const newProgress = Math.min(progress + 10, 100)
                get().updateBulkOperationProgress(operationId, newProgress)
                
                if (newProgress >= 100) {
                  clearInterval(interval)
                  // Refresh users list after bulk operation
                  get().fetchUsers(get().userFilters || undefined)
                }
              }
            }, 200)
          }
        } catch (error) {
          console.error('Failed to bulk update users:', error)
        }
      },
      
      setUserFilters: (filters) => {
        set({ userFilters: filters })
      },
      
      selectUser: (userId) => {
        set((state) => ({
          selectedUsers: state.selectedUsers.includes(userId)
            ? state.selectedUsers.filter(id => id !== userId)
            : [...state.selectedUsers, userId]
        }))
      },
      
      selectUsers: (userIds) => {
        set({ selectedUsers: userIds })
      },
      
      clearUserSelection: () => {
        set({ selectedUsers: [] })
      },
      
      // Moderation
      fetchModerationQueue: async (filters) => {
        set({ isLoadingModeration: true })
        try {
          const response = await adminApi.getModerationQueue(filters)
          set({ 
            moderationItems: response.data, 
            moderationPagination: response.pagination,
            moderationFilters: filters || null
          })
        } catch (error) {
          console.error('Failed to fetch moderation queue:', error)
        } finally {
          set({ isLoadingModeration: false })
        }
      },
      
      moderateContent: async (itemId, action, reason) => {
        try {
          const response = await adminApi.moderateContent(itemId, action, reason)
          if (response.success && response.data) {
            set((state) => ({
              moderationItems: state.moderationItems.map(item => 
                item.id === itemId ? response.data! : item
              )
            }))
          }
        } catch (error) {
          console.error('Failed to moderate content:', error)
        }
      },
      
      assignModerationItem: async (itemId, assignedTo) => {
        try {
          const response = await adminApi.assignModerationItem(itemId, assignedTo)
          if (response.success && response.data) {
            set((state) => ({
              moderationItems: state.moderationItems.map(item => 
                item.id === itemId ? { ...item, assignedTo } : item
              )
            }))
          }
        } catch (error) {
          console.error('Failed to assign moderation item:', error)
        }
      },
      
      setModerationFilters: (filters) => {
        set({ moderationFilters: filters })
      },
      
      selectModerationItem: (itemId) => {
        set((state) => ({
          selectedModerationItems: state.selectedModerationItems.includes(itemId)
            ? state.selectedModerationItems.filter(id => id !== itemId)
            : [...state.selectedModerationItems, itemId]
        }))
      },
      
      selectModerationItems: (itemIds) => {
        set({ selectedModerationItems: itemIds })
      },
      
      clearModerationSelection: () => {
        set({ selectedModerationItems: [] })
      },
      
      // Promoter Verifications
      fetchPromoterVerifications: async () => {
        set({ isLoadingVerifications: true })
        try {
          const response = await adminApi.getPromoterVerifications()
          if (response.success && response.data) {
            set({ promoterVerifications: response.data })
          }
        } catch (error) {
          console.error('Failed to fetch promoter verifications:', error)
        } finally {
          set({ isLoadingVerifications: false })
        }
      },
      
      reviewPromoterVerification: async (verificationId, status, notes) => {
        try {
          const response = await adminApi.reviewPromoterVerification(verificationId, status, notes)
          if (response.success && response.data) {
            set((state) => ({
              promoterVerifications: state.promoterVerifications.map(v => 
                v.id === verificationId ? response.data! : v
              )
            }))
          }
        } catch (error) {
          console.error('Failed to review promoter verification:', error)
        }
      },
      
      // Applications
      fetchAllApplications: async (filters) => {
        set({ isLoadingApplications: true })
        try {
          const response = await adminApi.getAllApplications(filters)
          set({ 
            applications: response.data, 
            applicationsPagination: response.pagination,
            applicationFilters: filters || null
          })
        } catch (error) {
          console.error('Failed to fetch applications:', error)
        } finally {
          set({ isLoadingApplications: false })
        }
      },
      
      bulkReviewApplications: async (applicationIds, action, reason) => {
        try {
          const response = await adminApi.bulkReviewApplications(applicationIds, action, reason)
          if (response.success && response.data) {
            get().addBulkOperation(response.data)
            
            const operationId = response.data.id
            const interval = setInterval(() => {
              const progress = get().bulkOperationProgress[operationId] || 0
              if (progress < 100) {
                const newProgress = Math.min(progress + 15, 100)
                get().updateBulkOperationProgress(operationId, newProgress)
                
                if (newProgress >= 100) {
                  clearInterval(interval)
                  get().fetchAllApplications(get().applicationFilters || undefined)
                }
              }
            }, 300)
          }
        } catch (error) {
          console.error('Failed to bulk review applications:', error)
        }
      },
      
      setApplicationFilters: (filters) => {
        set({ applicationFilters: filters })
      },
      
      selectApplication: (applicationId) => {
        set((state) => ({
          selectedApplications: state.selectedApplications.includes(applicationId)
            ? state.selectedApplications.filter(id => id !== applicationId)
            : [...state.selectedApplications, applicationId]
        }))
      },
      
      selectApplications: (applicationIds) => {
        set({ selectedApplications: applicationIds })
      },
      
      clearApplicationSelection: () => {
        set({ selectedApplications: [] })
      },
      
      // System Settings
      fetchSystemSettings: async () => {
        set({ isLoadingSettings: true })
        try {
          const response = await adminApi.getSystemSettings()
          if (response.success && response.data) {
            set({ systemSettings: response.data })
          }
        } catch (error) {
          console.error('Failed to fetch system settings:', error)
        } finally {
          set({ isLoadingSettings: false })
        }
      },
      
      updateSystemSetting: async (key, value) => {
        try {
          const response = await adminApi.updateSystemSetting(key, value)
          if (response.success && response.data) {
            set((state) => ({
              systemSettings: state.systemSettings.map(setting => 
                setting.key === key ? response.data! : setting
              )
            }))
          }
        } catch (error) {
          console.error('Failed to update system setting:', error)
        }
      },
      
      // Email Templates
      fetchEmailTemplates: async () => {
        set({ isLoadingTemplates: true })
        try {
          const response = await adminApi.getEmailTemplates()
          if (response.success && response.data) {
            set({ emailTemplates: response.data })
          }
        } catch (error) {
          console.error('Failed to fetch email templates:', error)
        } finally {
          set({ isLoadingTemplates: false })
        }
      },
      
      // Audit Logs
      fetchAuditLogs: async (filters) => {
        set({ isLoadingAudit: true })
        try {
          const response = await adminApi.getAuditLogs(filters)
          set({ 
            auditLogs: response.data, 
            auditPagination: response.pagination
          })
        } catch (error) {
          console.error('Failed to fetch audit logs:', error)
        } finally {
          set({ isLoadingAudit: false })
        }
      },
      
      // Bulk Operations
      addBulkOperation: (operation) => {
        set((state) => ({
          bulkOperations: [operation, ...state.bulkOperations]
        }))
      },
      
      updateBulkOperationProgress: (operationId, progress) => {
        set((state) => ({
          bulkOperationProgress: {
            ...state.bulkOperationProgress,
            [operationId]: progress
          }
        }))
      },
      
      // Analytics
      fetchUserAnalytics: async (dateRange) => {
        try {
          const response = await adminApi.getUserAnalytics(dateRange)
          return response.data
        } catch (error) {
          console.error('Failed to fetch user analytics:', error)
          return null
        }
      },
      
      fetchMarketAnalytics: async (dateRange) => {
        try {
          const response = await adminApi.getMarketAnalytics(dateRange)
          return response.data
        } catch (error) {
          console.error('Failed to fetch market analytics:', error)
          return null
        }
      }
    }),
    {
      name: 'admin-store'
    }
  )
)