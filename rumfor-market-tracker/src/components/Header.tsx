import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { useThemeStore, useLocationStore, useSidebarStore } from '@/features/theme/themeStore'
import { Button } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Search, User, MapPin, Plus, Settings, Sun, Moon, Navigation, Menu, SlidersHorizontal, LayoutDashboard, Store, Bookmark } from 'lucide-react'

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { user, isAuthenticated, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { setLocationModalOpen } = useLocationStore()
  const { isSidebarOpen } = useSidebarStore()
  const isHomePage = location.pathname === '/'
  const isMarketsPage = location.pathname === '/markets'

  // Contextual placeholder based on current route
  const getSearchPlaceholder = () => {
    if (location.pathname === '/vendor/tracked-markets') {
      return 'Filter my markets...'
    }
    return 'Search markets...'
  }

  // Contextual search action based on current route
  const handleSearch = (query: string) => {
    if (location.pathname === '/vendor/tracked-markets') {
      // Update URL params for vendor markets page
      const params = new URLSearchParams(searchParams)
      if (query.trim()) {
        params.set('search', query.trim())
      } else {
        params.delete('search')
      }
      navigate(`${location.pathname}?${params.toString()}`, { replace: true })
    } else {
      // Navigate to markets search page
      if (query.trim()) {
        navigate(`/markets?search=${encodeURIComponent(query.trim())}`)
      } else if (location.pathname === '/markets') {
        // Already on markets page, remove search param to show all results
        navigate('/markets', { replace: true })
      }
    }
  }

  // Update search query when URL params change
  useEffect(() => {
    const searchParam = searchParams.get('search')
    if (searchParam !== searchQuery) {
      setSearchQuery(searchParam || '')
    }
  }, [searchParams])

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
    <header className={`sticky top-0 z-[60] bg-background/90 backdrop-blur-xl transition-transform duration-300 ${isHidden ? "-translate-y-full" : ""}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[auto,1fr,auto] items-center h-16 gap-4">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link to="/">
              <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center transform -rotate-3 shadow-[3px_3px_0px_0px] shadow-black/40">
                <span className="text-accent-foreground font-bold text-base">R</span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Center */}
          <div className="flex justify-center px-4 md:px-8">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleSearch(e.target.value)
                }}
                className={`w-full pl-10 ${isMarketsPage ? 'pr-10' : 'pr-4'} py-[11px] text-sm bg-surface rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 ${
                  theme === 'light' ? 'shadow-sm shadow-black/15 shadow-[2px_2px_0px_0px] shadow-black/25 shadow-[0.5px_0.5px_0px_0px] shadow-black/40' : 'shadow-sm shadow-black/25 shadow-[2px_2px_0px_0px] shadow-black/40 shadow-[0.5px_0.5px_0px_0px] shadow-black/50'
                }`}
              />
              {isMarketsPage && (
                <button
                  onClick={() => useSidebarStore.getState().setSidebarOpen(!isSidebarOpen)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Toggle advanced search"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Side Actions - Desktop */}
          <div className="hidden md:flex items-center justify-end space-x-3 min-w-0">
            {/* Location Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocationModalOpen(true)}
              className="text-muted-foreground hover:text-foreground hover:bg-surface/80 rounded-xl transition-all duration-300"
              title="Set location"
            >
              <MapPin className="h-4 w-4" />
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
                    <Button variant="outline" size="sm" className="bg-surface border-surface-3 hover:bg-surface-2 transition-colors duration-200">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                
                {/* Primary Action Based on Role */}
                {user?.role === 'promoter' && (
                  <Link to="/promoter/markets/create">
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white transition-colors duration-200">
                      <Plus className="h-4 w-4 mr-2" />
                      List Market
                    </Button>
                  </Link>
                )}

                {user?.role === 'vendor' && (
                  <Link to="/vendor/tracked-markets">
                    <Button variant="outline" size="sm" className="bg-surface border-surface-3 hover:bg-surface-2 transition-colors duration-200">
                      <Store className="h-4 w-4 mr-2" />
                      My Markets
                    </Button>
                  </Link>
                )}

                {/* User Profile Menu - Radix UI Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center cursor-pointer hover:bg-surface-2 rounded-lg transition-colors duration-200">
                      <div className="w-10 h-10 bg-surface-2 border border-surface-3 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-foreground" />
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-surface border border-surface-3 rounded-lg shadow-lg" align="end">
                    <DropdownMenuLabel className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-surface-2 border border-surface-3 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-foreground" />
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
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white transition-colors duration-200 rounded-lg">
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile Header - Logo, Search, User Avatar or Hamburger */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center cursor-pointer hover:bg-surface-2 rounded-full transition-colors duration-200" aria-label="Open menu">
                    <div className="w-10 h-10 bg-amber-500 flex items-center justify-center rounded-full shadow-[1px_1px_0px_0px] shadow-black/20">
                      <span className="text-white font-bold text-sm">{user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || 'U'}</span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-surface border border-surface-3 rounded-lg shadow-lg" align="end">
                  <DropdownMenuLabel className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-surface-2 border border-surface-3 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-foreground" />
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
                      <MapPin className="h-5 w-5 mr-3 text-amber-500" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'promoter' && (
                    <DropdownMenuItem asChild>
                      <Link to="/promoter/markets/create" className="flex items-center">
                        <Plus className="h-5 w-5 mr-3 text-amber-500" />
                        List Market
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user?.role === 'vendor' && (
                    <DropdownMenuItem asChild>
                      <Link to="/vendor/tracked-markets" className="flex items-center">
                        <MapPin className="h-5 w-5 mr-3 text-amber-500" />
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
                <DropdownMenuContent className="w-48 bg-surface border border-surface-3 rounded-lg shadow-lg" align="end">
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
