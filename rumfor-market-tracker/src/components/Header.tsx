
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { useThemeStore, useSidebarStore, useLocationStore } from '@/features/theme/themeStore'
import { Button } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, LogOut, Search, User, MapPin, Plus, Settings, Sun, Moon, Navigation, MoreHorizontal } from 'lucide-react'

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { toggleSidebar } = useSidebarStore()
  const { setLocationModalOpen } = useLocationStore()
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const isMarketsPage = location.pathname === '/markets'
  const showSidebarToggle = isHomePage || isMarketsPage

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Sidebar Toggle Group - Left side */}
          <div className="flex items-center">
            {/* Sidebar Toggle - On Homepage and Markets Page */}
            {showSidebarToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="text-muted-foreground hover:text-foreground hover:bg-surface/80 rounded-xl transition-all duration-300"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}



          </div>

          {/* Search Bar - Narrower */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search markets..."
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-surface rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface-2 transition-all duration-300 ${
                  theme === 'light' ? 'shadow' : 'shadow-lg shadow-black/30'
                }`}
              />
            </div>
          </div>

          {/* Right Side Actions - Context-Aware & Purposeful */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Location Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocationModalOpen(true)}
              className="text-muted-foreground hover:text-foreground hover:bg-surface/80 rounded-xl transition-all duration-300"
              title="Set location"
            >
              <Navigation className="h-4 w-4" />
            </Button>

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
                  <Link to="/vendor/tracked-markets">
                    <Button variant="outline" size="sm" className="bg-surface/80 backdrop-blur-sm hover:bg-surface hover:glow-accent-sm transition-all duration-300">
                      <MapPin className="h-4 w-4 mr-2" />
                      My Markets
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

            {/* Logo */}
            <Link to="/" className="ml-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
            </Link>
          </div>

          {/* Mobile Actions - Streamlined */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Location Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocationModalOpen(true)}
              className="text-muted-foreground hover:text-foreground hover:bg-surface/80 rounded-xl transition-all duration-300 min-h-11 min-w-11"
              title="Set location"
            >
              <Navigation className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground hover:bg-surface/80 rounded-xl transition-all duration-300 min-h-11 min-w-11"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Mobile menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground p-2 min-h-11 min-w-11" aria-label="Open menu">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-surface/95 backdrop-blur-xl border-0 rounded-2xl glow-accent-sm" align="end">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to={`/${user?.role}/dashboard`} className="flex items-center">
                        <MapPin className="h-4 w-4 mr-3 text-accent" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'promoter' && (
                      <DropdownMenuItem asChild>
                        <Link to="/promoter/markets/create" className="flex items-center">
                          <Plus className="h-4 w-4 mr-3 text-accent" />
                          List Market
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'vendor' && (
                      <DropdownMenuItem asChild>
                        <Link to="/vendor/tracked-markets" className="flex items-center">
                          <MapPin className="h-4 w-4 mr-3 text-accent" />
                          My Markets
                        </Link>
                      </DropdownMenuItem>
                    )}
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
                    <DropdownMenuItem onClick={logout} className="flex items-center text-foreground focus:text-foreground">
                      <LogOut className="h-4 w-4 mr-3 text-muted-foreground" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/auth/login" className="flex items-center">
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/auth/register" className="flex items-center">
                        Sign Up
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logo */}
            <Link to="/" className="ml-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
            </Link>
          </div>
        </div>


      </div>
    </header>
  )
}