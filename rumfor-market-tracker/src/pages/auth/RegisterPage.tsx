import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Alert, Spinner } from '@/components/ui'
import { Eye, EyeOff, Store, Calendar } from 'lucide-react'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['visitor', 'vendor', 'promoter', 'admin'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

const roleOptions = [
  {
    value: 'vendor',
    label: 'Vendor',
    description: 'Apply to markets and manage applications',
    icon: Store
  },
  {
    value: 'promoter',
    label: 'Promoter',
    description: 'Create and manage markets',
    icon: Calendar
  },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError()
      const { confirmPassword, agreeToTerms, ...registerData } = data
      await registerUser(registerData)
      navigate('/dashboard')
    } catch (error) {
      // Error is handled by the auth store
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4 pt-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>

          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert 
                variant="destructive" 
                className="mb-6"
                title="Registration Failed"
                description={error}
              />
            )}

            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-3 block">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = selectedRole === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue('role', option.value as any)}
                      className={`p-4 border rounded-lg text-center transition-all ${
                        isSelected
                          ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
                          : 'border-border'
                      }`}
                    >
                      <Icon className={`h-6 w-6 mx-auto mb-2 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`} />
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                    </button>
                  )
                })}
              </div>
              {errors.role && (
                <p className="text-sm text-red-500 mt-2">{errors.role.message}</p>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    id="firstName"
                    placeholder="First name"
                    className={errors.firstName ? 'border-red-500 focus:border-red-500' : ''}
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    className={errors.lastName ? 'border-red-500 focus:border-red-500' : ''}
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

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
                    placeholder="Create a password"
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

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className={`pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-start space-x-3">
                  <input 
                    type="checkbox" 
                    className="mt-1 rounded border-border"
                    {...register('agreeToTerms')}
                  />
                  <span className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <Link to="/terms" className="text-accent hover:text-accent/80 transition-colors">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-accent hover:text-accent/80 transition-colors">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-500">{errors.agreeToTerms.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to="/auth/login" 
                  className="text-accent hover:text-accent/80 transition-colors font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}