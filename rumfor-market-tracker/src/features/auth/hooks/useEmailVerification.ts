import { useAuth } from './useAuth'
import { EmailVerificationRequest, ResendVerificationRequest } from '@/types'
import { useState } from 'react'

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
  const verifyEmail = async (token: string) => {
    if (!token) {
      return { 
        success: false, 
        error: 'Verification token is required' 
      }
    }

    setIsVerifyingEmail(true)
    try {
      const request: EmailVerificationRequest = { token }
      await auth.verifyEmail(request)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Email verification failed' 
      }
    } finally {
      setIsVerifyingEmail(false)
    }
  }

  /**
   * Resend verification email to the provided email address
   */
  const resendVerificationEmail = async (email: string) => {
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
  }

  /**
   * Check if email verification is required
   */
  const needsVerification = (): boolean => {
    return auth.needsEmailVerification()
  }

  /**
   * Check if email is already verified
   */
  const isEmailVerified = (): boolean => {
    return auth.isEmailVerified
  }

  /**
   * Clear email verification errors
   */
  const clearEmailVerificationErrors = () => {
    auth.clearEmailVerificationError()
  }

  /**
   * Clear email verification success state
   */
  const clearEmailVerificationSuccess = () => {
    auth.clearEmailVerificationSuccess()
  }

  /**
   * Check if email verification is in progress
   */
  const isVerificationInProgress = (): boolean => {
    return isVerifyingEmail || auth.isEmailVerificationLoading
  }

  /**
   * Check if resending verification is in progress
   */
  const isResendingInProgress = (): boolean => {
    return isResendingVerification || auth.isEmailVerificationLoading
  }

  /**
   * Get email verification error message
   */
  const getVerificationError = (): string | null => {
    return auth.emailVerificationError
  }

  /**
   * Check if email verification was successful
   */
  const isVerificationSuccessful = (): boolean => {
    return auth.emailVerificationSuccess
  }

  /**
   * Get user email from auth context
   */
  const getUserEmail = (): string | null => {
    return auth.user?.email || null
  }

  /**
   * Reset all email verification state
   */
  const resetEmailVerificationState = () => {
    clearEmailVerificationErrors()
    clearEmailVerificationSuccess()
    setIsVerifyingEmail(false)
    setIsResendingVerification(false)
  }

  /**
   * Check if the user can resend verification email
   * (to prevent spam, only allow resending after a delay)
   */
  const canResendVerification = (): boolean => {
    // For now, always allow resending
    // In a real app, you might want to implement rate limiting
    return !isResendingInProgress()
  }

  /**
   * Get the time remaining until resending is allowed
   * (for rate limiting implementation)
   */
  const getTimeUntilResendAllowed = (): number => {
    // This would be implemented with rate limiting logic
    // For now, always return 0
    return 0
  }

  return {
    // State
    isVerifying: isVerificationInProgress(),
    isResending: isResendingInProgress(),
    error: getVerificationError(),
    success: isVerificationSuccessful(),
    isLoading: auth.isEmailVerificationLoading,
    isEmailVerified: isEmailVerified(),
    needsVerification: needsVerification(),
    userEmail: getUserEmail(),

    // Methods
    verifyEmail,
    resendVerificationEmail,
    clearErrors: clearEmailVerificationErrors,
    clearSuccess: clearEmailVerificationSuccess,
    resetState: resetEmailVerificationState,

    // Utilities
    canResendVerification,
    getTimeUntilResendAllowed,
    isVerificationInProgress: isVerificationInProgress(),
    isResendingInProgress: isResendingInProgress(),
  }
}