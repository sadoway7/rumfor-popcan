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
            {/* Mobile Landing Page - Clean & Representative */}
            <div className="md:hidden relative h-full">
              {/* Punk Rock Header Background */}
              <div className="relative bg-accent overflow-hidden">
                {/* Diagonal stripe pattern */}
                <div className="absolute inset-0 opacity-15" style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 8px,
                    hsl(var(--accent-foreground)) 8px,
                    hsl(var(--accent-foreground)) 12px
                  )`
                }}></div>
                {/* Dots pattern */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: `radial-gradient(hsl(var(--accent-foreground)) 1px, transparent 1px)`,
                  backgroundSize: '16px 16px'
                }}></div>
                {/* Angled corners */}
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent-foreground/10 transform rotate-45"></div>
                <div className="absolute -top-8 -left-8 w-20 h-20 bg-amber-400/20 transform -rotate-12"></div>
                
                {/* Header content */}
                <div className="relative px-5 py-8">
                  {/* Logo with rotation and punk style */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-accent-foreground rounded-lg flex items-center justify-center shadow-[4px_4px_0px_0px] shadow-black/40 transform -rotate-2 animate-float">
                      <span className="text-accent font-black text-3xl">R</span>
                    </div>
                    <div className="transform rotate-1">
                      <h1 className="font-black text-4xl text-accent-foreground uppercase tracking-tighter leading-none">RUMFOR</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 flex-1 bg-amber-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tagline badge - Crooked highlighter swipe */}
                  <div className="flex justify-center">
                    <div className="bg-accent-foreground px-6 py-2 transform -rotate-1 shadow-[3px_3px_0px_0px] shadow-black/20 relative">
                      <span className="text-accent font-bold text-xs uppercase tracking-widest">Market Organizer</span>
                      <span className="text-accent ml-2 font-black text-sm">★</span>
                      {/* Rough edge effect */}
                      <div className="absolute -bottom-1 left-2 w-2 h-2 bg-accent-foreground transform rotate-45"></div>
                      <div className="absolute -top-1 right-3 w-1.5 h-1.5 bg-accent-foreground transform rotate-12"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What is Rumfor - With Bullets */}
              <div className="px-4 py-5 mb-8 bg-gradient-to-b from-accent/10 to-transparent border-b border-surface-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0 shadow-[3px_3px_0px_0px] shadow-black/20">
                    <span className="text-accent-foreground font-bold text-lg">R</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground uppercase tracking-wide mb-2">What is Rumfor?</h2>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold">•</span>
                        <span>Find & track markets you want to sell at</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold">•</span>
                        <span>Manage vendor applications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold">•</span>
                        <span>Plan your vending schedule</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Login/Register Buttons */}
              {!isAuthenticated && (
                <div className="px-4 py-4 bg-surface-2 border-b border-surface-3">
                  {!showLoginForm ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowLoginForm(true)}
                        className="flex-1 bg-accent hover:bg-accent-light rounded-lg py-2.5 px-4 transition-all shadow-[3px_3px_0px_0px] shadow-black/20"
                      >
                        <span className="text-accent-foreground font-bold text-base uppercase tracking-wide">Sign In</span>
                      </button>
                      <Link to="/auth/register" className="flex-1">
                        <button className="w-full bg-amber-400 hover:bg-amber-300 rounded-lg py-2.5 px-4 transition-all shadow-[3px_3px_0px_0px] shadow-black/20">
                          <span className="text-black font-bold text-base uppercase tracking-wide">Register</span>
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-surface rounded-xl p-4 space-y-3 shadow-[3px_3px_0px_0px] shadow-black/20">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold uppercase text-foreground">Sign In</h3>
                        <button
                          onClick={() => setShowLoginForm(false)}
                          className="text-accent font-bold hover:underline text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                      <form onSubmit={handleSignIn} className="space-y-2">
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:shadow-[2px_2px_0px_0px] focus:shadow-accent/70 border border-surface-3 text-sm"
                          required
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:shadow-[2px_2px_0px_0px] focus:shadow-accent/70 border border-surface-3 text-sm"
                          required
                        />
                        {authError && (
                          <p className="text-sm font-bold text-red-500 text-center">{authError}</p>
                        )}
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full bg-accent hover:bg-accent-light rounded-lg py-2.5 transition-all shadow-[3px_3px_0px_0px] shadow-black/20 disabled:opacity-50"
                        >
                          <span className="text-accent-foreground font-bold text-sm uppercase tracking-wide">
                            {authLoading ? 'Loading...' : 'Sign In'}
                          </span>
                        </button>
                      </form>
                      <p className="text-center text-sm text-muted-foreground">
                        No account? <Link to="/auth/register" className="text-accent font-medium hover:underline">Register</Link>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Browse Markets - Primary Action */}
              <div className="px-4 py-4 bg-surface-2 border-b border-surface-3">
                <Link to="/markets" className="block">
                  <div className="w-full bg-accent hover:bg-accent-light rounded-xl py-4 px-5 transition-all shadow-[4px_4px_0px_0px] shadow-black/20 text-center">
                    <span className="text-accent-foreground font-black text-lg uppercase tracking-wide">Browse Markets →</span>
                  </div>
                </Link>
              </div>

              {/* Quick Categories */}
              <div className="px-4 py-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3">Explore</h3>
                <div className="grid grid-cols-2 gap-2">
                  {marketCategories.slice(0, 6).map((cat) => {
                    const Icon = cat.icon
                    const categorySlug = cat.name.toLowerCase().replace(' & ', '-').replace(' ', '-')
                    return (
                      <Link key={cat.name} to={`/markets?category=${categorySlug}`}>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-surface hover:bg-surface-2 transition-all border border-surface-3">
                          <Icon className="h-5 w-5 text-accent" strokeWidth={2} />
                          <span className="font-medium text-foreground text-sm">{cat.name}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
                <Link to="/markets" className="block mt-3">
                  <button className="w-full py-2 text-sm text-accent font-medium hover:underline">
                    View All Categories →
                  </button>
                </Link>
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

            {/* Main Content Area - Desktop Sidebar */}
            <div className="hidden md:flex flex-col flex-1 pt-6 pb-6 px-6">
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
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220%200%20400%20400%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noiseFilter%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.9%22%20numOctaves=%224%22%20/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noiseFilter)%22%20/%3E%3C/svg%3E")'
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
