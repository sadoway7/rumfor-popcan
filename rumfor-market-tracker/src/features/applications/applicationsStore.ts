import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Application, ApplicationStatus, ApplicationFilters } from '@/types'
import { assertValidApplicationStatusTransition } from '@/utils/applicationStatus'

interface ApplicationsState {
  // Data
  applications: Application[]
  myApplications: Application[]
  application: Application | null
  
  // Loading states
  isLoading: boolean
  isSubmitting: boolean
  isUpdating: boolean
  isSearching: boolean
  
  // Filters and search
  filters: ApplicationFilters
  searchQuery: string
  
  // Pagination
  currentPage: number
  totalPages: number
  hasMore: boolean
  
  // Error handling
  error: string | null
  
  // Actions
  setApplications: (applications: Application[]) => void
  addApplication: (application: Application) => void
  updateApplication: (id: string, updates: Partial<Application>) => void
  removeApplication: (id: string) => void
  setApplication: (application: Application | null) => void
  
  // Search and filter actions
  setSearchQuery: (query: string) => void
  setFilters: (filters: ApplicationFilters) => void
  clearFilters: () => void
  applyFilters: () => Application[]
  
  // Status management
  updateApplicationStatus: (id: string, status: ApplicationStatus, notes?: string) => void
  
  // Pagination actions
  setCurrentPage: (page: number) => void
  setHasMore: (hasMore: boolean) => void
  
  // Loading and error actions
  setLoading: (loading: boolean) => void
  setSubmitting: (submitting: boolean) => void
  setUpdating: (updating: boolean) => void
  setSearching: (searching: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Utility actions
  getApplicationById: (id: string) => Application | undefined
  getFilteredApplications: () => Application[]
  getApplicationsByStatus: (status: ApplicationStatus) => Application[]
  getApplicationsByMarket: (marketId: string) => Application[]
  getMyApplications: (userId: string) => Application[]
}

const initialFilters: ApplicationFilters = {
  status: [],
  marketId: undefined,
  dateRange: undefined,
  search: '',
  vendorId: undefined,
}

export const useApplicationsStore = create<ApplicationsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      applications: [],
      myApplications: [],
      application: null,
      isLoading: false,
      isSubmitting: false,
      isUpdating: false,
      isSearching: false,
      filters: initialFilters,
      searchQuery: '',
      currentPage: 1,
      totalPages: 0,
      hasMore: false,
      error: null,

      // Application actions
      setApplications: (applications) => set({ applications }),
      
      addApplication: (application) => set((state) => ({
        applications: [application, ...state.applications]
      })),
      
      updateApplication: (id, updates) => set((state) => ({
        applications: state.applications.map(app => 
          app.id === id ? { ...app, ...updates } : app
        ),
        myApplications: state.myApplications.map(app => 
          app.id === id ? { ...app, ...updates } : app
        )
      })),
      
      removeApplication: (id) => set((state) => ({
        applications: state.applications.filter(app => app.id !== id),
        myApplications: state.myApplications.filter(app => app.id !== id)
      })),

      setApplication: (application) => set({ application }),

      // Search and filter actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setFilters: (filters) => set({ filters }),
      
      clearFilters: () => set({ 
        filters: initialFilters, 
        searchQuery: '' 
      }),
      
      applyFilters: () => {
        const { applications, filters, searchQuery } = get()
        let filteredApplications = [...applications]

        // Apply search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase()
          filteredApplications = filteredApplications.filter(app =>
            app.market?.name?.toLowerCase().includes(query) ||
            app.vendor?.firstName?.toLowerCase().includes(query) ||
            app.vendor?.lastName?.toLowerCase().includes(query)
          )
        }

        // Apply status filter
        if (filters.status && filters.status.length > 0) {
          filteredApplications = filteredApplications.filter(app =>
            filters.status!.includes(app.status)
          )
        }

        // Apply market filter
        if (filters.marketId) {
          filteredApplications = filteredApplications.filter(app =>
            app.marketId === filters.marketId
          )
        }

        // Apply vendor filter
        if (filters.vendorId) {
          filteredApplications = filteredApplications.filter(app =>
            app.vendorId === filters.vendorId
          )
        }

        // Apply date range filter
        if (filters.dateRange) {
          const { start, end } = filters.dateRange
          filteredApplications = filteredApplications.filter(app => {
            const appDate = new Date(app.createdAt)
            return appDate >= new Date(start) && appDate <= new Date(end)
          })
        }

        return filteredApplications
      },

      // Status management
      updateApplicationStatus: (id, status, notes) => set((state) => ({
        applications: state.applications.map(app => {
          if (app.id !== id) return app
          assertValidApplicationStatusTransition(app.status, status)
          return {
            ...app,
            status,
            notes: notes || app.notes,
            reviewedAt: status === 'under-review' || status === 'approved' || status === 'rejected'
              ? new Date().toISOString()
              : app.reviewedAt
          }
        }),
        myApplications: state.myApplications.map(app => {
          if (app.id !== id) return app
          assertValidApplicationStatusTransition(app.status, status)
          return {
            ...app,
            status,
            notes: notes || app.notes,
            reviewedAt: status === 'under-review' || status === 'approved' || status === 'rejected'
              ? new Date().toISOString()
              : app.reviewedAt
          }
        })
      })),

      // Pagination actions
      setCurrentPage: (page) => set({ currentPage: page }),
      setHasMore: (hasMore) => set({ hasMore }),

      // Loading and error actions
      setLoading: (loading) => set({ isLoading: loading }),
      setSubmitting: (submitting) => set({ isSubmitting: submitting }),
      setUpdating: (updating) => set({ isUpdating: updating }),
      setSearching: (searching) => set({ isSearching: searching }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Utility actions
      getApplicationById: (id) => {
        const { applications } = get()
        return applications.find(app => app.id === id)
      },
      
      getFilteredApplications: () => {
        return get().applyFilters()
      },

      getApplicationsByStatus: (status) => {
        const { applications } = get()
        return applications.filter(app => app.status === status)
      },

      getApplicationsByMarket: (marketId) => {
        const { applications } = get()
        return applications.filter(app => app.marketId === marketId)
      },

      getMyApplications: (userId) => {
        const { applications } = get()
        return applications.filter(app => app.vendorId === userId)
      },
    }),
    {
      name: 'applications-store'
    }
  )
)
