import { useAuth } from './useAuth'
import { PasswordResetRequest, PasswordResetConfirm } from '@/types'
import { useState } from 'react'

/**
 * Specialized hook for password reset functionality
 * Provides a clean interface for password reset operations
 */
export function usePasswordReset() {
  const auth = useAuth()
  const [isRequestingReset, setIsRequestingReset] = useState(false)
  const [isConfirmingReset, setIsConfirmingReset] = useState(false)

  /**
   * Request a password reset for the given email
   */
  const requestPasswordReset = async (email: string) => {
    setIsRequestingReset(true)
    try {
      const request: PasswordResetRequest = { email }
      await auth.forgotPassword(request)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password reset request failed' 
      }
    } finally {
      setIsRequestingReset(false)
    }
  }

  /**
   * Confirm password reset with token and new password
   */
  const confirmPasswordReset = async (token: string, newPassword: string, confirmPassword: string) => {
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return { 
        success: false, 
        error: 'Passwords do not match' 
      }
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return { 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      }
    }

    setIsConfirmingReset(true)
    try {
      const request: PasswordResetConfirm = { 
        token, 
        newPassword, 
        confirmPassword 
      }
      await auth.resetPassword(request)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password reset failed' 
      }
    } finally {
      setIsConfirmingReset(false)
    }
  }

  /**
   * Clear any password reset errors
   */
  const clearPasswordResetErrors = () => {
    auth.clearPasswordResetError()
  }

  /**
   * Clear password reset success state
   */
  const clearPasswordResetSuccess = () => {
    auth.clearPasswordResetSuccess()
  }

  /**
   * Check if password reset request is in progress
   */
  const isResetRequestInProgress = (): boolean => {
    return isRequestingReset || auth.isPasswordResetLoading
  }

  /**
   * Check if password reset confirmation is in progress
   */
  const isResetConfirmationInProgress = (): boolean => {
    return isConfirmingReset || auth.isPasswordResetLoading
  }

  /**
   * Get password reset error message
   */
  const getPasswordResetError = (): string | null => {
    return auth.passwordResetError
  }

  /**
   * Check if password reset was successful
   */
  const isPasswordResetSuccessful = (): boolean => {
    return auth.passwordResetSuccess
  }

  /**
   * Reset all password reset state
   */
  const resetPasswordResetState = () => {
    clearPasswordResetErrors()
    clearPasswordResetSuccess()
    setIsRequestingReset(false)
    setIsConfirmingReset(false)
  }

  return {
    // State
    isRequestingReset: isResetRequestInProgress(),
    isConfirmingReset: isResetConfirmationInProgress(),
    error: getPasswordResetError(),
    success: isPasswordResetSuccessful(),
    isLoading: auth.isPasswordResetLoading,

    // Methods
    requestPasswordReset,
    confirmPasswordReset,
    clearErrors: clearPasswordResetErrors,
    clearSuccess: clearPasswordResetSuccess,
    resetState: resetPasswordResetState,

    // Utilities
    isResetInProgress: isResetRequestInProgress() || isResetConfirmationInProgress(),
  }
}