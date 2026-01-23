import React from 'react'
import { Link } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center transform -rotate-3 shadow-[4px_4px_0px_0px] shadow-black/40">
              <span className="text-accent-foreground font-bold text-lg">R</span>
            </div>
            <span className="font-bold text-2xl text-foreground">Rumfor</span>
          </Link>
        </div>
        
        {children}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav role="visitor" />
    </div>
  )
}