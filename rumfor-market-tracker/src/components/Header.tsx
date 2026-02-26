import { useState, useEffect } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import {
  useThemeStore,
  useLocationStore,
  useSidebarStore,
} from '@/features/theme/themeStore';
import { Button } from '@/components/ui';
import { UserDropdown } from '@/components/UserDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  MapPin,
  Plus,
  Sun,
  Moon,
  Navigation,
  Menu,
  LayoutDashboard,
  Store,
  Bookmark,
  Users,
} from 'lucide-react';
import { useDebouncedCallback } from '@/utils/debounce';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { setLocationModalOpen } = useLocationStore();
  const { isSidebarOpen } = useSidebarStore();
  const isHomePage = location.pathname === '/';
  const isMarketsPage = location.pathname === '/markets';

  // Contextual placeholder based on current route
  const getSearchPlaceholder = () => {
    if (location.pathname === '/vendor/tracked-markets') {
      return 'Filter my markets...';
    }
    return 'Search markets...';
  };

  // Perform the actual search navigation
  const performSearch = (query: string) => {
    if (location.pathname === '/vendor/tracked-markets') {
      const params = new URLSearchParams(searchParams);
      if (query.trim()) {
        params.set('search', query.trim());
      } else {
        params.delete('search');
      }
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    } else if (location.pathname === '/markets') {
      const params = new URLSearchParams(searchParams);
      if (query.trim()) {
        params.set('search', query.trim());
      } else {
        params.delete('search');
      }
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    } else {
      if (query.trim()) {
        navigate(`/markets?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  // Debounced search (300ms delay)
  const { debouncedCallback: debouncedSearch, flush: flushSearch } = useDebouncedCallback(
    performSearch,
    300
  );

  // Handle input change - update state immediately, debounce the search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle Enter key - flush debounce and search immediately
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      flushSearch();
      performSearch(searchQuery);
    }
  };

  // Update search query when URL params change
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam !== searchQuery) {
      setSearchQuery(searchParam || '');
    }
  }, [searchParams]);

  // Handle scroll-based hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down and past threshold
        setIsHidden(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`sticky top-0 z-[60] bg-background/90 backdrop-blur-xl transition-transform duration-300 ${isHidden ? '-translate-y-full' : ''}`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[auto,1fr,auto] items-center h-18 md:h-16 gap-2 md:gap-4 py-2">
          {/* Logo - Left */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <div className={`w-10 h-10 bg-accent rounded-lg flex items-center justify-center transform -rotate-3 ${
              theme === 'light'
                ? 'shadow-sm shadow-black/15 shadow-[2px_2px_0px_0px] shadow-black/25 shadow-[0.5px_0.5px_0px_0px] shadow-black/40'
                : 'shadow-sm shadow-black/25 shadow-[2px_2px_0px_0px] shadow-black/40 shadow-[0.5px_0.5px_0px_0px] shadow-black/50'
            }`}>
                <span className="text-accent-foreground font-bold text-lg">
                  R
                </span>
              </div>
              <span className="hidden md:block font-bold text-lg text-foreground">RUMFOR</span>
            </Link>
          </div>

          {/* Search Bar with Location - Center */}
          <div className="hidden md:flex justify-center items-center px-4 md:px-8 gap-3">
            {/* Search Bar */}
            <div className="relative w-full max-w-xs sm:max-w-xs md:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className={`w-full pl-10 pr-10 py-[11px] text-sm bg-surface rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 ${
                  theme === 'light'
                    ? 'shadow-sm shadow-black/15 shadow-[2px_2px_0px_0px] shadow-black/25 shadow-[0.5px_0.5px_0px_0px] shadow-black/40'
                    : 'shadow-sm shadow-black/25 shadow-[2px_2px_0px_0px] shadow-black/40 shadow-[0.5px_0.5px_0px_0px] shadow-black/50'
                }`}
              />
              {isMarketsPage && (
                <button
                  onClick={() => setLocationModalOpen(true)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Set location"
                >
                  <MapPin className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Browse Markets & Vendors Buttons - Desktop Only */}
            <div className="hidden md:flex gap-1.5">
              <Link to="/markets">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 hover:bg-accent hover:text-accent-foreground text-foreground rounded-full transition-all duration-200"
                  title="Browse Markets"
                >
                  <Store className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/vendors">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 hover:bg-accent hover:text-accent-foreground text-foreground rounded-full transition-all duration-200"
                  title="Browse Vendors"
                >
                  <Users className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/vendor/add-market/vendor">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 hover:bg-accent hover:text-accent-foreground text-foreground rounded-full transition-all duration-200"
                  title="Add Market"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="md:hidden flex justify-center items-center gap-1 flex-1 min-w-0 px-2 mx-1">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className={`w-full pl-10 pr-10 py-3 md:py-[11px] text-sm bg-surface rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 ${
                  theme === 'light'
                    ? 'shadow-sm shadow-black/15 shadow-[2px_2px_0px_0px] shadow-black/25 shadow-[0.5px_0.5px_0px_0px] shadow-black/40'
                    : 'shadow-sm shadow-black/25 shadow-[2px_2px_0px_0px] shadow-black/40 shadow-[0.5px_0.5px_0px_0px] shadow-black/50'
                }`}
              />
              {isMarketsPage && (
                <button
                  onClick={() => setLocationModalOpen(true)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Set location"
                >
                  <MapPin className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Side Actions - Desktop */}
          <div className="hidden md:flex items-center justify-end space-x-3 min-w-0">



            {isAuthenticated ? (
              <>
{/* Dashboard Button - Promoters and Admins Only */}
                {user?.role !== 'vendor' && (
                  <Link to={`/${user?.role}/dashboard`}>
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-gray-100 transition-colors duration-200 rounded-full shadow-sm shadow-black/15 shadow-[2px_2px_0px_0px] shadow-black/25 shadow-[0.5px_0.5px_0px_0px] shadow-black/40"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}

{/* Primary Action Based on Role */}
                {user?.role === 'promoter' && (
                  <Link to="/promoter/markets/create">
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-gray-100 transition-colors duration-200 rounded-full shadow-sm shadow-black/15 shadow-[2px_2px_0px_0px] shadow-black/25 shadow-[0.5px_0.5px_0px_0px] shadow-black/40"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      List Market
                    </Button>
                  </Link>
                )}

                {user?.role === 'vendor' && (
                  <Link to="/vendor/tracked-markets">
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-gray-100 transition-colors duration-200 rounded-full shadow-sm shadow-black/15 shadow-[2px_2px_0px_0px] shadow-black/25 shadow-[0.5px_0.5px_0px_0px] shadow-black/40"
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      My Markets
                    </Button>
                  </Link>
                )}

{/* User Profile Menu */}
                <UserDropdown 
                  avatarSize="md" 
                  onSetLocation={() => setLocationModalOpen(true)}
                />
              </>
            ) : (
              <>
                <Link to="/auth/login" className="inline">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-surface/80 backdrop-blur-sm rounded-xl transition-all duration-300"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register" className="inline">
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white transition-colors duration-200 rounded-lg"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

{/* Mobile Header - Logo, Search, User Avatar or Hamburger */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated ? (
              <UserDropdown 
                avatarSize="md" 
                onSetLocation={() => setLocationModalOpen(true)} 
              />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="text-muted-foreground hover:text-foreground p-2 min-h-12 min-w-12"
                    aria-label="Open menu"
                  >
                    <Menu className="h-7 w-7" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 bg-surface border border-surface-3 rounded-lg shadow-lg"
                  align="end"
                >
                  <DropdownMenuItem
                    onClick={() => setLocationModalOpen(true)}
                    className="flex items-center"
                  >
                    <Navigation className="h-5 w-5 mr-3 text-muted-foreground" />
                    Set Location
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={toggleTheme}
                    className="flex items-center"
                  >
                    {theme === 'light' ? (
                      <Moon className="h-5 w-5 mr-3 text-muted-foreground" />
                    ) : (
                      <Sun className="h-5 w-5 mr-3 text-muted-foreground" />
                    )}
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
  );
}
