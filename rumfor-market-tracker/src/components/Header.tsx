import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { useThemeStore } from '@/features/theme/themeStore'
import { Button } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, X, LogOut, Search, User, MapPin, Plus, Settings, FileText, Sun, Moon } from 'lucide-react'

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const handleMenuItemClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Always Present with subtle glow */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-light rounded-2xl flex items-center justify-center shadow-lg group-hover:glow-accent-sm transition-all duration-300">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-bold text-xl text-foreground hidden sm:block group-hover:text-accent transition-colors">Rumfor</span>
            </Link>
          </div>

          {/* Search Bar - Narrower */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search markets..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface/80 rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface backdrop-blur-sm transition-all duration-300"
              />
            </div>
          </div>

          {/* Right Side Actions - Context-Aware & Purposeful */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground hover:bg-surface/80 rounded-xl transition-all duration-300"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            
            {isAuthenticated ? (
              <>
                {/* Dashboard Button - Always Visible */}
                <Link to={`/${user?.role}/dashboard`}>
                  <Button variant="outline" size="sm" className="bg-surface/80 backdrop-blur-sm hover:bg-surface hover:glow-accent-sm transition-all duration-300">
                    <MapPin className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                
                {/* Primary Action Based on Role */}
                {user?.role === 'promoter' && (
                  <Link to="/promoter/markets/create">
                    <Button size="sm" className="bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent shadow-lg hover:glow-accent transition-all duration-300">
                      <Plus className="h-4 w-4 mr-2" />
                      List Market
                    </Button>
                  </Link>
                )}
                
                {user?.role === 'vendor' && (
                  <Link to="/vendor/applications">
                    <Button variant="outline" size="sm" className="bg-surface/80 backdrop-blur-sm hover:bg-surface hover:glow-accent-sm transition-all duration-300">
                      <FileText className="h-4 w-4 mr-2" />
                      My Applications
                    </Button>
                  </Link>
                )}

                {/* User Profile Menu - Radix UI Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 p-2 hover:bg-surface/80 rounded-xl transition-all duration-300 hover:glow-accent-sm backdrop-blur-sm">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent/30 to-accent/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-accent">
                          {user?.firstName?.charAt(0)}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-surface/95 backdrop-blur-xl border-0 rounded-2xl glow-accent-sm" align="end">
                    <DropdownMenuLabel className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-accent">
                          {user?.firstName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {user?.firstName}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {user?.role}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="h-4 w-4 mr-3 text-muted-foreground" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* Dashboard link based on role */}
                    {user?.role === 'vendor' && (
                      <DropdownMenuItem asChild>
                        <Link to="/vendor/dashboard" className="flex items-center">
                          <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'promoter' && (
                      <DropdownMenuItem asChild>
                        <Link to="/promoter/dashboard" className="flex items-center">
                          <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard" className="flex items-center">
                          <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={logout}
                      className="flex items-center text-foreground focus:text-foreground"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-muted-foreground" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-surface/80 backdrop-blur-sm rounded-xl transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="sm" className="bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent shadow-lg hover:glow-accent transition-all duration-300 rounded-xl">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions - Streamlined */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Search */}
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Search className="h-4 w-4" />
            </Button>
            
            {/* Mobile menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground hover:text-foreground p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Purpose-Driven */}
        {isMenuOpen && (
          <div className="md:hidden bg-background">
            <div className="px-4 py-4 space-y-1">
              {/* Search Bar for Mobile */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input 
                    type="text" 
                    placeholder="Search markets..."
                    className="w-full pl-10 pr-4 py-3 text-sm bg-surface/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>
              
              {/* Mobile Role-specific actions */}
              {isAuthenticated ? (
                <>
                  {/* Dashboard - Always First */}
                  <Link
                    to={`/${user?.role}/dashboard`}
                    className="flex items-center px-3 py-3 text-foreground hover:bg-surface/50 rounded-lg transition-colors font-medium"
                    onClick={handleMenuItemClick}
                  >
                    <MapPin className="h-5 w-5 mr-3 text-accent" />
                    Dashboard
                  </Link>
                  
                  {user?.role === 'promoter' && (
                    <Link
                      to="/promoter/markets/create"
                      className="flex items-center px-3 py-3 text-foreground hover:bg-surface/50 rounded-lg transition-colors"
                      onClick={handleMenuItemClick}
                    >
                      <Plus className="h-5 w-5 mr-3 text-accent" />
                      List New Market
                    </Link>
                  )}
                  
                  {user?.role === 'vendor' && (
                    <Link
                      to="/vendor/applications"
                      className="flex items-center px-3 py-3 text-foreground hover:bg-surface/50 rounded-lg transition-colors"
                      onClick={handleMenuItemClick}
                    >
                      <FileText className="h-5 w-5 mr-3 text-accent" />
                      My Applications
                    </Link>
                  )}
                  
                  <div className="border-t border-muted my-3"></div>
                  
                  {/* User section */}
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {user?.firstName} {user?.lastName} • {user?.role}
                  </div>
                  
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-3 text-foreground hover:bg-surface/50 rounded-lg transition-colors"
                    onClick={handleMenuItemClick}
                  >
                    <User className="h-5 w-5 mr-3 text-muted-foreground" />
                    Profile
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center px-3 py-3 text-foreground hover:bg-surface/50 rounded-lg transition-colors"
                    onClick={handleMenuItemClick}
                  >
                    <Settings className="h-5 w-5 mr-3 text-muted-foreground" />
                    Settings
                  </Link>
                  
                  <button
                    onClick={() => {
                      logout()
                      handleMenuItemClick()
                    }}
                    className="flex items-center w-full px-3 py-3 text-foreground hover:bg-surface/50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-3 text-muted-foreground" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="block px-3 py-3 text-foreground hover:bg-surface/50 rounded-lg transition-colors"
                    onClick={handleMenuItemClick}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="block px-3 py-3 text-foreground hover:bg-surface/50 rounded-lg transition-colors font-medium"
                    onClick={handleMenuItemClick}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}