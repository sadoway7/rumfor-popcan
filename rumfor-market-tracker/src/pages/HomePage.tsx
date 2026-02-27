import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/features/auth/authStore';
import { useSidebarStore } from '@/features/theme/themeStore';
import { MarketGrid } from '@/components/MarketGrid';
import { MarketCard } from '@/components/MarketCard';
import { SubHeader } from '@/components/SubHeader';
import { VendorCard } from '@/components/VendorCard';
import { WebGLShader } from '@/components/WebGLShader';
import { marketsApi } from '@/features/markets/marketsApi';
import { useVendors } from '@/features/vendor/hooks/useVendors';
import { useTrackedMarkets } from '@/features/markets/hooks/useMarkets';
import type { VendorCardData } from '@/types';
import {
  Users,
  Leaf,
  Palette,
  ShoppingBag,
  UtensilsCrossed,
  Gift,
  Hammer,
  Moon,
  MapPin,
  Archive,
  Store,
  ArrowRight,
  Bookmark,
} from 'lucide-react';

// Fallback mock vendors when API returns empty
const mockVendors: VendorCardData[] = [
  {
    id: 'mock-1',
    firstName: 'Artisan',
    lastName: 'Crafts',
    businessName: 'Artisan Crafts Co.',
    tagline: 'Makes handcrafted silver necklaces, ceramic bowls, and woven baskets',
    blurb: 'Beautiful, unique pieces made with love',
    cardColor: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
    profileImage: '',
    productCategories: [],
  },
  {
    id: 'mock-2',
    firstName: 'Fresh',
    lastName: 'Harvest',
    businessName: 'Fresh Harvest',
    tagline: 'Grows and sells organic tomatoes, leafy greens, and homemade sourdough',
    blurb: 'Farm-fresh daily from local growers',
    cardColor: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
    profileImage: '',
    productCategories: [],
  },
  {
    id: 'mock-3',
    firstName: 'Bella',
    lastName: 'Baker',
    businessName: "Bella's Bakery",
    tagline: 'Bakes artisan sourdough bread, chocolate croissants, and birthday cakes',
    blurb: 'Heavenly treats baked fresh each morning',
    cardColor: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
    profileImage: '',
    productCategories: [],
  },
  {
    id: 'mock-4',
    firstName: 'Jade',
    lastName: 'Jeweler',
    businessName: 'Jewelry by Jade',
    tagline: 'Creates custom crystal earrings, amethyst pendants, and beaded bracelets',
    blurb: 'Stunning pieces that tell your story',
    cardColor: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    profileImage: '',
    productCategories: [],
  },
  {
    id: 'mock-5',
    firstName: 'Mountain',
    lastName: 'Brew',
    businessName: 'Mountain Brew Coffee',
    tagline: 'Roasts and sells Ethiopian single-origin beans and flavored cold brew',
    blurb: 'Bold, rich flavors from mountain estates',
    cardColor: 'bg-gradient-to-br from-red-500/20 to-rose-500/20',
    profileImage: '',
    productCategories: [],
  },
  {
    id: 'mock-6',
    firstName: 'Honey',
    lastName: 'Farmer',
    businessName: 'Honey Bee Farms',
    tagline: 'Produces wildflower honey, beeswax candles, and natural lip balm',
    blurb: 'Pure, natural sweetness from our hives',
    cardColor: 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20',
    profileImage: '',
    productCategories: [],
  },
];

// Market categories for browsing
const marketCategories = [
  { name: 'Farmers Markets', icon: Leaf, slug: 'farmers-market' },
  { name: 'Arts & Crafts', icon: Palette, slug: 'arts-crafts' },
  { name: 'Flea Markets', icon: ShoppingBag, slug: 'flea-market' },
  { name: 'Food Festivals', icon: UtensilsCrossed, slug: 'food-festival' },
  { name: 'Vintage & Antique', icon: Archive, slug: 'vintage-antique' },
  { name: 'Craft Shows', icon: Hammer, slug: 'craft-show' },
  { name: 'Night Markets', icon: Moon, slug: 'night-market' },
  { name: 'Street Fairs', icon: MapPin, slug: 'street-fair' },
  { name: 'Holiday Markets', icon: Gift, slug: 'holiday-market' },
  { name: 'Community Events', icon: Users, slug: 'community-event' },
];

export function HomePage() {
  const {
    isAuthenticated,
    login,
    isLoading: authLoading,
    error: authError,
  } = useAuthStore();
  const { isSidebarOpen } = useSidebarStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showLoginForm, setShowLoginForm] = useState(false);

  // Fetch new vendors for homepage
  const { vendors: apiVendors, isLoading: vendorsLoading } = useVendors({}, 1, 6);
  const displayVendors = apiVendors.length > 0 ? apiVendors : mockVendors;
  const hasRealVendors = apiVendors.length > 0;

  // Fetch tracked markets for authenticated users
  const { trackedMarketIds, trackMarket, untrackMarket, trackingData } = useTrackedMarkets();

  // Fetch recently added markets for homepage (fetch more to account for grouping)
  const { data: featuredMarkets, isLoading: marketsLoading } = useQuery({
    queryKey: ['markets', 'featured'],
    queryFn: () => marketsApi.getMarkets({}, 1, 10),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch category stats
  const { data: categoryStats } = useQuery({
    queryKey: ['markets', 'categoryStats'],
    queryFn: () => marketsApi.getCategoryStats(),
    staleTime: 5 * 60 * 1000,
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the store
    }
  };

  // Open sidebar by default on homepage only (mobile landing page)
  useEffect(() => {
    useSidebarStore.getState().setSidebarOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Full height, acts as mobile homepage */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] md:hidden bg-background overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Mobile Landing Page */}
            <div className="md:hidden relative h-full">
              {/* Mobile Header */}
              <div className="sticky top-0 z-50 bg-surface-2 border-b border-surface-3">
                <div className="flex items-center justify-between px-4 py-3">
                  {/* Logo Icon */}
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center transform -rotate-3 shadow-[4px_4px_0px_0px] shadow-gray-500/40">
                    <span className="text-accent-foreground font-bold text-xl">
                      R
                    </span>
                  </div>

                  {/* Sign In Button */}
                  {!isAuthenticated && (
                    <Link to="/auth/login">
                      <Button
                        size="sm"
                        className="bg-white hover:bg-surface-2 font-bold text-base text-amber-600 px-6 shadow-sm"
                      >
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Mobile Hero */}
              <div className="relative bg-gradient-to-br from-surface-2 to-surface px-5 py-10 border-b border-surface-3">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-20 h-20 bg-accent rounded-[18px] flex items-center justify-center transform -rotate-3 shadow-[4px_4px_0px_0px] shadow-gray-500/40">
                    <span className="text-accent-foreground font-bold text-5xl">
                      R
                    </span>
                  </div>
                  <h1 className="font-bold text-4xl text-foreground uppercase tracking-tighter leading-none">
                    RUMFOR
                  </h1>
                </div>

                {/* Message */}
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-black text-foreground mb-2 uppercase tracking-wide italic -rotate-1">
                    Your Market
                    <br />
                    <span className="text-amber-600 not-italic rotate-1 inline-block">
                      Organizer
                    </span>
                  </h2>
                </div>

                {/* Primary Action */}
                <div className="max-w-xs mx-auto">
                  {!isAuthenticated && (
                    <Link to="/auth/register" className="block">
                      <Button
                        size="lg"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xl font-extrabold uppercase tracking-wider -rotate-1 shadow-lg"
                      >
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Browse by Category */}
              <div className="px-4 py-4">
                <Link to="/markets" className="block mb-3">
                  <div className="flex items-center justify-between gap-1 p-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 hover:-translate-y-0.5 hover:shadow-md transition-all border border-amber-600">
                    <div className="flex items-center gap-1.5">
                      <Store
                        className="h-4 w-4 text-white shrink-0"
                        strokeWidth={2}
                      />
                      <span className="font-semibold text-white text-sm">
                        Browse All
                      </span>
                    </div>
                    <ArrowRight
                      className="h-3 w-3 text-white flex-shrink-0"
                      strokeWidth={2}
                    />
                  </div>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  {marketCategories.map(cat => {
                    const Icon = cat.icon;
                    const count = categoryStats?.[cat.slug] || 0;
                    return (
                      <Link
                        key={cat.name}
                        to={`/markets?category=${cat.slug}`}
                      >
                        <div className={`flex items-center justify-between gap-2 p-3 rounded-lg bg-surface hover:-translate-y-0.5 hover:shadow-md transition-all border border-surface-3 ${count === 0 ? 'opacity-50' : ''}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon
                              className="h-5 w-5 text-amber-500 flex-shrink-0"
                              strokeWidth={2}
                            />
                            <span className="font-medium text-foreground text-sm truncate">
                              {cat.name}
                            </span>
                          </div>
                          {count > 0 && (
                            <span className="text-xs text-muted-foreground font-medium flex-shrink-0">
                              {count}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 py-1 space-y-1 ${isSidebarOpen ? 'hidden md:block' : 'block'}`}
      >
        {isAuthenticated && <SubHeader />}

        {/* Hero Banner - Full Width Background */}
        <div className="w-full relative overflow-hidden bg-gradient-to-br from-surface-2 via-surface to-surface-3">
          {/* WebGL Shader Background - Full Width */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <WebGLShader />
          </div>

          {/* Hero Content - Constrained Width */}
          <div className="w-full max-w-[1600px] mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-8 pb-14 px-6 md:px-12">
              {/* First Column - YOUR MARKET ORGANIZER */}
              <div className="flex flex-col items-center md:items-start animate-[fadeIn_0.4s_ease-out_both] md:col-span-1" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center md:text-left">
                  Your Market
                  <br />
                  <span className="text-amber-600">Organizer</span>
                </h2>

                <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start text-base animate-[fadeIn_0.3s_ease-out_both]" style={{ animationDelay: '0.4s' }}>
                  <span className="text-foreground/70">
                    Save Markets
                  </span>
                  <span className="text-surface-3">•</span>
                  <span className="text-foreground/70">Track Apps</span>
                  <span className="text-surface-3">•</span>
                  <span className="text-foreground/70">To-Dos</span>
                  <span className="text-surface-3">•</span>
                  <span className="text-foreground/70">Expenses</span>
                </div>
              </div>

              {/* Second Column - Market Categories */}
              <div className="flex flex-col items-end md:col-span-2">
                <div className="grid grid-cols-4 gap-2 w-full animate-[fadeIn_0.4s_ease-out_both]" style={{ animationDelay: '0.1s' }}>
                  {marketCategories.map((cat, index) => {
                    const Icon = cat.icon;
                    const count = categoryStats?.[cat.slug] || 0;
                    return (
                      <Link
                        key={cat.name}
                        to={`/markets?category=${cat.slug}`}
                        className="animate-[fadeIn_0.3s_ease-out_both]"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <div className={`flex items-center justify-between gap-1 p-2.5 rounded-lg bg-surface hover:-translate-y-0.5 hover:shadow-md transition-all border border-surface-3 h-full ${count === 0 ? 'opacity-50' : ''}`}>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Icon
                              className="h-4 w-4 text-amber-500 shrink-0"
                              strokeWidth={2}
                            />
                            <span className="font-semibold text-foreground text-sm truncate">
                              {cat.name}
                            </span>
                          </div>
                          {count > 0 && (
                            <span className="text-xs text-muted-foreground font-semibold flex-shrink-0 pr-1">
                              {count}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                  <Link
                    to="/markets"
                    className="animate-[fadeIn_0.3s_ease-out_both]"
                    style={{ animationDelay: '0.3s' }}
                  >
                    <div className="flex items-center justify-between gap-1 p-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 hover:-translate-y-0.5 hover:shadow-md transition-all border border-amber-600 h-full">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Store
                          className="h-4 w-4 text-white shrink-0"
                          strokeWidth={2}
                        />
                        <span className="font-semibold text-white text-sm truncate">
                          Browse All
                        </span>
                      </div>
                      <ArrowRight
                        className="h-3 w-3 text-white flex-shrink-0"
                        strokeWidth={2}
                      />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Added */}
        <section className="pt-2 pb-12 px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {marketsLoading ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} variant="market" />
                ))}
              </>
            ) : (
              <>
                {featuredMarkets?.data?.slice(0, 6).map((market: any, index: number) => (
                  <div key={market.id} className="animate-[fadeIn_0.5s_ease-out_both]" style={{ animationDelay: `${index * 0.1}s` }}>
                    <MarketCard
                      market={market}
                      variant="minimal"
                      onTrack={trackMarket}
                      onUntrack={untrackMarket}
                      onStatusChange={trackMarket}
                      isTracked={trackedMarketIds?.includes(market.id)}
                      trackingStatus={trackingData?.find(t => t.marketId === market.id)?.status}
                      isLoading={marketsLoading}
                      className="h-full"
                    />
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="relative flex justify-center mt-4 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 group-hover:bg-amber-600 transition-colors"></div>
            <Link to="/markets">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg px-8 py-3 shadow-lg rounded-tl-none rounded-tr-none rounded-bl-[2rem] rounded-br-[2rem]">
                See More
              </Button>
            </Link>
           </div>
        </section>

        {/* New Vendors */}
        <section className="mt-16 mb-10 px-6">
          <div className="flex items-center justify-between mb-6 pt-6 animate-[fadeIn_0.3s_ease-out_both]" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold text-foreground">
              New Vendors
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6 p-1">
            {vendorsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} variant="vendor" />
              ))
            ) : (
              displayVendors.map((vendor, index) => (
                <div key={vendor.id} className="animate-[fadeIn_0.4s_ease-out_both]" style={{ animationDelay: `${index * 0.08}s` }}>
                  <VendorCard
                    vendor={vendor}
                    showLink={hasRealVendors}
                  />
                </div>
              ))
            )}
          </div>
          <div className="relative flex justify-center mt-4 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 group-hover:bg-amber-600 transition-colors"></div>
            <Link to="/vendors">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg px-8 py-3 shadow-lg rounded-tl-none rounded-tr-none rounded-bl-[2rem] rounded-br-[2rem]">
                See More
              </Button>
            </Link>
          </div>
        </section>

        <div className="h-32 md:h-10"></div>
      </div>
    </div>
  );
}
