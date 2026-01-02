import { Link, useLocation } from 'react-router-dom'
import { UserRole } from '@/types'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  Store,
  FileText,
  Calendar,
  CheckSquare,
  DollarSign,
  Settings,
  HelpCircle,
  BarChart3,
  Users,
  MapPin,
  Shield,
  Bell,
  LucideIcon,
} from 'lucide-react'

interface SidebarProps {
  role: UserRole
  onNavigate?: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
}

const navigationConfig: Record<UserRole, NavigationItem[]> = {
  visitor: [
    { name: 'Browse Markets', href: '/markets', icon: Store },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'About', href: '/about', icon: HelpCircle },
    { name: 'Profile', href: '/profile', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
  vendor: [
    { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Browse Markets', href: '/markets', icon: Store },
    { name: 'My Applications', href: '/vendor/applications', icon: FileText },
    { name: 'Business Planning', href: '/vendor/planning', icon: CheckSquare },
    { name: 'Todo Lists', href: '/vendor/todos', icon: CheckSquare },
    { name: 'Financial Reports', href: '/vendor/expenses', icon: DollarSign },
    { name: 'Market Calendar', href: '/vendor/calendar', icon: Calendar },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Profile', href: '/profile', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
  promoter: [
    { name: 'Dashboard', href: '/promoter/dashboard', icon: LayoutDashboard },
    { name: 'My Markets', href: '/promoter/markets', icon: MapPin },
    { name: 'Review Applications', href: '/promoter/applications', icon: FileText },
    { name: 'Manage Vendors', href: '/promoter/vendors', icon: Users },
    { name: 'Analytics', href: '/promoter/analytics', icon: BarChart3 },
    { name: 'Market Calendar', href: '/promoter/calendar', icon: Calendar },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Profile', href: '/profile', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
  admin: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Market Oversight', href: '/admin/markets', icon: MapPin },
    { name: 'Application Review', href: '/admin/applications', icon: FileText },
    { name: 'Content Moderation', href: '/admin/moderation', icon: Shield },
    { name: 'System Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
    { name: 'Help & Support', href: '/admin/support', icon: HelpCircle },
  ],
}

export function Sidebar({ role, onNavigate }: SidebarProps) {
  const location = useLocation()
  const navigation = navigationConfig[role] || []

  return (
    <div className="flex flex-col w-64 bg-surface border-r border-border">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-accent-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Role Badge */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-accent uppercase">
                {role.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-foreground capitalize">{role}</p>
            <p className="text-xs text-muted-foreground">Account Type</p>
          </div>
        </div>
      </div>
    </div>
  )
}