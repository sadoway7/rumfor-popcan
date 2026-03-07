import { useAuth } from './useAuth'
import { EmailVerificationRequest, ResendVerificationRequest } from '@/types'
import { useState, useMemo, useCallback } from 'react'

/**
 * Specialized hook for email verification functionality
 * Provides a clean interface for email verification operations
 */
export function useEmailVerification() {
  const auth = useAuth()
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)

  /**
   * Verify email with the provided token
   */
  const verifyEmail = useCallback(async (token: string, email?: string) => {
    if (!token) {
      return { 
        success: false, 
        error: 'Verification token is required' 
      }
    }

    setIsVerifyingEmail(true)
    try {
      const request: EmailVerificationRequest = { token, email }
      await auth.verifyEmail(request)
      
      // After successful verification, we should check if auth state was updated
      // The auth store should have updated isEmailVerified and set emailVerificationSuccess
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Email verification failed' 
      }
    } finally {
      setIsVerifyingEmail(false)
    }
  }, [auth])

  /**
   * Resend verification email to the provided email address
   */
  const resendVerificationEmail = useCallback(async (email: string) => {
    if (!email) {
      return { 
        success: false, 
        error: 'Email address is required' 
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { 
        success: false, 
        error: 'Please enter a valid email address' 
      }
    }

    setIsResendingVerification(true)
    try {
      const request: ResendVerificationRequest = { email }
      await auth.resendVerification(request)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to resend verification email' 
      }
    } finally {
      setIsResendingVerification(false)
    }
  }, [auth])

  /**
   * Clear email verification errors
   */
  const clearEmailVerificationErrors = useCallback(() => {
    auth.clearEmailVerificationError()
  }, [auth])

  /**
   * Clear email verification success state
   */
  const clearEmailVerificationSuccess = useCallback(() => {
    auth.clearEmailVerificationSuccess()
  }, [auth])

  /**
   * Reset all email verification state
   */
  const resetEmailVerificationState = useCallback(() => {
    clearEmailVerificationErrors()
    clearEmailVerificationSuccess()
    setIsVerifyingEmail(false)
    setIsResendingVerification(false)
  }, [clearEmailVerificationErrors, clearEmailVerificationSuccess])

  /**
   * Check if the user can resend verification email
   * (to prevent spam, only allow resending after a delay)
   */
  const canResendVerification = useCallback((): boolean => {
    // For now, always allow resending
    // In a real app, you might want to implement rate limiting
    return !(isResendingVerification || auth.isEmailVerificationLoading)
  }, [isResendingVerification, auth.isEmailVerificationLoading])

  /**
   * Get the time remaining until resending is allowed
   * (for rate limiting implementation)
   */
  const getTimeUntilResendAllowed = useCallback((): number => {
    // This would be implemented with rate limiting logic
    // For now, always return 0
    return 0
  }, [])

  // Memoize computed values to prevent unnecessary re-renders
  const isVerifying = isVerifyingEmail || auth.isEmailVerificationLoading
  const isResending = isResendingVerification || auth.isEmailVerificationLoading
  const error = auth.emailVerificationError
  const success = auth.emailVerificationSuccess
  const emailVerified = auth.isEmailVerified
  const needsEmailVerificationFlag = auth.needsEmailVerification()
  const userEmailValue = auth.user?.email || null

  return useMemo(() => ({
    // State
    isVerifying,
    isResending,
    error,
    success,
    isLoading: auth.isEmailVerificationLoading,
    isEmailVerified: emailVerified,
    needsVerification: needsEmailVerificationFlag,
    userEmail: userEmailValue,

    // Methods
    verifyEmail,
    resendVerificationEmail,
    clearErrors: clearEmailVerificationErrors,
    clearSuccess: clearEmailVerificationSuccess,
    resetState: resetEmailVerificationState,

    // Utilities
    canResendVerification,
    getTimeUntilResendAllowed,
    isVerificationInProgress: isVerifying,
    isResendingInProgress: isResending,
  }), [
    isVerifying,
    isResending,
    error,
    success,
    auth.isEmailVerificationLoading,
    emailVerified,
    needsEmailVerificationFlag,
    userEmailValue,
    verifyEmail,
    resendVerificationEmail,
    clearEmailVerificationErrors,
    clearEmailVerificationSuccess,
    resetEmailVerificationState,
    canResendVerification,
    getTimeUntilResendAllowed,
  ])
}