import { Link, useLocation } from 'react-router-dom'
import { UserRole } from '@/types'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  Store,
  FileText,
  Calendar,
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
    { name: 'Events', href: '/events', icon: Calendar },
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border">
      <nav className="flex justify-around items-center py-2 px-4">
        {navigation.map((item: any) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 mb-1',
                  isActive ? 'text-accent' : 'text-muted-foreground'
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}