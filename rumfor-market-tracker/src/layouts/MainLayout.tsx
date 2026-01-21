import React from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { BottomNav } from '@/components/BottomNav'
import { useAuthStore } from '@/features/auth/authStore'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, isAuthenticated } = useAuthStore()
  const userRole = isAuthenticated && user ? user.role : 'visitor'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      <div className="hidden lg:block">
        <Footer />
      </div>
      
      {/* Mobile Bottom Navigation - Always visible */}
      <div className="lg:hidden">
        <BottomNav role={userRole} />
      </div>
    </div>
  )
}