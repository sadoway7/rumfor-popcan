import { Link, useLocation } from 'react-router-dom'
import { UserRole } from '@/types'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  Store,
  FileText,
  CheckSquare,
  Settings,
  HelpCircle,
  BarChart3,
  Users,
  MapPin,
  Shield,
} from 'lucide-react'

interface BottomNavProps {
  role: UserRole
}

const navigationConfig = {
  visitor: [
    { name: 'Markets', href: '/markets', icon: Store },
    { name: 'About', href: '/about', icon: HelpCircle },
  ],
  vendor: [
    { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Applications', href: '/vendor/applications', icon: FileText },
    { name: 'Markets', href: '/markets', icon: Store },
    { name: 'Todos', href: '/vendor/todos', icon: CheckSquare },
    { name: 'More', href: '/vendor/more', icon: Settings },
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl supports-[padding:max(0px)]:pb-safe-area-inset-bottom">
      <nav className="flex justify-around items-center py-3 px-4 max-w-md mx-auto">
        {navigation.map((item: any) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex min-h-[56px] min-w-[56px] flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-all duration-200 focus-visible:outline-none active:scale-95',
                isActive
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-6 w-6 mb-1 transition-transform duration-150',
                  isActive ? 'text-accent scale-105' : 'text-muted-foreground'
                )}
              />
              <span className="truncate text-[10px]">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
