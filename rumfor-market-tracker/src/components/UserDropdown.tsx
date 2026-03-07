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
  Bug,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/authStore'
import { useThemeStore } from '@/features/theme/themeStore'
import { UserAvatar } from '@/components/UserAvatar'
import { BugReportModal } from '@/components/BugReportModal'

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
  const [showBugReport, setShowBugReport] = useState(false)

  return (
    <>
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
            className={`bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25),0_6px_16px_rgba(0,0,0,0.15)] ${
              theme === 'light'
                ? 'shadow-sm shadow-black/15 shadow-[2px_2px_0px_0px] shadow-black/25 shadow-[0.5px_0.5px_0px_0px] shadow-black/40'
                : 'shadow-sm shadow-black/25 shadow-[2px_2px_0px_0px] shadow-black/40 shadow-[0.5px_0.5px_0px_0px] shadow-black/50'
            }`}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="z-[70] w-[calc(100vw-2rem)] md:w-64 bg-surface border border-surface-3 rounded-xl shadow-lg mx-4 md:mx-0"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center justify-between py-4">
          <Link
            to={user?.role === 'vendor' || user?.role === 'promoter' || user?.role === 'admin' ? `/vendors/${user?.id}` : '/profile'}
            className="flex items-center space-x-3 flex-1"
            onClick={() => setOpen(false)}
          >
            <UserAvatar
              user={user || {}}
              size="md"
              shape="circle"
              className="!w-12 !h-12"
            />
            <div>
              <div className="text-base md:text-sm font-medium text-foreground">
                {user?.firstName}
              </div>
              <div className="text-sm md:text-xs text-muted-foreground capitalize">
                {user?.role}
              </div>
            </div>
          </Link>
          <Link
            to={user?.role === 'vendor' || user?.role === 'promoter' || user?.role === 'admin' ? '/vendor/profile' : '/profile/edit'}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent hover:text-accent-foreground [&_svg]:text-muted-foreground hover:[&_svg]:!text-accent-foreground transition-colors"
            onClick={() => setOpen(false)}
          >
            <Pencil className="h-4 w-4" />
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user?.role === 'vendor' && (
          <DropdownMenuItem asChild>
            <Link
              to="/vendor/tracked-markets"
              className="flex items-center py-3 md:py-2"
            >
              <Store className="h-5 w-5 mr-3" />
              <span className="text-base md:text-sm">My Markets</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link
            to={`/${user?.role}/dashboard`}
            className="flex items-center py-3 md:py-2"
          >
            <MapPin className="h-5 w-5 mr-3" />
            <span className="text-base md:text-sm">Dashboard</span>
          </Link>
        </DropdownMenuItem>
        {user?.role === 'promoter' && (
          <DropdownMenuItem asChild>
            <Link
              to="/promoter/markets/create"
              className="flex items-center py-3 md:py-2"
            >
              <Plus className="h-5 w-5 mr-3" />
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
            <Users className="h-5 w-5 mr-3" />
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
          <Navigation className="h-5 w-5 mr-3" />
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
            <Moon className="h-5 w-5 mr-3" />
          ) : (
            <Sun className="h-5 w-5 mr-3" />
          )}
          <span className="text-base md:text-sm">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center py-3 md:py-2">
            <Settings className="h-5 w-5 md:h-5 md:w-5 mr-3" />
            <span className="text-base md:text-sm">Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setOpen(false)
            setShowBugReport(true)
          }}
          className="flex items-center py-3 md:py-2"
        >
          <Bug className="h-5 w-5 mr-3" />
          <span className="text-base md:text-sm">Report a Bug</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setOpen(false)
            logout()
          }}
          className="flex items-center py-3 md:py-2"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="text-base md:text-sm">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <BugReportModal isOpen={showBugReport} onClose={() => setShowBugReport(false)} />
  </>
  )
}

export default UserDropdown
