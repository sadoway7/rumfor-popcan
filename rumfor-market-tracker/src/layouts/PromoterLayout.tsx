import React from 'react'
import { DashboardLayout } from './DashboardLayout'

interface PromoterLayoutProps {
  children: React.ReactNode
}

export function PromoterLayout({ children }: PromoterLayoutProps) {
  return (
    <DashboardLayout role="promoter">
      {children}
    </DashboardLayout>
  )
}