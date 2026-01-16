import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '../authStore'
import { LoginCredentials, RegisterData, PasswordResetRequest, PasswordResetConfirm, EmailVerificationRequest, ResendVerificationRequest } from '@/types'

/**
 * Main authentication hook that provides access to all authentication methods
 * and state management through the auth store.
 */
export function useAuth() {
  const {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isEmailVerified,
    isPasswordResetLoading,
    passwordResetSuccess,
    passwordResetError,
    isEmailVerificationLoading,
    emailVerificationSuccess,
    emailVerificationError,
    isTokenRefreshing,
    tokenRefreshError,
    
    // Core auth methods
    login,
    register,
    logout,
    
    // Password reset methods
    forgotPassword,
    resetPassword,
    
    // Email verification methods
    verifyEmail,
    resendVerification,
    
    // Token management
    refreshTokens,
    
    // Utility methods
    updateUser,
    clearError,
    setLoading,
    clearPasswordResetError,
    clearEmailVerificationError,
    clearPasswordResetSuccess,
    clearEmailVerificationSuccess,
    needsEmailVerification,
  } = useAuthStore()

  /**
   * Check if the current user has a specific role
   */
  const hasRole = (role: string): boolean => {
    return user?.role === role
  }

  /**
   * Check if the current user has any of the specified roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.includes(user?.role || '')
  }

  /**
   * Check if the current user is an admin
   */
  const isAdmin = (): boolean => {
    return hasRole('admin')
  }

  /**
   * Check if the current user is a promoter
   */
  const isPromoter = (): boolean => {
    return hasRole('promoter')
  }

  /**
   * Check if the current user is a vendor
   */
  const isVendor = (): boolean => {
    return hasRole('vendor')
  }

  /**
   * Check if the current user is a visitor
   */
  const isVisitor = (): boolean => {
    return hasRole('visitor')
  }

  /**
   * Get the user's full name
   */
  const getFullName = (): string => {
    if (!user) return ''
    return `${user.firstName} ${user.lastName}`.trim()
  }

  /**
   * Check if the user account is active
   */
  const isAccountActive = (): boolean => {
    return user?.isActive ?? false
  }

  /**
   * Check if the user can access the application (active and email verified if required)
   */
  const canAccessApplication = (): boolean => {
    if (!user || !isAuthenticated) return false
    if (!isAccountActive()) return false
    
    // If email verification is required, check if email is verified
    return !needsEmailVerification()
  }

  // Track token refresh interval for cleanup
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /**
   * Auto-refresh token before it expires
   */
  const startTokenRefresh = useCallback(() => {
    if (!token || !isAuthenticated) return

    // Refresh token 5 minutes before expiry (assuming 1 hour expiry)
    const refreshInterval = 55 * 60 * 1000 // 55 minutes

    // Clear any existing interval before setting up a new one
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    const intervalId = setInterval(async () => {
      try {
        await refreshTokens()
      } catch (error) {
        console.error('Token refresh failed:', error)
        stopTokenRefresh()
      }
    }, refreshInterval)

    refreshIntervalRef.current = intervalId

    // Cleanup function
    return () => stopTokenRefresh()
  }, [token, isAuthenticated, refreshTokens])

  /**
   * Stop token refresh interval
   */
  const stopTokenRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTokenRefresh()
    }
  }, [stopTokenRefresh])

  /**
   * Handle login with loading state management
   */
  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials)
    } catch (error) {
      // Error is already handled by the store
      throw error
    }
  }

  /**
   * Handle registration with loading state management
   */
  const handleRegister = async (data: RegisterData) => {
    try {
      await register(data)
    } catch (error) {
      // Error is already handled by the store
      throw error
    }
  }

  /**
   * Handle logout with cleanup
   */
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      // Even if logout fails, we should clear the local state
      console.error('Logout failed:', error)
    }
  }

  /**
   * Handle password reset request
   */
  const handleForgotPassword = async (request: PasswordResetRequest) => {
    try {
      await forgotPassword(request)
    } catch (error) {
      // Error is already handled by the store
      throw error
    }
  }

  /**
   * Handle password reset confirmation
   */
  const handleResetPassword = async (request: PasswordResetConfirm) => {
    try {
      await resetPassword(request)
    } catch (error) {
      // Error is already handled by the store
      throw error
    }
  }

  /**
   * Handle email verification
   */
  const handleVerifyEmail = async (request: EmailVerificationRequest) => {
    try {
      await verifyEmail(request)
    } catch (error) {
      // Error is already handled by the store
      throw error
    }
  }

  /**
   * Handle resend verification email
   */
  const handleResendVerification = async (request: ResendVerificationRequest) => {
    try {
      await resendVerification(request)
    } catch (error) {
      // Error is already handled by the store
      throw error
    }
  }

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isEmailVerified,
    isPasswordResetLoading,
    passwordResetSuccess,
    passwordResetError,
    isEmailVerificationLoading,
    emailVerificationSuccess,
    emailVerificationError,
    isTokenRefreshing,
    tokenRefreshError,

    // Core auth methods
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,

    // Password reset methods
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,

    // Email verification methods
    verifyEmail: handleVerifyEmail,
    resendVerification: handleResendVerification,

    // Token management
    refreshTokens,
    startTokenRefresh,
    stopTokenRefresh,

    // Utility methods
    updateUser,
    clearError,
    setLoading,
    clearPasswordResetError,
    clearEmailVerificationError,
    clearPasswordResetSuccess,
    clearEmailVerificationSuccess,
    needsEmailVerification,

    // Helper functions
    hasRole,
    hasAnyRole,
    isAdmin,
    isPromoter,
    isVendor,
    isVisitor,
    getFullName,
    isAccountActive,
    canAccessApplication,
  }
}
