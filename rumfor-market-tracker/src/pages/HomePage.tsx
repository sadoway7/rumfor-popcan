import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/features/auth/authStore'
import { useSidebarStore } from '@/features/theme/themeStore'
import { MarketGrid } from '@/components/MarketGrid'
import { SubHeader } from '@/components/SubHeader'
import { marketsApi } from '@/features/markets/marketsApi'
import { Users, Leaf, Palette, ShoppingBag, UtensilsCrossed, Gift, Hammer, Moon, MapPin, Archive } from 'lucide-react'

// Market categories for browsing
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
  const { isAuthenticated, login, isLoading: authLoading, error: authError } = useAuthStore()
  const { isSidebarOpen } = useSidebarStore()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [showLoginForm, setShowLoginForm] = useState(false)

  // Fetch featured markets for homepage
  const { data: featuredMarkets, isLoading: marketsLoading } = useQuery({
    queryKey: ['markets', 'featured'],
    queryFn: () => marketsApi.getMarkets({}, 1, 12),
    staleTime: 5 * 60 * 1000,
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (error) {
      // Error is handled by the store
    }
  }

  // Open sidebar by default
  useEffect(() => {
    useSidebarStore.getState().setSidebarOpen(true)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Full height, acts as mobile homepage */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] md:inset-y-0 md:left-0 md:right-auto md:w-80 bg-background overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Mobile Hero - Redesigned Landing Page */}
            <div className="md:hidden">
              {/* Hero Header */}
              <div className="relative bg-accent py-8 px-6">
                {/* Texture patterns */}
                <div className="absolute inset-0 opacity-15" style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 16px)`
                }}></div>
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 40px)'
                }}></div>

                <div className="relative z-10">
                  {/* Logo - Centered and large */}
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-accent-foreground rounded-2xl flex items-center justify-center shadow-[6px_6px_0px_0px] shadow-black/40 transform -rotate-6">
                      <span className="text-accent font-black text-6xl">R</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center mb-6">
                    <h1 className="font-black text-5xl text-accent-foreground tracking-tighter uppercase mb-1">Rumfor</h1>
                    <p className="text-amber-300 font-black text-xl uppercase tracking-widest">Market Organizer</p>
                  </div>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <div className="bg-amber-400 text-black font-bold text-sm px-4 py-1.5 rounded-lg transform -rotate-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.25)]">Save Markets</div>
                    <div className="bg-emerald-400 text-black font-bold text-sm px-4 py-1.5 rounded-lg transform rotate-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.25)]">Track Apps</div>
                    <div className="bg-orange-400 text-black font-bold text-sm px-4 py-1.5 rounded-lg transform -rotate-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.25)]">To-Dos</div>
                    <div className="bg-pink-400 text-black font-bold text-sm px-4 py-1.5 rounded-lg transform rotate-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.25)]">Expenses</div>
                  </div>

                  {/* Tagline */}
                  <p className="text-center text-accent-foreground/80 font-medium text-sm uppercase tracking-wide">
                    Find Markets. Sell Stuff. Build Your Empire.
                  </p>
                </div>
              </div>

              {/* Login/Register Section */}
              <div className="px-6 py-5 bg-surface-2 border-b border-surface-3">
                {!isAuthenticated ? (
                  !showLoginForm ? (
                    <button
                      onClick={() => setShowLoginForm(true)}
                      className="w-full bg-accent hover:bg-accent-light rounded-xl px-6 py-4 transition-all shadow-[4px_4px_0px_0px] shadow-black/30 transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px]"
                    >
                      <span className="text-accent-foreground font-black text-lg uppercase tracking-wide">Login / Register →</span>
                    </button>
                  ) : (
                    <div className="bg-surface rounded-xl p-5 space-y-4 shadow-[6px_6px_0px_0px] shadow-black/30 transform -rotate-0.5">
                      <div className="flex justify-between items-center">
                        <h3 className="font-black text-lg uppercase text-foreground">Sign In</h3>
                        <button
                          onClick={() => setShowLoginForm(false)}
                          className="text-accent font-bold hover:underline text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                      <form onSubmit={handleSignIn} className="space-y-3">
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-lg bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:shadow-[2px_2px_0px_0px] focus:shadow-accent/70 border border-surface-3"
                          required
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-lg bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:shadow-[2px_2px_0px_0px] focus:shadow-accent/70 border border-surface-3"
                          required
                        />
                        {authError && (
                          <p className="text-sm font-bold text-red-500 text-center py-1 uppercase">{authError}</p>
                        )}
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full bg-accent hover:bg-accent-light rounded-lg px-6 py-3.5 transition-all shadow-[4px_4px_0px_0px] shadow-black/30 transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px] disabled:opacity-50"
                        >
                          <span className="text-accent-foreground font-black text-base uppercase tracking-wide">
                            {authLoading ? 'Loading...' : 'Sign In'}
                          </span>
                        </button>
                      </form>
                      <Link to="/auth/register" className="block">
                        <button className="w-full bg-amber-400 hover:bg-amber-300 rounded-lg px-6 py-3 transition-all shadow-[3px_3px_0px_0px] shadow-black/20">
                          <span className="text-foreground font-black text-base uppercase tracking-wide">Register</span>
                        </button>
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="bg-accent/10 rounded-xl p-4 text-center">
                    <p className="text-accent font-bold uppercase tracking-wide">✓ Welcome back!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Sidebar Header - Logo + Login */}
            <div className="hidden md:flex flex-col items-center pt-8 pb-4 px-6 border-b border-surface-3">
              <Link to="/" className="flex flex-col items-center space-y-2 transform hover:scale-105 transition-transform mb-4">
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px] shadow-black/40 dark:shadow-white/40 transform -rotate-3">
                  <span className="text-accent-foreground font-black text-4xl">R</span>
                </div>
                <span className="font-black text-4xl text-foreground tracking-tighter uppercase">Rumfor</span>
              </Link>
              {!isAuthenticated && (
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="w-full bg-accent hover:bg-accent-light rounded-lg px-4 py-3 transition-all shadow-[4px_4px_0px_0px] shadow-black/30 dark:shadow-white/30 transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px]"
                >
                  <span className="text-accent-foreground font-black text-base uppercase tracking-wide">Login / Register</span>
                </button>
              )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 pt-6 pb-24 md:pb-6 px-6">
              {/* Quick Actions */}
              <div className="mb-8">
                <h3 className="text-lg font-black text-foreground uppercase tracking-wide mb-4 flex items-center">
                  <span className="w-2 h-2 bg-accent mr-2 transform rotate-45"></span>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link to="/markets" className="block">
                    <div className="w-full py-4 px-5 rounded-xl bg-accent hover:bg-accent-light transition-all shadow-[4px_4px_0px_0px] shadow-black/20 text-center transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px]">
                      <span className="text-accent-foreground font-black text-base uppercase tracking-wide">Browse All Markets →</span>
                    </div>
                  </Link>
                  <Link to="/promoter/create-market" className="block">
                    <div className="w-full py-4 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 transition-all shadow-[4px_4px_0px_0px] shadow-black/20 text-center transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px]">
                      <span className="text-black font-black text-base uppercase tracking-wide">Add a Market +</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Browse by Category */}
              <div className="mb-8">
                <h3 className="text-lg font-black text-foreground uppercase tracking-wide mb-4 flex items-center">
                  <span className="w-2 h-2 bg-amber-400 mr-2 transform rotate-45"></span>
                  Explore Categories
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {marketCategories.map((cat) => {
                    const Icon = cat.icon
                    const categorySlug = cat.name.toLowerCase().replace(' & ', '-').replace(' ', '-')
                    return (
                      <Link key={cat.name} to={`/markets?category=${categorySlug}`}>
                        <div className="w-full aspect-square flex flex-col items-center justify-center p-3 rounded-xl bg-surface hover:bg-surface-2 transition-all duration-200 group shadow-[3px_3px_0px_0px] shadow-black/10 hover:shadow-[5px_5px_0px_0px] transform hover:-translate-y-1 border border-surface-3">
                          <Icon className="h-7 w-7 text-accent group-hover:scale-110 transition-transform mb-2" strokeWidth={2.5} />
                          <span className="font-bold text-foreground text-xs text-center leading-tight uppercase tracking-tight">{cat.name}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 p-6 space-y-6 ${isSidebarOpen ? 'hidden md:block md:ml-80' : 'block'}`}>
        {isAuthenticated && <SubHeader />}

        {/* Hero Banner - PUNK ANTI-DESIGN NO GRADIENTS */}
        <div className="w-full">
          <div className="relative overflow-hidden rounded-2xl bg-accent p-6 md:p-8 shadow-[8px_8px_0px_0px] shadow-black dark:shadow-white">
            {/* Layered texture backgrounds - NO gradients */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)`
            }}></div>
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")'
            }}></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-[35%_65%] gap-4 md:gap-6">
              {/* First Column - Main Message */}
              <div className="flex flex-col justify-center">
                <h1 className="text-3xl md:text-5xl font-black text-accent-foreground mb-6 uppercase tracking-tight leading-none">
                  Find Markets.<br />
                  Sell Stuff.<br />
                  <span className="text-amber-300">Build Your Empire.</span>
                </h1>
                
                <Link to="/markets">
                  <button className="bg-amber-400 hover:bg-amber-300 text-black font-black px-10 py-5 rounded-lg uppercase text-xl tracking-wide transform hover:scale-110 transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    Explore Markets →
                  </button>
                </Link>
              </div>
              
              {/* Second Column - YOUR MARKET ORGANIZER - HUGE */}
              <div className="flex flex-col justify-center">
                <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] transform -rotate-2 text-center">
                  <span className="text-accent-foreground">YOUR </span>
                  <span className="text-amber-300 text-7xl md:text-9xl">MARKET</span>
                  <span className="text-accent-foreground block">ORGANIZER</span>
                </h2>
                
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <div className="bg-amber-400 text-black font-black text-sm px-3 py-1.5 rounded transform -rotate-1 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">Save Markets</div>
                  <div className="bg-emerald-400 text-black font-black text-sm px-3 py-1.5 rounded transform rotate-1 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">Track Apps</div>
                  <div className="bg-orange-400 text-black font-black text-sm px-3 py-1.5 rounded transform -rotate-1 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">To-Dos</div>
                  <div className="bg-pink-400 text-black font-black text-sm px-3 py-1.5 rounded transform rotate-1 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">Expenses</div>
                </div>
              </div>
            </div>
          </div>
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

          <div className="grid grid-cols-2 gap-6">
            {[
              { name: "Artisan Crafts Co.", initials: "AC", description: "Makes handcrafted silver necklaces, ceramic bowls, and woven baskets", blurb: "Beautiful, unique pieces made with love", color: "from-purple-500/20 to-pink-500/20" },
              { name: "Fresh Harvest", initials: "FH", description: "Grows and sells organic tomatoes, leafy greens, and homemade sourdough", blurb: "Farm-fresh daily from local growers", color: "from-green-500/20 to-emerald-500/20" },
              { name: "Bella's Bakery", initials: "BB", description: "Bakes artisan sourdough bread, chocolate croissants, and birthday cakes", blurb: "Heavenly treats baked fresh each morning", color: "from-amber-500/20 to-orange-500/20" },
              { name: "Jewelry by Jade", initials: "JJ", description: "Creates custom crystal earrings, amethyst pendants, and beaded bracelets", blurb: "Stunning pieces that tell your story", color: "from-blue-500/20 to-cyan-500/20" },
              { name: "Mountain Brew Coffee", initials: "MB", description: "Roasts and sells Ethiopian single-origin beans and flavored cold brew", blurb: "Bold, rich flavors from mountain estates", color: "from-red-500/20 to-rose-500/20" },
              { name: "Honey Bee Farms", initials: "HF", description: "Produces wildflower honey, beeswax candles, and natural lip balm", blurb: "Pure, natural sweetness from our hives", color: "from-yellow-500/20 to-amber-500/20" }
            ].map((vendor, id) => (
              <div key={id} className="bg-surface hover:shadow-md transition-all duration-200 border border-surface-3 relative">
                <Link to="#" className="text-xs text-accent hover:text-accent-light underline absolute top-2 right-2 z-10">
                  vendor profile
                </Link>
                <div className="flex items-start">
                  <div className={`w-32 h-32 bg-gradient-to-br ${vendor.color} flex items-center justify-center text-4xl font-black text-accent-foreground border-2 border-accent/30 shadow-sm flex-shrink-0`}>
                    {vendor.initials}
                  </div>
                  <div className="flex-1 min-w-0 pl-4 py-4 pr-4">
                    <h3 className="font-bold text-foreground text-lg mb-2 truncate" title={vendor.name}>{vendor.name}</h3>
                    <p className="text-sm text-accent font-medium mb-1 line-clamp-2" title={vendor.description}>{vendor.description}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2" title={vendor.blurb}>{vendor.blurb}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
