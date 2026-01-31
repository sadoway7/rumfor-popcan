import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useParams } from 'react-router-dom'
import { usePasswordReset } from '@/features/auth/hooks/usePasswordReset'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Alert, Spinner } from '@/components/ui'
import { ArrowLeft, Lock, CheckCircle, XCircle } from 'lucide-react'

const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
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
  } = usePasswordReset()

  const tokenFromUrl = token
  
  // Debug: log token from URL
  React.useEffect(() => {
    console.log('Password Reset Page - Token from URL params:', tokenFromUrl ? tokenFromUrl.substring(0, 10) + '...' : 'NO TOKEN')
    console.log('Password Reset Page - Current URL:', window.location.href)
  }, [tokenFromUrl])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      token: tokenFromUrl || '',
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
      clearSuccess()
    }
  }, [])

  const onSubmit = async (data: PasswordResetFormData) => {
    console.log('===== onSubmit called =====')
    console.log('Form data:', {
      token: data.token ? data.token.substring(0, 10) + '...' : 'MISSING',
      hasPassword: !!data.newPassword,
      hasConfirmPassword: !!data.confirmPassword,
      passwordsMatch: data.newPassword === data.confirmPassword,
      tokenLength: data.token?.length
    })
    
    if (!data.token) {
      console.error('Token is missing!')
      return
    }
    
    clearErrors()
    
    try {
      console.log('Calling confirmPasswordReset with token length:', data.token.length)
      const result = await confirmPasswordReset(data.token, data.newPassword, data.confirmPassword)
      console.log('Password reset result:', result)
      
      if (!result.success) {
        console.error('Password reset failed:', result.error)
      }
    } catch (err) {
      console.error('Password reset error:', err)
    }
  }

  // If reset was successful
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Password Reset Successful!</CardTitle>
              <CardDescription>
                Your password has been successfully reset
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert variant="success" title="Password Updated">
                <p>
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
              </Alert>

              <div className="text-center space-y-4">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
                >
                  Go to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If reset is in progress
  if (isConfirmingReset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <Spinner className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Resetting Password</CardTitle>
              <CardDescription>
                Please wait while we reset your password...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  // If reset failed
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Reset Failed</CardTitle>
              <CardDescription>
                There was a problem resetting your password
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert variant="destructive" title="Reset Failed">
                <p>{error}</p>
              </Alert>

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  The reset link may have expired or is invalid.{' '}
                  <Link
                    to="/auth/forgot-password"
                    className="text-accent hover:text-accent/80 transition-colors font-medium"
                  >
                    Request a new password reset link
                  </Link>
                </div>
                
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

  // Password reset form
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Hidden token field - populated from URL */}
              <input type="hidden" {...register('token')} />
              
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  className={errors.newPassword ? 'border-red-500 focus:border-red-500' : ''}
                  {...register('newPassword')}
                  onChange={handleInputChange}
                />
                {errors.newPassword && (
                  <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  className={errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}
                  {...register('confirmPassword')}
                  onChange={handleInputChange}
                />
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
                    Resetting Password...
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
