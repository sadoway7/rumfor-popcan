import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/features/auth/authStore'
import { useSidebarStore, useThemeStore } from '@/features/theme/themeStore'
import { MarketGrid } from '@/components/MarketGrid'
import { SubHeader } from '@/components/SubHeader'
import { marketsApi } from '@/features/markets/marketsApi'
import { Users, Leaf, Palette, ShoppingBag, UtensilsCrossed, Gift, Hammer, X, Moon, MapPin, Archive } from 'lucide-react'

// Market categories for browsing - matching example layout
const marketCategories = [
  { name: 'Farmers Markets', icon: Leaf },
  { name: 'Arts & Crafts', icon: Palette },
  { name: 'Flea Markets', icon: ShoppingBag },
  { name: 'Food Festivals', icon: UtensilsCrossed },
  { name: 'Vintage & Antique', icon: Archive },
  { name: 'Craft Shows', icon: Hammer },
  { name: 'Night Markets', icon: Moon },
  { name: 'Street Fairs', icon: MapPin },
  { name: 'Holiday Markets', icon: Gift },
  { name: 'Community Events', icon: Users }
]

export function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const { theme } = useThemeStore()
  const { isSidebarOpen } = useSidebarStore()

  // Fetch featured markets for homepage
  const { data: featuredMarkets, isLoading: marketsLoading } = useQuery({
    queryKey: ['markets', 'featured'],
    queryFn: () => marketsApi.getMarkets({}, 1, 12),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Close sidebar by default on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      useSidebarStore.getState().setSidebarOpen(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background md:flex">


        {/* Mobile Fullscreen Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:relative md:inset-auto md:flex-shrink-0 md:w-80 bg-surface">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-end p-4 pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => useSidebarStore.getState().toggleSidebar()}
                  className="text-muted-foreground hover:text-foreground md:hidden"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto pt-0 pb-6 px-6">

            {/* Call-to-Action Buttons - Top of sidebar */}
            {!isAuthenticated && (
              <div className={`bg-surface-2 rounded-lg p-3 space-y-2 mb-4 border ${theme === 'light' ? 'shadow-sm' : 'shadow-md shadow-black/10'}`}>
                <div className="text-xs text-muted-foreground/80 text-center">
                  Sign up to manage your markets
                </div>
                <div className="space-y-1.5">
                  <Link to="/auth/register" className="block">
                    <div className="bg-accent rounded px-2.5 py-1.5 transition-colors hover:bg-accent/90">
                      <div className="text-white font-medium text-xs text-center">I'm a Vendor</div>
                    </div>
                  </Link>
                  <Link to="/auth/register" className="block">
                    <div className="bg-accent/80 rounded px-2.5 py-1.5 transition-colors hover:bg-accent/70">
                      <div className="text-white font-medium text-xs text-center">I Organize Events</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {/* Browse by Category */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Browse by Category</h2>
              <div className="grid grid-cols-3 gap-2">
                {marketCategories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.name}
                      className="w-full aspect-square flex flex-col items-center justify-center p-2 rounded-lg bg-accent/5 hover:bg-accent/10 dark:bg-accent/10 dark:hover:bg-accent/20 transition-all duration-200 group"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground group-hover:text-accent mb-1 transition-colors" />
                      <div className="font-medium text-foreground text-xs text-center leading-tight mb-1">{cat.name}</div>

                    </button>
                  )
                })}
              </div>

              <Link to="/markets" className="block mt-4">
                <div className="w-full py-2 px-3 rounded-lg bg-accent/10 hover:bg-accent/20 dark:bg-accent/20 dark:hover:bg-accent/30 transition-colors text-center">
                  <div className="text-accent font-medium text-sm">See All Categories</div>
                </div>
              </Link>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {[
                  { user: 'Sarah M.', action: 'commented on', market: 'Downtown Farmers Market', time: '2h ago' },
                  { user: 'Mike R.', action: 'started following', market: 'Artisan Craft Fair', time: '4h ago' },
                  { user: 'Lisa J.', action: 'left review on', market: 'Community Food Festival', time: '6h ago' },
                  { user: 'John D.', action: 'commented on', market: 'Weekend Flea Market', time: '8h ago' },
                  { user: 'Emma W.', action: 'started following', market: 'Holiday Art Market', time: '10h ago' }
                ].map((activity, idx) => (
                  <div key={idx} className="p-3 rounded bg-surface hover:bg-surface-2 transition-colors">
                    <p className="text-sm text-foreground">
                      <strong>{activity.user}</strong> {activity.action}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{activity.market}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                ))}
              </div>
            </div>
               </div>
             </div>
           </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6 space-y-6">
            {/* Sub-header - Only for authenticated users */}
            {isAuthenticated && <SubHeader />}

            {/* Hero Section */}
            <div className="w-full">
              <Link to="/markets" className="block">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground hover:text-accent transition-colors">
                  Rumfor - Track and discover markets
                </h1>
              </Link>
            </div>

            {/* Happening This Week */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Happening This Week</h2>
                <Link to="/markets">
                  <Button variant="ghost" size="sm" className="text-accent">
                    See All
                  </Button>
                </Link>
              </div>

              <MarketGrid
                markets={featuredMarkets?.data || []}
                isLoading={marketsLoading}
                variant="grid"
                className=""
              />
            </section>

            {/* Trending Vendors */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Trending Vendors</h2>
                <Link to="/vendors">
                  <Button variant="ghost" size="sm" className="text-accent">
                    See All
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 10 }, (_, id) => (
                  <div key={id} className="rounded-lg p-4 text-center bg-surface hover:bg-surface-2 transition-colors">
                    <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3 text-foreground">
                      VN
                    </div>
                    <h3 className="font-medium text-foreground text-sm mb-1 truncate">Vendor Name</h3>
                    <p className="text-xs text-muted-foreground">+23 this week</p>
                  </div>
                ))}
              </div>
            </section>

        </div> 
    </div> 
  )
}
