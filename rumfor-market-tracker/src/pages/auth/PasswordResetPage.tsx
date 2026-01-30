import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useParams } from 'react-router-dom'
import { usePasswordReset } from '@/features/auth/hooks/usePasswordReset'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Alert, Spinner } from '@/components/ui'
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react'

const passwordResetSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters long'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type PasswordResetFormData = z.infer<typeof passwordResetSchema>

export function PasswordResetPage() {
  const { token } = useParams<{ token?: string }>()
  
  // Check if token exists
  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
              <CardDescription>
                No reset token provided
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert variant="destructive" title="Missing Token">
                <p>
                  This password reset link is missing the required token. Please check your email link or request a new password reset.
                </p>
              </Alert>

              <div className="text-center space-y-4">
                <Link
                  to="/auth/forgot-password"
                  className="inline-flex items-center text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  Request New Reset Link
                </Link>
                
                <Link
                  to="/auth/login"
                  className="inline-flex items-center text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  const {
    isConfirmingReset,
    error,
    success,
    confirmPasswordReset,
    clearErrors,
    clearSuccess,
    resetState,
  } = usePasswordReset()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Clear errors when user starts typing
  const handleInputChange = () => {
    if (error) {
      clearErrors()
    }
  }

  // Clear success state when component unmounts
  React.useEffect(() => {
    return () => {
      resetState()
    }
  }, [])

  const onSubmit = async (data: PasswordResetFormData) => {
    clearErrors()
    clearSuccess()
    
    const result = await confirmPasswordReset(token || '', data.newPassword, data.confirmPassword)
    
    if (!result.success) {
      console.error('Password reset confirmation failed:', result.error)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
              <CardDescription>
                Your password has been reset successfully
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert variant="success" title="Password Changed">
                <p>
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
              </Alert>

              <div className="text-center">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Invalid or expired token
  if (error && (error.includes('Invalid') || error.includes('expired'))) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Invalid or Expired Link</CardTitle>
              <CardDescription>
                This password reset link is no longer valid
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert variant="destructive" title="Invalid Token">
                <p>
                  {error || 'The password reset link is invalid or has expired. Please request a new password reset link.'}
                </p>
              </Alert>

              <div className="text-center space-y-4">
                <Link
                  to="/auth/forgot-password"
                  className="inline-flex items-center text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  Request New Reset Link
                </Link>
                
                <Link
                  to="/auth/login"
                  className="inline-flex items-center text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && !error.includes('Invalid') && !error.includes('expired') && (
              <Alert 
                variant="destructive" 
                className="mb-6"
                title="Reset Failed"
                description={error}
              />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    className={`pl-10 ${errors.newPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                    {...register('newPassword')}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm New Password
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    className={`pl-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                    {...register('confirmPassword')}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isConfirmingReset}
              >
                {isConfirmingReset ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Resetting password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center text-sm text-accent hover:text-accent/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
