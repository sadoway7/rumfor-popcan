import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { UserRole } from '@/types'

interface RoleRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallbackRedirect?: string
}

export function RoleRoute({ 
  children, 
  allowedRoles, 
  fallbackRedirect = '/unauthorized' 
}: RoleRouteProps) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackRedirect} replace />
  }

  return <>{children}</>
}