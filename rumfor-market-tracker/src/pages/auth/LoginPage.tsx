import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Alert, Spinner } from '@/components/ui'
import { Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = React.useState(false)

  const [rememberMe, setRememberMe] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError()
      await login({ ...data, rememberMe })
      navigate('/')
    } catch (error) {
      // Error is handled by the auth store
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-start justify-center md:p-4">
      <div className="w-full md:max-w-md md:rounded-xl md:shadow-lg">
        <Card className="md:border rounded-none md:rounded-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert
                variant="destructive"
                className="mb-6"
                title="Sign In Failed"
                description={error}
              />
            )}

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              {/* Google Button */}
              <button
                type="button"
                className="w-full relative bg-white border border-gray-300 rounded-lg px-4 py-2.5 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                <span className="absolute top-1 right-2 text-xs bg-amber-400 text-black font-bold px-1.5 py-0.5 rounded">COMING SOON</span>
              </button>
              
              {/* Facebook Button */}
              <button
                type="button"
                className="w-full relative bg-[#1877F2] border border-[#1877F2] rounded-lg px-4 py-2.5 flex items-center justify-center gap-3 hover:bg-[#166fe5] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium text-white">Continue with Facebook</span>
                <span className="absolute top-1 right-2 text-xs bg-amber-400 text-black font-bold px-1.5 py-0.5 rounded">COMING SOON</span>
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <Link 
                  to="/auth/forgot-password" 
                  className="text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  to="/auth/register" 
                  className="text-accent hover:text-accent/80 transition-colors font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}