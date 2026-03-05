import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserRole } from '@/types'
import { cn } from '@/utils/cn'
import { useBottomNavOverride } from '@/contexts/BottomNavContext'
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
} from 'lucide-react'

const CustomSearch = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7"/>
    <path d="M17 17l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
)

const CustomBookmark = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 3h12a2 2 0 012 2v16l-8-4-8 4V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
  </svg>
)

const CustomCalendar = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.7"/>
    <path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
)

const CustomGrid = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7"/>
    <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7"/>
    <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7"/>
    <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7"/>
  </svg>
)

interface BottomNavProps {
  role: UserRole
}

const MOBILE_LABEL_WIDTH = 72;

const navigationConfig = {
  visitor: [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Markets', href: '/markets', icon: Store },
    { name: 'About', href: '/about', icon: HelpCircle },
  ],
  vendor: [
    { name: 'Search', href: '/markets', icon: CustomSearch },
    { name: 'Tracking', href: '/vendor/tracked-markets', icon: CustomBookmark },
    { name: 'Calendar', href: '/vendor/calendar', icon: CustomCalendar },
    { name: 'Dashboard', href: '/vendor/dashboard', icon: CustomGrid },
    { name: 'Add Market', href: '/vendor/add-market', icon: Plus, isPrimary: true },
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
  const { override } = useBottomNavOverride()

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

  // Get active index based on current location
  const getActiveIndex = () => {
    for (let i = 0; i < navigation.length; i++) {
      if (location.pathname === navigation[i].href) {
        return i
      }
    }
    return -1 // Return -1 if no item is active
  }

  const activeIndex = getActiveIndex()

  return (
    <div className={cn(
      "fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[70] transition-all duration-300 supports-[padding:max(0px)]:pb-safe-area-inset-bottom flex items-center gap-4",
      !isMobile && "hidden",
      isHidden && "translate-y-[400%]"
    )}>
      <motion.nav 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: 1.1, 
          opacity: 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        role="navigation"
        aria-label="Bottom Navigation"
        className={cn(
          "bg-white dark:bg-black backdrop-blur-xl border border-surface-3 rounded-full flex items-center h-[60px] px-2 shadow-lg shadow-[0_6px_12px_rgba(0,0,0,0.15)]",
          "transition-all duration-300 ease-out",
          "will-change-transform"
        )}
      >
        {navigation.map((item: any) => {
          const Icon = item.icon
          const isActive = activeIndex === navigation.indexOf(item)
          const isPrimary = item.isPrimary
          const hasOverride = isPrimary && override?.onPrimaryClick
          const primaryColor = override?.primaryButtonColor || 'bg-amber-500 hover:bg-amber-600'
          
          const buttonContent = (
            <>
              <Icon
                size={isPrimary ? 22 : 25}
                strokeWidth={2.5}
                aria-hidden
                className="transition-colors duration-200"
              />

              {!isPrimary && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{
                    width: isActive && activeIndex >= 0 ? "auto" : "0px",
                    opacity: isActive && activeIndex >= 0 ? 1 : 0,
                    marginLeft: isActive && activeIndex >= 0 ? "8px" : "0px",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                    mass: 0.6
                  }}
                  className={cn(
                    "overflow-hidden font-medium text-xs whitespace-nowrap select-none",
                    isActive && activeIndex >= 0 ? "text-primary dark:text-primary" : "text-muted-foreground dark:text-muted-foreground",
                  )}
                  title={item.name}
                >
                  {item.name}
                </motion.span>
              )}
            </>
          )
          
          const buttonClassName = cn(
            "flex items-center justify-center rounded-full transition-colors duration-200 relative h-12 min-w-[50px]",
            isActive && activeIndex >= 0
              ? "bg-primary/10 dark:bg-primary/15 text-primary dark:text-primary"
              : isPrimary
              ? `${primaryColor} text-white shadow-[3px_3px_0px_0px] shadow-black/40`
              : "bg-transparent text-gray-400 dark:text-gray-500",
            "focus:outline-none focus-visible:ring-0",
            isPrimary ? "w-12" : "px-4",
            "-webkit-tap-highlight-color-transparent",
            "active:outline-none",
            "border-none outline-none"
          )
          
          return (
            <motion.div
              key={item.name}
              whileTap={{ scale: isPrimary ? 0.92 : 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.5 }}
              className={cn(isPrimary ? "ml-2 -mt-3 -mb-3" : "")}
            >
              {hasOverride ? (
                <button
                  onClick={override.onPrimaryClick}
                  className={buttonClassName}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  aria-label={override.primaryButtonLabel || item.name}
                >
                  {buttonContent}
                </button>
              ) : (
                <Link
                  to={item.href}
                  className={buttonClassName}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  aria-label={item.name}
                >
                  {buttonContent}
                </Link>
              )}
            </motion.div>
          )
        })}
      </motion.nav>
    </div>
  )
}