import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
import { LogOut, Search, User, MapPin, Plus, Settings, Sun, Moon, Navigation, SlidersHorizontal, Menu } from 'lucide-react'

export function Header() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { user, isAuthenticated, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { isSidebarOpen, setSidebarOpen } = useSidebarStore()
  const { setLocationModalOpen } = useLocationStore()
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  // Handle scroll-based hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down and past threshold
        setIsHidden(true)
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsHidden(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <header className={`sticky top-0 z-50 bg-background/90 backdrop-blur-xl transition-transform duration-300 ${isHidden ? "-translate-y-full" : ""}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Sidebar Toggle Group - Left side */}
          <div className="flex items-center space-x-2">

            {/* Logo */}
            <Link to="/">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center transform -rotate-3 shadow-[4px_4px_0px_0px] shadow-black/40">
                <span className="text-white font-bold text-base">R</span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Narrower */}
          <div className="flex flex-1 max-w-80 md:max-w-xl items-center mx-4 md:mx-0">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/markets?search=${encodeURIComponent(searchQuery.trim())}`)
                  }
                }}
                className={`w-full pl-10 pr-12 py-2.5 text-sm bg-surface rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface-2 transition-all duration-300 ${
                  theme === 'light' ? 'shadow' : 'shadow-lg shadow-black/30'
                }`}
              />
              {location.pathname === '/markets' && (
                <button
                  onClick={() => setSidebarOpen(!isSidebarOpen)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle filters"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Side Actions - Desktop Only */}
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
                {/* Dashboard Button - Promoters and Admins Only */}
                {user?.role !== 'vendor' && (
                  <Link to={`/${user?.role}/dashboard`}>
                    <Button variant="outline" size="sm" className="bg-surface/80 backdrop-blur-sm hover:bg-surface hover:glow-accent-sm transition-all duration-300">
                      <MapPin className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                
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
                    <button className="flex items-center justify-center cursor-pointer hover:bg-surface/80 rounded-lg transition-all duration-300 hover:glow-accent-sm">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent/30 to-accent/20 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-accent" />
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-96 bg-surface/95 backdrop-blur-xl border-0 rounded-2xl glow-accent-sm" align="end">
                    <DropdownMenuLabel className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-accent" />
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
                        <User className="h-5 w-5 mr-3 text-muted-foreground" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="h-5 w-5 mr-3 text-muted-foreground" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* Dashboard link based on role */}
                    {user?.role === 'vendor' && (
                      <DropdownMenuItem asChild>
                        <Link to="/vendor/dashboard" className="flex items-center">
                          <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'promoter' && (
                      <DropdownMenuItem asChild>
                        <Link to="/promoter/dashboard" className="flex items-center">
                          <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard" className="flex items-center">
                          <Settings className="h-5 w-5 mr-3 text-muted-foreground" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={logout}
                      className="flex items-center text-foreground focus:text-foreground"
                    >
                      <LogOut className="h-5 w-5 mr-3 text-muted-foreground" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : !isHomePage ? (
              <>
                <Link to="/auth/login" className="inline">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-surface/80 backdrop-blur-sm rounded-xl transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register" className="inline">
                  <Button size="sm" className="bg-gradient-to-r from-accent to-accent-light hover:from-accent-light hover:to-accent shadow-lg hover:glow-accent transition-all duration-300 rounded-xl">
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile Header - Logo, Search, Hamburger */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center cursor-pointer hover:bg-surface/80 rounded-lg transition-all duration-300 hover:glow-accent-sm" aria-label="Open menu">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent/30 to-accent/20 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-accent" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96 bg-surface/95 backdrop-blur-xl border-0 rounded-2xl glow-accent-sm" align="end">
                  <DropdownMenuLabel className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-accent" />
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
                  <DropdownMenuItem onClick={() => setLocationModalOpen(true)} className="flex items-center">
                    <Navigation className="h-5 w-5 mr-3 text-muted-foreground" />
                    Set Location
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleTheme} className="flex items-center">
                    {theme === 'light' ? <Moon className="h-5 w-5 mr-3 text-muted-foreground" /> : <Sun className="h-5 w-5 mr-3 text-muted-foreground" />}
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/${user?.role}/dashboard`} className="flex items-center">
                      <MapPin className="h-5 w-5 mr-3 text-accent" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'promoter' && (
                    <DropdownMenuItem asChild>
                      <Link to="/promoter/markets/create" className="flex items-center">
                        <Plus className="h-5 w-5 mr-3 text-accent" />
                        List Market
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user?.role === 'vendor' && (
                    <DropdownMenuItem asChild>
                      <Link to="/vendor/tracked-markets" className="flex items-center">
                        <MapPin className="h-5 w-5 mr-3 text-accent" />
                        My Markets
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="h-5 w-5 mr-3 text-muted-foreground" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="h-5 w-5 mr-3 text-muted-foreground" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center text-foreground focus:text-foreground">
                    <LogOut className="h-5 w-5 mr-3 text-muted-foreground" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground p-2 min-h-11 min-w-11" aria-label="Open menu">
                    <Menu className="h-6 w-6" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96 bg-surface/95 backdrop-blur-xl border-0 rounded-2xl glow-accent-sm" align="end">
                  <DropdownMenuItem onClick={() => setLocationModalOpen(true)} className="flex items-center">
                    <Navigation className="h-5 w-5 mr-3 text-muted-foreground" />
                    Set Location
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleTheme} className="flex items-center">
                    {theme === 'light' ? <Moon className="h-5 w-5 mr-3 text-muted-foreground" /> : <Sun className="h-5 w-5 mr-3 text-muted-foreground" />}
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
