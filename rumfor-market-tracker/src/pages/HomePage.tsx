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
            {/* Mobile Hero - PUNK ANTI-DESIGN NO GRADIENTS - Mobile Only */}
            <div className="md:hidden pb-4">
              <div className="relative overflow-hidden bg-accent py-6">
                  {/* Layered texture backgrounds - NO gradients */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)`
                  }}></div>

                  <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")'
                  }}></div>

                  <div className="relative z-10">
                    {/* RUMFOR HERO - 2 Column Layout */}
                    <div className="grid grid-cols-[40%_60%] gap-3">
                      {/* Left Column: EVEN BIGGER RUMFOR LOGO */}
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px] shadow-black/40 dark:shadow-white/40 transform -rotate-3">
                          <span className="text-accent-foreground font-black text-5xl">R</span>
                        </div>
                        <span className="font-black text-4xl text-white tracking-tighter uppercase">Rumfor</span>
                      </div>

                      {/* Right Column: Branding & Features */}
                      <div className="flex flex-col justify-center space-y-2 items-center text-center">
                        {/* YOUR MARKET ORGANIZER */}
                        <div className="space-y-1">
                          <div className="space-y-0.5">
                            <span className="font-black text-2xl uppercase tracking-tight transform rotate-1 block"><span className="text-accent-foreground">YOUR </span><span className="text-amber-400">MARKET</span></span>
                            <span className="text-accent-foreground font-black text-xl uppercase tracking-tight transform -rotate-1 block">ORGANIZER</span>
                          </div>
                        </div>

                        {/* Feature Badges */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-amber-400 text-black font-bold text-sm px-3 py-0.5 rounded transform -rotate-1 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] text-center">Save Markets</div>
                          <div className="bg-emerald-400 text-black font-bold text-sm px-3 py-0.5 rounded transform rotate-1 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] text-center">Track Apps</div>
                          <div className="bg-orange-400 text-black font-bold text-sm px-3 py-0.5 rounded transform -rotate-1 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] text-center">To-Dos</div>
                          <div className="bg-pink-400 text-black font-bold text-sm px-3 py-0.5 rounded transform rotate-1 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] text-center">Expenses</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            <div className="flex-1 pt-4 pb-20 md:pb-6 px-12">
              {/* Rumfor Logo - PUNK - Hidden on mobile since logo is in hero */}
              <div className="hidden md:flex items-center justify-center mb-8">
                <Link to="/" className="flex flex-col items-center space-y-2 transform hover:scale-105 transition-transform">
                  <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px] shadow-black/40 dark:shadow-white/40 transform -rotate-3">
                    <span className="text-accent-foreground font-black text-4xl">R</span>
                  </div>
                  <span className="font-black text-4xl text-foreground tracking-tighter uppercase">Rumfor</span>
                </Link>
              </div>

              {/* Sign In Form - Collapsible - PUNK ANTI-DESIGN */}
              {!isAuthenticated && (
                !showLoginForm ? (
                  <div className="mb-8 -mt-4">
                    <button
                      onClick={() => setShowLoginForm(true)}
                      className="w-full bg-accent hover:bg-accent-light rounded-lg px-4 py-3 md:py-2.5 transition-all shadow-[4px_4px_0px_0px] shadow-black/30 dark:shadow-white/30 transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px]"
                    >
                      <span className="text-accent-foreground font-black text-base md:text-sm uppercase tracking-wide">Login / Register</span>
                    </button>
                  </div>
                ) : (
                  <div className="mb-8 -mt-4 bg-surface rounded-xl p-4 space-y-3 shadow-[6px_8px_0px_0px] shadow-black/30 dark:shadow-white/30 transform -rotate-0.5 z-20 relative">
                    <div className="text-center mb-2">
                      <button
                        onClick={() => setShowLoginForm(false)}
                        className="text-accent font-bold hover:underline text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                    <form onSubmit={handleSignIn} className="space-y-2.5">
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 md:py-2.5 rounded-lg bg-surface-2 text-foreground placeholder:text-foreground/60 focus:outline-none focus:shadow-[2px_2px_0px_0px] focus:shadow-accent/70 border border-surface-3"
                        required
                      />

                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 md:py-2.5 rounded-lg bg-surface-2 text-foreground placeholder:text-foreground/60 focus:outline-none focus:shadow-[2px_2px_0px_0px] focus:shadow-accent/70 border border-surface-3"
                        required
                      />

                      {authError && (
                        <p className="text-sm font-bold text-red-500 text-center py-1 uppercase">{authError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full bg-accent hover:bg-accent-light rounded-lg px-4 py-3 md:py-2.5 transition-all shadow-[4px_4px_0px_0px] shadow-black/30 dark:shadow-white/30 transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px] disabled:opacity-50"
                      >
                        <span className="text-accent-foreground font-black text-base md:text-sm uppercase tracking-wide">
                          {authLoading ? 'Loading...' : 'Sign In'}
                        </span>
                      </button>
                    </form>

                    <Link to="/auth/register" className="block">
                      <button className="w-full bg-amber-400 rounded-lg px-4 py-2 transition-all hover:bg-amber-300 shadow-[2px_2px_0px_0px] shadow-black/20 dark:shadow-white/20">
                        <span className="text-foreground font-bold text-sm uppercase tracking-wide">Register</span>
                      </button>
                    </Link>
                  </div>
                )
              )}

              {/* Browse by Category - PUNK */}
              <div className="mb-8">
                <div className="h-8"></div>
                <h3 className="text-xl font-black text-foreground uppercase tracking-wide mb-4 mt-2 transform -rotate-1 text-center">
                  Explore Categories
                </h3>

                <div className="px-2 mb-6">
                  <Link to="/markets" className="block max-w-xs mx-auto">
                    <div className="w-full py-4 px-4 md:py-3 rounded-xl bg-accent hover:bg-accent-light transition-all shadow-[4px_4px_0px_0px] shadow-black/20 dark:shadow-white/20 text-center transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px]">
                      <div className="text-accent-foreground font-black text-base md:text-sm uppercase tracking-wide">Advanced Search →</div>
                    </div>
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {marketCategories.map((cat) => {
                    const Icon = cat.icon
                    const categorySlug = cat.name.toLowerCase().replace(' & ', '-').replace(' ', '-')
                    return (
                      <Link key={cat.name} to={`/markets?category=${categorySlug}`}>
                        <button
                          className="w-full aspect-square flex flex-col items-center justify-center p-2.5 rounded-xl bg-surface hover:bg-surface-2 transition-all duration-200 group shadow-[2px_2px_0px_0px] shadow-black/10 dark:shadow-white/10 hover:shadow-[4px_4px_0px_0px] transform hover:-translate-y-1 border border-surface-3"
                        >
                          <Icon className="md:h-6 md:w-6 h-8 w-8 text-accent group-hover:scale-110 transition-transform mb-1.5" strokeWidth={2.5} />
                          <div className="font-bold text-foreground text-xs text-center leading-tight uppercase tracking-tight">{cat.name}</div>
                        </button>
                      </Link>
                    )
                  })}
                </div>

                <div className="mt-16 px-2 space-y-4">
                  <Link to="/promoter/create-market" className="block max-w-xs mx-auto">
                    <div className="w-full py-4 px-4 md:py-3 rounded-xl bg-amber-400 hover:bg-amber-300 transition-all shadow-[4px_4px_0px_0px] shadow-black/20 dark:shadow-white/20 text-center transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px]">
                      <div className="text-black font-black text-base md:text-sm uppercase tracking-wide">Add a Market +</div>
                    </div>
                  </Link>


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