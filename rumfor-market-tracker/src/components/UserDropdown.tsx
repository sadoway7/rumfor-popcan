import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  User,
  Settings,
  LogOut,
  MapPin,
  Plus,
  Moon,
  Sun,
  Navigation,
  Users,
  Store,
  Pencil,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/authStore'
import { useThemeStore } from '@/features/theme/themeStore'
import { UserAvatar } from '@/components/UserAvatar'

interface UserDropdownProps {
  onSetLocation: () => void
  avatarSize?: 'sm' | 'md'
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  onSetLocation,
  avatarSize = 'md',
}) => {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity duration-200"
          aria-label="Open menu"
        >
          <UserAvatar 
            user={user || {}}
            size={avatarSize === 'sm' ? 'sm' : 'header'}
            shape="circle"
            className="bg-white shadow-sm shadow-black/15 shadow-[2px_2px_0px_0px] shadow-black/25 shadow-[0.5px_0.5px_0px_0px] shadow-black/40 md:border-2 md:border-surface-3"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[calc(100vw-2rem)] md:w-64 bg-surface border border-surface-3 rounded-xl shadow-lg mx-4 md:mx-0"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center space-x-3 py-4">
          <div className="w-12 h-12 md:w-10 md:h-10 bg-surface-2 border border-surface-3 rounded-lg flex items-center justify-center">
            <User className="h-6 w-6 md:h-5 md:w-5 text-foreground" />
          </div>
          <div>
            <div className="text-base md:text-sm font-medium text-foreground">
              {user?.firstName}
            </div>
            <div className="text-sm md:text-xs text-muted-foreground capitalize">
              {user?.role}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem className="p-0">
          <div className="flex items-center justify-between w-full py-3 md:py-2 px-2">
            <Link
              to={user?.role === 'vendor' || user?.role === 'promoter' || user?.role === 'admin' ? `/vendors/${user?.id}` : '/profile'}
              className="flex items-center flex-1"
              onClick={() => setOpen(false)}
            >
              <User className="h-5 w-5 md:h-5 md:w-5 mr-3 text-muted-foreground" />
              <span className="text-base md:text-sm">View Profile</span>
            </Link>
            <Link
              to={user?.role === 'vendor' || user?.role === 'promoter' || user?.role === 'admin' ? '/vendor/profile' : '/profile/edit'}
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-surface-3 transition-colors"
              onClick={() => setOpen(false)}
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center py-3 md:py-2">
            <Settings className="h-5 w-5 md:h-5 md:w-5 mr-3 text-muted-foreground" />
            <span className="text-base md:text-sm">Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user?.role === 'vendor' && (
          <DropdownMenuItem asChild>
            <Link
              to="/vendor/tracked-markets"
              className="flex items-center py-3 md:py-2"
            >
              <Store className="h-5 w-5 mr-3 text-amber-500" />
              <span className="text-base md:text-sm">My Markets</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link
            to={`/${user?.role}/dashboard`}
            className="flex items-center py-3 md:py-2"
          >
            <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
            <span className="text-base md:text-sm">Dashboard</span>
          </Link>
        </DropdownMenuItem>
        {user?.role === 'promoter' && (
          <DropdownMenuItem asChild>
            <Link
              to="/promoter/markets/create"
              className="flex items-center py-3 md:py-2"
            >
              <Plus className="h-5 w-5 mr-3 text-amber-500" />
              <span className="text-base md:text-sm">Add Market</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to="/vendors"
            className="flex items-center py-3 md:py-2"
          >
            <Users className="h-5 w-5 mr-3 text-muted-foreground" />
            <span className="text-base md:text-sm">Browse Vendors</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setOpen(false)
            onSetLocation()
          }}
          className="flex items-center py-3 md:py-2"
        >
          <Navigation className="h-5 w-5 mr-3 text-muted-foreground" />
          <span className="text-base md:text-sm">Set Location</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setOpen(false)
            toggleTheme()
          }}
          className="flex items-center py-3 md:py-2"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 mr-3 text-muted-foreground" />
          ) : (
            <Sun className="h-5 w-5 mr-3 text-muted-foreground" />
          )}
          <span className="text-base md:text-sm">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setOpen(false)
            logout()
          }}
          className="flex items-center py-3 md:py-2 text-foreground focus:text-foreground"
        >
          <LogOut className="h-5 w-5 mr-3 text-muted-foreground" />
          <span className="text-base md:text-sm">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserDropdown
