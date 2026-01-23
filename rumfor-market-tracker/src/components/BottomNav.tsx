import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { UserRole } from '@/types'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  Store,
  FileText,
  Settings,
  HelpCircle,
  BarChart3,
  Users,
  MapPin,
  Shield,
  Home,
  Plus,
  Calendar,
  Search,
} from 'lucide-react'

interface BottomNavProps {
  role: UserRole
}

const navigationConfig = {
  visitor: [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Markets', href: '/markets', icon: Store },
    { name: 'About', href: '/about', icon: HelpCircle },
  ],
  vendor: [
    { name: 'Search', href: '/markets', icon: Search },
    { name: 'My Markets', href: '/vendor/tracked-markets', icon: MapPin },
    { name: 'Add Market', href: '/vendor/add-market', icon: Plus, isPrimary: true },
    { name: 'Calendar', href: '/vendor/calendar', icon: Calendar },
    { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
  ],
  promoter: [
    { name: 'Dashboard', href: '/promoter/dashboard', icon: LayoutDashboard },
    { name: 'Markets', href: '/promoter/markets', icon: MapPin },
    { name: 'Applications', href: '/promoter/applications', icon: FileText },
    { name: 'Analytics', href: '/promoter/analytics', icon: BarChart3 },
    { name: 'More', href: '/promoter/more', icon: Settings },
  ],
  admin: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Markets', href: '/admin/markets', icon: MapPin },
    { name: 'Moderation', href: '/admin/moderation', icon: Shield },
    { name: 'More', href: '/admin/more', icon: Settings },
  ],
}

export function BottomNav({ role }: BottomNavProps) {
  const location = useLocation()
  const navigation = (navigationConfig as any)[role] || []
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Check if on mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle scroll-based hide/show (only on mobile)
  useEffect(() => {
    if (!isMobile) return

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsHidden(true)
      } else if (currentScrollY < lastScrollY) {
        setIsHidden(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isMobile])

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-[70] bg-background/95 backdrop-blur-xl supports-[padding:max(0px)]:pb-safe-area-inset-bottom transition-transform duration-300",
      !isMobile && "hidden",
      isHidden && "translate-y-[200%]"
    )}>
      <nav className="flex justify-around items-end py-2 px-4 max-w-md mx-auto">
        {navigation.map((item: any) => {
          const isActive = location.pathname === item.href
          const isPrimary = item.isPrimary
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-all duration-200 focus-visible:outline-none active:scale-95 relative group',
                isPrimary
                  ? 'min-h-[64px] min-w-[64px]'
                  : 'min-h-[56px] min-w-[56px]',
                isActive && !isPrimary
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isPrimary ? (
                <div className={cn(
                  'h-16 w-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 -mt-8',
                  isActive ? 'bg-accent shadow-accent/30' : 'bg-accent'
                )}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
              ) : (
                <>
                  <item.icon
                    className={cn(
                      'h-6 w-6 transition-transform duration-150',
                      isActive ? 'text-accent scale-105' : 'text-muted-foreground group-hover:scale-105'
                    )}
                  />
                  <span className={cn(
                    'truncate text-[10px] mt-1',
                    isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
                  )}>{item.name}</span>
                  {/* Animated underline */}
                  <div className={cn(
                    'absolute bottom-0 h-1.5 bg-accent rounded-full transition-all duration-300 ease-out',
                    isActive ? 'w-6 opacity-100' : 'w-0 opacity-0'
                  )} />
                </>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
