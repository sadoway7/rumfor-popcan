import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireEmailVerification?: boolean
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/login',
  requireEmailVerification = true 
}: ProtectedRouteProps) {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    isEmailVerified,
    isTokenRefreshing 
  } = useAuthStore()
  const location = useLocation()

  if (isLoading || isTokenRefreshing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Check email verification requirement
  if (requireEmailVerification && !isEmailVerified) {
    return (
      <Navigate 
        to={`/auth/verify-email${location.search}`} 
        state={{ from: location }} 
        replace 
      />
    )
  }

  return <>{children}</>
}