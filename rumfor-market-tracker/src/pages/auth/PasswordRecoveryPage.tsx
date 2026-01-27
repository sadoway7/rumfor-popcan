import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { usePasswordReset } from '@/features/auth/hooks/usePasswordReset'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Alert, Spinner } from '@/components/ui'
import { ArrowLeft, Mail, KeyRound } from 'lucide-react'

const passwordRecoverySchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type PasswordRecoveryFormData = z.infer<typeof passwordRecoverySchema>

export function PasswordRecoveryPage() {
  const {
    isRequestingReset,
    error,
    success,
    requestPasswordReset,
    clearErrors,
    clearSuccess,
    resetState,
  } = usePasswordReset()

  const [email, setEmail] = React.useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordRecoveryFormData>({
    resolver: zodResolver(passwordRecoverySchema),
  })

  // Remove the problematic useEffect entirely and handle error clearing differently
  // const watchedEmail = watch('email')

  // Clear errors when user starts typing (on input change)
  const handleInputChange = () => {
    if (error) {
      clearErrors()
    }
  }

  React.useEffect(() => {
    // Clear success state when component unmounts
    return () => {
      resetState()
    }
  }, [resetState])

  const onSubmit = async (data: PasswordRecoveryFormData) => {
    setEmail(data.email)
    clearErrors()
    clearSuccess()
    
    const result = await requestPasswordReset(data.email)
    
    if (!result.success) {
      // Error is already set in the hook
      console.error('Password reset request failed:', result.error)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
              <CardDescription>
                We've sent a password reset link to your email address
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert variant="success" title="Email Sent">
                <p>
                  If an account with <strong>{email}</strong> exists, 
                  you'll receive a password reset link shortly.
                </p>
              </Alert>

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => {
                      clearSuccess()
                      setEmail('')
                    }}
                    className="text-accent hover:text-accent/80 transition-colors font-medium"
                  >
                    try again
                  </button>
                </p>
                
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
              <KeyRound className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert 
                variant="destructive" 
                className="mb-6"
                title="Reset Failed"
                description={error}
              />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    {...register('email')}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isRequestingReset}
              >
                {isRequestingReset ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Sending reset link...
                  </>
                ) : (
                  'Send Reset Link'
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