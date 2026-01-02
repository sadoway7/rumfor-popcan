import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams } from 'react-router-dom'
import { useEmailVerification } from '@/features/auth/hooks/useEmailVerification'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Alert, Spinner } from '@/components/ui'
import { ArrowLeft, Mail, CheckCircle, XCircle } from 'lucide-react'

const verificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

type VerificationFormData = z.infer<typeof verificationSchema>

export function EmailVerificationPage() {
  const {
    isVerifying,
    error,
    success,
    verifyEmail,
    resendVerificationEmail,
    clearErrors,
    clearSuccess,
    resetState,
    isEmailVerified,
    userEmail,
  } = useEmailVerification()

  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token')
  const [email, setEmail] = React.useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      token: tokenFromUrl || '',
    },
  })

  React.useEffect(() => {
    // Auto-verify if token is present in URL
    if (tokenFromUrl) {
      handleVerifyToken(tokenFromUrl)
    }
  }, [tokenFromUrl])

  React.useEffect(() => {
    // Clear state on unmount
    return () => {
      resetState()
    }
  }, [resetState])

  const handleVerifyToken = async (token: string) => {
    clearErrors()
    clearSuccess()
    
    const result = await verifyEmail(token)
    
    if (!result.success) {
      console.error('Email verification failed:', result.error)
    }
  }

  const onSubmit = async (data: VerificationFormData) => {
    await handleVerifyToken(data.token)
  }

  const handleResendVerification = async () => {
    if (!email) {
      return
    }

    clearErrors()
    clearSuccess()
    
    const result = await resendVerificationEmail(email)
    
    if (!result.success) {
      console.error('Resend verification failed:', result.error)
    }
  }

  // If already verified, show success state
  if (isEmailVerified && success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
              <CardDescription>
                Your email address has been successfully verified
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert variant="success" title="Verification Complete">
                <p>
                  Your email address <strong>{userEmail}</strong> has been verified successfully. 
                  You can now access all features of your account.
                </p>
              </Alert>

              <div className="text-center space-y-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
                >
                  Go to Dashboard
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

  // If verification is in progress
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <Spinner className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Verifying Email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  // If verification failed
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
              <CardDescription>
                There was a problem verifying your email address
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert variant="destructive" title="Verification Failed">
                <p>{error}</p>
              </Alert>

              <div className="space-y-4">
                {userEmail && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="resendEmail" className="text-sm font-medium text-foreground">
                        Email Address
                      </label>
                      <Input
                        id="resendEmail"
                        type="email"
                        placeholder="Enter your email address"
                        value={email || userEmail}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    
                    <Button 
                      onClick={handleResendVerification}
                      disabled={isVerifying}
                      className="w-full"
                      variant="outline"
                    >
                      {isVerifying ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" />
                          Sending...
                        </>
                      ) : (
                        'Resend Verification Email'
                      )}
                    </Button>
                  </>
                )}
                
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

  // Manual verification form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
            <CardDescription>
              Enter the verification token from your email to activate your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="token" className="text-sm font-medium text-foreground">
                  Verification Token
                </label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Enter verification token"
                  className={`${errors.token ? 'border-red-500 focus:border-red-500' : ''}`}
                  {...register('token')}
                />
                {errors.token && (
                  <p className="text-sm text-red-500">{errors.token.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              {userEmail && (
                <div className="text-sm text-muted-foreground">
                  Didn't receive the email?{' '}
                  <button
                    onClick={handleResendVerification}
                    disabled={isVerifying}
                    className="text-accent hover:text-accent/80 transition-colors font-medium"
                  >
                    Resend verification email
                  </button>
                </div>
              )}
              
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