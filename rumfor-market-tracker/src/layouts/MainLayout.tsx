import React from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useAuthStore } from '@/features/auth/authStore'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pb-28 md:pb-0">
        {children}
      </main>
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  )
}