import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AuthState, User, LoginCredentials, RegisterData, PasswordResetRequest, PasswordResetConfirm, EmailVerificationRequest, ResendVerificationRequest } from '@/types'
import { authApi } from './authApi'

interface AuthStore extends AuthState {
  // Hydration state
  isHydrated: boolean

  // Core auth methods
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  
  // Password reset methods
  forgotPassword: (request: PasswordResetRequest) => Promise<void>
  resetPassword: (request: PasswordResetConfirm) => Promise<void>
  
  // Email verification methods
  verifyEmail: (request: EmailVerificationRequest) => Promise<void>
  resendVerification: (request: ResendVerificationRequest) => Promise<void>
  
  // Token management
  refreshTokens: () => Promise<void>
  
  // Utility methods
  updateUser: (user: Partial<User>) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  clearPasswordResetError: () => void
  clearEmailVerificationError: () => void
  clearPasswordResetSuccess: () => void
  clearEmailVerificationSuccess: () => void
  
  // Check if email needs verification
  needsEmailVerification: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isHydrated: false,
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Password reset state
      isPasswordResetLoading: false,
      passwordResetSuccess: false,
      passwordResetError: null,
      
      // Email verification state
      isEmailVerificationLoading: false,
      emailVerificationSuccess: false,
      emailVerificationError: null,
      isEmailVerified: false,
      
      // Token refresh state
      isTokenRefreshing: false,
      tokenRefreshError: null,

      // Core authentication methods
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null })
          
          const { user, tokens } = await authApi.login(credentials)
          
          set({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isEmailVerified: user.isEmailVerified,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true, error: null })
          
          const { user, tokens } = await authApi.register(data)
          
          set({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isEmailVerified: user.isEmailVerified,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          })
          throw error
        }
      },

      logout: async () => {
        console.log('[DEBUG] Logout called')
        try {
          await authApi.logout()
        } catch (error) {
          console.warn('Logout API call failed:', error)
        } finally {
          console.log('[DEBUG] Clearing auth state')
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isEmailVerified: false,
            error: null,
            isLoading: false,
            isPasswordResetLoading: false,
            passwordResetSuccess: false,
            passwordResetError: null,
            isEmailVerificationLoading: false,
            emailVerificationSuccess: false,
            emailVerificationError: null,
            isTokenRefreshing: false,
            tokenRefreshError: null,
          })
        }
      },

      // Password reset methods
      forgotPassword: async (request: PasswordResetRequest) => {
        try {
          set({ 
            isPasswordResetLoading: true, 
            passwordResetError: null, 
            passwordResetSuccess: false 
          })
          
          await authApi.forgotPassword(request.email)
          
          set({
            isPasswordResetLoading: false,
            passwordResetSuccess: true,
            passwordResetError: null,
          })
        } catch (error) {
          set({
            isPasswordResetLoading: false,
            passwordResetError: error instanceof Error ? error.message : 'Password reset request failed',
            passwordResetSuccess: false,
          })
          throw error
        }
      },

      resetPassword: async (request: PasswordResetConfirm) => {
        try {
          set({ 
            isPasswordResetLoading: true, 
            passwordResetError: null, 
            passwordResetSuccess: false 
          })
          
          await authApi.resetPassword(request.token, request.newPassword)
          
          set({
            isPasswordResetLoading: false,
            passwordResetSuccess: true,
            passwordResetError: null,
          })
        } catch (error) {
          set({
            isPasswordResetLoading: false,
            passwordResetError: error instanceof Error ? error.message : 'Password reset failed',
            passwordResetSuccess: false,
          })
          throw error
        }
      },

      // Email verification methods
      verifyEmail: async (request: EmailVerificationRequest) => {
        try {
          set({ 
            isEmailVerificationLoading: true, 
            emailVerificationError: null, 
            emailVerificationSuccess: false 
          })
          
          await authApi.verifyEmail(request.token)
          
          // Update user verification status
          const { user } = get()
          if (user) {
            set({
              user: { ...user, isEmailVerified: true },
              isEmailVerified: true,
            })
          }
          
          set({
            isEmailVerificationLoading: false,
            emailVerificationSuccess: true,
            emailVerificationError: null,
          })
        } catch (error) {
          set({
            isEmailVerificationLoading: false,
            emailVerificationError: error instanceof Error ? error.message : 'Email verification failed',
            emailVerificationSuccess: false,
          })
          throw error
        }
      },

      resendVerification: async (request: ResendVerificationRequest) => {
        try {
          set({ 
            isEmailVerificationLoading: true, 
            emailVerificationError: null, 
            emailVerificationSuccess: false 
          })
          
          await authApi.resendVerification(request.email)
          
          set({
            isEmailVerificationLoading: false,
            emailVerificationSuccess: true,
            emailVerificationError: null,
          })
        } catch (error) {
          set({
            isEmailVerificationLoading: false,
            emailVerificationError: error instanceof Error ? error.message : 'Failed to resend verification email',
            emailVerificationSuccess: false,
          })
          throw error
        }
      },

      // Token refresh method
       refreshTokens: async () => {
        const { refreshToken } = get()
        if (!refreshToken) {
          throw new Error('No token available to refresh')
        }

        try {
          set({ isTokenRefreshing: true, tokenRefreshError: null })
          
          const { tokens, user } = await authApi.refreshToken(refreshToken)
          
          set({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isEmailVerified: user?.isEmailVerified ?? false,
            isTokenRefreshing: false,
            tokenRefreshError: null,
          })
        } catch (error) {
          set({
            isTokenRefreshing: false,
            tokenRefreshError: error instanceof Error ? error.message : 'Token refresh failed',
          })
          
          // If token refresh fails, log out the user
          get().logout()
          throw error
        }
      },

      // Utility methods
      updateUser: (updates: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...updates },
            isEmailVerified: updates.isEmailVerified ?? user.isEmailVerified,
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      clearPasswordResetError: () => {
        set({ passwordResetError: null })
      },

      clearEmailVerificationError: () => {
        set({ emailVerificationError: null })
      },

      clearPasswordResetSuccess: () => {
        set({ passwordResetSuccess: false })
      },

      clearEmailVerificationSuccess: () => {
        set({ emailVerificationSuccess: false })
      },

      needsEmailVerification: () => {
        const { user, isEmailVerified } = get()
        return user ? !isEmailVerified : false
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isEmailVerified: state.isEmailVerified,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('[DEBUG] Auth store rehydrating:', { hasState: !!state, hasToken: !!(state?.token), isAuthenticated: state?.isAuthenticated })
        if (state) {
          state.isHydrated = true
        }
        console.log('[DEBUG] Auth store hydrated:', { isHydrated: true, hasToken: !!(state?.token) })
      },
    }
  )
)
