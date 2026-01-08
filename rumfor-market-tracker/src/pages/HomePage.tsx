import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button, Badge } from '@/components/ui'
import { useAuthStore } from '@/features/auth/authStore'
import { MarketGrid } from '@/components/MarketGrid'
import { marketsApi } from '@/features/markets/marketsApi'
import { Users, Leaf, Palette, ShoppingBag, UtensilsCrossed, Gift } from 'lucide-react'

// Market categories for browsing with proper icons
const marketCategories = [
  { name: 'Farmers Markets', count: 156, type: 'farmers-market', icon: Leaf },
  { name: 'Arts & Crafts', count: 89, type: 'arts-crafts', icon: Palette },
  { name: 'Flea Markets', count: 67, type: 'flea-market', icon: ShoppingBag },
  { name: 'Food Festivals', count: 45, type: 'food-festival', icon: UtensilsCrossed },
  { name: 'Community Events', count: 134, type: 'community-event', icon: Users },
  { name: 'Seasonal Markets', count: 78, type: 'holiday-market', icon: Gift }
]

export function HomePage() {
  const { user, isAuthenticated } = useAuthStore()
  
  // Fetch featured markets for homepage
  const { data: featuredMarkets, isLoading: marketsLoading } = useQuery({
    queryKey: ['markets', 'featured'],
    queryFn: () => marketsApi.getMarkets({}, 1, 12),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Main Layout - Reddit/Yelp Style */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 py-6">
          
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 space-y-6 lg:sticky lg:top-6 lg:h-fit">
            
            {/* Compact User Dashboard */}
            {isAuthenticated && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Quick Actions</h3>
                <div className="space-y-1">
                  {user?.role === 'vendor' && (
                    <>
                      <Link to="/vendor/applications" className="block p-2 hover:bg-surface-2 transition-colors">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground">Applications</span>
                          <Badge className="bg-accent/20 text-accent text-xs">3</Badge>
                        </div>
                      </Link>
                      <Link to="/vendor/tracked-markets" className="block p-2 hover:bg-surface-2 transition-colors">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground">Tracked Markets</span>
                          <Badge className="bg-green-500/20 text-green-400 text-xs">7</Badge>
                        </div>
                      </Link>
                    </>
                  )}
                  {user?.role === 'promoter' && (
                    <>
                      <Link to="/promoter/markets" className="block p-2 hover:bg-surface-2 transition-colors">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground">My Markets</span>
                          <Badge className="bg-green-500/20 text-green-400 text-xs">4</Badge>
                        </div>
                      </Link>
                      <Link to="/promoter/applications" className="block p-2 hover:bg-surface-2 transition-colors">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground">Applications</span>
                          <Badge className="bg-orange-500/20 text-orange-400 text-xs">12</Badge>
                        </div>
                      </Link>
                    </>
                  )}
                  <Link to={`/${user?.role}/dashboard`} className="block p-2 hover:bg-surface-2 transition-colors">
                    <div className="text-sm text-accent">Dashboard →</div>
                  </Link>
                </div>
              </div>
            )}
            
            {/* Trending Vendors - Content-Focused Design */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-4">Trending Vendors</h3>
              <div className="space-y-2">
                <div className="group cursor-pointer hover:bg-surface/50 rounded-lg p-4 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-surface-2 flex items-center justify-center">
                      <span className="font-bold text-lg">BH</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground group-hover:text-accent transition-colors">Blue Hills Bakery</div>
                      <div className="text-sm text-muted-foreground">+23 this week</div>
                    </div>
                  </div>
                </div>
                <div className="group cursor-pointer hover:bg-surface/50 rounded-lg p-4 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-surface-2 flex items-center justify-center">
                      <span className="font-bold text-lg">HC</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground group-hover:text-accent-secondary transition-colors">Handcrafted Candles</div>
                      <div className="text-sm text-muted-foreground">+18 this week</div>
                    </div>
                  </div>
                </div>
                <div className="group cursor-pointer hover:bg-surface/50 rounded-lg p-4 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-surface-2 flex items-center justify-center">
                      <span className="font-bold text-lg">GF</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground group-hover:text-accent-tertiary transition-colors">Garden Fresh</div>
                      <div className="text-sm text-muted-foreground">+31 this week</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Market Activity */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Market Activity</h3>
              <div className="space-y-3">
                <div className="text-sm p-2 hover:bg-surface-2 transition-colors">
                  <div className="text-foreground mb-1">Downtown Farmers Market</div>
                  <div className="text-xs text-muted-foreground">Sarah M. commented • 2h ago</div>
                </div>
                <div className="text-sm p-2 hover:bg-surface-2 transition-colors">
                  <div className="text-foreground mb-1">Artisan Craft Fair</div>
                  <div className="text-xs text-muted-foreground">Mike R. started following • 4h ago</div>
                </div>
                <div className="text-sm p-2 hover:bg-surface-2 transition-colors">
                  <div className="text-foreground mb-1">Community Food Festival</div>
                  <div className="text-xs text-muted-foreground">Lisa J. left review • 6h ago</div>
                </div>
              </div>
            </div>
            
            {/* Hero CTAs for non-authenticated users */}
            {!isAuthenticated && (
              <div className="space-y-3">
                <Link to="/auth/register" className="block group">
                  <div className="bg-gradient-to-r from-accent to-accent-light rounded-xl p-4 transition-all duration-300 group-hover:scale-105">
                    <div className="text-white font-medium text-center">I'm a Vendor</div>
                  </div>
                </Link>
                <Link to="/auth/register" className="block group">
                  <div className="bg-surface-2/50 rounded-xl p-4 transition-all duration-300 group-hover:scale-105">
                    <div className="text-accent font-medium text-center">I Organize Events</div>
                  </div>
                </Link>
              </div>
            )}
            
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            
            {/* Featured Markets Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Popular This Week
                </h2>
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

            {/* Recent Activity */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Recent Activity
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="group cursor-pointer bg-surface-2/30 hover:bg-surface-2/50 transition-all duration-300 p-4">
                  <div className="text-xs text-muted-foreground mb-1">2 days ago</div>
                  <div className="font-medium text-foreground group-hover:text-accent transition-colors">Farmers Market</div>
                  <div className="text-sm text-muted-foreground">Downtown</div>
                </div>
                <div className="group cursor-pointer bg-surface-2/30 hover:bg-surface-2/50 transition-all duration-300 p-4">
                  <div className="text-xs text-muted-foreground mb-1">1 week ago</div>
                  <div className="font-medium text-foreground group-hover:text-accent transition-colors">Artisan Fair</div>
                  <div className="text-sm text-muted-foreground">City Center</div>
                </div>
                <div className="group cursor-pointer bg-surface-2/30 hover:bg-surface-2/50 transition-all duration-300 p-4">
                  <div className="text-xs text-muted-foreground mb-1">3 days ago</div>
                  <div className="font-medium text-foreground group-hover:text-accent transition-colors">Food Festival</div>
                  <div className="text-sm text-muted-foreground">Riverside Park</div>
                </div>
                <div className="group cursor-pointer bg-surface-2/30 hover:bg-surface-2/50 transition-all duration-300 p-4">
                  <div className="text-xs text-muted-foreground mb-1">5 days ago</div>
                  <div className="font-medium text-foreground group-hover:text-accent transition-colors">Community Event</div>
                  <div className="text-sm text-muted-foreground">Central Square</div>
                </div>
              </div>
            </section>

            {/* Categories */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Browse by Category
              </h2>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {marketCategories.map((category, index) => {
                  const IconComponent = category.icon
                  return (
                    <Link 
                      key={category.type} 
                      to={`/markets?category=${category.type}`}
                      className="group relative"
                    >
                      {/* Organic background shape */}
                      <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                        index % 3 === 0 ? 'bg-gradient-to-br from-accent/10 to-accent/5' :
                        index % 3 === 1 ? 'bg-gradient-to-br from-accent-secondary/10 to-accent-secondary/5' :
                        'bg-gradient-to-br from-accent-tertiary/10 to-accent-tertiary/5'
                      } group-hover:scale-105`} />
                      
                      <div className="relative bg-surface-2/80 rounded-2xl p-4 hover:bg-surface-3/80 transition-all duration-300 hover:glow-accent-sm backdrop-blur-sm">
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            index % 3 === 0 ? 'bg-accent/20 group-hover:bg-accent/30' :
                            index % 3 === 1 ? 'bg-accent-secondary/20 group-hover:bg-accent-secondary/30' :
                            'bg-accent-tertiary/20 group-hover:bg-accent-tertiary/30'
                          }`}>
                            <IconComponent className={`h-5 w-5 ${
                              index % 3 === 0 ? 'text-accent' :
                              index % 3 === 1 ? 'text-accent-secondary' :
                              'text-accent-tertiary'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground mb-1 text-sm group-hover:text-accent transition-colors">{category.name}</h3>
                            <p className="text-xs text-muted-foreground">{category.count} markets</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>

            {/* Quick Stats for authenticated users */}
            {isAuthenticated && (
              <section>
                <div className="bg-surface/40 rounded-2xl p-6">
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-semibold text-foreground mb-2">
                      Welcome back, {user?.firstName}!
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Here's what's happening with your markets
                    </p>
                  </div>
                  
                  {/* Role-specific quick stats */}
                  {user?.role === 'vendor' && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground mb-1">3</div>
                        <div className="text-xs text-muted-foreground">Pending Applications</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground mb-1">7</div>
                        <div className="text-xs text-muted-foreground">Tracked Markets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground mb-1">5</div>
                        <div className="text-xs text-muted-foreground">To-Do Items</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground mb-1">$2,340</div>
                        <div className="text-xs text-muted-foreground">This Month</div>
                      </div>
                    </div>
                  )}
                  
                  {user?.role === 'promoter' && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground mb-1">4</div>
                        <div className="text-xs text-muted-foreground">Active Markets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground mb-1">12</div>
                        <div className="text-xs text-muted-foreground">New Applications</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground mb-1">89</div>
                        <div className="text-xs text-muted-foreground">Total Vendors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground mb-1">156K</div>
                        <div className="text-xs text-muted-foreground">Monthly Visitors</div>
                      </div>
                    </div>
                  )}
                  
                  {user?.role === 'admin' && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground mb-1">569</div>
                        <div className="text-xs text-muted-foreground">Total Markets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground mb-1">2,847</div>
                        <div className="text-xs text-muted-foreground">Registered Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground mb-1">8</div>
                        <div className="text-xs text-muted-foreground">Pending Moderation</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground mb-1">99.2%</div>
                        <div className="text-xs text-muted-foreground">System Uptime</div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
            
          </div>
        </div>
      </div>
    </div>
  )
}
