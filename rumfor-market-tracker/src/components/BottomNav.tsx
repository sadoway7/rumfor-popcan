import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Bookmark,
} from 'lucide-react'

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
    { name: 'Search', href: '/markets', icon: Search },
    { name: 'Tracking', href: '/vendor/tracked-markets', icon: Bookmark },
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
          scale: 1, 
          opacity: 1,
          width: activeIndex >= 0 ? "auto" : "auto"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        role="navigation"
        aria-label="Bottom Navigation"
        className={cn(
          "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full flex items-center h-[60px] transition-all duration-300 ease-out",
          activeIndex >= 0 ? "px-4 w-auto" : "px-2 min-w-[207px]"
        )}
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))' }}
      >
        {navigation.filter((item: any) => !item.isPrimary).map((item: any, idx: number) => {
          const Icon = item.icon
          const isActive = activeIndex === navigation.indexOf(item)
          
          return (
            <motion.div
              key={item.name}
              whileTap={{ scale: 0.97 }}
              animate={{
                width: activeIndex >= 0 ? "fit-content" : "55px",
                marginRight: activeIndex >= 0 ? "5px" : idx < navigation.filter((i: any) => !i.isPrimary).length - 1 ? "5px" : "auto"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-0 px-4 py-2 rounded-full transition-colors duration-200 relative h-12 min-w-[50px] min-h-[46px] max-h-[50px] group",
                  isActive && activeIndex >= 0
                    ? "bg-primary/10 dark:bg-primary/15 text-primary dark:text-primary gap-2"
                    : "bg-transparent text-gray-400 dark:text-gray-500 hover:bg-amber-500 hover:text-white",
                  "focus:outline-none focus-visible:ring-0"
                )}
                aria-label={item.name}
              >
              <Icon
                size={25}
                strokeWidth={2.5}
                aria-hidden
                className="transition-colors duration-200"
              />

              {/* Animated label */}
              <motion.div
                initial={false}
                animate={{
                  width: isActive && activeIndex >= 0 ? "auto" : "0px",
                  opacity: isActive && activeIndex >= 0 ? 1 : 0,
                  marginLeft: isActive && activeIndex >= 0 ? "8px" : "0px",
                }}
                transition={{
                  width: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                  marginLeft: { duration: 0.2 },
                }}
                className={cn("overflow-hidden flex items-center")}
              >
                <span
                  className={cn(
                    "font-medium text-sm whitespace-nowrap select-none transition-colors duration-200",
                    isActive && activeIndex >= 0 ? "text-primary dark:text-primary" : "text-muted-foreground dark:text-muted-foreground group-hover:text-white",
                  )}
                  title={item.name}
                >
                  {item.name}
                </span>
              </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </motion.nav>
      
      {/* Primary button (Add Market) - on the right side of navbar */}
      {navigation.filter((item: any) => item.isPrimary).map((item: any) => {
        const Icon = item.icon
        
        return (
          <motion.div
            key={item.name}
            whileTap={{ scale: 0.95 }}
            animate={{
              scale: 1,
              y: -6
            }}
            transition={{ type: "spring", stiffness: 200, damping: 40 }}
            className="-mb-9 -mt-6"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))' }}
          >
            <Link
              to={item.href}
              className={cn(
                "flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200",
                "bg-amber-500 text-white hover:bg-amber-600",
                "shadow-2xl hover:shadow-3xl",
                "focus:outline-none focus-visible:ring-0"
              )}
              aria-label={item.name}
            >
              <Icon
                size={36}
                strokeWidth={2.5}
                aria-hidden
                className="text-white"
              />
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}